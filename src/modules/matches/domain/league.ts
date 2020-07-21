import Entity from '@core/entity';
import Identifier from '@core/identifier';
import Result from '@core/result';
import { Guard } from '@core/guard';
import Maybe from '@core/maybe';

export interface LeagueProps {
    name: string;
    organizedBy?: string;
}

export class League extends Entity<LeagueProps, string> {
    private constructor(props: LeagueProps, id?: Identifier<string>) {
        super(props, id);
    }

    static create(props: LeagueProps, id?: Identifier<string>): Result<League> {
        const guardedProps = [
            { argument: props.name, argumentName: 'name' },
        ];

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error';
            return Result.fail<League>(error);
        }

        const league = new League(props, id);
        return Result.ok(league);
    }

    get name(): string {
        return this.props.name;
    }

    get organizer(): Maybe<string> {
        return Maybe.fromUndefined(this.props.organizedBy);
    }
}
