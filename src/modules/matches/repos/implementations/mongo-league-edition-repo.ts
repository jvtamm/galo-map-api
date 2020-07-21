import { inject, injectable } from 'inversify';

import GenericMongoRepository, { BaseCollection } from '@infra/database/mongodb/generic-repo';
import TYPES from '@config/ioc/types';
import { DatabaseDriver } from '@infra/contracts';
import { EmbeddedLeague } from '@modules/matches/mappers/league-map';
import { EmbeddedSeason } from '@modules/matches/mappers/season-map';
import { LeagueEdition } from '@modules/matches/domain/league-edition';
import { LeagueEditionMap } from '@modules/matches/mappers/league-edition-map';
import { LeagueEditionRepo } from '@modules/matches/repos/league-edition';
import Maybe from '@core/maybe';
import { ObjectId } from 'mongodb';

export interface LeagueEditionCollection extends BaseCollection {
    league: EmbeddedLeague;
    season: EmbeddedSeason;
    startingDate?: Date;
    endingDate?: Date;
}

@injectable()
export class MongoLeagueEditionRepo extends GenericMongoRepository<LeagueEdition, LeagueEditionCollection>
    implements LeagueEditionRepo {
    constructor(@inject(TYPES.DbClient) dbClient: DatabaseDriver) {
        const collectionName = 'LeagueEdition';

        super(
            dbClient,
            collectionName,
            LeagueEditionMap,
        );
    }

    async exists(leagueName: string, seasonYear: number): Promise<boolean> {
        const maybeLeagueEdition = await this.getByLeagueSeason(leagueName, seasonYear);

        return maybeLeagueEdition.isSome();
    }

    async getByLeagueSeason(leagueName: string, seasonYear: number): Promise<Maybe<LeagueEdition>> {
        const leagueEdition = await this.collection.findOne({
            'league.name': leagueName,
            'season.year': seasonYear,
        });

        return Maybe.fromNull(leagueEdition).map(this.mapper.toDomain);
    }

    async getById(id: string): Promise<Maybe<LeagueEdition>> {
        const _id = new ObjectId(id);

        const leagueEdition = await this.collection.findOne({ _id });

        return Maybe.fromNull(leagueEdition).map(this.mapper.toDomain);
    }
}
