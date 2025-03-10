'use strict';

const gulp = require('gulp');
const insert = require('gulp-insert');
const fs= require('fs');

const remap = fs.readFileSync('src/common/src/cordova-remap.js', 'utf-8');

function webpack(config, callback){
  const exec = require('child_process').exec;
  exec(__dirname + '/node_modules/.bin/webpack --config ' + config, (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    callback(error);
  });
}

gulp.task('prepack', function(cb){
  webpack('webpack.prepack.config.js', cb);
});

gulp.task('webpack-cordova', gulp.series('prepack', function(cb){
  webpack('webpack.cordova.config.js', cb);
}));

gulp.task('dist', gulp.series('prepack', function(cb){
  webpack('webpack.library.config.js', cb);
}));

gulp.task('remap', gulp.series('webpack-cordova', function () {
  return gulp.src(['dist/plugin.min.js', 'dist/www.min.js'])
  .pipe(insert.prepend(remap))
  .pipe(gulp.dest('dist'));
}));

gulp.task('plugin', gulp.series('remap', function () {
  return gulp.src(['dist/plugin.min.js'])
  .pipe(gulp.dest('src/browser'));
}));

gulp.task('www', gulp.series('remap', function () {
  return gulp.src(['dist/www.min.js'])
  .pipe(gulp.dest('www'));
}));

gulp.task('default', gulp.series('dist', 'plugin', 'www'));