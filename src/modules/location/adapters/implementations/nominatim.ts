import { injectable } from 'inversify';
import axios from 'axios';

import Result from '@core/result';
import { Coordinates } from '@modules/location/domain/address';
import { Geocoding, Address } from '@modules/location/adapters/geocoding';
import { PlaceSearch } from '@modules/location/adapters/place-search';

@injectable()
export class Nominatim implements Geocoding, PlaceSearch {
    private readonly _url = 'https://nominatim.openstreetmap.org';

    private readonly _httpInstance = axios.create({ baseURL: this._url });

    async reverse(coordinates: Coordinates): Promise<Address> {
        const { latitude, longitude } = coordinates;
        const endpoint = `/reverse?lat=${latitude}&lon=${longitude}&format=geojson`;

        try {
            const response = await this._httpInstance.get(endpoint);
            const { data } = response;

            return Nominatim.parseResponse(data.features[0]);
        } catch (e) {
            console.log(e.toString());
            throw new Error('Unexpected Error');
        }
    }

    static parseResponse(response: any): Address {
        const { properties, geometry } = response;
        const { name, address } = properties;

        return {
            street: address.road,
            number: address.house_number,
            neighborhood: address.city_district || address.neighbourhood,
            city: address.city || address.town,
            state: address.state,
            countryCode: address.country_code.toUpperCase(),
            zipcode: address.postcode,
            coordinates: {
                latitude: geometry.coordinates[1],
                longitude: geometry.coordinates[0],
            },
            description: name,
        } as Address;
    }

    async search(query: string): Promise<Result<Coordinates>> {
        const params = {
            q: query,
            format: 'geojson',
        };

        try {
            const { data } = await this._httpInstance.get('/search', { params });
            if (!data) return Result.fail(`Failed to query with value ${query}`);

            const { geometry } = data.features[0];
            const coordinates: Coordinates = {
                latitude: geometry.coordinates[1],
                longitude: geometry.coordinates[0],
            };

            return Result.ok(coordinates);
        } catch (e) {
            console.log(e.toString());
            return Result.fail('An unexpected error has occurred.');
        }
    }
}

export default Nominatim;
