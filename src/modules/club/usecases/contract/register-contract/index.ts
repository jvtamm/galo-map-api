import { ContractRepo } from '@modules/club/repos/contract-repo';
import { EmbeddedPlayerMap } from '@modules/club/mapper/embedded-player-map';
import { IPlayerService } from '@modules/club/usecases/player';
import { ITeamService } from '@modules/club/usecases/team';
import { Maybe } from '@core/maybe';
import { PlayerDTO } from '@modules/club/mapper/player-map';
import { Result } from '@core/result';
import { TeamDTO } from '@modules/club/mapper/team-map';
import { UseCase } from '@core/usecase';

import { Contract, ContractProps } from '@modules/club/domain/contract';
import { RegisterContractDTO } from './dto';
import { RegisterContractErrors } from './errors';

type Errors = RegisterContractErrors.PlayerNotFound |
    RegisterContractErrors.TeamNotFound |
    RegisterContractErrors.InvalidDates |
    RegisterContractErrors.UnexpectedError |
    string;

export type RegisterContractResponse = Result<Errors | string>;

interface ContractInfo {
    player: PlayerDTO,
    team: TeamDTO,
    startingDate?: Date,
    endingDate?: Date,
}

interface DateRange {
    startingDate?: string,
    endingDate?: string,
}

export class RegisterContract implements UseCase<RegisterContractDTO, RegisterContractResponse> {
    constructor(
        private _contractRepo: ContractRepo,
        private _teamService: ITeamService,
        private _playerService: IPlayerService,
        // eslint-disable-next-line no-empty-function
    ) { }

    async execute(request: RegisterContractDTO): Promise<RegisterContractResponse> {
        const eitherTeam = await this._teamService.getById({ id: request.teamId });
        const eitherPlayer = await this._playerService.getById({ id: request.playerId });

        if (!eitherTeam.isSuccess()) {
            return Result.fail<Errors>(RegisterContractErrors.TeamNotFound);
        }

        if (!eitherPlayer.isSuccess()) {
            return Result.fail<Errors>(RegisterContractErrors.PlayerNotFound);
        }

        const team = eitherTeam.join() as TeamDTO;
        const player = eitherPlayer.join() as PlayerDTO;

        const dateRange: DateRange = {
            startingDate: request.startingDate,
            endingDate: request.endingDate,
        };

        const props = RegisterContract.buildProps(team, player, dateRange);
        const contractResult = await this.upsertContract(props as ContractInfo);

        if (contractResult.failure) {
            return Result.fail<Errors>(contractResult.error as Errors);
        }

        let contract = contractResult.value;
        contract = await this._contractRepo.save(contract);

        const isEndingContract = Boolean(request.endingDate && !request.startingDate) && contract.startingDate.isSome();

        if (contract.isContractActive()) {
            await this._teamService.addPlayerToSquad({
                teamId: contract.team.id,
                playerId: contract.player.id,
            });
        } else if (isEndingContract) {
            await this._teamService.removePlayerFromSquad({
                teamId: contract.team.id,
                playerId: contract.player.id,
            });
        }

        const _id = contract.id.fold('')((id) => id as string);
        return Result.ok<string>(_id);
    }

    static buildProps(team: TeamDTO, player: PlayerDTO, dateRange: DateRange): ContractInfo {
        const startingDate = Maybe.fromUndefined(dateRange.startingDate).fold<Date | null>(null)(
            (date) => new Date(date as string),
        );

        const endingDate = Maybe.fromUndefined(dateRange.endingDate).fold<Date | null>(null)(
            (date) => new Date(date as string),
        );

        return {
            team,
            player,
            ...startingDate && { startingDate },
            ...endingDate && { endingDate },
        };
    }

    async upsertContract(info: ContractInfo): Promise<Result<Contract>> {
        const { startingDate, endingDate } = info;
        const playerId = info.player.id as string;
        const teamId = info.team.id as string;

        if (startingDate && endingDate) {
            return this.createNewContract(info);
        }

        const baseContract = Contract.create({
            player: EmbeddedPlayerMap.toDomain(info.player),
            team: {
                id: info.team.id as string,
                name: info.team.name,
            },
        });

        if (baseContract.failure) {
            return Result.fail<Contract>(baseContract.error as Errors);
        }

        const openContract = await this._contractRepo.getPlayerOpenContract(playerId, teamId, endingDate as Date || new Date());

        if (startingDate) {
            const incompleteContract = await this._contractRepo.getIncompleteContract(playerId, teamId, startingDate as Date);

            if (openContract.isSome()) {
                return Result.fail<Contract>(RegisterContractErrors.OpenContractExists);
            }

            return incompleteContract
                .fold(baseContract)((c) => Result.ok<Contract>(c as Contract))
                .value
                .setStartingDate(startingDate);
        }

        if (endingDate) {
            return openContract.fold(baseContract)((c) => Result.ok<Contract>(c as Contract))
                .value
                .setEndingDate(endingDate);
        }

        return Result.fail<Contract>(RegisterContractErrors.InvalidDates);
    }

    // eslint-disable-next-line class-methods-use-this
    private createNewContract(info: ContractInfo) {
        const { startingDate, endingDate } = info;

        const props = {
            player: EmbeddedPlayerMap.toDomain(info.player),
            team: {
                id: info.team.id as string,
                name: info.team.name,
            },
            startingDate,
            endingDate,
        } as ContractProps;

        return Contract.create(props);
    }
}

export * from './dto';
export * from './errors';
