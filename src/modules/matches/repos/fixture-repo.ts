import { Fixture, FixtureTeam } from '@modules/matches/domain/fixture';

export interface FixtureFilters {
    year?: number;
}

export interface FixtureRepo {
    exists(homeTeam: FixtureTeam, awayTeam: FixtureTeam, matchDate: Date): Promise<boolean>;
    save(fixture: Fixture): Promise<Fixture>;
    search(filters: FixtureFilters): Promise<Fixture[]>
}
