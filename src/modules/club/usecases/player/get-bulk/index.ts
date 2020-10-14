import PositionMap from '@modules/club/mapper/position-map';
import Result from '@core/result';
import {
    ExternalReference, ExternalReferenceFactory, Refs, RefDTO,
} from '@modules/club/domain/external-references';
import { PlayerDTO } from '@modules/club/mapper/player-map';
import { PlayerRepo } from '@modules/club/repos/player-repo';
import { UseCase } from '@core/usecase';

import { GetPlayerBulkDTO } from './dto';
import GetPlayerBulkErrors from './errors';

export interface PlayerBulkItem extends PlayerDTO {
    externalReferences: Refs[] | null;
}

export type GetPlayerBulkResponse = Result<PlayerBulkItem[]>;

export class GetPlayerBulk implements UseCase<GetPlayerBulkDTO, GetPlayerBulkResponse> {
    // eslint-disable-next-line no-empty-function
    constructor(private _playerRepo: PlayerRepo) {}

    async execute(request: GetPlayerBulkDTO): Promise<GetPlayerBulkResponse> {
        const { externalReferences } = request;

        if (!externalReferences || !externalReferences.length) {
            return Result.fail<PlayerBulkItem[]>(GetPlayerBulkErrors.ReferencesMandatory);
        }

        try {
            const references = this.getReferences(externalReferences);
            if (!references.length) {
                return Result.fail<PlayerBulkItem[]>(GetPlayerBulkErrors.InvalidReferences);
            }

            const players = await this._playerRepo.getBulk(references);
            const dto = players.map((p) => ({
                id: p.getId().fold<string>('')((value) => value as string),
                name: p.getName(),
                dateOfBirth: p.getDateOfBirth() ? p.getDateOfBirth().toISOString() : '',
                nationality: p.getNationality(),
                position: PositionMap.toDTO(p.getPosition()),
                externalReferences: p.getRefs().fold<Refs[] | null>(null)((value) => value as Refs[]),
                displayName: p.getDisplayName().fold<string>('')((value) => value as string),
                jersey: p.getJersey().fold<number | null>(null)((jersey) => jersey as number),
                height: p.getHeight().fold<number | null>(null)((height) => height as number),
                weight: p.getWeight().fold<number | null>(null)((weight) => weight as number),
            } as PlayerBulkItem));

            return Result.ok<PlayerBulkItem[]>(dto);
        } catch (e) {
            console.log(e);
            return Result.fail<PlayerBulkItem[]>(GetPlayerBulkErrors.UnexpectedError);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    getReferences(refs: RefDTO[]): ExternalReference[] {
        let references: ExternalReference[] = [];

        refs.forEach((ref) => {
            const currentRef = ExternalReferenceFactory.fromDTO(ref);
            references = references.concat(currentRef);
        });

        return references;
    }
}

export * from './dto';
export * from './errors';
