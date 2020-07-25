import { ObjectId } from 'mongodb';

import Identifier from '@core/identifier';
import { LeagueEdition } from '@modules/matches/domain/league-edition';
import { LeagueEditionCollection } from '@modules/matches/repos/implementations/mongo-league-edition-repo';
import { StaticMapper } from '@infra/contracts/mapper';

import { SeasonDTO, SeasonMap, toEmbeddedSeason } from './season-map';
import { LeagueDTO, LeagueMap, toEmbeddedLeague } from './league-map';

export interface LeagueEditionDTO {
    id: string;
    league: LeagueDTO;
    season: SeasonDTO;
    startingDate?: string;
    endingDate?: string;
}

export const LeagueEditionMap: StaticMapper<LeagueEdition, LeagueEditionCollection> = {
    toDomain: (raw: any) => {
        const _id = raw._id ? new Identifier<string>(raw._id.toString()) : undefined;

        const props = {
            league: LeagueMap.toDomain(raw.league),
            season: SeasonMap.toDomain(raw.season),
            ...raw.startingDate && { startingDate: raw.startingDate },
            ...raw.endingDate && { endingDate: raw.endingDate },
        };

        const leagueEdition = LeagueEdition.create(props, _id);

        return leagueEdition.value;
    },

    toPersistance: (leagueEdition: LeagueEdition) => {
        const generatedId = new ObjectId();
        const _id = leagueEdition.id.fold(generatedId)((id) => new ObjectId(id as string));

        const maybeStartingDate = leagueEdition.startingDate
            .fold<null | Date>(null)((date) => date as Date);

        const maybeEndingDate = leagueEdition.endingDate
            .fold<null | Date>(null)((date) => date as Date);

        return {
            league: toEmbeddedLeague(leagueEdition.league),
            season: toEmbeddedSeason(leagueEdition.season),
            ..._id && { _id },
            ...maybeEndingDate && { endingDate: maybeEndingDate },
            ...maybeStartingDate && { startingDate: maybeStartingDate },
        };
    },

    toDTO: (leagueEdition: LeagueEdition) => ({
        id: leagueEdition.id.fold('')((id) => id as string),
        league: LeagueMap.toDTO(leagueEdition.league),
        season: SeasonMap.toDTO(leagueEdition.season),
        startingDate: leagueEdition.startingDate.fold<string | undefined>(undefined)((date) => date?.toISOString()),
        endingDate: leagueEdition.endingDate.fold<string | undefined>(undefined)((date) => date?.toISOString()),
    }),
};

export interface EmbeddedLeagueEdition {
    _id: ObjectId;
    name: string;
    year: number;
}

export const toEmbeddedLeagueEdition = (leagueEdition: LeagueEdition) => {
    const persistanceLeagueEdition = LeagueEditionMap.toPersistance(leagueEdition);

    return {
        _id: persistanceLeagueEdition._id,
        name: persistanceLeagueEdition.league.name,
        year: persistanceLeagueEdition.season.year,
    } as EmbeddedLeagueEdition;
};
