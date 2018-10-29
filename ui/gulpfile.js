/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const gulp = require('gulp');
const gutil = require('gulp-util');
const sequence = require("gulp-sequence");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./webpack.config.js");
const webpackProductionConfig = require("./webpack.production.config.js");
const map = require('map-stream');
const touch = require('touch');
const _ = require('underscore');

// Load plugins
const $ = require('gulp-load-plugins')();

// CSS
gulp.task('css', () =>
  gulp.src(['src/styles/*.sass', 'src/styles/*.scss'])
    .pipe($.compass({
      css: 'public/',
      sass: 'src/styles',
      image: 'src/styles/images',
      style: 'nested',
      comments: false,
      bundle_exec: true,
      time: true,
      require: [
        'susy',
        'modular-scale',
        'normalize-scss',
        'sass-css-importer',
        'sassy-buttons',
        'breakpoint']
    }))
    .on('error', err => gutil.log(err))
    .pipe($.size())
    .pipe(gulp.dest('public/'))
    .pipe(map(function(a, cb) {
      if (devServer.invalidate != null) { devServer.invalidate(); }
      return cb();
    }))
);

gulp.task('copy-assets', () =>
    gulp.src('assets/**')
      .pipe(gulp.dest('public'))
      .pipe($.size())
);

// Some quick notes on using fontcustom.
// First you need to install some additional software
// as detailed at https://github.com/FontCustom/fontcustom#installation
// On MacOSX, this comment was the only way I got things to work: https://github.com/FontCustom/fontcustom/issues/209#issuecomment-48014939
// Otherwise I got a Python import error.
//
// Then once things are working, things here are setup so that the generated font
// is base64 encoded and included in the css file. For this to work, you
// need to edit the generated scss file at src/styles/_fontcustom.scss to remove
// its font-face imports.
// Font compilation
gulp.task('font', $.shell.task([
  'fontcustom compile'
]));

gulp.task('font-base-64', () =>
  gulp.src('assets/fonts/*.ttf')
    .pipe($.rename('fontcustom.ttf'))
    .pipe($.cssfont64())
    .pipe($.rename('_fontcustom_embedded.scss'))
    .pipe(gulp.dest('src/styles/'))
);

gulp.task("webpack:build", callback =>
  // Run webpack.
  webpack(webpackProductionConfig, function(err, stats) {
    if (err) { throw new gutil.PluginError("webpack:build", err); }
    gutil.log("[webpack:build]", stats.toString({colors: true}));
    callback();
  })
);


// Create a single instance of the compiler to allow caching.
const devCompiler = webpack(webpackConfig);
gulp.task("webpack:build-dev", function(callback) {

  // Run webpack.
  devCompiler.run(function(err, stats) {
    if (err) { throw new gutil.PluginError("webpack:build-dev", err); }
    gutil.log("[webpack:build-dev]", stats.toString({colors: true}));
    callback();
  });

});

var devServer = {};
gulp.task("webpack-dev-server", function(callback) {
  // Ensure there's a `./public/main.css` file that can be required.
  touch.sync('./public/main.css', {time: new Date(0)});

  // Start a webpack-dev-server.
  devServer = new WebpackDevServer(webpack(webpackConfig), {
    contentBase: './public/',
    hot: true,
    watchDelay: 100,
    noInfo: true
  }
  );
  devServer.listen(8080, "0.0.0.0", function(err) {
    if (err) { throw new gutil.PluginError("webpack-dev-server", err); }
    gutil.log("[webpack-dev-server]", "http://localhost:8080");
    return callback();
  });

});

gulp.task('default', () => gulp.start('build'));

gulp.task('build', sequence(['css', 'copy-assets'], ['webpack:build']));

gulp.task('watch', ['css', 'copy-assets', 'webpack-dev-server'], function() {
  gulp.watch(['src/styles/**'], ['css']);
  return gulp.watch(['assets/**'], ['copy-assets']);
});
