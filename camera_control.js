/**
 * This file is forked off of underbluewaters/node-photobooth project, rewritten
 * in plain ol' JS:
 * https://github.com/underbluewaters/node-photobooth/blob/master/capture_photos.coffee
 */

var EventEmitter = require('events').EventEmitter
var spawn = require('child_process').spawn

var savingRegex = /Saving file as ([^.jpg]+)/g
var capturedPhotoRegex = /New file is in/g

var cameraControl = function(filename, cwd, web_root_path, numFrames) {
  console.log('setting up cameraControl module');
  if (filename === undefined) filename = "%m-%y-%d_%H:%M:%S.jpg";
  if (cwd === undefined) cwd = "public/photos";
  if (web_root_path === undefined) web_root_path = "/photos";

  var emitter = new EventEmitter();

  emitter.on('snap', function() {

    emitter.emit('camera_begin_snap');

    console.log('snapping...');
    var capture = spawn('gphoto2', [
      '--capture-image-and-download',
      '--force-overwrite',
      '--filename=' + filename
    ], {cwd: cwd});
    console.log('capture object is ' + capture);

    capture.stdout.on('data', function(data) {
      if (capturedPhotoRegex.exec(data.toString())) {
        console.log('camera snapped!');
        emitter.emit('camera_snapped');
      }

      var saving = savingRegex.exec(data.toString());
      if (saving) {
        var fname = saving[1] + '.jpg';
        console.log('saved to '+fname);
        emitter.emit('photo_saved', fname, cwd+'/'+fname, web_root_path+'/'+fname);
      }
    });
  });
  return emitter;
};

module.exports = cameraControl