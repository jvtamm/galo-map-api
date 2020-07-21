import Maybe from '@core/maybe';

import { Squad } from '@modules/club/domain/squad';

export interface SquadRepo {
    getSquadByTeam (squadId: string | number): Promise<Maybe<Squad>>;
    save(squad: Squad): Promise<string>;
    // getTeamByRef (refs: Array<string | number>): Promise<Maybe<Squad>>;
    // exists (countryId: Identifier<string | number>): Promise<boolean>;
}
