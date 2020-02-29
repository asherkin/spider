var Module;

(function() {
  'use strict';

  Module = {
    noInitialRun: true,
    print: print,
    printErr: print,
    arguments: ['-iextra', '-iinclude'],
  };

  // Workaround for Safari.
  if (!self.console) {
    self.console = {log: function() {}};
  }

  onmessage = function(event) {
    if (typeof event.data === 'string') {
      Module['compiler'] = event.data;
      Module['arguments'].push('plugin.' + (event.data === 'amxxpc' ? 'sma' : 'sp'));

      // These are still used by amxxpc
      Module['memoryInitializerPrefixURL'] = event.data + '/';
      Module['filePackagePrefixURL'] = event.data + '/';

      // This is used by spcomp
      Module['locateFile'] = function(path, prefix) {
        return event.data + '/' + path;
      }

      importScripts(event.data + '/' + event.data + '.js');

      return;
    }

    for (var i = 0; i < event.data.length; ++i) {
      /*
      var view = new Uint16Array(event.data[i].content);

      var source = [];
      for (var j = 0; j < view.length; ++j) {
        source.push(String.fromCharCode(view[j]));
      }
      source = source.join('');
      */
      var source = event.data[i].content;

      var path = event.data[i].path.split('/');
      var filename = path.pop();
      path = path.join('/');

      if (path) {
        FS.createPath('/', path);
      }

      FS.writeFile('/' + path + '/' + filename, source);
    }

    shouldRunNow = true;
    Module['calledRun'] = false;
    Module['postRun'] = [postRun];
    Module.run();
  };

  function print(message) {
    postMessage(''+message);
  }

  function postRun() {
    try {
      var compiled = FS.readFile('/plugin.' + (Module['compiler'] === 'amxxpc' ? 'amxx' : 'smx'));
      postMessage(compiled.buffer/*, [compiled.buffer]*/);
    } catch (e) {
      postMessage(false);
    }

    close();
  }
})();
