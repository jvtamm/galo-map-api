import { Either, left, right } from './either';

function isNothing(value: any) {
    return value === null;
}

function isEmpty(value: any) {
    if (isNothing(value) || value === '') {
        return true;
    }

    if (Array.isArray(value) && value.length === 0) {
        return true;
    }

    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }
    return false;
}

type MapFunction<T, U> = (x: T | null) => U;
type MaybeFunction<T, U> = MapFunction<T, Maybe<U>>;

export class Maybe<T> {
    private readonly _value: T | null;
    // _value: T | null;

    private constructor(value: T | null) {
        this._value = value;
    }

    isNone(): boolean {
        return this._value === null;
    }

    isSome(): boolean {
        return !this.isNone();
    }

    async asyncMap<U>(fn: MapFunction<T, Promise<U>>): Promise<Maybe<U>> {
        if (this.isNone()) {
            return Maybe.none<U>();
        }

        const value = await fn(this._value);
        return Maybe.some<U>(value);
    }

    map<U>(fn: MapFunction<T, U>): Maybe<U> {
        if (this.isNone()) {
            return Maybe.none<U>();
        }

        const value = fn(this._value);
        return Maybe.some<U>(value);
    }

    chain<U>(fn: MaybeFunction<T, U>): Maybe<U> {
        if (this.isNone()) {
            return Maybe.none<U>();
        }

        return fn(this._value);
    }

    cata<U>(fnNone: MapFunction<T, U>, fnSome: MapFunction<T, U>): U {
        if (this.isNone()) {
            return fnNone(this._value);
        }

        return fnSome(this._value);
    }

    fold<U>(ifNone: U): (ifSome: MapFunction<T, U>) => U {
        if (this.isNone()) {
            return () => ifNone;
        }

        const self = this;
        return (ifSome: MapFunction<T, U>) => ifSome(self._value);
    }

    orElse(value: T): T {
        if (this.isNone()) {
            return value;
        }

        return this._value as T;
    }

    ap<U>(maybeWithFn: Maybe<any>): Maybe<U> {
        if (this.isNone()) {
            return Maybe.none<U>();
        }

        const self = this;
        return maybeWithFn.map<U>((fn) => fn(self._value));
    }

    apply<U>(maybeWithFn: Maybe<any>, fnName?: string, ...args: any): Maybe<U> {
        if (this.isNone()) {
            return Maybe.none<U>();
        }

        return maybeWithFn.map<U>((maybe) => {
            if (fnName) {
                return maybe[fnName](this._value, ...args);
            }

            return maybe(this._value, ...args);
        });
    }

    async resolve<U>(): Promise<Maybe<U>> {
        const value = await this._value;

        if (value) {
            return Maybe.some<U>(value as unknown as U);
        }

        return Maybe.none<U>();
    }

    toPromise<U>(failValue: U): Promise<T> {
        return this.cata(
            () => Promise.reject(failValue),
            (value) => Promise.resolve(value as T),
        );
    }

    toEither<U>(failValue: U): Either<U, T> {
        if (this.isNone()) {
            return left<U, T>(failValue);
        }

        return right<U, T>(this._value as T);
    }

    join(): T {
        if (!this.isSome()) {
            throw new Error('Cannot join a null value');
        }

        return this._value as T;
    }

    static none<T>(): Maybe<T> {
        return new Maybe<T>(null);
    }

    static some<T>(value: T): Maybe<T> {
        return new Maybe<T>(value);
    }

    static fromNull<T>(value: T | null): Maybe<T> {
        if (isNothing(value)) {
            return Maybe.none<T>();
        }

        return Maybe.some<T>(value as T);
    }

    static fromUndefined<T>(value: T | undefined): Maybe<T> {
        if (value === undefined) {
            return Maybe.none<T>();
        }

        return Maybe.some<T>(value as T);
    }

    static fromEmpty<T>(value: T): Maybe<T> {
        if (isEmpty(value)) {
            return Maybe.none();
        }

        return Maybe.some<T>(value);
    }

    static of<T>(value: T): Maybe<T> {
        return Maybe.some<T>(value);
    }
}

export default Maybe;
