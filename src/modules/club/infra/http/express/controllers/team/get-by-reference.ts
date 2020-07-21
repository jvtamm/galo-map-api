import { Request, Response } from 'express';

import BaseController from '@infra/http/express/contracts/base-controller';
import container from '@infra/ioc';
import { GetTeamByReferenceDTO, GetTeamByReferenceErrors } from '@modules/club/usecases/team/get-by-reference';
import { ITeamService } from '@modules/club/usecases/team';
import { RefDTO } from '@modules/club/domain/external-references';
import { TYPES } from '@config/ioc/types';
import { TeamDTO } from '@modules/club/mapper/team-map';

export class GetTeamByReferenceController extends BaseController {
    private _teamService: ITeamService = container.get(TYPES.TeamService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: GetTeamByReferenceDTO = {
            externalReferences: req.query as RefDTO,
        };

        const result = await this._teamService.getByReference(dto);

        return result.fold(
            (error: string) => {
                switch (error) {
                    case GetTeamByReferenceErrors.NotFound:
                        return this.notFound(res, error);
                    default:
                        return this.fail(res, error);
                }
            },
            (team: TeamDTO) => this.ok<TeamDTO>(res, team),
        );
    }
}

export default GetTeamByReferenceController;
