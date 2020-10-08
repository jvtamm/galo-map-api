import Result from '@core/result';
import { UseCase } from '@core/usecase';
import { ExternalReferenceFactory } from '@modules/club/domain/external-references';
import { FixtureDTO, FixtureMap } from '@modules/matches/mappers/fixture-map';
import { FixtureRepo } from '@modules/matches/repos/fixture-repo';

import { GetFixtureByReferenceDTO } from './dto';
import { GetFixtureByReferenceErrors } from './errors';

export type GetFixtureByReferenceResponse = Result<FixtureDTO>;

export class GetFixtureByReference implements UseCase<GetFixtureByReferenceDTO, GetFixtureByReferenceResponse> {
    constructor(
        private _fixtureRepo: FixtureRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: GetFixtureByReferenceDTO): Promise<GetFixtureByReferenceResponse> {
        const { externalReferences } = request;

        if (!externalReferences) {
            return Result.fail<FixtureDTO>(GetFixtureByReferenceErrors.ReferencesMandatory);
        }

        const references = ExternalReferenceFactory.fromDTO(externalReferences);

        try {
            const maybeFixture = await this._fixtureRepo.getByReference(references);
            if (maybeFixture.isNone()) return Result.fail(GetFixtureByReferenceErrors.NotFound);

            const fixture = FixtureMap.toDTO(maybeFixture.join());
            return Result.ok(fixture);
        } catch (error) {
            console.log(error);
            return Result.fail<FixtureDTO>(GetFixtureByReferenceErrors.UnexpectedError);
        }
    }
}

export * from './dto';
export * from './errors';
