import axios from 'axios';
import { injectable } from 'inversify';

import Result from '@core/result';
import { AddFixtureDetailsDTO, FixturePlayer, SummonedFixturePlayers } from '@modules/matches/usecases/fixtures/add-details';
import { FixtureInfo, FixtureScraper, PaginationFrom } from '@modules/matches/adapters/fixture-scraper';
import { RefDTO } from '@modules/club/domain/external-references';
import { EventOptions } from '@modules/matches/domain/fixture-events';

interface Map<T> {
    [key: string]: T
}

enum SofascoreFixtureScraperErrors {
    MatchNotFound = 'Could not load match with supplied id',
    // DetailsNotFound = 'Could not load match with supplied id',
    FixtureNotFinished = 'Fixture is not finished yet',
    UnexpectedError = 'An unexpected error has occurred.'
}

type Players = {
    homePlayers: SummonedFixturePlayers;
    awayPlayers: SummonedFixturePlayers;
}

@injectable()
export class SofascoreFixtureScraper implements FixtureScraper {
    private readonly _httpInstance = axios.create({
        baseURL: 'https://api.sofascore.com/api/v1/',
    });

    async getFixtureDetails(reference: number): Promise<Result<AddFixtureDetailsDTO>> {
        try {
            const fixtureResult = await this.getMatchById(reference);
            if (fixtureResult.failure) return Result.fail(fixtureResult.error as string);

            const fixture = fixtureResult.value;
            const FINISHED_MATCH_STATUS = 'FT';
            if (fixture.status !== FINISHED_MATCH_STATUS) return Result.fail(SofascoreFixtureScraperErrors.FixtureNotFinished);

            const details = await this.loadDetails(reference, fixture.homeTeam, fixture.awayTeam);

            // Reformat
            const detailsInfo = {
                ...fixture,
                ...details.value,
            };

            return Result.ok<AddFixtureDetailsDTO>(detailsInfo);
        } catch (error) {
            console.log(error);
            return Result.fail(SofascoreFixtureScraperErrors.UnexpectedError);
        }
    }

    async getNextTeamMatches(team: number, from: PaginationFrom): Promise<Result<FixtureInfo[]>> {
        let fixtures: FixtureInfo[] = [];

        if (new Date().getTime() > from.date.getTime()) {
            console.log('Loading past fixtures...');
            const pastFixtures = await this.loadLastFixtures(team, from);
            if (pastFixtures.failure) return Result.fail(pastFixtures.error as string);
            fixtures = fixtures.concat(pastFixtures.value);
        }

        const nextFixtures = await this.loadNextFixtures(team, from);
        if (nextFixtures.failure) return Result.fail(nextFixtures.error as string);
        fixtures = fixtures.concat(nextFixtures.value);

        return Result.ok(fixtures);
    }

    private async getMatchById(id: number): Promise<Result<FixtureInfo>> {
        const matchPath = `event/${id}`;

        try {
            const { data } = await this._httpInstance.get(matchPath);
            if (!data.event) return Result.fail(SofascoreFixtureScraperErrors.MatchNotFound);

            const matchInfo = this.formatMatchInfo(data.event);
            return Result.ok<FixtureInfo>(matchInfo);
        } catch (error) {
            console.log(error);
            return Result.fail(SofascoreFixtureScraperErrors.UnexpectedError);
        }
    }

