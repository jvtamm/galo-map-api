import { ObjectId } from 'mongodb';

import { FixtureDetails, SummonedPlayers, FixtureDetailsProps } from '@modules/matches/domain/fixture-details';
import { FixtureDetailsCollection } from '@modules/matches/repos/implementations/mongo-fixture-details-repo';
import { EventOptions } from '@modules/matches/domain/fixture-events';
import { StaticMapper } from '@infra/contracts/mapper';

import { PlayerMap } from './player-map';
import { EventMap } from './event-map';

export interface FixtureDetailsDTO {
    // matchId: string;
    events: EventOptions;
    homePlayers: SummonedPlayers;
    awayPlayers: SummonedPlayers;
    attendance?: number;
    referee?: string;
}

const SummonedPlayersMap = {
    toDomain: (raw: any) => {
        const bench = raw.bench.map(PlayerMap.toDomain);
        const lineup = raw.lineup.map(PlayerMap.toDomain);

        return {
            bench,
            lineup,
        };
    },
    toPersistance: (summonedPlayers: SummonedPlayers) => {
        const bench = summonedPlayers.bench.map(PlayerMap.toPersistance);
        const lineup = summonedPlayers.lineup.map(PlayerMap.toPersistance);

        return {
            bench,
            lineup,
        };
    },
    toDTO: (summonedPlayers: SummonedPlayers) => {
        const bench = summonedPlayers.bench.map(PlayerMap.toDTO);
        const lineup = summonedPlayers.lineup.map(PlayerMap.toDTO);

        return {
            bench,
            lineup,
        };
    },
};

export const FixtureDetailsMap: StaticMapper<FixtureDetails, FixtureDetailsCollection> = {
    toDomain: (raw: any) => {
        const events = raw.events || [];

        const props: FixtureDetailsProps = {
            events: events.map(EventMap.toDomain),
            homePlayers: SummonedPlayersMap.toDomain(raw.homePlayers) as SummonedPlayers,
            awayPlayers: SummonedPlayersMap.toDomain(raw.awayPlayers) as SummonedPlayers,
            ...raw.attendance && { attendance: raw.attendance },
            ...raw.referee && { referee: raw.referee },
        };

        const fixtureDetails = FixtureDetails.create(props);
        return fixtureDetails.value;
    },

    toPersistance: (fixtureDetails: FixtureDetails) => {
        const _id = new ObjectId();

        const maybeAttendance = fixtureDetails.attendance
            .fold<number | undefined>(undefined)((value) => value as number);

        const maybeReferee = fixtureDetails.referee
            .fold<string | undefined>(undefined)((value) => value as string);

        return {
            _id,
            events: fixtureDetails.events.map(EventMap.toPersistance),
            homePlayers: SummonedPlayersMap.toPersistance(fixtureDetails.homePlayers),
            awayPlayers: SummonedPlayersMap.toPersistance(fixtureDetails.awayPlayers),
            ...maybeReferee && { referee: maybeReferee },
            ...maybeAttendance && { attendance: maybeAttendance },
        };
    },

    toDTO: (fixtureDetails: FixtureDetails) => ({
        events: fixtureDetails.events.map(EventMap.toDTO),
        awayPlayers: SummonedPlayersMap.toDTO(fixtureDetails.awayPlayers),
        homePlayers: SummonedPlayersMap.toDTO(fixtureDetails.homePlayers),
        referee: fixtureDetails.referee.fold<null | string>(null)((value) => value as string),
        attendance: fixtureDetails.attendance.fold<null | number>(null)((value) => value as number),
    }),
};
