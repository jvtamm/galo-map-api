// import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';

import container from '@infra/ioc';

import BaseController from '@infra/http/express/contracts/base-controller';
import { TYPES } from '@config/ioc/types';
import { ISeasonService } from '@modules/matches/usecases/season';
// import { } from '@modules/matches/usecases/season/list';

export class ListSeasonController extends BaseController {
    private _seasonService: ISeasonService = container.get(TYPES.SeasonService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const result = await this._seasonService.list();

        if (result.failure) {
            const { error } = result;

            return this.fail(res, error as string);
        }

        return this.ok(res, result.value);
    }
}
