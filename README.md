# mmtss is a loop station built for live performances.

### Description
Let's make music together! This project simplifies a traditional loop tracking station and is designed for interactive collaborative music performances.

The idea: Everybody adds or modifies one "part" of a 32-bar loop. The user gets to play an instrument over the existing mix and record the 32-bar phrase when she or he is ready. Once the person is finished, the project selects another instrument at random for the next viewer to record.

It's an Ableton Live controller serving a Webkit view, backed by node.js on the backend and
socket.io + RaphaelJS on the front. Communication is done through a LiveOSC Live plugin via sockets.

### Screenshots

![Practice mode](http://farm7.static.flickr.com/6169/6188366577_7ba48d38d1_z.jpg)

mmtss in practice/playback mode. Here the user is able to practice/mess around with the current instrument to prepare to record the next track.

![Cued mode](http://farm7.static.flickr.com/6121/6188886114_9d6d519972_z.jpg)

Pressing "record" puts the user in a wait state. They are prompted to begin recording when all the black boxes count down and disappear.

![Record mode](http://farm7.static.flickr.com/6177/6188367151_ca5b782735_z.jpg)

mmtss in record mode.

### Installation

* Make sure you have npm installed: http://www.npmjs.org
* Copy `lib/LiveOSC` into `/Applications/Live x.y.z OS X/Live.app/Contents/App-Resources/MIDI\ Remote\ Scripts/`
folder
* Set it as your MIDI remote in the Ableton Live Preferences pane, in the "MIDI Remote" tab.

### Running it
* Open `Mmtss_0.als` as a sample Live project.
* Install all project dependencies with `npm install` from the project root.
* Start the Node server with `node app.js` from the root directory.
* Open a Web browser and visit `localhost:3000`

### Modifying the sample project
You can modify this project to suit your own needs. Note that there are two sets of tracks; instrument (MIDI input) tracks and loop tracks that actually store clips.

For `n` tracks, you can add or remove your own instruments. Just make sure that instrument at track `x` corresponds to track `x` + `n`.

### Credits

* Design and architectural inspiration taken from [vtouch](http://github.com/vnoise/vtouch), a HTML5/Node/Canvas Ableton controller.
* Original LiveOSC source is found at: http://monome.q3f.org/browser/trunk/LiveOSC. We use a different fork of the project at: http://github.com/vnoise/vtouch.
* Super sweet CSS3 rocker widgets courtesy of [Simurai](http://www.simurai.com): [UmbrUI](http://lab.simurai.com/css/umbrui/)

### License
[MIT](http://www.opensource.org/licenses/mit-license.php) and [GPLv3](http://www.gnu.org/copyleft/gpl.html) licensed. Go for it.

### Links
* Andrew Hao: http://www.g9labs.com
* David Luoh: http://www.inkproj.com
