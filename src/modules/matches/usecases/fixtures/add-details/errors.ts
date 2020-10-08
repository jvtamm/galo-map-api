export enum AddFixtureDetailsErrors {
    FixtureDetailsAlreadyExists = 'Fixture details with the reference supplied already exists.',
    FixtureNotFound = 'No fixture with reference supplied was found.',
    // HomeTeamNotFound = 'No homeTeam with reference supplied was found',
    // AwayTeamNotFound = 'No awayTeam with reference supplied was found',
    InvalidTeams = 'The teams supplied are not valid.',
    InvalidHomePlayers = 'Parameter homeTeam mus have at least lineup players',
    InvalidAwayPlayers = 'Parameter awayTeam mus have at least lineup players',
    FixtureMandatory = 'Parameter fixture is mandatory.',
    HomeScoreMandatory = 'Parameter home is mandatory.',
    AwayScoreMandatory = 'Parameter away is mandatory.',
    UnexpectedError = 'An unexpected error has occurred.'
}
