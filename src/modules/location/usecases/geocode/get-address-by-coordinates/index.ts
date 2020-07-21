import Result from '@core/result';
import { AddressDTO } from '@modules/location/mapper/address-map';
import { CountryDTO } from '@modules/location/mapper/country-map';
import { Geocoding } from '@modules/location/adapters/geocoding';
import { ICountryService } from '@modules/location/usecases/country';
import { UseCase } from '@core/usecase';

import { GetAddressByCoordinatesDTO } from './dto';
import GetAddressByCoordinatesErrors from './errors';

export type GetAddressByCoordinatesResponse = Result<AddressDTO>

export class GetAddressByCoordinates implements UseCase<GetAddressByCoordinatesDTO, GetAddressByCoordinatesResponse> {
    constructor(
        private _geocodingAdapter: Geocoding,
        private _countryServices: ICountryService,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: GetAddressByCoordinatesDTO): Promise<GetAddressByCoordinatesResponse> {
        const { latitude, longitude } = request;

        if (!latitude) return Result.fail<AddressDTO>(GetAddressByCoordinatesErrors.LatitudeMandatory);
        if (!longitude) return Result.fail<AddressDTO>(GetAddressByCoordinatesErrors.LongitudeMandatory);

        try {
            const address = await this._geocodingAdapter.reverse({ latitude, longitude });
            const countryResult = await this._countryServices.getByCode({ code: address.countryCode });

            if (countryResult.failure) {
                return Result.fail<AddressDTO>(GetAddressByCoordinatesErrors.CountryNotSupported);
            }

            const country = countryResult.value as CountryDTO;
            const formattedAddress = { ...address, ...{ country } };
            delete formattedAddress.countryCode;

            return Result.ok<AddressDTO>(formattedAddress as AddressDTO);
        } catch (e) {
            console.log(e.toString());
            return Result.fail<AddressDTO>(GetAddressByCoordinatesErrors.UnexpectedError);
        }
    }
}

export * from './dto';
export * from './errors';
