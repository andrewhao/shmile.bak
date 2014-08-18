expect = require("chai").expect
sinon = require("sinon")
rewire = require("rewire")
fs = require "fs-extra"
StubCameraControl = rewire "../lib/stub_camera_control"
EventEmitter = require("events").EventEmitter

describe "StubCameraControl", ->

  describe "initialization events", ->
    describe "constructor", ->
      it "returns instance of MCC", ->
        mcc = new StubCameraControl()
        expect(mcc).to.be.instanceof(StubCameraControl)

    describe "#init", ->
      it "returns EventEmitter", ->
        ee = new StubCameraControl().init()
        expect(ee).to.be.instanceof(EventEmitter)

  describe "events", =>
    mockFs = null

    beforeEach ->
      mockFs = sinon.mock(fs)
      mockFs.expects("copySync").atLeast(1).returns(true)
      StubCameraControl.__set__("fs", fs)

    afterEach ->
      mockFs.restore()

    describe "on 'snap'", ->
      subject = new StubCameraControl().init()

      it "emits 'camera_begin_snap'", =>
        spy = sinon.spy()
        subject.on("camera_begin_snap", spy)
        subject.emit "snap"

        expect(spy.called).to.be.true

      it "emits 'camera_snapped' after gphoto sends confirmation", ->
        spy = sinon.spy()
        subject.on("camera_snapped", spy)
        subject.emit "snap"

        expect(spy.called).to.be.true

      describe "when simulating gphoto save", ->
        it "moves a fixture file to the public directory", ->
          mockFs.expects("copySync")
            .withArgs("test/fixtures/test_photo.jpg", "public/temp/test_photo.jpg")
            .atLeast(1)
          subject.emit "snap"
          mockFs.verify()

        it "emits 'photo_saved' with save metadata", ->
          spy = sinon.spy()
          subject.on("photo_saved", spy)
          subject.emit "snap"
          expect(spy.called).to.be.true
          fname = "test_photo.jpg"
          cwdPath = "public/temp/#{fname}"
          webUrl = "/temp/#{fname}"
          expect(spy.calledWith(fname, cwdPath, webUrl)).to.be.true

