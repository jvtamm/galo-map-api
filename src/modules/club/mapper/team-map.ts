import Identifier from '@core/identifier';
import { Country } from '@modules/club/domain/country';
import { HexColor } from '@modules/club/domain/hex-color';
import { Mapper } from '@infra/contracts/mapper';
import { ObjectId } from 'mongodb';
import { Refs, ExternalReferenceFactory } from '@modules/club/domain/external-references';
import { Team, TeamProps } from '@modules/club/domain/team';
import { TeamCollection } from '@modules/club/repos/implementations/mongo-team-repo';

import CountryMap from './country-map';

export interface TeamDTO {
    id?: string;
    name: string;
    country: Country;
    abbreviation?: string;
    founded?: number;
    primaryColor?: string;
    secondaryColor?: string;
}

class TeamMap implements Mapper<Team> {
    static toDomain(raw: any): Team {
        const _id = raw._id ? new Identifier<string>(raw._id.toString()) : undefined;

        const maybePrimaryColor = HexColor.create(raw.primaryColor as string).toMaybe()
            .fold<HexColor | null>(null)((color) => color);

        const maybeSecondaryColor = HexColor.create(raw.secondaryColor as string).toMaybe()
            .fold<HexColor | null>(null)((color) => color);

        const props = {
            name: raw.name,
            abbreviation: raw.abbreviation,
            country: CountryMap.toDomain(raw.country),
            refs: raw.externalReferences.map((ref: Refs) => ExternalReferenceFactory.create(ref)),
            ...raw.founded && { founded: raw.founded },
            ...maybePrimaryColor && { primaryColor: maybePrimaryColor },
            ...maybeSecondaryColor && { secondaryColor: maybeSecondaryColor },
        } as TeamProps;

        const team = Team.create(props, _id);
        return team.fold(() => null, () => team.join());
    }

    static toPersistance(team: Team): TeamCollection {
        const abbreviation = team.getAbbreviation()
            .fold<string>('')((value) => value as string);

        const maybeFounded = team.getFounded()
            .fold<number | null>(null)((value) => value as number);

        const maybePrimaryColor = team.getPrimaryColor()
            .fold<string | null>(null)((color) => color?.value as string);

        const maybeSecondaryColor = team.getSecondaryColor()
            .fold<string | null>(null)((color) => color?.value as string);

        const _id = new ObjectId();
        const maybeId = team.getId()
            .fold<ObjectId>(_id)((value) => new ObjectId(value as string));

        return {
            name: team.getName(),
            country: CountryMap.toPersistance(team.getCountry()),
            externalReferences: team.getRefs().fold([] as Refs[])((value) => value as Refs[]),
            ...maybeId && { _id: maybeId },
            ...abbreviation && { abbreviation },
            ...maybeFounded && { founded: maybeFounded },
            ...maybePrimaryColor && { primaryColor: maybePrimaryColor },
            ...maybeSecondaryColor && { secondaryColor: maybeSecondaryColor },
        } as TeamCollection;
    }

    static toDTO(team: Team): TeamDTO {
        return {
            name: team.getName(),
            abbreviation: team.getId().fold<string>('')((value) => value as string),
            country: team.getCountry(),
            id: team.getId().fold<string>('')((value) => value as string),
            founded: team.getFounded().fold<number | null>(null)((value) => value as number),
            primaryColor: team.getPrimaryColor().fold<string>('')((color) => color?.value as string),
            secondaryColor: team.getSecondaryColor().fold<string>('')((color) => color?.value as string),
        } as TeamDTO;
    }
}

export default TeamMap;
