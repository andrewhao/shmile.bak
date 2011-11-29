BEATS_PER_LOOP = 32;

// Map an OSC event to an app-specific event.
// {<oscPath>: <event>} map
EVENT_MAP = {
  '/live/beat': 'beat'
}

State = {
  prevTrack: 10,
  currentTrack: 11
}

INSTRUMENT_GROUPS = {
  'bass':[1],
  'pads':[2,3],
  'repeater':[4,5],
  'choir':[6,7,8],
  'twang':[9,10],
  'beat':[11]
}

INSTRUMENT_ADJECTIVES = {
  'bass':['deep', 'smooth', 'soulful', 'righteous'],
  'pads':['warm', 'humming', 'organ-like', 'mm-tastic'],
  'repeater':['sprinkled', 'bouncy', 'icing-on-the-cake', 'thrilling'],
  'choir':['voicey', 'ahh-inducing', 'breathy', 'enveloping'],
  'twang':['harpsichord', 'plucky', 'tinny', 'piercing'],
  'beat':['grooving', 'bumping', 'pumping', 'punching']
}

CLIP_COUNTER = {}

NUM_INSTRUMENTS = _.flatten(_.values(INSTRUMENT_GROUPS)).length;

STATE_UI_TEXT = {
    'practice': {
        name: "PRACTICING",
        desc: "You can now practice with your current instrument as long as you'd like. When you're "
              + "ready to begin to record your track, press the RECORD button: <input type='radio' id='record2' name='record-toggle' data-icon='◉' />."
    },
    'wait': {
        name: "WAITING TO RECORD",
        desc: "We need to wait for all the bars of this current track to finish looping. When the "
              + "bars count all the way down, your track will automatically begin recording. Be ready!"
    },
    'record': {
        name: 'RECORDING',
        desc: "Rock on! Anything you're playing now will be recorded into the mix. Gosh, you sound good."
    }
}

function updateStateText() {
    if (fsm === undefined) return;
    var stateInfo = STATE_UI_TEXT[fsm.current];
    $('#status-text h2.status').html(stateInfo.name);
    $('#status-text p.description').html(stateInfo.desc);
};

function getInstrumentInfo() {
  instGroup = getGroup(State.currentTrack);
  return {
    name: instGroup,
    description: INSTRUMENT_ADJECTIVES[instGroup][Math.floor(Math.random()*INSTRUMENT_ADJECTIVES[instGroup].length)]
  }
}

function getGroup(trk) {
  for (var group in INSTRUMENT_GROUPS) {
    if (_.include(INSTRUMENT_GROUPS[group], trk)) {
      return group;
    }
  }
}

function Instrument(trkNum) {
  this.trackNum = trkNum;
}

function nextInstrument() {
   State.prevTrack = State.currentTrack;
   eligibleGroups = _.without(_.keys(INSTRUMENT_GROUPS), getGroup(State.prevTrack));
   currentGroup = eligibleGroups[Math.floor(Math.random()*5)];
   State.currentTrack = INSTRUMENT_GROUPS[currentGroup][Math.floor(Math.random()*INSTRUMENT_GROUPS[currentGroup].length)];
}

function getInputTrack(trk) {
  return trk + NUM_INSTRUMENTS;
}

function stopClipsInGroup() {
  insts = INSTRUMENT_GROUPS[getGroup(State.currentTrack)];
  for (var i in insts) {
    cmd.stopClip(insts[i]);
  }
}

/**
 * Command - Wrapper around socket to send messages.
 */
function Command(sock) {
  this.socket = sock;
  this.callbacks = {};
}

Command.prototype.init = function() {
  this.socket.on('message', function (data) {
    console.log('Server message: '+data);
  });
  var cmdObj = this;
  this.socket.on('osc_response', function(data) {
    var address = data._address;
    var args = data._args;
    
    // Fire any associated callbacks.
    if (cmdObj.callbacks[address] !== undefined) {
      var cbList = cmdObj.callbacks[address];
      _.each(cbList, function(cb) {
        cb.call(this, data);
      });
      // Clear the callback entry.
      cmdObj.callbacks[address] = [];
    }

    // Emit events based on OSC messages.
    if (EVENT_MAP[address] !== undefined) {
      $(document).trigger(EVENT_MAP[address], [args]);
    }
  });
  return this;
}

