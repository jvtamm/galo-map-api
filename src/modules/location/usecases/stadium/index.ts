import { inject, injectable } from 'inversify';

import TYPES from '@config/ioc/types';
import { CountryRepo } from '@modules/location/repos/country-repo';
import { IGeocodeService } from '@modules/location/usecases/geocode';
import { PlaceSearch } from '@modules/location/adapters/place-search';
import { StadiumRepo } from '@modules/location/repos/stadium-repo';
import { StadiumScraper } from '@modules/location/adapters/stadium-scraper';

import { CreateStadiumDTO, CreateStadiumResponse, CreateStadium } from './create';
import { GetStadiumByNameResponse, GetStadiumByNameDTO, GetStadiumByName } from './get-stadium-by-name';

export interface IStadiumService {
    create(request: CreateStadiumDTO): Promise<CreateStadiumResponse>;
    getStadiumByName(request: GetStadiumByNameDTO): Promise<GetStadiumByNameResponse>
}

@injectable()
export class StadiumService {
    constructor(
        @inject(TYPES.StadiumRepo) private _stadiumRepo: StadiumRepo,
        @inject(TYPES.CountryRepo) private _countryRepo: CountryRepo,
        @inject(TYPES.PlaceSearch) private _placeSearchService: PlaceSearch,
        @inject(TYPES.StadiumScraper) private _stadiumScraper: StadiumScraper,
        @inject(TYPES.GeocodeService) private _geocodingService: IGeocodeService,
    // eslint-disable-next-line no-empty-function
    ) {}

    create(request: CreateStadiumDTO): Promise<CreateStadiumResponse> {
        const createStadium = new CreateStadium(
            this._stadiumRepo,
            this._countryRepo,
            this._placeSearchService,
            this._stadiumScraper,
            this._geocodingService,
        );

        return createStadium.execute(request);
    }

    getStadiumByName(request: GetStadiumByNameDTO): Promise<GetStadiumByNameResponse> {
        const getStadiumByName = new GetStadiumByName(this._stadiumRepo);

        return getStadiumByName.execute(request);
    }
}
