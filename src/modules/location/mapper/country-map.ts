import { ObjectId } from 'mongodb';

import { Mapper } from '@infra/contracts/mapper';

import Identifier from '@core/identifier';

import Country, { CountryProps } from '../domain/country';
import { CountryCollection } from '../repos/implementations/mongo-country-repo';

export interface CountryDTO {
    id?: string,
    name: string,
    code: string
}

class CountryMap implements Mapper<Country> {
    static toDomain(raw: any): Country {
        const _id = new Identifier<string>(raw._id);
        const props = {
            name: raw.name,
            alpha2: raw.alpha2,
            alpha3: raw.alpha3,
        } as CountryProps;

        const country = Country.create(props, _id);

        return country.fold(() => null, () => country.join());
    }

    static toPersistance(country: Country): any {
        const persistance: CountryCollection = {
            name: country.getName(),
            alpha2: country.alpha2,
            alpha3: country.getCode(),
        };

        if (country.persisted()) {
            persistance._id = new ObjectId(country.getId());
        }

        return persistance;
    }

    static toDTO(country: Country): CountryDTO {
        return {
            id: country.getId(),
            name: country.getName(),
            code: country.getCode(),
        };
    }
}

export default CountryMap;
