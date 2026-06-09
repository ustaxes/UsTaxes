zlib.js
=======

[![Build Status](https://travis-ci.org/imaya/zlib.js.png?branch=master)](https://travis-ci.org/imaya/zlib.js)

[Japanese version](./README.md)

zlib.js is ZLIB(RFC1950), DEFLATE(RFC1951), GZIP(RFC1952) and PKZIP implementation in JavaScript.


Usage
------

Use one in "bin" directory.

- zlib_and_gzip.min.js: ZLIB + GZIP
    + (Raw)
        * rawdeflate.js: Raw Deflate
        * rawinflate.js: Raw Inflate
    + zlib.min.js: ZLIB Inflate + Deflate
        * inflate.min.js: ZLIB Inflate
        * deflate.min.js: ZLIB Deflate
        * inflate_stream.min.js: ZLIB Inflate (stream mode)
    + (GZIP)
        * gzip.min.js: GZIP
        * gunzip.min.js: GUNZIP
    + (PKZIP)
        * zip.min.js ZIP
        * unzip.min.js UNZIP
- node-zlib.js: (ZLIB + GZIP for node.js)


### Compression

#### Raw Deflate

```js
// plain = Array.<number> or Uint8Array
var deflate = new Zlib.RawDeflate(plain);
var compressed = deflate.compress();
```

#### Raw Deflate Option

See ZLIB Option.

#### ZLIB

```js
// plain = Array.<number> or Uint8Array
var deflate = new Zlib.Deflate(plain);
var compressed = deflate.compress();
```

##### ZLIB Option

Second argument of Zlib.Deflate constructor

```js
{
    compressionType: Zlib.Deflate.CompressionType, // compression type
    lazy: number // lazy matching parameter
}
```

<code>Zlib.Deflate.CompressionType</code> is enumerable,
Choose one in <code>NONE</code> (Store), <code>FIXED</code> (Fixed Huffman Coding), <code>DYNAMIC</code> (Dynamic Huffman Coding).
Default value is <code>DYNAMIC</code>.

<code>lazy</code> is Lazy Matching length.
This parameter is deprecated.


#### GZIP

GZIP implementation is incomplete.
However, there is no problem in usual use. 

```js
// plain = Array.<number> or Uint8Array
var gzip = new Zlib.Gzip(plain);
var compressed = gzip.compress();
```


##### GZIP Option

```js
{
    deflateOptions: Object, // see: deflate option (ZLIB Option)
    flags: {
        fname: boolean, // use filename?
        comment: boolean, // use comment?
        fhcrc: boolean // use file checksum?
    },
    filename: string, // filename
    comment: string // comment
}
```


#### PKZIP

```js
var zip = new Zlib.Zip();
// plainData1
zip.addFile(plainData1, {
    filename: stringToByteArray('foo.txt')
});
zip.addFile(plainData2, {
    filename: stringToByteArray('bar.txt')
});
zip.addFile(plainData3, {
    filename: stringToByteArray('baz.txt')
});
var compressed = zip.compress();

function stringToByteArray(str) {
    var array = new (window.Uint8Array !== void 0 ? Uint8Array : Array)(str.length);
    var i;
    var il;

    for (i = 0, il = str.length; i < il; ++i) {
        array[i] = str.charCodeAt(i) & 0xff;
    }

    return array;
}
```

##### PKZIP Option

filename, comment, extraField are must use Uint8Array if enabled Typed Array.

```js
{
    filename: (Array.<number>|Uint8Array), // filename
    comment: (Array.<number>|Uint8Array), //comment
    extraField: (Array.<number>|Uint8Array), // extra field
    compress: boolean, // compress when called "addFile" method.
    compressionMethod: Zlib.Zip.CompressionMethod, // STORE or DEFLATE
    os: Zlib.Zip.OperatingSystem, // MSDOS or UNIX or MACINTOSH
    deflateOption: Object // see: ZLIB Option
}
```

### Decompression

#### Raw Deflate

```js
// compressed = Array.<number> or Uint8Array
var inflate = new Zlib.RawInflate(compressed);
var plain = inflate.decompress();
```

#### Raw Deflate Option

See ZLIB Option.

#### ZLIB

```js
// compressed = Array.<number> or Uint8Array
var inflate = new Zlib.Inflate(compressed);
var plain = inflate.decompress();
```

##### ZLIB Option

Second argument of Zlib.Inflate constructor

```js
{
    'index': number, // start position in input buffer 
    'bufferSize': number, // initial output buffer size
    'bufferType': Zlib.Inflate.BufferType, // buffer expantion type
    'resize': boolean, // resize buffer(ArrayBuffer) when end of decompression (default: false)
    'verify': boolean  // verify decompression result (default: false)
}
```

<code>Zlib.Inflate.BufferType</code> is enumerable.
Choose one <code>ADAPTIVE</code>(default) and <code>BLOCK</code>.

- <code>ADAPTIVE</code>: buffer expansion based on compression ratio in filled buffer.
- <code>BLOCK</code>: buffer expansion based on <code>BufferSize</code>.


#### GZIP

```js
// compressed = Array.<number> or Uint8Array
var gunzip = new Zlib.Gunzip(compressed);
var plain = gunzip.decompress();
```


#### PKZIP


```js
// compressed = Array.<number> or Uint8Array
var unzip = new Zlib.Unzip(compressed);
var filenames = unzip.getFilenames();
var plain = unzip.decompress(filenames[0]);
```


### Node.js

see unit tests.
<https://github.com/imaya/zlib.js/blob/master/test/node-test.js>


## Debug

If you want to know the code before compile, SourceMaps and PrettyPrint can be used.


### Source Map

If you want to use the Source Map, use `dev` version.

For example, you want to use Inflate with Source Map.

    - inflate.min.js // release version
    - inflate.dev.min.js // development version <- use this


### Pretty Print

`zlib.pretty.js` is not renamed symbol.


How to build
------------

Build using Grunt and Closure Compiler.

### Requirement

- Grunt
- Python

### Build

Use "grunt" command.

```
$ grunt [target]
```

#### Build target

target         | generate file         | implementation
---------------|-----------------------|-------------
deps           | deps.js               | (dependency: deps.js)
deflate        | deflate.min.js        | ZLIB Deflate
inflate        | inflate.min.js        | ZLIB Inflate
inflate_stream | inflate_stream.min.js | ZLIB Inflate (stream)
zlib           | zlib.min.js           | ZLIB Deflate + Inflate
gzip           | gzip.min.js           | GZIP Compression
gunzip         | gunzip.min.js         | GZIP Decompression
zlib_and_gzip  | zlib_and_gzip.min.js  | ZLIB + GZIP
node           | node-zlib.js          | ZLIB + GZIP for node.js
zip            | zip.min.js            | PKZIP Compression
unzip          | unzip.min.js          | PKZIP Decompression
all            | *                     | default target


Test
------

Unit tests are using Karma and mocha.

```
$ npm test
```

### Browser only

```
$ npm run test-karma
```

### Node.js only

```
$ npm run test-mocha
```


Issue
-----

Preset dictionary is not implemented.


License
--------

Copyright &copy; 2012 imaya.
Licensed under the MIT License.
