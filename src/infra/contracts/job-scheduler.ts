interface ScheduleOption<T> {
    interval: string | Date;
    action: 'repeatEvery' | 'schedule';
    data?: T;
}

export interface JobOptions<T> {
    name: string;
    handler?: Function;
    schedule?: ScheduleOption<T>;
}

export interface JobScheduler {
    start(): Promise<void>;
    stop(): Promise<void>;
    scheduleJob<T>(options: JobOptions<T>): void;
}
