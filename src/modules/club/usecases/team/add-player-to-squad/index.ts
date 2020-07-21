/* eslint-disable class-methods-use-this */
import { Either, right } from '@core/either';
import { IPlayerService } from '@modules/club/usecases/player';
import { Squad, SquadPlayer } from '@modules/club/domain/squad';
import { SquadRepo } from '@modules/club/repos/squad-repo';
import { UseCase } from '@core/usecase';
import { PlayerDTO } from '@modules/club/mapper/player-map';
import { Position } from '@modules/club/domain/position';

import { AddPlayerToSquadDTO } from './dto';
import { AddPlayerToSquadErrors } from './errors';

type Errors = AddPlayerToSquadErrors.PlayerNotFound | AddPlayerToSquadErrors.TeamNotFound | string;
export type AddPlayerToSquadResponse = Either<Errors, string>

export class AddPlayerToSquad implements UseCase<AddPlayerToSquadDTO, AddPlayerToSquadResponse> {
    constructor(
        private _squadRepo: SquadRepo,
        private _playerService: IPlayerService,
        // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: AddPlayerToSquadDTO): Promise<AddPlayerToSquadResponse> {
        const maybeSquad = await this._squadRepo.getSquadByTeam(request.teamId);
        const eitherPlayer = await this._playerService.getById({ id: request.playerId });

        return maybeSquad.toEither<Errors>(AddPlayerToSquadErrors.TeamNotFound)
            .chain((squad: Squad) => this.addPlayerToSquad(eitherPlayer, squad))
            .asyncChain(async (squad: Squad) => this._squadRepo.save(squad));
    }

    addPlayerToSquad(eitherPlayer: Either<string, PlayerDTO>, squad: Squad): Either<Errors, Squad> {
        let player: PlayerDTO;
        return eitherPlayer.chain((playerInfo: PlayerDTO) => {
            player = playerInfo;
            return Position.fromCode(playerInfo.position.code);
        }).chain((position: Position) => {
            const squadPlayer: SquadPlayer = {
                id: player.id as string,
                name: player.name,
                nationality: player.nationality,
                position,
            };

            squad.addPlayer(squadPlayer);

            return right<Errors, Squad>(squad);
        });
    }
}

export * from './dto';
export * from './errors';
