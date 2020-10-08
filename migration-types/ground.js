const Point = require('./point');

const Ground = {
    type: 'object',
    required: ['name', 'nickname', 'geometry'],
    properties: {
        name: { bsonType: 'string' },
        nickname: { bsonType: 'string' },
        geometry: Point,
    },
};

module.exports = Ground;