    private formatMatchInfo(match: any): FixtureInfo {
        const groundInfo = match.venue && {
            name: match.venue.stadium.name,
            city: match.venue.city.name,
        };

        const startTimeStamp = parseInt(`${match.startTimestamp}`.padEnd(13, '0'), 10);
        const matchDate = new Date(startTimeStamp);
        matchDate.setUTCHours(matchDate.getHours());

        const FINISHED_MATCH_STATUS_CODE = 100;
        return {
            league: this.formatLeagueInfo(match.season),
            round: match.roundInfo.name ? match.roundInfo.name.replace('Round', 'Rodada') : `${match.roundInfo.round}ª rodada`,
            homeTeam: {
                sofascore: match.homeTeam.id,
            },
            awayTeam: {
                sofascore: match.awayTeam.id,
            },
            ...groundInfo && { ground: groundInfo },
            ...match.referee && { referee: match.referee.name },
            ...match.attendance && { attendance: match.attendance },
            externalReferences: {
                sofascore: match.id,
            },
            status: match.status.code === FINISHED_MATCH_STATUS_CODE ? 'FT' : 'NS',
            matchDate: matchDate.toISOString(),
            ...Object.keys(match.homeScore).length && { home: match.homeScore.normaltime },
            ...Object.keys(match.awayScore).length && { away: match.awayScore.normaltime },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    private formatLeagueInfo(season: any) {
        const { name, year } = season;

        const digitIndex = name.search(/\d/);

        const leagueName = digitIndex >= 0 ? name.substring(0, digitIndex).trim() : name;
        let leagueYear = digitIndex >= 0 ? parseInt(name.substring(digitIndex, name.length).trim(), 10) : 0;

        if (leagueYear.toString().length !== 4) {
            const currentYearBeginDigits = new Date().getFullYear().toString().substr(0, 2);

            const seasonBeginYear = year.split('/')[0];
            leagueYear = parseInt(`${currentYearBeginDigits}${seasonBeginYear}`, 10);
        }

        // Create name mapping -> Map to already created tounaments
        return {
            name: leagueName,
            year: leagueYear,
        };
    }

    private async loadDetails(id: number, home: RefDTO, away: RefDTO): Promise<Result<any>> {
        const incidents = await this.loadIncidents(id, home, away);
        if (incidents.failure) return Result.fail(incidents.error as string);

        const lineups = await this.loadPlayers(id);
        if (lineups.failure) return Result.fail(lineups.error as string);

        return Result.ok({
            ...lineups.value,
            events: incidents.value,
        });
    }

    private async loadIncidents(id: number, home: RefDTO, away: RefDTO): Promise<Result<EventOptions[]>> {
        const incidentsPath = `event/${id}/incidents`;

        try {
            const { data } = await this._httpInstance.get(incidentsPath);
            const { incidents } = data;

            const events: EventOptions[] = [];
            incidents.forEach((incident: any) => {
                const formattedIncident = this.formatIncident(incident, home, away);

                if (formattedIncident.success) {
                    events.push(formattedIncident.value);
                }
            });

            return Result.ok<EventOptions[]>(events);
        } catch (error) {
            console.log(error);
            return Result.fail<EventOptions[]>(SofascoreFixtureScraperErrors.UnexpectedError);
        }
    }

    private formatIncident(incident: any, home: RefDTO, away: RefDTO): Result<EventOptions> {
        const incidentTypeMap: Map<Function> = {
            goal: (data: any) => (data.time < 0 ? 'penalty' : 'goal'),
            card: () => 'card',
            substitution: () => 'substitution',
            period: () => 'period',
        };

        const incidentDataMap: Map<Function> = {
            goal: (data: any) => ({
                scorer: this.formatPlayer(data.player),
                ...data.assist1 && { assistedBy: this.formatPlayer(data.assist1) },
                goalType: data.incidentClass === 'regular' ? 'GOAL' : 'PENALTY',
                team: data.isHome ? home : away,
            }),
            card: (data: any) => ({
                player: this.formatPlayer(data.player),
                color: data.incidentClass === 'yellow' ? 'YELLOW' : 'RED',
                team: data.isHome ? home : away,
                reason: data.reason,
            }),
            substitution: (data: any) => ({
                inPlayer: this.formatPlayer(data.playerIn),
                outPlayer: this.formatPlayer(data.playerOut),
                team: data.isHome ? home : away,
            }),
            period: (data: any) => ({
                info: data.text,
                home: data.homeScore,
                away: data.awayScore,
            }),
            // 'varDecision': () => {},
            // 'injuryTime': () => {}
        };

        const { incidentType } = incident;

        const typeExtractor = incidentTypeMap[incidentType];
        if (!typeExtractor) return Result.fail('Error');

        const type = typeExtractor(incident);

        const dataExtractor = incidentDataMap[type];
        if (!dataExtractor) return Result.fail('Error');

        const eventInfo: EventOptions = {
            type: incident.incidentType,
            timestamp: incident.time,
            data: dataExtractor(incident),
        };

        return Result.ok<EventOptions>(eventInfo);
    }

    private async loadPlayers(id: number): Promise<Result<Players>> {
        const lineupsPath = `event/${id}/lineups`;

        try {
            const { data } = await this._httpInstance.get(lineupsPath);
            const { home, away } = data;

            const players = {
                homePlayers: this.formatLineup(home.players),
                awayPlayers: this.formatLineup(away.players),
            };

            return Result.ok(players);
        } catch (error) {
            console.log(error);
            return Result.fail(SofascoreFixtureScraperErrors.UnexpectedError);
            // return Result.fail
        }
    }

    private formatLineup(players: Array<any>): SummonedFixturePlayers {
        const bench: FixturePlayer[] = [];
        const lineup: FixturePlayer[] = [];

        players.forEach((player) => {
            const playerInfo = this.formatPlayer(player);

            if (player.substitute) {
                bench.push(playerInfo);
            } else {
                lineup.push(playerInfo);
            }
        });

        return {
            bench,
            lineup,
        };
    }

    // eslint-disable-next-line class-methods-use-this
    private formatPlayer(player: any): FixturePlayer {
        const name = player.player ? player.player.name : player.name;
        const displayName = player.player ? player.player.shortName : player.shortName;
        const reference = player.player ? player.player.id : player.id;

        return {
            name,
            displayName: displayName || name,
            reference: { sofascore: reference },
            ...(player.shirtNumber || player.shirtNumber === 0) && { jersey: player.shirtNumber },
        };
    }

    private async loadLastFixtures(team: number, from: PaginationFrom): Promise<Result<FixtureInfo[]>> {
        const lastEventsPath = `team/${team}/events/last/`;

        const memoizedValues: {
            [key: number]: any[]
        } = {};

        // const PAGE_LIMIT = 10;
        let currentPage = 0;
        let fixtureIndex = -1;

        // while (fixtureIndex < 0 && currentPage < PAGE_LIMIT) {
        while (fixtureIndex < 0) {
            // eslint-disable-next-line no-await-in-loop
            const { data } = await this._httpInstance(`${lastEventsPath}${currentPage}`);
            const { events } = data;

            fixtureIndex = this.findNextFixtureIndex(events, from);
            console.log(fixtureIndex);
            console.log(currentPage);

            if (fixtureIndex > 0) {
                memoizedValues[currentPage] = events.slice(fixtureIndex, events.length);
            } else {
                memoizedValues[currentPage] = events;
            }

            if (!data.hasNextPage || fixtureIndex >= 0) break;
            currentPage += 1;
        }

        const fixtures: FixtureInfo[] = [];
        const memoizedKeys = Object.keys(memoizedValues);
        for (let i = 0; i < memoizedKeys.length; i += 1) {
            const key = memoizedKeys[i];
            const memoizedFixtures = memoizedValues[key as unknown as number];

            for (let j = 0; j < memoizedFixtures.length; j += 1) {
                // eslint-disable-next-line no-await-in-loop
                const fixtureResult = await this.getMatchById(memoizedFixtures[j].id);
                if (fixtureResult.failure) return Result.fail<FixtureInfo[]>(fixtureResult.error as string);

                const fixture = fixtureResult.value;

                if (fixture.status === 'FT') {
                    // eslint-disable-next-line no-await-in-loop
                    const details = await this.loadDetails(memoizedFixtures[j].id, fixture.homeTeam, fixture.awayTeam);
                    if (details.failure) return Result.fail<FixtureInfo[]>(details.error as string);
                    fixture.details = details.value;
                }

                fixtures.push(fixture);
            }
        }

        return Result.ok(fixtures);
    }

    private async loadNextFixtures(team: number, from: PaginationFrom): Promise<Result<FixtureInfo[]>> {
        const lastEventsPath = `team/${team}/events/next/0`;

        const { data } = await this._httpInstance(lastEventsPath);
        const { events } = data;

        const fixtureIndex = this.findNextFixtureIndex(events, from) || 0;

        const fixtures: FixtureInfo[] = [];
        for (let i = fixtureIndex; i < events.length; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            const fixtureResult = await this.getMatchById(events[i].id);
            if (fixtureResult.failure) return Result.fail(fixtureResult.error as string);

            const fixture = fixtureResult.value;

            if (fixture.status === 'FT') {
                // eslint-disable-next-line no-await-in-loop
                const details = await this.loadDetails(events[i].id, fixture.homeTeam, fixture.awayTeam);
                if (details.failure) return Result.fail(details.error as string);
                fixture.details = details.value;
            }

            fixtures.push(fixture);
        }

        return Result.ok(fixtures);
    }

    /**
     * Finds next fixture fixture according to current fixture id and date.
     * Fixtures array must be sorted in ascending order according with timestamp
     */
    // eslint-disable-next-line class-methods-use-this
    private findNextFixtureIndex(fixtures: any[], { id, date }: PaginationFrom) {
        for (let i = 0; i < fixtures.length; i += 1) {
            const currentFixture = fixtures[i];
            const currentFixtureTimestamp = parseInt(`${currentFixture.startTimestamp}`.padEnd(13, '0'), 10);
            const currentMatchDate = new Date(currentFixtureTimestamp);

            const isCurrentDate = currentMatchDate.getTime() === date.getTime();
            if (currentFixture.id === id || isCurrentDate) {
                return i + 1;
            }

            const isAfter = currentMatchDate.getTime() > date.getTime();
            if (isAfter) {
                return i;
            }
        }

        return -1;
    }
}
