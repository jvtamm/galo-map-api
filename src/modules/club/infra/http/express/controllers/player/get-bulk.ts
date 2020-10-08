import BaseController from '@infra/http/express/contracts/base-controller';
import TYPES from '@config/ioc/types';
import container from '@infra/ioc';
import { GetPlayerBulkDTO, GetPlayerBulkErrors } from '@modules/club/usecases/player/get-bulk';
import { IPlayerService } from '@modules/club/usecases/player';
import { RefDTO } from '@modules/club/domain/external-references';
import { Request, Response } from 'express';

export class GetPlayerBulkController extends BaseController {
    private _playerService: IPlayerService = container.get(TYPES.PlayerService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const { externalReferences } = req.body;

        const dto: GetPlayerBulkDTO = {
            externalReferences: externalReferences as RefDTO[],
        };

        const result = await this._playerService.getBulk(dto);

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case GetPlayerBulkErrors.ReferencesMandatory:
                    return this.clientError(res, error);
                case GetPlayerBulkErrors.InvalidReferences:
                    return this.clientError(res, error);
                default:
                    return this.fail(res, error as string);
            }
        }

        return this.ok<any>(res, { data: result.value });
    }
}
