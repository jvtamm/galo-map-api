// import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';

import container from '@infra/ioc';

import BaseController from '@infra/http/express/contracts/base-controller';
import { TYPES } from '@config/ioc/types';
import { ICountryService } from '@modules/location/usecases/country';
import { CreateCountryDTO } from '@modules/location/usecases/country/create';

export class CreateCountryController extends BaseController {
    private _countryService: ICountryService = container.get(TYPES.CountryService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: CreateCountryDTO = req.body as CreateCountryDTO;

        const result = await this._countryService.create(dto);

        return result.fold(
            (error: string) => this.conflict(res, error),
            () => this.created(res),
        );
    }
}

export default CreateCountryController;
