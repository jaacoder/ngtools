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
        'src/ngtools-helper.js',
        'src/ngtools-ajax.js',
        'src/ngtools-directives.js',
        'src/ngtools-interceptors.js',
        'src/ngtools-filters.js',
        'src/ngtools-routes.js',
        'src/ngtools-modal.js',
    ]
    
    return gulp.src(files)
    .pipe(expect(files))
    .pipe(concat('jaacoder-ngtools.js'))
    .pipe(gulp.dest('dist'))
})


// default task
gulp.task('default', [ 'clean', 'bundle' ])
