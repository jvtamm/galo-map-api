// import { FixtureDTO } from '@modules/matches/mappers/fixture-map';
import Result from '@core/result';
import { FixtureScraper } from '@modules/matches/adapters/fixture-scraper';
import { IFixtureService } from '@modules/matches/usecases/fixtures';
import { UseCase } from '@core/usecase';

import { ScrapeFixtureDetailsErrors } from './errors';
import { ScrapeFixtureDetailsDTO } from './dto';

export type ScrapeFixtureDetailsResponse = Result<boolean>;

export class ScrapeFixtureDetails implements UseCase<ScrapeFixtureDetailsDTO, ScrapeFixtureDetailsResponse> {
    constructor(
        private _fixtureScraper: FixtureScraper,
        private _fixtureService: IFixtureService,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: ScrapeFixtureDetailsDTO): Promise<Result<boolean>> {
        const { id } = request;

        if (!id) return Result.fail(ScrapeFixtureDetailsErrors.MandatoryId);

        try {
            const details = await this._fixtureScraper.getFixtureDetails(id);
            if (details.success) {
                console.log(details.value);
                // const detailsResult = await this._fixtureService.addDetails(details.value);
                // if (detailsResult.success) return Result.ok(true);
                return Result.ok(false);
            }

            return Result.ok(false);
        } catch (error) {
            console.log(error);
            return Result.fail(ScrapeFixtureDetailsErrors.UnexpectedError);
        }
    }
}

export * from './dto';
export * from './errors';
