import { PlayerMap, PlayerDTO } from '@modules/club/mapper/player-map';
import { Player } from '@modules/club/domain/player';
import { PlayerRepo } from '@modules/club/repos/player-repo';
import Maybe from '@core/maybe';
import {
    Either, fromTry, left, right,
} from '@core/either';
import { UseCase } from '@core/usecase';

import { GetPlayerByIdDTO } from './dto';
import { GetPlayerByIdErrors as Errors } from './errors';

export type GetPlayerByIdResponse = Either<Errors.NotFound | string, PlayerDTO>

export class GetPlayerById implements UseCase<GetPlayerByIdDTO, GetPlayerByIdResponse> {
    // eslint-disable-next-line no-empty-function
    constructor(private _playerRepo: PlayerRepo) {}

    async execute(request: GetPlayerByIdDTO): Promise<GetPlayerByIdResponse> {
        const result = await fromTry<string, Maybe<Player>>(
            async () => this._playerRepo.getPlayerById(request.id),
        );

        const notFound = left<Errors.NotFound, PlayerDTO>(Errors.NotFound);
        return result.chain<PlayerDTO>(
            (value: Maybe<Player>) => value.fold<GetPlayerByIdResponse>(notFound)(
                (player) => right<Errors.NotFound, PlayerDTO>(PlayerMap.toDTO(player as Player)),
            ),
        );
    }
}

export * from './dto';
export * from './errors';
