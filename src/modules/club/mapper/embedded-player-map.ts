import { ObjectId } from 'mongodb';

import { Country } from '@modules/club/domain/country';
import { EmbeddedPlayer } from '@modules/club/domain/embedded-player';
import { PositionProps, Position } from '@modules/club/domain/position';
import { StaticMapper } from '@infra/contracts/mapper';

import CountryMap, { CountryEmbedded } from './country-map';
import PositionMap from './position-map';

export interface EmbeddedPlayerDTO {
    id: string;
    name: string;
    nationality: Country;
    position: PositionProps;
}

export interface PlayerEmbeddedCollection {
    _id: ObjectId;
    name: string;
    nationality: CountryEmbedded;
    position: PositionProps;
}

export const EmbeddedPlayerMap: StaticMapper<EmbeddedPlayer, PlayerEmbeddedCollection> = {
    toDomain: (raw: any) => {
        const position = Position.fromCode(raw.position.code).fold(
            () => null,
            (value: PositionProps) => value,
        );

        return {
            id: raw._id || raw.id,
            name: raw.name,
            nationality: CountryMap.toDomain(raw.nationality),
            position,
        };
    },

    toPersistance: (embeddedPlayer: EmbeddedPlayer) => ({
        _id: new ObjectId(embeddedPlayer.id),
        name: embeddedPlayer.name,
        nationality: CountryMap.toPersistance(embeddedPlayer.nationality),
        position: PositionMap.toPersistance(embeddedPlayer.position),
    }),

    toDTO: (embeddedPlayer: EmbeddedPlayer) => ({
        id: embeddedPlayer.id,
        name: embeddedPlayer.name,
        nationality: embeddedPlayer.nationality,
        position: PositionMap.toDTO(embeddedPlayer.position),
    }),
};
