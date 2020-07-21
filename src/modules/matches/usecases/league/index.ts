import { injectable, inject } from 'inversify';

import TYPES from '@config/ioc/types';
import { ISeasonService } from '@modules/matches/usecases/season';
import { LeagueEditionRepo } from '@modules/matches/repos/league-edition';
import { LeagueRepo } from '@modules/matches/repos/league-repo';

import { AddLeagueEditionDTO, AddLeagueEditionResponse, AddLeagueEdition } from './add-league-edition';
import { CreateLeagueDTO, CreateLeagueResponse, CreateLeague } from './create';
import { GetLeagueEditionDTO } from './get-league-edition/dto';
import { GetLeagueEditionResponse, GetLeagueEdition } from './get-league-edition';

export interface ILeagueService {
    addLeagueEdition(request: AddLeagueEditionDTO): Promise<AddLeagueEditionResponse>
    create(request: CreateLeagueDTO): Promise<CreateLeagueResponse>
    getLeagueEdition(request: GetLeagueEditionDTO): Promise<GetLeagueEditionResponse>
}

@injectable()
export class LeagueService implements ILeagueService {
    constructor(
        @inject(TYPES.LeagueRepo) private _leagueRepo: LeagueRepo,
        @inject(TYPES.LeagueEditionRepo) private _leagueEditionRepo: LeagueEditionRepo,
        @inject(TYPES.SeasonService) private _seasonService: ISeasonService,
    // eslint-disable-next-line no-empty-function
    ) {}

    addLeagueEdition(request: AddLeagueEditionDTO): Promise<AddLeagueEditionResponse> {
        const addLeagueEdition = new AddLeagueEdition(this._leagueEditionRepo, this._leagueRepo, this, this._seasonService);

        return addLeagueEdition.execute(request);
    }

    create(request: CreateLeagueDTO): Promise<CreateLeagueResponse> {
        const createLeague = new CreateLeague(this._leagueRepo);

        return createLeague.execute(request);
    }

    getLeagueEdition(request: GetLeagueEditionDTO): Promise<GetLeagueEditionResponse> {
        const getLeagueEdition = new GetLeagueEdition(this._leagueEditionRepo);

        return getLeagueEdition.execute(request);
    }
}
