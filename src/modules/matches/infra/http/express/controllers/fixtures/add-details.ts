// import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';

import container from '@infra/ioc';

import BaseController from '@infra/http/express/contracts/base-controller';
import { TYPES } from '@config/ioc/types';
import { IFixtureService } from '@modules/matches/usecases/fixtures';
import { AddFixtureDetailsDTO, AddFixtureDetailsErrors } from '@modules/matches/usecases/fixtures/add-details';

export class AddFixtureDetailsController extends BaseController {
    private _fixtureService: IFixtureService = container.get(TYPES.FixtureService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: AddFixtureDetailsDTO = req.body as AddFixtureDetailsDTO;

        const result = await this._fixtureService.addDetails(dto);

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case AddFixtureDetailsErrors.FixtureNotFound:
                    return this.notFound(res, error);
                case AddFixtureDetailsErrors.AwayScoreMandatory:
                    return this.notFound(res, error);
                case AddFixtureDetailsErrors.FixtureMandatory:
                    return this.clientError(res, error);
                case AddFixtureDetailsErrors.HomeScoreMandatory:
                    return this.clientError(res, error);
                case AddFixtureDetailsErrors.InvalidAwayPlayers:
                    return this.clientError(res, error);
                case AddFixtureDetailsErrors.InvalidHomePlayers:
                    return this.clientError(res, error);
                default:
                    return this.fail(res, error as string);
            }
        }
        return this.created(res);
    }
}
