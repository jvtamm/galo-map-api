import { Db } from 'mongodb';
// import { Connection, Schema } from 'mongoose';

import { SchemaBuilder } from '@infra/contracts';

class MongoSchemaBuilder implements SchemaBuilder {
    // eslint-disable-next-line no-empty-function
    constructor(private _db: Db) {}

    // build(name: string, data: T): void{
    //     this._connection.model(name, data as unknown as Schema)
    // }

    retreive<U>(name: string): U {
        return this._db.collection(name) as unknown as U;
    }

    // build<U>(name: string, data: T): U {
    //     const schema = data as unknown as Schema;

    //     return this._connection.model(name, schema) as unknown as U;
    // }
}

export default MongoSchemaBuilder;
