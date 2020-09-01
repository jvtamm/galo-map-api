/**
 * Services:
 * Create team -> OK
 * Retrieve team by id -> OK
 * Retrieve team by external ref (galodigital / fotmob) -> OK
 * Create empty squad -> OK
 * Retreive current squad -> OK
 * Add player to squad
 * Add stadium to team -> Pending...
 *
 */

import { injectable, inject } from 'inversify';

import TYPES from '@config/ioc/types';
import { ICountryService } from '@modules/location/usecases/country';
import { IPlayerService } from '@modules/club/usecases/player';
import { SquadRepo } from '@modules/club/repos/squad-repo';
import { StadiumService } from '@modules/location/usecases/stadium';
import { TeamRepo } from '@modules/club/repos/team-repo';

import { AddPlayerToSquad, AddPlayerToSquadDTO, AddPlayerToSquadResponse } from './add-player-to-squad';
import { CreateTeam, CreateTeamDTO, CreateTeamResponse } from './create';
import { CreateSquad, CreateSquadDTO, CreateSquadResponse } from './create-squad';
import { GetTeamById, GetTeamByIdDTO, GetTeamByIdResponse } from './get-by-id';
import { GetTeamByReference, GetTeamByReferenceDTO, GetTeamByReferenceResponse } from './get-by-reference';
import { RemovePlayerFromSquad, RemovePlayerFromSquadDTO, RemovePlayerFromSquadResponse } from './remove-player-from-squad';
import { RetreiveSquad, RetreiveSquadDTO, RetreiveSquadResponse } from './retreive-squad';

export interface ITeamService {
    addPlayerToSquad(request: AddPlayerToSquadDTO): Promise<AddPlayerToSquadResponse>
    create(request: CreateTeamDTO): Promise<CreateTeamResponse>;
    createSquad(request: CreateSquadDTO): Promise<CreateSquadResponse>;
    getById(request: GetTeamByIdDTO): Promise<GetTeamByIdResponse>;
    getByReference(request: GetTeamByReferenceDTO): Promise<GetTeamByReferenceResponse>;
    removePlayerFromSquad(request: RemovePlayerFromSquadDTO): Promise<RemovePlayerFromSquadResponse>;
    retreiveSquad(request: RetreiveSquadDTO): Promise<RetreiveSquadResponse>;
}

@injectable()
export class TeamService implements ITeamService {
    constructor(
        @inject(TYPES.TeamRepo) private _teamRepo: TeamRepo,
        @inject(TYPES.SquadRepo) private _squadRepo: SquadRepo,
        @inject(TYPES.CountryService) private _countryService: ICountryService,
        @inject(TYPES.PlayerService) private _playerService: IPlayerService,
        @inject(TYPES.StadiumService) private _groundService: StadiumService,
    // eslint-disable-next-line no-empty-function
    ) {}

    addPlayerToSquad(request: AddPlayerToSquadDTO): Promise<AddPlayerToSquadResponse> {
        const createTeam = new AddPlayerToSquad(this._squadRepo, this._playerService);

        return createTeam.execute(request);
    }

    create(request: CreateTeamDTO): Promise<CreateTeamResponse> {
        const createTeam = new CreateTeam(this._teamRepo, this, this._countryService, this._groundService);

        return createTeam.execute(request);
    }

    createSquad(request: CreateSquadDTO): Promise<CreateSquadResponse> {
        const createSquad = new CreateSquad(this._squadRepo, this);

        return createSquad.execute(request);
    }

    getById(request: GetTeamByIdDTO): Promise<GetTeamByReferenceResponse> {
        const getByIdUseCase = new GetTeamById(this._teamRepo);

        return getByIdUseCase.execute(request);
    }

    getByReference(request: GetTeamByReferenceDTO): Promise<GetTeamByReferenceResponse> {
        const getByIdUseCase = new GetTeamByReference(this._teamRepo);

        return getByIdUseCase.execute(request);
    }

    removePlayerFromSquad(request: RemovePlayerFromSquadDTO): Promise<RemovePlayerFromSquadResponse> {
        const removePlayerFromSquad = new RemovePlayerFromSquad(this._squadRepo, this._playerService);

        return removePlayerFromSquad.execute(request);
    }

    retreiveSquad(request: RetreiveSquadDTO): Promise<RetreiveSquadResponse> {
        const retreiveSquad = new RetreiveSquad(this._squadRepo);

        return retreiveSquad.execute(request);
    }
}
