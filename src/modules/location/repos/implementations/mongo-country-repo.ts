// import { Document, Schema, collection } from 'mongoose';
import { Collection, ObjectId } from 'mongodb';
import { injectable, inject } from 'inversify';

// import GenericMongoRepo from '@infra/database/mongodb/generic-repo';
import Country from '@modules/location/domain/country';
import CountryMap from '@modules/location/mapper/country-map';
import Maybe from '@core/maybe';
import { DatabaseDriver } from '@infra/contracts';
import { TYPES } from '@config/ioc/types';

import { CountryRepo } from '../country-repo';

export interface CountryCollection {
    _id?: ObjectId;
    name: string;
    alpha2: string;
    alpha3: string;
}

@injectable()
class MongoCountryRepo implements CountryRepo {
    private readonly _collectionName = 'Country';

    protected collection: Maybe<Collection>;

    constructor(@inject(TYPES.DbClient) dbClient: DatabaseDriver) {
        this.collection = dbClient.retreiveSchema<Collection>(this._collectionName);
    }

    async getCountryById(countryId: string | number): Promise<Maybe<Country>> {
        const _id = new ObjectId(countryId);

        return this.collection.map((model) => model?.findOne({ _id }))
            .toPromise<string>(`Could not find country with _id ${_id}`)
            .then((country) => {
                const maybeCountry = Maybe.fromNull(country);
                return maybeCountry.map(CountryMap.toDomain);
            });
    }

    getCountryByCode(code: string): Promise<Maybe<Country>> {
        return this.collection.map((model) => model?.findOne({ $or: [{ alpha2: code }, { alpha3: code }] }))
            .toPromise<string>(`Could not find country with code ${code}`)
            .then((country) => {
                const maybeCountry = Maybe.fromNull(country);
                return maybeCountry.map(CountryMap.toDomain);
            });
    }

    async getCountryByName(name: string): Promise<Maybe<Country>> {
        return this.collection.map((model) => model?.findOne({ name }))
            .toPromise<string>(`Could not find country with name ${name}`)
            .then((country) => {
                const maybeCountry = Maybe.fromNull(country);
                return maybeCountry.map(CountryMap.toDomain);
            });
    }

    async save(country: Country): Promise<void> {
        await Maybe.of<any>(CountryMap.toPersistance(country))
            .map<any>((value) => this.collection.map((model) => model?.save(value)));
    }
}

export default MongoCountryRepo;

// async exists(countryId: string): Promise<boolean> {
//     const _id = new ObjectId(countryId);

//     return this.collection.map((model) => model?.findOne({ _id }))
//         .toPromise<string>(`Could not find country with _id ${_id}`)
//         .then(async (country) => {
//             const maybeCountry = Maybe.fromNull(country);
//             return maybeCountry.fold<boolean>(false)((value) => value !== null);
//         });

//     type IdQuery = { _id: ObjectId }
//     return Maybe.of<IdQuery>({ _id })
//         .apply<any>(this.collection, 'findOne')
//         .toPromise<string>(`Could not find country with _id ${_id}`)
//         .then(async (country) => {
//             const maybeCountry = Maybe.fromNull(country);
//             return maybeCountry.fold<boolean>(false)((value) => value !== null);
//         });
// }
