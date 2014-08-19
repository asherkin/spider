module.exports = function(grunt) {
  require('time-grunt')(grunt);
  require('jit-grunt')(grunt);

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
      build: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          minifyJS: true,
        },
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

    concurrent: {
      build: ['uglify', 'cssmin', 'htmlmin', 'copy'],
    },

    appcache: {
      build: {
        options: {
          basePath: 'build/',
        },
        dest: 'build/spider.appcache',
        cache: {
          patterns: ['build/**/*', '!build/robots.txt'],
        },
        network: ['http://users.alliedmods.net/~asherkin/attachment.php'],
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
        tasks: 'build',
      },
    },
  });

  grunt.registerTask('build', ['clean', 'concurrent']);
  grunt.registerTask('default', ['build', 'appcache']);
  grunt.registerTask('serve', ['build', 'connect', 'watch']);
}
