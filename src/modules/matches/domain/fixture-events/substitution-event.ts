import Result from '@core/result';
import { FixtureEvents } from '@modules/matches/domain/fixture-events';
import { Guard } from '@core/guard';
import { Player } from '@modules/matches/domain/player';
import { Team } from '@modules/matches/domain/team';

export interface SubstitutionEventProps {
    inPlayer: Player;
    outPlayer: Player;
    team: Team;
}

export class SubstitutionEvent implements FixtureEvents {
    private readonly _type = 'card';

    private constructor(
        private _inPlayer: Player,
        private _outPlayer: Player,
        private _team: Team,
        private _timestamp?: number,
    // eslint-disable-next-line no-empty-function
    ) {}

    static create(props: SubstitutionEventProps, timestamp?: number): Result<SubstitutionEvent> {
        const guardedProps = [
            { argument: props.inPlayer, argumentName: 'inPlayer' },
            { argument: props.outPlayer, argumentName: 'outPlayer' },
            { argument: props.team, argumentName: 'team' },
        ];

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error';
            return Result.fail<SubstitutionEvent>(error);
        }

        if (timestamp) {
            const MAX_MIN_WITH_EXTRA = 125;
            const timestampValidation = Guard.inRange(timestamp, 0, MAX_MIN_WITH_EXTRA, 'timestamp');

            if (!timestampValidation.succeeded) {
                const error = timestampValidation.message || 'Unexpected error';
                return Result.fail<SubstitutionEvent>(error);
            }
        }

        const goalEvent = new SubstitutionEvent(props.inPlayer, props.outPlayer, props.team, timestamp);
        return Result.ok(goalEvent);
    }

    getType(): string {
        return this._type;
    }

    getData(): SubstitutionEventProps {
        return {
            inPlayer: this._inPlayer,
            outPlayer: this._outPlayer,
            team: this._team,
        };
    }

    getTimestamp(): number {
        return this._timestamp as number;
    }
}