/**
 * Add a CB to handle an event.
 * e.g. a 'beat' callback will know how to increment the
 * Time slider
 */
Command.prototype.addListener = function(ev, cb) {
  $(document).bind(ev, cb);
}

/**
 * Expects:
 * @param address OSC message path address
 * @param argArr List of arguments to pass to the method.
 *   If this is a non-Array type, it will be assumed to be an
 *    one-argument array
 *   This can be left empty in lieu of arguments.
 *
 * Usage:
 *   sendMessage('/live/play')
 *   sendMessage('/live/tempo', 50)
 *   sendMessage('/live/clip/info', [0, 1])
 *
 * @param {String} path The command path
 * @param {Array} argArr An array of arguments to pass to the command
 * @param {Function} cb Callback method to execute when the
 *   server response returns.
 */
Command.prototype.send = function(path, argArr, cb) {
  if (!argArr instanceof Array) {
    argArr = [argArr];
  }
  var msgObj = {
    address: path,
    args: argArr
  }
  
  if (cb !== undefined) {
    // Add callback to method stack.
    if (this.callbacks[path] === undefined) {
      this.callbacks[path] = [cb];
    } else {
      this.callbacks[path].push(cb);
    }
  }
  
  this.socket.emit('osc_command', msgObj);
}

/**
 * Expect arguments in batch object to be of form:
 * {<path>: [<arg1>, <arg2>]}
 */
Command.prototype.sendBatch = function(batch) {
  for (var i in batch) {
    console.log('===== SENDING BATCH =====');
    console.log('path: ' + batch[i][0]);
    console.log('args: ' + batch[i][1]);
    this.send(batch[i][0], batch[i][1]);
  }
}

Command.prototype.stopClip = function(trk) {
  this.send('/live/stop/track', [trk]);
}

Command.prototype.storeClip = function(trk) {
  this.send('/live/play/clipslot', [trk, CLIP_COUNTER[trk]]);
}

Command.prototype.newClip = function(trk) {
  if (CLIP_COUNTER[trk] === undefined) {
      CLIP_COUNTER[trk] = 0;
  } else {
    CLIP_COUNTER[trk] = CLIP_COUNTER[trk]+1;
  }
  this.send('/live/play/clipslot', [trk, CLIP_COUNTER[trk]]);
}

/**
 * @param trk track id
 * @param mute 1 or 0
 */
Command.prototype.muteTrack = function(trk, mute) {
  this.send('/live/mute', [getInputTrack(trk), mute]);
}

/**
 * Manages playhead objects
 */
function PlayerView(viewportEl) {
  this.viewport = viewportEl;
  this.r = new Raphael('viewport');
  this.trackView = new TrackView(this.r, viewportEl);
}
PlayerView.prototype.render = function() {
  this.trackView.render();
  return this;
}

/**
 * Manages track objects: timeline, marker.
 */
function TrackView(r, viewportEl) {
  this.r = r;
  this.viewport = viewportEl;
  this.timeline = null;
  this.timeMarker = null;

  this.squares = this.r.set();

  return this;
}

/**
 * Draws our track objects
 */
TrackView.prototype.render = function() {
  // Draw 32 squares in an 8x4 grid.
  RECT_SPACING = 25;
  RECT_LENGTH = this.viewport.width() / 10;
  NUM_COLS = 8;
  
  for (var i = 0; i < BEATS_PER_LOOP / NUM_COLS; i++) {
    var y = i * (RECT_LENGTH + RECT_SPACING);
    for (var j = 0; j < NUM_COLS; j++) {
      var x = j * (RECT_LENGTH + RECT_SPACING);
      var sq = this.r.rect(x, y, RECT_LENGTH, RECT_LENGTH);
      sq.attr({
        fill: '90-#121212-#222',
        stroke: 'none'
      })
      // Draw custom lines as borders.
      this.r.path("M"+x+","+y+"L"+(x+RECT_LENGTH)+","+y).attr({stroke: '#FFF', opacity: 0.5});
      this.r.path("M"+(x+RECT_LENGTH)+","+y+"L"+(x+RECT_LENGTH)+","+(y+RECT_LENGTH)).attr({stroke: '#333', opacity: 0.5});
      this.r.path("M"+(x+RECT_LENGTH)+","+(y+RECT_LENGTH)+"L"+x+","+(y+RECT_LENGTH)).attr({stroke: '#333', opacity: 0.5});
      this.r.path("M"+x+","+(y+RECT_LENGTH)+"L"+x+","+y).attr({stroke: '#FFF', opacity: 0.5});
      this.squares.push(sq);      
    }
  }

  return this;
}

