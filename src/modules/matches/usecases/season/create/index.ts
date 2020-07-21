import { SeasonDTO, SeasonMap } from '@modules/matches/mappers/season-map';
import Result from '@core/result';
import { UseCase } from '@core/usecase';
import { SeasonRepo } from '@modules/matches/repos/season-repo';
import { Season } from '@modules/matches/domain/season';
import { CreateSeasonDTO } from './dto';
import { CreateSeasonErrors } from './errors';

export type CreateSeasonResponse = Result<SeasonDTO>;

export class CreateSeason implements UseCase<CreateSeasonDTO, CreateSeasonResponse> {
    constructor(
        private _seasonRepo: SeasonRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: CreateSeasonDTO): Promise<CreateSeasonResponse> {
        const { year } = request;

        if (!year) return Result.fail(CreateSeasonErrors.MandatoryYear);

        try {
            const exists = await this._seasonRepo.exists(year);
            if (exists) return Result.fail(CreateSeasonErrors.AlreadyExists);

            const season = Season.create({
                year,
                label: request.label || year.toString(),
            });

            if (season.failure) {
                return Result.fail(season.error as string);
            }

            const persistedSeason = await this._seasonRepo.save(season.value);

            return Result.ok(SeasonMap.toDTO(persistedSeason));
        } catch (e) {
            console.log(e.toString());
            return Result.fail(CreateSeasonErrors.UnexpectedError);
        }
    }
}

export * from './dto';
export * from './errors';
