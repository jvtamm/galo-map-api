import { injectable, inject } from 'inversify';

import TYPES from '@config/ioc/types';
import { FixtureRepo } from '@modules/matches/repos/fixture-repo';
import { IPlayerService } from '@modules/club/usecases/player';
import { IStadiumService } from '@modules/location/usecases/stadium';
import { ITeamService } from '@modules/club/usecases/team';
import { LeagueService } from '@modules/matches/usecases/league';
import { FixtureDetailsRepo } from '@modules/matches/repos/fixture-details-repo';

import { CreateFixtureDTO, CreateFixtureResponse, CreateFixture } from './create';
import { SearchFixtures, SearchFixturesDTO, SearchFixturesRespose } from './search';
import { GetFixtureById, GetFixtureByIdDTO, GetFixtureByIdResponse } from './getById';
import { GetFixtureByReference, GetFixtureByReferenceDTO, GetFixtureByReferenceResponse } from './get-by-reference';
import { AddFixtureDetails, AddFixtureDetailsDTO, AddFixtureDetailsResponse } from './add-details';

export interface IFixtureService {
    addDetails(request: AddFixtureDetailsDTO): Promise<AddFixtureDetailsResponse>;
    create(request: CreateFixtureDTO): Promise<CreateFixtureResponse>;
    getById(request: GetFixtureByIdDTO): Promise<GetFixtureByIdResponse>;
    search(request: SearchFixturesDTO): Promise<SearchFixturesRespose>;
    getByReference(request: GetFixtureByReferenceDTO): Promise<GetFixtureByReferenceResponse>;
}

@injectable()
export class FixtureService implements IFixtureService {
    constructor(
        @inject(TYPES.FixtureRepo) private _fixtureRepo: FixtureRepo,
        @inject(TYPES.FixtureDetailsRepo) private _fixtureDetailsRepo: FixtureDetailsRepo,
        @inject(TYPES.LeagueService) private _leagueService: LeagueService,
        @inject(TYPES.StadiumService) private _groundServices: IStadiumService,
        @inject(TYPES.TeamService) private _teamServices: ITeamService,
        @inject(TYPES.PlayerService) private _playerServices: IPlayerService,
    // eslint-disable-next-line no-empty-function
    ) {}

    addDetails(request: AddFixtureDetailsDTO): Promise<AddFixtureDetailsResponse> {
        const addDetails = new AddFixtureDetails(
            this._fixtureRepo,
            this._fixtureDetailsRepo,
            this._playerServices,
            this._teamServices,
        );

        return addDetails.execute(request);
    }

    create(request: CreateFixtureDTO): Promise<CreateFixtureResponse> {
        const createFixture = new CreateFixture(this._fixtureRepo, this._teamServices, this._groundServices, this._leagueService);

        return createFixture.execute(request);
    }

    getById(request: GetFixtureByIdDTO): Promise<GetFixtureByIdResponse> {
        const getFixtureById = new GetFixtureById(this._fixtureRepo);

        return getFixtureById.execute(request);
    }

    getByReference(request: GetFixtureByReferenceDTO): Promise<GetFixtureByReferenceResponse> {
        const getFixtureByReference = new GetFixtureByReference(this._fixtureRepo);

        return getFixtureByReference.execute(request);
    }

    search(request: SearchFixturesDTO): Promise<SearchFixturesRespose> {
        const searchFixtures = new SearchFixtures(this._fixtureRepo);

        return searchFixtures.execute(request);
    }
}