/**
 * Push the marker according to the beat.
 * The timeline marker should increment to beat / BEATS_PER_LOOP
 * percent of the timeline width.
 *
 * Rendered as a grid of boxes that change color according to their.
 */
TrackView.prototype.moveMarker = function(beat) {
  // When resetting the marker, clear the other squares.
  if (beat <= 0) {
    _.each(this.squares, function(s) {
      s.attr({
        fill: '90-#121212-#222',
        stroke: 'none'
      })
    })
  }

// var sqColor = (fsm.current == "wait") ? ['90-#272a2d-#171a1d', '90-#2f3032-#1f2022', 0] : ['90-#F7C90F-#E7B900', '90-#E5A800-#D59800', 1];
  var sqColor = (fsm.current == "wait") ? ['#272a2d', '#2f3032', 0] : ['#F7C90F', '#E5A800', 1];

  // Draw a fill on the previous squares.
  for (var i = 0; i <= beat; i++) {
    this.squares[i].animate({
      fill: sqColor[0],
    }, 50, function() {
      this.animate({
        fill: sqColor[1],
        'fill-opacity': sqColor[2]
      }, 200);
    });
  }
};

$(window).ready(function() {
  var FUDGE = 30;
  $('#window').width($(window).width()-FUDGE);
  $('#window').height($(window).height()-FUDGE);
  pv = new PlayerView($('#viewport')).render();
  $('input[name=record-toggle]').live('click', function(e) {
    fsm.recordready();
    $('input[name=record-toggle]').attr('checked', true);
    $('#play').attr('checked', true);
  });
  $('#reset').click(function(e) {
    $('input[name=record-toggle], #play').attr('checked', false);
    cmd.send('/live/stop');
    
    // Stop all store tracks
    insts = _.flatten(_.values(INSTRUMENT_GROUPS));
    for (var i in insts) {
      cmd.stopClip(insts[i]);
      cmd.muteTrack(insts[i], 1);
    }
    
    // Reset to practice with drums
    State.prevTrack = 10;
    State.currentTrack = 11;
    cmd.muteTrack(State.currentTrack, 0);
    
    // Reset UI
    pv.trackView.moveMarker(-1);
    
    // Start back up
    cmd.send('/live/play');
    
    fsm.reset();
  });

});

var socket = io.connect('http://localhost:3000');
cmd = new Command(socket).init();

// When we hear a beat, then move the marker
cmd.addListener('beat', function(e, opts) {
  opts = opts[0];
  pv.trackView.moveMarker(opts.value);
  
  // On beat 0, send loopbegin event to the fsm
  if ((opts.value == 0) && (fsm.current == 'wait')) {
      fsm.loopbegin();
  } else if ((opts.value == 0) && (fsm.current == 'record')) {
      fsm.loopend();
  }
});

/*
 * STATE MACHINE DEFINITION
 * Keep track of app state and logic.
 */
var fsm = StateMachine.create({
  initial: 'practice',
  events: [
    // When the user indicates they want to record a track, they're done practicing.
    { name: 'recordready', from: 'practice', to: 'wait' },
    // When the track has begun.
    { name: 'loopbegin', from: 'wait', to: 'record' },
    // When the track has finished recording.
    { name: 'loopend', from: 'record', to: 'practice' },
    // To reset the machine.
    { name: 'reset', from: ['practice', 'wait', 'record'], to: 'practice' }
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
