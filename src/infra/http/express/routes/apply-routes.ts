import { Router } from 'express';

import { Route } from '../types';

export const applyRoutes = (routes: Route[], router: Router) => {
    routes.forEach((route) => {
        const { method, path, handler } = route;
        (router as any)[method](path, handler);
    });
};

export default applyRoutes;
