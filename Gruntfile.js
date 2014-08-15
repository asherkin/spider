module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      build: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['js/**/*.js', '!js/translations/**/*', '!js/spcomp/**/*', '!js/amxxpc/**/*'],
          dest: 'build/',
        }, {
          src: ['src/js/translations/en.js', 'src/js/translations/**/*'],
          dest: 'build/js/translations.js',
        }],
      },
    },

    cssmin: {
      build: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['css/**/*.css'],
          dest: 'build/',
        }],
      },
    },

    htmlmin: {
      options: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
      },
      build: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['index.html'],
          dest: 'build/',
        }],
      },
    },

    copy: {
      build: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['favicon.ico', 'robots.txt', 'js/spcomp/**/*', 'js/amxxpc/**/*'],
          dest: 'build/',
        }],
      },
    },

    appcache: {
      options: {
        basePath: 'build',
      },
      build: {
        dest: 'build/spider.appcache',
        cache: 'build/**/*',
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-appcache');

  grunt.registerTask('default', ['uglify', 'cssmin', 'htmlmin', 'copy', 'appcache']);
}
