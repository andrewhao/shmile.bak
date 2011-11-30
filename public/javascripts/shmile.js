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
  socket.emit('snap');
});

socket.on('camera_snapped', function() {
  console.log('camera_snapped evt');
  fsm.camera_snapped();
})

socket.on('photo_saved', function(data) {
  console.log('photo_saved evt: '+data.filename);
  fsm.photo_saved();
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
    { name: 'ui_button_pressed', from: 'ready', to: 'snap' },
    // { name: 'time_up', from: 'counting_down', to: 'snap' },
    { name: 'camera_snapped', from: 'snap', to: 'waiting_for_photo' },
    { name: 'photo_saved', from: 'waiting_for_photo', to: 'review_photo' },
    { name: 'finished_review', from: 'review_photo', to: 'ready'}
  ],
  callbacks: {
    onenterreview_photo: function(e, f, t) {
      socket.emit('print');
      setTimeout(function() {
        fsm.finished_review();
      }, 3000);
    },
    onchangestate: function(e, f, t) {
      console.log('fsm received event '+e+', changing state from ' + f + ' to ' + t)
    }
  }
});