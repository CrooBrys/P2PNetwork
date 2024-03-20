// Hash
let crypto = require('crypto');
// Variables
let timer;
// Exporting code to other files
module.exports = {
    // Initialization
    init : function() {
        // Creating timer with a random value between 1 and 999
       timer = Math.floor(Math.random() * 999) + 1;
       // Creating timer interval
       setInterval(() => {
        // Incrementing
        timer = timer + 1;
       }, 10);
    },
    // Getting timer
    getTimer : function() {
        // Return
        return timer;
    },
    // Retrieving peer id
    getPeerID : function(ip, port) {
        // Creating string to hash
        let hashString = ip + '-' + port;
        // Creating hash type object to create hashes
        let hashObject = crypto.createHash('shake256');
        // Creating unique hash with string
        hashObject.update(hashString);
        // Getting hash output string
        let peerID = hashObject.digest('hex');
        // Getting only 4 bytes(8 hex characters) of output string
        peerID = peerID.slice(0,8);
        // Returning
        return peerID;
    },
    // Start timer
    startTimer : function() {

    }
};