import Country from '@modules/location/domain/country';
import { CountryRepo } from '@modules/location/repos/country-repo';
import Maybe from '@core/maybe';
import { Either, fromTry, left } from '@core/either';
import { UseCase } from '@core/usecase';

import { CreateCountryDTO } from './dto';
import { CreateCountryErrors } from './errors';

export type CreateCountryResponse = Either<CreateCountryErrors.AlreadyExists | string, void>

export class CreateCountry implements UseCase<CreateCountryDTO, CreateCountryResponse> {
    // eslint-disable-next-line no-empty-function
    constructor(private _countryRepo: CountryRepo) {}

    async execute(request: CreateCountryDTO): Promise<CreateCountryResponse> {
        const result = await fromTry<string, Maybe<Country>>(
            async () => this._countryRepo.getCountryByName(request.name),
        );

        return result.chain((value) => {
            if (!value.isSome()) {
                return Country.create(request);
            }

            return left<string, Country>(CreateCountryErrors.AlreadyExists);
        }).toPromise()
            .then((country) => fromTry<string, void>(
                async () => this._countryRepo.save(country as Country),
            )).catch((error: string) => left<string, void>(error));
    }
}

export * from './dto';
