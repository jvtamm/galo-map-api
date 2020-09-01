import Result from '@core/result';
import { UseCase } from '@core/usecase';
import CountryMap, { CountryDTO } from '@modules/location/mapper/country-map';
import { CountryRepo } from '@modules/location/repos/country-repo';

import { GetCountryByNameDTO } from './dto';
import { GetCountryByNameErrors } from './errors';

export type GetCountryByNameResponse = Result<CountryDTO>;

export class GetCountryByName implements UseCase<GetCountryByNameDTO, GetCountryByNameResponse> {
    constructor(
        private _countryRepo: CountryRepo,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: GetCountryByNameDTO): Promise<GetCountryByNameResponse> {
        const { name } = request;

        if (!name) return Result.fail(GetCountryByNameErrors.MandatoryName);

        try {
            const maybeLeagueEdition = await this._countryRepo.getCountryByName(name);
            if (maybeLeagueEdition.isNone()) return Result.fail(GetCountryByNameErrors.NotFound);

            return Result.ok(CountryMap.toDTO(maybeLeagueEdition.join()));
        } catch (error) {
            console.log(error.toString());
            return Result.fail(GetCountryByNameErrors.UnexpectedError);
        }
    }
}

export * from './dto';
export * from './errors';
