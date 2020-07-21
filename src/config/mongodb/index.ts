const {
    MONGO_HOST,
    MONGO_PORT,
    MONGO_NAME,
    MONGO_USER,
    MONGO_PASS,
    MONGO_RETRIES,
    RUN_MIGRATIONS,
} = process.env;

export const MongoDbConfigs = {
    host: MONGO_HOST,
    port: MONGO_PORT,
    dbName: MONGO_NAME,
    user: MONGO_USER,
    password: MONGO_PASS,
    retries: MONGO_RETRIES,
    automaticMigrate: RUN_MIGRATIONS,
};

export default MongoDbConfigs;
