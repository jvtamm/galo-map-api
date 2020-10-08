import { Collection, ObjectId } from 'mongodb';

import Entity from '@core/entity';
import { DatabaseDriver } from '@infra/contracts';
import { StaticMapper } from '@infra/contracts/mapper';
import { injectable, unmanaged } from 'inversify';

export interface BaseCollection {
    // _id?: ObjectId,
    _id: ObjectId,
    _lastUpdateDate?: Date,
    _creationDate?: Date
}

@injectable()
class GenericMongoRepository<TEntity extends Entity<any, any>, TCollection extends BaseCollection> {
    private _collectionName: string;

    protected mapper: StaticMapper<TEntity, TCollection>;

    protected collection: Collection;

    public constructor(
        @unmanaged() dbClient: DatabaseDriver,
        @unmanaged() name: string,
        @unmanaged() mapper: StaticMapper<TEntity, TCollection>,
    ) {
        this._collectionName = name;
        this.mapper = mapper;
        this.collection = dbClient.getSchema<Collection<TCollection>>(this._collectionName);
    }

    async save(entity: TEntity): Promise<TEntity> {
        const persistance = this.mapper.toPersistance(entity);

        return entity.id
            .cata(
                async () => this.insertOne(persistance),
                async () => this.replaceOne(persistance),
            );
    }

    private async insertOne(collectionObject: TCollection): Promise<TEntity> {
        const instance = { ...collectionObject };
        instance._creationDate = new Date();
        instance._lastUpdateDate = new Date();

        delete instance._id;

        const result = await this.collection.insertOne(instance);

        const processedObj = await this.loadDependencies(result?.ops[0]);

        return this.mapper.toDomain(processedObj);
    }

    private async replaceOne(collectionObject: TCollection): Promise<TEntity> {
        const instance = { ...collectionObject };
        instance._creationDate = new Date();
        instance._lastUpdateDate = new Date();

        const { _id } = instance;

        const result = await this.collection.replaceOne({ _id }, instance);

        const processedObj = await this.loadDependencies(result?.ops[0]);

        return this.mapper.toDomain(processedObj);
    }

    // eslint-disable-next-line class-methods-use-this
    protected loadDependencies(collectionObject: TCollection): any | Promise<any> {
        return collectionObject;
    }
}

export default GenericMongoRepository;
