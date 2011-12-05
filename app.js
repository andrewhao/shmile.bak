// import module
// also req: jade
var express = require('express');
var sys = require('sys');
var cameraControl = require('./camera_control.js');
var image_twiddle = require('./image_twiddler.js');
var web = express.createServer();
// var redis = require('redis')

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

State = {
  image_src_list: []
};

// var redis_client = redis.createClient();

// redis_client.on('connect', function() {
//   console.log('connected to redis');
// })

var io = require('socket.io').listen(web);
web.listen(3000, 'localhost');
console.log('Web server listening on %s:%d', 'localhost', 3000);

io.sockets.on('connection', function(websocket) {
  sys.puts('Web browser connected');

  // Init the camera controller (gphoto2 lib)
  camera = cameraControl();

  // Camera is beginning to prepare for the shutter snap.
  camera.on('camera_begin_snap', function() {
    console.log('begin snap');
    websocket.emit('camera_begin_snap');
  });

  // Camera shutter has closed and the camera is now downloading the image.
  camera.on('camera_snapped', function() {
    console.log('camera snapped');
    websocket.emit('camera_snapped');
  });

  // Camera photo is saved to the disk and ready for read.
  camera.on('photo_saved', function(filename, path, web_url) {
    console.log('I saw the photo saved to '+filename);
    State.image_src_list.push(path);
    console.log('Updated image list:'+State.image_src_list);    
    websocket.emit('photo_saved', {filename: filename, path: path, web_url: web_url});
  });

  // Executed whenever I receive a msg from the Web client.
  websocket.on('message', function(msg) {
    console.log('message is: ' + msg);
  });

  // The browser is letting me know I should execute a shutter snap.
  websocket.on('snap', function(isFirst) {
    camera.emit('snap', isFirst);
    // do snap
    // when done, it should emit "camera_snapped"
    // when saved, it should emit "photo_saved"
    // and be ready to receive another snap
  });

  // The browser is telling me to knit the images together.
  // TODO/ahao This shouldn't be specified by the browser. It
  // should be triggered on the final camera snap.
  websocket.on('composite', function() {
    image_twiddle(State.image_src_list, null, function() {
      console.log('clearing images');
      State.image_src_list = [];
    });
  });

  // The browser is telling me to print the image.
  // TODO/ahao This shouldn't be dependent on the browser...
  websocket.on('print', function() {
    console.log('at this point, I should print the file');
    // do print
    // when done, it should emit "printed" (?)
  });

});