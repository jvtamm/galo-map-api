import Maybe from '@core/maybe';

import { Team } from '@modules/club/domain/team';

export interface TeamRepo {
    getTeamById (teamId: string | number): Promise<Maybe<Team>>;
    getTeamByRef (refs: Array<string | number>): Promise<Maybe<Team>>;
    // exists (countryId: Identifier<string | number>): Promise<boolean>;
    save(team: Team): Promise<string>;
}
