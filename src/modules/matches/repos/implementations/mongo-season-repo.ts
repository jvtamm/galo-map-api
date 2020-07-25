import { injectable, inject } from 'inversify';

import GenericMongoRepository, { BaseCollection } from '@infra/database/mongodb/generic-repo';
import Maybe from '@core/maybe';
import { SeasonRepo, SeasonRange } from '@modules/matches/repos/season-repo';
import { DatabaseDriver } from '@infra/contracts';
import { TYPES } from '@config/ioc/types';
import { Season } from '@modules/matches/domain/season';
import { SeasonMap } from '@modules/matches/mappers/season-map';

export interface SeasonCollection extends BaseCollection {
    year: number;
    label?: string;
}

@injectable()
export class MongoSeasonRepo extends GenericMongoRepository<Season, SeasonCollection> implements SeasonRepo {
    constructor(@inject(TYPES.DbClient) dbClient: DatabaseDriver) {
        const collectionName = 'Season';

        super(
            dbClient,
            collectionName,
            SeasonMap,
        );
    }

    async exists(year: number): Promise<boolean> {
        const season = await this.getByYear(year);

        return season.isSome();
    }

    async getByYear(year: number): Promise<Maybe<Season>> {
        const season = await this.collection.findOne<SeasonCollection>({ year });

        return Maybe.fromNull(season).map(this.mapper.toDomain);
    }

    async getRange(year: number, range?: number): Promise<SeasonRange> {
        const previous = await this.collection.find({ year: { $lt: year } }).sort({ year: -1 }).limit(range || 1).toArray();
        const next = await this.collection.find({ year: { $gt: year } }).sort({ year: 1 }).limit(range || 1).toArray();

        return {
            previous: previous.map(this.mapper.toDomain),
            next: next.map(this.mapper.toDomain),
        };
    }

    async list(): Promise<Season[]> {
        const seasons = await this.collection.find().sort({ year: 1 }).toArray();

        return seasons.map(this.mapper.toDomain);
    }
}
