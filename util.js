//util.js to generate an id for us


//you can't use undeclared variables
'use strict';

// Using require to access yhe given module 
const crypto = require('crypto');

let id = null; // to uniquely identify th client
//A peer id can basically be any random 20-byte string

module.exports.genId = () => {
    if (!id) {
        id = crypto.randomBytes(20); //it creates random 20 bytes string
        Buffer.from('-AT0001-').copy(id, 0); //"you can write any other name of your choice"
    }
    return id;
};