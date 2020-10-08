import Result from '@core/result';
import {
    ExternalReference, ExternalReferenceFactory, Refs, RefDTO,
} from '@modules/club/domain/external-references';
import { UseCase } from '@core/usecase';
import { TeamDTO } from '@modules/club/mapper/team-map';
import { TeamRepo } from '@modules/club/repos/team-repo';

import { GetTeamBulkDTO } from './dto';
import { GetTeamBulkErrors } from './errors';

export interface TeamBulkItem extends TeamDTO {
    externalReferences: Refs[] | null;
}

export type GetTeamBulkResponse = Result<TeamBulkItem[]>;

export class GetTeamBulk implements UseCase<GetTeamBulkDTO, GetTeamBulkResponse> {
    // eslint-disable-next-line no-empty-function
    constructor(private _teamRepo: TeamRepo) {}

    async execute(request: GetTeamBulkDTO): Promise<GetTeamBulkResponse> {
        const { externalReferences } = request;

        if (!externalReferences || !externalReferences.length) {
            return Result.fail<TeamBulkItem[]>(GetTeamBulkErrors.ReferencesMandatory);
        }

        try {
            const references = this.getReferences(externalReferences);
            if (!references.length) {
                return Result.fail<TeamBulkItem[]>(GetTeamBulkErrors.InvalidReferences);
            }

            const teams = await this._teamRepo.getBulk(references);
            const dto = teams.map((t) => ({
                name: t.getName(),
                abbreviation: t.getAbbreviation().fold<string>('')((value) => value as string),
                displayName: t.getDisplayName().fold<string>(t.getName())((value) => value as string),
                country: t.getCountry(),
                grounds: t.getGrounds(),
                externalReferences: t.getRefs().fold<Refs[] | null>(null)((value) => value as Refs[]),
                id: t.getId().fold<string>('')((value) => value as string),
                founded: t.getFounded().fold<number | null>(null)((value) => value as number),
                primaryColor: t.getPrimaryColor().fold<string>('')((color) => color?.value as string),
                secondaryColor: t.getSecondaryColor().fold<string>('')((color) => color?.value as string),
            } as TeamBulkItem));

            return Result.ok<TeamBulkItem[]>(dto);
        } catch (e) {
            console.log(e);
            return Result.fail<TeamBulkItem[]>(GetTeamBulkErrors.UnexpectedError);
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
