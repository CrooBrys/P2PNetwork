// Exporting to other files
module.exports = {
    // Finding bucket index
    bucketIndex: function (peerServer, peerClient) {
        // Convert hex to binary
        function hexToBinary(hex) {
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
        // Convert hex to binary
        let binaryServer = hexToBinary(peerServer);
        let binaryClient = hexToBinary(peerClient);
        // Iterate over the bits until a difference is found
        let bucketIndex = 0;
        while (bucketIndex < binaryServer.length && bucketIndex < binaryClient.length) {
            // Check for pattern break
            if(binaryServer.charAt(bucketIndex) !== binaryClient.charAt(bucketIndex)){
                // Break
                break;
            }
            // Increment
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
    }
};