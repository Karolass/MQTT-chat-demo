import gulp from 'gulp'
import ejs from 'gulp-ejs'
import sass from 'gulp-sass'

/* for javascript */
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import gutil from 'gulp-util'
import uglify from 'gulp-uglify'
// import sourcemaps from 'gulp-sourcemaps'
import babelify from 'babelify'
import gulpIf from 'gulp-if'
import eslint from 'gulp-eslint'

const inPaths = {
    html: './src/ejs/*.ejs',
    htmlForWatch: './src/ejs/**',
    sass: './src/scss/*.scss',
    eslint: './src/js/*.js',
    js: './src/js/index.js'
}
const outPaths = {
    html: './dist',
    css: './dist/css',
    eslint: './src/js',
    js: './dist/js'
}

function isFixed(file) {
    return file.eslint != null && file.eslint.fixed;
}

gulp.task('default', ['html', 'sass', 'eslint', 'js'])
gulp.task('watch', ['default', 'watcher'])

gulp.task('watcher', () => {
    gulp.watch(inPaths.htmlForWatch, ['html'])
    gulp.watch(inPaths.sass, ['sass'])
    gulp.watch(inPaths.eslint, ['eslint', 'js'])
})

gulp.task('html', () => {
    gulp.src(inPaths.html)
        .pipe(ejs({}, {ext: '.html'}))
        .pipe(gulp.dest(outPaths.html))
})

/* outputStyle: nested, expanded, compact, compressed */
gulp.task('sass', () => {
    gulp.src(inPaths.sass)
        .pipe(sass({outputStyle: 'expanded', indentWidth: 4}))
        .pipe(gulp.dest(outPaths.css))
})

/* useEslintrc: true, to use .eslintrc setting.
 * fix: true, to autofix js
 */
gulp.task('eslint', () => {
    gulp.src(inPaths.eslint)
        .pipe(eslint({useEslintrc: true, fix: true}))
        .pipe(eslint.format())
        .pipe(gulpIf(isFixed, gulp.dest(outPaths.eslint)))
})

/* uglify mangle: false, to skip mangle */
gulp.task('js', () => {
    const b = browserify({
        entries: inPaths.js,
        debug: true,
        transform: [babelify],
        standalone: 'mqttDemo',
    })

    b.bundle()
        .pipe(source('mqttDemo.js'))
        .pipe(buffer())
        .pipe(uglify({mangle: false})).on('error', gutil.log)
        .pipe(gulp.dest(outPaths.js));
})
