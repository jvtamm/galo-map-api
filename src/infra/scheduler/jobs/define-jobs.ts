/* eslint-disable no-await-in-loop */

import Agenda from 'agenda';

import { JobOptions, JobScheduler } from '@infra/contracts';

export const defineJobs = async (jobs: JobOptions<any>[], agenda: Agenda, scheduler: JobScheduler) => {
    for (let i = 0; i < jobs.length; i += 1) {
        const { name, handler, schedule } = jobs[i];

        if (handler) {
            agenda.define(name, async (job) => {
                handler(job, scheduler);
            });
        }

        // if (schedule) {
        //     const { type } = schedule;
        //     // eslint-disable-next-line no-await-in-loop
        //     await (agenda as any)[type](schedule.interval, name, schedule.data);
        // }

        if (schedule) {
            const { action, data } = schedule;

            const job = agenda.create(name, data);
            await (job as any)[action](schedule.interval);
            await job.save();
        }
    }
};

export default defineJobs;
