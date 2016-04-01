var gulp = require('gulp');

gulp.task('build', ['html', 'config', 'browserify', 'styles', 'images']);
