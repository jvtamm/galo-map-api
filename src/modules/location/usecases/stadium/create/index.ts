import Result from '@core/result';
import Stadium, { StadiumProps } from '@modules/location/domain/stadium';
import { CountryRepo } from '@modules/location/repos/country-repo';
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
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: CreateStadiumDTO): Promise<CreateStadiumResponse> {
        const { name } = request;

        if (!name) return Result.fail(CreateStadiumErrors.NameMandatory);

        try {
            const stadiumExists = await this._stadiumRepo.exists(name);
            if (stadiumExists) return Result.fail(CreateStadiumErrors.AlreadyExists);

            const stadiumInfo = await this.getStadiumInfo(name);
            if (stadiumInfo.failure) return Result.fail(stadiumInfo.error as string);

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

    async getStadiumInfo(name: string): Promise<Result<StadiumInfo>> {
        const stadiumInfo = await this._stadiumScraper.getStadiumInfo(name);
        if (stadiumInfo.failure) return Result.fail(CreateStadiumErrors.ScrapingFailed);

        const info = stadiumInfo.value;
        if (!info.coordinates || !info.coordinates.latitude || !info.coordinates.longitude) {
            const coordinatesResult = await this._placeSearchService.search(name);
            if (coordinatesResult.failure) return Result.fail(CreateStadiumErrors.CoordinatesNotfound);

            info.coordinates = coordinatesResult.value;
        }

        return Result.ok(info);
    }

    async loadCountry(stadium: StadiumInfo): Promise<Result<StadiumProps>> {
        const countryCode = stadium.country && stadium.country.length === 3 ? stadium.country : 'BRA';

        const maybeCountry = await this._countryRepo.getCountryByCode(countryCode);
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
