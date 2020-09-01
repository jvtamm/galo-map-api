const Point = require('./point');

const Ground = {
    type: 'object',
    required: ['name', 'nickname', 'geometry'],
    properties: {
        name: { bsonType: 'string' },
        year: { bsonType: 'int' },
        geometry: Point,
    },
};

module.exports = Ground;
