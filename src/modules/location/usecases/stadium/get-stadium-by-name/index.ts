import Result from '@core/result';

import { StadiumDTO, StadiumMap } from '@modules/location/mapper/stadium-map';
import { StadiumRepo } from '@modules/location/repos/stadium-repo';
import { UseCase } from '@core/usecase';

import { GetStadiumByNameDTO } from './dto';
import { GetStadiumByNameErrors } from './errors';

export type GetStadiumByNameResponse = Result<StadiumDTO>;

export class GetStadiumByName implements UseCase<GetStadiumByNameDTO, GetStadiumByNameResponse> {
    constructor(
        private _stadiumRepo: StadiumRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: GetStadiumByNameDTO): Promise<GetStadiumByNameResponse> {
        const { name } = request;

        if (!name) return Result.fail(GetStadiumByNameErrors.NameMandatory);

        try {
            let maybeStadium = await this._stadiumRepo.getStadiumByName(name);
            if (maybeStadium.isNone()) {
                maybeStadium = await this._stadiumRepo.getStadiumByNickname(name);
                if (maybeStadium.isNone()) return Result.fail(GetStadiumByNameErrors.NotFound);
            }

            const stadium = maybeStadium.join();

            return Result.ok(StadiumMap.toDTO(stadium));
        } catch (e) {
            console.log(e.toString());
            return Result.fail(GetStadiumByNameErrors.UnexpectedError);
        }
    }
}

export * from './dto';
export * from './errors';
