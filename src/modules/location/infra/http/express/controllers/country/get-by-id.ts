import { Request, Response } from 'express';

import BaseController from '@infra/http/express/contracts/base-controller';
import { CountryDTO } from '@modules/location/mapper/country-map';
import container from '@infra/ioc';
import { GetCountryByIdDTO, GetCountryByIdErrors } from '@modules/location/usecases/country/get-by-id';
import { ICountryService } from '@modules/location/usecases/country';
import { TYPES } from '@config/ioc/types';

export class GetCountryByIdController extends BaseController {
    private _countryService: ICountryService = container.get(TYPES.CountryService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: GetCountryByIdDTO = {
            id: req.params.id,
        };

        const result = await this._countryService.getById(dto);

        return result.fold(
            (error: string) => {
                switch (error) {
                    case GetCountryByIdErrors.NotFound:
                        return this.notFound(res, error);
                    default:
                        return this.fail(res, error);
                }
            },
            (country: CountryDTO) => this.ok<CountryDTO>(res, country),
        );
    }
}

export default GetCountryByIdController;
