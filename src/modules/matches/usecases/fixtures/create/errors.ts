export enum CreateFixtureErrors {
    AlreadyExists = 'Match with data supplied already exists',
    LeagueMandatory = 'Parameter league is mandatory. League must have name and season',
    RoundMandatory = 'Parameter round is mandatory.',
    MatchDateMandatory = 'Parameter matchDate is mandatory.',
    ReferencesMandatory = 'Parameter externalReferences is mandatory.',
    GroundMandatory = 'Parameter ground is mandatory.',
    ProviderNotSupported = 'None of the external providers supplied are supported.',
    HomeTeamNotFound = 'Home team with references supplied was not found.', // Deprecate when team is created when it doesn't exist
    AwayTeamNotFound = 'Away team with references supplied was not found.', // Deprecate when team is created when it doesn't exist
    StadiumNotFound = 'Stadium with name/nickname supplied was not found.',
    TournamentNotFound = 'Tournament with year and name supplied was not found.',
}
