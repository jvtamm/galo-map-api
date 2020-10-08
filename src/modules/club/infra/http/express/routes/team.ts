import { Route } from '@infra/http/express/types';

import {
    AddPlayerToSquadController, CreateTeamController, GetTeamByReferenceController,
    GetTeamByIdController, RetreiveSquadController, GetTeamBulkController,
} from '../controllers/team';

const BASE_MODULE_PATH = '/team';

const addPlayerToTeam: Route = {
    path: `${BASE_MODULE_PATH}/squad`,
    method: 'post',
    handler: (req, res) => (new AddPlayerToSquadController()).execute(req, res),
};

const createTeam: Route = {
    path: BASE_MODULE_PATH,
    method: 'post',
    handler: (req, res) => (new CreateTeamController()).execute(req, res),
};

// Rever este get
const getTeamByReference: Route = {
    path: BASE_MODULE_PATH,
    method: 'get',
    handler: (req, res) => (new GetTeamByReferenceController()).execute(req, res),
};

const getTeamById: Route = {
    path: `${BASE_MODULE_PATH}/:id`,
    method: 'get',
    handler: (req, res) => (new GetTeamByIdController()).execute(req, res),
};

// Rever este get
const retreiveSquad: Route = {
    path: `${BASE_MODULE_PATH}/:id/squad`,
    method: 'get',
    handler: (req, res) => (new RetreiveSquadController()).execute(req, res),
};

const getTeamBulk: Route = {
    path: `${BASE_MODULE_PATH}/list`,
    method: 'post',
    handler: (req, res) => (new GetTeamBulkController()).execute(req, res),
};

export default [
    addPlayerToTeam,
    createTeam,
    getTeamById,
    getTeamByReference,
    retreiveSquad,
    getTeamBulk,
];
