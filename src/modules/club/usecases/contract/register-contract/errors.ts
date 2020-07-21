export enum RegisterContractErrors {
    OpenContractExists = 'An open contract already exists for the player with the team. Please close it before opening another one.',
    PlayerNotFound = 'No player was found with the supplied playerId.',
    TeamNotFound = 'No team was found with the supplied teamId.',
    InvalidDates = 'Either startingDate or endingDate must be supplied.',
    UnexpectedError = 'An unexpected error has occurred',
}

export default RegisterContractErrors;
