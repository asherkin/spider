module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: {
        src: ['build/'],
      },
    },

    uglify: {
      build: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['js/**/*.js', '!js/ace/**/*', '!js/translations/**/*', '!js/spcomp/**/*', '!js/amxxpc/**/*'],
          dest: 'build/',
        }, {
          src: ['src/js/ace/ace.js', 'src/js/ace/**/*.js'],
          dest: 'build/js/ace.js',
        }, {
          src: ['src/js/translations/en.js', 'src/js/translations/**/*.js'],
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
        basePath: 'build/',
      },
      build: {
        dest: 'build/spider.appcache',
        cache: 'build/**/*',
      },
    },

    connect: {
      build: {
        options: {
          port: 0,
          base: 'build/',
          open: true,
          middleware: function(connect, options, middlewares) {
            middlewares.unshift(connect.compress({
              filter: function(req, res) {
                return true;
              }
            }));
            return middlewares;
          },
        }
      },
    },

    watch: {
      build: {
        files: ['Gruntfile.js', 'src/**/*'],
        tasks: 'default',
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-appcache');
  grunt.loadNpmTasks('grunt-contrib-connect')
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['clean', 'uglify', 'cssmin', 'htmlmin', 'copy']);
  grunt.registerTask('dist', ['default', 'appcache']);
  grunt.registerTask('serve', ['default', 'connect', 'watch']);
}
