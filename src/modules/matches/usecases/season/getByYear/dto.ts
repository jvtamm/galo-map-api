import { SeasonDTO } from '@modules/matches/mappers/season-map';

export interface GetSeasonByYearDTO {
    year: number;
    range?: number;
}

export interface GetSeasonByYearResponseDTO {
    season: SeasonDTO;
    previous?: SeasonDTO;
    next?: SeasonDTO;
}
