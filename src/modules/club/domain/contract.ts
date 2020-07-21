import Entity from '@core/entity';

import Identifier from '@core/identifier';
// import { Either, left, right } from '@core/either';
import Maybe from '@core/maybe';

import Result from '@core/result';
import { EmbeddedPlayer } from './embedded-player';

export interface Team {
    id: string;
    name: string;
}

export interface ContractProps {
    player: EmbeddedPlayer;
    team: Team;
    startingDate?: Date;
    endingDate?: Date;
}

export class Contract extends Entity<ContractProps, string | number> {
    private constructor(props: ContractProps, id?: Identifier<string | number>) {
        super(props, id);
    }

    static create(props: ContractProps, id?: Identifier<string | number>): Result<Contract> {
        if (props.startingDate && props.endingDate && props.endingDate < props.startingDate) {
            return Result.fail<Contract>('Starting date cannot be after ending date');
        }

        const contract: Contract = new Contract(props, id);
        return Result.ok<Contract>(contract);
    }

    get player(): EmbeddedPlayer {
        return this.props.player;
    }

    get team(): Team {
        return this.props.team;
    }

    get startingDate(): Maybe<Date> {
        return Maybe.fromUndefined(this.props.startingDate);
    }

    get endingDate(): Maybe<Date> {
        return Maybe.fromUndefined(this.props.endingDate);
    }

    setStartingDate(startingDate: Date): Result<Contract> {
        this.props.startingDate = startingDate;

        return this.validateDates();
    }

    setEndingDate(endingDate: Date): Result<Contract> {
        this.props.endingDate = endingDate;

        return this.validateDates();
    }

    isContractActive(): boolean {
        return this.endingDate.cata(
            () => this.startingDate.fold(false)(
                (startingDate) => startingDate as Date <= new Date(),
            ),
            () => false,
        );
    }

    private validateDates(): Result<Contract> {
        const self = this;

        return this.startingDate.cata(
            () => Result.ok<Contract>(self),
            (startingDate) => {
                const endingDate = this.endingDate.fold<Date | null>(null)((date) => date);

                if (endingDate && startingDate && startingDate > endingDate) {
                    return Result.fail<Contract>('Starting date cannot be after ending date');
                }

                return Result.ok<Contract>(self);
            },
        );
    }
}
