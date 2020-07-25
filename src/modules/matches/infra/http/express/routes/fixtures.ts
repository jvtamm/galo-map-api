import { Route } from '@infra/http/express/types';

import { CreateFixtureController } from '@modules/matches/infra/http/express/controllers/fixtures';
import { SearchFixturesController } from '../controllers/fixtures/search';

const BASE_MODULE_PATH = '/fixture';

const createFixture: Route = {
    path: BASE_MODULE_PATH,
    method: 'post',
    handler: (req, res) => (new CreateFixtureController()).execute(req, res),
};

const searchFixture: Route = {
    path: BASE_MODULE_PATH,
    method: 'get',
    handler: (req, res) => (new SearchFixturesController()).execute(req, res),
};

export default [
    createFixture,
    searchFixture,
];
