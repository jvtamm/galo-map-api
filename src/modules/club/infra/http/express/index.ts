import contractRoutes from './routes/contract';
import playerRoutes from './routes/player';
import teamRoutes from './routes/team';

export default [
    ...contractRoutes,
    ...playerRoutes,
    ...teamRoutes,
];
