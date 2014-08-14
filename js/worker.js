'use strict';

var Module = {
  noInitialRun: true,
  print: print,
  postRun: [postRun],
  arguments: ['-iextra', '-iinclude', 'plugin.sp'],
  memoryInitializerPrefixURL: 'spcomp/',
  filePackagePrefixURL: 'spcomp/',
};

// Workaround for Safari.
if (!self.console) {
  self.console = {log: function() {}};
}

importScripts('spcomp/spcomp.js');

onmessage = function(event) {
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

    FS.createDataFile('/' + path, filename, source, true, true);
  }

  shouldRunNow = true;
  Module.run();
};

function print(message) {
  postMessage(''+message);
}

function postRun() {
  var compiled = FS.root.contents['plugin.smx'];

  if (compiled) {
    postMessage(compiled.contents.buffer/*, [compiled.contents.buffer]*/);
  } else {
    postMessage(false);
  }

  close();
}
