import { Request, Response } from 'express';

import BaseController from '@infra/http/express/contracts/base-controller';
import container from '@infra/ioc';
import { GetContractByPeriodDTO, GetContractByPeriodErrors } from '@modules/club/usecases/contract/get-by-period';
import { IContractService } from '@modules/club/usecases/contract';
import { TYPES } from '@config/ioc/types';

export class GetContractsByPeriodController extends BaseController {
    private _contractService: IContractService = container.get(TYPES.ContractService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const { startingDate, teamId, endingDate } = req.query;
        const dto: GetContractByPeriodDTO = {
            startingDate,
            teamId,
            endingDate,
        } as GetContractByPeriodDTO;

        const result = await this._contractService.getContractByPeriod(dto);

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case GetContractByPeriodErrors.TeamIdMandatory:
                    return this.clientError(res, error);
                case GetContractByPeriodErrors.StartingDateMandatory:
                    return this.clientError(res, error);
                default:
                    return this.fail(res, error as string);
            }
        }
        return this.ok<any>(res, { data: result.value });
    }
}

export default GetContractsByPeriodController;
