import Result from '@core/result';
import Stadium, { StadiumProps } from '@modules/location/domain/stadium';
import { CountryRepo } from '@modules/location/repos/country-repo';
import { IGeocodeService } from '@modules/location/usecases/geocode';
import { PlaceSearch } from '@modules/location/adapters/place-search';
import { StadiumDTO, StadiumMap } from '@modules/location/mapper/stadium-map';
import { StadiumRepo } from '@modules/location/repos/stadium-repo';
import { StadiumScraper, StadiumInfo } from '@modules/location/adapters/stadium-scraper';
import { UseCase } from '@core/usecase';

import { CreateStadiumDTO } from './dto';
import { CreateStadiumErrors } from './errors';

export type CreateStadiumResponse = Result<StadiumDTO>;

export class CreateStadium implements UseCase<CreateStadiumDTO, CreateStadiumResponse> {
    constructor(
        private _stadiumRepo: StadiumRepo,
        private _countryRepo: CountryRepo,
        private _placeSearchService: PlaceSearch,
        private _stadiumScraper: StadiumScraper,
        private _geocodingService: IGeocodeService,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: CreateStadiumDTO): Promise<CreateStadiumResponse> {
        const { name } = request;

        if (!name) return Result.fail(CreateStadiumErrors.NameMandatory);

        try {
            let stadiumExists = await this._stadiumRepo.exists(name);
            if (stadiumExists) return Result.fail(CreateStadiumErrors.AlreadyExists);

            const stadiumInfo = await this.getStadiumInfo(name, request.city);
            if (stadiumInfo.failure) return Result.fail(stadiumInfo.error as string);

            stadiumExists = await this._stadiumRepo.exists(stadiumInfo.value.name);
            if (stadiumExists) return Result.fail(CreateStadiumErrors.AlreadyExists);

            const propsResult = await this.loadCountry(stadiumInfo.value);
            if (propsResult.failure) return Result.fail(propsResult.error as string);

            const inauguration = propsResult.value.inauguration || request.inauguration;
            const nickname = propsResult.value.nickname ? propsResult.value.nickname : request.nickname;
            const capacity = propsResult.value.capacity ? propsResult.value.capacity : request.capacity;
            const finalName = propsResult.value.name ? propsResult.value.name : request.name;

            const props: StadiumProps = {
                name: finalName,
                country: propsResult.value.country,
                coordinates: propsResult.value.coordinates,
                ...nickname && { nickname },
                ...capacity && { capacity },
                ...inauguration && { inauguration: inauguration instanceof Date ? inauguration : new Date(inauguration) },
            };

            const stadium = Stadium.create(props);

            if (stadium.failure) {
                return Result.fail(stadium.error as string);
            }

            const persistedStadium = await this._stadiumRepo.save(stadium.value);
            return Result.ok(StadiumMap.toDTO(persistedStadium));
        } catch (e) {
            console.log(e.toString());
            return Result.fail(CreateStadiumErrors.UnexpectedError);
        }
    }

    async getStadiumInfo(name: string, city?: string): Promise<Result<StadiumInfo>> {
        const stadiumInfo = await this._stadiumScraper.getStadiumInfo(name);

        if (stadiumInfo.failure) {
            const coordinatesResult = await this._placeSearchService.search(city as string);
            if (coordinatesResult.failure) return Result.fail(CreateStadiumErrors.CoordinatesNotfound);

            const cityStr = city as string;
            const info: StadiumInfo = {
                name: name.trim(),
                nickname: name.trim(),
                coordinates: coordinatesResult.value,
            };

            if (cityStr) {
                const countryName = cityStr.split(',')[1].trim();
                const maybeCountry = await this._countryRepo.getCountryByName(countryName);

                if (maybeCountry.isSome()) {
                    info.country = maybeCountry.join().alpha2;
                }
            }

            if (!info.country) {
                const { latitude, longitude } = coordinatesResult.value;
                const addressResult = await this._geocodingService.getAddressByCoordinates({ latitude, longitude });
                if (addressResult.success) {
                    info.country = addressResult.value.country.id as string;
                }
            }

            return Result.ok(info);
        }

        const info = stadiumInfo.value;
        if (!info.coordinates || !info.coordinates.latitude || !info.coordinates.longitude) {
            const coordinatesResult = await this._placeSearchService.search(name);
            if (coordinatesResult.failure) return Result.fail(CreateStadiumErrors.CoordinatesNotfound);

            info.coordinates = coordinatesResult.value;
        }

        return Result.ok(info);
    }

    async loadCountry(stadium: StadiumInfo): Promise<Result<StadiumProps>> {
        const countryCode = stadium.country && stadium.country.length === 2 ? stadium.country : 'BR';

        const maybeCountry = await this._countryRepo.getCountryByCode(countryCode.toUpperCase());
        if (!maybeCountry.isSome()) return Result.fail(CreateStadiumErrors.CountryNotSupported);

        const country = maybeCountry.join();
        const props: StadiumProps = {
            ...stadium,
            coordinates: stadium.coordinates as Coordinates,
            country: country.id.fold('')((id) => id as string),
        };

        return Result.ok(props);
    }
}

export * from './dto';
export * from './errors';
