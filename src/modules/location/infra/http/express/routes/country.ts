import { Route } from '@infra/http/express/types';

import {
    CreateCountryController,
    GetCountryByIdController,
    GetCountryByQueryController,
} from '../controllers/country';

const BASE_MODULE_PATH = '/country';

const createCountry: Route = {
    path: BASE_MODULE_PATH,
    method: 'post',
    handler: (req, res) => (new CreateCountryController()).execute(req, res),
};

const getCountryByQuery: Route = {
    path: BASE_MODULE_PATH,
    method: 'get',
    handler: (req, res) => (new GetCountryByQueryController()).execute(req, res),
};

const getCountryById: Route = {
    path: `${BASE_MODULE_PATH}/:id`,
    method: 'get',
    handler: (req, res) => (new GetCountryByIdController()).execute(req, res),
};

export default [
    createCountry,
    getCountryByQuery,
    getCountryById,
];
