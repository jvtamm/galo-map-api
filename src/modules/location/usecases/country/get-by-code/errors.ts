export enum GetCountryByCodeErrors {
    CodeMandatory = 'Code parameter is mandatory',
    NotFound = 'No country was found with the supplied code',
    UnexpectedError = 'An unexpected error has occurred',
}

export default GetCountryByCodeErrors;
