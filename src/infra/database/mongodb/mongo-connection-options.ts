import { ConnectionOptions, ConnectionExtraConfigs } from '@infra/contracts';

export interface MongoConfigs extends ConnectionExtraConfigs {
    /**
     * Database type.
     */
    readonly type: 'mongodb';

    /**
     * TCP Socket timeout setting. Default: 360000
     */
    readonly socketTimeoutMS?: number;

    /**
     * Server attempt to reconnect #times. Default 30
     */
    readonly reconnectTries?: number;

    /**
     * Server will wait #milliseconds between retries. Default 1000
     */
    readonly reconnectInterval?: number;

    /**
     * Determines whether or not to use the new url parser. Default: false
     */
    readonly useNewUrlParser?: boolean;

    /**
     * Determines whether or not to run migrations on startup
     */
    readonly runMigrations?: boolean;
}

export interface MongoConnectionOptions extends ConnectionOptions {
    /**
     * Specific driver configs.
     */
    readonly configs: MongoConfigs;
}
