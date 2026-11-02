const { src, dest, series, parallel, watch } = require('gulp');
const fs = require('fs');
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

// Cache-busting key: local time to the second, e.g. 2026-11-02T16:57:04
function cacheKeyNow() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' +
        p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

// Stamp a fresh cache key into setup.js (used for the CSV fetches) and into the
// ?r= query strings in index.html. Runs before the app bundle is built so the key
// is baked into nuclides.min.js too.
function stampCacheKey(done) {
    const key = cacheKeyNow();
    const stamp = (file, pattern, replacement) => {
        const before = fs.readFileSync(file, 'utf8');
        const after = before.replace(pattern, replacement);
        if (after === before && !pattern.test(before)) {
            throw new Error('Cache key pattern not found in ' + file);
        }
        fs.writeFileSync(file, after);
    };
    stamp('./assets/js/app/setup.js', /var cacheKey = "[^"]*";/, 'var cacheKey = "' + key + '";');
    stamp('./index.html', /(\.(?:css|js)\?r=)[^"']*/g, '$1' + key);
    console.log('Cache key: ' + key);
    done();
}

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

const js = series(stampCacheKey, parallel(appJs, vendorJs));

exports.app_js = appJs;
exports.vendor_js = vendorJs;
exports.stamp = stampCacheKey;
exports.js = js;
exports.watch = watchApp;
exports.default = series(js, watchApp);
