import { ObjectId } from 'mongodb';

import CountryMap, { CountryDTO } from '@modules/location/mapper/country-map';
import { Address, Coordinates } from '@modules/location/domain/address';
import { StaticMapper } from '@infra/contracts/mapper';

interface Point {
    type: string;
    coordinates: Array<number>
}

export interface AddressEmbedded {
    street?: string;
    number?: string;
    neighborhood?: string;
    city: string;
    state: string;
    country: ObjectId;
    zipcode?: string;
    coords: Point;
}

export interface AddressDTO {
    street?: string;
    number?: string;
    neighborhood?: string;
    city: string;
    state: string;
    // country: string;
    country: CountryDTO;
    zipcode?: string;
    coordinates: Coordinates;
    description?: string;
}

export const AddressMap: StaticMapper<Address, AddressEmbedded> = {
    toDomain: (raw: any) => ({
        street: raw.street,
        number: raw.number,
        neighborhood: raw.neighborhood,
        city: raw.city,
        state: raw.state,
        country: CountryMap.toDomain(raw.country),
        zipcode: raw.zipcode,
        coordinates: {
            latitude: parseFloat(raw.coords.coordinates[1]),
            longitude: parseFloat(raw.coords.coordinates[0]),
        },
    }),

    toPersistance: (address: Address) => {
        const { coordinates } = address;

        const defaultObjectId = new ObjectId();
        const countryId = address.country.id.fold(defaultObjectId)((id) => new ObjectId(id as string));

        return {
            state: address.state,
            city: address.city,
            country: countryId,
            coords: {
                type: 'Point',
                coordinates: [coordinates.longitude, coordinates.latitude],
            },
            ...address.street && { street: address.street },
            ...address.number && { number: address.number },
            ...address.zipcode && { zipcode: address.zipcode },
            ...address.neighborhood && { neighborhood: address.neighborhood },
        } as AddressEmbedded;
    },

    toDTO: (address: Address) => ({
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        // country: countryId,
        country: CountryMap.toDTO(address.country),
        zipcode: address.zipcode,
        coordinates: address.coordinates,
    } as AddressDTO),
};
