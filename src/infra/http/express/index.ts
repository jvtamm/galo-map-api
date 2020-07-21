import http from 'http';
import https from 'https';
import express from 'express';
import { once } from 'events';
import { AddressInfo } from 'net';

import { Server, HttpServerOptions } from '@infra/contracts';
import routes, { applyRoutes } from './routes';
import middleware, { applyMiddleware } from './middleware';

class ExpressServer implements Server {
    private _listening: boolean = false;

    private readonly _expressApp: express.Application;

    private readonly _server: http.Server | https.Server;

    private readonly _serverOptions: HttpServerOptions;

    private _address: string | AddressInfo | null = '';

    constructor() {
        this._expressApp = express();
        this._serverOptions = {
            protocol: 'http',
            port: process.env.port ? parseInt(process.env.port, 10) : 3000,
        };

        this._server = http.createServer(this._expressApp);

        this._configServer();

        // if (this._protocol === 'https') {
        //     this.server = https.createServer(
        //         this.serverOptions as https.ServerOptions,
        //         this.requestListener,
        //     );
        // } else {
        //     this.server = http.createServer(this.requestListener);
        // }
    }

    async start(): Promise<void> {
        this._server.listen(this._serverOptions);
        await once(this._server, 'listening');

        this._listening = true;
        this._address = this._server.address();
    }

    async stop(): Promise<void> {
        this._server.close();
        await once(this._server, 'close');
        this._listening = false;
    }

    listening(): boolean {
        return this._listening;
    }

    port(): number {
        if (typeof this._address === 'string') return 0;
        return (this._address && this._address.port) || this._serverOptions.port;
    }

    host(): string | undefined {
        if (typeof this._address === 'string') return this._serverOptions.host || 'localhost';

        return (this._address && this._address.address) || this._serverOptions.host;
    }

    private _configServer() {
        applyMiddleware(middleware, this._expressApp);
        applyRoutes(routes, this._expressApp);
    }
}

export default ExpressServer;
