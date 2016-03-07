var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var watch = require('gulp-watch');

// App-specific JS files to be watched and uglified
var app_js_files = ['./assets/js/app/*.js',
                    './assets/js/questions/what_is_nuclides_org.js',
                    './assets/js/questions/404.js'];

// Uglify all the javascripts
gulp.task('js', function() {
    gulp.start('app_js', 'vendor_js');
});

// Uglify all app-specific JS libraries into a single app file
gulp.task('app_js', function() {
    gulp.src(app_js_files)
        .pipe(uglify())
        .pipe(concat("nuclides.min.js"))
        .pipe(gulp.dest('.'))
        .pipe( notify({ message: "Generated nuclides.min.js"}) );
});

// Uglify vendor js files into a single vendor file
gulp.task('vendor_js', function() {
    gulp.src('./assets/js/vendor/*.js')
        .pipe(uglify())
        .pipe(concat("vendor.min.js"))
        .pipe(gulp.dest('.'))
        .pipe( notify({ message: "Generated vendor.min.js"}) );
});

// Watch all the things
gulp.task('watch', function() {
    gulp.watch(app_js_files, ['app_js']);
});

gulp.task('default', ['js', 'watch']);