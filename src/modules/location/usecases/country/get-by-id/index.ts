import Country from '@modules/location/domain/country';
import CountryMap, { CountryDTO } from '@modules/location/mapper/country-map';
import Maybe from '@core/maybe';
import { CountryRepo } from '@modules/location/repos/country-repo';
import {
    Either, fromTry, left, right,
} from '@core/either';
import { UseCase } from '@core/usecase';

import { GetCountryByIdDTO } from './dto';
import { GetCountryByIdErrors as Errors } from './errors';

export type GetCountryByIdResponse = Either<Errors.NotFound | string, CountryDTO>

export class GetById implements UseCase<GetCountryByIdDTO, GetCountryByIdResponse> {
    // eslint-disable-next-line no-empty-function
    constructor(private _countryRepo: CountryRepo) { }

    async execute(request: GetCountryByIdDTO): Promise<GetCountryByIdResponse> {
        const result = await fromTry<string, Maybe<Country>>(
            async () => this._countryRepo.getCountryById(request.id),
        );

        const notFound = left<Errors.NotFound, CountryDTO>(Errors.NotFound);
        return result.fold(
            // Maybe replace by unexpected error
            (value: string) => left<string, Country>(value),
            (value: Maybe<Country>) => value.fold<GetCountryByIdResponse>(notFound)(
                (country) => right<Errors.NotFound, CountryDTO>(
                    CountryMap.toDTO(country as Country),
                ),
            ),
        );
    }
}

export * from './dto';
export * from './errors';
