expect = require("chai").expect
sinon = require("sinon")
StubCameraControl = require "../lib/stub_camera_control"
EventEmitter = require("events").EventEmitter

describe "StubCameraControl", ->

  describe "constructor", ->
    it "returns instance of MCC", ->
      mcc = new StubCameraControl()
      expect(mcc).to.be.instanceof(StubCameraControl)
  describe "#init", ->
    it "returns EventEmitter", ->
      ee = new StubCameraControl().init()
      expect(ee).to.be.instanceof(EventEmitter)

  describe "events", ->
    describe "on 'snap'", ->
      subject = new StubCameraControl().init()

      it "emits 'camera_begin_snap'", ->
        spy = sinon.spy()
        subject.on("camera_begin_snap", spy)
        subject.emit "snap"

        expect(spy.called).to.be.true

      it "emits 'camera_snapped' after gphoto sends confirmation", ->
        spy = sinon.spy()
        subject.on("camera_snapped", spy)
        subject.emit "snap"

        expect(spy.called).to.be.true

      xit "emits 'photo_saved' with save metadata", ->
        spy = sinon.spy()
        subject.on("photo_saved", spy)
        subject.emit "snap"
        expect(spy.called).to.be.true
        fname = "mockCameraPhoto.jpg"
        cwdPath = "public/photos/#{fname}"
        webUrl = "/photos/#{fname}"
        expect(spy.calledWith(fname, cwdPath, webUrl)).to.be.true

