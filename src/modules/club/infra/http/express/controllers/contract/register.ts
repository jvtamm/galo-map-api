import { Request, Response } from 'express';

import BaseController from '@infra/http/express/contracts/base-controller';
import container from '@infra/ioc';
import { RegisterContractDTO, RegisterContractErrors } from '@modules/club/usecases/contract/register-contract';
import { IContractService } from '@modules/club/usecases/contract';
import { TYPES } from '@config/ioc/types';

export class RegisterContractController extends BaseController {
    private _contractService: IContractService = container.get(TYPES.ContractService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: RegisterContractDTO = req.body as RegisterContractDTO;

        const result = await this._contractService.registerContract(dto);

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case RegisterContractErrors.PlayerNotFound:
                    return this.notFound(res, error);
                case RegisterContractErrors.TeamNotFound:
                    return this.notFound(res, error);
                case RegisterContractErrors.InvalidDates:
                    return this.clientError(res, error);
                default:
                    return this.fail(res, error);
            }
        }
        return this.ok<any>(res, { id: result.value });
    }
}

export default RegisterContractController;
