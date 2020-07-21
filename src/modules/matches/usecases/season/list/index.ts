import Result from '@core/result';
import { SeasonDTO, SeasonMap } from '@modules/matches/mappers/season-map';
import { UseCase } from '@core/usecase';
import { SeasonRepo } from '@modules/matches/repos/season-repo';
import { ListSeasonsErrors } from './errors';

export type ListSeasonsResponse = Result<SeasonDTO[]>;

export class ListSeasons implements UseCase<void, ListSeasonsResponse> {
    constructor(
        private _seasonRepo: SeasonRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(): Promise<ListSeasonsResponse> {
        try {
            const seasons = await this._seasonRepo.list();
            const response: SeasonDTO[] = seasons.map(SeasonMap.toDTO);

            return Result.ok<SeasonDTO[]>(response);
        } catch (e) {
            console.log(e);
            return Result.fail(ListSeasonsErrors.UnexpectedError);
        }
    }
}
