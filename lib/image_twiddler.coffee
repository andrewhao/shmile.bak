im = require("imagemagick")
exec = require("child_process").exec
fs = require("fs")
EventEmitter = require("events").EventEmitter

IMAGE_HEIGHT = 800
IMAGE_WIDTH = 1200
IMAGE_PADDING = 50
TOTAL_HEIGHT = IMAGE_HEIGHT * 2 + IMAGE_PADDING * 3
TOTAL_WIDTH = IMAGE_WIDTH * 2 + IMAGE_PADDING * 3
IMAGE_GEOMETRY = "#{IMAGE_WIDTH}x#{IMAGE_HEIGHT}"
GEOMETRIES = [ IMAGE_GEOMETRY + "+" + IMAGE_PADDING + "+" + IMAGE_PADDING,
  IMAGE_GEOMETRY + "+" + (2 * IMAGE_PADDING + IMAGE_WIDTH) + "+" + IMAGE_PADDING,
  IMAGE_GEOMETRY + "+" + IMAGE_PADDING + "+" + (IMAGE_HEIGHT + 2 * IMAGE_PADDING),
  IMAGE_GEOMETRY + "+" + (2 * IMAGE_PADDING + IMAGE_WIDTH) + "+" + (2 * IMAGE_PADDING + IMAGE_HEIGHT) ]

# Composites an array of four images into the final grid-based image asset.
class ImageTwiddler
  defaults:
    overlay_src: "public/images/overlay.png"
    tmp_dir: "public/temp"
    output_dir: "public/photos/generated"
    thumb_dir: "public/photos/generated/thumbs"

  constructor: (@img_src_list=[], @opts=null, @cb) ->
    @opts = @defaults if @opts is null

  init: =>
    @emitter = new EventEmitter()
    @emitter.on "setImages", (img_src_list) =>
      console.log "updating images"
      @img_src_list = img_src_list
    @emitter.on "composite", =>
      console.log "compositing"
      convertArgs = [ "-size", TOTAL_WIDTH + "x" + TOTAL_HEIGHT, "canvas:white" ]
      utcSeconds = (new Date()).valueOf()
      @output_path = "#{@opts.tmp_dir}/out.jpeg"
      @output_file_name = "#{utcSeconds}.jpeg"
      @final_output_path = "#{@opts.output_dir}/gen_#{@output_file_name}"
      @final_output_thumb_path = "#{@opts.thumb_dir}/thumb_#{@output_file_name}"

      i = 0
      while i < @img_src_list.length
        convertArgs.push @img_src_list[i]
        convertArgs.push "-geometry"
        convertArgs.push GEOMETRIES[i]
        convertArgs.push "-composite"
        i++
      convertArgs.push @output_path

      im.convert(
        convertArgs,
        @convertCb
      )

    @emitter

  # ------------------------------------------------------------
  # TODO: Refactor this callback chain into promises.
  # ------------------------------------------------------------

  convertCb: (err, stdout, stderr) =>
    @emitter.emit "laid_out", @output_path
    @composite()

  composite: ->
    compositeArgs = [ "-gravity", "center", @opts.overlay_src, @output_path, "-geometry", TOTAL_WIDTH + "x" + TOTAL_HEIGHT, @final_output_path ]
    exec "composite " + compositeArgs.join(" "), @compositeCb

  compositeCb: (error, stderr, stdout) =>
    @emitter.emit "composited", @final_output_path
    @generateThumb()

  generateThumb: ->
    resizeCompressArgs = [ "-size", "25%", "-quality", "20", @final_output_path, @final_output_thumb_path ]
    im.convert resizeCompressArgs, (e, out, err) =>
      @emitter.emit "generated_thumb", @final_output_thumb_path

module.exports = ImageTwiddler
