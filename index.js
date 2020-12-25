'use strict';
const fs = require('fs');
const bencode = require('bencode');

const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;


const torrent = bencode.decode(fs.readFileSync('puppy.torrent'));
console.log(torrent.announce.toString('utf8'));

const url = urlParse(torrent.announce.toString('utf8'));
console.log(url);

const socket = dgram.createSocket('udp4');

const myMsg = Buffer.from('hello', 'utf8');

socket.send(myMsg, 0, myMsg.length, url.port, url.host, ()=> {});

socket.on('message', msg => {
  console.log('message is ', msg);
})
