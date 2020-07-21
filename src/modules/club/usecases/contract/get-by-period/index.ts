import Result from '@core/result';
import { ContractDTO, ContractMap } from '@modules/club/mapper/contract-map';
import { ContractRepo } from '@modules/club/repos/contract-repo';
import { UseCase } from '@core/usecase';

import { GetContractByPeriodErrors } from './errors';
import { GetContractByPeriodDTO } from './dto';

type Errors = GetContractByPeriodErrors.TeamIdMandatory |
    GetContractByPeriodErrors.StartingDateMandatory |
    string;

export type GetContractByPeriodResponse = Result<Errors | ContractDTO[]>

export class GetContractByPeriod implements UseCase<GetContractByPeriodDTO, GetContractByPeriodResponse> {
    // eslint-disable-next-line no-empty-function
    constructor(private _contractRepo: ContractRepo) {}

    async execute(request: GetContractByPeriodDTO): Promise<GetContractByPeriodResponse> {
        const { teamId } = request;

        if (!teamId) return Result.fail<ContractDTO[]>(GetContractByPeriodErrors.TeamIdMandatory);
        if (!request.startingDate) return Result.fail<ContractDTO[]>(GetContractByPeriodErrors.StartingDateMandatory);

        // Maybe limit range of search
        const startingDate = new Date(request.startingDate);
        const endingDate = request.endingDate ? new Date(request.endingDate) : new Date();

        const contracts = await this._contractRepo.getByPeriod(teamId, startingDate, endingDate);
        const dto = contracts.map(ContractMap.toDTO);

        return Result.ok<ContractDTO[]>(dto);
    }
}

export * from './dto';
export * from './errors';
