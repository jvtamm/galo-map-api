import { injectable, inject } from 'inversify';

import TYPES from '@config/ioc/types';
import { FixtureRepo } from '@modules/matches/repos/fixture-repo';
import { IStadiumService } from '@modules/location/usecases/stadium';
import { ITeamService } from '@modules/club/usecases/team';

import { LeagueService } from '@modules/matches/usecases/league';
import { CreateFixtureDTO, CreateFixtureResponse, CreateFixture } from './create';

export interface IFixtureService {
    create(request: CreateFixtureDTO): Promise<CreateFixtureResponse>;
}

@injectable()
export class FixtureService implements IFixtureService {
    constructor(
        @inject(TYPES.FixtureRepo) private _fixtureRepo: FixtureRepo,
        @inject(TYPES.LeagueService) private _leagueService: LeagueService,
        @inject(TYPES.StadiumService) private _groundServices: IStadiumService,
        @inject(TYPES.TeamService) private _teamServices: ITeamService,
    // eslint-disable-next-line no-empty-function
    ) {}

    create(request: CreateFixtureDTO): Promise<CreateFixtureResponse> {
        const createFixture = new CreateFixture(this._fixtureRepo, this._teamServices, this._groundServices, this._leagueService);

        return createFixture.execute(request);
    }
}
