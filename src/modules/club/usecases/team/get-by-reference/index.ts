import Maybe from '@core/maybe';
import TeamMap, { TeamDTO } from '@modules/club/mapper/team-map';
import { Either, left, right } from '@core/either';
import { ExternalReferenceFactory, RefDTO } from '@modules/club/domain/external-references';
import { Team } from '@modules/club/domain/team';
import { TeamRepo } from '@modules/club/repos/team-repo';
import { UseCase } from '@core/usecase';

import { GetTeamByReferenceDTO } from './dto';
import { GetTeamByReferenceErrors as Errors } from './errors';

export type GetTeamByReferenceResponse = Either<
    Errors.NotFound |
    Errors.ProviderNotSupported |
    string,
    TeamDTO>

type GetTeamByReferenceUseCase = UseCase<GetTeamByReferenceDTO, GetTeamByReferenceResponse>;

export class GetTeamByReference implements GetTeamByReferenceUseCase {
    // eslint-disable-next-line no-empty-function
    constructor(private _teamRepo: TeamRepo) {}

    async execute(request: GetTeamByReferenceDTO): Promise<GetTeamByReferenceResponse> {
        const { externalReferences: refs } = request;

        const notFound = left<Errors.NotFound, TeamDTO>(Errors.NotFound);
        return Maybe.fromUndefined(refs)
            .map((value) => ExternalReferenceFactory.fromDTO(value as RefDTO))
            .chain((value) => Maybe.fromEmpty(value))
            .map((value) => value?.map((ref) => ref.serialize()) as Array<string | number>)
            .toEither<Errors.ProviderNotSupported>(Errors.ProviderNotSupported)
            .asyncChain((references) => this._teamRepo.getTeamByRef(references))
            .then((eitherTeam) => eitherTeam.fold(
                // Maybe replace by unexpected error
                (value: string) => left<string, TeamDTO>(value),
                (value: Maybe<Team>) => value.fold<GetTeamByReferenceResponse>(notFound)(
                    (team) => right<Errors.NotFound, TeamDTO>(TeamMap.toDTO(team as Team)),
                ),
            ));
    }
}

export * from './dto';
export * from './errors';
