import Result from '@core/result';

import { CardEventProps, CardEvent } from './card-event';
import { GoalEventProps, GoalEvent } from './goal-event';
import { PeriodEvent, PeriodEventProps } from './period-event';
import { SubstitutionEventProps, SubstitutionEvent } from './substitution-event';

export interface EventOptions {
    type: string;
    timestamp?: number;
    data?: any;
}

export interface FixtureEvents {
    getType(): string;
    getData(): any;
    getTimestamp(): number;
}

export class FixtureEventFactory {
    /**
     * Creates a new fixture event depending on the type.
     */
    static create(options: EventOptions): Result<FixtureEvents> {
        const { type } = options;
        switch (type) {
            case 'card':
                return CardEvent.create(options.data as CardEventProps, options.timestamp as number);
            case 'goal':
                return GoalEvent.create(options.data as GoalEventProps, options.timestamp as number);
            case 'substitution':
                return SubstitutionEvent.create(options.data as SubstitutionEventProps, options.timestamp);
            case 'period':
                return PeriodEvent.create(options.data as PeriodEventProps, options.timestamp as number);
            default:
                return Result.fail(`Wrong event type: "${type}" given. Supported events are: "card", "goal", "substitution", "period".`);
        }
    }

    /**
     * Sorts the events according to timestamp and event type.
     * Event type is taken into consideration in case of end of period (Half-Time, Full-Time, Extra-Time, Penalties)
     */
    static sort(events: FixtureEvents[]): FixtureEvents[] {
        function strategy(a: FixtureEvents, b: FixtureEvents) {
            const aTimestamp = a.getTimestamp();
            const bTimestamp = b.getTimestamp();

            const hasATimestemp = !aTimestamp && aTimestamp !== 0;
            const hasBTimestemp = !bTimestamp && bTimestamp !== 0;

            if (!hasATimestemp) return 1;
            if (!hasBTimestemp) return -1;
            if (aTimestamp < bTimestamp) return -1;
            if (aTimestamp === bTimestamp) {
                if (a.getType() === 'period') return -1;
                if (b.getType() === 'period') return 1;

                return 0;
            }

            return 1;
        }

        return events.sort(strategy);
    }
}
