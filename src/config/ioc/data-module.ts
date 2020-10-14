import { ContainerModule, interfaces } from 'inversify';

// Repositories
import MongoContractRepo from '@modules/club/repos/implementations/mongo-contract-repo';
import MongoCountryRepo from '@modules/location/repos/implementations/mongo-country-repo';
import MongoPlayerRepo from '@modules/club/repos/implementations/mongo-player-repo';
import MongoSquadRepo from '@modules/club/repos/implementations/mongo-squad-repo';
import MongoStadiumRepo from '@modules/location/repos/implementations/mongo-stadium-repo';
import MongoTeamRepo from '@modules/club/repos/implementations/mongo-team-repo';
import { MongoFixtureDetailsRepo } from '@modules/matches/repos/implementations/mongo-fixture-details-repo';
import { MongoFixtureRepo } from '@modules/matches/repos/implementations/mongo-fixture-repo';
import { MongoLeagueEditionRepo } from '@modules/matches/repos/implementations/mongo-league-edition-repo';
import { MongoLeagueRepo } from '@modules/matches/repos/implementations/mongo-league-repo';
import { MongoSeasonRepo } from '@modules/matches/repos/implementations/mongo-season-repo';

// Interfaces
import { ContractRepo } from '@modules/club/repos/contract-repo';
import { CountryRepo } from '@modules/location/repos/country-repo';
import { FixtureDetailsRepo } from '@modules/matches/repos/fixture-details-repo';
import { FixtureRepo } from '@modules/matches/repos/fixture-repo';
import { FixtureScraper } from '@modules/matches/adapters/fixture-scraper';
import { Geocoding } from '@modules/location/adapters/geocoding';
import { LeagueEditionRepo } from '@modules/matches/repos/league-edition';
import { LeagueRepo } from '@modules/matches/repos/league-repo';
import { PlaceSearch } from '@modules/location/adapters/place-search';
import { PlayerRepo } from '@modules/club/repos/player-repo';
import { SeasonRepo } from '@modules/matches/repos/season-repo';
import { SquadRepo } from '@modules/club/repos/squad-repo';
import { StadiumRepo } from '@modules/location/repos/stadium-repo';
import { StadiumScraper } from '@modules/location/adapters/stadium-scraper';
import { TeamRepo } from '@modules/club/repos/team-repo';
import { TeamScraper } from '@modules/club/adapters/team-scraper';

// Services
import { IContractService, ContractService } from '@modules/club/usecases/contract';
import { ICountryService, CountryService } from '@modules/location/usecases/country';
import { IFixtureService, FixtureService } from '@modules/matches/usecases/fixtures';
import { IGeocodeService, GeocodeService } from '@modules/location/usecases/geocode';
import { ILeagueService, LeagueService } from '@modules/matches/usecases/league';
import { IPlayerService, PlayerService } from '@modules/club/usecases/player';
import { ISeasonService, SeasonService } from '@modules/matches/usecases/season';
import { ITeamService, TeamService } from '@modules/club/usecases/team';
import { StadiumService, IStadiumService } from '@modules/location/usecases/stadium';

// Adapters
import { Nominatim } from '@modules/location/adapters/implementations/nominatim';
import { WikipediaScraper } from '@modules/location/adapters/implementations/wikipedia-scraper';
import { SofascoreFixtureScraper } from '@modules/matches/adapters/implementations/sofascore-scraper';
import { SofascoreTeamScraper } from '@modules/club/adapters/implementations/sofascore-scraper';

// Types
import { TYPES } from './types';

const clubBind = (bind: interfaces.Bind) => {
    bind<IContractService>(TYPES.ContractService).to(ContractService).inSingletonScope();
    bind<IPlayerService>(TYPES.PlayerService).to(PlayerService).inSingletonScope();
    bind<ITeamService>(TYPES.TeamService).to(TeamService).inSingletonScope();

    bind<ContractRepo>(TYPES.ContractRepo).to(MongoContractRepo).inSingletonScope();
    bind<PlayerRepo>(TYPES.PlayerRepo).to(MongoPlayerRepo).inSingletonScope();
    bind<SquadRepo>(TYPES.SquadRepo).to(MongoSquadRepo).inSingletonScope();
    bind<TeamRepo>(TYPES.TeamRepo).to(MongoTeamRepo).inSingletonScope();

    bind<TeamScraper>(TYPES.TeamScraper).to(SofascoreTeamScraper).inSingletonScope();
};

const fixtureBind = (bind: interfaces.Bind) => {
    bind<IFixtureService>(TYPES.FixtureService).to(FixtureService).inSingletonScope();
    bind<ILeagueService>(TYPES.LeagueService).to(LeagueService).inSingletonScope();
    bind<ISeasonService>(TYPES.SeasonService).to(SeasonService).inSingletonScope();

    bind<FixtureDetailsRepo>(TYPES.FixtureDetailsRepo).to(MongoFixtureDetailsRepo).inSingletonScope();
    bind<FixtureRepo>(TYPES.FixtureRepo).to(MongoFixtureRepo).inSingletonScope();
    bind<LeagueEditionRepo>(TYPES.LeagueEditionRepo).to(MongoLeagueEditionRepo).inSingletonScope();
    bind<LeagueRepo>(TYPES.LeagueRepo).to(MongoLeagueRepo).inSingletonScope();
    bind<SeasonRepo>(TYPES.SeasonRepo).to(MongoSeasonRepo).inSingletonScope();

    bind<FixtureScraper>(TYPES.FixtureScraper).to(SofascoreFixtureScraper).inSingletonScope();
};

const locationBind = (bind: interfaces.Bind) => {
    bind<CountryRepo>(TYPES.CountryRepo).to(MongoCountryRepo).inSingletonScope();
    bind<ICountryService>(TYPES.CountryService).to(CountryService).inSingletonScope();

    bind<StadiumRepo>(TYPES.StadiumRepo).to(MongoStadiumRepo).inSingletonScope();
    bind<IStadiumService>(TYPES.StadiumService).to(StadiumService).inSingletonScope();

    bind<Geocoding>(TYPES.GeocodingAdapter).to(Nominatim).inSingletonScope();
    bind<IGeocodeService>(TYPES.GeocodeService).to(GeocodeService).inSingletonScope();

    bind<PlaceSearch>(TYPES.PlaceSearch).to(Nominatim).inSingletonScope();
};

const scraperBind = (bind: interfaces.Bind) => {
    bind<StadiumScraper>(TYPES.StadiumScraper).to(WikipediaScraper).inSingletonScope();
};

export const referenceDataIoCModule = new ContainerModule((bind) => {
    clubBind(bind);
    fixtureBind(bind);
    locationBind(bind);
    scraperBind(bind);
});

export default referenceDataIoCModule;
