import {
    Collection, ObjectId, InsertOneWriteOpResult, ReplaceWriteOpResult,
} from 'mongodb';
import { injectable, inject } from 'inversify';

import Maybe from '@core/maybe';
import { CountryEmbedded } from '@modules/club/mapper/country-map';
import { DatabaseDriver } from '@infra/contracts';
import { Player } from '@modules/club/domain/player';
import { PlayerMap } from '@modules/club/mapper/player-map';
import { PlayerRepo } from '@modules/club/repos/player-repo';
import { PositionProps } from '@modules/club/domain/position';
import { ExternalReference, Refs } from '@modules/club/domain/external-references';
import { TYPES } from '@config/ioc/types';

export interface PlayerCollection {
    _id?: ObjectId;
    name: string;
    dateOfBirth: Date;
    position: PositionProps;
    nationality: CountryEmbedded;
    externalReferences: Refs[]
    displayName?: string;
    jersey?: number;
    height?: number;
    weight?: number;
}

@injectable()
class MongoPlayerRepo implements PlayerRepo {
    private readonly _collectionName = 'Player';

    protected collection: Maybe<Collection>;

    constructor(@inject(TYPES.DbClient) dbClient: DatabaseDriver) {
        this.collection = dbClient.retreiveSchema<Collection>(this._collectionName);
    }

    async getPlayerById(playerId: string | number): Promise<Maybe<Player>> {
        const _id = new ObjectId(playerId);

        return this.collection.map((model) => model?.findOne({ _id }))
            .toPromise<string>(`Could not find player with _id ${_id}`)
            .then((player) => {
                const maybePlayer = Maybe.fromNull(player);
                return maybePlayer.map(PlayerMap.toDomain);
            });
    }

    async getPlayerByRef(refs: Array<string | number>): Promise<Maybe<Player>> {
        const query = refs.map((ref) => ({ 'externalReferences.ref': ref }));

        return this.collection.map((model) => model?.findOne({ $or: query }))
            .toPromise<string>(`Could not find player with refs ${refs}`)
            .then((player) => {
                const maybePlayer = Maybe.fromNull(player);
                return maybePlayer.map(PlayerMap.toDomain);
            });
    }

    async getBulk(refs: ExternalReference[]): Promise<Player[]> {
        const orExpressions = refs.map((ref) => ({
            'externalReferences.ref': ref.serialize(),
            'externalReferences.provider': ref.getProvider(),
        }));

        if (this.collection.isNone()) {
            return [];
        }

        const collection = this.collection.join();
        const players = await collection.find({ $or: orExpressions }).toArray();

        return players.map(PlayerMap.toDomain);
    }

    async save(player: Player): Promise<string> {
        const persistance = PlayerMap.toPersistance(player);

        return player.getId()
            .map(() => PlayerMap.toPersistance(player) as PlayerCollection)
            .cata<Promise<string>>(
                async () => this.insertOne(persistance),
                async () => this.replaceOne(persistance),
            );
    }

    private async insertOne(player: PlayerCollection): Promise<string> {
        const result = await this.collection.asyncMap<InsertOneWriteOpResult<any>>(
            (model) => model?.insertOne(player) as Promise<InsertOneWriteOpResult<any>>,
        );

        return result.fold('')(
            (op) => op?.insertedId.toString(),
        );
    }

    private async replaceOne(player: PlayerCollection): Promise<string> {
        const { _id } = player;

        const result = await this.collection.asyncMap<ReplaceWriteOpResult>(
            (model) => model?.replaceOne({ _id }, player) as Promise<ReplaceWriteOpResult>,
        );

        return result.fold('')(
            (op) => op?.upsertedId._id.toHexString() as string,
        );
    }
}

export default MongoPlayerRepo;
