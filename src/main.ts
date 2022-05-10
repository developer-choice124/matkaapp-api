import { app } from "./app";
import http from "http";
// import https from "https";

import { config } from "../config/config";
import { MongoHelper } from "../src/helpers/mongo.helper";
const fs = require('fs');

// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/matka777.com/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/matka777.com/fullchain.pem')
// };

// const server = https.createServer(options ,app);
const server = http.createServer(app);
server.listen(config.port);
server.on('error', (err) => {
    console.error(err);
});

server.on('listening', async () => {
    console.info(`Server is listening ${config.host}:${config.port}`);
    // connect to mongodb
    try{
        let connection = `mongodb://${config.database.host}:${config.database.port}/${config.database.dbname}`;
        await MongoHelper.connect(connection);
        console.info(`Connected to Mongo!`);
    }catch(err){
        console.error("Unable to connect mongo!", err);
    }
})