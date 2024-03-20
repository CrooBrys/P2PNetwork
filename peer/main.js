// ImassignedPorts
let net = require('net');
let { Peer } = require('./peer');
let singleton = require('./singleton');
// Check for -n `name`
if (process.argv.length !== 4 || process.argv[2] !== '-n') {
    // Printing error
    console.error('Please ensure you use -n `name`');
    // Exiting
    process.exit(1);
}
// Getting entered name
let name = process.argv[3];
// Creating peer
let peer = new Peer(name);

// Create TCP server
let server = net.createServer((socket) => {
    // On connection call method
    peer.handleClientJoining(socket);
});

// Begin server listening
server.listen(0, '127.0.0.1', () => {
    // Get assignedPort from kenel
    let assignedPort = server.address().port;
    // Assigning port
    peer.port = assignedPort;
    // Setting peer id
    peer.generateID();
    // Print out the assigned assignedPort number
    console.log(`This peer address is ${peer.ip}:${peer.port} located at server [${peer.id}]`);
});


//
// if (process.argv.length == 6 & process.argv[5] == '-p') {
    
// }
