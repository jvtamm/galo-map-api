import Maybe from '@core/maybe';

import { Contract } from '@modules/club/domain/contract';

type id = string | number;

export interface ContractRepo {
    // getByTeamAndPlayer(teamId: id, playerId: id): Promise<Maybe<Contract[]>>;
    getByPeriod(teamId: id, startingDate: Date, endingDate?: Date): Promise<Contract[]>; // To be paginated
    getIncompleteContract(playerId: id, teamId: id, startingDate: Date): Promise<Maybe<Contract>>;
    getPlayerOpenContract(playerId: id, teamId: id, endingDate: Date): Promise<Maybe<Contract>>;
    save(team: Contract): Promise<Contract>;
}
