import { injectable, inject } from 'inversify';

import TYPES from '@config/ioc/types';
import { ContractRepo } from '@modules/club/repos/contract-repo';
import { IPlayerService } from '@modules/club/usecases/player';
import { ITeamService } from '@modules/club/usecases/team';

import { GetContractByPeriodDTO, GetContractByPeriodResponse, GetContractByPeriod } from './get-by-period';
import { RegisterContract, RegisterContractDTO, RegisterContractResponse } from './register-contract';

export interface IContractService {
    getContractByPeriod(request: GetContractByPeriodDTO): Promise<GetContractByPeriodResponse>;
    registerContract(request: RegisterContractDTO): Promise<RegisterContractResponse>;
}

@injectable()
export class ContractService implements IContractService {
    @inject(TYPES.ContractRepo) private _contractRepo!: ContractRepo;

    @inject(TYPES.PlayerService) private _playerService!: IPlayerService;

    @inject(TYPES.TeamService) private _teamService!: ITeamService;

    getContractByPeriod(request: GetContractByPeriodDTO): Promise<GetContractByPeriodResponse> {
        const getContractByPeriod = new GetContractByPeriod(this._contractRepo);

        return getContractByPeriod.execute(request);
    }

    registerContract(request: RegisterContractDTO): Promise<RegisterContractResponse> {
        const registerContract = new RegisterContract(this._contractRepo, this._teamService, this._playerService);

        return registerContract.execute(request);
    }
}
