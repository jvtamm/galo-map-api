import { StaticMapper } from '@infra/contracts/mapper';
import { Stadium } from '@modules/matches/domain/stadium';

interface Point {
    type: string;
    coordinates: Array<number>
}

export interface EmbeddedStadium {
    name: string;
    nickname?: string;
    geometry: Point;
}

export const StadiumMap : StaticMapper<Stadium, EmbeddedStadium> = {
    toDomain: (raw: any) => {
        const coordinates = {
            latitude: parseFloat(raw.geometry.coordinates[1]),
            longitude: parseFloat(raw.geometry.coordinates[0]),
        };

        return {
            name: raw.name,
            nickname: raw.nickname,
            coordinates,
        };
    },

    toPersistance: (stadium: Stadium) => {
        const { coordinates } = stadium;
        return {
            name: stadium.name,
            nickname: stadium.nickname,
            geometry: {
                type: 'Point',
                coordinates: [coordinates.longitude, coordinates.latitude],
            },
        };
    },

    toDTO: (stadium: Stadium) => stadium,
};
