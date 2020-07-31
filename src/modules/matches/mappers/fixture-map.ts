import { ObjectId } from 'mongodb';

import Identifier from '@core/identifier';
import { Fixture, FixtureStatus } from '@modules/matches/domain/fixture';
import { FixtureCollection } from '@modules/matches/repos/implementations/mongo-fixture-repo';
import { FixtureDetails } from '@modules/matches/domain/fixture-details';
import { Refs, ExternalReferenceFactory } from '@modules/club/domain/external-references';
import { Stadium } from '@modules/matches/domain/stadium';
import { StaticMapper } from '@infra/contracts/mapper';

import { StadiumMap } from './stadium-map';
import { TeamMap, TeamDTO } from './team-map';
import { LeagueEditionMap, toEmbeddedLeagueEdition, LeagueEditionDTO } from './league-edition-map';
import { FixtureDetailsMap, FixtureDetailsDTO } from './fixture-details-map';

interface FixtureTeamDTO {
    team: TeamDTO;
    score: number;
    currentPosition?: number;
}

export interface TournamentDTO {
    id: string;
    name: string;
    season: number;
}

export interface FixtureDTO {
    id: string;
    tournament: TournamentDTO;
    round: string;
    matchDate: string;
    ground: Stadium;
    homeTeam: FixtureTeamDTO;
    awayTeam: FixtureTeamDTO;
    status: FixtureStatus;
    winner: string;
    referee: string;
    details: FixtureDetailsDTO;
}

export const FixtureMap: StaticMapper<Fixture, FixtureCollection> = {
    toDomain: (raw: any) => {
        const _id = raw._id ? new Identifier<string>(raw._id.toString()) : undefined;

        const homeTeam = {
            team: TeamMap.toDomain(raw.homeTeam.team),
            score: raw.homeTeam.score,
            ...raw.homeTeam.currentPosition && { currentPosition: raw.homeTeam.currentPosition },
        };

        const awayTeam = {
            team: TeamMap.toDomain(raw.awayTeam.team),
            score: raw.awayTeam.score,
            ...raw.awayTeam.currentPosition && { currentPosition: raw.awayTeam.currentPosition },
        };

        const props = {
            league: LeagueEditionMap.toDomain(raw.leagueEdition),
            // league: raw.leagueEdition,
            round: raw.round,
            status: raw.status,
            matchDate: new Date(raw.matchDate),
            refs: raw.externalReferences.map((ref: Refs) => ExternalReferenceFactory.create(ref)),
            ground: StadiumMap.toDomain(raw.ground),
            homeTeam,
            awayTeam,
            ...raw.referee && { referee: raw.referee },
            ...raw.details && { details: raw.details },
        };

        const fixture = Fixture.create(props, _id);
        return fixture.value;
    },

    toPersistance: (fixture: Fixture) => {
        const _id = new ObjectId();
        const maybeId = fixture.id
            .fold<ObjectId>(_id)((value) => new ObjectId(value as string));

        const homeTeam = {
            team: TeamMap.toPersistance(fixture.homeTeam.team),
            score: fixture.homeTeam.score,
            ...fixture.homeTeam.currentPosition && { currentPosition: fixture.homeTeam.currentPosition },
        };

        const awayTeam = {
            team: TeamMap.toPersistance(fixture.awayTeam.team),
            score: fixture.awayTeam.score,
            ...fixture.awayTeam.currentPosition && { currentPosition: fixture.awayTeam.currentPosition },
        };

        const maybeReferee = fixture.referee.fold<string | null>(null)((referee) => referee as string);

        return {
            leagueEdition: toEmbeddedLeagueEdition(fixture.league),
            round: fixture.round,
            matchDate: fixture.matchDate,
            externalReferences: fixture.refs,
            status: fixture.status,
            ground: StadiumMap.toPersistance(fixture.ground),
            homeTeam,
            awayTeam,
            ...maybeId && { _id: maybeId },
            ...maybeReferee && { referee: maybeReferee },
        };
    },

    toDTO: (fixture: Fixture) => {
        const maybeWinner = fixture.winner;

        let winner = null;
        if (maybeWinner.isSome()) {
            winner = maybeWinner.join().id.fold('')((id) => id as string);
        }

        const homeTeam = {
            team: TeamMap.toDTO(fixture.homeTeam.team),
            score: fixture.homeTeam.score,
            ...fixture.homeTeam.currentPosition && { currentPosition: fixture.homeTeam.currentPosition },
        };

        const awayTeam = {
            team: TeamMap.toDTO(fixture.awayTeam.team),
            score: fixture.awayTeam.score,
            ...fixture.awayTeam.currentPosition && { currentPosition: fixture.awayTeam.currentPosition },
        };

        const maybeDetails = fixture.details.fold<undefined | FixtureDetails>(undefined)((value) => value as FixtureDetails);

        const edition: LeagueEditionDTO = LeagueEditionMap.toDTO(fixture.league);

        return {
            id: fixture.id.fold('')((id) => id as string),
            tournament: {
                id: edition.id,
                name: edition.league.name,
                season: edition.season.year,
            },
            round: fixture.round,
            matchDate: fixture.matchDate.toISOString(),
            ground: fixture.ground,
            status: fixture.status,
            referee: fixture.referee.fold('')((ref) => ref as string),
            homeTeam,
            awayTeam,
            ...winner && { winner },
            ...maybeDetails && { details: FixtureDetailsMap.toDTO(maybeDetails) },
        } as FixtureDTO;
    },
};
