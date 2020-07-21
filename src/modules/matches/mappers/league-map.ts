import { ObjectId } from 'mongodb';

import Identifier from '@core/identifier';
import { League } from '@modules/matches/domain/league';
import { LeagueCollection } from '@modules/matches/repos/implementations/mongo-league-repo';
import { StaticMapper } from '@infra/contracts/mapper';

export interface LeagueDTO {
    id?: string;
    name: string;
    organizedBy?: string;
}

export const LeagueMap: StaticMapper<League, LeagueCollection> = {
    toDomain: (raw: any) => {
        const _id = raw._id ? new Identifier<string>(raw._id.toString()) : undefined;

        const props = {
            name: raw.name,
            ...raw.organizedBy && { organizedBy: raw.organizedBy },
        };

        const league = League.create(props, _id);

        return league.value;
    },

    toPersistance: (league: League) => {
        const generatedId = new ObjectId();
        const _id = league.id.fold(generatedId)((id) => new ObjectId(id as string));

        const maybeOrganizer = league.organizer.fold<string | null>(null)((organizer) => organizer as string);

        return {
            _id,
            name: league.name,
            ...maybeOrganizer && { organizedBy: maybeOrganizer },
        };
    },

    toDTO: (league: League) => ({
        id: league.id.fold('')((id) => id as string),
        name: league.name,
        organizedBy: league.organizer.fold('')((organizer) => organizer as string),
    }),
};

export interface EmbeddedLeague {
    _id: ObjectId;
    name: string;
}

export const toEmbeddedLeague = (league: League) => {
    const persistanceLeague = LeagueMap.toPersistance(league);

    return {
        _id: persistanceLeague._id,
        name: persistanceLeague.name,
    } as EmbeddedLeague;
};
