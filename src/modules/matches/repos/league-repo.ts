import Maybe from '@core/maybe';

import { League } from '../domain/league';

export interface LeagueRepo {
    exists(name: string): Promise<boolean>;
    // getById(id: string): Promise<Maybe<League>>;
    getByName(name: string): Promise<Maybe<League>>;
    getByOrganizer(organizer: string): Promise<League[]>;
    save(league: League): Promise<League>;
}
