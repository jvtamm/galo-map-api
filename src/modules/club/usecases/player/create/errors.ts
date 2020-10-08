export enum CreatePlayerErrors {
    CountryNotFound = 'Country supplied not found',
    ReferenceAlreadyExists = 'Player with reference supplied already exists.',
    ProviderNotSupported = 'None of the external providers supplied are supported.'
}

export default CreatePlayerErrors;
