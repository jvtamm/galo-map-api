import Entity from '@core/entity';
import Identifier from '@core/identifier';
import Result from '@core/result';
import { Guard } from '@core/guard';
import Maybe from '@core/maybe';

export interface SeasonProps {
    year: number;
    label?: string;
}

export class Season extends Entity<SeasonProps, string> {
    private constructor(props: SeasonProps, id?: Identifier<string>) {
        super(props, id);
    }

    static create(props: SeasonProps, id?: Identifier<string>): Result<Season> {
        const guards = [
            Guard.againstNullOrUndefined(props.year, 'year'),
            Guard.inRange(props.year, 1800, 9999, 'year'),
        ];

        const guardResult = Guard.combine(guards);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error';
            return Result.fail(error);
        }

        const season = new Season(props, id);
        return Result.ok(season);
    }

    get year(): number {
        return this.props.year;
    }

    get label(): Maybe<string> {
        return Maybe.fromUndefined(this.props.label);
    }
}
