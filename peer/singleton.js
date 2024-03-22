// Hash
let crypto = require('crypto');
// Variables
let timer = 0;
// Exporting code to other files
module.exports = {
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
    }
};