import { Request, Response } from 'express';

import BaseController from '@infra/http/express/contracts/base-controller';
import container from '@infra/ioc';
import { ITeamService } from '@modules/club/usecases/team';
import { TYPES } from '@config/ioc/types';
import { RetreiveSquadDTO, RetreiveSquadErrors } from '@modules/club/usecases/team/retreive-squad';
import { SquadDTO } from '@modules/club/mapper/squad-map';

export class RetreiveSquadController extends BaseController {
    private _teamService: ITeamService = container.get(TYPES.TeamService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: RetreiveSquadDTO = {
            teamId: req.params.id,
        };

        const result = await this._teamService.retreiveSquad(dto);

        return result.fold(
            (error: string) => {
                switch (error) {
                    case RetreiveSquadErrors.NotFound:
                        return this.notFound(res, error);
                    default:
                        return this.fail(res, error);
                }
            },
            (squad: SquadDTO) => this.ok<SquadDTO>(res, squad),
        );
    }
}

export default RetreiveSquadController;
