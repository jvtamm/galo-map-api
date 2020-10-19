import { Job } from 'agenda';

import TYPES from '@config/ioc/types';
import container from '@infra/ioc';
import { IFixtureService } from '@modules/matches/usecases/fixtures';
import { JobScheduler } from '@infra/contracts';

export interface MatchDetailScraperData {
    id: string | number;
}

// export const MatchDetailScraper = async (job: Job, scheduler: JobScheduler) => {
export const MatchDetailScraper = async (job: Job, scheduler: JobScheduler) => {
    const fixtureService: IFixtureService = container.get(TYPES.FixtureService);

    console.log('Scraping jobs...');
    console.log(job.attrs.data);

    const { id } = job.attrs.data;
    const scrapingResult = await fixtureService.scrapeFixtureDetails({ id });

    if (scrapingResult.error || !scrapingResult.value) {
        console.log('Should reschedule scraping an hour later...');
        const schedulingDate = new Date();
        schedulingDate.setHours(schedulingDate.getHours() + 1);

        scheduler.scheduleJob<MatchDetailScraperData>({
            name: 'match-detail-scraper',
            schedule: {
                interval: schedulingDate,
                action: 'schedule',
                data: {
                    id,
                },
            },
        });
    }
};
