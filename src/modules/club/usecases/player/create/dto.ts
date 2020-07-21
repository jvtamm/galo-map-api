import { RefDTO } from '@modules/club/domain/external-references';
import { PositionProps } from '@modules/club/domain/position';

export interface CreatePlayerDTO {
    name: string;
    dateOfBirth: string;
    nationality: string;
    position: PositionProps;
    externalReferences: RefDTO;
    displayName?: string;
    jersey?: number;
    height?: number;
    weight?: number;
}
