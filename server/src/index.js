import mosca from 'mosca'

import brokerSetting from './config/broker'

const server = new mosca.Server(brokerSetting)

server.on('error', (err) => {
    console.log(err)
})
server.on('ready', () => {
    console.log('MQTT broker is running.')
})
server.on('clientConnected', (client) => {
    console.log('Client Connected \t:= ', client.id)
})
server.on('published', (packet, client) => {
    console.log('Published :=', packet)
})
server.on('subscribed', (topic, client) => {
    console.log('Subscribed :=', client.packet)
})
server.on('unsubscribed', (topic, client) => {
    console.log('unsubscribed := ', topic)
})
server.on('clientDisconnecting', (client) => {
    console.log('clientDisconnecting := ', client.id)
})
server.on('clientDisconnected', (client) => {
    console.log('Client Disconnected     := ', client.id)
})
