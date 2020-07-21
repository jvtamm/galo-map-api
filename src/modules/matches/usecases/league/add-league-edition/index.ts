import Identifier from '@core/identifier';
import Result from '@core/result';
import { ILeagueService } from '@modules/matches/usecases/league';
import { ISeasonService } from '@modules/matches/usecases/season';
import { League, LeagueProps } from '@modules/matches/domain/league';
import { LeagueEditionDTO, LeagueEditionMap } from '@modules/matches/mappers/league-edition-map';
import { LeagueEditionProps, LeagueEdition } from '@modules/matches/domain/league-edition';
import { LeagueEditionRepo } from '@modules/matches/repos/league-edition';
import { LeagueRepo } from '@modules/matches/repos/league-repo';
import { Season } from '@modules/matches/domain/season';
import { UseCase } from '@core/usecase';

import { AddLeagueEditionDTO } from './dto';
import { AddLeagueEditionErrors } from './errors';

export type AddLeagueEditionResponse = Result<LeagueEditionDTO>;

export class AddLeagueEdition implements UseCase<AddLeagueEditionDTO, AddLeagueEditionResponse> {
    constructor(
        private _leagueEditionRepo: LeagueEditionRepo,
        private _leagueRepo: LeagueRepo,
        private _leagueService: ILeagueService,
        private _seasonService: ISeasonService,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: AddLeagueEditionDTO): Promise<AddLeagueEditionResponse> {
        if (!request.league) return Result.fail(AddLeagueEditionErrors.MandatoryLeague);
        if (!request.season) return Result.fail(AddLeagueEditionErrors.MandatorySeason);

        try {
            const exists = await this._leagueEditionRepo.exists(request.league, request.season);
            if (exists) return Result.fail(AddLeagueEditionErrors.AlreadyExists);

            const season = await this.getSeason(request.season);
            if (season.failure) return Result.fail(season.error as string);

            const league = await this.getLeague(request.league);
            if (league.failure) return Result.fail(season.error as string);

            const leagueEditionProps: LeagueEditionProps = {
                season: season.value,
                league: league.value,
                ...request.startingDate && { startingDate: new Date(request.startingDate) },
                ...request.endingDate && { endingDate: new Date(request.endingDate) },
            };

            const leagueEdition = LeagueEdition.create(leagueEditionProps);
            if (leagueEdition.failure) return Result.fail(leagueEdition.error as string);

            const persistedLeagueEdition = await this._leagueEditionRepo.save(leagueEdition.value);

            return Result.ok(LeagueEditionMap.toDTO(persistedLeagueEdition));
        } catch (error) {
            console.log(error.toString());
            return Result.fail(AddLeagueEditionErrors.UnexpectedError);
        }
    }

    private async getSeason(year: number): Promise<Result<Season>> {
        let seasonResult = await this._seasonService.getByYear({ year });

        if (seasonResult.failure) {
            seasonResult = await this._seasonService.create({ year });
            if (seasonResult.failure) return Result.fail(seasonResult.error as string);
        }

        const { value } = seasonResult;
        const props = {
            year: value.year,
            ...value.label && { label: value.label },
        };

        return Season.create(props, new Identifier<string>(value.id as string));
    }

    private async getLeague(name: string): Promise<Result<League>> {
        const league = await this._leagueRepo.getByName(name);

        if (league.isSome()) {
            return Result.ok(league.join());
        }

        const createdLeague = await this._leagueService.create({ name });
        if (createdLeague.failure) {
            return Result.fail(createdLeague.error as string);
        }

        const { value } = createdLeague;
        const props: LeagueProps = {
            name: value.name,
            ...value.organizedBy && { organizedBy: value.organizedBy },
        };

        return League.create(props, new Identifier(value.id as string));
    }
}

export * from './dto';
export * from './errors';
