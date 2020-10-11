import { ObjectId } from 'mongodb';

import { FixtureDetails, SummonedPlayers, FixtureDetailsProps } from '@modules/matches/domain/fixture-details';
import { FixtureDetailsCollection } from '@modules/matches/repos/implementations/mongo-fixture-details-repo';
import { FixtureEventFactory, EventOptions } from '@modules/matches/domain/fixture-events';
import { StaticMapper } from '@infra/contracts/mapper';

import { TeamMap } from './team-map';

export interface FixtureDetailsDTO {
    matchId: string;
    events: EventOptions;
    homePlayers: SummonedPlayers;
    awayPlayers: SummonedPlayers;
    attendance?: number;
    referee?: string;
}

export const FixtureDetailsMap: StaticMapper<FixtureDetails, FixtureDetailsCollection> = {
    toDomain: (raw: any) => {
        const events = raw.events || [];

        const props: FixtureDetailsProps = {
            events: events.map((event: EventOptions) => {
                const { data } = event;

                if (data.team) {
                    data.team = TeamMap.toDomain(data.team);
                }

                const currentEvent = { ...event, data };
                return FixtureEventFactory.create(currentEvent).value;
            }),
            homePlayers: raw.homePlayers as SummonedPlayers,
            awayPlayers: raw.awayPlayers as SummonedPlayers,
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
            events: fixtureDetails.events.map((event) => {
                const data = event.getData();
                if (data.team) {
                    data.team = TeamMap.toPersistance(data.team);
                }

                return ({
                    type: event.getType(),
                    timestamp: event.getTimestamp(),
                    data,
                });
            }),
            homePlayers: fixtureDetails.homePlayers,
            awayPlayers: fixtureDetails.awayPlayers,
            ...maybeReferee && { referee: maybeReferee },
            ...maybeAttendance && { attendance: maybeAttendance },
        };
    },

    toDTO: (fixtureDetails: FixtureDetails) => ({
        matchId: '',
        events: fixtureDetails.events.map((event) => {
            const data = event.getData();
            if (data.team) {
                data.team = TeamMap.toDTO(data.team);
            }

            return {
                type: event.getType(),
                timestamp: event.getTimestamp(),
                data,
            };
        }),
        awayPlayers: fixtureDetails.awayPlayers,
        homePlayers: fixtureDetails.homePlayers,
        referee: fixtureDetails.referee.fold<null | string>(null)((value) => value as string),
        attendance: fixtureDetails.attendance.fold<null | number>(null)((value) => value as number),
    }),
};
