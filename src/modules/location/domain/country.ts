import Entity from '@core/entity';
import Identifier from '@core/identifier';
import { Either, left, right } from '@core/either';
import { Guard } from '@core/guard';

export interface CountryProps {
    name: string;
    alpha2: string;
    alpha3: string;
}

class Country extends Entity<CountryProps, string | number> {
    private constructor(props: CountryProps, id?: Identifier<string | number>) {
        super(props, id);
    }

    static create(props: CountryProps, id?: Identifier<string | number>): Either<string, Country> {
        const guards = [
            Guard.againstNullOrUndefined(props.name, 'name'),
            Guard.againstAtLeast(4, props.name, 'name'),
            Guard.againstNullOrUndefined(props.alpha2, 'alpha2'),
            Guard.againstAtLeast(2, props.alpha2, 'alpha2'),
            Guard.againstAtMost(2, props.alpha2, 'alpha2'),
            Guard.againstNullOrUndefined(props.alpha3, 'alpha3'),
            Guard.againstAtLeast(3, props.alpha3, 'alpha3'),
            Guard.againstAtMost(3, props.alpha3, 'alpha3'),
        ];

        const guardResult = Guard.combine(guards);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error has occurred.';
            return left(error);
        }

        const updatedProps = {
            ...props,
            ...{
                alpha2: props.alpha2.toUpperCase(),
                alpha3: props.alpha3.toUpperCase(),
            },
        };

        const country = new Country(updatedProps, id);
        return right(country);
    }

    getName(): string {
        return this.props.name;
    }

    getCode(): string {
        return this.props.alpha3;
    }

    get alpha2(): string {
        return this.props.alpha2;
    }

    getId(): string | undefined {
        return this._id?.toString();
    }
}

export default Country;
