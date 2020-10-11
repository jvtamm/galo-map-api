/* eslint-disable class-methods-use-this */
import Result from '@core/result';
import { EventOptions, FixtureEventFactory, FixtureEvents } from '@modules/matches/domain/fixture-events';
import { ExternalReferenceFactory, RefDTO } from '@modules/club/domain/external-references';
import { Fixture } from '@modules/matches/domain/fixture';
import { FixtureDTO, FixtureMap } from '@modules/matches/mappers/fixture-map';
import { FixtureDetails, SummonedPlayers } from '@modules/matches/domain/fixture-details';
import { FixtureDetailsRepo } from '@modules/matches/repos/fixture-details-repo';
import { FixtureRepo } from '@modules/matches/repos/fixture-repo';
import { IPlayerService } from '@modules/club/usecases/player';
import { ITeamService } from '@modules/club/usecases/team';
import { Player } from '@modules/matches/domain/player';
import { PlayerBulkItem } from '@modules/club/usecases/player/get-bulk';
import { Team } from '@modules/matches/domain/team';
import { UseCase } from '@core/usecase';

import { AddFixtureDetailsDTO, FixturePlayer, SummonedFixturePlayers } from './dto';
import { AddFixtureDetailsErrors } from './errors';

interface Map {
    [key: string]: (type: string) => string
}

export type AddFixtureDetailsResponse = Result<FixtureDTO>

export class AddFixtureDetails implements UseCase<AddFixtureDetailsDTO, AddFixtureDetailsResponse> {
    constructor(
        private _fixtureRepo: FixtureRepo,
        private _fixtureDetailsRepo: FixtureDetailsRepo,
        private _playerServices: IPlayerService,
        private _teamServices: ITeamService,
    // eslint-disable-next-line no-empty-function
    ) {}

    async execute(request: AddFixtureDetailsDTO): Promise<AddFixtureDetailsResponse> {
        const {
            fixture: fixtureRef,
            home, away,
            homePlayers, awayPlayers,
            events: matchEvents,
        } = request;

        if (typeof home === 'undefined') return Result.fail<FixtureDTO>(AddFixtureDetailsErrors.HomeScoreMandatory);
        if (typeof away === 'undefined') return Result.fail<FixtureDTO>(AddFixtureDetailsErrors.AwayScoreMandatory);
        if (!fixtureRef) return Result.fail<FixtureDTO>(AddFixtureDetailsErrors.FixtureMandatory);

        if (homePlayers && !homePlayers.lineup) return Result.fail<FixtureDTO>(AddFixtureDetailsErrors.InvalidHomePlayers);
        if (awayPlayers && !awayPlayers.lineup) return Result.fail<FixtureDTO>(AddFixtureDetailsErrors.InvalidAwayPlayers);

        try {
            const references = ExternalReferenceFactory.fromDTO(fixtureRef);
            const maybeFixture = await this._fixtureRepo.getByReference(references);
            if (maybeFixture.isNone()) return Result.fail<FixtureDTO>(AddFixtureDetailsErrors.FixtureNotFound);

            const fixture = maybeFixture.join();
            const fixtureId = fixture.id.fold('')((id) => id as string);
            const exists = await this._fixtureDetailsRepo.exists(fixtureId);

            if (exists) {
                return Result.fail<FixtureDTO>(AddFixtureDetailsErrors.FixtureDetailsAlreadyExists);
            }

            const players = await this.getPlayers(
                request.homePlayers as SummonedFixturePlayers,
                request.awayPlayers as SummonedFixturePlayers,
            );

            if (!players.success) {
                return Result.fail<FixtureDTO>(players.error as string);
            }

            const events = await this.loadEventInfo(
                fixture,
                players.players as PlayerBulkItem[],
                matchEvents,
            );

            if (events.failure) {
                return Result.fail<FixtureDTO>('');
            }

            // Replace by sorting from event factory
            const sortedEvents = events.value.sort((a, b) => {
                if (!a.getTimestamp()) return 1;
                if (!b.getTimestamp()) return -1;
                if (a.getTimestamp() === b.getTimestamp()) return 0;
                if (a.getTimestamp() < b.getTimestamp()) return -1;

                return 1;
            });

            const detailsProps = {
                ...sortedEvents && { events: sortedEvents },
                ...request.referee && { referee: request.referee },
                ...request.attendance && { attendance: request.attendance },
                homePlayers: players.homePlayers as SummonedPlayers,
                awayPlayers: players.awayPlayers as SummonedPlayers,
            };

            const details = FixtureDetails.create(detailsProps);
            if (details.failure) {
                return Result.fail(details.error as string);
            }

            // await this._fixtureDetailsRepo.save(fixtureId, details.value);

            fixture.finishMatch(request.home, request.away, details.value);
            const savedFixture = await this._fixtureRepo.save(fixture);

            return Result.ok<FixtureDTO>(FixtureMap.toDTO(savedFixture));
            // return Result.ok<FixtureDTO>();
        } catch (error) {
            console.log(error);
            return Result.fail<FixtureDTO>(AddFixtureDetailsErrors.UnexpectedError);
        }
    }

