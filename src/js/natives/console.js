CreateAndBindNative(spRuntime, 'PrintToServer', function(ctx, args) {
  var format = Module.UTF8ToString(Module._context_local_to_physical_address(ctx, args[0]));
  var result = atcprintf(format, ctx, args.slice(1));
  Module.print(result);
});
