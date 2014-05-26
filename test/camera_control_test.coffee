chai = require("chai").should()
CameraControl = require "../lib/camera_control"
EventEmitter = require("events").EventEmitter

describe "CameraControl", ->
  # Install stubs for system-level commands.
  beforeEach ->
    console.log "before this test"

  describe "#constructor", ->
    it "should be a CameraControl", ->
      cc = new CameraControl()
      cc.should.be.instanceof(CameraControl)

  describe "#init", ->
    it "returns EventEmitter", ->
      ee = new CameraControl().init()
      ee.should.be.instanceof(EventEmitter)

  describe "events", ->
    describe "on 'snap'", ->
      it "emits 'camera_begin_snap'", ->
        @cc = new CameraControl().init()
        @cc.emit "snap"
