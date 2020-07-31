import { Route } from '@infra/http/express/types';

import { CreateFixtureController } from '@modules/matches/infra/http/express/controllers/fixtures';
import { SearchFixturesController } from '../controllers/fixtures/search';
import { GetFixtureByIdController } from '../controllers/fixtures/getById';

const BASE_MODULE_PATH = '/fixture';

const createFixture: Route = {
    path: BASE_MODULE_PATH,
    method: 'post',
    handler: (req, res) => (new CreateFixtureController()).execute(req, res),
};

const getById: Route = {
    path: `${BASE_MODULE_PATH}/:id`,
    method: 'get',
    handler: (req, res) => (new GetFixtureByIdController()).execute(req, res),
};

const searchFixture: Route = {
    path: BASE_MODULE_PATH,
    method: 'get',
    handler: (req, res) => (new SearchFixturesController()).execute(req, res),
};

export default [
    createFixture,
    getById,
    searchFixture,
];
