import Result from '@core/result';
import { Coordinates } from '@modules/location/domain/address';

export interface PlaceSearch {
    search(query: string): Promise<Result<Coordinates>>;
}
