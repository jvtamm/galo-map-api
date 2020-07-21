import { MapquestConfigs } from '@config/index';

import { Geocoding, Address, Coordinates } from '@modules/location/adapters/geocoding';

export class MapquestGeocoding implements Geocoding {
    private readonly _url = 'http://open.mapquestapi.com/geocoding/v1';

    async reverse(coordinates: Coordinates): Promise<Address> {
        const { key } = MapquestConfigs;
        const { latitude, longitude } = coordinates;
        const endpoint = `/reverse?key=${key}&location=${latitude},${longitude}`;

        const response = await fetch(`${this._url}/${endpoint}`);
        const data = await response.json();

        return MapquestGeocoding.parseResponse(data.results[0]);
    }

    static parseResponse(response: any): Address {
        const location = response.locations[0];
        let { street }: { street: string } = location;

        let number = '';
        if (street.match(/^\d/)) {
            number = street.substr(0, street.indexOf(' '));
            street = street.substr(street.indexOf(' ') + 1);
        }

        return {
            street,
            number,
            neighborhood: location.adminArea6,
            city: location.adminArea5,
            state: location.adminArea3,
            countryCode: location.adminArea1,
            zipcode: location.postalCode.replace(/\D/g, ''),
            coordinates: {
                latitude: location.latLng.lat,
                longitude: location.latLng.lng,
            },
        } as Address;
    }
}

export default MapquestGeocoding;
