var im = require('imagemagick'),
    exec = require('child_process').exec,
    fs = require('fs');

var EventEmitter = require('events').EventEmitter;

var IMAGE_HEIGHT = 800,
    IMAGE_WIDTH = 1200,
    IMAGE_PADDING = 50;

var TOTAL_HEIGHT = IMAGE_HEIGHT * 2 + IMAGE_PADDING * 3,
    TOTAL_WIDTH = IMAGE_WIDTH * 2 + IMAGE_PADDING * 3;

image_twiddle = function(img_src_list, opts, cb) {

  if (img_src_list === undefined) img_src_list = null;
  if (opts === undefined) {
    opts = {
      overlay_src: 'public/images/overlay.png',
      tmp_dir: 'public/temp',
      output_dir: 'public/photos/generated',
      thumb_dir: 'public/photos/generated/thumbs'
    }
  }

  var emitter = new EventEmitter();
  emitter.on('composite', function() {

    var convertArgs = [
      '-size', TOTAL_WIDTH + 'x' + TOTAL_HEIGHT,
      'canvas:white'
    ]

    var utcSeconds = (new Date()).valueOf(); // secs from epoch
    var IMAGE_GEOMETRY = IMAGE_WIDTH + 'x' + IMAGE_HEIGHT;
    var OUTPUT_PATH = opts.tmp_dir + '/out.jpeg';
    var OUTPUT_FILE_NAME = utcSeconds + '.jpeg';
    var FINAL_OUTPUT_PATH = opts.output_dir + '/' + 'gen_' + OUTPUT_FILE_NAME;
    var FINAL_OUTPUT_THUMB_PATH = opts.thumb_dir + '/' + 'thumb_' + OUTPUT_FILE_NAME;

    var GEOMETRIES = [
      IMAGE_GEOMETRY + '+' + IMAGE_PADDING + "+" + IMAGE_PADDING,
      IMAGE_GEOMETRY + '+' + (2*IMAGE_PADDING + IMAGE_WIDTH) + "+" + IMAGE_PADDING,
      IMAGE_GEOMETRY + '+' + IMAGE_PADDING + "+" + (IMAGE_HEIGHT + 2*IMAGE_PADDING),
      IMAGE_GEOMETRY + '+' + (2*IMAGE_PADDING + IMAGE_WIDTH) + "+" + (2*IMAGE_PADDING + IMAGE_HEIGHT)
    ];

    for (var i = 0; i < img_src_list.length; i++) {
      convertArgs.push(img_src_list[i]);
      convertArgs.push('-geometry');
      convertArgs.push(GEOMETRIES[i]);
      convertArgs.push('-composite');    
    }
    convertArgs.push(OUTPUT_PATH);

    // Tile the images first, then do the compositing.
    im.convert(convertArgs, function(err, stdout, stderr){
      if (err) throw err
      emitter.emit('laid_out', OUTPUT_PATH);
      doCompositing();
    });

    var doCompositing = function() {
      var compositeArgs = [
        '-gravity', 'center',
        opts.overlay_src,
        OUTPUT_PATH,
        '-geometry', TOTAL_WIDTH+"x"+TOTAL_HEIGHT,
        FINAL_OUTPUT_PATH
      ];

      exec('composite ' + compositeArgs.join(' '), function(error, stderr, stdout) {
        if (error) {
          throw error;
        }
        emitter.emit('composited', FINAL_OUTPUT_PATH);
        doGenerateThumb();
      });
    }

    var resizeCompressArgs = [
      '-size', '25%',
      '-quality', '20',
      FINAL_OUTPUT_PATH,
      FINAL_OUTPUT_THUMB_PATH
    ];

    var doGenerateThumb = function() {
      im.convert(resizeCompressArgs, function(e, out, err) {
        if (err) throw err
        emitter.emit('generated_thumb', FINAL_OUTPUT_THUMB_PATH)
      })
    }
  });
  return emitter;
}

module.exports = image_twiddle