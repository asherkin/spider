// Workaround for Safari.
if (!self.console) {
  self.console = {
    log: function() {},
  };
}

var Module = {
  print: function(message) {
    postMessage(''+message);
  },
  printErr: function(message) {
    postMessage(''+message);
  },
};

importScripts('sourcepawn-js.js');

function CreateAndBindNative(runtime, name, func) {
  var strNativeName = Module.allocate(Module.intArrayFromString(name), 'i8', Module.ALLOC_NORMAL);
  var funNative = Module.Runtime.addFunction(function(ctx, ptrArgs) {
    var args = [];
    var argCount = Module.getValue(ptrArgs, 'i32');
    for (var i = 1; i <= argCount; ++i) {
      args.push(Module.getValue(ptrArgs + (i * 4), 'i32'));
    }

    return func(ctx, args);
  });

  if (Module._runtime_bind_native(runtime, strNativeName, funNative) === 0) {
    // This can just mean that the native isn't used in the plugin.
    //throw new Error('Failed to bind ' + name + ' native');
  }

  Module._free(strNativeName);

  return funNative;
}

function atcprintf(format, ctx, params) {
  // http://locutus.io/php/sprintf/
  // https://github.com/kvz/locutus/blob/master/LICENSE
  // modified for emscripten / sourcepawn use
  var regex = /%%|%([-0]*)(\d+)?(?:\.(\d+))?([scbxXuidf])/g;

  var _pad = function(str, len, chr, leftJustify) {
    var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr);
    return leftJustify ? str + padding : padding + str;
  };

  var _justify = function(value, prefix, leftJustify, minWidth, zeroPad) {
    var diff = minWidth - value.length;
    if (diff > 0) {
      if (leftJustify || !zeroPad) {
        value = _pad(value, minWidth, ' ', leftJustify);
      } else {
        value = [
          value.slice(0, prefix.length),
          _pad('', diff, '0', true),
          value.slice(prefix.length),
        ].join('');
      }
    }
    return value;
  };

  var _formatBaseX = function(value, base, leftJustify, minWidth, precision, zeroPad) {
    // Note: casts negative numbers to positive ones
    var number = value >>> 0;
    value = _pad(number.toString(base), precision || 0, '0', false);
    return _justify(value, '', leftJustify, minWidth, zeroPad);
  }

  var _formatString = function(value, leftJustify, minWidth, precision, zeroPad) {
    if (precision !== null && precision !== undefined) {
      value = value.slice(0, precision);
    }
    return _justify(value, '', leftJustify, minWidth, zeroPad);
  }

  var i = 0;

  var doFormat = function(substring, flags, minWidth, precision, type) {
    if (substring === '%%') {
      return '%';
    }

    // parse flags
    var leftJustify = false;
    var zeroPad = false;
    for (var j = 0; j < flags.length; j++) {
      switch (flags.charAt(j)) {
        case '-':
          leftJustify = true;
          break;
        case '0':
          zeroPad = true;
          break;
      }
    }

    // parameters may be null, undefined, empty-string or real valued
    // we want to ignore null, undefined and empty-string values
    if (!minWidth) {
      minWidth = 0;
    } else {
      minWidth = +minWidth;
    }

    if (!precision) {
      precision = (type === 'f') ? 6 : (type === 'd') ? 0 : undefined;
    } else {
      precision = +precision;
    }

    var addr = Module._context_local_to_physical_address(ctx, params[i++]);
    switch (type) {
      case 's':
        var value = Module.Pointer_stringify(addr);
        return _formatString(value, leftJustify, minWidth, precision, zeroPad);
      case 'c':
        var value = Module.Pointer_stringify(addr, 1);
        return _formatString(value, leftJustify, minWidth, precision, zeroPad);
      case 'b':
      case 'x':
      case 'X':
      case 'u':
      case 'i':
      case 'd':
        var value = Module.getValue(addr, 'i32');
        switch (type) {
          case 'b':
            return _formatBaseX(value, 2, leftJustify, minWidth, precision, zeroPad);
          case 'x':
            return _formatBaseX(value, 16, leftJustify, minWidth, precision, zeroPad);
          case 'X':
            return _formatBaseX(value, 16, leftJustify, minWidth, precision, zeroPad).toUpperCase();
          case 'u':
            return _formatBaseX(value, 10, leftJustify, minWidth, precision, zeroPad);
          case 'i':
          case 'd':
            var number = +value | 0;
            var prefix = number < 0 ? '-' : '';
            value = prefix + _pad(String(Math.abs(number)), precision, '0', false);
            return _justify(value, prefix, leftJustify, minWidth, zeroPad);
        }
      case 'f':
        var number = Module.getValue(addr, 'float');
        var prefix = number < 0 ? '-' : '';
        var value = prefix + Math.abs(number).toFixed(precision);
        return _justify(value, prefix, leftJustify, minWidth, zeroPad);
      default:
        return substring;
    }
  };

  return format.replace(regex, doFormat);
}

onmessage = function(event) {
  Module.FS.writeFile('plugin.smx', new Uint8Array(event.data), { encoding: 'binary' });

  var spEnv = Module._new_environment();
  if (spEnv === 0) {
    Module.printErr('Failed to create SourcePawn environment');
    return;
  }

  var strFilename = Module.allocate(Module.intArrayFromString('plugin.smx'), 'i8', Module.ALLOC_NORMAL);

  var errorLen = 256;
  var strError = Module._malloc(errorLen);

  var spRuntime = Module._environment_new_runtime(spEnv, strFilename, strError, errorLen);
  if (spRuntime === 0) {
    Module.printErr('Failed to create SourcePawn runtime: ' + Module.Pointer_stringify(strError));
    return;
  }

  self.spRuntime = spRuntime;
  importScripts('natives.js');
  delete self.spRuntime;

  var strFunctionName = Module.allocate(Module.intArrayFromString('OnPluginStart'), 'i8', Module.ALLOC_NORMAL);

  var functionPtr = Module._runtime_get_function(spRuntime, strFunctionName);
  if (!functionPtr) {
    Module.printErr('Failed to find OnPluginStart function');
    return;
  }

  var ptrRet = Module._malloc(4);
  if (Module._function_invoke(functionPtr, ptrRet, strError, errorLen) === 0) {
    //Module.printErr('Failed to invoke OnPluginStart: ' + Module.Pointer_stringify(strError));
    return;
  }
};
