import Entity from '@core/entity';
import Identifier from '@core/identifier';
import { Either, left, right } from '@core/either';
import { Guard } from '@core/guard';

import Maybe from '@core/maybe';
import { ExternalReference, Refs } from './external-references';
import { HexColor } from './hex-color';
import { Country } from './country';

export interface TeamProps {
    name: string;
    displayName?: string;
    country: Country
    refs: ExternalReference[];
    abbreviation?: string;
    founded?: number;
    primaryColor?: HexColor;
    secondaryColor?: HexColor;
    // stadium?: Stadium[]
}

export class Team extends Entity<TeamProps, string | number> {
    private constructor(props: TeamProps, id?: Identifier<string | number>) {
        super(props, id);
    }

    static create(props: TeamProps, id?: Identifier<string | number>): Either<string, Team> {
        const guardResult = Guard.againstEmpty<ExternalReference>(props.refs, 'refs');

        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error has occurred.';
            return left<string, Team>(error);
        }

        if (props.founded) {
            const currentYear = (new Date()).getFullYear();
            const validation = Guard.inRange(props.founded, 1800, currentYear, 'founded');
            if (!validation.succeeded) {
                const error = validation.message || 'Unexpected error has occurred.';
                return left<string, Team>(error);
            }
        }

        if (props.abbreviation) {
            const validations = [
                Guard.againstAtLeast(3, props.abbreviation, 'abbreviation'),
                Guard.againstAtMost(3, props.abbreviation, 'abbreviation'),
            ];

            const result = Guard.combine(validations);
            if (!result.succeeded) {
                const error = result.message || 'Unexpected error has occurred.';
                return left<string, Team>(error);
            }
        }

        const team = new Team(props, id);
        return right<string, Team>(team);
    }

    getName(): string {
        return this.props.name;
    }

    getDisplayName(): Maybe<string> {
        return Maybe.fromUndefined(this.props.displayName);
    }

    getAbbreviation(): Maybe<string> {
        return Maybe.fromUndefined<string>(this.props?.abbreviation);
    }

    getCountry(): Country {
        return this.props.country;
    }

    getFounded(): Maybe<number> {
        return Maybe.fromUndefined<number>(this.props.founded);
    }

    getPrimaryColor(): Maybe<HexColor> {
        return Maybe.fromUndefined<HexColor>(this.props.primaryColor);
    }

    getId(): Maybe<string> {
        return Maybe.fromUndefined<string>(this._id?.toString());
    }

    getSecondaryColor(): Maybe<HexColor> {
        return Maybe.fromUndefined<HexColor>(this.props.secondaryColor);
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
