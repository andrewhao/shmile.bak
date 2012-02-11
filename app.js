// import module
var express = require('express'),
    sys = require('sys'),
    fs = require('fs'),
    yaml = require('yaml'),
    photo_file_utils = require('./photo_file_utils'),
    camera_control = require('./camera_control.js'),
    image_twiddle = require('./image_twiddler.js'),
    web = express.createServer(),
    exec = require('child_process').exec;

// TODO/ahao
var yml = fs.readFileSync("config/shmile.yml", "utf-8");

web.configure(function(){
    web.set('views', __dirname + '/views');
    web.set('view engine', 'jade');
    web.use(express.bodyParser());
    web.use(express.methodOverride());
    web.use(web.router);
    web.use(express.static(__dirname + '/public'));
});

console.log()

web.get('/', function(req, res) {
  res.render('index', {
    title: 'shmile',
    extra_js: ['camera_utils', 'photo_view', 'shmile'],
    extra_css: []
  });
});

web.get('/gallery', function(req, res) {
  res.render('gallery', {
    title: 'gallery!',
    extra_js: ['photoswipe/klass.min', 'code.photoswipe.jquery-3.0.4.min', 'shmile_gallery'],
    extra_css: ['photoswipe/photoswipe'],
    image_paths: photo_file_utils.composited_images(true)
  });
});

// FIXME Bleh, shouldn't be tracked in a global...
State = {
  image_src_list: []
};

var io = require('socket.io').listen(web);
web.listen(3000);

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

  // The browser is requesting an updated array of images
  websocket.on('all_images', function() {
    // TODO
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
      // TODO change to config var
      if (false) {
        exec('lpr ' + output_file_path);
      }
      // Let all connected clients know there is a new composited image
      websocket.broadcast.emit('composited_image', photo_file_utils.photo_path_to_url(output_file_path))
    });

    compositer.on('generated_thumb', function(thumb_path) {
      // Let all connected clients know there is a new thumb image
      websocket.broadcast.emit('generated_thumb', photo_file_utils.photo_path_to_url(thumb_path));
    });

  });

});