import { injectable, inject } from 'inversify';

import TYPES from '@config/ioc/types';
import { SeasonRepo } from '@modules/matches/repos/season-repo';
import { CreateSeasonDTO, CreateSeasonResponse, CreateSeason } from './create';
import { GetSeasonByYearDTO, GetSeasonByYearResponse, GetSeasonByYear } from './getByYear';
import { ListSeasonsResponse, ListSeasons } from './list';

export interface ISeasonService {
    create(request: CreateSeasonDTO): Promise<CreateSeasonResponse>;
    getByYear(request: GetSeasonByYearDTO): Promise<GetSeasonByYearResponse>;
    list(): Promise<ListSeasonsResponse>;
}

@injectable()
export class SeasonService implements ISeasonService {
    constructor(
        @inject(TYPES.SeasonRepo) private _seasonRepo: SeasonRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    create(request: CreateSeasonDTO): Promise<CreateSeasonResponse> {
        const createSeason = new CreateSeason(this._seasonRepo);

        return createSeason.execute(request);
    }

    getByYear(request: GetSeasonByYearDTO): Promise<GetSeasonByYearResponse> {
        const getSeasonByYear = new GetSeasonByYear(this._seasonRepo);

        return getSeasonByYear.execute(request);
    }

    list(): Promise<ListSeasonsResponse> {
        const list = new ListSeasons(this._seasonRepo);

        return list.execute();
    }
}
