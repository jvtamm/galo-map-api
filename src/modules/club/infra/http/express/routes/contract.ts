import { Route } from '@infra/http/express/types';

import { RegisterContractController, GetContractsByPeriodController } from '@modules/club/infra/http/express/controllers/contract';

const BASE_MODULE_PATH = '/contract';

// Rever este get
const getByPeriod: Route = {
    path: BASE_MODULE_PATH,
    method: 'get',
    handler: (req, res) => (new GetContractsByPeriodController()).execute(req, res),
};

const registerContract: Route = {
    path: BASE_MODULE_PATH,
    method: 'post',
    handler: (req, res) => (new RegisterContractController()).execute(req, res),
};

export default [
    getByPeriod,
    registerContract,
];
