import 'reflect-metadata';

import ExpressServer from '@infra/http/express';
import { createConnectionOptions, DriverFactory } from '@infra/database';
import container from '@infra/ioc';
import {
    Server, DatabaseDriver, ConnectionOptions, JobScheduler,
} from '@infra/contracts';
import { TYPES } from '@config/ioc/types';
import { referenceDataIoCModule } from '@config/ioc/data-module';
import { AgendaJobScheduler } from '@infra/scheduler';

async function runApp() {
    const connectionOptions: ConnectionOptions = createConnectionOptions('mongodb');
    const dbClient: DatabaseDriver = DriverFactory.create(connectionOptions);
    const app: Server = new ExpressServer();
    let jobScheduler: JobScheduler;

    try {
        await dbClient.connect();
        const connected = await dbClient.testConnection();
        if (connected) {
            jobScheduler = new AgendaJobScheduler(dbClient.getDb());
            jobScheduler.start();

            container.bind<JobScheduler>(TYPES.JobScheduler).toConstantValue(jobScheduler);

            await app.start();
            console.log(`Server is listening on ${app.host()}${app.port()}...`);
        }

        container.bind<DatabaseDriver>(TYPES.DbClient).toConstantValue(dbClient);
        container.bind<Server>(TYPES.App).toConstantValue(app);
        container.load(referenceDataIoCModule);
    } catch (e) {
        console.log(`Erro: ${e} ao inicializar o servidor`);
    }

    process.on('SIGINT', async () => {
        await dbClient.shutDown();
        await app.stop();
    });
}

runApp();
