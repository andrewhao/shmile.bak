var Shmile = {
  PHOTO_MARGIN: 50, // Margin for the composite photo per side
  WINDOW_WIDTH: $(window).width(),
  WINDOW_HEIGHT: $(window).height() - 10,
  OVERLAY_DELAY: 2000,
  NEXT_DELAY: 10000,
  CHEESE_DELAY: 400,
  FLASH_DURATION: 1000,
  READY_DELAY: 2000,
  NICE_DELAY: 5000,

  // The amount of time we should pause between each frame shutter
  // I tend to bump this up when 1) photobooth participants want more
  // time to review their photos between shots, and 2) when I'm shooting
  // with external flash and the flash needs more time to recharge.
  BETWEEN_SNAP_DELAY: 1000,

  // For usability enhancements on iPad, set this to "true"
  IS_MOBILE: false
}

// Current app state 
var State = {
  photoset: [],
  set_id: null,
  current_frame_idx: 0,
  zoomed: null
};

$(window).ready(function() {

  // init code
  startButton = $('button#start-button');
  var buttonX = (Shmile.WINDOW_WIDTH - startButton.outerWidth())/2;
  var buttonY = (Shmile.WINDOW_HEIGHT - startButton.outerHeight())/2;
  
  startButton.hide();
  
  // Position the start button in the center
  startButton.css({'top': buttonY, 'left': buttonX});


  var buttonTriggerEvt = Shmile.IS_MOBILE ? "touchend" : "click";

  startButton.bind(buttonTriggerEvt, function(e) {
    var button = $(e.currentTarget);
    button.fadeOut(1000);
    $(document).trigger('ui_button_pressed');
  });

  p = new PhotoView();
  p.render();
});

/*****************************************************************************/

// Set up the socket
var socket = io.connect('/')

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
 *   - connected() -> ready
 * + ready
 *   - ui_button_pressed() (DOM button click) -> waiting_for_photo
 * + waiting_for_photo
 *   - photo_saved() -> review_photo
 * + review_photo
 *   - photo_updated() -> next_photo
 * + next_photo
 *   - continue_partial_set() -> waiting_for_photo
 *   - finish_set() -> ready
 */
var fsm = StateMachine.create({
  initial: 'loading',
  events: [
    { name: 'connected', from: 'loading', to: 'ready' },
    { name: 'ui_button_pressed', from: 'ready', to: 'waiting_for_photo' },
    { name: 'photo_saved', from: 'waiting_for_photo', to: 'review_photo' },
    { name: 'photo_updated', from: 'review_photo', to: 'next_photo' },
    { name: 'continue_partial_set', from: 'next_photo', to: 'waiting_for_photo' },
    { name: 'finish_set', from: 'next_photo', to: 'review_composited' },
    { name: 'next_set', from: 'review_composited', to: 'ready'}
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
      cheeseCb = function() {
        socket.emit('snap', true);
      }
      CameraUtils.snap(State.current_frame_idx, cheeseCb);
    },
    onphoto_saved: function(e, f, t, data) {
      // update UI
      // By the time we get here, the idx has already been updated!!
      p.updatePhotoSet(data.web_url, State.current_frame_idx, function() {
        setTimeout(function() {
          fsm.photo_updated();
        }, Shmile.BETWEEN_SNAP_DELAY)
      });
    },
    onphoto_updated: function(e, f, t) {
      // We're done with the full set.
      if (State.current_frame_idx == 3) {
        fsm.finish_set();
      }
      // Move the frame index up to the next frame to update.
      else {
        State.current_frame_idx = (State.current_frame_idx + 1) % 4
        fsm.continue_partial_set();
      }
    },
    onenterreview_composited: function(e, f, t) {
      socket.emit('composite');
      p.showOverlay(true);
      setTimeout(function() { fsm.next_set() }, Shmile.NEXT_DELAY);
    },
    onleavereview_composited: function(e, f, t) {
      // Clean up
      p.animate('out');
      p.modalMessage('Nice!', Shmile.NICE_DELAY, 200, function() {p.slideInNext()});
    },
    onchangestate: function(e, f, t) {
      console.log('fsm received event '+e+', changing state from ' + f + ' to ' + t)
    }
  }
});