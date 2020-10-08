import BaseController from '@infra/http/express/contracts/base-controller';
import TYPES from '@config/ioc/types';
import container from '@infra/ioc';
import { GetTeamBulkDTO, GetTeamBulkErrors } from '@modules/club/usecases/team/get-bulk';
import { ITeamService } from '@modules/club/usecases/team';
import { RefDTO } from '@modules/club/domain/external-references';
import { Request, Response } from 'express';

export class GetTeamBulkController extends BaseController {
    private _teamService: ITeamService = container.get(TYPES.TeamService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const { externalReferences } = req.body;

        const dto: GetTeamBulkDTO = {
            externalReferences: externalReferences as RefDTO[],
        };

        const result = await this._teamService.getBulk(dto);

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case GetTeamBulkErrors.ReferencesMandatory:
                    return this.clientError(res, error);
                case GetTeamBulkErrors.InvalidReferences:
                    return this.clientError(res, error);
                default:
                    return this.fail(res, error as string);
            }
        }

        return this.ok<any>(res, { data: result.value });
    }
}
