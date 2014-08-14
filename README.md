```
{
  "vars": {},
  "css": [
    "type.less",
    "code.less",
    "grid.less",
    "buttons.less",
    "alerts.less",
    "list-group.less",
    "close.less"
  ],
  "js": []
}
```
```
clang scpack.c -o scpack
./scpack sc5-in.scp sc5.scp
./scpack sc7-in.scp sc7.scp
```
```
emcc -O3 --closure 0 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s FORCE_ALIGNED_MEMORY=1 --llvm-lto 1 -DNDEBUG -DHAVE_SAFESTR -fno-strict-aliasing -I . -I ../../public/ -I ../../public/sourcepawn/ -D_GNU_SOURCE -Wall -DLINUX -DHAVE_STDINT_H -DAMX_ANSIONLY -Dstricmp=strcasecmp -m32 -fno-exceptions -fno-rtti libpawnc.c lstring.c memfile.c pawncc.c sc1.c sc2.c sc3.c sc4.c sc5.c sc6.c sc7.c scexpand.c sci18n.c sclist.c scmemfil.c scstate.c sctracker.c scvars.c sp_file.c zlib/adler32.c zlib/compress.c zlib/crc32.c zlib/deflate.c zlib/gzio.c zlib/infback.c zlib/inffast.c zlib/inflate.c zlib/inftrees.c zlib/trees.c zlib/uncompr.c zlib/zutil.c sp_symhash.c binreloc.c -o spcomp.js --preload-file ../../plugins/include/@include/ -Wno-format -Wno-parentheses -Wno-unused -Wno-sometimes-uninitialized -funroll-loops
```
