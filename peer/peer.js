// Importing
let singleton = require('./singleton');
let welcomePacket = require('./welcomePacket');
let BucketHelper = require('./bucketHelper');
// Exporting class
module.exports = {
    // Peer class
    Peer : class {
        // Constructor
        constructor(name) {
            // Peer information
            this.name = name;
            this.ip = "127.0.0.1";
            this.port = '';
            // Getting id
            this.id = '';
            // Routing table
            // 32 buckets
            this.routingTable = Array.from({ length: 32 }, () => []);
        }
        // When peer joins
        handleClientJoining(sock) {
            // Finding peer ip
            let ip = sock.remoteAddress;
            // Finding peer port
            let port = sock.remotePort;
            // Console output
            console.log(`Connected from peer ${ip}:${port}`);
            // Peer number variable
            let peerNum = 0;
            // Peer array
            let peerList = [];
            // Iterating through routing table
            for (let i = 0; i < this.routingTable.length; i++) {
                // Checking for peer
                if (this.routingTable[i].length === 1) {
                    // Incrementing peerNum
                    peerNum++;
                    // Pushing to array
                    peerList.push(this.routingTable[i][0]);
                }
            }
            // Creating welcome packet
            let packet = welcomePacket.welcomePacket(peerNum, this.name, peerList);
            // Sending packet
            sock.write(packet);
            //Creating peer
            let peer = {
                commonPrefix: '',
                ip: ip,
                port: port,
                id: (singleton.getPeerID(ip, port))
            }
            // Put bucket
            this.pushBucket(this.routingTable, peer);
            // Console output
            this.printRoutingTable();
            // On data
            sock.on('data', (data) => {
                // Getting hello packet
                let hello = this.fullPacketParse(data);
                // Console output
                console.log(`\nRecieved Hello Message from ${hello.peerName} ${peer.id} along with DHT`);
                // Print DHT
                this.printDHT(hello.peerList);
                // Push sender
                this.pushBucket(this.routingTable, peer);
                // Refresh bucket with DHT
                this.refreshBucket(hello.peerList);
                // Print routing table
                this.printRoutingTable();
            })
        }
        // Recieving hello packet
        helloRecieve(sock, ip, port) {
            // Writing to sock
            sock.write('ok');
            // On data
            sock.on('data', (data) => {
                //Creating peer
                let peer = {
                    commonPrefix: '',
                    ip: ip,
                    port: port,
                    id: (singleton.getPeerID(ip, port))
                }
                // Getting hello packet
                let hello = this.fullPacketParse(data);
                // Console output
                console.log(`\nRecieved Hello Message from ${hello.peerName} ${peer.id} along with DHT`);
                // Print DHT
                this.printDHT(hello.peerList);
                // Push sender
                this.pushBucket(this.routingTable, peer);
                // Refresh bucket with DHT
                this.refreshBucket(hello.peerList);
                // Print routing table
                this.printRoutingTable();
                })
        }
        // Method navigation
        navigation(sock) {
            // Count
            let count = 0;
            // Get data
             sock.on('data', (data) => {
                // If count is 0
                if(count === 0) {
                    // Decoding
                    let option = data.toString('utf-8')
                    // if meet
                    if(option === "Meet") {
                        // Method call
                        this.handleClientJoining(sock);
                    }
                    // If hello
                    else {
                        // Convert the received buffer to a string
                        let receivedData = data.toString('utf-8');
                        // Split the received string by the delimiter to extract IP address and port
                        let [receivedIP, receivedPort] = receivedData.split(':');
                        // Method call
                        this.helloRecieve(sock, receivedIP, receivedPort);
                    }
                }
                // Incrementing count
                count = count + 1;
             })
        }
        




        

        // Refresh buckets
        refreshBucket(peersList) {
            // Iterate over peer list
            peersList.forEach(peer => {
                if(peer.id !== this.id){
                    // Call pushBucket method for each peer
                    this.pushBucket(this.routingTable, peer);
                };
            });
            // Console output
            console.log(`\nRefresh k-Bucket operation performed`);
        }
        // Method to put peer in k-bucket
        pushBucket(routingTable, peer) {
            let peerInfo = {
                commonPrefix: '',
                ip: peer.ip,
                port: peer.port,
                id: peer.id
            };
            // Find k-bucket index
            let index = BucketHelper.bucketIndex(this.id, peerInfo.id);
            //Adding common prefix to peer info
            peerInfo.commonPrefix = `P${index}`;
            // Check for empty k-bucket
            if (routingTable[index].length === 0) {
                // Pushing peer info to bucket
                routingTable[index].push(peerInfo);
                // Printing output to terminal
                console.log(`\nBucket P${index} has no value, adding ${peerInfo.id}`);
            } 
            // If the bucket is full
            else {
                // Printing output to terminal
                console.log(`\nBucket P${index} is full, checking if we need to change the stored value`);
                // Get old peer in routing table
                let oldPeer = routingTable[index][0];
                //Getting distances
                let newPeerDistance = BucketHelper.XORDistance(this.id, peerInfo.id);
                let oldPeerDistance = BucketHelper.XORDistance(this.id, oldPeer.id);
                // Checking if new peer is closer
                if (newPeerDistance < oldPeerDistance) {
                    // Replacing peer
                    routingTable[index][0] = peerInfo;
                    // Printing output to terminal
                    console.log(`${peerInfo.id} is closer than our current stored value ${oldPeer.id}, therfore we will update.`);
                } 
                // If new peer is not closer
                else {
                    // Printing output to terminal
                    console.log(`Current value is closest, no update needed`);
                }
            }
        }
        // Printing routing table
        printRoutingTable() {
            // Formatting
            console.log("\nMy DHT:");
            // Iterating through table
            this.routingTable.forEach((bucket) => {
                // Checking if bucket is not empty
                if (bucket.length > 0) {
                    // Getting bucket
                    let peer = bucket[0];
                    // Printing bucket info
                    console.log(`[${peer.commonPrefix}, ${peer.ip}:${peer.port}, ${peer.id}]`);
                }
            });
        }
        // Printing DHT
        printDHT(peerList) {
            // If peerlist not empty
            if (peerList.length > 0) {
                // Iterating through peerList
                peerList.forEach((peer) => {
                    // Console output
                    console.log(`[${peer.ip}:${peer.port}, ${peer.id}]`);
                });
            } 
            // If empty
            else {
                console.log("[]\n");
            }
        }
        // Generating id
        generateID(){
            // Assigning id
            this.id = singleton.getPeerID(this.ip, this.port)
        }
        // Parse entire packet and return object of all values
        fullPacketParse(packet){
            // Parse version
            let version = this.parseBitPacket(packet, 0, 4);
            // Parse type
            let type = this.parseBitPacket(packet, 4, 7);
            // Parse peer number
            let peerNum = this.parseBitPacket(packet, 11, 9);
            // Parse length of name
            let length = this.parseBitPacket(packet, 20, 12);
            // Peer list
            let peerList = [];
            // Setting current offset
            let offset = 4;
            // Iterating through peer info
            for (let i = 0; i < peerNum; i++) {
                // Reading buffer
                let ip1 = packet.readUInt8(offset);
                let ip2 = packet.readUInt8(offset + 1);
                let ip3 = packet.readUInt8(offset + 2);
                let ip4 = packet.readUInt8(offset + 3);
                let ip = `${ip1}.${ip2}.${ip3}.${ip4}`;
                let port = packet.readUInt16BE(offset + 4).toString();
                // Creating peer object
                let peer = {
                    commonPrefix: '',
                    ip: ip,
                    port: port,
                    id: singleton.getPeerID(ip, port)
                }
                // Pushing to array
                peerList.push(peer);
                // Increasing offset
                offset = offset + 8;
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
        // **************** //
        // Provided Methods //
        // **************** //
        // Returns the integer value of the extracted bits fragment for a given packet
        parseBitPacket(packet, offset, length) {
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
    }
};