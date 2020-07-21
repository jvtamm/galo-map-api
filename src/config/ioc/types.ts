const InfraTypes = {
    App: Symbol('App'),
    DbClient: Symbol('DbClient'),
};

const LocationTypes = {
    CountryService: Symbol('CountryService'),
    CountryRepo: Symbol('CountryRepo'),

    StadiumService: Symbol('StadiumService'),
    StadiumRepo: Symbol('StadiumRepo'),

    GeocodingAdapter: Symbol('GeocodingAdapter'),
    GeocodeService: Symbol('GeocodeService'),

    PlaceSearch: Symbol('PlaceSearch'),
};

const ClubTypes = {
    TeamService: Symbol('TeamService'),
    PlayerService: Symbol('PlayerService'),
    ContractService: Symbol('ContractService'),

    TeamRepo: Symbol('TeamRepo'),
    SquadRepo: Symbol('SquadRepo'),
    PlayerRepo: Symbol('PlayerRepo'),
    ContractRepo: Symbol('ContractRepo'),
};

const FixtureTypes = {
    FixtureService: Symbol('FixtureService'),
    LeagueService: Symbol('LeagueService'),
    SeasonService: Symbol('SeasonService'),

    FixtureRepo: Symbol('FixtureRepo'),
    LeagueRepo: Symbol('LeagueRepo'),
    LeagueEditionRepo: Symbol('LeagueEditionRepo'),
    SeasonRepo: Symbol('SeasonRepo'),
};

const ScraperTypes = {
    StadiumScraper: Symbol('StadiumScraper'),
};

export const TYPES = {
    ...InfraTypes,
    ...LocationTypes,
    ...ClubTypes,
    ...FixtureTypes,
    ...ScraperTypes,
};

export default TYPES;
