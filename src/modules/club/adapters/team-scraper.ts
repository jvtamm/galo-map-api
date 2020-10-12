import Result from '@core/result';
import { PositionProps } from '@modules/club/domain/position';
import { RefDTO } from '@modules/club/domain/external-references';

export interface TeamInfo {
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

export interface PlayerInfo {
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

export interface TeamScraper {
    getByReference(reference: string | number): Promise<Result<TeamInfo>>;
    getTeamPlayers(teamReference: string | number): Promise<Result<PlayerInfo>>;
}
