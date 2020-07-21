import TeamMap, { TeamDTO } from '@modules/club/mapper/team-map';
import { Team } from '@modules/club/domain/team';
import { TeamRepo } from '@modules/club/repos/team-repo';
import Maybe from '@core/maybe';
import {
    Either, fromTry, left, right,
} from '@core/either';
import { UseCase } from '@core/usecase';

import { GetTeamByIdDTO } from './dto';
import { GetTeamByIdErrors as Errors } from './errors';

export type GetTeamByIdResponse = Either<Errors.NotFound | string, TeamDTO>

export class GetTeamById implements UseCase<GetTeamByIdDTO, GetTeamByIdResponse> {
    // eslint-disable-next-line no-empty-function
    constructor(private _teamRepo: TeamRepo) {}

    async execute(request: GetTeamByIdDTO): Promise<GetTeamByIdResponse> {
        const result = await fromTry<string, Maybe<Team>>(
            async () => this._teamRepo.getTeamById(request.id),
        );

        const notFound = left<Errors.NotFound, TeamDTO>(Errors.NotFound);
        return result.fold(
            // Maybe replace by unexpected error
            (value: string) => left<string, TeamDTO>(value),
            (value: Maybe<Team>) => value.fold<GetTeamByIdResponse>(notFound)(
                (team) => right<Errors.NotFound, TeamDTO>(TeamMap.toDTO(team as Team)),
            ),
        );
    }
}

export * from './dto';
export * from './errors';
