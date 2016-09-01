import gulp from 'gulp'
import eslint from 'gulp-eslint'
import babel from 'gulp-babel'
import gulpIf from 'gulp-if'

const inPaths = {
    js: './src/**'
}
const outPaths = {
    eslint: './src',
    js: './dist'
}

function isFixed(file) {
    return file.eslint != null && file.eslint.fixed;
}

gulp.task('default', ['eslint', 'js'])
gulp.task('watch', ['default', 'watcher'])

gulp.task('watcher', () => {
    gulp.watch(inPaths.js, ['eslint', 'js'])
})

/* useEslintrc: true, to use .eslintrc setting.
 * fix: true, to autofix js
 */
gulp.task('eslint', () => {
    gulp.src(inPaths.js)
        .pipe(eslint({useEslintrc: true, fix: true}))
        .pipe(eslint.format())
        .pipe(gulpIf(isFixed, gulp.dest(outPaths.eslint)))
})

/* uglify mangle: false, to skip mangle */
gulp.task('js', () => {
    gulp.src(inPaths.js)
        .pipe(babel({presets: ['es2015']}))
        .pipe(gulp.dest(outPaths.js))
})
