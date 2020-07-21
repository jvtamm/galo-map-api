export class Result<T> {
    private _isSuccess: boolean;

    private _error: T | string;

    private _value: T;

    private constructor(isSuccess: boolean, error?: T | string, value?: T) {
        if (isSuccess && error) {
            throw new Error('InvalidOperation: A result cannot be successful and contain an error');
        }
        if (!isSuccess && !error) {
            throw new Error('InvalidOperation: A failing result needs to contain an error message');
        }

        this._isSuccess = isSuccess;
        this._error = error || '';
        this._value = value as T;

        Object.freeze(this);
    }

    public get value(): T {
        if (!this._isSuccess) {
            throw new Error("Can't get the value of an error result. Use 'errorValue' instead.");
        }

        return this._value;
    }

    public get error(): T | string {
        if (typeof this._error === 'string') {
            return this._error as string;
        }
        return this._error as T;
    }

    public get success(): boolean {
        return this._isSuccess;
    }

    public get failure(): boolean {
        return !this._isSuccess;
    }

    public static ok<U>(value?: U): Result<U> {
        return new Result<U>(true, undefined, value);
    }

    public static fail<U>(error: string): Result<U> {
        return new Result<U>(false, error);
    }

    public static combine(results: Result<any>[]): Result<any> {
        for (let i = 0; i < results.length; i += 1) {
            const result = results[i];

            if (!result.success) return result;
        }

        return Result.ok();
    }
}

export default Result;
