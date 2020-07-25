// import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';

import container from '@infra/ioc';

import BaseController from '@infra/http/express/contracts/base-controller';
import { TYPES } from '@config/ioc/types';
import { ISeasonService } from '@modules/matches/usecases/season';
import { GetSeasonByYearDTO, GetSeasonByYearErrors } from '@modules/matches/usecases/season/getByYear';
// import { } from '@modules/matches/usecases/season/list';

export class GetSeasonByYearController extends BaseController {
    private _seasonService: ISeasonService = container.get(TYPES.SeasonService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const { year, range } = req.query;

        const dto: GetSeasonByYearDTO = {
            year: parseInt(year as string, 10),
            ...range && { range: parseInt(range as string, 10) },
        };

        const result = await this._seasonService.getByYear(dto);

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case GetSeasonByYearErrors.MandatoryYear:
                    return this.clientError(res, error);
                case GetSeasonByYearErrors.NotFound:
                    return this.notFound(res, error);
                default:
                    return this.fail(res, error as string);
            }
        }

        return this.ok(res, result.value);
    }
}
