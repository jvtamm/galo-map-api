import Entity from '@core/entity';
import Identifier from '@core/identifier';
import Maybe from '@core/maybe';
import Result from '@core/result';
import { ExternalReference, Refs } from '@modules/club/domain/external-references';
import { Guard } from '@core/guard';

import { FixtureDetails } from './fixture-details';
import { LeagueEdition } from './league-edition';
import { Stadium } from './stadium';
import { Team } from './team';

export interface FixtureTeam {
    team: Team;
    // calculate dynamically with events
    currentPosition?: number;
    score: number;
}

export enum FixtureStatusOptions {
    NotStarted = 'NS',
    MatchFinished = 'FT'
}

export type FixtureStatus = FixtureStatusOptions.NotStarted | FixtureStatusOptions.MatchFinished;

export interface FixtureProps {
    league: LeagueEdition;
    round: string;
    homeTeam: FixtureTeam;
    awayTeam: FixtureTeam;
    status: FixtureStatus;
    referee?: string;
    ground: Stadium;
    matchDate: Date;
    refs: ExternalReference[];
    details?: FixtureDetails;
}

export class Fixture extends Entity<FixtureProps, string> {
    private constructor(props: FixtureProps, id?: Identifier<string>) {
        super(props, id);
    }

    static create(props: FixtureProps, id?: Identifier<string>): Result<Fixture> {
        const guardedProps = [
            { argument: props.round, argumentName: 'round' },
            { argument: props.ground, argumentName: 'ground' },
            { argument: props.league, argumentName: 'league' },
            { argument: props.status, argumentName: 'status' },
            { argument: props.homeTeam, argumentName: 'homeTeam' },
            { argument: props.awayTeam, argumentName: 'awayTeam' },
            { argument: props.matchDate, argumentName: 'matchDate' },
        ];

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
        if (!guardResult.succeeded) {
            const error = guardResult.message || 'Unexpected error';
            return Result.fail<Fixture>(error);
        }

        if (!props.league.isWithinPeriod(props.matchDate)) {
            return Result.fail<Fixture>('Match date must be within league period.');
        }

        const fixture = new Fixture(props, id);
        return Result.ok(fixture);
    }

    get winner(): Maybe<Team> {
        const { homeTeam, awayTeam } = this.props;

        if (this.hasWinner()) {
            if (homeTeam.score > awayTeam.score) return Maybe.of(homeTeam.team);

            return Maybe.of(awayTeam.team);
        }

        return Maybe.none();
    }

    hasWinner(): boolean {
        return this.props.homeTeam.score !== this.props.awayTeam.score;
    }

    get league(): LeagueEdition {
        return this.props.league;
    }

    get round(): string {
        return this.props.round;
    }

    get homeTeam(): FixtureTeam {
        return this.props.homeTeam;
    }

    get awayTeam(): FixtureTeam {
        return this.props.awayTeam;
    }

    get referee(): Maybe<string> {
        return Maybe.fromUndefined(this.props.referee);
    }

    get ground(): Stadium {
        return this.props.ground;
    }

    get matchDate(): Date {
        return this.props.matchDate;
    }

    get refs(): Refs[] {
        return this.props.refs.map((ref) => ({
            provider: ref.getProvider(),
            ref: ref.serialize(),
        }));
    }

    get status(): FixtureStatus {
        return this.props.status;
    }

    get details(): Maybe<FixtureDetails> {
        return Maybe.fromUndefined(this.props.details);
    }
}
