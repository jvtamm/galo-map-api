import { injectable, inject } from 'inversify';

import TYPES from '@config/ioc/types';
import { CountryRepo } from '@modules/location/repos/country-repo';

import { CreateCountry, CreateCountryDTO, CreateCountryResponse } from './create';
import { GetById, GetCountryByIdDTO, GetCountryByIdResponse } from './get-by-id';
import { GetCountryByCodeDTO, GetCountryByCodeResponse, GetCountryByCode } from './get-by-code';
import { GetCountryByNameDTO, GetCountryByNameResponse, GetCountryByName } from './get-by-name';

export interface ICountryService {
    create(request: CreateCountryDTO): Promise<CreateCountryResponse>;
    getByCode(request: GetCountryByCodeDTO): Promise<GetCountryByCodeResponse>;
    getById(request: GetCountryByIdDTO): Promise<GetCountryByIdResponse>;
    getByName(request: GetCountryByNameDTO): Promise<GetCountryByNameResponse>;
}

@injectable()
export class CountryService implements ICountryService {
    @inject(TYPES.CountryRepo) private _countryRepo!: CountryRepo;

    create(request: CreateCountryDTO): Promise<CreateCountryResponse> {
        const createUseCase = new CreateCountry(this._countryRepo);

        return createUseCase.execute(request);
    }

    getByCode(request: GetCountryByCodeDTO): Promise<GetCountryByCodeResponse> {
        const getByCode = new GetCountryByCode(this._countryRepo);

        return getByCode.execute(request);
    }

    getById(request: GetCountryByIdDTO): Promise<GetCountryByIdResponse> {
        const getByIdUseCase = new GetById(this._countryRepo);

        return getByIdUseCase.execute(request);
    }

    getByName(request: GetCountryByNameDTO): Promise<GetCountryByNameResponse> {
        const getByNameUseCase = new GetCountryByName(this._countryRepo);

        return getByNameUseCase.execute(request);
    }
}
