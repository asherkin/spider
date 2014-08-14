'use strict';

var input = ace.edit('input');
input.setTheme('ace/theme/chrome');
input.getSession().setMode('ace/mode/c_cpp');
input.setShowFoldWidgets(false);
input.setShowPrintMargin(false);
input.setHighlightActiveLine(false);
input.getSession().setUseWrapMode(true);
input.getSession().setUseSoftTabs(false);
input.commands.removeCommand('showSettingsMenu');
input.commands.removeCommand('find');

var gutter = document.getElementById('gutter');

function updateGutterWidth() {
  var realGutter = input.container.getElementsByClassName('ace_gutter')[0];
  var width = parseInt(window.getComputedStyle(realGutter).width, 10);

  gutter.style.width = (width + 30 + 1) + 'px';
}

input.renderer.$gutterLayer.on('changeGutterWidth', updateGutterWidth);
updateGutterWidth();

var includes = document.getElementById('includes');

var template = input.getValue();
var savedText = localStorage['plugin.sp'];
if (savedText && (savedText !== template || localStorage.length > 1)) {
  var sessionAlert = document.getElementById('session-alert');

  var closebtn = sessionAlert.getElementsByClassName('close')[0];
  closebtn.onclick = function() {
    sessionAlert.classList.add('hide');
  };

  var loadTemplate = sessionAlert.getElementsByClassName('alert-link')[0];
  loadTemplate.onclick = function() {
    sessionAlert.classList.add('hide');

    input.setValue(template, -1);

    localStorage.clear();

    while (includes.childElementCount > 1) {
      includes.removeChild(includes.firstChild);
    }

    compiled = undefined;
    downloadbtn.disabled = true;
    output.textContent = '';

    return false;
  };

  sessionAlert.classList.remove('hide');

  input.setValue(savedText, -1);
} else {
  input.setValue(template, -1);
  localStorage.clear();
}

input.on('input', function() {
  localStorage['plugin.sp'] = input.getValue();
});

var includeDrop = document.getElementById('include-drop');

for (var i = 0; i < localStorage.length; ++i) {
  var filename = localStorage.key(i);

  if (filename === 'plugin.sp') {
    continue;
  }

  var li = document.createElement('li');
  li.classList.add('list-group-item');

  var close = document.createElement('button');
  close.type = 'button';
  close.classList.add('close');
  close.textContent = '\u00D7';
  close.onclick = (function(filename, li) {
    return (function() {
      delete localStorage[filename];
      includes.removeChild(li);
    });
  })(filename, li);

  var display = document.createElement('ol');

  filename = filename.split('/');

  if (filename[0] === 'extra') {
    filename.shift();
  }

  for (var j = 0; j < filename.length; ++j) {
    var olli = document.createElement('li');
    olli.textContent = filename[j];

    display.appendChild(olli);
  }

  li.appendChild(close); 
  li.appendChild(display);

  includes.insertBefore(li, includeDrop);
}

function killDropEvent(event) {
  event.dataTransfer.dropEffect = 'none';

  event.stopPropagation();
  event.preventDefault();
}

window.addEventListener('dragenter', killDropEvent);
window.addEventListener('dragover', killDropEvent);
window.addEventListener('drop', killDropEvent);

includeDrop.addEventListener('dragenter', function(event) {
  includeDrop.classList.add('hover');
  event.dataTransfer.dropEffect = 'copy';

  event.stopPropagation();
  event.preventDefault();
});

includeDrop.addEventListener('dragover', function(event) {
  event.dataTransfer.dropEffect = 'copy';

  event.stopPropagation();
  event.preventDefault();
});

includeDrop.addEventListener('dragleave', function(event) {
  includeDrop.classList.remove('hover');

  event.stopPropagation();
  event.preventDefault();
});

