/**
 * This file is forked off of underbluewaters/node-photobooth project, rewritten
 * in plain ol' JS:
 * https://github.com/underbluewaters/node-photobooth/blob/master/capture_photos.coffee
 */

var EventEmitter = require('events').EventEmitter
var spawn = require('child_process').spawn

var savingRegex = /Saving file as ([^.jpg]+)/g
var capturedPhotoRegex = /New file is in/g

var cameraControl = function(filename, cwd) {
  console.log('calling cameraConrol');
  if (filename === undefined) filename = "%m-%y-%d_%H:%M:%S.jpg";
  if (cwd === undefined) cwd = "photos";

  var capture = spawn('gphoto2', [
    '--capture-image-and-download',
    '--filename=' + filename
  ], {cwd: cwd});

  var emitter = new EventEmitter();
  emitter.emit('camera_begin_snap');

  capture.stdout.on('data', function(data) {
    if (capturedPhotoRegex.exec(data.toString())) {
      console.log('camera snapped!');
      emitter.emit('camera_snapped');
    }

    var saving = savingRegex.exec(data.toString());
    if (saving) {
      var fname = saving[1] + '.jpg';
      console.log('saved to '+fname);
      emitter.emit('photo_saved', fname);
    }
  });
  return emitter;
};

module.exports = cameraControl