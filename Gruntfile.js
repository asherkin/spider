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
          src: ['js/worker.js'],
          dest: 'build/',
        }, {
          src: ['src/js/ace/ace.js', 'src/js/ace/**/*.js', 'src/js/FileSaver.js', 'src/js/translations/en.js', 'src/js/translations/**/*.js', 'src/js/spider.js'],
          dest: 'build/js/spider.js',
        }],
      },
    },

    cssmin: {
      build: {
        src: ['src/css/bootstrap.css', 'src/css/spider.css'],
        dest: 'build/css/spider.css',
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
          src: ['favicon.ico', 'robots.txt', 'js/spcomp/*', 'js/amxxpc/*'],
          dest: 'build/',
        }],
      },
    },

    appcache: {
      build: {
        options: {
          basePath: 'build/',
        },
        dest: 'build/spider.appcache',
        cache: {
          patterns: ['build/**/*', '!build/index.html', '!build/robots.txt'],
        },
        network: ['http://users.alliedmods.net/~asherkin/attachment.php'],
      },
    },

    compress: {
      build: {
        options: {
          mode: 'gzip',
          level: 6,
        },
        files: [{
          expand: true,
          src: 'build/**/*',
          rename: function(dest, src) {
            return src + '.gz';
          },
        }],
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
        tasks: ['newer:uglify:build', 'newer:cssmin:build', 'newer:htmlmin:build', 'newer:copy:build'],
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-appcache');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['clean', 'uglify', 'cssmin', 'htmlmin', 'copy']);
  grunt.registerTask('default', ['build', 'appcache', 'compress']);
  grunt.registerTask('serve', ['build', 'connect', 'watch']);
}
