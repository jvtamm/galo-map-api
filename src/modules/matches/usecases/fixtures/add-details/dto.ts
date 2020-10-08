import { EventOptions } from '@modules/matches/domain/fixture-events';
import { RefDTO } from '@modules/club/domain/external-references';

export interface FixturePlayer {
    displayName: string;
    jersey: number;
    reference?: RefDTO;
}

export interface SummonedFixturePlayers {
    bench: FixturePlayer[];
    lineup: FixturePlayer[];
}

export interface AddFixtureDetailsDTO {
    fixture: RefDTO;
    events?: Array<EventOptions>;
    home: number;
    away: number;
    homePlayers?: SummonedFixturePlayers;
    awayPlayers?: SummonedFixturePlayers;
    referee?: string;
    attendance?: number;
}
