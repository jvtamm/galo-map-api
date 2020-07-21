import Country from '@modules/location/domain/country';
import Result from '@core/result';
import CountryMap, { CountryDTO } from '@modules/location/mapper/country-map';
import { CountryRepo } from '@modules/location/repos/country-repo';
import { UseCase } from '@core/usecase';

import GetCountryByCodeErrors from './errors';
import { GetCountryByCodeDTO } from './dto';

type Errors = GetCountryByCodeErrors.CodeMandatory |
    GetCountryByCodeErrors.NotFound |
    string;

export type GetCountryByCodeResponse = Result<Errors | CountryDTO>

export class GetCountryByCode implements UseCase<GetCountryByCodeDTO, GetCountryByCodeResponse> {
    // eslint-disable-next-line no-empty-function
    constructor(private _countryRepo: CountryRepo) {}

    async execute(request: GetCountryByCodeDTO): Promise<GetCountryByCodeResponse> {
        const { code } = request;

        if (!code) return Result.fail<CountryDTO>(GetCountryByCodeErrors.CodeMandatory);

        try {
            const maybeCountry = await this._countryRepo.getCountryByCode(code);

            const notFound = Result.fail<CountryDTO>(GetCountryByCodeErrors.NotFound);
            return maybeCountry.fold(notFound)(
                (country) => Result.ok(CountryMap.toDTO(country as Country)),
            );
        } catch (e) {
            console.log(e.toString());
            return Result.fail<CountryDTO>(GetCountryByCodeErrors.UnexpectedError);
        }
    }
}

export * from './dto';
export * from './errors';
