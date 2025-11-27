zlib.js
=======

[![Build Status](https://travis-ci.org/imaya/zlib.js.png?branch=master)](https://travis-ci.org/imaya/zlib.js)

[English version](./README.en.md)

zlib.js は ZLIB(RFC1950), DEFLATE(RFC1951), GZIP(RFC1952), PKZIP の JavaScript 実装です。


使い方
------

zlib.js は必要な機能ごとに分割されています。
bin ディレクトリから必要なものを利用してください。

- zlib_and_gzip.min.js: ZLIB + GZIP
    + (Raw)
        * rawdeflate.js: Raw Deflate
        * raw.js: Raw Inflate
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


### 圧縮 (Compress)

#### Raw Deflate

```js
// plain = Array.<number> or Uint8Array
var deflate = new Zlib.RawDeflate(plain);
var compressed = deflate.compress();
```

#### Raw Deflate Option

ZLIB Option を参照してください。


#### ZLIB

```js
// plain = Array.<number> or Uint8Array
var deflate = new Zlib.Deflate(plain);
var compressed = deflate.compress();
```

##### ZLIB Option

<code>Zlib.Deflate</code> の第二引数にオブジェクトを渡す事で圧縮オプションを指定する事が出来ます。

```js
{
    compressionType: Zlib.Deflate.CompressionType, // 圧縮タイプ
    lazy: number // lazy matching の閾値
}
```

<code>Zlib.Deflate.CompressionType</code> は
<code>NONE</code>(無圧縮), <code>FIXED</code>(固定ハフマン符号), <code>DYNAMIC</code>(動的ハフマン符号) から選択する事ができます。
default は <code>DYNAMIC</code> です。

<code>lazy</code> は Lazy Matching の閾値を指定します。
Lazy Matching とは、LZSS のマッチ長が閾値より低かった場合、次の Byte から LZSS の最長一致を試み、マッチ長の長い方を選択する手法です。


#### GZIP

GZIP の実装は現在不完全ですが、ただの圧縮コンテナとして使用する場合には特に問題はありません。
zlib.js を用いて作成された GZIP の OS は、自動的に UNKNOWN に設定されます。

```js
// plain = Array.<number> or Uint8Array
var gzip = new Zlib.Gzip(plain);
var compressed = gzip.compress();
```


##### GZIP Option

```js
{
    deflateOptions: Object, // deflate option (ZLIB Option 参照)
    flags: {
        fname: boolean, // ファイル名を使用するか
        comment: boolean, // コメントを使用するか
        fhcrc: boolean // FHCRC を使用するか
    },
    filename: string, // flags.fname が true のときに書き込むファイル名
    comment: string // flags.comment が true のときに書き込むコメント
}
```


#### PKZIP

PKZIP では複数のファイルを扱うため、他のものとは少し使い方が異なります。

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

filename, comment, extraField は Typed Array が使用可能な場合は必ず Uint8Array を使用してください。

```js
{
    filename: (Array.<number>|Uint8Array), // ファイル名
    comment: (Array.<number>|Uint8Array), // コメント
    extraField: (Array.<number>|Uint8Array), // その他の領域
    compress: boolean, // addFile メソッドを呼んだときに圧縮するか (通常は compress メソッドの呼び出し時に圧縮)
    compressionMethod: Zlib.Zip.CompressionMethod, // STORE or DEFLATE
    os: Zlib.Zip.OperatingSystem, // MSDOS or UNIX or MACINTOSH
    deflateOption: Object // see: ZLIB Option
}
```

### 伸張 (Decompress)

圧縮されたデータの伸張は、基本的に各コンストラクタに圧縮されたデータを渡し、
それの <code>decompress</code> メソッドを呼ぶ事で伸張処理を開始する事が出来ます。

#### Raw Deflate

```js
// compressed = Array.<number> or Uint8Array
var inflate = new Zlib.RawInflate(compressed);
var plain = inflate.decompress();
```

#### Raw Deflate Option

ZLIB Option を参照してください。

#### ZLIB

```js
// compressed = Array.<number> or Uint8Array
var inflate = new Zlib.Inflate(compressed);
var plain = inflate.decompress();
```

##### ZLIB Option

<code>Zlib.Inflate</code> の第二引数にオブジェクトを渡す事で伸張オプションを指定する事ができます。

```js
{
    'index': number, // 入力バッファの開始位置
    'bufferSize': number, // 出力バッファの初期サイズ
    'bufferType': Zlib.Inflate.BufferType, // バッファの管理方法
    'resize': boolean, // 出力バッファのリサイズ
    'verify': boolean  // 伸張結果の検証を行うか
}
```

<code>Zlib.Inflate.BufferType</code> は <code>ADAPTIVE</code>(default) か <code>BLOCK</code> を選択する事ができます。

- <code>ADAPTIVE</code> はバッファを伸張後のサイズを予測して一気に拡張しますが、データによっては余分にメモリを使用しすぎる事があります。
- <code>BLOCK</code> では <code>BufferSize</code> ずつ拡張していきますが、動作はあまり速くありません。

<code>resize</code> オプションは Typed Array 利用可能時
<code>decompress</code> メソッドで返却する値の <code>ArrayBuffer</code> を <code>Uint8Array</code> の長さまで縮小させます。
default は <code>false</code> です。

<code>verify</code> オプションは Adler-32 Checksum の検証を行うかを指定します。
default は <code>false</code> です。


#### GZIP

```js
// compressed = Array.<number> or Uint8Array
var gunzip = new Zlib.Gunzip(compressed);
var plain = gunzip.decompress();
```

Gunzip のオプションは現在ありません。


#### PKZIP

PKZIP の構築と同様に複数ファイルを扱うため、他のものとは少し使い方が異なります。

```js
// compressed = Array.<number> or Uint8Array
var unzip = new Zlib.Unzip(compressed);
var filenames = unzip.getFilenames();
var plain = unzip.decompress(filenames[0]);
```

Unzip のオプションは現在ありません。


### Node.js

Node.js で使用する場合はユニットテストを参照してください。
<https://github.com/imaya/zlib.js/blob/master/test/node-test.js>


## Debug

zlib.js では JavaScript ファイルを minify された形で提供していますが、開発中やデバッグ時に minify する前の状態が知りたい事があります。
そういった時のために SourceMaps ファイルや Pretty Print されたファイルも提供しています。


### Source Map

Source Map を使いたい場合はファイル名に `dev` のついたバージョンを使います。
例えば Source Map を有効にした Inflate を使いたい場合は以下になります。

    - inflate.min.js // リリースバージョン
    - inflate.dev.min.js // 開発バージョン（これを使う）


### Pretty Print

SourceMaps とは異なりますが、minify の変数名の短縮のみ避けられれば良いという場合には、 Closure Compiler で読みやすくしたファイルを利用することも可能です。
`zlib.pretty.js` というファイル名で全ての実装がはいっていますので、minify されたものをこのファイルに置き換えるだけで使用できます。



How to build
------------

ビルドは Grunt と Closure Compiler を使用して行います。

### 必要な環境

- Grunt
- Python

### ビルド

Grunt を使ってビルドを行います。

```
$ grunt [target]
```

#### ビルドターゲット

target         | ファイル名             | 含まれる実装
---------------|-----------------------|-------------
deps           | deps.js               | 依存関係の解決
deflate        | deflate.min.js        | ZLIB Deflate
inflate        | inflate.min.js        | ZLIB Inflate
inflate_stream | inlfate_stream.min.js | ZLIB Inlate (stream)
zlib           | zlib.min.js           | ZLIB Deflate + Inflate
gzip           | gzip.min.js           | GZIP Compression
gunzip         | gunzip.min.js         | GZIP Decompression
zlib_and_gzip  | zlib_and_gzip.min.js  | ZLIB + GZIP
node           | node-zlib.js          | ZLIB + GZIP for node.js
zip            | zip.min.js            | PKZIP Compression
unzip          | unzip.min.js          | PKZIP Decompression
all            | *                     | default target


テスト
------

ブラウザでは Karma, Node.js では mocha を使ってテストを行います。

```
$ npm test
```

### ブラウザのみのテスト

```
$ npm run test-karma
```

### Node.js のみのテスト

```
$ npm run test-mocha
```


Issue
-----

現在プリセット辞書を用いた圧縮形式には対応していません。
プリセット辞書は通常の圧縮では利用されないため、影響は少ないと思います。


ライセンス
-----------

Copyright &copy; 2012 imaya.
Licensed under the MIT License.
