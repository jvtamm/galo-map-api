import { Route } from '@infra/http/express/types';

import {
    CreatePlayerController,
    GetPlayerBulkController,
    GetPlayerByIdController,
    GetPlayerByReferenceController,
} from '@modules/club/infra/http/express/controllers/player';

const BASE_MODULE_PATH = '/player';

const createPlayer: Route = {
    path: BASE_MODULE_PATH,
    method: 'post',
    handler: (req, res) => (new CreatePlayerController()).execute(req, res),
};

const getPlayerById: Route = {
    path: `${BASE_MODULE_PATH}/:id`,
    method: 'get',
    handler: (req, res) => (new GetPlayerByIdController()).execute(req, res),
};

// Rever este get
const getPlayerByReference: Route = {
    path: BASE_MODULE_PATH,
    method: 'get',
    handler: (req, res) => (new GetPlayerByReferenceController()).execute(req, res),
};

const getPlayerBulk: Route = {
    path: `${BASE_MODULE_PATH}/list`,
    method: 'post',
    handler: (req, res) => (new GetPlayerBulkController()).execute(req, res),
};

export default [
    createPlayer,
    getPlayerBulk,
    getPlayerById,
    getPlayerByReference,
];
