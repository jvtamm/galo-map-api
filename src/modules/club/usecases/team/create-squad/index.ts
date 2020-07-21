/* eslint-disable class-methods-use-this */

import {
    Either, left, right, fromTry,
} from '@core/either';
import { ITeamService } from '@modules/club/usecases/team';
import { Squad, SquadProps } from '@modules/club/domain/squad';
import { SquadRepo } from '@modules/club/repos/squad-repo';
import { TeamDTO } from '@modules/club/mapper/team-map';
import { UseCase } from '@core/usecase';

import { CreateSquadDTO } from './dto';
import { CreateSquadErrors } from './errors';

type Errors = CreateSquadErrors.TeamNotFound | CreateSquadErrors.SquadAlreadyExists | string
export type CreateSquadResponse = Either<Errors, void>

export class CreateSquad implements UseCase<CreateSquadDTO, CreateSquadResponse> {
    constructor(
        private _squadRepo: SquadRepo,
        private _teamService: ITeamService,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: CreateSquadDTO): Promise<CreateSquadResponse> {
        const eitherTeam = await this._teamService.getById({ id: request.teamId });
        const eitherSquad = await this.checkSquadExistance(request.teamId);

        const eitherSquadObject = eitherTeam.fold<Either<Errors, TeamDTO>>(
            () => left<Errors, TeamDTO>(CreateSquadErrors.TeamNotFound),
            (team: TeamDTO) => right<Errors, TeamDTO>(team),
        ).chain<TeamDTO>((team: TeamDTO) => eitherSquad.fold(
            (existanceError: CreateSquadErrors.SquadAlreadyExists) => (
                left<Errors, TeamDTO>(existanceError)
            ),
            () => right<Errors, TeamDTO>(team),
        )).chain<Squad>((team: TeamDTO) => this.createEmptySquad(team));

        return eitherSquadObject.asyncChain(
            async (squad: Squad) => fromTry<string, void>(async () => this._squadRepo.save(squad)),
        ).then((eitherResult) => eitherResult.fold(
            (error: string) => left<string, void>(error),
            () => right<string, void>(undefined),
        ));
    }

    async checkSquadExistance(teamId: string): Promise<Either<Errors, boolean>> {
        const maybeSquad = await this._squadRepo.getSquadByTeam(teamId);

        const notExistSuccess = right<Errors, boolean>(true);
        return maybeSquad.fold<Either<string, boolean>>(notExistSuccess)(
            () => left<Errors, boolean>(CreateSquadErrors.SquadAlreadyExists),
        );
    }

    createEmptySquad(team: TeamDTO): Either<string, Squad> {
        const props: SquadProps = {
            teamId: team.id as string,
            teamName: team.name,
            teamCountry: team.country,
            squad: [],
        };

        return Squad.create(props);
    }
}

export * from './dto';
export * from './errors';
