import Identifier from '@core/identifier';
import Result from '@core/result';
import { FixtureMap } from '@modules/matches/mappers/fixture-map';
import {
    FixtureProps, FixtureTeam, Fixture, FixtureStatusOptions,
} from '@modules/matches/domain/fixture';
import { FixtureRepo } from '@modules/matches/repos/fixture-repo';
import { ILeagueService } from '@modules/matches/usecases/league';
import { IStadiumService } from '@modules/location/usecases/stadium';
import { ITeamService } from '@modules/club/usecases/team';
import { League } from '@modules/matches/domain/league';
import { LeagueEdition } from '@modules/matches/domain/league-edition';
import { RefDTO, ExternalReferenceFactory } from '@modules/club/domain/external-references';
import { Season } from '@modules/matches/domain/season';
import { Stadium } from '@modules/matches/domain/stadium';
import { Team } from '@modules/matches/domain/team';
import { TeamDTO } from '@modules/club/mapper/team-map';
import { UseCase } from '@core/usecase';

import { CreateFixtureDTO, Tournament } from './dto';
import { CreateFixtureErrors } from './errors';

interface Validation<T> {
    hasError: (value: T) => Boolean,
    error: string
}

interface ValidationMap<T> {
    [key: string ]: Validation<T>
}

export type CreateFixtureResponse = Result<any>;

export class CreateFixture implements UseCase<CreateFixtureDTO, CreateFixtureResponse> {
    constructor(
        private _fixtureRepo: FixtureRepo,
        private _teamServices: ITeamService,
        private _groundServices: IStadiumService,
        private _leagueServices: ILeagueService,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: CreateFixtureDTO): Promise<CreateFixtureResponse> {
        const validatedRequest = this.validateRequest(request);
        if (validatedRequest.failure) return Result.fail(validatedRequest.error as string);

        const requestValidValues = validatedRequest.value;

        const homeTeamResult = await this.getTeam(requestValidValues.homeTeam, CreateFixtureErrors.HomeTeamNotFound);
        if (homeTeamResult.failure) return Result.fail(homeTeamResult.error as string);

        const awayTeamResult = await this.getTeam(requestValidValues.awayTeam, CreateFixtureErrors.HomeTeamNotFound);
        if (awayTeamResult.failure) return Result.fail(awayTeamResult.error as string);

        const exists = await this._fixtureRepo.exists(
            homeTeamResult.value,
            awayTeamResult.value,
            new Date(request.matchDate),
        );
        if (exists) return Result.fail(CreateFixtureErrors.AlreadyExists);

        const stadiumResult = await this.getStadium(request.ground);
        if (stadiumResult.failure) return Result.fail(stadiumResult.error as string);

        const leagueEditionResult = await this.resolveLeagueEdition(request.league);
        if (leagueEditionResult.failure) return Result.fail(CreateFixtureErrors.TournamentNotFound);

        const references = ExternalReferenceFactory.fromDTO(request.externalReferences);
        if (!references.length) return Result.fail(CreateFixtureErrors.ProviderNotSupported);

        const props: FixtureProps = {
            status: FixtureStatusOptions.NotStarted,
            league: leagueEditionResult.value,
            round: request.round,
            homeTeam: homeTeamResult.value,
            awayTeam: awayTeamResult.value,
            ground: stadiumResult.value,
            matchDate: new Date(request.matchDate),
            refs: references,
            ...request.referee && { referee: request.referee },
        };

        const fixture = Fixture.create(props);
        if (fixture.failure) return Result.fail(fixture.error as string);

        await this._fixtureRepo.save(fixture.value);

        return Result.ok(FixtureMap.toDTO(fixture.value));
    }

    async resolveLeagueEdition({ name, year } : Tournament): Promise<Result<LeagueEdition>> {
        let leagueEditionResult = await this._leagueServices.getLeagueEdition({ league: name, season: year });

        if (leagueEditionResult.failure) {
            leagueEditionResult = await this._leagueServices.addLeagueEdition({ league: name, season: year });
            if (leagueEditionResult.failure) return Result.fail<LeagueEdition>(leagueEditionResult.error as string);
        }

        const { value } = leagueEditionResult;
        const props = {
            league: League.create(value.league, new Identifier<string>(value.league.id as string)).value,
            season: Season.create(value.season, new Identifier<string>(value.season.id as string)).value,
            ...value.startingDate && { startingDate: new Date(value.startingDate) },
            ...value.endingDate && { endingDate: new Date(value.endingDate) },
        };

        return LeagueEdition.create(props, new Identifier<string>(value.id as string));
    }

    async getTeam(teamReference: RefDTO, defaultError: string): Promise<Result<FixtureTeam>> {
        const eitherTeam = await this._teamServices.getByReference({ externalReferences: teamReference });

        if (!eitherTeam.isSuccess()) {
            return Result.fail<FixtureTeam>(defaultError);
        }

        const team = eitherTeam.join() as TeamDTO;

        const teamProps = {
            name: team.name,
            abbreviation: team.abbreviation as string,
            country: team.country.code,
            displayName: team.displayName,
        };

        const matchTeam = Team.create(teamProps, team.id);
        if (matchTeam.failure) return Result.fail<FixtureTeam>(matchTeam.error as string);

        // Dynamically get current position in the future
        return Result.ok({
            team: matchTeam.value,
            score: 0,
        } as FixtureTeam);
    }

    async getStadium(name: string): Promise<Result<Stadium>> {
        let stadiumResult = await this._groundServices.getStadiumByName({ name });

        if (stadiumResult.failure) {
            stadiumResult = await this._groundServices.create({ name });
            if (stadiumResult.failure) return Result.fail<Stadium>(CreateFixtureErrors.StadiumNotFound);
        }

        const stadium: Stadium = {
            name: stadiumResult.value.name,
            coordinates: stadiumResult.value.coordinates,
            ...stadiumResult.value.nickname && { nickname: stadiumResult.value.nickname },
        };

        return Result.ok(stadium);
    }

    // eslint-disable-next-line class-methods-use-this
    validateRequest(request: CreateFixtureDTO) {
        const errorsMap: ValidationMap<typeof request> = {
            league: {
                hasError: ({ league }: CreateFixtureDTO) => (!league || !league.year || !league.name),
                error: CreateFixtureErrors.LeagueMandatory,
            },
            round: {
                hasError: ({ round }: CreateFixtureDTO) => !round,
                error: CreateFixtureErrors.RoundMandatory,
            },
            ground: {
                hasError: ({ ground }: CreateFixtureDTO) => !ground,
                error: CreateFixtureErrors.GroundMandatory,
            },
            matchDate: {
                hasError: ({ matchDate }: CreateFixtureDTO) => !matchDate,
                error: CreateFixtureErrors.MatchDateMandatory,
            },
            externalReferences: {
                hasError: ({ externalReferences }: CreateFixtureDTO) => !externalReferences,
                error: CreateFixtureErrors.ReferencesMandatory,
            },
        };

        const keys = Object.keys(errorsMap);
        for (let i = 0; i < keys.length; i += 1) {
            const key = keys[i];
            const { hasError, error } = errorsMap[key];

            if (hasError(request)) {
                return Result.fail<CreateFixtureDTO>(error);
            }
        }

        return Result.ok(request);
    }
}

export * from './dto';
export * from './errors';
