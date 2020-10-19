import TYPES from '@config/ioc/types';
import container from '@infra/ioc';
import { IFixtureService } from '@modules/matches/usecases/fixtures';

export const ScrapeNextFixtures = async () => {
    const fixtureService: IFixtureService = container.get(TYPES.FixtureService);

    await fixtureService.scrapeAvailableFixtures();
};
