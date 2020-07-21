export enum CreateStadiumErrors {
    AlreadyExists = 'A stadium with the supplied name already exists',
    CountryNotSupported = 'Country of the coordinates specified is not supported',
    CoordinatesNotfound = 'Coordinates provided are not valid',
    ScrapingFailed = 'Could not find enough stadium info.',
    NameMandatory = 'Name parameter is mandatory',
    UnexpectedError = 'An unexpected error has occurred',
}
