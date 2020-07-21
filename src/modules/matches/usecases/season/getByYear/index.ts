import Result from '@core/result';
import { SeasonDTO, SeasonMap } from '@modules/matches/mappers/season-map';
import { SeasonRepo } from '@modules/matches/repos/season-repo';
import { UseCase } from '@core/usecase';

import { GetSeasonByYearDTO } from './dto';
import { GetSeasonByYearErrors } from './errors';

export type GetSeasonByYearResponse = Result<SeasonDTO>;

export class GetSeasonByYear implements UseCase<GetSeasonByYearDTO, GetSeasonByYearResponse> {
    constructor(
        private _seasonRepo: SeasonRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: GetSeasonByYearDTO): Promise<GetSeasonByYearResponse> {
        const { year } = request;

        if (!year) return Result.fail(GetSeasonByYearErrors.MandatoryYear);

        try {
            const maybeSeason = await this._seasonRepo.getByYear(year);
            if (!maybeSeason.isSome()) return Result.fail(GetSeasonByYearErrors.NotFound);

            const season = maybeSeason.join();
            return Result.ok<SeasonDTO>(SeasonMap.toDTO(season));
        } catch (error) {
            console.log(error.toString());
            return Result.fail(GetSeasonByYearErrors.UnexpectedError);
        }
    }
}

export * from './dto';
export * from './errors';
