import { Route } from '@infra/http/express/types';

import { CreateFixtureController } from '@modules/matches/infra/http/express/controllers/fixtures';

const BASE_MODULE_PATH = '/fixture';

const createFixture: Route = {
    path: BASE_MODULE_PATH,
    method: 'post',
    handler: (req, res) => (new CreateFixtureController()).execute(req, res),
};

export default [
    createFixture,
];
