var changed    = require('gulp-changed');
var gulp       = require('gulp');

gulp.task('config', function() {

    var dest = './www';

    // This one does nothing except moving the config.xml file from src to www
	return gulp.src('./src/config.xml')
		.pipe(changed(dest))
		.pipe(gulp.dest(dest));
});
