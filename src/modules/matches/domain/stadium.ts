export interface Coordinates {
    latitude: number,
    longitude: number
}

export interface Stadium {
    name: string;
    nickname?: string;
    // address: Address;
    coordinates: Coordinates;
}
