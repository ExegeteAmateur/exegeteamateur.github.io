var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var connect = require('gulp-connect');
var fileinclude = require('gulp-file-include');


gulp.task('watch', function () {
  gulp.watch(['./**/*.html', './**/*.svg'], ['fileinclude']);
  gulp.watch('./js/**', ['js']);
  gulp.watch('./css/**', ['css']);
  gulp.watch('./data/**', ['data']);
  gulp.watch('./img/**', ['img']);
});

gulp.task('reload', function () {
  return gulp.src('./dist/**').pipe(connect.reload());
});


gulp.task('css', function () {
  return gulp.src('./css/**').pipe(gulp.dest('./dist/css'));
});

gulp.task('img', function () {
  return gulp.src('./img/**').pipe(gulp.dest('./dist/img'));
});


gulp.task('js', function () {
  return gulp.src('./js/**').pipe(gulp.dest('./dist/js'));
});



gulp.task('clean', function () {
  return gulp.src('./dist').pipe($.rimraf());
});


gulp.task('index', function () {
  gulp.src('index.html')
    .pipe($.fileInclude({prefix: '@@', basepath: '@file'}))
    .pipe($.useref.assets())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('jquery', function () {
  return gulp.src('./js/vendor/jquery-1.9.1.min.js')
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('build', function (cb) {
  var runSequence = require('run-sequence');

  return runSequence('clean', ['img', 'data', 'jquery'], 'index', cb);
});

gulp.task('data', function () {
  return gulp.src('./data/deputes-vote.json').pipe(gulp.dest('./dist/data'));
});

gulp.task('fileinclude', function () {
  return gulp.src(['index.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./dist'));
});


gulp.task('serve', ['img', 'data', 'js', 'css', 'fileinclude', 'watch'], function () {
    connect.server({
      root: './dist/',
      livereload: true
    });
});
