import Result from '@core/result';
import { FixtureEvents } from '@modules/matches/domain/fixture-events';
import { Guard } from '@core/guard';
import { Player } from '@modules/matches/domain/player';
import { Team } from '@modules/matches/domain/team';

type CardColor = 'RED' | 'YELLOW';
export interface CardEventProps {
    color: CardColor;
    player: Player;
    team: Team;
    reason?: string;
}

export class CardEvent implements FixtureEvents {
    private readonly _type = 'card';

    private constructor(
        private _color: CardColor,
        private _player: Player,
        private _team: Team,
        private _timestamp?: number,
        private _reason?: string,
    // eslint-disable-next-line no-empty-function
    ) {}

    static create(props: CardEventProps, timestamp?: number): Result<CardEvent> {
        const guardedProps = [
            { argument: props.color, argumentName: 'goalType' },
            { argument: props.player, argumentName: 'scorer' },
            { argument: props.team, argumentName: 'team' },
        ];

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error';
            return Result.fail<CardEvent>(error);
        }

        if (timestamp) {
            const MAX_MIN_WITH_EXTRA = 125;
            const timestampValidation = Guard.inRange(timestamp, 0, MAX_MIN_WITH_EXTRA, 'timestamp');
            if (!timestampValidation.succeeded) {
                const error = timestampValidation.message || 'Unexpected error';
                return Result.fail<CardEvent>(error);
            }
        }

        const goalEvent = new CardEvent(props.color, props.player, props.team, timestamp, props.reason);
        return Result.ok(goalEvent);
    }

    getType(): string {
        return this._type;
    }

    getData(): CardEventProps {
        return {
            color: this._color,
            player: this._player,
            team: this._team,
            ...this._reason && { reason: this._reason },
        };
    }

    getTimestamp(): number {
        return this._timestamp as number;
    }
}
