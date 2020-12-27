//you can't use undeclared variables
'use strict';

// Using require to access dgram,buffer,url module
const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;


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
            const announceReq = buildAnnounceReq(connResp.connectionId);
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
    message = Buffer.from('utf8');
    socket.send(message, 0, message.length, url.port, url.host, callback);
}

function respType(resp) {

}

function buildConnReq() {

}

function parseConnResp(resp) {

}

function buildAnnounceReq(connId) {

}

function parseAnnounceResp(resp) {

}
