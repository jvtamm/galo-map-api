import { RefDTO } from '@modules/club/domain/external-references';

export interface CreateTeamDTO {
    name: string;
    abbreviation: string;
    displayName?: string;
    country: string;
    externalReferences: RefDTO;
    grounds?: string[];
    founded?: number;
    primaryColor?: string;
    secondaryColor?: string;
}
