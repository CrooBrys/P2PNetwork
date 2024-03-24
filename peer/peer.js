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
            console.log(`Connected from peer ${ip}:${port}\n`);
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
                console.log(`Bucket P${index} has no value, adding ${peerInfo.id}`);
            } 
            // If the bucket is full
            else {
                // Printing output to terminal
                console.log(`Bucket P${index} is full, checking if we need to change the stored value`);
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
        // Generating id
        generateID(){
            // Assigning id
            this.id = singleton.getPeerID(this.ip, this.port)
        }
    }
};