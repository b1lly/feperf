module.exports = function( grunt ) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      compile: {
        options: {
          mainConfigFile: "./src/js/require.config.js",
          name: "fep",
          out: "dist/feperf.js",
          optimize: "none",
          wrap: {
            startFile: "./src/js/intro.js",
            endFile: "./src/js/outro.js"
          }
        }
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
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Default grunt
  grunt.registerTask('default', ['requirejs', 'uglify', 'copy']);
};
