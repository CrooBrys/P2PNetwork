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
            this.routingTable = new Array(32).fill([]);
        }




        // When peer joins
        handleClientJoining(sock) {

            
        }







        // Method to put peer in k-bucket
        pushBucket(routingTable, peer) {
            // Find k-bucket index
            let index = BucketHelper.bucketIndex(this.id, peer.id);
            //Adding common prefix to peer info
            peer.commonPrefix = `P${index}`;
            // Check for empty k-bucket
            if (routingTable[index].length === 0) {
                // Pushing peer info to bucket
                routingTable[index].push(peer);
                // Printing output to terminal
                console.log(`Bucket P${index} has no value, adding ${peer.id}`);
            } 
            // If the bucket is full
            else {
                // Printing output to terminal
                console.log(`Bucket P${index} is full, checking if we need to change the stored value`);
                // Get old peer in routing table
                let oldPeer = routingTable[index][0];
                //Getting distances
                let newPeerDistance = BucketHelper.XORDistance(this.id, peer.id);
                let oldPeerDistance = BucketHelper.XORDistance(this.id, oldPeer.id);
                // Checking if new peer is closer
                if (newPeerDistance < oldPeerDistance) {
                    // Replacing peer
                    routingTable[index][0] = peer;
                    // Printing output to terminal
                    console.log(`${peer.id} is closer than our current stored value ${oldPeer.id}, therfore we will update.`);
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
            console.log("My DHT:\n");
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