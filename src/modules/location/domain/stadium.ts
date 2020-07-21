import Entity from '@core/entity';
import Identifier from '@core/identifier';
import Result from '@core/result';
import { Guard } from '@core/guard';

import Maybe from '@core/maybe';
import { Coordinates } from './address';
// import Country from './country';

export interface StadiumProps {
    name: string;
    nickname?: string;
    capacity?: number;
    inauguration?: Date;
    // country: Country;
    country: string;
    coordinates: Coordinates;
    // address: Address;
}

export class Stadium extends Entity<StadiumProps, string> {
    private constructor(props: StadiumProps, id?: Identifier<string>) {
        super(props, id);
    }

    static create(props: StadiumProps, id?: Identifier<string>): Result<Stadium> {
        const guardedProps = [
            { argument: props.name, argumentName: 'name' },
            { argument: props.country, argumentName: 'country' },
            { argument: props.coordinates, argumentName: 'coordinates' },
        ];

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error has occurred.';
            return Result.fail<Stadium>(error);
        }

        if (props.capacity) {
            const validationResult = Guard.greaterThan(0, props.capacity);
            if (!validationResult.succeeded) {
                const error = validationResult.message || 'Unexpected error has occurred.';
                return Result.fail<Stadium>(error);
            }
        }

        const stadium = new Stadium(props, id);
        return Result.ok<Stadium>(stadium);
    }

    get name(): string {
        return this.props.name;
    }

    get nickname(): Maybe<string> {
        return Maybe.fromUndefined(this.props.nickname);
    }

    get capacity(): Maybe<number> {
        return Maybe.fromUndefined(this.props.capacity);
    }

    get inauguration(): Maybe<Date> {
        return Maybe.fromUndefined(this.props.inauguration);
    }

    get coordinates(): Coordinates {
        return this.props.coordinates;
    }

    // get country(): Country {
    //     return this.props.country;
    // }

    get country(): string {
        return this.props.country;
    }
}

export default Stadium;
