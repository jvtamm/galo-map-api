import Maybe from '@core/maybe';
import { FixtureDetails } from '@modules/matches/domain/fixture-details';

export interface FixtureDetailsRepo {
    getByMatchId(matchId: string): Promise<Maybe<FixtureDetails>>;
    exists(matchId: string): Promise<Boolean>;
    save(matchId: string, fixtureDetails: FixtureDetails): Promise<FixtureDetails>;
}
