var gulp = require('gulp')
var concat = require('gulp-concat')
var clean = require('gulp-clean')
var expect = require('gulp-expect-file')

gulp.task('clean', function() {
  return gulp.src('dist/*', {read: false})
    .pipe(clean())
})

// js
gulp.task('bundle', ['clean'], function(){
    
    var files = [
        'src/ngtools-main.js',
        'src/ngtools-main-ajax.js',
        'src/ngtools-main-interceptors.js',
        'src/ngtools-main-modal.js',
        'src/ngtools-main-routes.js',
        'src/ngtools-main-upload.js',
        'src/ngtools-mask.js',
    ]
    
    return gulp.src(files)
    .pipe(expect(files))
    .pipe(concat('jaacoder-ngtools.js'))
    .pipe(gulp.dest('dist'))
})


// default task
gulp.task('default', [ 'clean', 'bundle' ])
