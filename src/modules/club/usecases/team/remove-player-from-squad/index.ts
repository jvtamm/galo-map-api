/* eslint-disable class-methods-use-this */
import { Either, right } from '@core/either';
import { IPlayerService } from '@modules/club/usecases/player';
import { Squad } from '@modules/club/domain/squad';
import { SquadRepo } from '@modules/club/repos/squad-repo';
import { UseCase } from '@core/usecase';
import { PlayerDTO } from '@modules/club/mapper/player-map';

import { RemovePlayerFromSquadDTO } from './dto';
import { RemovePlayerFromSquadErrors } from './errors';

type Errors = RemovePlayerFromSquadErrors.PlayerNotFound | RemovePlayerFromSquadErrors.TeamNotFound | string;
export type RemovePlayerFromSquadResponse = Either<Errors, string>

export class RemovePlayerFromSquad implements UseCase<RemovePlayerFromSquadDTO, RemovePlayerFromSquadResponse> {
    constructor(
        private _squadRepo: SquadRepo,
        private _playerService: IPlayerService,
        // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: RemovePlayerFromSquadDTO): Promise<RemovePlayerFromSquadResponse> {
        const maybeSquad = await this._squadRepo.getSquadByTeam(request.teamId);
        const eitherPlayer = await this._playerService.getById({ id: request.playerId });

        return maybeSquad.toEither<Errors>(RemovePlayerFromSquadErrors.TeamNotFound)
            .chain((squad: Squad) => this.removePlayerFromSquad(eitherPlayer, squad))
            .asyncChain(async (squad: Squad) => this._squadRepo.save(squad));
    }

    removePlayerFromSquad(eitherPlayer: Either<string, PlayerDTO>, squad: Squad): Either<Errors, Squad> {
        return eitherPlayer.chain((playerInfo: PlayerDTO) => {
            squad.removePlayer(playerInfo.id as string);
            return right<Errors, Squad>(squad);
        });
    }
}

export * from './dto';
export * from './errors';
