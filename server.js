/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */

const HTTP_PORT = 3000;


const http = require('http');
const express = require('express');
const barnowl = require('barnowl');
const socketio = require('socket.io');
const path = require('path');


var app = express();
app.use(express.static(path.resolve(__dirname + '/public')));
var server = http.createServer(app);
var io = socketio(server);

server.listen(HTTP_PORT, function() {
  console.log("barnowl-band is listening on port " + HTTP_PORT);
});


// Create a new barnowl instance and bind it to the serial port
var middleware = new barnowl( { n: 1, enableMixing: false } );
middleware.bind( { protocol: 'serial', path: 'auto' } );

var timeout = 1500;
var stopCalls = {};

// Handle radio decodings
middleware.on('visibilityEvent', function(tiraid) {
  try {
    var uid = tiraid.identifier.advData.serviceData.eddystone.uid;
    if (uid.namespace.indexOf('c0de') > -1) { // instrument detected
      var number = parseInt(uid.instance);
      //console.log(number);
      clearTimeout(stopCalls[number]);
      io.emit('play', { instrument: number });
      stopCalls[number] = setTimeout(function() {
        stopPlaying(number);
      }, timeout);
    }
  } catch(e) {

  }
});

function stopPlaying(number) {
  //console.log('stopping ' + number);
  io.emit('stop', { instrument: number });
}