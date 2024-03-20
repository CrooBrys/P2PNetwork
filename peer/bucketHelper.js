// Exporting to other files
module.exports = {
    // Finding bucket index
    bucketIndex: function (peerServer, peerClient) {
        // Convert hex to binary
        let binaryServer = hexToBinary(peerServer);
        let binaryClient = hexToBinary(peerClient);
        // Iterate over the bits until a difference is found
        let bucketIndex = 0;
        while (bucketIndex < binaryServer.length && bucketIndex < binaryClient.length && binaryServer.charAt(bucketIndex) === binaryClient.charAt(bucketIndex)) {
            bucketIndex++;
        }
        
        // Returning bucket index
        return bucketIndex;
    },
    // Calculate XOR distance
    XORDistance: function (peerServer, peerClient) {
        // Convert hex to integers
        let intServer = parseInt(peerServer, 16);
        let intClient = parseInt(peerClient, 16);
        // Finding XOR distance
        let distance = intServer ^ intClient;
        // Return distance 
        return distance;
    },
    // Convert hex to binary
    hexToBinary: function (hex) {
        // Variable to hold binary
        let binary = '';
        // Iterate over hex
        for (let i = 0; i < hex.length; i++) {
            // Convert hex character to binary with padding 0
            binary += parseInt(hex[i], 16).toString(2).padStart(4, '0');
        }
        // Return binary
        return binary;
    }
};