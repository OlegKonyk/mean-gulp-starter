const gulp = require('gulp');
const concat = require('gulp-concat');
const ngAnnotate = require('gulp-ng-annotate');
const babel = require('gulp-babel');
const templateCache = require('gulp-angular-templatecache');
const mainBowerFiles = require('main-bower-files');
const exists = require('path-exists').sync;

gulp.task('templete-cache', function() {
  return gulp.src(['!public/build/**', 'public/**/*.html'])
    .pipe(templateCache({
      module: 'app',
      root: 'public'
    }))
    .pipe(gulp.dest('public/build/'));
});

gulp.task('concat-app-js', () => {
  return gulp.src(['public/src/*.js',
                   'public/src/**/*module.js',
                   'public/src/**/*.js'
                   ])
    .pipe(ngAnnotate())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/build/'));
});

gulp.task('concat-app-css', () => {
  return gulp.src('public/assets/css/*.css')
    .pipe(concat('app.css'))
    .pipe(gulp.dest('public/build/'));
});


gulp.task('concat-vendor-js', function() {
  return gulp.src(getMainBowerFiles('js', true), {base: 'bower_components'})
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('public/build/'));
});

gulp.task('concat-vendor-css', function() {
  return gulp.src(getMainBowerFiles('css', true), {base: 'bower_components'})
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest('public/build/'));
});

gulp.task('develop', ['templete-cache',
                      'concat-vendor-css',
                      'concat-app-css',
                      'concat-vendor-js',
                      'concat-app-js']);

gulp.task('default', ['develop']);


function getMainBowerFiles(extention, minified) {
  return mainBowerFiles()
    .filter(function(path, index, arr) {
      return path.indexOf(`.${extention}`) > 0;
    })
    .map(function(path, index, arr) {
      var replaceStr = minified ? `.min.${extention}` : `.${extention}`;
      var newPath = path.replace(/.([^.]+)$/g, replaceStr);
      return exists(newPath) ? newPath : path;
    });
}
