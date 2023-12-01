module.exports = {
    singleQuote: true,
    tabWidth: 4,
    importOrder: [
        'regenerator-runtime',
        '<THIRD_PARTY_MODULES>',
        '^~/(.*)$',
        '^[./]',
    ],
};
