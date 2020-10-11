import Result from '@core/result';
import { FixtureEvents } from '@modules/matches/domain/fixture-events';
import { Guard } from '@core/guard';
import { Player } from '@modules/matches/domain/player';
import { Team } from '@modules/matches/domain/team';

type GoalType = 'GOAL' | 'PENALTY';
export interface GoalEventProps {
    goalType: GoalType;
    scorer: Player;
    team: Team;
    assistedBy?: Player;
}

export class GoalEvent implements FixtureEvents {
    private readonly _type = 'goal';

    private constructor(
        private _goalType: GoalType,
        private _scorer: Player,
        private _team: Team,
        private _timestamp: number,
        private _assistedBy?: Player,
    // eslint-disable-next-line no-empty-function
    ) {}

    static create(props: GoalEventProps, timestamp: number): Result<GoalEvent> {
        const guardedProps = [
            { argument: props.goalType, argumentName: 'goalType' },
            { argument: props.scorer, argumentName: 'scorer' },
            { argument: props.team, argumentName: 'team' },
        ];

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error';
            return Result.fail<GoalEvent>(error);
        }

        const MAX_MIN_WITH_EXTRA = 125;
        const timestampValidation = Guard.inRange(timestamp, 0, MAX_MIN_WITH_EXTRA, 'timestamp');
        if (!timestampValidation.succeeded) {
            const error = timestampValidation.message || 'Unexpected error';
            return Result.fail<GoalEvent>(error);
        }

        const goalEvent = new GoalEvent(props.goalType, props.scorer, props.team, timestamp, props.assistedBy);
        return Result.ok(goalEvent);
    }

    getType(): string {
        return this._type;
    }

    getData(): GoalEventProps {
        return {
            goalType: this._goalType,
            scorer: this._scorer,
            team: this._team,
        };
    }

    getTimestamp(): number {
        return this._timestamp;
    }
}
