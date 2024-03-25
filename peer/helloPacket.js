// Exporting code to other files
module.exports = {
    // Creating welcome packet
    helloPacket: function (peerNum, peerName, peersList) {
        // Sender name length 
        let length = Buffer.byteLength(peerName, 'utf-8');
        // Calculate total packet length
        let packetLength = 4 + (peerNum * 8) + length;
        // Creating buffer object
        let packet = Buffer.alloc(packetLength);
        // ITP version
        storeBitPacket(packet, 9, 0, 4);
        // Message type 
        storeBitPacket(packet, 2, 4, 7);
        // Number of peers 
        storeBitPacket(packet, peerNum, 11, 9);
        // Length of name
        storeBitPacket(packet, length, 20, 12);
        // Setting current offset
        let offset = 4;
        // Iterate over peer list
        peersList.forEach(peer => {
            // Split IP address
            let parts = peer.ip.split('.');
            // Convert to int
            let ip = Buffer.from(parts.map(part => parseInt(part)));
            // Write IP to buffer
            ip.copy(packet, offset);
            // Convert port string to integer
            let port = parseInt(peer.port);
            // Increase offset
            offset = offset + 4;
            // Peer port
            packet.writeUInt16BE(port, offset);
            // Increase offset
            offset = offset + 2;
            // Buffer
            storeBitPacket(packet, 0, offset, 2);
            // Increase offset
            offset = offset + 2;
        });
        // Adding sender name to buffer
        packet.write(peerName, offset, length, 'utf-8');
        // Return
        return packet;
    }
};
// **************** //
// Provided Methods //
// **************** //
// Store integer value into specific bit position in the packet buffer
function storeBitPacket(packet, value, offset, length) {
    let lastBitPosition = offset + length - 1;
    let number = value.toString(2);
    let j = number.length - 1;
    for (let i = 0; i < number.length; i++) {
        let bytePosition = Math.floor(lastBitPosition / 8);
        let bitPosition = 7 - (lastBitPosition % 8);
        if (number.charAt(j--) == "0") {
            packet[bytePosition] &= ~(1 << bitPosition);
        } else {
            packet[bytePosition] |= 1 << bitPosition;
        }
        lastBitPosition--;
    }
}