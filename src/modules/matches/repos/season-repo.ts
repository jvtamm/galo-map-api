import Maybe from '@core/maybe';

import { Season } from '@modules/matches/domain/season';

export interface SeasonRepo {
    list(): Promise<Season[]>
    exists(year: number): Promise<boolean>;
    getByYear(year: number): Promise<Maybe<Season>>;
    save(season: Season): Promise<Season>;
}
