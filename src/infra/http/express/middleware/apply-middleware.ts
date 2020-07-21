import { Router } from 'express';

import { Wrapper } from '../types';

export const applyMiddleware = (middlewareWrappers: Wrapper[], router: Router) => {
    middlewareWrappers.forEach((wrapper) => {
        wrapper(router);
    });
};

export default applyMiddleware;
