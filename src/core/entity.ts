import Identifier from './identifier';
import Maybe from './maybe';

// eslint-disable-next-line no-use-before-define
const isEntity = (v: any): v is Entity<any, any> => v instanceof Entity;

abstract class Entity<T, U> {
    protected readonly _id: Identifier<U> | undefined;

    protected readonly props: T;

    constructor(props: T, id?: Identifier<U>) {
        this._id = id || undefined;
        this.props = props;
    }

    public equals(object?: Entity<T, U>): boolean {
        if (object == null || object === undefined) {
            return false;
        }

        if (this === object) {
            return true;
        }

        if (!isEntity(object)) {
            return false;
        }

        return !!((this._id && this._id.equals(object._id)));
    }

    public persisted(): boolean {
        return Boolean(this._id);
    }

    get id(): Maybe<U> {
        return Maybe.fromUndefined<U>(this._id?.toValue());
    }
}

export default Entity;
