// Exporting code to other files
module.exports = {
    // Creating welcome packet
    welcomePacket: function (peerNum, peerName, peerInfo) {
        // Creating buffer object
        let packet = Buffer.alloc(12);
        // ITP version
        storeBitPacket(packet, 9, 0, 4);
        // Message type (7 bits)
        storeBitPacket(packet, 1, 4, 7);
        // Number of peers (9 bits)
        storeBitPacket(packet, peerNum, 11, 9);
        // Sender name length (12 bits)
        let length = Buffer.byteLength(peerName, 'utf-8');
        storeBitPacket(packet, length, 20, 12);
        // Creating single buffer to hold peer info
        let peerInfoBuff = Buffer.concat(peerInfo);
        // Copy new buffer to original
        peerInfoBuff.copy(packet, 32);
        // Adding sender name to buffer
        packet.write(peerName, 32 + peerInfoBuff.length, 'utf-8');
        // Return
        return packet;
    }
};
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
