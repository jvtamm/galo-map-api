import Maybe from '@core/maybe';

import { Player } from '@modules/club/domain/player';
import { ExternalReference } from '@modules/club/domain/external-references';

export interface PlayerRepo {
    getPlayerById (playerId: string | number): Promise<Maybe<Player>>;
    getPlayerByRef (refs: Array<string | number>): Promise<Maybe<Player>>;
    getBulk(refs: ExternalReference[]): Promise<Player[]>;
    save(team: Player): Promise<string>;
}
