import { ObjectId } from 'mongodb';
import { injectable, inject } from 'inversify';

import GenericMongoRepository, { BaseCollection } from '@infra/database/mongodb/generic-repo';
import Maybe from '@core/maybe';
import { Contract } from '@modules/club/domain/contract';
import { ContractMap } from '@modules/club/mapper/contract-map';
import { ContractRepo } from '@modules/club/repos/contract-repo';
import { DatabaseDriver } from '@infra/contracts';
import { TYPES } from '@config/ioc/types';

import { SquadPlayerEmbedded } from './mongo-squad-repo';

export interface ContractCollection extends BaseCollection {
    teamId: ObjectId;
    teamName: string;
    player: SquadPlayerEmbedded;
    startingDate: Date;
    endingDate: Date;
}

type id = string | number;

@injectable()
class MongoContractRepo extends GenericMongoRepository<Contract, ContractCollection> implements ContractRepo {
    constructor(@inject(TYPES.DbClient) dbClient: DatabaseDriver) {
        const collectionName = 'Contract';

        super(
            dbClient,
            collectionName,
            ContractMap,
        );
    }

    // async getByTeamAndPlayer(teamId: id, playerId: id): Promise<Maybe<Contract[]>> {
    //     const playerObjectId = new ObjectId(playerId);
    //     const teamObjectId = new ObjectId(teamId);

    //     const contracts = await this.collection.find<ContractCollection>({
    //         playerId: playerObjectId,
    //         teamId: teamObjectId,
    //     }).toArray();

    //     return Maybe.fromNull(contracts)
    //         .map((c) => (c as ContractCollection[]).map(ContractMap.toDomain));
    // }

    async getByPeriod(teamId: id, startingDate: Date, endingDate?: Date): Promise<Contract[]> {
        const query: any = {
            teamId: new ObjectId(teamId),
            $or: [{ startingDate: { $gte: startingDate } }, { endingDate: { $gte: startingDate } }],
        };

        if (endingDate) {
            query.$or[0].startingDate.$lte = endingDate;
            query.$or[1].endingDate.$lte = endingDate;
        }

        // TODO: Paginate
        const contracts = await this.collection.find<ContractCollection>(query).toArray();

        return contracts.map(ContractMap.toDomain);
    }

    async getIncompleteContract(playerId: id, teamId: id, startingDate: Date): Promise<Maybe<Contract>> {
        const contract = await this.collection.findOne<ContractCollection>({
            endingDate: { $exists: true, $gte: startingDate },
            startingDate: { $exists: false },
            teamId: new ObjectId(teamId),
            'player._id': new ObjectId(playerId),
        });

        return Maybe.fromNull(contract).map(ContractMap.toDomain);
    }

    async getPlayerOpenContract(playerId: id, teamId: id, endingDate: Date): Promise<Maybe<Contract>> {
        const contract = await this.collection.findOne<ContractCollection>({
            endingDate: { $exists: false },
            startingDate: { $exists: true, $lte: endingDate },
            teamId: new ObjectId(teamId),
            'player._id': new ObjectId(playerId),
        });

        return Maybe.fromNull(contract).map(ContractMap.toDomain);
    }
}

export default MongoContractRepo;
