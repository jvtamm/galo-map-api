import { EventOptions, FixtureEventFactory, FixtureEvents } from '../domain/fixture-events';
import { PlayerMap } from './player-map';
import { TeamMap } from './team-map';

const playersFields = ['scorer', 'player', 'inPlayer', 'outPlayer', 'assistedBy'];

export const EventMap = {
    toDomain: (event: EventOptions) => {
        const { data } = event;

        if (data.team) {
            data.team = TeamMap.toDomain(data.team);
        }

        playersFields.forEach((key) => {
            if (key in data) {
                data[key] = PlayerMap.toDomain(data[key]);
            }
        });

        const currentEvent = { ...event, data };
        return FixtureEventFactory.create(currentEvent).value;
    },
    toPersistance: (event: FixtureEvents) => {
        const data = event.getData();
        if (data.team) {
            data.team = TeamMap.toPersistance(data.team);
        }

        playersFields.forEach((key) => {
            if (key in data) {
                data[key] = PlayerMap.toPersistance(data[key]);
            }
        });

        return ({
            type: event.getType(),
            timestamp: event.getTimestamp(),
            data,
        });
    },
    toDTO: (event: FixtureEvents) => {
        const data = event.getData();
        if (data.team) {
            data.team = TeamMap.toDTO(data.team);
        }

        playersFields.forEach((key) => {
            if (key in data) {
                data[key] = PlayerMap.toDTO(data[key]);
            }
        });

        return {
            type: event.getType(),
            timestamp: event.getTimestamp(),
            data,
        };
    },
};
