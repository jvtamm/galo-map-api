import { Request, Response } from 'express';

import BaseController from '@infra/http/express/contracts/base-controller';
import container from '@infra/ioc';
import { GetPlayerByReferenceDTO, GetPlayerByReferenceErrors } from '@modules/club/usecases/player/get-by-reference';
import { IPlayerService } from '@modules/club/usecases/player';
import { RefDTO } from '@modules/club/domain/external-references';
import { TYPES } from '@config/ioc/types';
import { TeamDTO } from '@modules/club/mapper/team-map';

export class GetPlayerByReferenceController extends BaseController {
    private _playerService: IPlayerService = container.get(TYPES.PlayerService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: GetPlayerByReferenceDTO = {
            externalReferences: req.query as RefDTO,
        };

        const result = await this._playerService.getByReference(dto);

        return result.fold(
            (error: string) => {
                switch (error) {
                    case GetPlayerByReferenceErrors.NotFound:
                        return this.notFound(res, error);
                    case GetPlayerByReferenceErrors.ProviderNotSupported:
                        return this.clientError(res, error);
                    default:
                        return this.fail(res, error);
                }
            },
            (team: TeamDTO) => this.ok<TeamDTO>(res, team),
        );
    }
}

export default GetPlayerByReferenceController;
