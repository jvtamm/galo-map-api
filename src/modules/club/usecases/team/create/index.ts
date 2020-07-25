/* eslint-disable class-methods-use-this */
import Maybe from '@core/maybe';
import { Country } from '@modules/club/domain/country';
import { Either, left, right } from '@core/either';
import { ExternalReferenceFactory, ExternalReference, RefDTO } from '@modules/club/domain/external-references';
import { HexColor } from '@modules/club/domain/hex-color';
import { ICountryService } from '@modules/location/usecases/country';
import { ITeamService } from '@modules/club/usecases/team';
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

        // eslint-disable-next-line no-empty-function
    ) { }

    async execute(request: CreateTeamDTO): Promise<CreateTeamResponse> {
        const { externalReferences } = request;

        const eitherRefs = await this.checkRefExistance(externalReferences);
        const eitherCountry = await this._countryServices.getById({ id: request.country });

        const eitherTeam = eitherRefs.chain(() => eitherCountry.map((country: Country) => country))
            .map((country: Country) => this.initProps(request, country))
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

    initProps(request: CreateTeamDTO, country: Country): TeamProps {
        const { externalReferences } = request;

        const founded = Maybe.fromUndefined(request.founded)
            .fold<number | null>(null)((value) => value as number);
        const props: TeamProps = {
            name: request.name,
            abbreviation: request.abbreviation,
            refs: ExternalReferenceFactory.fromDTO(externalReferences),
            country,
            ...request.displayName && { displayName: request.displayName },
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
}

export * from './dto';
