import { ObjectId } from 'mongodb';

import Identifier from '@core/identifier';
import { Contract, Team, ContractProps } from '@modules/club/domain/contract';
import { ContractCollection } from '@modules/club/repos/implementations/mongo-contract-repo';
import { EmbeddedPlayer } from '@modules/club/domain/embedded-player';
import { StaticMapper } from '@infra/contracts/mapper';
import { EmbeddedPlayerMap } from './embedded-player-map';

export interface ContractDTO {
    id?: string;
    team: Team;
    player: EmbeddedPlayer;
    startingDate?: string;
    endingDate?: string;
}

export const ContractMap: StaticMapper<Contract, ContractCollection> = {
    toDomain: (raw: any) => {
        const _id = raw._id ? new Identifier<string>(raw._id.toString()) : undefined;
        const startingDate = raw.startingDate && new Date(raw.startingDate);
        const endingDate = raw.endingDate && new Date(raw.endingDate);

        const props = {
            team: {
                id: raw.teamId.toString(),
                name: raw.teamName,
            },
            player: EmbeddedPlayerMap.toDomain(raw.player),
            ...startingDate && { startingDate },
            ...endingDate && { endingDate },
        } as ContractProps;

        const contract = Contract.create(props, _id);

        return contract.value;
    },

    toPersistance: (contract: Contract) => {
        const _id = new ObjectId();
        const maybeId = contract.id
            .fold<ObjectId>(_id)((value) => new ObjectId(value as string));

        const maybeStartingDate = contract.startingDate
            .fold<Date | null>(null)((startingDate) => startingDate as Date);

        const maybeEndingDate = contract.endingDate
            .fold<Date | null>(null)((endingDate) => endingDate as Date);

        return {
            teamId: new ObjectId(contract.team.id),
            teamName: contract.team.name,
            player: EmbeddedPlayerMap.toPersistance(contract.player),
            ...maybeId && { _id: maybeId },
            ...maybeEndingDate && { endingDate: maybeEndingDate },
            ...maybeStartingDate && { startingDate: maybeStartingDate },
        } as ContractCollection;
    },

    toDTO: (contract: Contract) => ({
        id: contract.id.fold<string>('')((value) => value as string),
        team: contract.team,
        player: EmbeddedPlayerMap.toDTO(contract.player),
        startingDate: contract.startingDate.fold<string | undefined>(undefined)((date) => date?.toISOString()),
        endingDate: contract.endingDate.fold<string | undefined>(undefined)((date) => date?.toISOString()),
    } as ContractDTO),
};
