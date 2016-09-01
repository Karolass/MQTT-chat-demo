import mosca from 'mosca'

const SECURE_KEY = '/path/your/privkey.pem'
const SECURE_CERT = '/path/your/cert.pem'

module.exports = {
    id: 'mqttdemo',
    interfaces: [
        { type: 'mqtt', port: 1883 },
        { type: 'mqtts', port: 8883, credentials: { keyPath: SECURE_KEY, certPath: SECURE_CERT }},
        { type: 'http', port: 3001 },
        { type: 'https', port: 3002, credentials: { keyPath: SECURE_KEY, certPath: SECURE_CERT }}
    ],
    stats: false,
    logger: {
        level: 'debug'
    },
    backend: {
        type: 'mongodb',
        url: 'mongodb://localhost:27017/mqtt',
        pubsubCollection: 'ascoltatori',
        mongo: {}
    },
    persistence: {
        factory: mosca.persistence.Mongo,
        url: 'mongodb://localhost:27017/mqtt'
    }
}