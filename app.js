// import module
// also req: jade
var express = require('express');
var sys = require('sys');

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
    title: 'shmile'
  });
});

var io = require('socket.io').listen(web);
web.listen(3000, 'localhost');
console.log('Web server listening on %s:%d', 'localhost', 3000);

io.sockets.on('connection', function(socket) {
  sys.puts('Web browser connected');
  console.log('CONNECTED to web browser.');

  /**
   * Executed whenever I receive a msg from the Web client.
   */
  socket.on('message', function(msg) {
    console.log('message is: ' + msg);
  });

});