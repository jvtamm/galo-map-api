import {
    ObjectId, Collection, InsertOneWriteOpResult, ReplaceWriteOpResult,
} from 'mongodb';
import { injectable, inject } from 'inversify';

import Maybe from '@core/maybe';
import SquadMap from '@modules/club/mapper/squad-map';
import TYPES from '@config/ioc/types';
import { CountryEmbedded } from '@modules/club/mapper/country-map';
import { DatabaseDriver } from '@infra/contracts';
import { Squad } from '@modules/club/domain/squad';
import { SquadRepo } from '@modules/club/repos/squad-repo';
import { PositionProps } from '@modules/club/domain/position';

export interface SquadPlayerEmbedded {
    _id: ObjectId;
    name: string;
    nationality: CountryEmbedded;
    position: PositionProps;
}

export interface SquadCollection {
    _id?: ObjectId;
    teamId: ObjectId;
    teamName: string;
    teamCountry: CountryEmbedded;
    squad?: SquadPlayerEmbedded[];
}

@injectable()
class MongoSquadRepo implements SquadRepo {
    private readonly _collectionName = 'Squad';

    protected collection: Maybe<Collection>;

    constructor(@inject(TYPES.DbClient) dbClient: DatabaseDriver) {
        this.collection = dbClient.retreiveSchema<Collection>(this._collectionName);
    }

    async getSquadByTeam(teamId: string | number): Promise<Maybe<Squad>> {
        const _id = new ObjectId(teamId);

        const result = await this.collection.asyncMap<SquadCollection>(
            (model) => model?.findOne({ teamId: _id }) as Promise<SquadCollection>,
        );

        return result.map(SquadMap.toDomain);
    }

    async save(squad: Squad): Promise<string> {
        const persistance = SquadMap.toPersistance(squad);

        return squad.getId()
            .cata<Promise<string>>(
                async () => this.insertOne(persistance),
                async () => this.replaceOne(persistance),
            );
    }

    private async insertOne(squad: SquadCollection): Promise<string> {
        const result = await this.collection.asyncMap<InsertOneWriteOpResult<any>>(
            (model) => model?.insertOne(squad) as Promise<InsertOneWriteOpResult<any>>,
        );

        return result.fold('')(
            (op) => op?.insertedId.toString(),
        );
    }

    private async replaceOne(squad: SquadCollection): Promise<string> {
        const result = await this.collection.asyncMap<ReplaceWriteOpResult>((model) => (
                model?.replaceOne({ _id: squad._id }, squad) as Promise<ReplaceWriteOpResult>
        ));

        return result.fold('')(
            (op) => op?.ops[0]._id.toHexString() as string,
        );
    }
}

export default MongoSquadRepo;
