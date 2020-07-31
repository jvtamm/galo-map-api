import { Fixture, FixtureTeam } from '@modules/matches/domain/fixture';
import Maybe from '@core/maybe';

export interface FixtureFilters {
    year?: number;
}

export interface FixtureRepo {
    exists(homeTeam: FixtureTeam, awayTeam: FixtureTeam, matchDate: Date): Promise<boolean>;
    getById(id: string): Promise<Maybe<Fixture>>;
    save(fixture: Fixture): Promise<Fixture>;
    search(filters: FixtureFilters): Promise<Fixture[]>
}
