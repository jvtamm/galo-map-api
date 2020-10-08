import { injectable, inject } from 'inversify';

import TYPES from '@config/ioc/types';
import { ICountryService } from '@modules/location/usecases/country';
import { PlayerRepo } from '@modules/club/repos/player-repo';

import { CreatePlayer, CreatePlayerDTO, CreatePlayerResponse } from './create';
import { GetPlayerById, GetPlayerByIdDTO, GetPlayerByIdResponse } from './get-by-id';
import { GetPlayerByReference, GetPlayerByReferenceDTO, GetPlayerByReferenceResponse } from './get-by-reference';
import { GetPlayerBulk, GetPlayerBulkDTO, GetPlayerBulkResponse } from './get-bulk';

export interface IPlayerService {
    create(request: CreatePlayerDTO): Promise<CreatePlayerResponse>;
    getBulk(request: GetPlayerBulkDTO): Promise<GetPlayerBulkResponse>;
    getById(request: GetPlayerByIdDTO): Promise<GetPlayerByIdResponse>;
    getByReference(request: GetPlayerByReferenceDTO): Promise<GetPlayerByReferenceResponse>;
}

@injectable()
export class PlayerService implements IPlayerService {
    @inject(TYPES.PlayerRepo) private _playerRepo!: PlayerRepo;

    @inject(TYPES.CountryService) private _countryService!: ICountryService;

    create(request: CreatePlayerDTO): Promise<CreatePlayerResponse> {
        const createTeam = new CreatePlayer(this._playerRepo, this, this._countryService);

        return createTeam.execute(request);
    }

    getById(request: GetPlayerByIdDTO): Promise<GetPlayerByIdResponse> {
        const getByIdUseCase = new GetPlayerById(this._playerRepo);

        return getByIdUseCase.execute(request);
    }

    getByReference(request: GetPlayerByReferenceDTO): Promise<GetPlayerByReferenceResponse> {
        const getByIdUseCase = new GetPlayerByReference(this._playerRepo);

        return getByIdUseCase.execute(request);
    }

    getBulk(request: GetPlayerBulkDTO): Promise<GetPlayerBulkResponse> {
        const getBulk = new GetPlayerBulk(this._playerRepo);

        return getBulk.execute(request);
    }
}
