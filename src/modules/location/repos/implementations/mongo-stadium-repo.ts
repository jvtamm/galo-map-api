import { ObjectId } from 'mongodb';
import { inject, injectable } from 'inversify';

import Country from '@modules/location/domain/country';
import GenericMongoRepository, { BaseCollection } from '@infra/database/mongodb/generic-repo';
import Maybe from '@core/maybe';
import Stadium from '@modules/location/domain/stadium';
import TYPES from '@config/ioc/types';
import { DatabaseDriver } from '@infra/contracts';
import { StadiumRepo } from '@modules/location/repos/stadium-repo';
import { StadiumMap } from '@modules/location/mapper/stadium-map';
import { CountryRepo } from '@modules/location/repos/country-repo';

interface Point {
    type: string;
    coordinates: Array<number>
}

export interface StadiumCollection extends BaseCollection {
    name: string;
    nickname: string;
    capacity: number;
    inauguration: Date;
    country: ObjectId;
    geometry: Point;
}

@injectable()
class MongoStadiumRepo extends GenericMongoRepository<Stadium, StadiumCollection> implements StadiumRepo {
    static collectionName = 'Stadium';

    constructor(
        @inject(TYPES.CountryRepo) private _countryRepo: CountryRepo,
        @inject(TYPES.DbClient) dbClient: DatabaseDriver,
    ) {
        super(
            dbClient,
            MongoStadiumRepo.collectionName,
            StadiumMap,
        );
    }

    async exists(name: string): Promise<boolean> {
        const stadium = await this.collection.findOne({ $or: [{ name }, { nickname: name }] });

        return Boolean(stadium);
    }

    async getStadiumByName(name: string): Promise<Maybe<Stadium>> {
        const stadium = await this.collection.findOne({ name });

        return Maybe.fromNull(stadium).map(this.mapper.toDomain);
        // let country: Country;
        // if (stadium) {
        //     country = await this.loadCountry(stadium.address.country) as Country;
        // }

        // return Maybe.fromNull(stadium).map<StadiumCollection>((persistedStadium: any) => {
        //     const updatedStadium = { ...persistedStadium };
        //     updatedStadium.address.country = country;

        //     return updatedStadium;
        // }).map(this.mapper.toDomain);
    }

    async getStadiumByNickname(nickname: string): Promise<Maybe<Stadium>> {
        const stadium = await this.collection.findOne({ nickname });

        return Maybe.fromNull(stadium).map(this.mapper.toDomain);
        // let country: Country;
        // if (stadium) {
        //     country = await this.loadCountry(stadium.address.country) as Country;
        // }

        // return Maybe.fromNull(stadium).map<StadiumCollection>((persistedStadium: any) => {
        //     const updatedStadium = { ...persistedStadium };
        //     updatedStadium.address.country = country;

        //     return updatedStadium;
        // }).map(this.mapper.toDomain);
    }

    private async loadCountry(countryId: string): Promise<Country | null> {
        const country = await this._countryRepo.getCountryById(countryId);

        return country.fold<null | Country>(null)((value) => value as Country);
    }
}

export default MongoStadiumRepo;
