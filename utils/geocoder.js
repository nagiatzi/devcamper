const nodeGeocoder = require('node-geocoder');

const options =  {
    provider: process.env.GEOCODER_PROVIDER,
    htttpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}

const geocoder = nodeGeocoder(options);

module.exports = geocoder;