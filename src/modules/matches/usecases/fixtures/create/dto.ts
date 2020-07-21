import { RefDTO } from '@modules/club/domain/external-references';

export interface Tournament {
    name: string,
    year: number,
}

export interface CreateFixtureDTO {
    league: Tournament;
    round: string;
    homeTeam: RefDTO; // Refactor to make possible to create in case it doesn't exists
    awayTeam: RefDTO; // Refactor to make possible to create in case it doesn't exists
    referee?: string;
    ground: string;
    matchDate: string;
    externalReferences: RefDTO;
}
