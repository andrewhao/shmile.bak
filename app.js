// import module
// also req: jade
var osc = require('osc4node');
var express = require('express');
var sys = require('sys');

SERVER_PORT = 9001
CLIENT_PORT = 9000

// create osc server and client
var oscServer = new osc.Server(SERVER_PORT, 'localhost')
  , oscClient = new osc.Client('localhost', CLIENT_PORT);

console.log('OSC Server set up, listening on port '  + SERVER_PORT);
console.log('OSC Client set up, listening on port '  + CLIENT_PORT);

var message = new osc.Message('/live/time');
sys.puts("sending message" + sys.inspect(message));
oscServer.send(message, oscClient);

var web = express.createServer();

web.configure(function(){
    web.set('views', __dirname + '/views');
    web.set('view engine', 'jade');
    web.use(express.bodyParser());
    web.use(express.methodOverride());
    web.use(web.router);
    web.use(express.static(__dirname + '/public'));
});

web.get('/', function(req, res) {
  res.render('index', {
    title: 'mmtss'
  });
});

var io = require('socket.io').listen(web);
web.listen(3000, 'localhost');
console.log('Web server listening on %s:%d', 'localhost', 3000);

/**
 * We define our own message syntax:
 * {address {str}
 *  args: [] tuples: [<arg1>, <arg2>]
 */
sendOSCMessage = function(msg) {
  console.log('Sending a message to OSC: ' + JSON.stringify(msg))
  var oscMsg;
  // Handle the no-argument case.
  if (msg.args === undefined) {
    oscMsg = new osc.Message(msg.address)
  } else {
    oscMsg = new osc.Message(msg.address, msg.args)
  }
  oscServer.send(oscMsg, oscClient);
};

io.sockets.on('connection', function(socket) {
  sys.puts('Web browser connected');
  console.log('CONNECTED to NODE');

  /**
   * Executed whenever I receive a msg from the Web client.
   */
  socket.on('message', function(msg) {
    console.log('message is: ' + msg)
  });
  
  socket.on('osc_command', function(msg) {
    sendOSCMessage(msg);    
  });

  /**
   * Received from OSC.
   */
  oscServer.on('oscmessage', function(msg, rinfo) {
    sys.puts("Received from OSC: " + sys.inspect(msg));
    socket.emit('osc_response', msg);
    //socket.send(JSON.stringify({sender: 'OSCMSG', body: msg}));
  });

});