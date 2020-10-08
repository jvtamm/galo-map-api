/* eslint-disable class-methods-use-this */
import Maybe from '@core/maybe';
import { Country } from '@modules/club/domain/country';
import { Either, left, right } from '@core/either';
import { ExternalReferenceFactory, ExternalReference, RefDTO } from '@modules/club/domain/external-references';
import { ICountryService } from '@modules/location/usecases/country';
import { IPlayerService } from '@modules/club/usecases/player';
import { Player, PlayerProps } from '@modules/club/domain/player';
import { PlayerRepo } from '@modules/club/repos/player-repo';
import { UseCase } from '@core/usecase';

import { Position } from '@modules/club/domain/position';
import { BirthDate } from '@modules/club/domain/birthdate';
import { CreatePlayerDTO } from './dto';
import { CreatePlayerErrors } from './errors';

type Errors = CreatePlayerErrors.ReferenceAlreadyExists |
    CreatePlayerErrors.ProviderNotSupported |
    string;

export type CreatePlayerResponse = Either<Errors, void>

export class CreatePlayer implements UseCase<CreatePlayerDTO, CreatePlayerResponse> {
    constructor(
        private _playerRepo: PlayerRepo,
        private _playerServices: IPlayerService,
        private _countryServices: ICountryService,

        // eslint-disable-next-line no-empty-function
    ) { }

    async execute(request: CreatePlayerDTO): Promise<CreatePlayerResponse> {
        const { externalReferences } = request;

        const eitherRefs = await this.checkRefExistance(externalReferences);
        const countryResult = await this._countryServices.getByName({ name: request.nationality });

        if (countryResult.failure) {
            return left(CreatePlayerErrors.CountryNotFound);
        }

        const country: Country = {
            id: countryResult.value.id as string,
            code: countryResult.value.code,
            name: countryResult.value.name,
        };

        const eitherPlayer = eitherRefs.chain(
            () => this.initProps(request, country),
        ).chain<PlayerProps>((props: PlayerProps) => (
            this.validRefs(props.refs)
                ? right<string, PlayerProps>(props)
                : left<string, PlayerProps>(CreatePlayerErrors.ProviderNotSupported)
        )).chain((props: PlayerProps) => Player.create(props));

        return eitherPlayer.asyncChain<string>(async (team: Player) => this._playerRepo.save(team))
            .then((eitherSquad) => eitherSquad.fold(
                (error: string) => left<string, void>(error),
                () => right<string, void>(undefined),
            ));
    }

    async checkRefExistance(externalReferences: RefDTO): Promise<Either<string, boolean>> {
        const eitherRefs = await this._playerServices.getByReference({ externalReferences });

        return eitherRefs.fold(
            () => right<string, boolean>(true),
            () => left<string, boolean>(CreatePlayerErrors.ReferenceAlreadyExists),
        );
    }

    initProps(request: CreatePlayerDTO, country: Country): Either<Errors, PlayerProps> {
        const { externalReferences } = request;

        const eitherPosition = Position.fromCode(request.position.code);
        const eitherBirthDate = BirthDate.create(request.dateOfBirth);

        const baseProps = {
            name: request.name,
            refs: ExternalReferenceFactory.fromDTO(externalReferences),
            nationality: country,
            ...request.jersey && { jersey: request.jersey },
            ...request.height && { height: request.height },
            ...request.weight && { weight: request.weight },
            ...request.displayName && { displayName: request.displayName },
        };

        return eitherPosition.chain<PlayerProps>((position: Position) => (
            eitherBirthDate.chain<PlayerProps>(
                (dateOfBirth: BirthDate) => {
                    const finalProps = { ...baseProps, dateOfBirth, position };
                    return right<Errors, PlayerProps>(finalProps);
                },
            )
        ));
    }

    validRefs(ref: ExternalReference[]): boolean {
        return Maybe.fromEmpty<ExternalReference[]>(ref)
            .fold(false)(() => true);
    }

    addPropToProps<T>(props: PlayerProps, prop: T, propName: string): Either<string, PlayerProps> {
        const updatedProps: PlayerProps = { ...props, ...propName && { [propName]: prop } };

        return right<string, PlayerProps>(updatedProps);
    }
}

export * from './dto';
