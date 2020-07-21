/* eslint-disable import/no-extraneous-dependencies */

const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

// const cleanup = tsConfigPaths.register({
tsConfigPaths.register({
    baseUrl: tsConfig.compilerOptions.outDir,
    paths: tsConfig.compilerOptions.paths,
});

// When path registration is no longer needed
// cleanup();
