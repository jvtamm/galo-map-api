import Maybe from '@core/maybe';
import { PlayerMap, PlayerDTO } from '@modules/club/mapper/player-map';
import { Either, left, right } from '@core/either';
import { ExternalReferenceFactory, RefDTO } from '@modules/club/domain/external-references';
import { PlayerRepo } from '@modules/club/repos/player-repo';
import { UseCase } from '@core/usecase';
import { Player } from '@modules/club/domain/player';

import { GetPlayerByReferenceDTO } from './dto';
import { GetPlayerByReferenceErrors } from './errors';

type Errors = GetPlayerByReferenceErrors.NotFound |
    GetPlayerByReferenceErrors.ProviderNotSupported |
    string;

export type GetPlayerByReferenceResponse = Either<Errors, PlayerDTO>

type GetPlayerByReferenceUseCase = UseCase<GetPlayerByReferenceDTO, GetPlayerByReferenceResponse>;

export class GetPlayerByReference implements GetPlayerByReferenceUseCase {
    // eslint-disable-next-line no-empty-function
    constructor(private _playerRepo: PlayerRepo) {}

    async execute(request: GetPlayerByReferenceDTO): Promise<GetPlayerByReferenceResponse> {
        const { externalReferences: refs } = request;

        const notFound = left<Errors, PlayerDTO>(GetPlayerByReferenceErrors.NotFound);
        return Maybe.fromUndefined(refs)
            .map((value) => ExternalReferenceFactory.fromDTO(value as RefDTO))
            .chain((value) => Maybe.fromEmpty(value))
            .map((value) => value?.map((ref) => ref.serialize()) as Array<string | number>)
            .toEither<Errors>(GetPlayerByReferenceErrors.ProviderNotSupported)
            .asyncChain((references) => this._playerRepo.getPlayerByRef(references))
            .then((eitherPlayer) => eitherPlayer.fold(
                // Maybe replace by unexpected error
                (value: string) => left<string, PlayerDTO>(value),
                (value: Maybe<Player>) => value.fold<GetPlayerByReferenceResponse>(notFound)(
                    (player) => right<Errors, PlayerDTO>(PlayerMap.toDTO(player as Player)),
                ),
            ));
    }
}

export * from './dto';
export * from './errors';
