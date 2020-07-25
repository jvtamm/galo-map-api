import Maybe from '@core/maybe';

import { Season } from '@modules/matches/domain/season';

export interface SeasonRange {
    next: Season[];
    previous: Season[];
}

export interface SeasonRepo {
    list(): Promise<Season[]>
    exists(year: number): Promise<boolean>;
    getByYear(year: number): Promise<Maybe<Season>>;
    getRange(year: number, range?: number): Promise<SeasonRange>;
    save(season: Season): Promise<Season>;
}
