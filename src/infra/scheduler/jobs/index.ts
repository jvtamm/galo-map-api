import matchesJobs from '@modules/matches/infra/scheduler/agenda';

// import { JobOptions, JobScheduler } from '@infra/contracts';
// import { Job } from 'agenda';

// const testJobs: JobOptions<any>[] = [
//     {
//         name: 'hello-world',
//         handler: async (job: Job, scheduler: JobScheduler) => {
//             // console.log(job);
//             // console.log(scheduler);
//             console.log('Hello World');

//             scheduler.scheduleJob({
//                 name: 'hello-world-2',
//                 handler: async () => {
//                     console.log('Hello World 2 ');
//                 },
//                 schedule: {
//                     interval: '1 minute',
//                     type: 'every',
//                 },
//             });
//         },
//         schedule: {
//             interval: 'in 5 seconds',
//             type: 'schedule',
//         },
//     },
// ];

export default [
    ...matchesJobs,
];

export * from './define-jobs';
