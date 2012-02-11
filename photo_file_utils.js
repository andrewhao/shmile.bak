var fs = require('fs')

// Singleton utility class.
var PhotoFileUtils = (function() {

  var GENERATED_PHOTOS_PATH = 'public/photos/generated'
  var GENERATED_THUMBS_PATH = 'public/photos/generated/thumbs'
  var GENERATED_PHOTOS_URL = 'photos/generated'

  /**
   * Return an array of all files in the dir.
   * @param wantUrlPrefix
   *   Include a prefix such that a browser could use it to load the JPGs.
   */
  var composited_images = function(wantUrlPrefix, wantFullSize) {
    var path = (wantFullSize) ? GENERATED_PHOTOS_PATH : GENERATED_THUMBS_PATH;
    var files = fs.readdirSync(path);
    var ret = [];
    for (i in files) {
      var file = files[i];
      if (file.match(/jpeg$/)) {
        var prefix = (wantUrlPrefix) ? GENERATED_PHOTOS_URL + '/' : '';
        ret.push(prefix + file);
      }
    }
    return ret;
  };

  /**
   * Convert from a relative FS path ("public/photos/generated/foo.jpg") to
   * a relative URL for the browser ("/photos/generated/foo.jpg")
   */
  var photo_path_to_url = function(relpath) {
    return relpath.replace(/^public/, '')
  };
  return {
    composited_images: composited_images,
    photo_path_to_url: photo_path_to_url
  }
})();

module.exports = PhotoFileUtils