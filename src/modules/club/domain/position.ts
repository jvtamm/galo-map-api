import { Either, left, right } from '@core/either';
import Maybe from '@core/maybe';

type CodeOptions = 'GK' | 'CB' | 'LB' | 'RB' | 'DM' | 'AM' | 'S'
type NameOptions = 'Goleiro' | 'Zagueiro' | 'Lateral-esquerdo' | 'Lateral-direito' | 'Volante' | 'Meia-atacante' | 'Atacante'

type PositionMap = {
    [key in CodeOptions]: NameOptions
}

const positionMap: PositionMap = {
    GK: 'Goleiro',
    CB: 'Zagueiro',
    LB: 'Lateral-esquerdo',
    RB: 'Lateral-direito',
    DM: 'Volante',
    AM: 'Meia-atacante',
    S: 'Atacante',
};

export interface PositionProps {
    name: NameOptions;
    code: CodeOptions;
}

export class Position {
    private constructor(
        private _name: NameOptions,
        private _code: CodeOptions,
    // eslint-disable-next-line no-empty-function
    ) {}

    static fromCode(code: CodeOptions): Either<string, Position> {
        if (!(code in positionMap)) {
            return left<string, Position>('Supplied position code is not valid.');
        }

        const name = positionMap[code];
        const position = new Position(name, code);

        return right<string, Position>(position);
    }

    static fromName(name: NameOptions): Either<string, Position> {
        const positionValues = Object.entries(positionMap).find(([, value]) => value === name);

        return Maybe.fromUndefined(positionValues)
            .toEither<string>('Supplied position name is not valid.')
            .chain<Position>(([code, positionName]) => {
                const position = new Position(positionName, code as CodeOptions);
                return right<string, Position>(position);
            });
    }

    getName() {
        return this._name;
    }

    getCode() {
        return this._code;
    }
}
