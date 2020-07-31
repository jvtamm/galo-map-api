import { ObjectId, Collection } from 'mongodb';
import { injectable, inject } from 'inversify';

import TYPES from '@config/ioc/types';
import { BaseCollection } from '@infra/database/mongodb/generic-repo';
import { DatabaseDriver } from '@infra/contracts';
import { EventOptions } from '@modules/matches/domain/fixture-events';
import { FixtureDetailsMap } from '@modules/matches/mappers/fixture-details-map';
import { StaticMapper } from '@infra/contracts/mapper';
import { SummonedPlayers, FixtureDetails } from '@modules/matches/domain/fixture-details';

import Maybe from '@core/maybe';
import { FixtureDetailsRepo } from '../fixture-details-repo';

export interface FixtureDetailsCollection extends BaseCollection {
    events: EventOptions[];
    attendance?: number;
    homePlayers: SummonedPlayers;
    awayPlayers: SummonedPlayers;
}

@injectable()
export class MongoFixtureDetailsRepo implements FixtureDetailsRepo {
    protected _mapper: StaticMapper<FixtureDetails, FixtureDetailsCollection>;

    protected _collection: Collection;

    constructor(
        @inject(TYPES.DbClient) dbClient: DatabaseDriver,
    ) {
        const collectionName = 'FixtureDetails';

        this._collection = dbClient.getSchema<Collection<FixtureDetailsCollection>>(collectionName);
        this._mapper = FixtureDetailsMap;
    }

    async exists(matchId: string): Promise<Boolean> {
        const details = this._collection.findOne({ _id: matchId });

        return Maybe.fromNull(details).isSome();
    }

    async getByMatchId(matchId: string): Promise<Maybe<FixtureDetails>> {
        const details = await this._collection.findOne({ matchId });

        return Maybe.fromNull(details).map(this._mapper.toDomain);
    }

    async save(matchId: string, entity: FixtureDetails): Promise<FixtureDetails> {
        const persistance = this._mapper.toPersistance(entity);
        persistance._id = new ObjectId(matchId);

        if (this.exists(matchId)) {
            return this.replaceOne(persistance);
        }

        return this.insertOne(persistance);
    }

    private async insertOne(collectionObject: FixtureDetailsCollection): Promise<FixtureDetails> {
        const instance = { ...collectionObject };
        instance._creationDate = new Date();
        instance._lastUpdateDate = new Date();

        const result = await this._collection.insertOne(instance);

        return this._mapper.toDomain(result);
    }

    private async replaceOne(collectionObject: FixtureDetailsCollection): Promise<FixtureDetails> {
        const instance = { ...collectionObject };
        instance._lastUpdateDate = new Date();

        const { _id } = instance;

        const result = await this._collection.replaceOne({ _id }, instance);

        return this._mapper.toDomain(result);
    }
}
