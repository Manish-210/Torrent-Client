//you can't use undeclared variables
'use strict';

// Using require to access yhe given module 
const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;
const crypto = require('crypto');
const torrentParser = require('./torrent-parser');
const util = require('./util');

//this funtion executes in 4 steps and then pass it to callback
//1. Send a connect request
//2. Get the connect response and extract the connection id
//3. Use the connection id to send an announce request
//4. Get the announce response and extract the peers list
module.exports.getPeers = (torrent, callback) => {
    const socket = dgram.createSocket('udp4'); //udp4 it uss ipv4 address
    const url = torrent.announce.toString('utf8'); //converts string to binary using utf8 encoder/decoder

    //send connect request
    udpSend(socket, buildConnReq(), url);

    socket.on('message', response => {
        if (respType(response) === 'connect') {

            //receive and parse connect response
            const connResp = parseConnResp(response);

            //send announce request
            const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
            udpSend(socket, announceReq, url);

        } else if (respType(response) === 'announce') {

            //parse announce response
            const announceResp = parseAnnounceResp(response);

            //pass peers to callback
            callback(announceResp.peers);
        }
    });
};
//udpSend function is made such that it calls socket.send without using offset and length arguments
function udpSend(socket, message, rawUrl, callback = () => {}) {
    const url = urlParse(rawUrl);
    socket.send(message, 0, message.length, url.port, url.host, callback);
}



function respType(resp) {
    // ...
}

function buildConnReq() {
    const buf = Buffer.alloc(16); //it creates new empty buffer with a size of 16 bytes

    // connection id
    buf.writeUInt32BE(0x417, 0);
    // The Buffer.writeUInt32BE() method is used to write an unsigned 32-bit integer number to an instance of the Buffer class
    //first parameter hold number to write and second number of bytes to skip

    buf.writeUInt32BE(0x27101980, 4);
    // action

    buf.writeUInt32BE(0, 8);
    // transaction id

    crypto.randomBytes(4).copy(buf, 12); // it creates random 32 bit number

    return buf;
}



function parseConnResp(resp) {
    return {
        //to read the action and the transaction id as unsigned 32 bit big-endian integers
        //the slice method copies last 8 bytes to get them
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        connectionId: resp.slice(8)
    }
}



function buildAnnounceReq(connId, torrent, port = 6881) {
    const buf = Buffer.allocUnsafe(98);

    // connection id
    connId.copy(buf, 0);
    // action
    buf.writeUInt32BE(1, 8);
    // transaction id
    crypto.randomBytes(4).copy(buf, 12);
    // info hash
    torrentParser.infoHash(torrent).copy(buf, 16);
    // peerId
    util.genId().copy(buf, 36);
    // downloaded
    Buffer.alloc(8).copy(buf, 56); //buffer.alloc(8) will just create an 8-byte buffer with all 0s.
    // left
    torrentParser.size(torrent).copy(buf, 64);
    // uploaded
    Buffer.alloc(8).copy(buf, 72);
    // event
    buf.writeUInt32BE(0, 80);
    // ip address
    buf.writeUInt32BE(0, 80);
    // key
    crypto.randomBytes(4).copy(buf, 88);
    // num want
    buf.writeInt32BE(-1, 92);
    // port
    buf.writeUInt16BE(port, 96);

    return buf;
}



function parseAnnounceResp(resp) {
    function group(iterable, groupSize) {
        let groups = [];
        for (let i = 0; i < iterable.length; i += groupSize) {
            groups.push(iterable.slice(i, i + groupSize));
        }
        return groups;
    }

    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        leechers: resp.readUInt32BE(8),
        seeders: resp.readUInt32BE(12),
        peers: group(resp.slice(20), 6).map(address => {
            return {
                ip: address.slice(0, 4).join('.'),
                port: address.readUInt16BE(4)
            }
        })
    }
}