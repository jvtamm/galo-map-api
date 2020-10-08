import {
    Collection, ObjectId, InsertOneWriteOpResult, ReplaceWriteOpResult,
} from 'mongodb';
import { injectable, inject } from 'inversify';

import Maybe from '@core/maybe';
import TeamMap from '@modules/club/mapper/team-map';
import { CountryEmbedded } from '@modules/club/mapper/country-map';
import { DatabaseDriver } from '@infra/contracts';
import { ExternalReference, Refs } from '@modules/club/domain/external-references';
import { Stadium } from '@modules/club/domain/stadium';
import { TYPES } from '@config/ioc/types';
import { Team } from '@modules/club/domain/team';
import { TeamRepo } from '@modules/club/repos/team-repo';

export interface TeamCollection {
    _id?: ObjectId;
    name: string;
    abbreviation: string;
    displayName: string;
    country: CountryEmbedded;
    externalReferences: Refs[]
    founded?: number;
    primaryColor?: string;
    secondaryColor?: string;
    grounds?: Stadium[];
}

@injectable()
class MongoTeamRepo implements TeamRepo {
    private readonly _collectionName = 'Team';

    protected collection: Maybe<Collection>;

    constructor(@inject(TYPES.DbClient) dbClient: DatabaseDriver) {
        this.collection = dbClient.retreiveSchema<Collection>(this._collectionName);
    }

    async getTeamById(teamId: string | number): Promise<Maybe<Team>> {
        const _id = new ObjectId(teamId);

        return this.collection.map((model) => model?.findOne({ _id }))
            .toPromise<string>(`Could not find team with _id ${_id}`)
            .then((team) => {
                const maybeTeam = Maybe.fromNull(team);
                return maybeTeam.map(TeamMap.toDomain);
            });
    }

    async getTeamByRef(refs: Array<string | number>): Promise<Maybe<Team>> {
        const query = refs.map((ref) => ({ 'externalReferences.ref': ref }));

        return this.collection.map((model) => model?.findOne({ $or: query }))
            .toPromise<string>(`Could not find team with refs ${refs}`)
            .then((team) => {
                const maybeTeam = Maybe.fromNull(team);
                return maybeTeam.map(TeamMap.toDomain);
            });
    }

    async getBulk(refs: ExternalReference[]): Promise<Team[]> {
        const orExpressions = refs.map((ref) => ({
            'externalReferences.ref': ref.serialize(),
            'externalReferences.provider': ref.getProvider(),
        }));

        if (this.collection.isNone()) {
            return [];
        }

        const collection = this.collection.join();
        const players = await collection.find({ $or: orExpressions }).toArray();

        return players.map(TeamMap.toDomain);
    }

    async save(team: Team): Promise<string> {
        const persistance = TeamMap.toPersistance(team);

        return team.getId()
            .map(() => TeamMap.toPersistance(team) as TeamCollection)
            .cata<Promise<string>>(
                async () => this.insertOne(persistance),
                async () => this.replaceOne(persistance),
            );
    }

    private async insertOne(team: TeamCollection): Promise<string> {
        const result = await this.collection.asyncMap<InsertOneWriteOpResult<any>>(
            (model) => model?.insertOne(team) as Promise<InsertOneWriteOpResult<any>>,
        );

        return result.fold('')(
            (op) => op?.insertedId.toString(),
        );
    }

    private async replaceOne(team: TeamCollection): Promise<string> {
        const result = await this.collection.asyncMap<ReplaceWriteOpResult>(
            (model) => model?.replaceOne({ _id: team._id }, team) as Promise<ReplaceWriteOpResult>,
        );

        return result.fold('')(
            (op) => op?.upsertedId._id.toHexString() as string,
        );
    }
}

export default MongoTeamRepo;
