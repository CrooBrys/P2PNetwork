// Imports
let net = require('net');
let { Peer } = require('./peer');
let singleton = require('./singleton');
const { exit, off } = require('process');
// Timestamp
let timeStamp;
// Creating timestamp with a random value between 1 and 999
timeStamp = Math.floor(Math.random() * 999) + 1;
// Creating timer interval
setInterval(() => {
 timeStamp = (timeStamp + 1);
}, 10);
// Check for -n `name`
if ((process.argv[2] === "-n" && process.argv.length < 4) || process.argv[2] !== "-n") {
    // Printing error
    console.error('Please ensure you use -n `name`');
    // Exiting
    process.exit(1);
};
// Getting entered name
let name = process.argv[3];
// Creating peer
let peer = new Peer(name);
// Check for -p
if (process.argv.length === 6 && process.argv[4] === '-p') {
    // Split input 
    let myArray = process.argv[5].split(':');
    // Get ip
    let ip = myArray[0];
    // Get port
    let port = myArray[1];
    // Connect to server
    let sender = net.createConnection({ host: ip, port: parseInt(port) });
    // If connection works
    sender.on('connect', () => {
    });
    // Recieve data
    sender.on('data', async (data) => {
        // Parsing packet
        let parsedPacket = fullPacketParse(data);
        // Console output
        console.log(`\nConnected to ${parsedPacket.peerName}:${port} at timestamp ${timeStamp}\n`);
        // Start server
        await startServer(sender.localPort);
        // Console output
        console.log(`Recieved Welcome Message from ${parsedPacket.peerName} ${singleton.getPeerID(ip, port)} along with DHT\n`);
        // Printing DHT
        printDHT(parsedPacket.peerList);






    });
    // If error occurs
    sender.on('error', (err) => {
        // Printing error
        console.error('Connection error:', err.message);
        // Exit
        process.exit();
    });
}
// If no -p
else {
    // Starting server
    startServer();
}
// Start server
function startServer(port = 0){
    // Create TCP server
    let server = net.createServer((socket) => {
        // On connection call method
        peer.handleClientJoining(socket);
    });
    // Begin server listening
    server.listen(port, '127.0.0.1', () => {
        // Get assignedPort from kenel
        let assignedPort = server.address().port;
        // Assigning port
        peer.port = assignedPort;
        // Setting peer id
        peer.generateID();
        // Print out the assigned assignedPort number
        console.log(`This peer is ${peer.ip}:${peer.port} located at ${peer.name} [${peer.id}]\n`);
    });
}
// Parse entire packet and return object of all values
function fullPacketParse(packet){
    // Parse version
    let version = parseBitPacket(packet, 0, 4);
    // Parse type
    let type = parseBitPacket(packet, 4, 7);
    // Parse peer number
    let peerNum = parseBitPacket(packet, 11, 9);
    // Parse length of name
    let length = parseBitPacket(packet, 20, 12);
    // Peer list
    let peerList = [];
    // Setting current offset
    let offset = 32
    // Iterating through peer info
    for(let i = 0; i < peerNum; i++){
        // Creating peer object
        let peer = {
            commonPrefix: '',
            ip: parseBitPacket(packet, offset, 32),
            port: parseBitPacket(packet, offset + 32, 16),
            id: singleton.getPeerID(parseBitPacket(packet, offset, 32), parseBitPacket(packet, offset + 32, 16))
        }
        // Pushing to array
        peerList.push(peer);
        // Increasing offset
        offset = offset + 64;
    }
    // Getting peer name
    let peerName = packet.toString('utf-8', offset, offset + length);
    // Return object of packet values
    return {
        version: version,
        type: type,
        peerNum: peerNum,
        length: length,
        peerList: peerList,
        peerName: peerName
    };
}
// Printing DHT
function printDHT(peerList) {
    // If peerlist not empty
    if (peerList.length > 0) {
        // Iterating through peerList
        peerList.forEach((peer) => {
            // Console output
            console.log(`[${peer.ip}:${peer.port}, ${peer.id}]\n`);
        });
    } 
    // If empty
    else {
        console.log("[]\n");
    }
}
// **************** //
// Provided Methods //
// **************** //
// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
    let number = "";
    for (var i = 0; i < length; i++) {
        // let us get the actual byte position of the offset
        let bytePosition = Math.floor((offset + i) / 8);
        let bitPosition = 7 - ((offset + i) % 8);
        let bit = (packet[bytePosition] >> bitPosition) % 2;
        number = (number << 1) | bit;
    }
    return number;
}
