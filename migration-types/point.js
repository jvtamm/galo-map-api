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

module.exports = Point;
