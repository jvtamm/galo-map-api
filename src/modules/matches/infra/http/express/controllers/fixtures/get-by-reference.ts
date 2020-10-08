import { Request, Response } from 'express';

import BaseController from '@infra/http/express/contracts/base-controller';
import TYPES from '@config/ioc/types';
import container from '@infra/ioc';
import { GetFixtureByReferenceDTO, GetFixtureByReferenceErrors } from '@modules/matches/usecases/fixtures/get-by-reference';
import { IFixtureService } from '@modules/matches/usecases/fixtures';
import { RefDTO } from '@modules/club/domain/external-references';

export class GetFixtureByReferenceController extends BaseController {
    private _fixtureService: IFixtureService = container.get(TYPES.FixtureService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: GetFixtureByReferenceDTO = {
            externalReferences: req.query as RefDTO,
        };

        const result = await this._fixtureService.getByReference(dto);

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case GetFixtureByReferenceErrors.ReferencesMandatory:
                    return this.clientError(res, error);
                case GetFixtureByReferenceErrors.NotFound:
                    return this.notFound(res, error);
                default:
                    return this.fail(res, error as string);
            }
        }

        return this.ok<any>(res, result.value);
    }
}
