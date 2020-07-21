import Maybe from '@core/maybe';

import { Player } from '@modules/club/domain/player';

export interface PlayerRepo {
    getPlayerById (playerId: string | number): Promise<Maybe<Player>>;
    getPlayerByRef (refs: Array<string | number>): Promise<Maybe<Player>>;
    save(team: Player): Promise<string>;
}
