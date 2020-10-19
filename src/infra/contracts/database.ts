import { Maybe } from '@core/maybe';

export interface DatabaseDriver {
    connect(): Promise<void>;
    testConnection(): Promise<boolean>;
    shutDown(force?: boolean): Promise<void>;
    // createSchema<T, U>(name: string, data: T): Maybe<U>;
    retreiveSchema<T>(name: string): Maybe<T>;
    getSchema<T>(name: string, database?: string): T;
    getDb(): any;
}

// interface SchemaItemTemplate {

// }

export interface SchemaBuilder {
    // build(name: string, data: T): void;
    retreive<U>(name: string): U;
    // build<U>(name: string, data: T): U;
}

export interface ConnectionExtraConfigs {
    /**
     * Database type.
     */
    readonly type: string;
}

export interface ConnectionOptions {

    /**
     * Specific driver configs.
     */
    readonly configs: ConnectionExtraConfigs;

    /**
     * Connection url where perform connection to.
     */
    readonly url?: string;

    /**
     * Database host.
     */
    readonly host: string;

    /**
     * Database host port.
     */
    readonly port: number;

    /**
     * Database username.
     */
    readonly username: string;

    /**
     * Database password.
     */
    readonly password: string;

    /**
     * Database name to connect to.
     */
    readonly database: string;
}
