module.exports = grunt => {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: {
        src: [
            'build/'
        ],
      },
    },

    uglify: {
      build: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: [
            'js/worker.js',
            'js/run-worker.js'
          ],
          dest: 'build/',
        }, {
          src: [
            'src/js/natives/**/*.js'
          ],
          dest: 'build/js/natives.js',
        }, {
          src: [
            'src/js/ace/ace.js',
            'src/js/ace/**/*.js',
            'src/js/FileSaver.js',
            'src/js/translations/en.js',
            'src/js/translations/**/*.js',
            'src/js/spider.js'
          ],
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
          src: [
            'index.html'
          ],
          dest: 'build/',
        }],
      },
    },

    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: [
              'favicon.ico',
              'robots.txt',
              'js/spcomp/*',
              'js/amxxpc/*',
              'js/sourcepawn.js'
            ],
            dest: 'build/',
          },
          {
            expand: true,
            src: ['electron.js'],
            dest: 'build/'
          },
          {
            expand: true,
            src: ['package.json'],
            dest: 'build/'
          }
        ],
      },
    },

    rename: {
      main: {
        files: [{
          src: ['build/electron.js'],
          dest: 'build/index.js'
        }]
      }
    },

    appcache: {
      build: {
        options: {
          basePath: 'build/',
        },
        dest: 'build/spider.appcache',
        cache: {
          patterns: [
            'build/**/*',
            '!build/index.html',
            '!build/robots.txt'
          ],
        },
        network: ['https://users.alliedmods.net/~asherkin/attachment.php'],
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
          rename: (dest, src) => src + '.gz',
        }],
      },
    },

    connect: {
      build: {
        options: {
          port: 0,
          base: 'build/',
          open: true,
          middleware: (connect, options, middlewares) => {
            middlewares.unshift(connect.compress({
              filter: () => true
            }));
            return middlewares;
          },
        }
      },
    },

    watch: {
      build: {
        files: [
          'gruntfile.js',
          'src/**/*'
        ],
        tasks: ['newer:uglify:build', 'newer:cssmin:build', 'newer:htmlmin:build', 'newer:copy:build'],
      },
    },
  });

  grunt.registerTask('build', ['clean', 'uglify', 'cssmin', 'htmlmin', 'copy', 'rename']);
  grunt.registerTask('default', ['build', 'appcache', 'compress']);
  grunt.registerTask('serve', ['build', 'connect', 'watch']);
};
