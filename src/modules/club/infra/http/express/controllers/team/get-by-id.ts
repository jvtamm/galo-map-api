import { Request, Response } from 'express';

import BaseController from '@infra/http/express/contracts/base-controller';
import { TeamDTO } from '@modules/club/mapper/team-map';
import container from '@infra/ioc';
import { GetTeamByIdDTO, GetTeamByIdErrors } from '@modules/club/usecases/team/get-by-id';
import { ITeamService } from '@modules/club/usecases/team';
import { TYPES } from '@config/ioc/types';

export class GetTeamByIdController extends BaseController {
    private _teamService: ITeamService = container.get(TYPES.TeamService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: GetTeamByIdDTO = {
            id: req.params.id,
        };

        const result = await this._teamService.getById(dto);

        return result.fold(
            (error: string) => {
                switch (error) {
                    case GetTeamByIdErrors.NotFound:
                        return this.notFound(res, error);
                    default:
                        return this.fail(res, error);
                }
            },
            (team: TeamDTO) => this.ok<TeamDTO>(res, team),
        );
    }
}

export default GetTeamByIdController;
