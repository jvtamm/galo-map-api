import { Request, Response } from 'express';

import BaseController from '@infra/http/express/contracts/base-controller';
import { PlayerDTO } from '@modules/club/mapper/player-map';
import container from '@infra/ioc';
import { GetPlayerByIdDTO, GetPlayerByIdErrors } from '@modules/club/usecases/player/get-by-id';
import { IPlayerService } from '@modules/club/usecases/player';
import { TYPES } from '@config/ioc/types';

export class GetPlayerByIdController extends BaseController {
    private _playerService: IPlayerService = container.get(TYPES.PlayerService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: GetPlayerByIdDTO = {
            id: req.params.id,
        };

        const result = await this._playerService.getById(dto);

        return result.fold(
            (error: string) => {
                switch (error) {
                    case GetPlayerByIdErrors.NotFound:
                        return this.notFound(res, error);
                    default:
                        return this.fail(res, error);
                }
            },
            (player: PlayerDTO) => this.ok<PlayerDTO>(res, player),
        );
    }
}

export default GetPlayerByIdController;
