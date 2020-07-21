// import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';

import container from '@infra/ioc';

import BaseController from '@infra/http/express/contracts/base-controller';
import { TYPES } from '@config/ioc/types';
import { ITeamService } from '@modules/club/usecases/team';
import { CreateTeamDTO } from '@modules/club/usecases/team/create';

export class CreateTeamController extends BaseController {
    private _teamService: ITeamService = container.get(TYPES.TeamService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: CreateTeamDTO = req.body as CreateTeamDTO;

        const result = await this._teamService.create(dto);

        return result.fold(
            (error: string) => this.conflict(res, error),
            () => this.created(res),
        );
    }
}

export default CreateTeamController;