includeDrop.addEventListener('drop', function(event) {
  includeDrop.classList.remove('hover');

  for (var i = 0; i < event.dataTransfer.files.length; ++i) {
    var file = event.dataTransfer.files[i];

    if (!file.type.match(/^text\//) && !file.name.match(/(sp|inc)$/)) {
      continue;
    }

    var reader = new FileReader();
    reader.onload = function(event) {
      var exists = (localStorage['extra/' + file.name] !== undefined);
      localStorage['extra/' + file.name] = event.target.result;

      if (exists) {
        return;
      }

      var li = document.createElement('li');
      li.classList.add('list-group-item');

      var close = document.createElement('button');
      close.type = 'button';
      close.classList.add('close');
      close.textContent = '\u00D7';
      close.onclick = function() {
        delete localStorage['extra/' + file.name];
        includes.removeChild(li);
      };

      var display = document.createElement('ol');
      var olli = document.createElement('li');
      olli.textContent = file.name;
      display.appendChild(olli);

      li.appendChild(close);
      li.appendChild(display);

      includes.insertBefore(li, includeDrop);
    };

    reader.readAsText(file);
  }

  event.stopPropagation();
  event.preventDefault();
});

input.container.addEventListener('dragenter', function(event) {
  event.dataTransfer.dropEffect = 'copy';

  event.stopPropagation();
  event.preventDefault();
});

input.container.addEventListener('dragover', function(event) {
  event.dataTransfer.dropEffect = 'copy';

  event.stopPropagation();
  event.preventDefault();
});

input.container.addEventListener('drop', function(event) {
  if (event.dataTransfer.files.length != 1) {
    return;
  }

  var file = event.dataTransfer.files[0];

  if (!file.type.match(/^text\//) && !file.name.match(/(sp|inc)$/)) {
    return;
  }

  var reader = new FileReader();
  reader.onload = function(event) {
    input.setValue(event.target.result, -1);
  }

  reader.readAsText(file);

  event.stopPropagation();
  event.preventDefault();
});

var output = document.getElementById('output');

var compilebtn = document.getElementById('compile');
var downloadbtn = document.getElementById('download');

var worker = new Worker('js/worker.js');
var compiled;

function compile() {
  if (worker.onmessage) {
    worker.terminate();
    worker = new Worker('js/worker.js');
  }

  worker.onmessage = handle;

  var sources = [];
  //var buffers = [];

  for (var i = 0; i < localStorage.length; ++i) {
    var filename = localStorage.key(i);
    var content = localStorage[filename];

/*
    var buffer = new ArrayBuffer(content.length * 2);
    var view = new Uint16Array(buffer);
    for (var j = 0; j < content.length; ++j) {
      view[j] = content.charCodeAt(j);
    }
*/

    sources.push({path: filename, content: content/*buffer*/});
    //buffers.push(buffer);
  }

  worker.postMessage(sources/*, buffers*/);
}

function handle(event) {
  if (typeof event.data === 'string') {
    output.textContent += event.data + '\r\n';

    var message = event.data.match(/^plugin\.sp\((\d+)\) : (?:fatal )?(\w+) \d+: (.+)/);
    if (!message) {
      return;
    }

    var annotations = input.getSession().getAnnotations();

    annotations.push({
      column: 0,
      row: message[1] - 1,
      text: message[3],
      type: message[2],
    });

    input.getSession().setAnnotations(annotations);

    return;
  }

  if (event.data !== false) {
    compiled = event.data;
    downloadbtn.disabled = false;
  }

  worker.terminate();
  worker = new Worker('js/worker.js');
}

compilebtn.onclick = function() {
  compiled = undefined;
  downloadbtn.disabled = true;

  output.textContent = '';
  input.getSession().clearAnnotations();
  compile();
};

downloadbtn.onclick = function() {
  if (!compiled) {
    downloadbtn.disabled = true;
    return;
  }

  var blob = new Blob([compiled], {type: 'application/octet-stream'});

  saveAs(blob, 'plugin.smx');
};

