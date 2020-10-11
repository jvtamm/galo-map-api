import Result from '@core/result';
import { FixtureEvents } from '@modules/matches/domain/fixture-events';
import { Guard } from '@core/guard';

// type GoalType = 'GOAL' | 'PENALTY';
export interface PeriodEventProps {
    info: string;
    home: number;
    away: number;
}

export class PeriodEvent implements FixtureEvents {
    private readonly _type = 'period';

    private constructor(
        private _info: string,
        private _home: number,
        private _away: number,
        private _timestamp: number,
    // eslint-disable-next-line no-empty-function
    ) {}

    static create(props: PeriodEventProps, timestamp: number): Result<PeriodEvent> {
        const guardedProps = [
            { argument: props.info, argumentName: 'info' },
            { argument: props.home, argumentName: 'home' },
            { argument: props.away, argumentName: 'away' },
            { argument: timestamp, argumentName: 'timestamp' },
        ];

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error';
            return Result.fail<PeriodEvent>(error);
        }

        const goalEvent = new PeriodEvent(props.info, props.home, props.away, timestamp);
        return Result.ok(goalEvent);
    }

    getType(): string {
        return this._type;
    }

    getData(): PeriodEventProps {
        return {
            info: this._info,
            home: this._home,
            away: this._away,
        };
    }

    getTimestamp(): number {
        return this._timestamp;
    }
}
