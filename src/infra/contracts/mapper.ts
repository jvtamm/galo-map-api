export interface Mapper<T> {
    // toDomain(raw: any): T;
    // toPersistance(entity: T): any;
}

export interface StaticMapper<TEntity, TPersistance> {
    toDomain: (raw: any) => TEntity;
    toPersistance: (entity: TEntity) => TPersistance;
    toDTO: (entity: TEntity) => any;
}
