import { Request, Response } from 'express';

import BaseController from '@infra/http/express/contracts/base-controller';
import container from '@infra/ioc';
import { GetCountryByCodeDTO, GetCountryByCodeErrors } from '@modules/location/usecases/country/get-by-code';
import { ICountryService } from '@modules/location/usecases/country';
import { TYPES } from '@config/ioc/types';
import { GetCountryByNameDTO, GetCountryByNameErrors } from '@modules/location/usecases/country/get-by-name';

export class GetCountryByQueryController extends BaseController {
    private _countryServices: ICountryService = container.get(TYPES.CountryService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const { code, name } = req.query;

        if (name) {
            return this.getByName({ name: name as string }, res);
        }

        return this.getByCode({ code: code as string }, res);
    }

    async getByCode(req: GetCountryByCodeDTO, res: Response): Promise<any> {
        const result = await this._countryServices.getByCode(req);

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

    async getByName(req: GetCountryByNameDTO, res: Response): Promise<any> {
        const result = await this._countryServices.getByName(req);

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case GetCountryByNameErrors.MandatoryName:
                    return this.clientError(res, error);
                case GetCountryByNameErrors.NotFound:
                    return this.notFound(res, error);
                default:
                    return this.fail(res, error as string);
            }
        }

        return this.ok<any>(res, result.value);
    }
}

export default GetCountryByQueryController;
