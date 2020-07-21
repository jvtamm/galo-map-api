import { Request, Response } from 'express';

import BaseController from '@infra/http/express/contracts/base-controller';
import container from '@infra/ioc';
import { AddPlayerToSquadDTO, AddPlayerToSquadErrors } from '@modules/club/usecases/team/add-player-to-squad';
import { ITeamService } from '@modules/club/usecases/team';
import { TYPES } from '@config/ioc/types';

export class AddPlayerToSquadController extends BaseController {
    private _teamService: ITeamService = container.get(TYPES.TeamService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: AddPlayerToSquadDTO = req.body as AddPlayerToSquadDTO;

        const result = await this._teamService.addPlayerToSquad(dto);

        return result.fold(
            (error: string) => {
                switch (error) {
                    case AddPlayerToSquadErrors.PlayerNotFound:
                        return this.notFound(res, error);
                    case AddPlayerToSquadErrors.TeamNotFound:
                        return this.notFound(res, error);
                    default:
                        return this.fail(res, error);
                }
            },
            (id: string) => this.ok<any>(res, { id }),
        );
    }
}

export default AddPlayerToSquadController;
