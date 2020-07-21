export enum GetLeagueEditionErrors {
    MandatoryLeague = 'Parameter league is mandatory. League name must be supplied.',
    MandatorySeason = 'Parameter season is mandatory. Season year must be supplied.',
    NotFound = 'No league edition was found with name and season supplied.',
    UnexpectedError = 'An unexpected error has occurred.'
}
