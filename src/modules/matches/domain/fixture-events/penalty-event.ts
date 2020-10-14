import Result from '@core/result';
import { FixtureEvents } from '@modules/matches/domain/fixture-events';
import { Guard } from '@core/guard';
import { Player } from '@modules/matches/domain/player';
import { Team } from '@modules/matches/domain/team';

export interface PenaltyEventProps {
    scored: boolean;
    player: Player;
    team: Team;
}

export class PenaltyEvent implements FixtureEvents {
    private readonly _type = 'penalty';

    private constructor(
        private _scored: boolean,
        private _player: Player,
        private _team: Team,
        private _timestamp?: number,
    // eslint-disable-next-line no-empty-function
    ) {}

    static create(props: PenaltyEventProps, timestamp?: number): Result<PenaltyEvent> {
        const guardedProps = [
            { argument: props.scored, argumentName: 'scored' },
            { argument: props.player, argumentName: 'player' },
            { argument: props.team, argumentName: 'team' },
        ];

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error';
            return Result.fail<PenaltyEvent>(error);
        }

        if (timestamp) {
            const MAX_MIN_WITH_EXTRA = 125;
            const timestampValidation = Guard.inRange(timestamp, 0, MAX_MIN_WITH_EXTRA, 'timestamp');

            if (!timestampValidation.succeeded) {
                const error = timestampValidation.message || 'Unexpected error';
                return Result.fail<PenaltyEvent>(error);
            }
        }

        const penaltyEvent = new PenaltyEvent(props.scored, props.player, props.team, timestamp);
        return Result.ok(penaltyEvent);
    }

    getType(): string {
        return this._type;
    }

    getData(): PenaltyEventProps {
        return {
            scored: this._scored,
            player: this._player,
            team: this._team,
        };
    }

    getTimestamp(): number {
        return this._timestamp as number;
    }
}
