import axios from 'axios';

import Result from '@core/result';
import { PlayerInfo, TeamInfo, TeamScraper } from '@modules/club/adapters/team-scraper';
import { PositionProps } from '@modules/club/domain/position';

interface Map<T> {
    [key: string]: T
}

// Evaluate possibility of externalizing it
const countryMap: Map<string> = {
    'South Africa': 'África do Sul',
    Germany: 'Alemana',
    Argentina: 'Argentina',
    Austria: 'Áustria',
    Belgium: 'Bélgica',
    Bolivia: 'Bolívia',
    Bulgaria: 'Bulgária',
    Brazil: 'Brasil',
    Canada: 'Canada',
    Qatar: 'Catar',
    Chile: 'Chile',
    China: 'China',
    Croatia: 'Croácia',
    Colombia: 'Colômbia',
    Ecuador: 'Equador',
    Scotland: 'Escócia',
    Spain: 'Espanha',
    'United States': 'Estados Unidos',
    France: 'França',
    Netherlands: 'Holanda',
    England: 'Inglaterra',
    Italy: 'Itália',
    Japan: 'Japão',
    Luxembourg: 'Luxemburgo',
    Morocco: 'Marrocos',
    Mexico: 'México',
    'New Zealand': 'Nova Zelândia',
    Paraguay: 'Paraguai',
    Peru: 'Peru',
    Portugal: 'Portugal',
    Russia: 'Russia',
    Switzerland: 'Suíça',
    Turkey: 'Turquia',
    Ukraine: 'Ucrânia',
    Uruguay: 'Uruguay',
    Venezuela: 'Venezuela',
};

const positionMap: Map<PositionProps> = {
    G: {
        code: 'GK',
        name: 'Goleiro',
    },
    D: {
        code: 'CB',
        name: 'Zagueiro',
    },
    M: {
        code: 'AM',
        name: 'Meia-atacante',
    },
    F: {
        code: 'S',
        name: 'Atacante',
    },
};

enum SofascoreTeamScraperErrors {
    NotFound = 'Team with reference supplied not found.',
    UnexpectedError = 'An unexpected error has occurred.'
}

enum SofascorePlayersErrors {
    NotFound = 'Could not find any players of the team specified..',
    UnexpectedError = 'An unexpected error has occurred.'
}

export class SofascoreTeamScraper implements TeamScraper {
    private readonly _httpInstance = axios.create({
        baseURL: 'https://api.sofascore.com/api/v1/',
    });

    async getByReference(reference: number): Promise<Result<TeamInfo>> {
        const teamPath = `team/${reference}`;

        try {
            const { data } = await this._httpInstance.get(teamPath);
            if (!data.team) return Result.fail(SofascoreTeamScraperErrors.NotFound);

            const { team } = data;

            const timestampSize = team.foundationDateTimestamp > 0 ? 13 : 14;
            const foundationTimestamp = parseInt(`${team.foundationDateTimestamp}`.padEnd(timestampSize, '0'), 10);
            const foundationDate = team.foundationDateTimestamp && new Date(foundationTimestamp);

            const teamInfo = {
                name: team.fullName,
                abbreviation: team.nameCode,
                ...team.name && { displayName: team.name },
                country: countryMap[team.country.name],
                externalReferences: { sofascore: team.id },
                ...team.venue && { grounds: [team.venue.stadium.name] },
                ...foundationDate && { founded: foundationDate.getFullYear() },
                ...(team.teamColors && team.teamColors.primary) && { primaryColor: team.teamColors.primary },
                ...(team.teamColors && team.teamColors.secondary) && { secondaryColor: team.teamColors.secondary },
            };

            return Result.ok<TeamInfo>(teamInfo);
        } catch (error) {
            console.log(error);
            return Result.fail(SofascoreTeamScraperErrors.UnexpectedError);
        }
    }

    async getTeamPlayers(teamReference: number): Promise<Result<PlayerInfo>> {
        const teamPlayersPath = `team/${teamReference}/players`;

        try {
            const { data } = await this._httpInstance.get(teamPlayersPath);
            if (!data.players) return Result.fail(SofascorePlayersErrors.NotFound);

            const { players } = data;

            const formattedPlayers = players.map(({ player }: { player: any}) => {
                const dateOfBirthTimestamp = parseInt(`${player.dateOfBirthTimestamp}`.padEnd(12, '0'), 10);
                const dateOfBirth = new Date(dateOfBirthTimestamp);
                dateOfBirth.setHours(0, 0, 0, 0);

                return {
                    name: player.name,
                    position: positionMap[player.position],
                    externalReferences: { sofascore: player.id },
                    dateOfBirth: dateOfBirth.toISOString(),
                    nationality: countryMap[player.country.name],
                    ...player.shortName && { displayName: player.shortName },
                    ...player.shirtNumber && { jersey: player.shirtNumber },
                    ...player.height && { height: player.height / 100 },
                };
            });

            return Result.ok<PlayerInfo>(formattedPlayers);
        } catch (error) {
            console.log(error);
            return Result.fail(SofascorePlayersErrors.UnexpectedError);
        }
    }
}
