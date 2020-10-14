import Maybe from '@core/maybe';
import { ExternalReference } from '@modules/club/domain/external-references';
import { Fixture, FixtureTeam } from '@modules/matches/domain/fixture';

export interface FixtureFilters {
    year?: number;
}

export interface FixtureRepo {
    exists(homeTeam: FixtureTeam, awayTeam: FixtureTeam, matchDate: Date): Promise<boolean>;
    getById(id: string): Promise<Maybe<Fixture>>;
    getByReference(refs: ExternalReference[]): Promise<Maybe<Fixture>>;
    getFixturesPendingDetails(): Promise<Fixture[]>;
    save(fixture: Fixture): Promise<Fixture>;
    search(filters: FixtureFilters): Promise<Fixture[]>;
    getLast(): Promise<Maybe<Fixture>>;
}
