import Country from './country';

export interface Coordinates {
    latitude: number,
    longitude: number
}

export interface Address {
    street?: string;
    number?: string;
    neighborhood?: string;
    city: string;
    state: string;
    country: Country;
    zipcode?: string;
    coordinates: Coordinates;
}
