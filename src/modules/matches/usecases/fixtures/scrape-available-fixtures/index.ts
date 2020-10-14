import Result from '@core/result';
import { UseCase } from '@core/usecase';
import { FixtureScraper } from '@modules/matches/adapters/fixture-scraper';
import { FixtureRepo } from '@modules/matches/repos/fixture-repo';
import { IFixtureService } from '..';

import { ScrapeAvailableFixturesErrors } from './errors';

export type ScrapeAvailableFixturesResponse= Result<number>;

export class ScrapeAvailableFixtures implements UseCase<void, ScrapeAvailableFixturesResponse> {
    constructor(
        private _fixtureRepo: FixtureRepo,
        private _fixtureService: IFixtureService,
        private _fixtureScraper: FixtureScraper,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(): Promise<ScrapeAvailableFixturesResponse> {
        // let savedCount = 0;
        try {
            const maybeLastFixture = await this._fixtureRepo.getLast();
            if (maybeLastFixture.isNone()) return Result.fail(ScrapeAvailableFixturesErrors.LastFixtureNotFound);

            const ATLETICO_SOFASCORE_ID = 1977;

            const lastFixture = maybeLastFixture.join();
            console.log(JSON.stringify(lastFixture));
            const reference = lastFixture.refs.find(({ provider }) => provider === 'sofascore');

            const fixturesResult = await this._fixtureScraper.getNextTeamMatches(
                ATLETICO_SOFASCORE_ID,
                { id: reference?.ref || '', date: lastFixture.matchDate },
            );
            if (fixturesResult.failure) return Result.fail(fixturesResult.error as string);

            const fixtures = fixturesResult.value;
            console.log(fixtures);

            // Create a service to optimize bulk creation and creation of finished matches
            // for (let i = 0; i < fixtures.length; i += 1) {
            //     // eslint-disable-next-line no-await-in-loop
            //     const savedFixture = await this._fixtureService.create(fixtures[i]);
            //     savedCount += savedFixture.success ? 1 : 0;
            // }

            // return Result.ok(savedCount);
            return Result.ok(0);
        } catch (error) {
            console.log(error);
            return Result.fail(ScrapeAvailableFixturesErrors.UnexpectedError);
        }
    }
}

export * from './errors';
