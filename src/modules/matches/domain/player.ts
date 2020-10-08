/**
 * Name -> Handle players not inserted in database. Mandatory
 * Id -> Ref to go to players page. Optional
 * Jersey -> Jersey user by the player in match. Mandatory
 *
 */
export interface Player {
    name: string;
    jersey?: number;
    id?: string;
}
