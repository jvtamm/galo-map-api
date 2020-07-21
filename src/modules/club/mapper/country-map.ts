import { ObjectId } from 'mongodb';

import { Mapper } from '@infra/contracts/mapper';
import { Country } from '@modules/club/domain/country';

export interface CountryEmbedded {
    _id: ObjectId;
    code: string;
    name: string;
}

class CountryMap implements Mapper<Country> {
    static toDomain(raw: any): Country {
        return {
            name: raw.name,
            code: raw.code,
            id: raw._id || raw.id,
        };
    }

    static toPersistance(country: Country): CountryEmbedded {
        return {
            _id: new ObjectId(country.id),
            name: country.name,
            code: country.code,
        } as CountryEmbedded;
    }
}

export default CountryMap;
