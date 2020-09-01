const {
    Ground, LeagueEdition, ExternalReference, Team,
} = require('../migration-types');

const COLLECTION_NAME = 'Fixture';
module.exports = {
    async up(db) {
        await db.createCollection(COLLECTION_NAME, {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'leagueEdition', 'status', '_creationDate', '_lastUpdateDate'],
                    properties: {
                        leagueEdition: LeagueEdition,
                        round: { bsonType: 'string' },
                        matchDate: { bsonType: 'date' },
                        externalReferences: {
                            type: 'array',
                            minItems: 1,
                            items: ExternalReference,
                        },
                        ground: Ground,
                        homeTeam: {
                            type: 'object',
                            required: ['team', 'score'],
                            properties: {
                                team: Team,
                                score: { bsonType: 'int' },
                            },
                        },
                        awayTeam: {
                            type: 'object',
                            required: ['team', 'score'],
                            properties: {
                                team: Team,
                                score: { bsonType: 'int' },
                            },
                        },
                        status: {
                            bsonType: 'string',
                            enum: ['NS', 'FT'],
                        },
                        referee: { bsonType: 'string' },
                        _creationDate: { bsonType: 'date' },
                        _lastUpdateDate: { bsonType: 'date' },
                    },
                },
            },
            validationLevel: 'strict',
            validationAction: 'error',
        });

        await db.collection(COLLECTION_NAME).createIndex({ 'ground.geometry': '2dsphere' });
    },

    async down(db) {
        await db.collection(COLLECTION_NAME).drop();
    },
};
