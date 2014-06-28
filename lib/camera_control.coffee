EventEmitter = require("events").EventEmitter
spawn = require("child_process").spawn
exec = require("child_process").exec

###
# Interface to gphoto2 via the command line.
#
# It's highly fragile and prone to failure, so if anyone wants
# to take a crack at redoing the node-gphoto2 bindings, be my
# guest...
###
class CameraControl
  saving_regex: /Saving file as ([^.jpg]+)/g
  captured_success_regex: /New file is in/g

  constructor: (
    @filename="%m-%y-%d_%H:%M:%S.jpg",
    @cwd="public/photos",
    @web_root_path="/photos") ->

  init: ->
    exec "killall PTPCamera"
    emitter = new EventEmitter()
    emitter.on "snap", (onCaptureSuccess, onSaveSuccess) =>
      emitter.emit "camera_begin_snap"
      capture = spawn("gphoto2", [ "--capture-image-and-download",
                                   "--force-overwrite",
                                   "--filename=" + @filename ],
        cwd: @cwd
      )
      capture.stdout.on "data", (data) =>
        if @captured_success_regex.exec(data.toString())
          emitter.emit "camera_snapped"
          onCaptureSuccess() if onCaptureSuccess?

        saving = @saving_regex.exec(data.toString())
        if saving
          fname = saving[1] + ".jpg"
          emitter.emit(
            "photo_saved",
            fname,
            @cwd + "/" + fname,
            @web_root_path + "/" + fname
          )
          onSaveSuccess() if onSaveSuccess?
    emitter

module.exports = CameraControl
