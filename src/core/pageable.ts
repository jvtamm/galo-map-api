interface Cursor<T> {
    startingAfter: T;
    endingBefore: T;
}

interface PageableProps {
    limit: number,
    cursor?: Cursor<string>
}

export interface Pageable<T> {
    limit(): number;
    cursor(): Cursor<T>;
}

export class DefaultPageable implements Pageable<string> {
    private readonly _limit: number;

    private readonly _cursor: Cursor<string>;

    private constructor(limit: number, cursor: Cursor<string>) {
        this._limit = limit;
        this._cursor = cursor;
    }

    static create({ limit = 10, cursor }: PageableProps): Pageable<string> {
        const boundedLimit = DefaultPageable.boundLimit(limit);

        const defaultCursor: Cursor<string> = {
            startingAfter: '',
            endingBefore: '',
        } || cursor;

        return new DefaultPageable(boundedLimit, defaultCursor);
    }

    limit(): number {
        return this._limit;
    }

    cursor(): Cursor<string> {
        return this._cursor;
    }

    private static boundLimit(limit: number): number {
        if (limit > 100) return 100;
        if (limit < 1) return 1;

        return limit;
    }
}
