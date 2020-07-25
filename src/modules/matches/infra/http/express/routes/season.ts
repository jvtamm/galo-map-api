import { Route } from '@infra/http/express/types';

// import { ListSeasonController } from '@modules/matches/infra/http/express/controllers/season';
import { GetSeasonByYearController } from '@modules/matches/infra/http/express/controllers/season/getByYear';

const BASE_MODULE_PATH = '/season';

// const listSeason: Route = {
//     path: BASE_MODULE_PATH,
//     method: 'get',
//     handler: (req, res) => (new ListSeasonController()).execute(req, res),
// };

const getSeasonByYear: Route = {
    path: BASE_MODULE_PATH,
    method: 'get',
    handler: (req, res) => (new GetSeasonByYearController()).execute(req, res),
};

export default [
    // listSeason,
    getSeasonByYear,
];
