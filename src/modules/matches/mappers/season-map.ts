import { ObjectId } from 'mongodb';

import Identifier from '@core/identifier';
import { Season, SeasonProps } from '@modules/matches/domain/season';
import { SeasonCollection } from '@modules/matches/repos/implementations/mongo-season-repo';
import { StaticMapper } from '@infra/contracts/mapper';

export interface SeasonDTO {
    id?: string;
    year: number;
    label?: string;
}

export const SeasonMap: StaticMapper<Season, SeasonCollection> = {
    toDomain: (raw: any) => {
        const _id = raw._id ? new Identifier<string>(raw._id.toString()) : undefined;

        const props = {
            year: raw.year,
            ...raw.label && { label: raw.label },
        } as SeasonProps;

        const season = Season.create(props, _id);
        return season.value;
    },

    toPersistance: (season: Season) => {
        const _id = new ObjectId();
        const maybeId = season.id
            .fold<ObjectId>(_id)((value) => new ObjectId(value as string));

        const maybeLabel = season.label
            .fold<string | null>(null)((label) => label);

        return {
            year: season.year,
            ...maybeId && { _id: maybeId },
            ...maybeLabel && { label: maybeLabel },
        } as SeasonCollection;
    },

    toDTO: (season: Season) => ({
        id: season.id.fold<string>('')((value) => value as string),
        year: season.year,
        label: season.label.fold<string | undefined>(undefined)((label) => label as string),
    } as SeasonDTO),
};

export interface EmbeddedSeason {
    _id: ObjectId;
    year: number;
}

export const toEmbeddedSeason = (season: Season) => {
    const persistanceSeason = SeasonMap.toPersistance(season);

    return {
        _id: persistanceSeason._id,
        year: persistanceSeason.year,
    } as EmbeddedSeason;
};
