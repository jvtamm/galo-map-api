// import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';

import container from '@infra/ioc';

import BaseController from '@infra/http/express/contracts/base-controller';
import { TYPES } from '@config/ioc/types';
import { IFixtureService } from '@modules/matches/usecases/fixtures';
import { CreateFixtureDTO, CreateFixtureErrors } from '@modules/matches/usecases/fixtures/create';

export class CreateFixtureController extends BaseController {
    private _fixtureService: IFixtureService = container.get(TYPES.FixtureService);

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    async executeImpl(req: Request, res: Response): Promise<any> {
        const dto: CreateFixtureDTO = req.body as CreateFixtureDTO;

        const result = await this._fixtureService.create(dto);
        // const result = await this._fixtureService.scrapeAvailableFixtures();

        if (result.failure) {
            const { error } = result;

            switch (error) {
                case CreateFixtureErrors.AlreadyExists:
                    return this.conflict(res, error);
                case CreateFixtureErrors.AwayTeamNotFound:
                    return this.notFound(res, error);
                case CreateFixtureErrors.HomeTeamNotFound:
                    return this.notFound(res, error);
                case CreateFixtureErrors.StadiumNotFound:
                    return this.notFound(res, error);
                case CreateFixtureErrors.TournamentNotFound:
                    return this.notFound(res, error);
                case CreateFixtureErrors.GroundMandatory:
                    return this.clientError(res, error);
                case CreateFixtureErrors.LeagueMandatory:
                    return this.clientError(res, error);
                case CreateFixtureErrors.MatchDateMandatory:
                    return this.clientError(res, error);
                case CreateFixtureErrors.ReferencesMandatory:
                    return this.clientError(res, error);
                case CreateFixtureErrors.RoundMandatory:
                    return this.clientError(res, error);
                case CreateFixtureErrors.ProviderNotSupported:
                    return this.clientError(res, error);
                default:
                    return this.fail(res, error as string);
            }
        }
        return this.created(res);
    }
}
