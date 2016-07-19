var OpenNI = require('openni');
var WS = require('ws').Server;
var server = require('http').createServer();
var wss = new WS({ server: server });
var buf = new ArrayBuffer(13), view = new DataView(buf);

var context = OpenNI();
var peer = null;
var prevPos = {
  head: {x: 0, y: 0, z: 0},
  left: {x: 0, y: 0, z: 0},
  right: {x: 0, y: 0, z: 0},
};

var HEAD = 1;
var LEFT_HAND = 2;
var RIGHT_HAND = 3;
var THRESHOLD = 2;

context.setJoints(['head', 'left_hand', 'right_hand']);

function sendPosition(trackingType, x, y, z) {
  view.setUint8(0, trackingType);
  view.setFloat32(1, Math.round(x));
  view.setFloat32(5, Math.round(y));
  view.setFloat32(9, Math.round(z));
  peer.send(buf, {binary: true});
}

context.on('head', function(user, x, y, z) {
  var pos = {
    x: Math.round(x),
    y: Math.round(y),
    z: Math.round(z)
  };

  if(Math.abs(pos.x - prevPos.head.x) < THRESHOLD && Math.abs(pos.y - prevPos.head.y) < THRESHOLD && Math.abs(pos.z - prevPos.head.z) < THRESHOLD) return;

  prevPos.head.x = pos.x;
  prevPos.head.y = pos.y;
  prevPos.head.z = pos.z;

//  console.log('User ' + user + ': ' + Math.round(x) + ', ' + Math.round(y) + ', ' + Math.round(z));
  if(peer) {
    sendPosition(HEAD, x, y, z);
  }
});

context.on('left_hand', function(user, x, y, z) {
  var pos = {
    x: Math.round(x),
    y: Math.round(y),
    z: Math.round(z)
  };

  if(Math.abs(pos.x - prevPos.left.x) < THRESHOLD && Math.abs(pos.y - prevPos.left.y) < THRESHOLD && Math.abs(pos.z - prevPos.left.z) < THRESHOLD) return;

  prevPos.left.x = pos.x;
  prevPos.left.y = pos.y;
  prevPos.left.z = pos.z;

  if(peer) {
    sendPosition(LEFT_HAND, x, y, z);
  }
});

context.on('right_hand', function(user, x, y, z) {
  var pos = {
    x: Math.round(x),
    y: Math.round(y),
    z: Math.round(z)
  };

  if(Math.abs(pos.x - prevPos.right.x) < THRESHOLD && Math.abs(pos.y - prevPos.right.y) < THRESHOLD && Math.abs(pos.z - prevPos.right.z) < THRESHOLD) return;

  prevPos.right.x = pos.x;
  prevPos.right.y = pos.y;
  prevPos.right.z = pos.z;

  if(peer) {
    sendPosition(RIGHT_HAND, x, y, z);
  }
});

wss.on('connection', function(clientSock) {
  console.log('Client connected!');
  clientSock.send(buf, {binary: true});
  peer = clientSock;
});

wss.on('close', function() {
  console.log('Client disconnected');
  peer = false;
});

server.listen(8080);

process.on('SIGINT', function() {
  context.close();
  process.exit();
});
