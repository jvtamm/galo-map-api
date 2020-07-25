import Result from '@core/result';
import { SeasonDTO, SeasonMap } from '@modules/matches/mappers/season-map';
import { SeasonRepo } from '@modules/matches/repos/season-repo';
import { UseCase } from '@core/usecase';

import { GetSeasonByYearDTO, GetSeasonByYearResponseDTO } from './dto';
import { GetSeasonByYearErrors } from './errors';

export type GetSeasonByYearResponse = Result<GetSeasonByYearResponseDTO>;

export class GetSeasonByYear implements UseCase<GetSeasonByYearDTO, GetSeasonByYearResponse> {
    constructor(
        private _seasonRepo: SeasonRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: GetSeasonByYearDTO): Promise<GetSeasonByYearResponse> {
        const { year, range } = request;

        if (!year) return Result.fail(GetSeasonByYearErrors.MandatoryYear);

        try {
            const maybeSeason = await this._seasonRepo.getByYear(year);
            if (!maybeSeason.isSome()) return Result.fail(GetSeasonByYearErrors.NotFound);

            const season = maybeSeason.join();

            const { next, previous } = await this._seasonRepo.getRange(year, range);

            const response: GetSeasonByYearResponseDTO = {
                season: SeasonMap.toDTO(season) as SeasonDTO,
                ...next.length && { next: SeasonMap.toDTO(next[0]) },
                ...previous.length && { previous: SeasonMap.toDTO(previous[0]) },
            };

            return Result.ok<GetSeasonByYearResponseDTO>(response);
        } catch (error) {
            console.log(error.toString());
            return Result.fail(GetSeasonByYearErrors.UnexpectedError);
        }
    }
}

export * from './dto';
export * from './errors';
