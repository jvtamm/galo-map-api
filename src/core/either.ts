/* eslint-disable max-classes-per-file */

import { Maybe } from './maybe';

type EitherFunction<L, B> = (x: any) => Either<L, B>;
type AsyncEitherFunction<L, B> = (x: any) => Promise<B>;

export interface Either<L, A> {
    map(fn: Function): Either<L, A>;
    chain<B>(fn: EitherFunction<L, B>): Either<L, B>;
    asyncChain<B>(fn: AsyncEitherFunction<L, B>, ...args: any) : Promise<Either<L, B>>
    fold<T = any>(fnLeft: Function, fnRight: Function): T;
    isSuccess(): boolean;
    join(): L | A;
    toMaybe(): Maybe<A | null>;
    toPromise(): Promise<L | A>;
}

export class Left<L, A> implements Either<L, A> {
    private readonly _value: L;

    constructor(value: L) {
        this._value = value;
    }

    map(): Either<L, A> {
        return this;
    }

    chain<B>(): Either<L, B> {
        // return this;
        return new Left<L, B>(this._value);
    }

    async asyncChain<B>() : Promise<Either<L, B>> {
        const f = () => { throw this._value; };
        // eslint-disable-next-line no-use-before-define
        const value = await fromTry<L, B>(f, this._value);
        return value;
    }

    fold<T = any>(fnLeft: Function): T {
        return fnLeft(this._value);
    }

    // eslint-disable-next-line class-methods-use-this
    isSuccess(): boolean {
        return false;
    }

    join(): L {
        return this._value;
    }

    // eslint-disable-next-line class-methods-use-this
    toMaybe(): Maybe<A | null> {
        return Maybe.none();
    }

    toPromise(): Promise<L | A> {
        return Promise.reject(this._value);
    }
}

export class Right<L, A> implements Either<L, A> {
    private readonly _value: A;

    constructor(value: A) {
        this._value = value;
    }

    map(fn: Function): Either<L, A> {
        const value = fn(this._value);

        return new Right<L, A>(value);
    }

    chain<B>(fn: EitherFunction<L, B>): Either<L, B> {
        return fn(this._value);
    }

    async asyncChain<B>(fn: AsyncEitherFunction<L, B>) : Promise<Either<L, B>> {
        // eslint-disable-next-line no-use-before-define
        const value = await fromTry<L, B>(fn, this._value);
        return value;
    }

    fold<T = any>(fnLeft: Function, fnRight: Function): T {
        return fnRight(this._value);
    }

    // eslint-disable-next-line class-methods-use-this
    isSuccess(): boolean {
        return true;
    }

    join(): A {
        return this._value;
    }

    toMaybe(): Maybe<A> {
        return Maybe.some<A>(this._value);
    }

    toPromise(): Promise<L | A> {
        return Promise.resolve(this._value);
    }
}

export const left = <L, A>(l: L): Either<L, A> => new Left<L, A>(l);

export const right = <L, A>(a: A): Either<L, A> => new Right<L, A>(a);

export const fromTry = async <L, A>(fn: Function, ...args: any): Promise<Either<L, A>> => {
    try {
        const value = await fn(...args);
        return new Right<L, A>(value);
    } catch (e) {
        const errorMessage = e.toString();
        return new Left<L, A>(errorMessage);
    }
};

export const fromPromise = <L, A>(promise: Promise<A>): Promise<Either<L, A>> => promise.then(
    (v) => right<L, A>(v),
    (v) => {
        const value = v as L;
        return left<L, A>(value);
    },
);
