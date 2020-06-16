'use strict';

module.exports = function(grunt) {
  // Project configuration.
  var path = require('path');

  grunt.config.init({
    pkg: grunt.file.readJSON('package.json'),
    name: 'mtop',
    srcPath: 'src',
    distPath: 'build',

    clean: ['<%= distPath%>/*'],

    copy: {
      package: {
        files: [
          {
            expand: true,
            cwd: './',
            src: ['package.json'],
            dest: '<%= distPath %>'
          }
        ]
      }
    },

    depconcat: {
      main: {
        src: [
          '<%= srcPath%>/promise.polyfill.js',
          '<%= srcPath %>/core.js',
          '<%= srcPath%>/middleware.js',
          // '<%= srcPath%>/crypto/*.js',
        ],
        dest: '<%= distPath %>/mtopee.debug.js'
      }
    },

    uglify: {
      main: {
        files: [
          {
            expand: true,
            cwd: '<%= distPath %>',
            src: ['**/*.debug.js'],
            dest: '<%= distPath %>',
            ext: '.js'
          }
        ]
      }
    }
  });

  // grunt plugins
  grunt.loadNpmTasks('grunt-depconcat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Default grunt
  grunt.registerTask('default', ['clean', 'depconcat', 'uglify', 'copy']);
  grunt.registerTask('dev', ['clean', 'depconcat', 'uglify']);
};
