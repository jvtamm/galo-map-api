import clubRoutes from '@modules/club/infra/http/express';
import locationRoutes from '@modules/location/infra/http/express';
import matchesRoutes from '@modules/matches/infra/http/express';

export default [
    ...clubRoutes,
    ...locationRoutes,
    ...matchesRoutes,
];

export * from './apply-routes';
