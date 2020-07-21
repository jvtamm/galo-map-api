import Entity from '@core/entity';
import Identifier from '@core/identifier';
import Maybe from '@core/maybe';

import { Either, left, right } from '@core/either';
import { Guard } from '@core/guard';
import { Country } from './country';
import { Position } from './position';

export interface SquadPlayer {
    id: string;
    name: string;
    nationality: Country
    position: Position
}

export interface SquadProps {
    teamId: string;
    teamName: string;
    teamCountry: Country;
    squad: SquadPlayer[];
}

export class Squad extends Entity<SquadProps, string | number> {
    private constructor(props: SquadProps, id?: Identifier<string | number>) {
        super(props, id);
    }

    static create(props: SquadProps, id?: Identifier<string | number>): Either<string, Squad> {
        const ObjectIdSize = 24;

        const guards = [
            Guard.againstAtLeast(ObjectIdSize, props.teamId, 'teamId'),
            Guard.againstAtLeast(1, props.teamName, 'teamName'),
        ];

        const guardResult = Guard.combine(guards);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error has occurred.';
            return left<string, Squad>(error);
        }

        const squad = new Squad(props, id);
        return right<string, Squad>(squad);
    }

    getId(): Maybe<string> {
        return Maybe.fromUndefined<string>(this._id?.toString());
    }

    getTeamId(): string {
        return this.props.teamId;
    }

    getTeamName(): string {
        return this.props.teamName;
    }

    getTeamCountry(): Country {
        return this.props.teamCountry;
    }

    getPlayers(): SquadPlayer[] {
        return this.props.squad;
    }

    addPlayer(player: SquadPlayer): void {
        if (!this.isPlayerInSquad(player.id)) {
            this.props.squad.push(player);
        }
    }

    removePlayer(playerId: string): void {
        if (this.isPlayerInSquad(playerId)) {
            this.props.squad = this.props.squad.filter((squadPlayer) => squadPlayer.id.toString() !== playerId);
        }
    }

    private isPlayerInSquad(playerId: string): boolean {
        return this.getPlayers().some(({ id }) => id.toString() === playerId);
    }
}
