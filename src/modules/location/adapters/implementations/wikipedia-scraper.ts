import axios from 'axios';
import cheerio from 'cheerio';
import url from 'url';
import { injectable } from 'inversify';

import Maybe from '@core/maybe';
import { StadiumScraper, StadiumInfo } from '@modules/location/adapters/stadium-scraper';
import Result from '@core/result';

interface Map<T> {
    [key: string]: T
}

function convertDmsToDecimal(dms: any) {
    const MINUTES_IN_HOUR = 60;
    const SECONDS_IN_HOUR = 3600;
    const HOURS_IN_DEGREE = 1;

    const {
        degrees, minutes, seconds, position,
    } = dms;

    const decimal = (degrees as number / HOURS_IN_DEGREE) + (minutes as number / MINUTES_IN_HOUR) + (seconds as number / SECONDS_IN_HOUR);

    return (position === 'N' || position === 'E') ? decimal : -1 * decimal;
}

function formatDms(strCoords: string) {
    const [degrees, minutes, seconds, position] = strCoords.split('_');

    return {
        degrees: parseFloat(degrees),
        minutes: parseFloat(minutes),
        seconds: parseFloat(seconds),
        position,
    };
}

function parseCoords(address: string) {
    if (!address) return undefined;

    const parsedUrl = url.parse(address, true);
    const { params } = parsedUrl.query;
    const coordsInfo = (params as string)?.split(/(?<=[W|E])/)[0];

    const [strLatCoords, strLngCoords] = coordsInfo.split(/(?<=[S|N])_/);

    const latCoords = formatDms(strLatCoords);
    const lngCoords = formatDms(strLngCoords);

    return {
        latitude: convertDmsToDecimal(latCoords),
        longitude: convertDmsToDecimal(lngCoords),
    };
}

@injectable()
export class WikipediaScraper implements StadiumScraper {
    private readonly _googleUrl = 'https://www.google.com';

    private readonly _httpInstance = axios.create();

    private readonly _countryMap: Map<string> = {
        'África do Sul': 'ZA',
        Alemanha: 'DE',
        Argentina: 'AR',
        Áustria: 'AT',
        Bélgica: 'BE',
        Bolívia: 'BO',
        Bulgária: 'BG',
        Brasil: 'BR',
        Canada: 'CA',
        Catar: 'QA',
        Chile: 'CL',
        China: 'CN',
        Croácia: 'HR',
        Colômbia: 'CO',
        Equador: 'EC',
        'Emirados Árabes Unidos': 'AE',
        Escócia: 'EA',
        Espanha: 'ES',
        'Estados Unidos': 'US',
        França: 'FR',
        Holanda: 'NL',
        Inglaterra: 'GB',
        Itália: 'IT',
        Japão: 'JP',
        Luxemburgo: 'LU',
        Marrocos: 'MA',
        México: 'MX',
        'Nova Zelândia': 'NZ',
        'Países Baixos': 'NL',
        Paraguai: 'PY',
        Peru: 'PE',
        Portugal: 'PT',
        Russia: 'RU',
        Suíça: 'CH',
        Turquia: 'TR',
        Ucrânia: 'UA',
        Uruguay: 'UY',
        Venezuela: 'VE',
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

    async scrapeStadium(address: string): Promise<StadiumInfo> {
        const page = await this._httpInstance.get(address);
        const $ = cheerio.load(page.data);

        const infoBox = $('.infobox_v2');

        const name = infoBox.find('td:contains("Nome")').next().text();
        const possibleNickname = infoBox.find('td:contains("Apelido")').next('td').children().html();
        const capacity = infoBox.find('td:contains("Capacidade")').next().text();
        const country = this.getCountry(infoBox, $);
        const coordsHref = $('a.external.text[href*=geohack]').attr('href') as string;
        const maybeCoords = $('a.mw-kartographer-maplink');

        const coords = this.getCoordinates(coordsHref, maybeCoords);

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
            name: name.trim() || nickname?.trim() as string,
            nickname: nickname?.trim(),
            ...this.cleanCapacity(capacity) && { capacity: this.cleanCapacity(capacity) },
            ...this.formatCountry(country, $) && { country: this.formatCountry(country, $) },
            ...coords && { coordinates: coords },
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

    // eslint-disable-next-line class-methods-use-this
    getCountry(content: any, $: any) {
        const locale = content.find('td:contains("Local")').next();
        if (locale && locale.text()) return locale;

        let addressNode: any;
        content.find('th').each((_: any, e: any) => {
            const node = $(e);

            if (node.text() === 'Endereço') {
                addressNode = node;
            }
        });

        return addressNode ? addressNode.next() : null;
    }

    // eslint-disable-next-line class-methods-use-this
    getCoordinates(href: string, maybeCoords: any) {
        if (href) return parseCoords(href);

        if (maybeCoords.get()) {
            return {
                latitude: parseFloat(maybeCoords.attr('data-lat')),
                longitude: parseFloat(maybeCoords.attr('data-lon')),
            };
        }

        return undefined;
    }

    formatCountry(country: any, $:any) {
        if (!country) return undefined;

        const anchors = country.find('a');

        if (anchors && anchors.length) {
            const countryAnchor = anchors[anchors.length - 1];
            const countryName = $(countryAnchor).text().trim();

            return this._countryMap[countryName];
        }

        return undefined;
    }
}
