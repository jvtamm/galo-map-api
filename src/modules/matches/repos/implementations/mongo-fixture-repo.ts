import GenericMongoRepository, { BaseCollection } from '@infra/database/mongodb/generic-repo';
import TYPES from '@config/ioc/types';
import { DatabaseDriver } from '@infra/contracts';
import { EmbeddedLeagueEdition } from '@modules/matches/mappers/league-edition-map';
import { EmbeddedStadium } from '@modules/matches/mappers/stadium-map';
import { Fixture, FixtureTeam } from '@modules/matches/domain/fixture';
import { FixtureMap } from '@modules/matches/mappers/fixture-map';
import { FixtureRepo, FixtureFilters } from '@modules/matches/repos/fixture-repo';
import { LeagueEditionRepo } from '@modules/matches/repos/league-edition';
import { Refs } from '@modules/club/domain/external-references';
import { TeamCollection } from '@modules/matches/mappers/team-map';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

interface EmbeddedFixtureTeam {
    team: TeamCollection;
    score: number;
    currentPosition?: number;
}

export interface FixtureCollection extends BaseCollection {
    leagueEdition: EmbeddedLeagueEdition;
    round: string;
    homeTeam: EmbeddedFixtureTeam;
    awayTeam: EmbeddedFixtureTeam;
    matchDate: Date;
    ground: EmbeddedStadium;
    externalReferences: Refs[];
    referee?: string;
}

@injectable()
export class MongoFixtureRepo extends GenericMongoRepository<Fixture, FixtureCollection> implements FixtureRepo {
    private _leagueEditionRepo: LeagueEditionRepo;

    constructor(
        @inject(TYPES.DbClient) dbClient: DatabaseDriver,
        @inject(TYPES.LeagueEditionRepo) leagueEditionRepo: LeagueEditionRepo,
    ) {
        const collectionName = 'Fixture';

        super(
            dbClient,
            collectionName,
            FixtureMap,
        );

        this._leagueEditionRepo = leagueEditionRepo;
    }

    async exists(homeTeam: FixtureTeam, awayTeam: FixtureTeam, matchDate: Date): Promise<boolean> {
        const homeTeamId = homeTeam.team.id.fold('')((id) => id as string);
        const awayTeamId = awayTeam.team.id.fold('')((id) => id as string);

        const maybeFixture = await this.collection.findOne({
            'homeTeam.team._id': new ObjectId(homeTeamId),
            'awayTeam.team._id': new ObjectId(awayTeamId),
            matchDate,
        });

        return Boolean(maybeFixture);
    }

    // eslint-disable-next-line class-methods-use-this
    protected loadDependencies(collectionObject: FixtureCollection): any {
        const object: any = { ...collectionObject };

        object.leagueEdition = {
            _id: collectionObject.leagueEdition._id,
            league: { name: collectionObject.leagueEdition.name },
            season: { year: collectionObject.leagueEdition.year },
        };

        return object;

        // const leagueEdition = await this._leagueEditionRepo.getById(collectionObject.leagueEdition._id.toHexString());

        // if (leagueEdition.isNone()) return collectionObject;

        // object.leagueEdition = leagueEdition.join();
        // return object;
    }

    // eslint-disable-next-line class-methods-use-this
    private createFilterQuery(filters: FixtureFilters) {
        const filtersMap = new Map<string, Function>();
        filtersMap.set('year', (query: any, value: number) => {
            query.$and.push({
                matchDate: {
                    $gte: new Date(value, 0, 1, 0, 0, 0),
                    $lt: new Date(value, 11, 31, 23, 59, 59),
                },
            });
            return query;
        });

        const query: any = {
            $and: [],
        };

        Object.entries(filters).forEach(([key, value]) => {
            const handler = filtersMap.get(key);
            if (handler) handler(query, value);
        });

        return query;
    }

    async search(filters: FixtureFilters): Promise<Fixture[]> {
        const query = this.createFilterQuery(filters);

        const fixtures = await this.collection.find(query).toArray();

        const result: Fixture[] = [];
        for (let i = 0; i < fixtures.length; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            const processedObj = await this.loadDependencies(fixtures[i]);

            result.push(this.mapper.toDomain(processedObj));
        }

        return result;
    }
}
