import ValueObject from '@core/value-object';
import { Either, left, right } from '@core/either';

export interface BirthDateProps {
    value: Date;
}

export class BirthDate extends ValueObject<BirthDateProps> {
    get value(): Date {
        return this.props.value;
    }

    private constructor(props: BirthDateProps) {
        super(props);
    }

    private static isValidBirthDate(date: Date): boolean {
        const MIN_AGE = 10;

        const copiedDate = new Date(date.getTime());
        copiedDate.setFullYear(copiedDate.getFullYear() - MIN_AGE);

        return date > copiedDate;
    }

    public static create(birthDate: string | Date): Either<string, BirthDate> {
        const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
        if (!this.isValidBirthDate(date)) {
            return left<string, BirthDate>('Birthdate not valid');
        }

        const birthInstance = new BirthDate({ value: date });
        return right<string, BirthDate>(birthInstance);
    }
}
