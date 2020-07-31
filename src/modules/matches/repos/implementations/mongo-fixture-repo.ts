import GenericMongoRepository, { BaseCollection } from '@infra/database/mongodb/generic-repo';
import Maybe from '@core/maybe';
import TYPES from '@config/ioc/types';
import { DatabaseDriver } from '@infra/contracts';
import { EmbeddedLeagueEdition } from '@modules/matches/mappers/league-edition-map';
import { EmbeddedStadium } from '@modules/matches/mappers/stadium-map';
import { Fixture, FixtureTeam, FixtureStatus } from '@modules/matches/domain/fixture';
import { FixtureDetailsRepo } from '@modules/matches/repos/fixture-details-repo';
import { FixtureMap } from '@modules/matches/mappers/fixture-map';
import { FixtureRepo, FixtureFilters } from '@modules/matches/repos/fixture-repo';
import { ObjectId } from 'mongodb';
import { Refs } from '@modules/club/domain/external-references';
import { TeamCollection } from '@modules/matches/mappers/team-map';
import { inject, injectable } from 'inversify';
import { FixtureDetails } from '@modules/matches/domain/fixture-details';

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
    status: FixtureStatus;
    matchDate: Date;
    ground: EmbeddedStadium;
    externalReferences: Refs[];
    referee?: string;
}

@injectable()
export class MongoFixtureRepo extends GenericMongoRepository<Fixture, FixtureCollection> implements FixtureRepo {
    private _fixtureDetailsRepo: FixtureDetailsRepo;

    constructor(
        @inject(TYPES.DbClient) dbClient: DatabaseDriver,
        @inject(TYPES.FixtureDetailsRepo) fixtureDetailsRepo: FixtureDetailsRepo,
    ) {
        const collectionName = 'Fixture';

        super(
            dbClient,
            collectionName,
            FixtureMap,
        );

        this._fixtureDetailsRepo = fixtureDetailsRepo;
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

    async save(entity: Fixture): Promise<Fixture> {
        const fixture = await super.save(entity);

        const fixtureId = fixture.id.fold('')((id) => id as string);

        const maybeDetails = entity.details;
        if (maybeDetails.isSome()) {
            await this._fixtureDetailsRepo.save(fixtureId, maybeDetails.join());
        }

        return fixture;
    }

    async getById(id: string): Promise<Maybe<Fixture>> {
        const _id = new ObjectId(id);
        const fixture = await this.collection.findOne({ _id });

        if (!fixture) return Maybe.none();

        const maybeDetails = await this._fixtureDetailsRepo.getByMatchId(id);
        fixture.details = maybeDetails.fold<undefined | FixtureDetails>(undefined)((value) => value as FixtureDetails);

        return Maybe.fromNull(fixture).map(this.loadDependencies).map(this.mapper.toDomain);
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
