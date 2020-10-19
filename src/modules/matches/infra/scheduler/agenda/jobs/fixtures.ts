// import { Job } from 'agenda';

import {
    MatchDetailScheduler,
    MatchDetailScraper,
    ScrapeNextFixtures,
    ScrapePendingDetails,
} from '@modules/matches/infra/scheduler/agenda/routines/fixtures';
// import { JobOptions, JobScheduler } from '@infra/contracts';

const scheduleTodaysMatch = {
    name: 'match-details-scheduler',
    handler: MatchDetailScheduler,
    schedule: {
        interval: new Date(),
        action: 'schedule',
        // interval: '0 5 * * *',
        // action: 'repeatEvery',
    },
};

const matchDetailsScraper = {
    name: 'match-detail-scraper',
    handler: MatchDetailScraper,
};

const scrapeNextFixtures = {
    name: 'scrape-next-fixtures',
    handler: ScrapeNextFixtures,
    schedule: {
        interval: new Date(),
        action: 'schedule',
        // interval: '0 5 * * *',
        // action: 'repeatEvery',
    },
};

const scrapePendingDetails = {
    name: 'scrape-pending-details',
    handler: ScrapePendingDetails,
    schedule: {
        interval: new Date(),
        action: 'schedule',
        // interval: '0 5 * * *',
        // action: 'repeatEvery',
    },
};

export default [
    scheduleTodaysMatch,
    matchDetailsScraper,
    scrapeNextFixtures,
    scrapePendingDetails,
];
