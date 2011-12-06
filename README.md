# shmile is a nodejs-based photobooth.

### Description

With your digital camera, a laptop and a printer, you can have your own DIY low-cost photobooth.

### Preparation

#### Overlay

Create your own custom overlay. Make sure it is a 4x6 crop factor, save it as a 24-bit transparent PNG. See `public/images/overlay.png` for an example.

It is recommended that this overlay image is 2400x1600px large.

When you are done, save your overlay resource into `public/images/overlay.png`.

#### Camera Tips

* Mount the camera on a steady tripod.
* It helps to set your camera on manual focus and on its lowest resolution. This reduces shutter lag time.
* Make sure your flash is charged. If it is not, the camera will wait until the flash charges before firing the shutter, making very awkward, long pauses for your guests to be smiling.

#### Printer

* Make sure your printer is set as the system default.

### Deploying/running

1. Go to project root.
2. `npm install` to install the node package dependencies.
3. Install [`gphoto2`](http://www.gphoto.org/proj/gphoto2/). I'm installing with `brew`. Run `brew install gphoto2`
3. Run `node app.js` to start the server application.
4. Navigate to `localhost:3000` in a A-Grade Web browser (Chrome and Safari latest recommended). This can either be a laptop computer or an iPad, if you'd like.

### Notes

* This was developed for OS X. I cannot help you if you're attempting to run on Windows or Linux distributions.
* Note that the `PTPCamera` daemon boots up whenever you plug in your camera. Running a `killall PTPCamera` will do the trick. Shmile automatically runs this command for you when you boot up.

### Credits

* gphoto/node integration was inspired by https://github.com/underbluewaters/node-photobooth
* shmile is a port of [boink](http://github.com/andrewhao/boink), the original Rails-based photobooth written by Glen Wong and myself.

### License

#### GPLv2

http://www.opensource.org/licenses/GPL-2.0

#### MIT

http://www.opensource.org/licenses/MIT
