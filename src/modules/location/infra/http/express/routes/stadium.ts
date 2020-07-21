import { Route } from '@infra/http/express/types';

import { CreateStadiumController } from '@modules/location/infra/http/express/controllers/stadium';

const BASE_MODULE_PATH = '/stadium';

const createStadium: Route = {
    path: BASE_MODULE_PATH,
    method: 'post',
    handler: (req, res) => (new CreateStadiumController()).execute(req, res),
};

export default [
    createStadium,
];
