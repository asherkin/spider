# Spider
A web-based, entirely client-side, editor and compiler for SourcePawn development.

## Building
`grunt` alone will do a production build with the appcache manifest and gzip compression. `grunt serve` will start a local webserver and rebuild on changes.

### Compilers
One day there will be a Makefile for this.

#### SourceMod
```
emcc -std=c++11 -O3 --closure 0 --memory-init-file 0 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 --llvm-lto 1 -Wall -Wno-delete-non-virtual-dtor -fno-strict-aliasing -funroll-loops -D_GNU_SOURCE -DLINUX -DNDEBUG -DHAVE_SAFESTR -DHAVE_STDINT_H -DAMX_ANSIONLY -Dstricmp=strcasecmp -DKE_THREADSAFE '-DSOURCEPAWN_VERSION="1.8.0-dev+5395"' -m32 -fno-exceptions -fno-rtti -I . -I ../include/ -I ../../public/amtl/include/ -I ../third_party/ libpawnc.cpp lstring.cpp memfile.cpp pawncc.cpp sc1.cpp sc2.cpp sc3.cpp sc4.cpp sc5.cpp sc6.cpp sc7.cpp scexpand.cpp sci18n.cpp sclist.cpp scmemfil.cpp scstate.cpp sctracker.cpp scvars.cpp smx-builder.cpp sp_symhash.cpp -o cpp.bc
emcc -O3 --closure 0 --memory-init-file 0 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 --llvm-lto 1 -Wall -fno-strict-aliasing -funroll-loops -D_GNU_SOURCE -DLINUX -DNDEBUG -DHAVE_SAFESTR -DHAVE_STDINT_H -DAMX_ANSIONLY -Dstricmp=strcasecmp -DKE_THREADSAFE '-DSOURCEPAWN_VERSION="1.8.0-dev+5395"' -m32 -fno-exceptions -fno-rtti -I . -I ../include/ -I ../../public/amtl/include/ -I ../third_party/ ../third_party/zlib/adler32.c ../third_party/zlib/compress.c ../third_party/zlib/crc32.c ../third_party/zlib/deflate.c ../third_party/zlib/gzio.c ../third_party/zlib/infback.c ../third_party/zlib/inffast.c ../third_party/zlib/inflate.c ../third_party/zlib/inftrees.c ../third_party/zlib/trees.c ../third_party/zlib/uncompr.c ../third_party/zlib/zutil.c binreloc.c -o c.bc
emcc -O3 --closure 0 --memory-init-file 0 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 --llvm-lto 1 -fno-strict-aliasing -Wall -funroll-loops -m32 -fno-exceptions -fno-rtti cpp.bc c.bc -o spcomp.js --preload-file ../../plugins/include/@include/
```

#### AMX Mod X
```
emcc -O3 --closure 0 --memory-init-file 0 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s FORCE_ALIGNED_MEMORY=1 --llvm-lto 1 -DNDEBUG -DHAVE_SAFESTR -fno-strict-aliasing -I amxxpc -I libpc300 -D_GNU_SOURCE -Wall -DLINUX -D__linux__ -DHAVE_STDINT_H -DAMX_ANSIONLY -DNO_MAIN -DPAWNC_DLL -m32 -fno-rtti libpc300/libpawnc.c libpc300/sc1.c libpc300/sc2.c libpc300/sc3.c libpc300/sc4.c libpc300/sc5.c libpc300/sc6.c libpc300/sc7.c libpc300/sci18n.c libpc300/sclist.c libpc300/scmemfil.c libpc300/scexpand.c libpc300/scstate.c libpc300/scvars.c libpc300/prefix.c libpc300/memfile.c amxxpc/amx.cpp amxxpc/amxxpc.cpp amxxpc/Binary.cpp amxxpc/zlib/adler32.c amxxpc/zlib/compress.c amxxpc/zlib/crc32.c amxxpc/zlib/deflate.c amxxpc/zlib/gzio.c amxxpc/zlib/infback.c amxxpc/zlib/inffast.c amxxpc/zlib/inflate.c amxxpc/zlib/inftrees.c amxxpc/zlib/trees.c amxxpc/zlib/uncompr.c amxxpc/zlib/zutil.c -o amxxpc.js --preload-file ../plugins/include/@include/ -Wno-format -Wno-parentheses -Wno-unused -Wno-sometimes-uninitialized -funroll-loops -D SVN_VERSION='"1.8.3-manual"'
```

### Bootstrap Config
```
{
  "vars": {},
  "css": [
    "type.less",
    "code.less",
    "grid.less",
    "buttons.less",
    "button-groups.less",
    "alerts.less",
    "list-group.less",
    "close.less"
  ],
  "js": []
}
```

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) before making a Pull Request to this repository.

## License
Spider is open-source software under the GNU GPLv3, see [LICENSE.md](LICENSE.md) for full details.
