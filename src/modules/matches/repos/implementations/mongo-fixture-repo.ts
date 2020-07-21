import GenericMongoRepository, { BaseCollection } from '@infra/database/mongodb/generic-repo';
import TYPES from '@config/ioc/types';
import { DatabaseDriver } from '@infra/contracts';
import { EmbeddedLeagueEdition } from '@modules/matches/mappers/league-edition-map';
import { EmbeddedStadium } from '@modules/matches/mappers/stadium-map';
import { Fixture, FixtureTeam } from '@modules/matches/domain/fixture';
import { FixtureMap } from '@modules/matches/mappers/fixture-map';
import { FixtureRepo } from '@modules/matches/repos/fixture-repo';
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

    protected async loadDependencies(collectionObject: FixtureCollection): Promise<any> {
        const object: any = { ...collectionObject };
        const leagueEdition = await this._leagueEditionRepo.getById(collectionObject.leagueEdition._id.toHexString());

        if (leagueEdition.isNone()) return collectionObject;

        object.leagueEdition = leagueEdition.join();
        return object;
    }
}
