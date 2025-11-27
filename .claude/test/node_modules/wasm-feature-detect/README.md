# WebAssembly Feature Detection

A small library to detect which features of WebAssembly are supported.

- ✅ Runs in browsers, Node and Deno
- ✅ Tree-shakable (only bundle the detectors you use)
- ✅ Provided as an ES6, CommonJS and UMD module.
- ✅ CSP compatible
- ✅ All detectors add up to only ~970B gzipped

## Installation

```
npm install -g wasm-feature-detect
```

## Usage

```html
<script type="module">
	import { simd } from "wasm-feature-detect";

	if (await simd()) {
		/* SIMD support */
	} else {
		/* No SIMD support */
	}
</script>
```

### Hotlinking from Unpkg

```html
<script type="module">
	import { simd } from "https://unpkg.com/wasm-feature-detect?module";
	// ...
</script>
```

If required, there’s also a UMD version

```html
<script src="https://unpkg.com/wasm-feature-detect/dist/umd/index.js"></script>
<script>
	if (await wasmFeatureDetect.simd()) {
	  // ...
	}
</script>
```

## Detectors

All detectors return a `Promise<bool>`.

| Function                    | Proposal                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `bigInt()`                  | [BigInt integration](https://github.com/WebAssembly/JS-BigInt-integration)                                   |
| `bulkMemory()`              | [Bulk memory operations](https://github.com/webassembly/bulk-memory-operations)                              |
| `exceptions()`              | [Legacy Exception Handling](https://github.com/WebAssembly/exception-handling)                               |
| `exceptionsFinal()`         | [Exception Handling with exnref](https://github.com/WebAssembly/exception-handling)                          |
| `extendedConst()`           | [Extented Const Expressesions](https://github.com/WebAssembly/extended-const)                                |
| `gc()`                      | [Garbage Collection](https://github.com/WebAssembly/gc)                                                      |
| `jsStringBuiltins()`        | [JS String Builtins Proposal for WebAssembly](https://github.com/WebAssembly/js-string-builtins)             |
| `jspi()`                    | [JavaScript Promise Integration](https://github.com/WebAssembly/js-promise-integration)                      |
| `memory64()`                | [Memory64](https://github.com/WebAssembly/memory64)                                                          |
| `multiMemory()`             | [Multiple Memories](https://github.com/WebAssembly/multi-memory)                                             |
| `multiValue()`              | [Multi-value](https://github.com/WebAssembly/multi-value)                                                    |
| `mutableGlobals()`          | [Importable/Exportable mutable globals]()                                                                    |
| `referenceTypes()`          | [Reference Types](https://github.com/WebAssembly/reference-types)                                            |
| `relaxedSimd()`             | [Relaxed SIMD](https://github.com/webassembly/relaxed-simd)                                                  |
| `saturatedFloatToInt()`     | [Non-trapping float-to-int conversions](https://github.com/WebAssembly/nontrapping-float-to-int-conversions) |
| `signExtensions()`          | [Sign-extension operators](https://github.com/WebAssembly/sign-extension-ops)                                |
| `simd()`                    | [Fixed-Width SIMD](https://github.com/webassembly/simd)                                                      |
| `streamingCompilation()`    | [Streaming Compilation](https://webassembly.github.io/spec/web-api/index.html#streaming-modules)             |
| `tailCall()`                | [Tail call](https://github.com/webassembly/tail-call)                                                        |
| `threads()`                 | [Threads](https://github.com/webassembly/threads)                                                            |
| `typeReflection()`          | [Type Reflection](https://github.com/WebAssembly/js-types)                                                   |
| `typedFunctionReferences()` | [Typed function references](https://github.com/WebAssembly/function-references)                              |

## Why are all the tests async?

The _technical_ reason is that some tests might have to be augmented to be asynchronous in the future. For example, Firefox is planning to [make a change][ff coop] that would require a `postMessage` call to detect SABs, which are required for threads.

The _other_ reason is that you _should_ be using `WebAssembly.compile`, `WebAssembly.instantiate`, or their streaming versions `WebAssembly.compileStreaming` and `WebAssembly.instantiateStreaming`, which are all asynchronous. You should already be prepared for asynchronous code when using WebAssembly!

## Contributing

If you want to contribute a new feature test, all you need to do is create a new folder in `src/detectors` and it will be automatically picked up. The folder may contain a `module.wat` file, which will be compiled using [`wabt.js`](https://github.com/AssemblyScript/wabt.js).

```wat
;; Name: <Name of the feature for the README>
;; Proposal: <Link to the proposal’s explainer/repo>
;; Features: <Space-separated list of WasmFeatures from wabt.js>

(module
  ;; More WAT code here
)
```

The folder can also contain an optional `index.js` file, whose default export must be an async function. This function can do additional testing in JavaScript and must return a boolean. See the “threads” detector as an example.
It must contain at least one of `module.wat` or `index.js`.

[ff coop]: https://groups.google.com/forum/#!msg/mozilla.dev.platform/IHkBZlHETpA/dwsMNchWEQAJ
[wat2wasm]: https://github.com/webassembly/wabt

---

License Apache-2.0
