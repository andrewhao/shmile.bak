expect = require("chai").expect
rewire = require "rewire"
ImageCompositor = rewire "../lib/image_compositor"
EventEmitter = require("events").EventEmitter
sinon = require "sinon"

fakeExec = (command, cb) ->

fakeImageMagick = {
  convert: (convertArgs, cb) ->
    cb()
}

describe "ImageCompositor", ->
  beforeEach ->
    ImageCompositor.__set__("im", fakeImageMagick)
    ImageCompositor.__set__("exec", fakeExec)
  describe "#constructor", ->
    it "returns instance of ImageCompositor", ->
      cc = new ImageCompositor()
      expect(cc).to.be.instanceof(ImageCompositor)

  describe "#init", ->
    it "returns EventEmitter", ->
      ee = new ImageCompositor().init()
      expect(ee).to.be.instanceof(EventEmitter)

  describe "events", ->
    describe "on 'composite'", ->
      xit "emits 'laid_out' when done with step one", ->
        @it = new ImageCompositor().init()

        spy = sinon.spy()
        @it.on("laid_out", spy)
        @it.emit "composite"

        expect(spy.called).to.be.true
