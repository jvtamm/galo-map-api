import Result from '@core/result';
import { LeagueEditionDTO, LeagueEditionMap } from '@modules/matches/mappers/league-edition-map';
import { UseCase } from '@core/usecase';
import { LeagueEditionRepo } from '@modules/matches/repos/league-edition';

import { GetLeagueEditionDTO } from './dto';
import { GetLeagueEditionErrors } from './errors';

export type GetLeagueEditionResponse = Result<LeagueEditionDTO>;

export class GetLeagueEdition implements UseCase<GetLeagueEditionDTO, GetLeagueEditionResponse> {
    constructor(
        private _leagueEditionRepo: LeagueEditionRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: GetLeagueEditionDTO): Promise<GetLeagueEditionResponse> {
        if (!request.league) return Result.fail(GetLeagueEditionErrors.MandatoryLeague);
        if (!request.season) return Result.fail(GetLeagueEditionErrors.MandatorySeason);

        try {
            const maybeLeagueEdition = await this._leagueEditionRepo.getByLeagueSeason(request.league, request.season);
            if (maybeLeagueEdition.isNone()) return Result.fail(GetLeagueEditionErrors.NotFound);

            return Result.ok(LeagueEditionMap.toDTO(maybeLeagueEdition.join()));
        } catch (error) {
            console.log(error.toString());
            return Result.fail(GetLeagueEditionErrors.UnexpectedError);
        }
    }
}
