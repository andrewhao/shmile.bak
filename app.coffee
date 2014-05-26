express = require "express"
jade = require "jade"
http = require "http"
sys = require "sys"
fs = require "fs"
yaml = require "yaml"
PhotoFileUtils = require("./lib/photo_file_utils")
CameraControl = require("./lib/camera_control")
ImageTwiddler = require("./lib/image_twiddler")

exp = express()
web = http.createServer(exp)

exec = require("child_process").exec

exp.configure ->
  exp.set "views", __dirname + "/views"
  exp.set "view engine", "jade"
  exp.use express.json()
  exp.use express.methodOverride()
  exp.use exp.router
  exp.use express.static(__dirname + "/public")

exp.get "/", (req, res) ->
  res.render "index",
    title: "shmile"
    extra_js: [ "camera_utils", "photo_view", "shmile" ]
    extra_css: []

exp.get "/gallery", (req, res) ->
  res.render "gallery",
    title: "gallery!"
    extra_js: [ "photoswipe/klass.min", "code.photoswipe.jquery-3.0.4.min", "shmile_gallery" ]
    extra_css: [ "photoswipe/photoswipe" ]
    image_paths: PhotoFileUtils.composited_images(true)

State = image_src_list: []
io = require("socket.io").listen(web)
web.listen 3000
io.sockets.on "connection", (websocket) ->
  sys.puts "Web browser connected"
  camera = new CameraControl().init()
  camera.on "camera_begin_snap", ->
    websocket.emit "camera_begin_snap"

  camera.on "camera_snapped", ->
    websocket.emit "camera_snapped"

  camera.on "photo_saved", (filename, path, web_url) ->
    State.image_src_list.push path
    websocket.emit "photo_saved",
      filename: filename
      path: path
      web_url: web_url

  websocket.on "snap", (isFirst) ->
    camera.emit "snap", isFirst

  websocket.on "all_images", ->

  websocket.on "composite", ->
    compositer = new ImageTwiddler(State.image_src_list).init()
    compositer.emit "composite"
    compositer.on "composited", (output_file_path) ->
      console.log "Finished compositing image. Output image is at ", output_file_path
      State.image_src_list = []
      if true #FIXMEEEEE
        console.log "Printing image at ", output_file_path
        exec "lpr " + output_file_path
      websocket.broadcast.emit "composited_image", PhotoFileUtils.photo_path_to_url(output_file_path)

    compositer.on "generated_thumb", (thumb_path) ->
      websocket.broadcast.emit "generated_thumb", PhotoFileUtils.photo_path_to_url(thumb_path)
