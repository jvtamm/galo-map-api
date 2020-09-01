const Team = {
    type: 'object',
    required: ['_id', 'name', 'country'],
    properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string' },
        abbreviation: { bsonType: 'string' },
        displayName: { bsonType: 'string' },
        country: { bsonType: 'string' },
    },
};

module.exports = Team;
