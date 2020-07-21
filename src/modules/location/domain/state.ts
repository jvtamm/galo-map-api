import Entity from '@core/entity';
import Identifier from '@core/identifier';
import { Guard } from '@core/guard';

import Country from './country';

interface StateProps {
    name: string;
    code: string;
    country: Country
}

interface StateInfo {
    country: { name: string, code: string };
    name: string;
    code: string;
}

class State extends Entity<StateProps, string | number> {
    private constructor(props: StateProps, id?: Identifier<string | number>) {
        super(props, id);
    }

    static create(props: StateProps, id?: Identifier<string | number>): State {
        const guards = [
            Guard.againstAtLeast(1, props.name, 'Name'),
            Guard.againstAtLeast(2, props.code, 'Code'),
            Guard.againstAtMost(2, props.code, 'Code'),
        ];

        const guardResult = Guard.combine(guards);
        if (!guardResult.succeeded) {
            throw guardResult.message;
        }

        // if (!props.country.persisted()) {
        //     throw 'The informed country does not exists';
        // }

        const updatedProps = { ...props, ...{ code: props.code.toUpperCase() } };

        return new State(updatedProps, id);
    }

    getCompleteStateInfo(): StateInfo {
        return {
            country: {
                name: this.props.country.getName(),
                code: this.props.country.getCode(),
            },
            name: this.props.name,
            code: this.props.code,
        };
    }
}

export default State;
