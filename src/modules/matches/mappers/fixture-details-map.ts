import { ObjectId } from 'mongodb';

import { FixtureDetails, SummonedPlayers, FixtureDetailsProps } from '@modules/matches/domain/fixture-details';
import { FixtureDetailsCollection } from '@modules/matches/repos/implementations/mongo-fixture-details-repo';
import { FixtureEventFactory, EventOptions } from '@modules/matches/domain/fixture-events';
import { StaticMapper } from '@infra/contracts/mapper';

export interface FixtureDetailsDTO {
    matchId: string;
    events: EventOptions;
    homePlayers: SummonedPlayers;
    awayPlayers: SummonedPlayers;
    attendance?: number;
}

export const FixtureDetailsMap: StaticMapper<FixtureDetails, FixtureDetailsCollection> = {
    toDomain: (raw: any) => {
        const events = raw.events || [];

        const props: FixtureDetailsProps = {
            events: events.map((event: EventOptions) => FixtureEventFactory.create(event)),
            homePlayers: raw.homePlayers as SummonedPlayers,
            awayPlayers: raw.homePlayers as SummonedPlayers,
            ...raw.attendance && { attendance: raw.attendance },
        };

        const fixtureDetails = FixtureDetails.create(props);
        return fixtureDetails.value;
    },

    toPersistance: (fixtureDetails: FixtureDetails) => {
        const _id = new ObjectId();

        const maybeAttendance = fixtureDetails.attendance
            .fold<number | undefined>(undefined)((value) => value as number);

        return {
            _id,
            events: fixtureDetails.events.map((event) => ({
                type: event.getType(),
                timestamp: event.getTimestamp(),
                data: event.getData(),
            })),
            homePlayers: fixtureDetails.homePlayers,
            awayPlayers: fixtureDetails.awayPlayers,
            ...maybeAttendance && { attendance: maybeAttendance },
        };
    },

    toDTO: (fixtureDetails: FixtureDetails) => ({
        matchId: '',
        events: fixtureDetails.events.map((event) => ({
            type: event.getType(),
            timestamp: event.getTimestamp(),
            data: event.getData(),
        })),
        awayPlayers: fixtureDetails.awayPlayers,
        homePlayers: fixtureDetails.homePlayers,
        attendance: fixtureDetails.attendance.fold<null | number>(null)((value) => value as number),
    }),
};
