import { ObjectId } from 'mongodb';

import Identifier from '@core/identifier';
import Stadium, { StadiumProps } from '@modules/location/domain/stadium';
import { Coordinates } from '@modules/location/domain/address';
import { StadiumCollection } from '@modules/location/repos/implementations/mongo-stadium-repo';
import { StaticMapper } from '@infra/contracts/mapper';

// import CountryMap from './country-map';

export interface StadiumDTO {
    id: string;
    name: string;
    coordinates: Coordinates;
    country: string;
    inauguration?: string;
    capacity?: number;
    nickname: string;
}

export const StadiumMap: StaticMapper<Stadium, StadiumCollection> = {
    toDomain: (raw: any) => {
        const { nickname, capacity } = raw;

        const _id = raw._id ? new Identifier<string>(raw._id.toString()) : undefined;
        const inauguration = raw.inauguration && new Date(raw.inauguration);

        const props: StadiumProps = {
            name: raw.name,
            // country: CountryMap.toDomain(raw.country),
            country: raw.country,
            coordinates: {
                latitude: parseFloat(raw.geometry.coordinates[1]),
                longitude: parseFloat(raw.geometry.coordinates[0]),
            },
            ...inauguration && { inauguration },
            ...capacity && { capacity },
            ...nickname && { nickname },
        };

        const stadium = Stadium.create(props, _id);

        return stadium.value;
    },

    toPersistance: (stadium: Stadium) => {
        const _id = new ObjectId();
        const maybeId = stadium.id
            .fold<ObjectId>(_id)((value) => new ObjectId(value as string));

        const maybeInauguration = stadium.inauguration
            .fold<Date | null>(null)((inauguration) => inauguration as Date);

        const maybeCapacity = stadium.capacity
            .fold<number | null>(null)((capacity) => capacity as number);

        const maybeNickname = stadium.nickname
            .fold<string | null>(null)((nickname) => nickname as string);

        // const defaultObjectId = new ObjectId();
        // const countryId = stadium.country.id.fold(defaultObjectId)((id) => new ObjectId(id as string));

        const { coordinates } = stadium;

        return {
            name: stadium.name,
            country: new ObjectId(stadium.country),
            geometry: {
                type: 'Point',
                coordinates: [coordinates.longitude, coordinates.latitude],
            },
            ...maybeId && { _id: maybeId },
            ...maybeCapacity && { capacity: maybeCapacity },
            ...maybeNickname && { nickname: maybeNickname },
            ...maybeInauguration && { inauguration: maybeInauguration },
        } as StadiumCollection;
    },

    toDTO: (stadium: Stadium) => ({
        id: stadium.id.fold<string>('')((value) => value as string),
        name: stadium.name,
        // country: stadium.country.id.fold<string>('')((value) => value as string),
        country: stadium.country,
        coordinates: stadium.coordinates,
        inauguration: stadium.inauguration.fold<string | undefined>(undefined)((date) => date?.toISOString()),
        capacity: stadium.capacity.fold<number | undefined>(undefined)((capacity) => capacity as number),
        nickname: stadium.nickname.fold<string>('')((nickname) => nickname as string),
    } as StadiumDTO),
};
