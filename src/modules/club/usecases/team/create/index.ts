/* eslint-disable class-methods-use-this */
import Maybe from '@core/maybe';
import Result from '@core/result';
import { Country } from '@modules/club/domain/country';
import { Either, left, right } from '@core/either';
import { ExternalReferenceFactory, ExternalReference, RefDTO } from '@modules/club/domain/external-references';
import { HexColor } from '@modules/club/domain/hex-color';
import { ICountryService } from '@modules/location/usecases/country';
import { IStadiumService } from '@modules/location/usecases/stadium';
import { ITeamService } from '@modules/club/usecases/team';
import { Stadium } from '@modules/club/domain/stadium';
import { Team, TeamProps } from '@modules/club/domain/team';
import { TeamRepo } from '@modules/club/repos/team-repo';
import { UseCase } from '@core/usecase';

import { CreateTeamDTO } from './dto';
import { CreateTeamErrors } from './errors';

export type CreateTeamResponse = Either<
    CreateTeamErrors.ReferenceAlreadyExists |
    CreateTeamErrors.ProviderNotSupported |
    CreateTeamErrors.InvalidHexColor |
    string,
    void>

export class CreateTeam implements UseCase<CreateTeamDTO, CreateTeamResponse> {
    constructor(
        private _teamRepo: TeamRepo,
        private _teamServices: ITeamService,
        private _countryServices: ICountryService,
        private _groundServices: IStadiumService,
        // eslint-disable-next-line no-empty-function
    ) { }

    async execute(request: CreateTeamDTO): Promise<CreateTeamResponse> {
        const { externalReferences, grounds } = request;

        const eitherRefs = await this.checkRefExistance(externalReferences);

        const countryResult = await this._countryServices.getByName({ name: request.country });
        if (countryResult.failure) return left<string, void>(countryResult.error as string);

        const country = countryResult.value as Country;
        const stadiums = await this.loadStadiums(grounds);

        const eitherTeam = eitherRefs.map(() => this.initProps(request, country, stadiums))
            .chain<TeamProps>((props: TeamProps) => (
                this.validRefs(props.refs)
                    ? right<string, TeamProps>(props)
                    : left<string, TeamProps>(CreateTeamErrors.ProviderNotSupported)
            )).chain<TeamProps>((props: TeamProps) => this.asHexColor(request.primaryColor).chain(
                (color) => this.addPropToProps(props, color, 'primaryColor'),
            ))
            .chain<TeamProps>((props: TeamProps) => this.asHexColor(request.secondaryColor).chain(
                (color) => this.addPropToProps(props, color, 'secondaryColor'),
            ))
            .chain((props: TeamProps) => Team.create(props));

        const persistedTeam = await eitherTeam
            .asyncChain<string>(async (team: Team) => this._teamRepo.save(team));

        return persistedTeam
            .asyncChain(async (teamId: string) => this._teamServices.createSquad({ teamId }))
            .then((eitherSquad) => eitherSquad.fold(
                (error: string) => left<string, void>(error),
                () => right<string, void>(undefined),
            ));
    }

    async checkRefExistance(externalReferences: RefDTO): Promise<Either<string, boolean>> {
        const eitherRefs = await this._teamServices.getByReference({ externalReferences });

        return eitherRefs.fold(
            () => right<string, boolean>(true),
            () => left<string, boolean>(CreateTeamErrors.ReferenceAlreadyExists),
        );
    }

    initProps(request: CreateTeamDTO, country: Country, grounds: Stadium[]): TeamProps {
        const { externalReferences } = request;

        const founded = Maybe.fromUndefined(request.founded)
            .fold<number | null>(null)((value) => value as number);

        const props: TeamProps = {
            name: request.name,
            abbreviation: request.abbreviation,
            refs: ExternalReferenceFactory.fromDTO(externalReferences),
            country,
            ...request.displayName && { displayName: request.displayName },
            ...grounds.length && { grounds },
            ...founded && { founded },
        };

        return props;
    }

    validRefs(ref: ExternalReference[]): boolean {
        return Maybe.fromEmpty<ExternalReference[]>(ref)
            .fold(false)(() => true);
    }

    asHexColor(color: string | undefined): Either<string, HexColor | null> {
        return Maybe.fromUndefined<string>(color)
            .map<Either<string, HexColor>>(
                (c: string | null) => HexColor.create(c as string),
            ).fold<Either<string, HexColor | null>>(right<string, null>(null))(
                (value) => value?.fold<any>(
                    () => left<string, HexColor>(CreateTeamErrors.InvalidHexColor),
                    (hColor: HexColor) => right<string, HexColor>(hColor),
                ),
            );
    }

    addPropToProps<T>(props: TeamProps, prop: T, propName: string): Either<string, TeamProps> {
        const updatedProps: TeamProps = { ...props, ...propName && { [propName]: prop } };

        return right<string, TeamProps>(updatedProps);
    }

    async loadStadiums(names?: string[]): Promise<Stadium[]> {
        const stadiums: Stadium[] = [];

        if (!names || !names.length) return stadiums;

        for (let i = 0; i < names.length; i += 1) {
            const name = names[i];
            // eslint-disable-next-line no-await-in-loop
            const stadiumResult = await this.getStadium(name);

            if (stadiumResult.success) {
                stadiums.push(stadiumResult.value);
            }
        }

        return stadiums;
    }

    private async getStadium(name: string): Promise<Result<Stadium>> {
        let stadiumResult = await this._groundServices.getStadiumByName({ name });

        if (stadiumResult.failure) {
            stadiumResult = await this._groundServices.create({ name });
            if (stadiumResult.failure) return Result.fail<Stadium>('Stadium not found.');
        }

        const stadium: Stadium = {
            name: stadiumResult.value.name,
            coordinates: stadiumResult.value.coordinates,
            ...stadiumResult.value.nickname && { nickname: stadiumResult.value.nickname },
        };

        return Result.ok(stadium);
    }
}

export * from './dto';
