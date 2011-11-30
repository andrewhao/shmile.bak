// Set up the socket
var socket = io.connect('http://localhost:3000');

socket.on('message', function(data) {
  console.log('data is' + data);
});

socket.on('connect', function() {
  console.log('connected');
});


/*
 * STATE MACHINE DEFINITION
 * Keep track of app state and logic.
 *
 * + loading
 *   - connected
 * + ready
 *   - button_press (client)
 * + counting_down
 *   - time_up (emit: snap)
 * + snap
 *   - camera_snapped
 * + waiting_for_photo
 *   - photo_saved
 * + compositing_photo
 *   - done_compositing
 * + review_photo
 *   - time_up (emit: print)
 */
var fsm = StateMachine.create({
  initial: 'loading',
  events: [
    { name: 'connected', from: 'loading', to: 'ready' },
    { name: 'button_press', from: 'ready', to: 'counting_down' },
    { name: 'time_up', from: 'counting_down', to: 'snap' },
    { name: 'camera_snapped', from: 'snap', to: 'waiting_for_photo' },
    { name: 'photo_saved', from: 'waiting_for_photo', to: 'compositing_photo' },
    { name: 'done_compositing', from: 'compositing_photo', to: 'review_photo' },
    { name: 'time_up', from: 'review_photo', to: 'ready'}
  ],
  callbacks: {
    onenterwait: function(e, f, t) {
      // you entered with event "recordready"
      // from practice
      console.log('now in state ' + t);
      updateStateText();
      cmd.newClip(State.currentTrack);
      $('#record').toggleClass('wait', true);
    },
    onenterrecord: function(e, f, t) {
      // entered with event "loopbegin"
      cmd.storeClip(State.currentTrack);
      updateStateText();
      nextInstrument();
      console.log('now in state ' + t);
      $('#record').toggleClass('wait', false);
    },
    onenterpractice: function(e, f, t) {
      cmd.muteTrack(State.prevTrack, 1);
      updateStateText();
      cmd.muteTrack(State.currentTrack, 0);
      // stop any clips in getInstrumentGroup(newtrk)
      stopClipsInGroup();
      console.log('now in state ' + t);
    },
    onleaverecord: function() {
      $('#record').attr('checked', false);
      var info = getInstrumentInfo();
      $('#current-instrument').text(info.description + " " + info.name);
    }
  }
});