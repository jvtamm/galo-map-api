import { SeasonDTO } from '@modules/matches/mappers/season-map';

export interface ListSeasonsResponseDTO {
    seasons: SeasonDTO[];
    current: SeasonDTO;
}
