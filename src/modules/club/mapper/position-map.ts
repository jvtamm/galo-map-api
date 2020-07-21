import { Mapper } from '@infra/contracts/mapper';
import { Position, PositionProps } from '@modules/club/domain/position';

class PositionMap implements Mapper<Position> {
    static toDomain(raw: any): Position {
        let position;

        if (raw.code) {
            position = Position.fromCode(raw.code);
        } else {
            position = Position.fromName(raw.name);
        }

        return position.fold(() => null, (value: Position) => value);
    }

    static toPersistance(position: Position): PositionProps {
        return {
            name: position.getName(),
            code: position.getCode(),
        } as PositionProps;
    }

    static toDTO(position: Position): PositionProps {
        return {
            name: position.getName(),
            code: position.getCode(),
        } as PositionProps;
    }
}

export default PositionMap;
