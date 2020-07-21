// import Identifier from '@core/identifier';
import Maybe from '@core/maybe';

import Country from '../domain/country';

export interface CountryRepo {
    getCountryByName(name: string): Promise<Maybe<Country>>;
    getCountryById (countryId: string | number): Promise<Maybe<Country>>;
    getCountryByCode(code: string): Promise<Maybe<Country>>;
    // exists (countryId: Identifier<string | number>): Promise<boolean>;
    save(post: Country): Promise<void>;
}
