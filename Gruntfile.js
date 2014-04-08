module.exports = function( grunt ) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist:{
        src: [
          'src/js/base.js',
          'src/js/debug.js',
          'src/js/debug/profiler.js',
          'src/js/debug/toolbar.js',
        ],
        dest: 'dist/feperf.js'
      }
    },

    uglify: {
      build: {
        src: 'dist/feperf.js',
        dest: 'dist/feperf.min.js'
      },
      options: {
        compress: {
          hoist_funs: false,
          join_vars: false,
          loops: false,
          unused: false
        },
        beautify: {
          ascii_only: true
        }
      }
    },

    copy: {
      main: {
        files: [
          {
            expand: true,
            src: ['src/stylesheets/*'],
            dest: 'dist/',
            flatten: true
          },
          {
            expand: true,
            src: ['src/*.html'],
            dest: 'dist/',
            flatten: true
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default grunt
  grunt.registerTask('default', ['concat', 'uglify', 'copy']);
};
