import Maybe from '@core/maybe';
import SquadMap, { SquadDTO } from '@modules/club/mapper/squad-map';
import {
    Either, fromTry, left, right,
} from '@core/either';
import { Squad } from '@modules/club/domain/squad';
import { SquadRepo } from '@modules/club/repos/squad-repo';
import { UseCase } from '@core/usecase';

import { RetreiveSquadDTO } from './dto';
import { RetreiveSquadErrors } from './errors';

type Errors = RetreiveSquadErrors.NotFound | string;
export type RetreiveSquadResponse = Either<Errors, SquadDTO>

export class RetreiveSquad implements UseCase<RetreiveSquadDTO, RetreiveSquadResponse> {
    // eslint-disable-next-line no-empty-function
    constructor(private _squadRepo: SquadRepo) {}

    async execute(request: RetreiveSquadDTO): Promise<RetreiveSquadResponse> {
        const result = await fromTry<Errors, Maybe<Squad>>(
            async () => this._squadRepo.getSquadByTeam(request.teamId),
        );

        const notFound = left<Errors, SquadDTO>(RetreiveSquadErrors.NotFound);
        return result.fold(
            // Maybe replace by unexpected error
            (value: string) => left<Errors, SquadDTO>(value),
            (value: Maybe<Squad>) => value.fold<RetreiveSquadResponse>(notFound)(
                (squad) => right<Errors, SquadDTO>(SquadMap.toDTO(squad as Squad)),
            ),
        );
    }
}

export * from './dto';
export * from './errors';
