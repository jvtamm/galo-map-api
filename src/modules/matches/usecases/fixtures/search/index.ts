import Result from '@core/result';
import { UseCase } from '@core/usecase';
import { FixtureRepo } from '@modules/matches/repos/fixture-repo';
import { FixtureMap } from '@modules/matches/mappers/fixture-map';

import { SearchFixturesResponseDTO, SearchFixturesDTO } from './dto';
import { SearchFixturesErrors } from './errors';

export type SearchFixturesRespose = Result<SearchFixturesResponseDTO>;

export class SearchFixtures implements UseCase<SearchFixturesDTO, SearchFixturesRespose> {
    constructor(
        private _fixtureRepo: FixtureRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: SearchFixturesDTO): Promise<SearchFixturesRespose> {
        const { year } = request;

        if (!year) return Result.fail(SearchFixturesErrors.FiltersNotProvided);

        try {
            const fixtures = await this._fixtureRepo.search({ year });
            return Result.ok<SearchFixturesResponseDTO>({
                year,
                fixtures: fixtures.map(FixtureMap.toDTO),
            });
        } catch (e) {
            console.log(e.toString());
            return Result.fail(SearchFixturesErrors.UnexpectedError);
        }
    }
}

export * from './dto';
export * from './errors';
