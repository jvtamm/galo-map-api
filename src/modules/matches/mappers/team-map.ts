import { ObjectId } from 'mongodb';

import { StaticMapper } from '@infra/contracts/mapper';
import { Team } from '@modules/matches/domain/team';

export interface TeamCollection {
    _id: ObjectId;
    name: string;
    abbreviation: string;
    displayName: string;
    country: string;
}

export interface TeamDTO {
    id: string;
    name: string;
    abbreviation: string;
    displayName: string;
    country: string;
}

export const TeamMap: StaticMapper<Team, TeamCollection> = {
    toDomain: (raw: any) => {
        const _id = raw._id ? raw._id.toString() : undefined;

        const props = {
            name: raw.name,
            abbreviation: raw.abbreviation,
            country: raw.country,
            displayName: raw.displayName,
            ...raw.currentPosition && { currentPosition: raw.currentPosition },
        };

        const team = Team.create(props, _id);
        return team.value;
    },

    toPersistance: (team: Team) => {
        const generatedId = new ObjectId();

        const _id = team.id.fold(generatedId)((id) => new ObjectId(id as string));

        return {
            _id,
            name: team.name,
            abbreviation: team.abbreviation,
            displayName: team.displayName,
            country: team.country,
        };
    },

    toDTO: (team: Team) => ({
        id: team.id.fold('')((id) => id as string),
        name: team.name,
        abbreviation: team.abbreviation,
        displayName: team.displayName,
        country: team.country,
    }),
};
