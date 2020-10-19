import Result from '@core/result';
import { FixtureDTO, FixtureMap } from '@modules/matches/mappers/fixture-map';
import { FixtureRepo } from '@modules/matches/repos/fixture-repo';
import { Refs } from '@modules/club/domain/external-references';
import { UseCase } from '@core/usecase';

import { GetTodaysFixtureErrors } from './errors';

export interface Fixture extends FixtureDTO {
    externalReferences: Refs[] | null;
}

export type GetTodaysFixtureResponse = Result<Fixture>;

export class GetTodaysFixture implements UseCase<void, GetTodaysFixtureResponse> {
    constructor(
        private _fixtureRepo: FixtureRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(): Promise<GetTodaysFixtureResponse> {
        try {
            const maybeFixture = await this._fixtureRepo.getTodaysFixture();
            if (maybeFixture.isNone()) return Result.fail(GetTodaysFixtureErrors.NotFound);

            const fixture = maybeFixture.join();
            const dto = FixtureMap.toDTO(fixture);
            dto.externalReferences = fixture.refs;

            return Result.ok(dto);
        } catch (error) {
            console.log(error);
            return Result.fail(GetTodaysFixtureErrors.UnexpectedError);
        }
    }
}

export * from './errors';
