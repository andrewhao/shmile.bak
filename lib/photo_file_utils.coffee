fs = require("fs")
PhotoFileUtils = (->
  GENERATED_PHOTOS_PATH = "public/photos/generated"
  GENERATED_THUMBS_PATH = "public/photos/generated/thumbs"
  composited_images = (wantUrlPrefix, wantFullSize) ->
    path = (if (wantFullSize) then GENERATED_PHOTOS_PATH else GENERATED_THUMBS_PATH)
    files = fs.readdirSync(path)
    ret = []
    for i of files
      file = files[i]
      if file.match(/jpg$/)
        prefix = (if (wantUrlPrefix) then photo_path_to_url(path) + "/" else "")
        ret.push prefix + file
    ret

  photo_path_to_url = (relpath) ->
    relpath.replace /^public/, ""

  composited_images: composited_images
  photo_path_to_url: photo_path_to_url
)()
module.exports = PhotoFileUtils
