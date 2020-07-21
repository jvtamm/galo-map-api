import { handleCors, handleBodyRequestParsing } from './common';

export default [
    handleCors,
    handleBodyRequestParsing,
];

export * from './apply-middleware';
