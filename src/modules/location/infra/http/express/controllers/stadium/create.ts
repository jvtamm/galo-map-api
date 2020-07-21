// import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';

import container from '@infra/ioc';

import BaseController from '@infra/http/express/contracts/base-controller';
import { TYPES } from '@config/ioc/types';
import { IStadiumService } from '@modules/location/usecases/stadium';
import { CreateStadiumDTO, CreateStadiumErrors } from '@modules/location/usecases/stadium/create';

export class CreateStadiumController extends BaseController {
    private _stadiumService: IStadiumService = container.get(TYPES.StadiumService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: CreateStadiumDTO = req.body as CreateStadiumDTO;

        const result = await this._stadiumService.create(dto);

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case CreateStadiumErrors.AlreadyExists:
                    return this.conflict(res, error);
                case CreateStadiumErrors.CountryNotSupported:
                    return this.notFound(res, error);
                case CreateStadiumErrors.CoordinatesNotfound:
                    return this.notFound(res, error);
                case CreateStadiumErrors.ScrapingFailed:
                    return this.clientError(res, error);
                case CreateStadiumErrors.NameMandatory:
                    return this.clientError(res, error);
                default:
                    return this.fail(res, error as string);
            }
        }
        return this.created(res);
    }
}
