'use strict';
const fs = require('fs');
const bencode = require('bencode');

const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;

const tracker = require('./tracker');

const torrent = bencode.decode(fs.readFileSync('puppy.torrent'));

tracker.getPeers(torrent, peers=>{
  console.log('list of peers: ', peers);
});
