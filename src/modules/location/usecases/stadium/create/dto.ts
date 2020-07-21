import { Coordinates } from '@modules/location/domain/address';

export interface CreateStadiumDTO {
    name: string;
    nickname?: string;
    capacity?: number;
    inauguration?: string;
    coordinates?: Coordinates;
}
