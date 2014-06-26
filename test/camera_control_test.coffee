expect = require("chai").expect
rewire = require "rewire"
# rewire to inject a stub spawn/exec.
CameraControl = rewire "../lib/camera_control"
EventEmitter = require("events").EventEmitter

describe "CameraControl", ->
  # Install stubs for system-level commands.
  beforeEach ->
    CameraControl.__set__("exec", -> {})
    CameraControl.__set__("spawn", -> {
      stdout: {on: -> {}}
    })

  describe "#constructor", ->
    it "should be a CameraControl", ->
      cc = new CameraControl()
      expect(cc).to.be.instanceof(CameraControl)

  describe "#init", ->
    it "returns EventEmitter", ->
      ee = new CameraControl().init()
      expect(ee).to.be.instanceof(EventEmitter)

  describe "events", ->
    describe "on 'snap'", ->
      it "emits 'camera_begin_snap'", ->
        @cc = new CameraControl().init()
        @cc.emit "snap"
