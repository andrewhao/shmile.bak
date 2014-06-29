EventEmitter = require("events").EventEmitter
fs = require("fs")

###
# Fake camera controller for frontend testing.
###
class MockCameraControl
  emitter: new EventEmitter()
  paths:
    cwd: "public/photos",
    web: "/photos"
  init: ->
    @emitter.on("snap", =>
      @emitter.emit "camera_begin_snap"
      @emitter.emit "camera_snapped"

      # copy to cwd URL
      # copy to web URL
      @emitter.emit "photo_saved"
    )
    @emitter

module.exports = MockCameraControl
