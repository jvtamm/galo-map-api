import Entity from '@core/entity';
import Identifier from '@core/identifier';
import Result from '@core/result';
import { Guard } from '@core/guard';

import Maybe from '@core/maybe';
import { League } from './league';
import { Season } from './season';

export interface LeagueEditionProps {
    league: League;
    season: Season;
    startingDate?: Date;
    endingDate?: Date;
}

export class LeagueEdition extends Entity<LeagueEditionProps, string> {
    private constructor(props: LeagueEditionProps, id?: Identifier<string>) {
        super(props, id);
    }

    static create(props: LeagueEditionProps, id?: Identifier<string>): Result<LeagueEdition> {
        const guardedProps = [
            { argument: props.league, argumentName: 'league' },
            { argument: props.season, argumentName: 'season' },
            // { argument: props.startingDate, argumentName: 'startingDate' },
            // { argument: props.endingDate, argumentName: 'endingDate' },
        ];

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error';
            return Result.fail<LeagueEdition>(error);
        }

        if (props.startingDate && props.season.year !== props.startingDate.getFullYear()) {
            return Result.fail('Starting date must be within season year');
        }

        if (props.startingDate && props.endingDate && props.startingDate > props.endingDate) {
            return Result.fail('Starting date cannot be after ending date');
        }

        const leagueEdition = new LeagueEdition(props, id);
        return Result.ok(leagueEdition);
    }

    isWithinPeriod(date: Date): boolean {
        if (!this.props.startingDate || !this.props.endingDate) return true;

        return date >= this.props.startingDate && date <= this.props.endingDate;
    }

    get league(): League {
        return this.props.league;
    }

    get season(): Season {
        return this.props.season;
    }

    get startingDate(): Maybe<Date> {
        return Maybe.fromUndefined(this.props.startingDate);
    }

    get endingDate(): Maybe<Date> {
        return Maybe.fromUndefined(this.props.endingDate);
    }
}
