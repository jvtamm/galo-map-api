import { Either, left, right } from '@core/either';
import Entity from '@core/entity';
import Identifier from '@core/identifier';
import { Guard } from '@core/guard';

import State from './state';

interface CityProps {
    name: string;
    state: State;
}

interface CityInfo {
    country: { name: string, code: string };
    state: { name: string, code: string};
    name: string;
}

class City extends Entity<CityProps, string | number> {
    private constructor(props: CityProps, id?: Identifier<string | number>) {
        super(props, id);
    }

    static create(props: CityProps, id?: Identifier<string | number>): Either<string, City> {
        const guards = [
            Guard.againstAtLeast(1, props.name, 'Name'),
        ];

        const guardResult = Guard.combine(guards);
        if (!guardResult.succeeded) {
            return left<string, City>(guardResult.message as string);
        }

        if (!props.state.persisted()) {
            return left('The informed state does not exist');
        }

        const city = new City(props, id);
        return right(city);
    }

    getCompleteCityInfo(): CityInfo {
        const { country, ...state } = this.props.state.getCompleteStateInfo();
        return {
            name: this.props.name,
            country,
            state,
        };
    }
}

export default City;
