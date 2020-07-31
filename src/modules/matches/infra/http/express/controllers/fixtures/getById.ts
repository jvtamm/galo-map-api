// import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';

import container from '@infra/ioc';

import BaseController from '@infra/http/express/contracts/base-controller';
import { TYPES } from '@config/ioc/types';
import { IFixtureService } from '@modules/matches/usecases/fixtures';
import { GetFixtureByIdDTO, GetFixtureByIdErrors } from '@modules/matches/usecases/fixtures/getById';

export class GetFixtureByIdController extends BaseController {
    private _fixtureService: IFixtureService = container.get(TYPES.FixtureService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const dto: GetFixtureByIdDTO = { id };

        const result = await this._fixtureService.getById(dto);

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case GetFixtureByIdErrors.MandatoryId:
                    return this.clientError(res, error);
                case GetFixtureByIdErrors.NotFound:
                    return this.notFound(res, error);
                default:
                    return this.fail(res, error as string);
            }
        }

        return this.ok<any>(res, result.value);
    }
}
