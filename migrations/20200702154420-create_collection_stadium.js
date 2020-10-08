const PointCoordinates = {
    type: 'array',
    minItems: 2,
    items: {
        type: 'number',
    },
};

const Point = {
    title: 'GeoJSON Point',
    type: 'object',
    required: ['type', 'coordinates'],
    properties: {
        type: {
            type: 'string',
            enum: ['Point'],
        },
        coordinates: PointCoordinates,
    },
};

// const Address = {
//     bsonType: 'object',
//     required: ['coords'],
//     properties: {
//         street: { bsonType: 'string' },
//         number: { bsonType: 'string' },
//         neighborhood: { bsonType: 'string' },
//         city: { bsonType: 'string' },
//         state: { bsonType: 'string' },
//         zipcode: { bsonType: 'string' },
//         country: { bsonType: 'objectId' },
//         coords: Point,
//     },
// };

const COLLECTION_NAME = 'Stadium';
module.exports = {
    async up(db) {
        await db.createCollection(COLLECTION_NAME, {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'geometry', 'country'],
                    properties: {
                        name: { bsonType: 'string' },
                        nickname: { bsonType: 'string' },
                        capacity: { bsonType: 'number' },
                        inauguration: { bsonType: 'date' },
                        geometry: Point,
                        country: { bsonType: 'objectId' },
                    },
                },
            },
            validationLevel: 'strict',
            validationAction: 'error',
        });

        await db.collection(COLLECTION_NAME).createIndex({ geometry: '2dsphere' });
    },

    async down(db) {
        await db.collection(COLLECTION_NAME).drop();
    },
};
