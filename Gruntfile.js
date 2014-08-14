module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      build: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['js/**/*.js', '!js/spcomp/*'],
          dest: 'build/',
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
          src: ['js/spcomp/*'],
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
