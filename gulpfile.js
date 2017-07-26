var gulp = require('gulp')
var async = require('async')
var run = require('run-sequence')
var uglify = require('gulp-uglify')
var concat = require('gulp-concat')
var plumber = require('gulp-plumber')
var gutil = require('gulp-util')
// var sass = require('gulp-sass')
var htmlmin = require('gulp-htmlmin')
var sourcemaps = require('gulp-sourcemaps')
var cleanCSS = require('gulp-clean-css')
var nodemon = require('gulp-nodemon')

// error function for plumber
var onError = function (err) {
  gutil.beep()
  console.log(err)
  this.emit('end')
}

var config = {
  sass: {
    src: 'src/styles/main.scss',
    options: {
      noCache: true,
      compass: false,
      bundleExec: true,
      sourcemap: true,
      outputStyle: 'compressed',
      includePaths: ['node_modules/govuk-elements-sass/public/sass', 'node_modules/govuk_frontend_toolkit/stylesheets']
    }
  }
}

gulp.task('assets', function () {
  gulp.src(['src/assets/**/*']).pipe(gulp.dest('dist/assets'))
})

// gulp.task('sass', function () {
//   return gulp.src(config.sass.src)
//     .pipe(plumber({ errorHandler: onError }))
//     .pipe(sass(config.sass.options)) // Using gulp-sass
//     .pipe(gulp.dest('dist/styles'))
// })

gulp.task('minify-css', () => {
  return gulp.src('src/styles/**/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist'))
})

gulp.task('minifyHtml', function () {
  return gulp.src('src/*.html')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'))
})

//
gulp.task('uglify', function () {
  return gulp.src([
    'src/js/**/*.js'
  ])
  .pipe(sourcemaps.init())
  .pipe(plumber())
  .pipe(uglify())
  .pipe(concat('main.js'))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('dist'))
})

gulp.task('vendor', function () {
  return gulp.src([
    'node_modules/underscore/underscore-min.js',
    'node_modules/moment/min/moment.min.js'
    // 'node_modules/async/dist/async.min.js'
  ])
  .pipe(plumber())
  .pipe(concat('vendor.js'))
  .pipe(gulp.dest('dist'))
})

gulp.task('startwatch', function () {
  // nodemon({
  //   script: 'server.js',
  //   ext: 'js',
  //   env: { 'NODE_ENV': 'development' },
  //   cwd: __dirname,
  //   ignore: ['node_modules/**'],
  //   watch: ['server.js', 'config.js', 'src/node/*']
  // })
  gulp.watch('src/*.html', ['minifyHtml'])
  // gulp.watch('src/app/modules/**/*.html', ['templateAndUglify'])
  gulp.watch(['src/js/**/*.js'], ['uglify'])
  gulp.watch('src/styles/*.css', ['minify-css'])
})

gulp.task('watch', ['startwatch', 'vendor'])
gulp.task('default', ['assets', 'minify-css', 'minifyHtml', 'vendor'])
gulp.task('inline', ['default', 'inlineHTML'])
