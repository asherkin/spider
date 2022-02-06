(function(){
  'use strict';

  var currentLanguage = 'en';
  var languageReset = document.getElementById('lang-reset');

  languageReset.onclick = function() {
    setLanguage('en');
    return false;
  };

  function setLanguage(lang) {
    if (lang === currentLanguage) {
      return;
    }

    var current = translations[currentLanguage];
    var strings = translations[lang];

    if (!strings || strings.length != current.length) {
      console.log('Language ' + lang + ' not found or invalid.');
      return;
    }

    var translatables = document.getElementsByClassName('trans');

    for (var i = 0; i < translatables.length; ++i) {
      var index = current.indexOf(translatables[i].textContent);

      if (index === -1) {
        console.log('Phrase "' + translatables[i].textContent + '" not found.');
        continue;
      }

      translatables[i].textContent = translations[lang][index];
    };

    if (lang !== 'en') {
      languageReset.classList.remove('hide');
    } else {
      languageReset.classList.add('hide');
    }

    currentLanguage = lang;
  }

  var language = 'en';

  if (navigator.languages) {
    var i;
    for (i = 0; i < navigator.languages.length; ++i) {
      var lang = navigator.languages[i].substr(0, 2);

      if (translations[lang]) {
        language = lang;
        break;
      }
    }

    if (i === navigator.languages.length) {
      console.log('No suitible language found: ' + navigator.languages);
    }
  } else if (navigator.language) {
    language = navigator.language.substr(0, 2);
  } else if (navigator.userLanguage) {
    language = navigator.userLanguage.substr(0, 2);
  }

  setLanguage(language);

  if (window.applicationCache) {
    function showUpdateNotice() {
      var notice = document.getElementById('update-alert');
      notice.classList.remove('hide');

      var reload = notice.getElementsByClassName('alert-link')[0];
      reload.onclick = function() {
        location.reload();
        return false;
      };
    }

    applicationCache.onupdateready = showUpdateNotice;

    if(applicationCache.status === applicationCache.UPDATEREADY) {
      showUpdateNotice();
    }

    setInterval(function() {
      if(navigator.onLine && (applicationCache.status === applicationCache.IDLE || applicationCache.status === applicationCache.UPDATEREADY)) {
        applicationCache.update();
      }
    }, 3600000);
  }

  var input = ace.edit('input');
  input.setTheme('ace/theme/textmate');
  input.getSession().setMode('ace/mode/c_cpp');
  input.setShowFoldWidgets(true);
  input.setShowPrintMargin(false);
  input.setHighlightActiveLine(false);
  input.setShowInvisibles(true);
  input.getSession().setUseWrapMode(true);
  input.getSession().setUseSoftTabs(true);
  input.commands.removeCommand('showSettingsMenu');

  ace.config.loadModule('ace/ext/language_tools', function() {
    input.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: false,
      enableLiveAutocompletion: false,
    });
  });

  var gutter = document.getElementById('gutter');

  function updateGutterWidth() {
    var realGutter = input.container.getElementsByClassName('ace_gutter')[0];
    var width = parseInt(getComputedStyle(realGutter).width, 10);

    gutter.style.width = (width + 30 + 1) + 'px';
  }

  input.renderer.$gutterLayer.on('changeGutterWidth', updateGutterWidth);
  updateGutterWidth();

  var spcompButton = document.getElementById('compiler-spcomp');
  var amxxpcButton = document.getElementById('compiler-amxxpc');

  var lightButton = document.getElementById('theme-light');
  var darkButton = document.getElementById('theme-dark');

  var output = document.getElementById('output');

  var compileButton = document.getElementById('compile');
  var downloadButton = document.getElementById('download');
  var runButton = document.getElementById('run');

  var includes = document.getElementById('includes');
  var includeDrop = document.getElementById('include-drop');

  var theme;

  function selectLightTheme() {
    if (theme === 'light') {
      return;
    }

    localStorage['theme'] = theme = 'light';

    document.documentElement.classList.remove('dark');
    input.setTheme('ace/theme/textmate');

    darkButton.classList.remove('active');
    lightButton.classList.add('active');
  }

  function selectDarkTheme() {
    if (theme === 'dark') {
      return;
    }

    localStorage['theme'] = theme = 'dark';

    document.documentElement.classList.add('dark');
    input.setTheme('ace/theme/monokai');

    lightButton.classList.remove('active');
    darkButton.classList.add('active');
  }

  if (localStorage['theme'] === 'dark') {
    selectDarkTheme();
  } else {
    selectLightTheme();
  }

  lightButton.onclick = selectLightTheme;
  darkButton.onclick = selectDarkTheme;

  document.getElementById('wide').onclick = function() {
    document.documentElement.classList.add('wide');
    input.resize();
  };

  document.getElementById('expando').onclick = function() {
    document.documentElement.classList.remove('wide');
    input.resize();
  };

  var spcompTemplate = [
    '#include <sourcemod>',
    '',
    '#pragma semicolon 1',
    '#pragma newdecls required',
    '',
    'public Plugin myinfo = {',
    '    name        = "",',
    '    author      = "",',
    '    description = "",',
    '    version     = "0.0.0",',
    '    url         = ""',
    '};',
    '',
    'public void OnPluginStart()',
    '{',
    '    PrintToServer("Hello, World!");',
    '}',
    '',
  ].join('\n');

  var amxxpcTemplate = [
    '#include <amxmodx>',
    '',
    '#pragma semicolon 1',
    '',
    'new PLUGIN[]  = "";',
    'new AUTHOR[]  = "";',
    'new VERSION[] = "0.00";',
    '',
    'public plugin_init()',
    '{',
    '    register_plugin(PLUGIN, VERSION, AUTHOR);',
    '    ',
    '    server_print("Hello, World!");',
    '}',
    '',
  ].join('\n');

  var compiler, template, inputFile, outputFile;
  var worker, compiled, runWorker;

  function resetCompiled() {
    compiled = undefined;
    downloadButton.disabled = true;
    runButton.disabled = true;
  }

  function spcompSetup() {
    if (compiler === 'spcomp') {
      return;
    }

    if (template && input.getValue() === template) {
      input.setValue(spcompTemplate, -1);
    }

    localStorage['compiler'] = compiler = 'spcomp';
    template = spcompTemplate;
    inputFile = 'plugin.sp';
    outputFile = 'plugin.smx';

    if (worker) {
      worker.terminate();
    }

    console.log('creating new spcomp webworker');
    worker = new Worker('js/worker.js');
    worker.postMessage(compiler);

    if (runWorker) {
      runWorker.terminate();
    }

    output.textContent = '';
    input.getSession().clearAnnotations();
    resetCompiled();

    downloadButton.classList.add('col-xs-9');
    downloadButton.classList.remove('col-xs-12');
    downloadButton.classList.remove('dropdown-toggle');
    runButton.classList.remove('hidden');

    amxxpcButton.classList.remove('active');
    spcompButton.classList.add('active');
  }

  function amxxpcSetup() {
    if (compiler === 'amxxpc') {
      return;
    }

    if (template && input.getValue() === template) {
      input.setValue(amxxpcTemplate, -1);
    }

    localStorage['compiler'] = compiler = 'amxxpc';
    template = amxxpcTemplate;
    inputFile = 'plugin.sma';
    outputFile = 'plugin.amxx';

    if (worker) {
      worker.terminate();
    }

    console.log('creating new amxxpc webworker');
    worker = new Worker('js/worker.js');
    worker.postMessage(compiler);

    if (runWorker) {
      runWorker.terminate();
    }

    output.textContent = '';
    input.getSession().clearAnnotations();
    resetCompiled();

    downloadButton.classList.remove('col-xs-9');
    downloadButton.classList.remove('col-lg-10');
    downloadButton.classList.add('col-xs-12');
    downloadButton.classList.add('dropdown-toggle');
    runButton.classList.add('hidden');

    spcompButton.classList.remove('active');
    amxxpcButton.classList.add('active');
  }

  if (localStorage['compiler'] === 'amxxpc') {
    amxxpcSetup();
  } else {
    spcompSetup();
  }

  spcompButton.onclick = spcompSetup;
  amxxpcButton.onclick = amxxpcSetup;

  if (location.hash.match(/^#\d+$/)) {
    for (var i = localStorage.length - 1; i >= 0; --i) {
      var key = localStorage.key(i);

      if (key.match(/^\//)) {
        delete localStorage[key];
      }
    }

    template = 'Loading...';
    compileButton.disabled = true;

    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var type = this.getResponseHeader('Content-Type');

      if (type == 'application/json') {
        input.setValue(JSON.parse(this.responseText).error, -1);
        return;
      }

      input.setValue(this.responseText, -1);
      localStorage['input-file'] = this.responseText;

      var filename = this.getResponseHeader('Content-Disposition');
      if (filename) {
        filename = filename.match(/filename="([^"]*)"/);
        if (filename) {
          filename = filename[1];

          if (filename.match(/\.sp$/)) {
            spcompSetup();
            outputFile = filename.replace(/\.sp$/, '.smx');
            compile();
          } else if (filename.match(/\.sma$/)) {
            amxxpcSetup();
            outputFile = filename.replace(/\.sma$/, '.amxx');
            compile();
          }
        }
      }

      compileButton.disabled = false;
    }

    xhr.open('GET', 'https://users.alliedmods.net/~asherkin/attachment.php?id=' + location.hash.slice(1), true);
    xhr.send();
  }

  var savedText = localStorage['input-file'];
  var savedIncludes = [];

  for (var i = 0; i < localStorage.length; ++i) {
    var key = localStorage.key(i);
    if (key.match(/^\//)) {
      savedIncludes.push(key);
    }
  }

  var showRestoreNotice = false;

  if (savedText && savedText !== template) {
    input.setValue(savedText, -1);

    showRestoreNotice = true;
  } else {
    input.setValue(template, -1);
  }

  if (savedIncludes.length > 0) {
    for (var i = 0; i < savedIncludes.length; ++i) {
      var filename = savedIncludes[i];

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
      filename.shift();

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

    showRestoreNotice = true;
  }

  if (showRestoreNotice) {
    var sessionAlert = document.getElementById('session-alert');

    var closeButton = sessionAlert.getElementsByClassName('close')[0];
    closeButton.onclick = function() {
      sessionAlert.classList.add('hide');
    };

    var loadTemplate = sessionAlert.getElementsByClassName('alert-link')[0];
    loadTemplate.onclick = function() {
      sessionAlert.classList.add('hide');

      input.setValue(template, -1);

      for (var i = localStorage.length - 1; i >= 0; --i) {
        var key = localStorage.key(i);

        if (key.match(/^\//)) {
          delete localStorage[key];
        }
      }

      while (includes.childElementCount > 1) {
        includes.removeChild(includes.firstChild);
      }

      output.textContent = '';
      input.getSession().clearAnnotations();
      resetCompiled();

      return false;
    };

    sessionAlert.classList.remove('hide');
  }

  input.on('input', function() {
    localStorage['input-file'] = input.getValue();

    resetCompiled();
  });

  function killDropEvent(event) {
    event.dataTransfer.dropEffect = 'none';

    event.stopPropagation();
    event.preventDefault();
  }

  window.ondragenter = killDropEvent;
  window.ondragover = killDropEvent;
  window.ondrop = killDropEvent;

  includeDrop.ondragenter = function(event) {
    includeDrop.classList.add('hover');
    event.dataTransfer.dropEffect = 'copy';

    event.stopPropagation();
    event.preventDefault();
  };

  includeDrop.ondragover = function(event) {
    event.dataTransfer.dropEffect = 'copy';

    event.stopPropagation();
    event.preventDefault();
  };

  includeDrop.ondragleave = function(event) {
    includeDrop.classList.remove('hover');

    event.stopPropagation();
    event.preventDefault();
  };

  includeDrop.ondrop = function(event) {
    includeDrop.classList.remove('hover');

    for (var i = 0; i < event.dataTransfer.files.length; ++i) {
      var file = event.dataTransfer.files[i];

      if (!file.type.match(/^text\//) && !file.name.match(/\.(sma|inl|sp|inc)$/)) {
        continue;
      }

      var reader = new FileReader();
      reader.onload = (function() {
        return function(event) {
          var exists = (localStorage['/extra/' + file.name] !== undefined);
          localStorage['/extra/' + file.name] = event.target.result;

          resetCompiled();

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
            delete localStorage['/extra/' + file.name];
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
      })();

      reader.readAsText(file);
    }

    event.stopPropagation();
    event.preventDefault();
  };

  input.container.ondragenter = function(event) {
    event.dataTransfer.dropEffect = 'copy';

    event.stopPropagation();
    event.preventDefault();
  };

  input.container.ondragover = function(event) {
    event.dataTransfer.dropEffect = 'copy';

    event.stopPropagation();
    event.preventDefault();
  };

  input.container.ondrop = function(event) {
    if (event.dataTransfer.files.length != 1) {
      return;
    }

    var file = event.dataTransfer.files[0];

    if (!file.type.match(/^text\//) && !file.name.match(/\.(sma|inl|sp|inc)$/)) {
      return;
    }

    if (file.name.match(/\.sp$/)) {
      spcompSetup();
    } else if (file.name.match(/\.sma$/)) {
      amxxpcSetup();
    }

    var reader = new FileReader();
    reader.onload = function(event) {
      input.setValue(event.target.result, -1);
    }

    reader.readAsText(file);

    event.stopPropagation();
    event.preventDefault();
  };

  function compile() {
    if (worker.onmessage) {
      console.log('starting new webworker because one was already running during compile');
      worker.terminate();
      worker = new Worker('js/worker.js');
      worker.postMessage(compiler);
    }

    console.log('setting webworker message callback');
    worker.onmessage = handleCompileMessage;

    var sources = [];
    //var buffers = [];

    for (var i = 0; i < localStorage.length; ++i) {
      var filename = localStorage.key(i);

      if (filename !== 'input-file' && !filename.match(/^\//)) {
        continue;
      }

      var content = localStorage[filename];

      if (filename === 'input-file') {
        filename = inputFile;
      };

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

    console.log('asking webworker to do build');
    worker.postMessage(sources/*, buffers*/);
  }

  function handleCompileMessage(event) {
    if (typeof event.data === 'string') {
      output.textContent += event.data + '\r\n';

      var message = event.data.match(/^plugin\.(?:sma|sp)\((\d+)\) : (?:fatal )?(\w+) \d+: (.+)/);
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
      downloadButton.disabled = false;
      runButton.disabled = false;
    }

    console.log('creating new webworker post-compile');
    worker.terminate();
    worker = new Worker('js/worker.js');
    worker.postMessage(compiler);
  }

  function run() {
    if (runWorker) {
      runWorker.terminate();
    }

    runWorker = new Worker('js/run-worker.js');
    runWorker.onmessage = handleRunMessage;
    runWorker.postMessage(compiled);
  }

  var lastException = null;
  function handleRunMessage(event) {
    if (typeof event.data !== 'string') {
      return;
    }

    output.textContent += event.data + '\r\n';

    var exception = event.data.match(/^Exception thrown: (.+)/);
    if (exception) {
      lastException = exception[1];
      return;
    }

    var message = event.data.match(/^  \[\d+\] plugin\.(?:sma|sp)::[^,]+, line (\d+)/);
    if (!lastException || !message) {
      return;
    }

    var annotations = input.getSession().getAnnotations();

    annotations.push({
      column: 0,
      row: message[1] - 1,
      text: lastException,
      type: 'error',
    });

    input.getSession().setAnnotations(annotations);

    // Only annotate the exit point from the plugin.
    lastException = null;
  }

  compileButton.onclick = function() {
    resetCompiled();

    if (runWorker) {
      runWorker.terminate();
    }

    output.textContent = '';
    input.getSession().clearAnnotations();

    compile();
  };

  downloadButton.onclick = function() {
    if (!compiled) {
      resetCompiled();
      return;
    }

    var blob = new Blob([compiled], {type: 'application/octet-stream'});

    saveAs(blob, outputFile);
  };

  runButton.onclick = function() {
    if (!compiled) {
      resetCompiled();
      return;
    }

    output.textContent = '';
    input.getSession().clearAnnotations();

    run();
  };

  input.commands.addCommand({
    name: 'compile',
    bindKey: { win: 'Ctrl-S', mac: 'Cmd-S' },
    exec: function(editor) {
      compileButton.onclick();
    }
  });
})();
