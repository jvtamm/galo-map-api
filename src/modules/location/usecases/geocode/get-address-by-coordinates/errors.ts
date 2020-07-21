export enum GetAddressByCoordinatesErrors {
    LatitudeMandatory = 'Latitude parameter is mandatory',
    LongitudeMandatory = 'Longitude parameter is mandatory',
    AddressNotFound = 'No address was found with latitude and longitude provided',
    CountryNotSupported = 'Requested address is in a non supported country',
    UnexpectedError = 'An unexpected error has occurred'
}

export default GetAddressByCoordinatesErrors;
