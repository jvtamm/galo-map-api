import Maybe from '@core/maybe';
import { LeagueEdition } from '@modules/matches/domain/league-edition';

export interface LeagueEditionRepo {
    exists(leagueName: string, seasonYear: number): Promise<boolean>;
    getById(id: string): Promise<Maybe<LeagueEdition>>;
    getByLeagueSeason(leagueName: string, seasonYear: number): Promise<Maybe<LeagueEdition>>;
    save(leagueEdition: LeagueEdition): Promise<LeagueEdition>;
}
