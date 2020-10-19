import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { status, up } from 'migrate-mongo';

import { Maybe } from '@core/maybe';
import { DatabaseDriver, SchemaBuilder, ConnectionOptions } from '@infra/contracts';

import MongoSchemaBuilder from './schema-builder';
import { MongoConnectionOptions, MongoConfigs } from './mongo-connection-options';

class MongoDriver implements DatabaseDriver {
    private _shuttingDown: boolean = false;

    private forcedShutDown: boolean = false;

    private _connected: boolean = false;

    private _options: MongoConnectionOptions;

    private _connection: MongoClient;

    private _db: Db | undefined;

    private _schemaBuilder: SchemaBuilder | undefined;

    private _schemaBuilderMap: Map<string, SchemaBuilder> = new Map();

    protected validOptionNames: string[] = ['connectTimeoutMS', 'reconnectTries', 'reconnectInterval'];

    constructor(options: ConnectionOptions) {
        this._options = options as MongoConnectionOptions;

        this._connection = new MongoClient(
            this.buildConnectionUrl(),
            this.buildConnectionOptions(),
        );
    }

    async connect(): Promise<void> {
        this._connection = await this._connection.connect();
        this._db = this._connection.db(this._options.database);
        this._schemaBuilder = new MongoSchemaBuilder(this._db);
        this._schemaBuilderMap.set(this._options.database as string, this._schemaBuilder);

        this._registerListeners();
        await this.runMigrations();
    }

    testConnection(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            resolve(this._connection.isConnected());
        });
    }

    async shutDown(force?: boolean): Promise<void> {
        this.forcedShutDown = force || false;
        this._shuttingDown = true;

        if (this._connection.isConnected()) {
            await this._connection.close();
        }
    }

    retreiveSchema<T>(name: string): Maybe<T> {
        if (this._connection.isConnected() && this._schemaBuilder) {
            const collection = this._schemaBuilder.retreive<T>(name);

            return Maybe.of(collection);
        }

        return Maybe.none<T>();
    }

    getSchema<T>(name: string, database = this._options.database): T {
        const builder = this._schemaBuilderMap.get(database) as SchemaBuilder;
        return builder.retreive<T>(name);
    }

    getDb(): Db {
        return this._db as Db;
    }

    private async runMigrations(): Promise<void> {
        const hasPendingMigrations = await this.hasPendingMigrations();
        if (hasPendingMigrations && this._options.configs.runMigrations) {
            await up(this._db as Db);
        }
    }

    private async hasPendingMigrations(): Promise<boolean> {
        if (this._db) {
            const migrationStatus = await status(this._db);

            return migrationStatus.some(({ appliedAt }) => appliedAt === 'PENDING');
        }

        return false;
    }

    private _registerListeners(): void {
        if (this._connection) {
            this._connection.on('serverOpening', this._onConnect);
            this._connection.on('close', this._onClose);
            this._connection.on('error', this._onError);
        }
    }

    private _onClose(): void {
        this._connected = false;

        if (!this.forcedShutDown) {
            this.connect();
        }
    }

    private _onConnect(): void {
        this._connected = true;
    }

    private _onError(err: any): void {
        console.log(this);
        console.log(`Mongo default connection error: ${err}`);
    }

    private async _onExit(): Promise<void> {
        if (this._connected && this._connection) {
            await this._connection.close();
        }

        console.log('Mongo default connection disconnected through app termination');
        process.exit(0);
    }

    protected buildConnectionUrl(): string {
        if (this._options.url) return this._options.url;

        let credentialsUrlPart = '';
        if (this._options.username && this._options.password) {
            credentialsUrlPart = `${this._options.username}:${this._options.password}@`;
        }

        const { type } = this._options.configs;
        return `${type}://${credentialsUrlPart}${this._options.host || '127.0.0.1'}:${this._options.port || '27017'}/`;
    }

    protected buildConnectionOptions(): MongoClientOptions {
        const mongoOptions: any = {};
        const { configs } = this._options;

        for (let i = 0; i < this.validOptionNames.length; i += 1) {
            const optionName = this.validOptionNames[i];

            if (configs && optionName in configs) {
                mongoOptions[optionName] = configs[optionName as keyof MongoConfigs];
            }
        }

        return mongoOptions as MongoClientOptions;
    }
}

export default MongoDriver;
