import Result from '@core/result';
import { Coordinates } from '@modules/location/domain/address';

export interface StadiumInfo {
    name: string;
    nickname?: string;
    capacity?: number;
    inauguration?: Date;
    country?: string;
    coordinates?: Coordinates;
}

export interface StadiumScraper {
    getStadiumInfo(name: string): Promise<Result<StadiumInfo>>;
}
