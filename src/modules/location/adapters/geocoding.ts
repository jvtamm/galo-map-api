import { Coordinates } from '@modules/location/domain/address';

export interface Address {
    description?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city: string;
    state: string;
    countryCode: string;
    zipcode?: string;
    coordinates: Coordinates;
}

export interface Geocoding {
    reverse(coordinates: Coordinates): Promise<Address>;
}
