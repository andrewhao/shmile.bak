$(document).ready(function(){
  var opts = {
    autoStartSlideshow: true,
    slideshowDelay: 5000,
    cacheMode: Code.PhotoSwipe.Cache.Mode.normal,
    loop: true
  };
  gallery = $("#image-list a").photoSwipe(opts);
  $('#image-list a:first').trigger('click');
});

// Set up the socket
var socket = io.connect('/')

socket.on('message', function(data) {
  console.log('data is' + data);
});

socket.on('connect', function() {
  console.log('connected evt');
  fsm.connected();
});

socket.on('generated_thumb', function(url) {
  console.log('generated_thumb evt: '+url);

  // A generated thumb means I need to add it to the slideshow.
  var a = $('<a/>')
    .attr('href', url)
    .append(
      $('<img />').attr('src', url).attr('alt', '')
    ).appendTo('ul#image-list');

  var src = gallery.settings.getImageSource(a[0]);
  var caption = gallery.settings.getImageCaption(a[0]);
  var metaData = gallery.settings.getImageMetaData(a[0]);

  gallery.cache.images.push(new Code.PhotoSwipe.Image.ImageClass(img, src, caption, metaData))

});

/*
 * STATE MACHINE DEFINITION
 * Keep track of app state and logic.
 *
 * + loading
 *   - connected() -> ready
 * + ready
 *   - photo_saved() -> (update gallery)

 */
var fsm = StateMachine.create({
  initial: 'loading',
  events: [
    { name: 'connected', from: 'loading', to: 'ready' },
  ],
  callbacks: {
    onconnected: function() {
    },
    onenterready: function() {
    },
    onchangestate: function(e, f, t) {
      console.log('fsm received event '+e+', changing state from ' + f + ' to ' + t)
    }
  }
});