    async getPlayers(homePlayers: SummonedFixturePlayers, awayPlayers: SummonedFixturePlayers) {
        let externalReferences: RefDTO[] = [];

        if (homePlayers) {
            const lineup = this.getPlayerRefs(homePlayers.lineup);
            const bench = this.getPlayerRefs(homePlayers.bench);
            externalReferences = [...externalReferences, ...lineup, ...bench];
        }

        if (awayPlayers) {
            const lineup = this.getPlayerRefs(awayPlayers.lineup);
            const bench = this.getPlayerRefs(awayPlayers.bench);
            externalReferences = [...externalReferences, ...lineup, ...bench];
        }

        const foundPlayers = await this._playerServices.getBulk({ externalReferences });
        if (foundPlayers.failure) {
            return {
                success: false,
                error: foundPlayers.error,
            };
        }

        return {
            homePlayers: {
                lineup: this.getFormattedPlayers(homePlayers.lineup || [], foundPlayers.value),
                bench: this.getFormattedPlayers(homePlayers.bench || [], foundPlayers.value),
            },
            awayPlayers: {
                lineup: this.getFormattedPlayers(awayPlayers.lineup || [], foundPlayers.value),
                bench: this.getFormattedPlayers(awayPlayers.bench || [], foundPlayers.value),
            },
            players: foundPlayers.value,
            success: true,
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getPlayerRefs(players: FixturePlayer[]): RefDTO[] {
        if (!players || !players.length) return [];

        const refs: RefDTO[] = [];

        for (let i = 0; i < players.length; i += 1) {
            const { reference } = players[i];

            if (reference) {
                refs.push(reference);
            }
        }

        return refs;
    }

    // eslint-disable-next-line class-methods-use-this
    getFormattedPlayers(players: FixturePlayer[], references: PlayerBulkItem[]) {
        const formattedPlayers: Player[] = [];

        for (let i = 0; i < players.length; i += 1) {
            const player = this.formatPlayer(players[i], references);

            formattedPlayers.push(player);
        }

        return formattedPlayers;
    }

    formatPlayer(player: FixturePlayer, references: PlayerBulkItem[]): Player {
        const currentPlayer: Player = {
            name: player.displayName || player.name as string,
            ...player.jersey && { jersey: player.jersey },
        };

        const { reference } = player;
        if (reference) {
            const referencedPlayer = references.find(({ externalReferences }) => externalReferences?.some((ref) => ref.provider === Object.keys(reference)[0] && ref.ref === Object.values(reference)[0]));

            if (referencedPlayer) {
                const referencedPlayerName = referencedPlayer.displayName || referencedPlayer.name;

                currentPlayer.name = referencedPlayerName || currentPlayer.name;
                currentPlayer.jersey = currentPlayer.jersey || referencedPlayer.jersey;
                currentPlayer.id = referencedPlayer.id as string;
            }
        }

        return currentPlayer;
    }

    async loadEventInfo(fixture: Fixture, players: PlayerBulkItem[], events?: Array<EventOptions>): Promise<Result<FixtureEvents[]>> {
        if (!events || !events.length) {
            return Result.ok<FixtureEvents[]>([]);
        }

        const teamReferences: RefDTO[] = [];
        events.forEach(({ data }) => {
            if (data.team) {
                teamReferences.push(data.team as RefDTO);
            }
        });

        console.log(teamReferences);

        const teams = await this._teamServices.getBulk({ externalReferences: teamReferences });
        if (teams.failure) {
            return Result.fail<FixtureEvents[]>(AddFixtureDetailsErrors.InvalidTeams);
        }

        const matchEvents: FixtureEvents[] = [];

        for (let i = 0; i < events.length; i += 1) {
            const event = events[i];

            const eventInfo: EventOptions = {
                type: event.type,
                ...event.timestamp && { timestamp: event.timestamp },
            };

            const data = { ...event.data };

            // const playersFields = ['scorer', 'assistedBy', 'inPlayer', 'outPlayer', 'player'];
            const playersFields: Map = {
                scorer: () => 'scorer',
                assistedBy: () => 'assistedBy',
                inPlayer: () => 'inPlayer',
                outPlayer: () => 'outPlayer',
                player: (type: string) => (type === 'goal' ? 'scorer' : 'player'),
            };

            Object.keys(playersFields).forEach((key) => {
                const field = playersFields[key](eventInfo.type);
                if (event.data[key]) {
                    data[field] = this.formatPlayer(event.data[key] as FixturePlayer, players);
                }
            });

            if (event.data.team) {
                const referencedTeam = teams.value.find(({ externalReferences }) => externalReferences?.some((ref) => ref.provider === Object.keys(event.data.team)[0] && ref.ref === Object.values(event.data.team)[0]));

                // console.log(teams, 'teams');
                // console.log('data', data);
                // console.log('referencedTeam', referencedTeam);

                if (referencedTeam) {
                    const teamProps = {
                        name: referencedTeam.name,
                        displayName: referencedTeam.displayName,
                        abbreviation: referencedTeam.abbreviation as string,
                        country: referencedTeam.country.code,
                    };

                    const team = Team.create(teamProps, referencedTeam.id);
                    if (team.failure) {
                        return Result.fail<FixtureEvents[]>(team.error as string);
                    }
                    data.team = team.value;
                } else {
                    return Result.fail<FixtureEvents[]>(AddFixtureDetailsErrors.InvalidTeams);
                }
            }

            // console.log('data2', data);

            eventInfo.data = data;
            const eventObj = FixtureEventFactory.create(eventInfo);
            if (eventObj.failure) {
                return Result.fail<FixtureEvents[]>(eventObj.error as string);
            }
            matchEvents.push(eventObj.value);
        }

        return Result.ok<FixtureEvents[]>(matchEvents);
    }
}

export * from './dto';
export * from './errors';
