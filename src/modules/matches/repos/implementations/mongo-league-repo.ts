import { injectable, inject } from 'inversify';

import GenericMongoRepository, { BaseCollection } from '@infra/database/mongodb/generic-repo';
import Maybe from '@core/maybe';
import TYPES from '@config/ioc/types';
import { DatabaseDriver } from '@infra/contracts';
import { League } from '@modules/matches/domain/league';
import { LeagueMap } from '@modules/matches/mappers/league-map';
import { LeagueRepo } from '@modules/matches/repos/league-repo';

export interface LeagueCollection extends BaseCollection {
    name: string;
    organizedBy?: string
}

@injectable()
export class MongoLeagueRepo extends GenericMongoRepository<League, LeagueCollection> implements LeagueRepo {
    constructor(@inject(TYPES.DbClient) dbClient: DatabaseDriver) {
        const collectionName = 'League';

        super(
            dbClient,
            collectionName,
            LeagueMap,
        );
    }

    async exists(name: string): Promise<boolean> {
        const league = await this.getByName(name);

        return league.isSome();
    }

    async getByOrganizer(organizer: string): Promise<League[]> {
        // TODO: Paginate
        const leagues = await this.collection.find({ organizedBy: organizer }).toArray();

        return leagues.map(this.mapper.toDomain);
    }

    async getByName(name: string): Promise<Maybe<League>> {
        const league = await this.collection.findOne({ name });

        return Maybe.fromNull(league).map(this.mapper.toDomain);
    }
}
