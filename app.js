// import module
// also req: jade
var express = require('express');
var sys = require('sys');
var cameraControl = require('./camera_control.js');
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

io.sockets.on('connection', function(websocket) {
  sys.puts('Web browser connected');

  // Init the camera controller (gphoto2 lib)
  camera = cameraControl();
  camera.on('camera_begin_snap', function() {
    console.log('begin snap');
    websocket.emit('camera_begin_snap');
  });
  camera.on('camera_snapped', function() {
    console.log('camera snapped');
    websocket.emit('camera_snapped');
  });
  camera.on('photo_saved', function(filename, path, web_url) {
    console.log('I saw the photo saved to '+filename);
    websocket.emit('photo_saved', {filename: filename, path: path, web_url: web_url});
  });

  /**
   * Executed whenever I receive a msg from the Web client.
   */
  websocket.on('message', function(msg) {
    console.log('message is: ' + msg);
  });
  websocket.on('snap', function(isFirst) {
    camera.emit('snap', isFirst);
    // do snap
    // when done, it should emit "camera_snapped"
    // when saved, it should emit "photo_saved"
    // and be ready to receive another snap
  });
  websocket.on('print', function() {
    console.log('at this point, I should print the file');
    // do print
    // when done, it should emit "printed" (?)
  });

});