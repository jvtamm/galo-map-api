import axios from 'axios';
import cheerio from 'cheerio';
import { injectable } from 'inversify';

import Maybe from '@core/maybe';
import { StadiumScraper, StadiumInfo } from '@modules/location/adapters/stadium-scraper';
import Result from '@core/result';

interface Map<T> {
    [key: string]: T
}

function parseDmsValues(dms: string) {
    const separatorMap: Map<string> = {
        degrees: '°',
        minutes: '\'',
        seconds: '"',
    };

    const output: Map<number | string> = {};

    let rest = dms;
    Object.keys(separatorMap).forEach((key) => {
        const separator = separatorMap[key];

        const [value, remainder] = rest.split(separator);

        rest = remainder;
        output[key] = parseInt(value, 10);
    });

    rest = rest.trim();
    output.position = rest;

    return output;
}

function convertDmsToDecimal(dms: string) {
    const MINUTES_IN_HOUR = 60;
    const SECONDS_IN_HOUR = 3600;
    const HOURS_IN_DEGREE = 1;

    const {
        degrees, minutes, seconds, position,
    } = parseDmsValues(dms);

    const decimal = (degrees as number / HOURS_IN_DEGREE) + (minutes as number / MINUTES_IN_HOUR) + (seconds as number / SECONDS_IN_HOUR);

    return (position === 'N' || position === 'E') ? decimal : -1 * decimal;
}

function convertDmsToDecimalCoords(dms: string) {
    if (!dms) return undefined;

    const match = dms.match(/(S|N)/);
    if (!match) return undefined;

    const index = match.index as number;
    const latDms = dms.substring(0, index + 1).replace(/ /g, '');
    const lngDms = dms.substring(index + 1).replace(/ /g, '');

    return {
        latitude: convertDmsToDecimal(latDms),
        longitude: convertDmsToDecimal(lngDms),
    };

    // return [ convertDmsToDecimal(latDms), convertDmsToDecimal(lngDms) ]
}

@injectable()
export class WikipediaScraper implements StadiumScraper {
    private readonly _googleUrl = 'https://www.google.com';

    private readonly _httpInstance = axios.create();

    private readonly _countryMap: Map<string> = {
        'África do Sul': 'ZAF',
        Alemanha: 'DEU',
        Argentina: 'ARG',
        Bélgica: 'BEL',
        Bolívia: 'BOL',
        Brasil: 'BRA',
        Canada: 'CAN',
        Catar: 'QAT',
        Chile: 'CHL',
        China: 'CHN',
        Colômbia: 'COL',
        Equador: 'ECU',
        'Emirados Árabes Unidos': 'ARE',
        Espanha: 'ESP',
        'Estados Unidos': 'USA',
        França: 'FRA',
        Inglaterra: 'GBR',
        Itália: 'ITA',
        Japão: 'JPN',
        Marrocos: 'MAR',
        México: 'MEX',
        Paraguai: 'PRY',
        Peru: 'PER',
        Portugal: 'PRT',
        Russia: 'RUS',
        Suíça: 'CHE',
        Turquia: 'TUR',
        Ucrânia: 'UKR',
        Uruguay: 'URY',
        Venezuela: 'VEN',
    }

    async getStadiumInfo(name: string): Promise<Result<StadiumInfo>> {
        const nameRegex = /[Aa]rena|[Ee]st[áa]dio/g;
        const completeName = nameRegex.test(name) ? name : `Estádio ${name}`;

        try {
            const maybeWikipediaUrl = await this.getWikipediaUrl(completeName);
            if (maybeWikipediaUrl.isNone()) return Result.fail(`Could not scrape stadium ${completeName}`);

            const wikipediaUrl = maybeWikipediaUrl.join();
            const stadiumInfo = await this.scrapeStadium(wikipediaUrl);

            if (!stadiumInfo.name) return Result.fail(`Could not scrape stadium ${completeName}`);

            return Result.ok(stadiumInfo);
        } catch (e) {
            console.log(e.toString());
            return Result.fail('An unexpected error has occurred');
        }
    }

