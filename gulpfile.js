var gulp = require('gulp');
var mocha = require('gulp-spawn-mocha');

gulp.task("test", function() {
  return test().on('error', function(e) {
    throw e;
  });
});

gulp.task("default", function() {
  gulp.start('watch');
});

gulp.task("watch", function() {
  gulp.watch("{lib,test}/*", test);
});

var test = function() {
  return gulp.src(["test/**/*.coffee"]).pipe(mocha({
    bin: "node_modules/.bin/mocha",
    reporter: "spec",
    compilers: "coffee:coffee-script/register"
  })).on("error", console.warn.bind(console));
};

