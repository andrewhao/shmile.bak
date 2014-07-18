EventEmitter = require("events").EventEmitter
fs = require("fs")

###
# Fake camera controller for frontend testing.
###
class StubCameraControl
  emitter: new EventEmitter()
  paths:
    cwd: "public/tmp",
    web: "/photos"
    fixtures: "test/fixtures",
    photo_file: "test_photo.jpg",
    preview_file: "test_photo_preview.jpg"

  init: ->
    @emitter.on("snap", =>
      @emitter.emit "camera_begin_snap"
      @emitter.emit "camera_snapped"

      fs.renameSync(
        "#{@paths.fixtures}/#{@paths.photo_file}",
        "#{@paths.cwd}/#{@paths.photo_file}"
      )

      # copy to web preview URL
      fs.renameSync(
        "#{@paths.fixtures}/#{@paths.preview_file}",
        "#{@paths.cwd}/#{@paths.preview_file}"
      )

      @emitter.emit "photo_saved"
    )
    @emitter

module.exports = StubCameraControl
