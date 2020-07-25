// import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';

import container from '@infra/ioc';

import BaseController from '@infra/http/express/contracts/base-controller';
import { TYPES } from '@config/ioc/types';
import { IFixtureService } from '@modules/matches/usecases/fixtures';
import { SearchFixturesDTO, SearchFixturesErrors } from '@modules/matches/usecases/fixtures/search';

export class SearchFixturesController extends BaseController {
    private _fixtureService: IFixtureService = container.get(TYPES.FixtureService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const { year } = req.query;
        const dto: SearchFixturesDTO = {
            year: parseInt(year as string, 10),
        };

        const result = await this._fixtureService.search(dto);

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case SearchFixturesErrors.FiltersNotProvided:
                    return this.clientError(res, error);
                default:
                    return this.fail(res, error as string);
            }
        }

        return this.ok<any>(res, result.value);
    }
}
