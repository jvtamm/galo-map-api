import { Country } from './country';
import { Position } from './position';

export interface EmbeddedPlayer {
    id: string;
    name: string;
    nationality: Country;
    position: Position;
}
