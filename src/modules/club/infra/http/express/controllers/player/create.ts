// import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';

import container from '@infra/ioc';

import BaseController from '@infra/http/express/contracts/base-controller';
import { TYPES } from '@config/ioc/types';
import { CreatePlayerDTO } from '@modules/club/usecases/player/create';
import { IPlayerService } from '@modules/club/usecases/player';

export class CreatePlayerController extends BaseController {
    private _playerService: IPlayerService = container.get(TYPES.PlayerService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: CreatePlayerDTO = req.body as CreatePlayerDTO;

        const result = await this._playerService.create(dto);

        return result.fold(
            (error: string) => this.conflict(res, error),
            () => this.created(res),
        );
    }
}

export default CreatePlayerController;
