// Importing
let singleton = require('./singleton');
let welcomePacket = require('./welcomePacket');
let BucketHelper = require('./bucketHelper');
// Exporting class
module.exports = {
    // sock class
    sock : class {
        // Constructor
        constructor(name) {
            // sock information
            this.name = name;
            this.ip = "127.0.0.1";
            this.port = '';
            // Getting id
            this.id = '';
            // Routing table
            // 32 buckets
            this.routingTable = new Array(32).fill([]);
        }




        // When sock joins
        handleClientJoining(sock) {

            // Print joining sock information
            console.log(`${sock.name} joined the network.`);
            // Create and send welcome packet
            let packet = welcomePacket.welcomePacket(0, this.name, []);
            // Store new sock information in routing table
            this.pushBucket(this.routingTable, sock);
            // Print DHT table
            this.printRoutingTable();
        }







        // Method to put sock in k-bucket
        pushBucket(routingTable, sock) {
            // Find k-bucket index
            let index = BucketHelper.bucketIndex(this.id, sock.id);
            //Adding common prefix to sock info
            sock.commonPrefix = `P${index}`;
            // Check for empty k-bucket
            if (routingTable[index].length === 0) {
                // Pushing sock info to bucket
                routingTable[index].push(sock);
                // Printing output to terminal
                console.log(`Bucket P${index} has no value, adding ${sock.id}`);
            } 
            // If the bucket is full
            else {
                // Printing output to terminal
                console.log(`Bucket P${index} is full, checking if we need to change the stored value`);
                // Get old sock in routing table
                let oldsock = routingTable[index][0];
                //Getting distances
                let newsockDistance = BucketHelper.XORDistance(this.id, sock.id);
                let oldsockDistance = BucketHelper.XORDistance(this.id, oldsock.id);
                // Checking if new sock is closer
                if (newsockDistance < oldsockDistance) {
                    // Replacing sock
                    routingTable[index][0] = sock;
                    // Printing output to terminal
                    console.log(`${sock.id} is closer than our current stored value ${oldsock.id}, therfore we will update.`);
                } 
                // If new sock is not closer
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
                    let sock = bucket[0];
                    // Printing bucket info
                    console.log(`[${sock.commonPrefix}, ${sock.ip}:${sock.port}, ${sock.id}]`);
                }
            });
        }
        // Generating id
        generateID(){
            // Assigning id
            this.id = singleton.getsockID(this.ip, this.port)
        }
    }
};