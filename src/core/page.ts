interface PageDTO<T> {
    hasMore: boolean,
    data: T
}

export interface Page<T> {
    getContent(): T;
    // of<T>(content: T, hasMore: boolean): Page<T>
    toDTO(): PageDTO<T>
}

export class DefaultPage<T> implements Page<T> {
    private _content: T;

    private _hasMore: boolean;

    private constructor(content: T, hasMore: boolean) {
        this._content = content;
        this._hasMore = hasMore;
    }

    getContent(): T {
        return this._content;
    }

    static of<T>(content: T, hasMore: boolean): Page<T> {
        return new DefaultPage<T>(content, hasMore);
    }

    toDTO(): PageDTO<T> {
        return {
            hasMore: this._hasMore,
            data: this._content,
        } as PageDTO<T>;
    }
}
