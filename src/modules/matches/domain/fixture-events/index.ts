import Result from '@core/result';

import { CardEventProps, CardEvent } from './card-event';
import { GoalEventProps, GoalEvent } from './goal-event';
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
            default:
                return Result.fail(`Wrong event type: "${type}" given. Supported drivers are: "card", "goal", "substitution".`);
        }
    }
}
