// import module
// also req: jade
var express = require('express'),
    sys = require('sys'),
    camera_control = require('./camera_control.js'),
    image_twiddle = require('./image_twiddler.js'),
    web = express.createServer(),
    exec = require('child_process').exec;

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

  /*
   * CAMERA RELATED EVENTS
   */
  // Init the camera controller (gphoto2 lib)
  var camera = camera_control();

  // Camera is beginning to prepare for the shutter snap.
  camera.on('camera_begin_snap', function() {
    websocket.emit('camera_begin_snap');
  });

  // Camera shutter has closed and the camera is now downloading the image.
  camera.on('camera_snapped', function() {
    websocket.emit('camera_snapped');
  });

  // Camera photo is saved to the disk and ready for read.
  camera.on('photo_saved', function(filename, path, web_url) {
    State.image_src_list.push(path);
    websocket.emit('photo_saved', {filename: filename, path: path, web_url: web_url});
  });

  /*
   * BROWSER-RELATED EVENTS
   */
  // The browser is letting me know I should execute a shutter snap.
  websocket.on('snap', function(isFirst) {
    camera.emit('snap', isFirst);
  });

  // The browser is telling me to knit the images together.
  websocket.on('composite', function() {
    var compositer = image_twiddle(State.image_src_list);
    compositer.emit('composite');
    // Reset when finished.
    compositer.on('composited', function(output_file_path) {
      console.log('Finished compositing image. Output image is at ', output_file_path);
      // Clear the source list.
      State.image_src_list = [];

      // Print the image to the default printer.
      exec('lpr ' + output_file_path);
    });
  });

});