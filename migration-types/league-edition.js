const LeagueEdition = {
    type: 'object',
    required: ['_id', 'name', 'year'],
    properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string' },
        year: { bsonType: 'number' },
    },
};

module.exports = LeagueEdition;