    async getWikipediaUrl(query: string): Promise<Maybe<string>> {
        const PAGE_SIZE = 10;
        const SEARCH_LIMIT = 5;

        const ENCODED_SPACE_CHAR = '%20';

        const baseQueryUrl = `${this._googleUrl}/search?q=${query.replace(/ /g, ENCODED_SPACE_CHAR)}`;

        for (let i = 0; i < SEARCH_LIMIT; i += 1) {
            const offset = i * PAGE_SIZE;
            // eslint-disable-next-line no-await-in-loop
            const page = await this._httpInstance.get<string>(`${baseQueryUrl}&start=${offset}`);
            const { data } = page;

            // const WIKIPEDIA_REDIRECT_REGEX = /\/url\?q=http[s]*:\/\/[\w]*.{0,1}wikipedia.org\/wiki/gm;
            const WIKIPEDIA_REDIRECT_REGEX = /\/url\?q=http[s]*:\/\/(pt){0,1}.{0,1}wikipedia.org\/wiki/gm;
            const match = WIKIPEDIA_REDIRECT_REGEX.exec(data);

            if (match) {
                const { index } = match;
                const REDIRECT_STRING = '/url?q=';

                const finalUrlIndex = data.indexOf('&', index);
                const wikipediaUrl = data.substring(index + REDIRECT_STRING.length, finalUrlIndex);

                return Maybe.of(decodeURI(wikipediaUrl));
            }
        }

        return Maybe.none<string>();
    }

    async scrapeStadium(url: string): Promise<StadiumInfo> {
        const page = await this._httpInstance.get(url);
        const $ = cheerio.load(page.data);

        const infoBox = $('table.infobox_v2');

        const name = infoBox.find('td:contains("Nome")').next().text();
        const possibleNickname = infoBox.find('td:contains("Apelido")').next('td').children().html();
        const capacity = infoBox.find('td:contains("Capacidade")').next().text();
        const country = infoBox.find('td:contains("Local")').next().text();
        const coords = $('a.external.text[href*=geohack]').text();

        const topNicknameContainer = infoBox.find('.topo');
        const nicknameBr = topNicknameContainer.find('br');

        let topNickname = topNicknameContainer.text();
        if (nicknameBr.length && nicknameBr[0].previousSibling.data) {
            topNickname = nicknameBr[0].previousSibling.data;
        }

        let nickname = topNickname && (topNickname !== name || !possibleNickname)
            ? topNickname
            : possibleNickname;

        nickname = nickname?.includes(' ou ') ? nickname.split(' ou ')[0] : nickname;

        return {
            name: name.trim(),
            nickname: nickname?.trim(),
            ...this.cleanCapacity(capacity) && { capacity: this.cleanCapacity(capacity) },
            ...this.formatCountry(country) && { country: this.formatCountry(country) },
            ...convertDmsToDecimalCoords(coords) && { coordinates: convertDmsToDecimalCoords(coords) },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    cleanCapacity(capacity: string) {
        if (!capacity) return undefined;

        const COMPLETE_CAPACITY_REGEX = /(\d{1,}[\s\d|.]{0,1}\d{1,})/gm;

        const match = capacity.match(COMPLETE_CAPACITY_REGEX);
        if (match) {
            const cleanedCapacity = match[0].replace(/[^0-9]/gm, '').trim();

            if (cleanedCapacity.length >= 4) return parseInt(cleanedCapacity, 10);

            return parseInt(cleanedCapacity, 10) * 100;
        }

        return undefined;
    }

    formatCountry(country: string) {
        if (!country) return undefined;

        const splitted = country.split(',');
        const countryName = (splitted && splitted.length) ? splitted[splitted.length - 1].trim() : null;
        if (countryName && countryName in this._countryMap) {
            return this._countryMap[countryName];
        }

        return undefined;
    }
}
