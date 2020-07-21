/* eslint-disable max-classes-per-file */
import { ObjectId } from 'mongodb';

import Identifier from '@core/identifier';
import { Country } from '@modules/club/domain/country';
import { Mapper } from '@infra/contracts/mapper';
import { SquadCollection, SquadPlayerEmbedded } from '@modules/club/repos/implementations/mongo-squad-repo';
import { SquadPlayer, SquadProps, Squad } from '@modules/club/domain/squad';

import CountryMap from './country-map';
import { Position, PositionProps } from '../domain/position';
import PositionMap from './position-map';

export interface SquadDTO {
    id?: string;
    teamId: string;
    teamName: string;
    teamCountry: Country;
    squad?: SquadPlayerDTO[];
}

export interface SquadPlayerDTO {
    id: string;
    name: string;
    nationality: Country;
    position: PositionProps;
}

export class PlayerSquadMap implements Mapper<SquadPlayer> {
    static toDomain(raw: any): SquadPlayer {
        const position = Position.fromCode(raw.position.code).fold(
            () => null,
            (value: PositionProps) => value,
        );

        return {
            id: raw._id || raw.id,
            name: raw.name,
            nationality: CountryMap.toDomain(raw.nationality),
            position,
        };
    }

    static toPersistance(player: SquadPlayer): SquadPlayerEmbedded {
        return {
            _id: new ObjectId(player.id),
            name: player.name,
            nationality: CountryMap.toPersistance(player.nationality),
            position: PositionMap.toPersistance(player.position),
        };
    }

    static toDTO(player: SquadPlayer): SquadPlayerDTO {
        return {
            id: player.id,
            name: player.name,
            nationality: player.nationality,
            position: PositionMap.toDTO(player.position),
        } as SquadPlayerDTO;
    }
}

class SquadMap implements Mapper<Squad> {
    static toDomain(raw: any): Squad {
        const _id = raw._id ? new Identifier<string>(raw._id.toString()) : undefined;

        const props = {
            teamId: raw.teamId.toString(),
            teamName: raw.teamName,
            teamCountry: CountryMap.toDomain(raw.teamCountry),
            squad: raw.squad.map(PlayerSquadMap.toDomain),
        } as SquadProps;

        const squad = Squad.create(props, _id);

        return squad.fold(() => null, () => squad.join());
    }

    static toPersistance(squad: Squad): SquadCollection {
        const _id = new ObjectId();
        const maybeId = squad.getId()
            .fold<ObjectId>(_id)((value) => new ObjectId(value as string));

        return {
            teamId: new ObjectId(squad.getTeamId()),
            teamName: squad.getTeamName(),
            teamCountry: CountryMap.toPersistance(squad.getTeamCountry()),
            squad: squad.getPlayers().map(PlayerSquadMap.toPersistance),
            ...maybeId && { _id: maybeId },
        } as SquadCollection;
    }

    static toDTO(squad: Squad): SquadDTO {
        return {
            teamId: squad.getTeamId(),
            teamName: squad.getTeamName(),
            teamCountry: squad.getTeamCountry(),
            id: squad.getId().fold<string>('')((value) => value as string),
            squad: squad.getPlayers().map(PlayerSquadMap.toDTO),
        } as SquadDTO;
    }
}

export default SquadMap;
