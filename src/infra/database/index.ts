import { DatabaseDriver, ConnectionOptions } from '@infra/contracts';
import MongoDriver from './mongodb';
import { MongoConnectionOptions } from './mongodb/mongo-connection-options';

export class DriverFactory {
    /**
     * Creates a new driver depend on a given connection's driver type.
     */
    static create(connection: ConnectionOptions): DatabaseDriver {
        const { type } = connection.configs;
        switch (type) {
            case 'mongodb':
                return new MongoDriver(connection);
            default:
                throw new Error(`Wrong driver: "${type}" given. Supported drivers are: "mongodb".`);
        }
    }
}

export const createConnectionOptions = (type: string): ConnectionOptions => {
    const {
        MONGO_HOST,
        MONGO_PORT,
        MONGO_NAME,
        MONGO_USER,
        MONGO_PASS,
        MONGO_RETRIES,
        RUN_MIGRATIONS,
    } = process.env;

    return {
        host: MONGO_HOST,
        port: parseInt(MONGO_PORT || '27017', 10),
        username: MONGO_USER,
        password: MONGO_PASS,
        database: MONGO_NAME,
        configs: {
            reconnectTries: parseInt(MONGO_RETRIES || '30', 10),
            reconnectInterval: 1000,
            useNewUrlParser: true,
            runMigrations: RUN_MIGRATIONS,
            type,
        },
    } as MongoConnectionOptions;
};
