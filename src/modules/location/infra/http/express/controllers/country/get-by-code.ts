import { Request, Response } from 'express';

import BaseController from '@infra/http/express/contracts/base-controller';
import container from '@infra/ioc';
import { GetCountryByCodeDTO, GetCountryByCodeErrors } from '@modules/location/usecases/country/get-by-code';
import { ICountryService } from '@modules/location/usecases/country';
import { TYPES } from '@config/ioc/types';

export class GetContractsByPeriodController extends BaseController {
    private _countryServices: ICountryService = container.get(TYPES.CountryService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const { code } = req.query;
        const dto: GetCountryByCodeDTO = {
            code: code as string,
        };

        const result = await this._countryServices.getByCode(dto);

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case GetCountryByCodeErrors.CodeMandatory:
                    return this.clientError(res, error);
                case GetCountryByCodeErrors.NotFound:
                    return this.notFound(res, error);
                default:
                    return this.fail(res, error as string);
            }
        }
        return this.ok<any>(res, result.value);
    }
}

export default GetContractsByPeriodController;
