export enum CreateTeamErrors {
    ReferenceAlreadyExists = 'Team with reference supplied already exists.',
    ProviderNotSupported = 'None of the external providers supplied are supported.',
    InvalidHexColor = 'Hexcolor supplied is nor valid'
}

export default CreateTeamErrors;
