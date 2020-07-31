import Result from '@core/result';

import { FixtureDTO, FixtureMap } from '@modules/matches/mappers/fixture-map';
import { UseCase } from '@core/usecase';
import { FixtureRepo } from '@modules/matches/repos/fixture-repo';
import { GetFixtureByIdDTO } from './dto';
import { GetFixtureByIdErrors } from './errors';

export type GetFixtureByIdResponse = Result<FixtureDTO>;

export class GetFixtureById implements UseCase<GetFixtureByIdDTO, GetFixtureByIdResponse> {
    constructor(
        private _fixtureRepo: FixtureRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: GetFixtureByIdDTO): Promise<GetFixtureByIdResponse> {
        const { id } = request;

        if (!id) return Result.fail(GetFixtureByIdErrors.MandatoryId);

        try {
            const maybeFixture = await this._fixtureRepo.getById(id);
            if (maybeFixture.isNone()) return Result.fail(GetFixtureByIdErrors.NotFound);

            const fixture = FixtureMap.toDTO(maybeFixture.join());
            return Result.ok(fixture);
        } catch (error) {
            console.log(error);
            return Result.fail(GetFixtureByIdErrors.UnexpectedError);
        }
    }
}

export * from './dto';
export * from './errors';
