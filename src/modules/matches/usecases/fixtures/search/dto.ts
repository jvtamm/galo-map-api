import { FixtureDTO } from '@modules/matches/mappers/fixture-map';

export interface SearchFixturesDTO {
    year: number;
}

export interface SearchFixturesResponseDTO {
    year: number;
    fixtures: FixtureDTO[];
}
