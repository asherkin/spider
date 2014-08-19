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

SourceMod
---------
```
clang scpack.c -o scpack
./scpack sc5-in.scp sc5.scp
./scpack sc7-in.scp sc7.scp
```
```
emcc -O3 --closure 0 --memory-init-file 0 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s FORCE_ALIGNED_MEMORY=1 --llvm-lto 1 -DNDEBUG -DHAVE_SAFESTR -fno-strict-aliasing -I . -I ../../public/ -I ../../public/sourcepawn/ -D_GNU_SOURCE -Wall -DLINUX -DHAVE_STDINT_H -DAMX_ANSIONLY -Dstricmp=strcasecmp -m32 -fno-exceptions -fno-rtti libpawnc.c lstring.c memfile.c pawncc.c sc1.c sc2.c sc3.c sc4.c sc5.c sc6.c sc7.c scexpand.c sci18n.c sclist.c scmemfil.c scstate.c sctracker.c scvars.c sp_file.c zlib/adler32.c zlib/compress.c zlib/crc32.c zlib/deflate.c zlib/gzio.c zlib/infback.c zlib/inffast.c zlib/inflate.c zlib/inftrees.c zlib/trees.c zlib/uncompr.c zlib/zutil.c sp_symhash.c binreloc.c -o spcomp.js --preload-file ../../plugins/include/@include/ -Wno-format -Wno-parentheses -Wno-unused -Wno-sometimes-uninitialized -funroll-loops
```

AMX Mod X
---------
```
emcc -O3 --closure 0 --memory-init-file 0 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s FORCE_ALIGNED_MEMORY=1 --llvm-lto 1 -DNDEBUG -DHAVE_SAFESTR -fno-strict-aliasing -I amxxpc -I libpc300 -D_GNU_SOURCE -Wall -DLINUX -D__linux__ -DHAVE_STDINT_H -DAMX_ANSIONLY -DNO_MAIN -DPAWNC_DLL -m32 -fno-rtti libpc300/libpawnc.c libpc300/sc1.c libpc300/sc2.c libpc300/sc3.c libpc300/sc4.c libpc300/sc5.c libpc300/sc6.c libpc300/sc7.c libpc300/sci18n.c libpc300/sclist.c libpc300/scmemfil.c libpc300/scexpand.c libpc300/scstate.c libpc300/scvars.c libpc300/prefix.c libpc300/memfile.c amxxpc/amx.cpp amxxpc/amxxpc.cpp amxxpc/Binary.cpp amxxpc/zlib/adler32.c amxxpc/zlib/compress.c amxxpc/zlib/crc32.c amxxpc/zlib/deflate.c amxxpc/zlib/gzio.c amxxpc/zlib/infback.c amxxpc/zlib/inffast.c amxxpc/zlib/inflate.c amxxpc/zlib/inftrees.c amxxpc/zlib/trees.c amxxpc/zlib/uncompr.c amxxpc/zlib/zutil.c -o amxxpc.js --preload-file ../plugins/include/@include/ -Wno-format -Wno-parentheses -Wno-unused -Wno-sometimes-uninitialized -funroll-loops -D SVN_VERSION='"1.8.3-manual"'
```
