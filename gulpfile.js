var gulp = require('gulp');
var mocha = require('gulp-spawn-mocha');

gulp.task("test", function() {
  console.log("Starting test.");
  return test().on('error', function(e) {
    throw e;
  });
});

gulp.task("default", function() {
  console.log("Do the default thing!");
});

var test = function() {
  console.log("entering test()");
  return gulp.src(["test/**/*.coffee"]).pipe(mocha({
    bin: "node_modules/.bin/mocha",
    reporter: "spec",
    compilers: "coffee:coffee-script/register"
  })).on("error", console.warn.bind(console));
};

