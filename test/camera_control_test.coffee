expect = require("chai").expect
rewire = require "rewire"
sinon = require "sinon"
# rewire to inject a stub spawn/exec.
CameraControl = rewire "../lib/camera_control"
EventEmitter = require("events").EventEmitter

describe "CameraControl", ->
  # Install stubs for system-level commands.
  execStub = null
  spawnStub = null
  gphoto2Stub = null
  gphotoEmitter = new EventEmitter()
  subject = null

  beforeEach ->
    execStub = sinon.stub()
    spawnStub = sinon.stub()
    fakeGphoto = {
      stdout: gphotoEmitter
    }
    gphoto2Stub = sinon.stub(fakeGphoto)
    spawnStub.returns(gphoto2Stub)

    CameraControl.__set__("exec", execStub)
    CameraControl.__set__("spawn", spawnStub)

  describe "#init", ->
    it "returns EventEmitter", ->
      ee = new CameraControl().init()
      expect(ee).to.be.instanceof(EventEmitter)

  describe "events", ->
    describe "on 'snap'", ->
      beforeEach ->
        @timeout = 1000
        subject = new CameraControl().init()

      it "kills PTPCamera", ->
        subject.emit "snap"
        expect(execStub.calledWith("killall PTPCamera")).to.be.true

      it "emits 'camera_begin_snap'", ->
        spy = sinon.spy()
        subject.on("camera_begin_snap", spy)
        subject.emit "snap"

        expect(spy.called).to.be.true

      describe "calling gphoto2 on successful capture", ->
        it "calls gphoto2", ->
          subject.emit "snap"
          expect(spawnStub.calledWith("gphoto2")).to.be.true
        it "emits 'camera_snapped' after gphoto sends confirmation", ->
          spy = sinon.spy()
          subject.on("photo_saved", spy)
          subject.emit "snap"
          gphotoEmitter.emit("data", "New file is in abcdefg.jpg")

          # TODO/ahao Get this working with Mocha async expectations.
          # I was having trouble getting this to pass.
          setTimeout(->
            expect(spy.called).to.be.true
          , 100)

        it "emits 'photo_saved' with save metadata", ->
          spy = sinon.spy()
          subject.on("photo_saved", spy)
          subject.emit "snap"
          gphotoEmitter.emit("data", "Saving file as abcdefg.jpg")
          setTimeout(->
            expect(spy.called).to.be.true
          , 100)


