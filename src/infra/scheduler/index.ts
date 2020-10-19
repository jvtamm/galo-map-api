import Agenda from 'agenda';
import { Db } from 'mongodb';

import { JobOptions, JobScheduler } from '@infra/contracts/job-scheduler';
import jobs, { defineJobs } from './jobs';

export class AgendaJobScheduler implements JobScheduler {
    private _scheduler: Agenda;

    constructor(db: Db) {
        this._scheduler = new Agenda({ mongo: db, db: { collection: 'Jobs' } });
    }

    async start(): Promise<void> {
        await this._scheduler.start();

        await defineJobs(jobs, this._scheduler, this);
    }

    async stop(): Promise<void> {
        await this._scheduler.stop();
    }

    async scheduleJob<T>(options: JobOptions<T>): Promise<void> {
        await defineJobs([options], this._scheduler, this);
    }
}
