const ExternalReference = {
    type: 'object',
    required: ['provider', 'ref'],
    properties: {
        provider: { bsonType: 'string' },
        ref: { bsonType: ['number', 'string'] },
    },
};

module.exports = ExternalReference;
