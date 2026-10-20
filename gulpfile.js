const { src, dest, series, parallel, watch } = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');

// App-specific JS files to be watched and minified
const appJsFiles = [
    './assets/js/app/*.js',
    './assets/js/questions/what_is_nuclides_org.js',
    './assets/js/questions/404.js'
];

// Vendor libraries come from node_modules (d3 ships pre-minified)
const vendorJsFiles = ['./node_modules/d3/d3.min.js'];

// Minify all app-specific JS into a single app file
function appJs() {
    return src(appJsFiles)
        .pipe(terser())
        .pipe(concat('nuclides.min.js'))
        .pipe(dest('.'));
}

// Bundle vendor JS into a single vendor file
function vendorJs() {
    return src(vendorJsFiles)
        .pipe(concat('vendor.min.js'))
        .pipe(dest('.'));
}

// Rebuild the app file whenever its sources change
function watchApp() {
    watch(appJsFiles, appJs);
}

const js = parallel(appJs, vendorJs);

exports.app_js = appJs;
exports.vendor_js = vendorJs;
exports.js = js;
exports.watch = watchApp;
exports.default = series(js, watchApp);
