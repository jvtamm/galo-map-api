export interface Server {
    // readonly listening: boolean;

    start(): Promise<void>;
    stop(): Promise<void>;
    listening(): boolean;
    port(): number;
    host(): string | undefined;
}

export interface HttpServerOptions {
    protocol: 'http' | 'https';
    port: number;
    host?: string;
}
