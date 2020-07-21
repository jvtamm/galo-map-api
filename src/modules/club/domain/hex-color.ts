import ValueObject from '@core/value-object';
import { Either, left, right } from '@core/either';
import { Guard } from '@core/guard';

export interface HexColorProps {
    value: string;
}

export class HexColor extends ValueObject<HexColorProps> {
    private static readonly colorHexRegex = /^#[0-9A-F]{6}$/i;

    get value(): string {
        return this.props.value;
    }

    private constructor(props: HexColorProps) {
        super(props);
    }

    public static create(color: string): Either<string, HexColor> {
        const validation = Guard.againstRegex(color, this.colorHexRegex, 'color');

        if (!validation.succeeded) {
            const error = validation.message || 'Unexpected error has occurred.';
            return left<string, HexColor>(error);
        }

        const colorInstance = new HexColor({ value: color });
        return right<string, HexColor>(colorInstance);
    }
}
