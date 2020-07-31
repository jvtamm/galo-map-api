/* eslint-disable operator-linebreak */
import Result from '@core/result';
import { Guard } from '@core/guard';

import Maybe from '@core/maybe';
import { FixtureEvents } from './fixture-events';
import { Player } from './player';

export interface SummonedPlayers {
    bench: Player[];
    lineup: Player[];
}

export interface FixtureDetailsProps {
    events?: FixtureEvents[];
    attendance?: number;
    homePlayers: SummonedPlayers;
    awayPlayers: SummonedPlayers;
}

export class FixtureDetails {
    private constructor(
        private _homePlayers: SummonedPlayers,
        private _awayPlayers: SummonedPlayers,
        private _events?: FixtureEvents[],
        private _attendance?: number,
    // eslint-disable-next-line no-empty-function
    ) {}

    static create(props: FixtureDetailsProps): Result<FixtureDetails> {
        const guardedProps = [
            // { argument: props.events, argumentName: 'events' },
            { argument: props.homePlayers, argumentName: 'homePlayers' },
            { argument: props.awayPlayers, argumentName: 'awayPlayers' },
        ];

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error';
            return Result.fail<FixtureDetails>(error);
        }

        if (!props.homePlayers?.bench || !props.homePlayers?.lineup) {
            return Result.fail<FixtureDetails>('Home players must have lineup and bench properties');
        }

        if (!props.awayPlayers?.bench || !props.awayPlayers?.lineup) {
            return Result.fail<FixtureDetails>('Away players must have lineup and bench properties');
        }

        const fixtureDetails = new FixtureDetails(props.homePlayers, props.awayPlayers, props.events, props.attendance);
        return Result.ok(fixtureDetails);
    }

    isPlayerInMatch(player: Player): boolean {
        return Boolean(this._awayPlayers && this._homePlayers) &&
                (
                    this.isPlayerInTeam(player, this._awayPlayers as SummonedPlayers) ||
                    this.isPlayerInTeam(player, this._homePlayers as SummonedPlayers)
                );
    }

    // eslint-disable-next-line class-methods-use-this
    private isPlayerInTeam(player: Player, summonedPlayers: SummonedPlayers): boolean {
        const { bench, lineup } = summonedPlayers;

        return bench.some(({ id, name }) => player.id === id || player.name === name)
               || lineup.some(({ id, name }) => player.id === id || player.name === name);
    }

    get events(): FixtureEvents[] {
        return this._events || [];
    }

    get homePlayers(): SummonedPlayers {
        return this._homePlayers;
    }

    get awayPlayers(): SummonedPlayers {
        return this._awayPlayers;
    }

    get attendance(): Maybe<number> {
        return Maybe.fromUndefined(this._attendance);
    }

    // getPlayerSummary(player: Player): any {
    //     const output = {};

    //     this._events.forEach((event) => {
    //         const type = event.getType();
    //         const data = event.getData();

    //         if (type === 'goal') {
    //         } else if (type === 'card') {

    //         } else if (type === 'substitution') {

    //         }
    //     });
    // }
}
