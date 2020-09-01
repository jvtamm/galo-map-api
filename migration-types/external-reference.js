const ExternalReference = {
    type: 'object',
    required: ['provider', 'ref'],
    properties: {
        provider: { bsonType: 'string' },
        ref: { bsonType: ['int', 'string'] },
    },
};

module.exports = ExternalReference;
