import { injectable, inject } from 'inversify';

import TYPES from '@config/ioc/types';

import { Geocoding } from '@modules/location/adapters/geocoding';
import { ICountryService } from '@modules/location/usecases/country';

import { GetAddressByCoordinates, GetAddressByCoordinatesDTO, GetAddressByCoordinatesResponse } from './get-address-by-coordinates';

export interface IGeocodeService {
    getAddressByCoordinates(request: GetAddressByCoordinatesDTO): Promise<GetAddressByCoordinatesResponse>;
}

@injectable()
export class GeocodeService implements IGeocodeService {
    constructor(
        @inject(TYPES.GeocodingAdapter) private _geocodingAdapter: Geocoding,
        @inject(TYPES.CountryService) private _countryServices: ICountryService,
    // eslint-disable-next-line no-empty-function
    ) {}

    getAddressByCoordinates(request: GetAddressByCoordinatesDTO): Promise<GetAddressByCoordinatesResponse> {
        const getAddressByCoordinates = new GetAddressByCoordinates(this._geocodingAdapter, this._countryServices);

        return getAddressByCoordinates.execute(request);
    }
}
