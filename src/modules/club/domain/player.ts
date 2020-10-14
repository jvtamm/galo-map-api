import Entity from '@core/entity';
import Identifier from '@core/identifier';
import Maybe from '@core/maybe';
import { Either, left, right } from '@core/either';
import { Guard } from '@core/guard';

import { BirthDate } from './birthdate';
import { Country } from './country';
import { ExternalReference, Refs } from './external-references';
import { Position } from './position';

export interface PlayerProps {
    name: string;
    dateOfBirth: BirthDate;
    nationality: Country,
    position: Position;
    refs: ExternalReference[];
    displayName?: string;
    jersey?: number;
    height?: number;
    weight?: number;
}

export class Player extends Entity<PlayerProps, string | number> {
    private constructor(props: PlayerProps, id?: Identifier<string | number>) {
        super(props, id);
    }

    static create(props: PlayerProps, id?: Identifier<string | number>) : Either<string, Player> {
        const guards = [
            Guard.againstAtLeast(3, props.name, 'Name'),
            Guard.againstEmpty<ExternalReference>(props.refs, 'refs'),
        ];

        const guardResult = Guard.combine(guards);
        if (!guardResult.succeeded) {
            return left<string, Player>(guardResult.message as string);
        }

        if (props.jersey) {
            const validation = Guard.greaterThan(0, props.jersey);
            if (!validation.succeeded) {
                return left<string, Player>('Jersey number should be greater than 0.');
            }
        }

        if (props.height) {
            const validation = Guard.greaterThan(1.5, props.height);
            if (!validation.succeeded) {
                return left<string, Player>('Height should be greater than 1,5.');
            }
        }

        if (props.weight) {
            const validation = Guard.greaterThan(0, props.weight);
            if (!validation.succeeded) {
                return left<string, Player>('Weight should be greater than 0.');
            }
        }

        const player = new Player(props, id);
        return right<string, Player>(player);
    }

    getId(): Maybe<string> {
        return Maybe.fromUndefined<string>(this._id?.toString());
    }

    getName(): string {
        return this.props.name;
    }

    getDateOfBirth(): Date {
        if (this.props.dateOfBirth) {
            return this.props.dateOfBirth.value;
        }

        return undefined as unknown as Date;
    }

    getNationality(): Country {
        return this.props.nationality;
    }

    getPosition(): Position {
        return this.props.position;
    }

    getDisplayName(): Maybe<string> {
        return Maybe.fromUndefined(this.props.displayName);
    }

    getJersey(): Maybe<number> {
        return Maybe.fromUndefined(this.props.jersey);
    }

    getHeight(): Maybe<number> {
        return Maybe.fromUndefined(this.props.height);
    }

    getWeight(): Maybe<number> {
        return Maybe.fromUndefined(this.props.weight);
    }

    getRefs(): Maybe<Refs[]> {
        const refs = this.props.refs?.map((ref) => ({
            provider: ref.getProvider(),
            ref: ref.serialize(),
        }));

        return Maybe.fromUndefined<Refs[]>(refs);
    }

    addRef(ref: ExternalReference): void {
        this.props.refs.push(ref);
    }
}
