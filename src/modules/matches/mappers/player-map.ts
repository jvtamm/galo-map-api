import { ObjectId } from 'mongodb';

import { Player } from '../domain/player';

export const PlayerMap = {
    toDomain: (raw: any) => {
        const id = raw._id ? raw._id.toString() : undefined;

        return {
            name: raw.name,
            ...id && { id },
            ...raw.jersey && { jersey: raw.jersey },
        };
    },

    toPersistance: (player: Player) => {
        const _id = player.id ? new ObjectId(player.id) : undefined;

        return {
            name: player.name,
            ..._id && { _id },
            ...player.jersey && { jersey: player.jersey },
        };
    },

    toDTO: (player: Player) => {
        const id = player.id ? player.id : undefined;

        return {
            name: player.name,
            ...id && { id },
            ...player.jersey && { jersey: player.jersey },
        };
    },
};
