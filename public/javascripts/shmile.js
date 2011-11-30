// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

var PHOTO_MARGIN = 50; // Margin for the composite photo per side
var WINDOW_WIDTH = $(window).width();
var WINDOW_HEIGHT = $(window).height() - 10;

// Current app state 
var State = {
  photoset: [],
  set_id: null,
  current_frame_idx: 0,
  zoomed: null
};

$(window).ready(function () {
  // init code
  startButton = $('button#start-button');
  var buttonX = (WINDOW_WIDTH - startButton.outerWidth())/2;
  var buttonY = (WINDOW_HEIGHT - startButton.outerHeight())/2;
  
  startButton.hide();
  
  // Position the start button in the center
  startButton.css({'top': buttonY, 'left': buttonX});
  
  // Click handler for the start button.
  startButton.click(function(e) {
      var button = $(e.currentTarget);
      button.fadeOut(1000);
      $(document).trigger('ui_button_pressed');
  });

  p = new PhotoView();
  p.render();
});

/*****************************************************************************/

// Set up the socket
var socket = io.connect('http://localhost:3000');

socket.on('message', function(data) {
  console.log('data is' + data);
});

socket.on('connect', function() {
  console.log('connected evt');
  fsm.connected();
});

$(document).bind('ui_button_pressed', function() {
  console.log('ui_button_pressed evt');
  fsm.ui_button_pressed();
});

socket.on('camera_snapped', function() {
  console.log('camera_snapped evt');
  //fsm.camera_snapped();
})

socket.on('photo_saved', function(data) {
  console.log('photo_saved evt: '+data.filename);
  fsm.photo_saved(data);
});

/*
 * STATE MACHINE DEFINITION
 * Keep track of app state and logic.
 *
 * + loading
 *   - connected
 * + ready
 *   - ui_button_pressed (DOM button click)
 * + counting_down
 *   - time_up (emit: snap)
 * + snap
 *   - camera_snapped
 * + waiting_for_photo
 *   - photo_saved
 * + review_photo
 *   - time_up (emit: print)
 */
var fsm = StateMachine.create({
  initial: 'loading',
  events: [
    { name: 'connected', from: 'loading', to: 'ready' },
    { name: 'ui_button_pressed', from: 'ready', to: 'waiting_for_photo' },
    // { name: 'time_up', from: 'counting_down', to: 'snap' },
    // { name: 'camera_snapped', from: 'snap', to: 'waiting_for_photo' },
    { name: 'photo_saved', from: 'waiting_for_photo', to: 'review_photo' },
    // No conditional transitions in this FSM framework? oh well.
    { name: 'finished_review_partial', from: 'review_photo', to: 'waiting_for_photo' },
    { name: 'finished_review', from: 'review_photo', to: 'ready'}
  ],
  callbacks: {
    onconnected: function() {
      p.animate('in', function() {
        startButton.fadeIn();
      });
    },
    onenterready: function() {
      p.resetState();
    },
    onenterwaiting_for_photo: function(e) {
      var randomId = Math.ceil(Math.random()*100000);
      socket.emit('snap', true);
      CameraUtils.snap(randomId);
    },
    onphoto_saved: function(e, f, t, data) {
      // update UI
      console.log('photo saved.');
      console.log(data);
      p.updatePhotoSet(data.web_url)
    },
    onenterreview_photo: function(e, f, t) {
      if (State.current_frame_idx == 3) { fsm.finished_review(); }
      else { fsm.finished_review_partial(); }
    },
    onleavereview_photo: function() {
      // Then reset the frame index state.
      State.current_frame_idx = (State.current_frame_idx + 1) % 4      
    },
    onfinished_review: function() {
      socket.emit('print');
      p.modalMessage('Nice!', 3000, 200, function() {
        p.next();
      });
    },
    onchangestate: function(e, f, t) {
      console.log('fsm received event '+e+', changing state from ' + f + ' to ' + t)
    }
  }
});