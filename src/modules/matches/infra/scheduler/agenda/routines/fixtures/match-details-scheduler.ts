import { Job } from 'agenda';

import TYPES from '@config/ioc/types';
import container from '@infra/ioc';
import { IFixtureService } from '@modules/matches/usecases/fixtures';
import { JobScheduler } from '@infra/contracts';

import { MatchDetailScraperData } from './match-details-scraper';

export const MatchDetailScheduler = async (job: Job, scheduler: JobScheduler) => {
    const fixtureService: IFixtureService = container.get(TYPES.FixtureService);

    const fixtureResult = await fixtureService.getTodaysFixture();

    if (fixtureResult.success) {
        const fixture = fixtureResult.value;

        const ESTIMATED_FIXTURE_MINUTES = 150;

        // const schedulingDate = new Date();
        const schedulingDate = new Date(fixture.matchDate);
        schedulingDate.setMinutes(schedulingDate.getMinutes() + ESTIMATED_FIXTURE_MINUTES);

        console.log('Scheduling match details scrapping...');

        const sofascoreRef = fixture.externalReferences?.find((ref) => ref.provider === 'sofascore');

        if (sofascoreRef) {
            scheduler.scheduleJob<MatchDetailScraperData>({
                name: 'match-detail-scraper',
                schedule: {
                    interval: schedulingDate,
                    action: 'schedule',
                    data: {
                        id: sofascoreRef.ref,
                    },
                },
            });
        }
    }
};
