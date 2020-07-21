import { ObjectId } from 'mongodb';

import Identifier from '@core/identifier';
import { BirthDate } from '@modules/club/domain/birthdate';
import { Country } from '@modules/club/domain/country';
import { Mapper } from '@infra/contracts/mapper';
import { Player, PlayerProps } from '@modules/club/domain/player';
import { PlayerCollection } from '@modules/club/repos/implementations/mongo-player-repo';
import { PositionProps } from '@modules/club/domain/position';
import { Refs, ExternalReferenceFactory } from '@modules/club/domain/external-references';

import CountryMap from './country-map';
import PositionMap from './position-map';

export interface PlayerDTO {
    id?: string;
    name: string;
    dateOfBirth: string;
    nationality: Country;
    position: PositionProps;
    displayName?: string;
    jersey?: number;
    height?: number;
    weight?: number;
}

export class PlayerMap implements Mapper<Player> {
    static toDomain(raw: any): Player {
        const _id = raw._id ? new Identifier<string>(raw._id.toString()) : undefined;

        const maybeDateOfBirth = BirthDate.create(raw.dateOfBirth as string).toMaybe()
            .fold<BirthDate | null>(null)((dob) => dob);

        const props = {
            name: raw.name,
            nationality: CountryMap.toDomain(raw.nationality),
            position: PositionMap.toDomain(raw.position),
            refs: raw.externalReferences.map((ref: Refs) => ExternalReferenceFactory.create(ref)),
            ...raw.displayName && { displayName: raw.displayName },
            ...raw.jersey && { jersey: raw.jersey },
            ...raw.height && { height: raw.height },
            ...raw.weight && { weight: raw.weight },
            ...maybeDateOfBirth && { dateOfBirth: maybeDateOfBirth },
        } as PlayerProps;

        const player = Player.create(props, _id);
        return player.fold(() => null, () => player.join());
    }

    static toPersistance(player: Player): PlayerCollection {
        const maybeDisplayName = player.getDisplayName()
            .fold<string | null>(null)((value) => value as string);

        const maybeJersey = player.getJersey()
            .fold<number | null>(null)((jersey) => jersey as number);

        const maybeHeight = player.getHeight()
            .fold<number | null>(null)((height) => height as number);

        const maybeWeight = player.getWeight()
            .fold<number | null>(null)((weight) => weight as number);

        const _id = new ObjectId();
        const maybeId = player.getId()
            .fold<ObjectId>(_id)((value) => new ObjectId(value as string));

        return {
            name: player.getName(),
            dateOfBirth: player.getDateOfBirth(),
            nationality: CountryMap.toPersistance(player.getNationality()),
            position: PositionMap.toPersistance(player.getPosition()),
            externalReferences: player.getRefs().fold([] as Refs[])((value) => value as Refs[]),
            ...maybeId && { _id: maybeId },
            ...maybeJersey && { jersey: maybeJersey },
            ...maybeHeight && { height: maybeHeight },
            ...maybeWeight && { weight: maybeWeight },
            ...maybeDisplayName && { displayName: maybeDisplayName },
        } as PlayerCollection;
    }

    static toDTO(player: Player): PlayerDTO {
        return {
            id: player.getId().fold<string>('')((value) => value as string),
            name: player.getName(),
            dateOfBirth: player.getDateOfBirth().toISOString(),
            nationality: player.getNationality(),
            position: PositionMap.toDTO(player.getPosition()),
            displayName: player.getDisplayName().fold<string>('')((value) => value as string),
            jersey: player.getJersey().fold<number | null>(null)((jersey) => jersey as number),
            height: player.getHeight().fold<number | null>(null)((height) => height as number),
            weight: player.getWeight().fold<number | null>(null)((weight) => weight as number),
        } as PlayerDTO;
    }
}
