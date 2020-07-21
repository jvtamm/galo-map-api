import Maybe from '@core/maybe';
import Stadium from '@modules/location/domain/stadium';

export interface StadiumRepo {
    exists(name: string): Promise<boolean>;
    getStadiumByName(name: string): Promise<Maybe<Stadium>>;
    getStadiumByNickname(nickname: string): Promise<Maybe<Stadium>>;
    save(stadium: Stadium): Promise<Stadium>;
}
