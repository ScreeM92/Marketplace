var gulp = require('gulp'),
    minifyCSS = require('gulp-csso'),
    sass = require('gulp-sass'),
    jshint = require('gulp-jshint'),
    sassLint = require('gulp-sass-lint'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    browserSync = require('browser-sync').create();

gulp.task('watch', function() {
    gulp.watch('./src/sass/**/*.scss', ['css']);
});

gulp.task('css', function() {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass())
        .pipe(concat('all.scss'))
        .pipe(minifyCSS())
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest('public/styles'))
        .pipe(browserSync.stream());
});

gulp.task('js:lint', function() {
    return gulp.src('./public/scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('sass:lint', function() {
    return gulp.src('./src/sass/**/*.s+(a|c)ss')
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
});

gulp.task('lint', ['js:lint', 'sass:lint']);