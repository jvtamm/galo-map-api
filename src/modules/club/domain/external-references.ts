/* eslint-disable max-classes-per-file */

import Maybe from '@core/maybe';

export interface RefDTO {
    [key: string]: string | number
}

export interface Refs {
    provider: string;
    ref: string | number;
}

export interface ExternalReference {
    getProvider(): string;
    equals(ref: any): boolean;
    serialize(): number | string;
}

class FotmobRef implements ExternalReference {
    private readonly _provider = 'fotmob';

    private _ref: number;

    // eslint-disable-next-line no-empty-function
    constructor(ref: string | number) {
        this._ref = Number(ref);
    }

    getProvider(): string {
        return this._provider;
    }

    equals(ref: number) {
        return this._ref === ref;
    }

    serialize(): number {
        return this._ref;
    }
}

class SofascoreRef implements ExternalReference {
    private readonly _provider = 'sofascore';

    private _ref: number;

    // eslint-disable-next-line no-empty-function
    constructor(ref: string | number) {
        this._ref = Number(ref);
    }

    getProvider(): string {
        return this._provider;
    }

    equals(ref: number) {
        return this._ref === ref;
    }

    serialize(): number {
        return this._ref;
    }
}

class GaloDigitalRef implements ExternalReference {
    private readonly _provider = 'galodigital';

    private _ref: string;

    // eslint-disable-next-line no-empty-function
    constructor(ref: string | number) {
        this._ref = ref.toString();
    }

    getProvider(): string {
        return this._provider;
    }

    equals(ref: string) {
        return this._ref === ref;
    }

    serialize(): string {
        return this._ref;
    }
}

export class ExternalReferenceFactory {
    private static _supportedProviders = ['fotmob', 'galodigital', 'sofascore'];

    static create(reference: Refs): ExternalReference {
        const { provider, ref } = reference;

        switch (provider) {
            case 'fotmob':
                return new FotmobRef(ref);
            case 'sofascore':
                return new SofascoreRef(ref);
            case 'galodigital':
                return new GaloDigitalRef(ref);
            default:
                throw new Error(`Wrong external reference: "${provider}" given. Supported drivers are: "fotmob", "galodigital" and "sofascore".`);
        }
    }

    static fromDTO(externalReferences: RefDTO): ExternalReference[] {
        return Maybe.fromUndefined(externalReferences)
            .fold<ExternalReference[]>([])((value) => {
                const references: ExternalReference[] = [];
                const dto = value as RefDTO;

                Object.keys(dto).forEach((provider) => {
                    if (this.isSupported(provider)) {
                        const ref = ExternalReferenceFactory.create({
                            ref: dto[provider] as string,
                            provider,
                        });

                        references.push(ref);
                    }
                });

                return references;
            });
    }

    static isSupported(provider: string): boolean {
        return this._supportedProviders.some((p) => p === provider);
    }
}
