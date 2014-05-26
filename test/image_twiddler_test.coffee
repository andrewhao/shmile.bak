chai = require("chai").should()
ImageTwiddler = require "../lib/image_twiddler"
EventEmitter = require("events").EventEmitter

describe "ImageTwiddler", ->
  describe "#constructor", ->
    it "should be a ImageTwiddler", ->
      cc = new ImageTwiddler()
      cc.should.be.instanceof(ImageTwiddler)

  describe "#init", ->
    it "returns EventEmitter", ->
      ee = new ImageTwiddler().init()
      ee.should.be.instanceof(EventEmitter)

  describe "events", ->
    describe "on 'composite'", ->
      it "emits 'laid_out' when done", ->
        @it = new ImageTwiddler().init([])
        @it.emit "composite"
