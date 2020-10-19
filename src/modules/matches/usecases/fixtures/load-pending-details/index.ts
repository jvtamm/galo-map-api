import Result from '@core/result';
// import { FixtureDTO } from '@modules/matches/mappers/fixture-map';
import { FixtureRepo } from '@modules/matches/repos/fixture-repo';
import { FixtureScraper } from '@modules/matches/adapters/fixture-scraper';
import { IFixtureService } from '@modules/matches/usecases/fixtures';
import { UseCase } from '@core/usecase';

import { LoadPendingFixtureDetailsErrors } from './errors';

export type LoadPendingFixtureDetailsResponse = Result<number>;

export class LoadPendingFixtureDetails implements UseCase<void, LoadPendingFixtureDetailsResponse> {
    constructor(
        private _fixtureRepo: FixtureRepo,
        private _fixtureService: IFixtureService,
        private _fixtureScraper: FixtureScraper,
    // eslint-disable-next-line no-empty-function
    ) {}

    // HANDLE ERROR LATER
    async execute(): Promise<Result<any>> {
        try {
            const fixtures = await this._fixtureRepo.getFixturesPendingDetails();

            let savedCount = 0;
            for (let i = 0; i < fixtures.length; i += 1) {
                const fixture = fixtures[i];
                const reference = fixture.refs.find(({ provider }) => provider === 'sofascore');

                if (reference) {
                    // // eslint-disable-next-line no-await-in-loop
                    // const details = await this._fixtureScraper.getFixtureDetails(reference.ref);
                    // if (details.success) {
                    //     // eslint-disable-next-line no-await-in-loop
                    //     const detailsResult = await this._fixtureService.addDetails(details.value);
                    //     savedCount += detailsResult.success ? 1 : 0;
                    // }

                    // eslint-disable-next-line no-await-in-loop
                    const scrappingResult = await this._fixtureService.scrapeFixtureDetails({ id: reference.ref });
                    if (scrappingResult.success) {
                        savedCount += scrappingResult.value ? 1 : 0;
                    }
                }
            }

            return Result.ok(savedCount);
        } catch (error) {
            console.log(error);
            return Result.fail(LoadPendingFixtureDetailsErrors.UnexpectedError);
        }
    }
}

export * from './errors';
