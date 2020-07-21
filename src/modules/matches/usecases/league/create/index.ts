import Result from '@core/result';
import { League } from '@modules/matches/domain/league';
import { LeagueDTO, LeagueMap } from '@modules/matches/mappers/league-map';
import { LeagueRepo } from '@modules/matches/repos/league-repo';
import { UseCase } from '@core/usecase';

import { CreateLeagueDTO } from './dto';
import { CreateLeagueErrors } from './errors';

export type CreateLeagueResponse = Result<LeagueDTO>

export class CreateLeague implements UseCase<CreateLeagueDTO, CreateLeagueResponse> {
    constructor(
        private _leagueRepo: LeagueRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: CreateLeagueDTO): Promise<CreateLeagueResponse> {
        const { name } = request;

        if (!name) return Result.fail(CreateLeagueErrors.NameMandatory);

        try {
            const exists = await this._leagueRepo.exists(name);
            if (exists) return Result.fail(CreateLeagueErrors.AlreadyExists);

            const league = League.create({
                ...request.organizer && { organizedBy: request.organizer },
                name,
            });

            if (league.failure) {
                return Result.fail(league.error as string);
            }

            const persistedLeague = await this._leagueRepo.save(league.value);

            return Result.ok<LeagueDTO>(LeagueMap.toDTO(persistedLeague));
        } catch (e) {
            console.log(e.toString());
            return Result.fail(CreateLeagueErrors.UnexpectedError);
        }
    }
}

export * from './dto';
export * from './errors';
