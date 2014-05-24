var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task("test", function() {
  require('coffee-script/register');
  gulp.src("test/**/*.coffee")
  .pipe(mocha({
    reporter: "spec"
  }));
});

gulp.task("default", function() {
  console.log("Do the default thing!");
});
