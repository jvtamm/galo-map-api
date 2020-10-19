import Maybe from '@core/maybe';
import Result from '@core/result';
import { Guard } from '@core/guard';

export interface TeamProps {
    name: string;
    displayName: string;
    abbreviation: string;
    country: string;
}

export class Team {
    private constructor(
        private _props: TeamProps,
        private _id?: string,
    // eslint-disable-next-line no-empty-function
    ) {}

    static create(props: TeamProps, id?: string): Result<Team> {
        const guardedProps = [
            { argument: props.name, argumentName: 'name' },
            { argument: props.abbreviation, argumentName: 'abbreviation' },
            { argument: props.country, argumentName: 'country' },
        ];

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error';
            return Result.fail<Team>(error);
        }

        const team = new Team(props, id);

        return Result.ok(team);
    }

    get name(): string {
        return this._props.name;
    }

    get displayName(): string {
        if (this._props.country !== 'BRA' && !this._props.displayName.includes('-')) {
            return `${this._props.displayName}-${this._props.country}`;
        }

        return this._props.displayName;
    }

    get abbreviation(): string {
        return this._props.abbreviation;
    }

    get country(): string {
        return this._props.country;
    }

    get id(): Maybe<string> {
        return Maybe.fromUndefined(this._id);
    }
}
