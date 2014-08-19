EventEmitter = require("events").EventEmitter
fs = require("fs-extra")

###
# Fake camera controller for frontend testing.
###
class StubCameraControl
  emitter: new EventEmitter()
  paths:
    cwd: "public/temp",
    web_image_dir: "/temp"
    fixtures: "test/fixtures",
    photo_file: "test_photo.jpg",

  photoPath: ->
    "#{@paths.cwd}/#{@paths.photo_file}"

  webPhotoPath: ->
    "#{@paths.web_image_dir}/#{@paths.photo_file}"

  photoFixturePath: ->
    "#{@paths.fixtures}/#{@paths.photo_file}"

  init: ->
    @emitter.on("snap", =>
      @emitter.emit "camera_begin_snap"
      # no-op
      @emitter.emit "camera_snapped"

      fs.copySync(
        @photoFixturePath(),
        @photoPath()
      )

      @emitter.emit(
        "photo_saved",
        @paths.photo_file,
        @photoPath(),
        @webPhotoPath()
      )
    )
    @emitter

module.exports = StubCameraControl
