var gulp       = require('gulp');
var phonegapBuild = require('gulp-phonegap-build');

gulp.task('phonegap-build', function() {
    gulp.src('www/**/*')
        .pipe(phonegapBuild({
          "isRepository": "true",
          "appId": "1943188",
          "user": {
              "token": "xrHpVKkf8fYio6bU45wP"
          }
        }));
});

gulp.task('phonegap-build-debug', function() {
    gulp.src('www/**/*')
        .pipe(phonegapBuild({
          "appId": "1986709",
          "user": {
              "token": "xrHpVKkf8fYio6bU45wP"
          }
        }));
});
