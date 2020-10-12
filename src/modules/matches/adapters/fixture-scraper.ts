import Result from '@core/result';
import { AddFixtureDetailsDTO } from '@modules/matches/usecases/fixtures/add-details';
import { CreateFixtureDTO } from '@modules/matches//usecases/fixtures/create';

export interface PaginationFrom {
    id: string | number;
    date: Date;
}

export interface FixtureInfo extends CreateFixtureDTO{
    status: string
    details?: AddFixtureDetailsDTO
}

export interface FixtureScraper {
    getFixtureDetails(reference: string | number): Promise<Result<AddFixtureDetailsDTO>>;
    getNextTeamMatches(team: string | number, from: PaginationFrom): Promise<Result<FixtureInfo[]>>
}
