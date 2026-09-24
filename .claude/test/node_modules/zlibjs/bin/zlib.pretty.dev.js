/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.DEBUG = true;
goog.LOCALE = "en";
goog.provide = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while(namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if(goog.getObjectByName(namespace)) {
        break
      }
      goog.implicitNamespaces_[namespace] = true
    }
  }
  goog.exportPath_(name)
};
goog.setTestOnly = function(opt_message) {
  if(COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
if(!COMPILED) {
  goog.isProvided_ = function(name) {
    return!goog.implicitNamespaces_[name] && !!goog.getObjectByName(name)
  };
  goog.implicitNamespaces_ = {}
}
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if(!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0])
  }
  for(var part;parts.length && (part = parts.shift());) {
    if(!parts.length && goog.isDef(opt_object)) {
      cur[part] = opt_object
    }else {
      if(cur[part]) {
        cur = cur[part]
      }else {
        cur = cur[part] = {}
      }
    }
  }
};
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for(var part;part = parts.shift();) {
    if(goog.isDefAndNotNull(cur[part])) {
      cur = cur[part]
    }else {
      return null
    }
  }
  return cur
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for(var x in obj) {
    global[x] = obj[x]
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if(!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for(var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if(!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {}
      }
      deps.pathToNames[path][provide] = true
    }
    for(var j = 0;require = requires[j];j++) {
      if(!(path in deps.requires)) {
        deps.requires[path] = {}
      }
      deps.requires[path][require] = true
    }
  }
};
goog.ENABLE_DEBUG_LOADER = true;
goog.require = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      return
    }
    if(goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if(path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    if(goog.global.console) {
      goog.global.console["error"](errorMessage)
    }
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if(ctor.instance_) {
      return ctor.instance_
    }
    if(goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor
    }
    return ctor.instance_ = new ctor
  }
};
goog.instantiatedSingletons_ = [];
if(!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc
  };
  goog.findBasePath_ = function() {
    if(goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return
    }else {
      if(!goog.inHtmlDocument_()) {
        return
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for(var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if(src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if(!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true
    }
  };
  goog.writeScriptTag_ = function(src) {
    if(goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true
    }else {
      return false
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if(path in deps.written) {
        return
      }
      if(path in deps.visited) {
        if(!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path)
        }
        return
      }
      deps.visited[path] = true;
      if(path in deps.requires) {
        for(var requireName in deps.requires[path]) {
          if(!goog.isProvided_(requireName)) {
            if(requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName])
            }else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if(!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path)
      }
    }
    for(var path in goog.included_) {
      if(!deps.written[path]) {
        visitNode(path)
      }
    }
    for(var i = 0;i < scripts.length;i++) {
      if(scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i])
      }else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if(rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule]
    }else {
      return null
    }
  };
  goog.findBasePath_();
  if(!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js")
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if(s == "object") {
    if(value) {
      if(value instanceof Array) {
        return"array"
      }else {
        if(value instanceof Object) {
          return s
        }
      }
      var className = Object.prototype.toString.call((value));
      if(className == "[object Window]") {
        return"object"
      }
      if(className == "[object Array]" || typeof value.length == "number" && typeof value.splice != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")) {
        return"array"
      }
      if(className == "[object Function]" || typeof value.call != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if(s == "function" && typeof value.call == "undefined") {
      return"object"
    }
  }
  return s
};
goog.isDef = function(val) {
  return val !== undefined
};
goog.isNull = function(val) {
  return val === null
};
goog.isDefAndNotNull = function(val) {
  return val != null
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array"
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number"
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function"
};
goog.isString = function(val) {
  return typeof val == "string"
};
goog.isBoolean = function(val) {
  return typeof val == "boolean"
};
goog.isNumber = function(val) {
  return typeof val == "number"
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function"
};
goog.isObject = function(val) {
  var type = typeof val;
  return type == "object" && val != null || type == "function"
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.removeUid = function(obj) {
  if("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_)
  }
  try {
    delete obj[goog.UID_PROPERTY_]
  }catch(ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + Math.floor(Math.random() * 2147483648).toString(36);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.cloneObject(obj[key])
    }
    return clone
  }
  return obj
};
Object.prototype.clone;
goog.bindNative_ = function(fn, selfObj, var_args) {
  return(fn.call.apply(fn.bind, arguments))
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if(!fn) {
    throw new Error;
  }
  if(arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs)
    }
  }else {
    return function() {
      return fn.apply(selfObj, arguments)
    }
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if(Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_
  }else {
    goog.bind = goog.bindJs_
  }
  return goog.bind.apply(null, arguments)
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs)
  }
};
goog.mixin = function(target, source) {
  for(var x in source) {
    target[x] = source[x]
  }
};
goog.now = Date.now || function() {
  return+new Date
};
goog.globalEval = function(script) {
  if(goog.global.execScript) {
    goog.global.execScript(script, "JavaScript")
  }else {
    if(goog.global.eval) {
      if(goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if(typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true
        }else {
          goog.evalWorksForGlobals_ = false
        }
      }
      if(goog.evalWorksForGlobals_) {
        goog.global.eval(script)
      }else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt)
      }
    }else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for(var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]))
    }
    return mapped.join("-")
  };
  var rename;
  if(goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts
  }else {
    rename = function(a) {
      return a
    }
  }
  if(opt_modifier) {
    return className + "-" + rename(opt_modifier)
  }else {
    return rename(className)
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if(!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for(var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value)
  }
  return str
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo)
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if(caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1))
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for(var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if(ctor.prototype[opt_methodName] === caller) {
      foundCaller = true
    }else {
      if(foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args)
      }
    }
  }
  if(me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args)
  }else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global)
};
goog.provide("USE_TYPEDARRAY");
var USE_TYPEDARRAY = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Uint32Array !== "undefined" && typeof DataView !== "undefined";
goog.provide("Zlib.BitStream");
goog.require("USE_TYPEDARRAY");
goog.scope(function() {
  Zlib.BitStream = function(buffer, bufferPosition) {
    this.index = typeof bufferPosition === "number" ? bufferPosition : 0;
    this.bitindex = 0;
    this.buffer = buffer instanceof (USE_TYPEDARRAY ? Uint8Array : Array) ? buffer : new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.BitStream.DefaultBlockSize);
    if(this.buffer.length * 2 <= this.index) {
      throw new Error("invalid index");
    }else {
      if(this.buffer.length <= this.index) {
        this.expandBuffer()
      }
    }
  };
  Zlib.BitStream.DefaultBlockSize = 32768;
  Zlib.BitStream.prototype.expandBuffer = function() {
    var oldbuf = this.buffer;
    var i;
    var il = oldbuf.length;
    var buffer = new (USE_TYPEDARRAY ? Uint8Array : Array)(il << 1);
    if(USE_TYPEDARRAY) {
      buffer.set(oldbuf)
    }else {
      for(i = 0;i < il;++i) {
        buffer[i] = oldbuf[i]
      }
    }
    return this.buffer = buffer
  };
  Zlib.BitStream.prototype.writeBits = function(number, n, reverse) {
    var buffer = this.buffer;
    var index = this.index;
    var bitindex = this.bitindex;
    var current = buffer[index];
    var i;
    function rev32_(n) {
      return Zlib.BitStream.ReverseTable[n & 255] << 24 | Zlib.BitStream.ReverseTable[n >>> 8 & 255] << 16 | Zlib.BitStream.ReverseTable[n >>> 16 & 255] << 8 | Zlib.BitStream.ReverseTable[n >>> 24 & 255]
    }
    if(reverse && n > 1) {
      number = n > 8 ? rev32_(number) >> 32 - n : Zlib.BitStream.ReverseTable[number] >> 8 - n
    }
    if(n + bitindex < 8) {
      current = current << n | number;
      bitindex += n
    }else {
      for(i = 0;i < n;++i) {
        current = current << 1 | number >> n - i - 1 & 1;
        if(++bitindex === 8) {
          bitindex = 0;
          buffer[index++] = Zlib.BitStream.ReverseTable[current];
          current = 0;
          if(index === buffer.length) {
            buffer = this.expandBuffer()
          }
        }
      }
    }
    buffer[index] = current;
    this.buffer = buffer;
    this.bitindex = bitindex;
    this.index = index
  };
  Zlib.BitStream.prototype.finish = function() {
    var buffer = this.buffer;
    var index = this.index;
    var output;
    if(this.bitindex > 0) {
      buffer[index] <<= 8 - this.bitindex;
      buffer[index] = Zlib.BitStream.ReverseTable[buffer[index]];
      index++
    }
    if(USE_TYPEDARRAY) {
      output = buffer.subarray(0, index)
    }else {
      buffer.length = index;
      output = buffer
    }
    return output
  };
  Zlib.BitStream.ReverseTable = function(table) {
    return table
  }(function() {
    var table = new (USE_TYPEDARRAY ? Uint8Array : Array)(256);
    var i;
    for(i = 0;i < 256;++i) {
      table[i] = function(n) {
        var r = n;
        var s = 7;
        for(n >>>= 1;n;n >>>= 1) {
          r <<= 1;
          r |= n & 1;
          --s
        }
        return(r << s & 255) >>> 0
      }(i)
    }
    return table
  }())
});
goog.provide("Zlib.CRC32");
goog.require("USE_TYPEDARRAY");
var ZLIB_CRC32_COMPACT = false;
goog.scope(function() {
  Zlib.CRC32.calc = function(data, pos, length) {
    return Zlib.CRC32.update(data, 0, pos, length)
  };
  Zlib.CRC32.update = function(data, crc, pos, length) {
    var table = Zlib.CRC32.Table;
    var i = typeof pos === "number" ? pos : pos = 0;
    var il = typeof length === "number" ? length : data.length;
    crc ^= 4294967295;
    for(i = il & 7;i--;++pos) {
      crc = crc >>> 8 ^ table[(crc ^ data[pos]) & 255]
    }
    for(i = il >> 3;i--;pos += 8) {
      crc = crc >>> 8 ^ table[(crc ^ data[pos]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 1]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 2]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 3]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 4]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 5]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 6]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 7]) & 255]
    }
    return(crc ^ 4294967295) >>> 0
  };
  Zlib.CRC32.single = function(num, crc) {
    return(Zlib.CRC32.Table[(num ^ crc) & 255] ^ num >>> 8) >>> 0
  };
  Zlib.CRC32.Table_ = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 
  3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 
  453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 
  3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 
  1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 
  1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918E3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117];
  Zlib.CRC32.Table = ZLIB_CRC32_COMPACT ? function() {
    var table = new (USE_TYPEDARRAY ? Uint32Array : Array)(256);
    var c;
    var i;
    var j;
    for(i = 0;i < 256;++i) {
      c = i;
      for(j = 0;j < 8;++j) {
        c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1
      }
      table[i] = c >>> 0
    }
    return table
  }() : USE_TYPEDARRAY ? new Uint32Array(Zlib.CRC32.Table_) : Zlib.CRC32.Table_
});
goog.provide("FixPhantomJSFunctionApplyBug_StringFromCharCode");
if(goog.global["Uint8Array"] !== void 0) {
  try {
    eval("String.fromCharCode.apply(null, new Uint8Array([0]));")
  }catch(e) {
    String.fromCharCode.apply = function(fromCharCodeApply) {
      return function(thisobj, args) {
        return fromCharCodeApply.call(String.fromCharCode, thisobj, Array.prototype.slice.call(args))
      }
    }(String.fromCharCode.apply)
  }
}
;goog.provide("Zlib.GunzipMember");
goog.scope(function() {
  Zlib.GunzipMember = function() {
    this.id1;
    this.id2;
    this.cm;
    this.flg;
    this.mtime;
    this.xfl;
    this.os;
    this.crc16;
    this.xlen;
    this.crc32;
    this.isize;
    this.name;
    this.comment;
    this.data
  };
  Zlib.GunzipMember.prototype.getName = function() {
    return this.name
  };
  Zlib.GunzipMember.prototype.getData = function() {
    return this.data
  };
  Zlib.GunzipMember.prototype.getMtime = function() {
    return this.mtime
  }
});
goog.provide("Zlib.Heap");
goog.require("USE_TYPEDARRAY");
goog.scope(function() {
  Zlib.Heap = function(length) {
    this.buffer = new (USE_TYPEDARRAY ? Uint16Array : Array)(length * 2);
    this.length = 0
  };
  Zlib.Heap.prototype.getParent = function(index) {
    return((index - 2) / 4 | 0) * 2
  };
  Zlib.Heap.prototype.getChild = function(index) {
    return 2 * index + 2
  };
  Zlib.Heap.prototype.push = function(index, value) {
    var current, parent, heap = this.buffer, swap;
    current = this.length;
    heap[this.length++] = value;
    heap[this.length++] = index;
    while(current > 0) {
      parent = this.getParent(current);
      if(heap[current] > heap[parent]) {
        swap = heap[current];
        heap[current] = heap[parent];
        heap[parent] = swap;
        swap = heap[current + 1];
        heap[current + 1] = heap[parent + 1];
        heap[parent + 1] = swap;
        current = parent
      }else {
        break
      }
    }
    return this.length
  };
  Zlib.Heap.prototype.pop = function() {
    var index, value, heap = this.buffer, swap, current, parent;
    value = heap[0];
    index = heap[1];
    this.length -= 2;
    heap[0] = heap[this.length];
    heap[1] = heap[this.length + 1];
    parent = 0;
    while(true) {
      current = this.getChild(parent);
      if(current >= this.length) {
        break
      }
      if(current + 2 < this.length && heap[current + 2] > heap[current]) {
        current += 2
      }
      if(heap[current] > heap[parent]) {
        swap = heap[parent];
        heap[parent] = heap[current];
        heap[current] = swap;
        swap = heap[parent + 1];
        heap[parent + 1] = heap[current + 1];
        heap[current + 1] = swap
      }else {
        break
      }
      parent = current
    }
    return{index:index, value:value, length:this.length}
  }
});
goog.provide("Zlib.Huffman");
goog.require("USE_TYPEDARRAY");
goog.scope(function() {
  Zlib.Huffman.buildHuffmanTable = function(lengths) {
    var listSize = lengths.length;
    var maxCodeLength = 0;
    var minCodeLength = Number.POSITIVE_INFINITY;
    var size;
    var table;
    var bitLength;
    var code;
    var skip;
    var reversed;
    var rtemp;
    var i;
    var il;
    var j;
    var value;
    for(i = 0, il = listSize;i < il;++i) {
      if(lengths[i] > maxCodeLength) {
        maxCodeLength = lengths[i]
      }
      if(lengths[i] < minCodeLength) {
        minCodeLength = lengths[i]
      }
    }
    size = 1 << maxCodeLength;
    table = new (USE_TYPEDARRAY ? Uint32Array : Array)(size);
    for(bitLength = 1, code = 0, skip = 2;bitLength <= maxCodeLength;) {
      for(i = 0;i < listSize;++i) {
        if(lengths[i] === bitLength) {
          for(reversed = 0, rtemp = code, j = 0;j < bitLength;++j) {
            reversed = reversed << 1 | rtemp & 1;
            rtemp >>= 1
          }
          value = bitLength << 16 | i;
          for(j = reversed;j < size;j += skip) {
            table[j] = value
          }
          ++code
        }
      }
      ++bitLength;
      code <<= 1;
      skip <<= 1
    }
    return[table, maxCodeLength, minCodeLength]
  }
});
goog.provide("Zlib.RawDeflate");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.BitStream");
goog.require("Zlib.Heap");
goog.scope(function() {
  Zlib.RawDeflate = function(input, opt_params) {
    this.compressionType = Zlib.RawDeflate.CompressionType.DYNAMIC;
    this.lazy = 0;
    this.freqsLitLen;
    this.freqsDist;
    this.input = USE_TYPEDARRAY && input instanceof Array ? new Uint8Array(input) : input;
    this.output;
    this.op = 0;
    if(opt_params) {
      if(opt_params["lazy"]) {
        this.lazy = opt_params["lazy"]
      }
      if(typeof opt_params["compressionType"] === "number") {
        this.compressionType = opt_params["compressionType"]
      }
      if(opt_params["outputBuffer"]) {
        this.output = USE_TYPEDARRAY && opt_params["outputBuffer"] instanceof Array ? new Uint8Array(opt_params["outputBuffer"]) : opt_params["outputBuffer"]
      }
      if(typeof opt_params["outputIndex"] === "number") {
        this.op = opt_params["outputIndex"]
      }
    }
    if(!this.output) {
      this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(32768)
    }
  };
  Zlib.RawDeflate.CompressionType = {NONE:0, FIXED:1, DYNAMIC:2, RESERVED:3};
  Zlib.RawDeflate.Lz77MinLength = 3;
  Zlib.RawDeflate.Lz77MaxLength = 258;
  Zlib.RawDeflate.WindowSize = 32768;
  Zlib.RawDeflate.MaxCodeLength = 16;
  Zlib.RawDeflate.HUFMAX = 286;
  Zlib.RawDeflate.FixedHuffmanTable = function() {
    var table = [], i;
    for(i = 0;i < 288;i++) {
      switch(true) {
        case i <= 143:
          table.push([i + 48, 8]);
          break;
        case i <= 255:
          table.push([i - 144 + 400, 9]);
          break;
        case i <= 279:
          table.push([i - 256 + 0, 7]);
          break;
        case i <= 287:
          table.push([i - 280 + 192, 8]);
          break;
        default:
          throw"invalid literal: " + i;
      }
    }
    return table
  }();
  Zlib.RawDeflate.prototype.compress = function() {
    var blockArray;
    var position;
    var length;
    var input = this.input;
    switch(this.compressionType) {
      case Zlib.RawDeflate.CompressionType.NONE:
        for(position = 0, length = input.length;position < length;) {
          blockArray = USE_TYPEDARRAY ? input.subarray(position, position + 65535) : input.slice(position, position + 65535);
          position += blockArray.length;
          this.makeNocompressBlock(blockArray, position === length)
        }
        break;
      case Zlib.RawDeflate.CompressionType.FIXED:
        this.output = this.makeFixedHuffmanBlock(input, true);
        this.op = this.output.length;
        break;
      case Zlib.RawDeflate.CompressionType.DYNAMIC:
        this.output = this.makeDynamicHuffmanBlock(input, true);
        this.op = this.output.length;
        break;
      default:
        throw"invalid compression type";
    }
    return this.output
  };
  Zlib.RawDeflate.prototype.makeNocompressBlock = function(blockArray, isFinalBlock) {
    var bfinal;
    var btype;
    var len;
    var nlen;
    var i;
    var il;
    var output = this.output;
    var op = this.op;
    if(USE_TYPEDARRAY) {
      output = new Uint8Array(this.output.buffer);
      while(output.length <= op + blockArray.length + 5) {
        output = new Uint8Array(output.length << 1)
      }
      output.set(this.output)
    }
    bfinal = isFinalBlock ? 1 : 0;
    btype = Zlib.RawDeflate.CompressionType.NONE;
    output[op++] = bfinal | btype << 1;
    len = blockArray.length;
    nlen = ~len + 65536 & 65535;
    output[op++] = len & 255;
    output[op++] = len >>> 8 & 255;
    output[op++] = nlen & 255;
    output[op++] = nlen >>> 8 & 255;
    if(USE_TYPEDARRAY) {
      output.set(blockArray, op);
      op += blockArray.length;
      output = output.subarray(0, op)
    }else {
      for(i = 0, il = blockArray.length;i < il;++i) {
        output[op++] = blockArray[i]
      }
      output.length = op
    }
    this.op = op;
    this.output = output;
    return output
  };
  Zlib.RawDeflate.prototype.makeFixedHuffmanBlock = function(blockArray, isFinalBlock) {
    var stream = new Zlib.BitStream(USE_TYPEDARRAY ? new Uint8Array(this.output.buffer) : this.output, this.op);
    var bfinal;
    var btype;
    var data;
    bfinal = isFinalBlock ? 1 : 0;
    btype = Zlib.RawDeflate.CompressionType.FIXED;
    stream.writeBits(bfinal, 1, true);
    stream.writeBits(btype, 2, true);
    data = this.lz77(blockArray);
    this.fixedHuffman(data, stream);
    return stream.finish()
  };
  Zlib.RawDeflate.prototype.makeDynamicHuffmanBlock = function(blockArray, isFinalBlock) {
    var stream = new Zlib.BitStream(USE_TYPEDARRAY ? new Uint8Array(this.output.buffer) : this.output, this.op);
    var bfinal;
    var btype;
    var data;
    var hlit;
    var hdist;
    var hclen;
    var hclenOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var litLenLengths;
    var litLenCodes;
    var distLengths;
    var distCodes;
    var treeSymbols;
    var treeLengths;
    var transLengths = new Array(19);
    var treeCodes;
    var code;
    var bitlen;
    var i;
    var il;
    bfinal = isFinalBlock ? 1 : 0;
    btype = Zlib.RawDeflate.CompressionType.DYNAMIC;
    stream.writeBits(bfinal, 1, true);
    stream.writeBits(btype, 2, true);
    data = this.lz77(blockArray);
    litLenLengths = this.getLengths_(this.freqsLitLen, 15);
    litLenCodes = this.getCodesFromLengths_(litLenLengths);
    distLengths = this.getLengths_(this.freqsDist, 7);
    distCodes = this.getCodesFromLengths_(distLengths);
    for(hlit = 286;hlit > 257 && litLenLengths[hlit - 1] === 0;hlit--) {
    }
    for(hdist = 30;hdist > 1 && distLengths[hdist - 1] === 0;hdist--) {
    }
    treeSymbols = this.getTreeSymbols_(hlit, litLenLengths, hdist, distLengths);
    treeLengths = this.getLengths_(treeSymbols.freqs, 7);
    for(i = 0;i < 19;i++) {
      transLengths[i] = treeLengths[hclenOrder[i]]
    }
    for(hclen = 19;hclen > 4 && transLengths[hclen - 1] === 0;hclen--) {
    }
    treeCodes = this.getCodesFromLengths_(treeLengths);
    stream.writeBits(hlit - 257, 5, true);
    stream.writeBits(hdist - 1, 5, true);
    stream.writeBits(hclen - 4, 4, true);
    for(i = 0;i < hclen;i++) {
      stream.writeBits(transLengths[i], 3, true)
    }
    for(i = 0, il = treeSymbols.codes.length;i < il;i++) {
      code = treeSymbols.codes[i];
      stream.writeBits(treeCodes[code], treeLengths[code], true);
      if(code >= 16) {
        i++;
        switch(code) {
          case 16:
            bitlen = 2;
            break;
          case 17:
            bitlen = 3;
            break;
          case 18:
            bitlen = 7;
            break;
          default:
            throw"invalid code: " + code;
        }
        stream.writeBits(treeSymbols.codes[i], bitlen, true)
      }
    }
    this.dynamicHuffman(data, [litLenCodes, litLenLengths], [distCodes, distLengths], stream);
    return stream.finish()
  };
  Zlib.RawDeflate.prototype.dynamicHuffman = function(dataArray, litLen, dist, stream) {
    var index;
    var length;
    var literal;
    var code;
    var litLenCodes;
    var litLenLengths;
    var distCodes;
    var distLengths;
    litLenCodes = litLen[0];
    litLenLengths = litLen[1];
    distCodes = dist[0];
    distLengths = dist[1];
    for(index = 0, length = dataArray.length;index < length;++index) {
      literal = dataArray[index];
      stream.writeBits(litLenCodes[literal], litLenLengths[literal], true);
      if(literal > 256) {
        stream.writeBits(dataArray[++index], dataArray[++index], true);
        code = dataArray[++index];
        stream.writeBits(distCodes[code], distLengths[code], true);
        stream.writeBits(dataArray[++index], dataArray[++index], true)
      }else {
        if(literal === 256) {
          break
        }
      }
    }
    return stream
  };
  Zlib.RawDeflate.prototype.fixedHuffman = function(dataArray, stream) {
    var index;
    var length;
    var literal;
    for(index = 0, length = dataArray.length;index < length;index++) {
      literal = dataArray[index];
      Zlib.BitStream.prototype.writeBits.apply(stream, Zlib.RawDeflate.FixedHuffmanTable[literal]);
      if(literal > 256) {
        stream.writeBits(dataArray[++index], dataArray[++index], true);
        stream.writeBits(dataArray[++index], 5);
        stream.writeBits(dataArray[++index], dataArray[++index], true)
      }else {
        if(literal === 256) {
          break
        }
      }
    }
    return stream
  };
  Zlib.RawDeflate.Lz77Match = function(length, backwardDistance) {
    this.length = length;
    this.backwardDistance = backwardDistance
  };
  Zlib.RawDeflate.Lz77Match.LengthCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint32Array(table) : table
  }(function() {
    var table = [];
    var i;
    var c;
    for(i = 3;i <= 258;i++) {
      c = code(i);
      table[i] = c[2] << 24 | c[1] << 16 | c[0]
    }
    function code(length) {
      switch(true) {
        case length === 3:
          return[257, length - 3, 0];
          break;
        case length === 4:
          return[258, length - 4, 0];
          break;
        case length === 5:
          return[259, length - 5, 0];
          break;
        case length === 6:
          return[260, length - 6, 0];
          break;
        case length === 7:
          return[261, length - 7, 0];
          break;
        case length === 8:
          return[262, length - 8, 0];
          break;
        case length === 9:
          return[263, length - 9, 0];
          break;
        case length === 10:
          return[264, length - 10, 0];
          break;
        case length <= 12:
          return[265, length - 11, 1];
          break;
        case length <= 14:
          return[266, length - 13, 1];
          break;
        case length <= 16:
          return[267, length - 15, 1];
          break;
        case length <= 18:
          return[268, length - 17, 1];
          break;
        case length <= 22:
          return[269, length - 19, 2];
          break;
        case length <= 26:
          return[270, length - 23, 2];
          break;
        case length <= 30:
          return[271, length - 27, 2];
          break;
        case length <= 34:
          return[272, length - 31, 2];
          break;
        case length <= 42:
          return[273, length - 35, 3];
          break;
        case length <= 50:
          return[274, length - 43, 3];
          break;
        case length <= 58:
          return[275, length - 51, 3];
          break;
        case length <= 66:
          return[276, length - 59, 3];
          break;
        case length <= 82:
          return[277, length - 67, 4];
          break;
        case length <= 98:
          return[278, length - 83, 4];
          break;
        case length <= 114:
          return[279, length - 99, 4];
          break;
        case length <= 130:
          return[280, length - 115, 4];
          break;
        case length <= 162:
          return[281, length - 131, 5];
          break;
        case length <= 194:
          return[282, length - 163, 5];
          break;
        case length <= 226:
          return[283, length - 195, 5];
          break;
        case length <= 257:
          return[284, length - 227, 5];
          break;
        case length === 258:
          return[285, length - 258, 0];
          break;
        default:
          throw"invalid length: " + length;
      }
    }
    return table
  }());
  Zlib.RawDeflate.Lz77Match.prototype.getDistanceCode_ = function(dist) {
    var r;
    switch(true) {
      case dist === 1:
        r = [0, dist - 1, 0];
        break;
      case dist === 2:
        r = [1, dist - 2, 0];
        break;
      case dist === 3:
        r = [2, dist - 3, 0];
        break;
      case dist === 4:
        r = [3, dist - 4, 0];
        break;
      case dist <= 6:
        r = [4, dist - 5, 1];
        break;
      case dist <= 8:
        r = [5, dist - 7, 1];
        break;
      case dist <= 12:
        r = [6, dist - 9, 2];
        break;
      case dist <= 16:
        r = [7, dist - 13, 2];
        break;
      case dist <= 24:
        r = [8, dist - 17, 3];
        break;
      case dist <= 32:
        r = [9, dist - 25, 3];
        break;
      case dist <= 48:
        r = [10, dist - 33, 4];
        break;
      case dist <= 64:
        r = [11, dist - 49, 4];
        break;
      case dist <= 96:
        r = [12, dist - 65, 5];
        break;
      case dist <= 128:
        r = [13, dist - 97, 5];
        break;
      case dist <= 192:
        r = [14, dist - 129, 6];
        break;
      case dist <= 256:
        r = [15, dist - 193, 6];
        break;
      case dist <= 384:
        r = [16, dist - 257, 7];
        break;
      case dist <= 512:
        r = [17, dist - 385, 7];
        break;
      case dist <= 768:
        r = [18, dist - 513, 8];
        break;
      case dist <= 1024:
        r = [19, dist - 769, 8];
        break;
      case dist <= 1536:
        r = [20, dist - 1025, 9];
        break;
      case dist <= 2048:
        r = [21, dist - 1537, 9];
        break;
      case dist <= 3072:
        r = [22, dist - 2049, 10];
        break;
      case dist <= 4096:
        r = [23, dist - 3073, 10];
        break;
      case dist <= 6144:
        r = [24, dist - 4097, 11];
        break;
      case dist <= 8192:
        r = [25, dist - 6145, 11];
        break;
      case dist <= 12288:
        r = [26, dist - 8193, 12];
        break;
      case dist <= 16384:
        r = [27, dist - 12289, 12];
        break;
      case dist <= 24576:
        r = [28, dist - 16385, 13];
        break;
      case dist <= 32768:
        r = [29, dist - 24577, 13];
        break;
      default:
        throw"invalid distance";
    }
    return r
  };
  Zlib.RawDeflate.Lz77Match.prototype.toLz77Array = function() {
    var length = this.length;
    var dist = this.backwardDistance;
    var codeArray = [];
    var pos = 0;
    var code;
    code = Zlib.RawDeflate.Lz77Match.LengthCodeTable[length];
    codeArray[pos++] = code & 65535;
    codeArray[pos++] = code >> 16 & 255;
    codeArray[pos++] = code >> 24;
    code = this.getDistanceCode_(dist);
    codeArray[pos++] = code[0];
    codeArray[pos++] = code[1];
    codeArray[pos++] = code[2];
    return codeArray
  };
  Zlib.RawDeflate.prototype.lz77 = function(dataArray) {
    var position;
    var length;
    var i;
    var il;
    var matchKey;
    var table = {};
    var windowSize = Zlib.RawDeflate.WindowSize;
    var matchList;
    var longestMatch;
    var prevMatch;
    var lz77buf = USE_TYPEDARRAY ? new Uint16Array(dataArray.length * 2) : [];
    var pos = 0;
    var skipLength = 0;
    var freqsLitLen = new (USE_TYPEDARRAY ? Uint32Array : Array)(286);
    var freqsDist = new (USE_TYPEDARRAY ? Uint32Array : Array)(30);
    var lazy = this.lazy;
    var tmp;
    if(!USE_TYPEDARRAY) {
      for(i = 0;i <= 285;) {
        freqsLitLen[i++] = 0
      }
      for(i = 0;i <= 29;) {
        freqsDist[i++] = 0
      }
    }
    freqsLitLen[256] = 1;
    function writeMatch(match, offset) {
      var lz77Array = match.toLz77Array();
      var i;
      var il;
      for(i = 0, il = lz77Array.length;i < il;++i) {
        lz77buf[pos++] = lz77Array[i]
      }
      freqsLitLen[lz77Array[0]]++;
      freqsDist[lz77Array[3]]++;
      skipLength = match.length + offset - 1;
      prevMatch = null
    }
    for(position = 0, length = dataArray.length;position < length;++position) {
      for(matchKey = 0, i = 0, il = Zlib.RawDeflate.Lz77MinLength;i < il;++i) {
        if(position + i === length) {
          break
        }
        matchKey = matchKey << 8 | dataArray[position + i]
      }
      if(table[matchKey] === void 0) {
        table[matchKey] = []
      }
      matchList = table[matchKey];
      if(skipLength-- > 0) {
        matchList.push(position);
        continue
      }
      while(matchList.length > 0 && position - matchList[0] > windowSize) {
        matchList.shift()
      }
      if(position + Zlib.RawDeflate.Lz77MinLength >= length) {
        if(prevMatch) {
          writeMatch(prevMatch, -1)
        }
        for(i = 0, il = length - position;i < il;++i) {
          tmp = dataArray[position + i];
          lz77buf[pos++] = tmp;
          ++freqsLitLen[tmp]
        }
        break
      }
      if(matchList.length > 0) {
        longestMatch = this.searchLongestMatch_(dataArray, position, matchList);
        if(prevMatch) {
          if(prevMatch.length < longestMatch.length) {
            tmp = dataArray[position - 1];
            lz77buf[pos++] = tmp;
            ++freqsLitLen[tmp];
            writeMatch(longestMatch, 0)
          }else {
            writeMatch(prevMatch, -1)
          }
        }else {
          if(longestMatch.length < lazy) {
            prevMatch = longestMatch
          }else {
            writeMatch(longestMatch, 0)
          }
        }
      }else {
        if(prevMatch) {
          writeMatch(prevMatch, -1)
        }else {
          tmp = dataArray[position];
          lz77buf[pos++] = tmp;
          ++freqsLitLen[tmp]
        }
      }
      matchList.push(position)
    }
    lz77buf[pos++] = 256;
    freqsLitLen[256]++;
    this.freqsLitLen = freqsLitLen;
    this.freqsDist = freqsDist;
    return(USE_TYPEDARRAY ? lz77buf.subarray(0, pos) : lz77buf)
  };
  Zlib.RawDeflate.prototype.searchLongestMatch_ = function(data, position, matchList) {
    var match, currentMatch, matchMax = 0, matchLength, i, j, l, dl = data.length;
    permatch:for(i = 0, l = matchList.length;i < l;i++) {
      match = matchList[l - i - 1];
      matchLength = Zlib.RawDeflate.Lz77MinLength;
      if(matchMax > Zlib.RawDeflate.Lz77MinLength) {
        for(j = matchMax;j > Zlib.RawDeflate.Lz77MinLength;j--) {
          if(data[match + j - 1] !== data[position + j - 1]) {
            continue permatch
          }
        }
        matchLength = matchMax
      }
      while(matchLength < Zlib.RawDeflate.Lz77MaxLength && position + matchLength < dl && data[match + matchLength] === data[position + matchLength]) {
        ++matchLength
      }
      if(matchLength > matchMax) {
        currentMatch = match;
        matchMax = matchLength
      }
      if(matchLength === Zlib.RawDeflate.Lz77MaxLength) {
        break
      }
    }
    return new Zlib.RawDeflate.Lz77Match(matchMax, position - currentMatch)
  };
  Zlib.RawDeflate.prototype.getTreeSymbols_ = function(hlit, litlenLengths, hdist, distLengths) {
    var src = new (USE_TYPEDARRAY ? Uint32Array : Array)(hlit + hdist), i, j, runLength, l, result = new (USE_TYPEDARRAY ? Uint32Array : Array)(286 + 30), nResult, rpt, freqs = new (USE_TYPEDARRAY ? Uint8Array : Array)(19);
    j = 0;
    for(i = 0;i < hlit;i++) {
      src[j++] = litlenLengths[i]
    }
    for(i = 0;i < hdist;i++) {
      src[j++] = distLengths[i]
    }
    if(!USE_TYPEDARRAY) {
      for(i = 0, l = freqs.length;i < l;++i) {
        freqs[i] = 0
      }
    }
    nResult = 0;
    for(i = 0, l = src.length;i < l;i += j) {
      for(j = 1;i + j < l && src[i + j] === src[i];++j) {
      }
      runLength = j;
      if(src[i] === 0) {
        if(runLength < 3) {
          while(runLength-- > 0) {
            result[nResult++] = 0;
            freqs[0]++
          }
        }else {
          while(runLength > 0) {
            rpt = runLength < 138 ? runLength : 138;
            if(rpt > runLength - 3 && rpt < runLength) {
              rpt = runLength - 3
            }
            if(rpt <= 10) {
              result[nResult++] = 17;
              result[nResult++] = rpt - 3;
              freqs[17]++
            }else {
              result[nResult++] = 18;
              result[nResult++] = rpt - 11;
              freqs[18]++
            }
            runLength -= rpt
          }
        }
      }else {
        result[nResult++] = src[i];
        freqs[src[i]]++;
        runLength--;
        if(runLength < 3) {
          while(runLength-- > 0) {
            result[nResult++] = src[i];
            freqs[src[i]]++
          }
        }else {
          while(runLength > 0) {
            rpt = runLength < 6 ? runLength : 6;
            if(rpt > runLength - 3 && rpt < runLength) {
              rpt = runLength - 3
            }
            result[nResult++] = 16;
            result[nResult++] = rpt - 3;
            freqs[16]++;
            runLength -= rpt
          }
        }
      }
    }
    return{codes:USE_TYPEDARRAY ? result.subarray(0, nResult) : result.slice(0, nResult), freqs:freqs}
  };
  Zlib.RawDeflate.prototype.getLengths_ = function(freqs, limit) {
    var nSymbols = freqs.length;
    var heap = new Zlib.Heap(2 * Zlib.RawDeflate.HUFMAX);
    var length = new (USE_TYPEDARRAY ? Uint8Array : Array)(nSymbols);
    var nodes;
    var values;
    var codeLength;
    var i;
    var il;
    if(!USE_TYPEDARRAY) {
      for(i = 0;i < nSymbols;i++) {
        length[i] = 0
      }
    }
    for(i = 0;i < nSymbols;++i) {
      if(freqs[i] > 0) {
        heap.push(i, freqs[i])
      }
    }
    nodes = new Array(heap.length / 2);
    values = new (USE_TYPEDARRAY ? Uint32Array : Array)(heap.length / 2);
    if(nodes.length === 1) {
      length[heap.pop().index] = 1;
      return length
    }
    for(i = 0, il = heap.length / 2;i < il;++i) {
      nodes[i] = heap.pop();
      values[i] = nodes[i].value
    }
    codeLength = this.reversePackageMerge_(values, values.length, limit);
    for(i = 0, il = nodes.length;i < il;++i) {
      length[nodes[i].index] = codeLength[i]
    }
    return length
  };
  Zlib.RawDeflate.prototype.reversePackageMerge_ = function(freqs, symbols, limit) {
    var minimumCost = new (USE_TYPEDARRAY ? Uint16Array : Array)(limit);
    var flag = new (USE_TYPEDARRAY ? Uint8Array : Array)(limit);
    var codeLength = new (USE_TYPEDARRAY ? Uint8Array : Array)(symbols);
    var value = new Array(limit);
    var type = new Array(limit);
    var currentPosition = new Array(limit);
    var excess = (1 << limit) - symbols;
    var half = 1 << limit - 1;
    var i;
    var j;
    var t;
    var weight;
    var next;
    function takePackage(j) {
      var x = type[j][currentPosition[j]];
      if(x === symbols) {
        takePackage(j + 1);
        takePackage(j + 1)
      }else {
        --codeLength[x]
      }
      ++currentPosition[j]
    }
    minimumCost[limit - 1] = symbols;
    for(j = 0;j < limit;++j) {
      if(excess < half) {
        flag[j] = 0
      }else {
        flag[j] = 1;
        excess -= half
      }
      excess <<= 1;
      minimumCost[limit - 2 - j] = (minimumCost[limit - 1 - j] / 2 | 0) + symbols
    }
    minimumCost[0] = flag[0];
    value[0] = new Array(minimumCost[0]);
    type[0] = new Array(minimumCost[0]);
    for(j = 1;j < limit;++j) {
      if(minimumCost[j] > 2 * minimumCost[j - 1] + flag[j]) {
        minimumCost[j] = 2 * minimumCost[j - 1] + flag[j]
      }
      value[j] = new Array(minimumCost[j]);
      type[j] = new Array(minimumCost[j])
    }
    for(i = 0;i < symbols;++i) {
      codeLength[i] = limit
    }
    for(t = 0;t < minimumCost[limit - 1];++t) {
      value[limit - 1][t] = freqs[t];
      type[limit - 1][t] = t
    }
    for(i = 0;i < limit;++i) {
      currentPosition[i] = 0
    }
    if(flag[limit - 1] === 1) {
      --codeLength[0];
      ++currentPosition[limit - 1]
    }
    for(j = limit - 2;j >= 0;--j) {
      i = 0;
      weight = 0;
      next = currentPosition[j + 1];
      for(t = 0;t < minimumCost[j];t++) {
        weight = value[j + 1][next] + value[j + 1][next + 1];
        if(weight > freqs[i]) {
          value[j][t] = weight;
          type[j][t] = symbols;
          next += 2
        }else {
          value[j][t] = freqs[i];
          type[j][t] = i;
          ++i
        }
      }
      currentPosition[j] = 0;
      if(flag[j] === 1) {
        takePackage(j)
      }
    }
    return codeLength
  };
  Zlib.RawDeflate.prototype.getCodesFromLengths_ = function(lengths) {
    var codes = new (USE_TYPEDARRAY ? Uint16Array : Array)(lengths.length), count = [], startCode = [], code = 0, i, il, j, m;
    for(i = 0, il = lengths.length;i < il;i++) {
      count[lengths[i]] = (count[lengths[i]] | 0) + 1
    }
    for(i = 1, il = Zlib.RawDeflate.MaxCodeLength;i <= il;i++) {
      startCode[i] = code;
      code += count[i] | 0;
      code <<= 1
    }
    for(i = 0, il = lengths.length;i < il;i++) {
      code = startCode[lengths[i]];
      startCode[lengths[i]] += 1;
      codes[i] = 0;
      for(j = 0, m = lengths[i];j < m;j++) {
        codes[i] = codes[i] << 1 | code & 1;
        code >>>= 1
      }
    }
    return codes
  }
});
goog.provide("Zlib.Gzip");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.CRC32");
goog.require("Zlib.RawDeflate");
goog.scope(function() {
  Zlib.Gzip = function(input, opt_params) {
    this.input = input;
    this.ip = 0;
    this.output;
    this.op = 0;
    this.flags = {};
    this.filename;
    this.comment;
    this.deflateOptions;
    if(opt_params) {
      if(opt_params["flags"]) {
        this.flags = opt_params["flags"]
      }
      if(typeof opt_params["filename"] === "string") {
        this.filename = opt_params["filename"]
      }
      if(typeof opt_params["comment"] === "string") {
        this.comment = opt_params["comment"]
      }
      if(opt_params["deflateOptions"]) {
        this.deflateOptions = opt_params["deflateOptions"]
      }
    }
    if(!this.deflateOptions) {
      this.deflateOptions = {}
    }
  };
  Zlib.Gzip.DefaultBufferSize = 32768;
  Zlib.Gzip.prototype.compress = function() {
    var flg;
    var mtime;
    var crc16;
    var crc32;
    var rawdeflate;
    var c;
    var i;
    var il;
    var output = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.Gzip.DefaultBufferSize);
    var op = 0;
    var input = this.input;
    var ip = this.ip;
    var filename = this.filename;
    var comment = this.comment;
    output[op++] = 31;
    output[op++] = 139;
    output[op++] = 8;
    flg = 0;
    if(this.flags["fname"]) {
      flg |= Zlib.Gzip.FlagsMask.FNAME
    }
    if(this.flags["fcomment"]) {
      flg |= Zlib.Gzip.FlagsMask.FCOMMENT
    }
    if(this.flags["fhcrc"]) {
      flg |= Zlib.Gzip.FlagsMask.FHCRC
    }
    output[op++] = flg;
    mtime = (Date.now ? Date.now() : +new Date) / 1E3 | 0;
    output[op++] = mtime & 255;
    output[op++] = mtime >>> 8 & 255;
    output[op++] = mtime >>> 16 & 255;
    output[op++] = mtime >>> 24 & 255;
    output[op++] = 0;
    output[op++] = Zlib.Gzip.OperatingSystem.UNKNOWN;
    if(this.flags["fname"] !== void 0) {
      for(i = 0, il = filename.length;i < il;++i) {
        c = filename.charCodeAt(i);
        if(c > 255) {
          output[op++] = c >>> 8 & 255
        }
        output[op++] = c & 255
      }
      output[op++] = 0
    }
    if(this.flags["comment"]) {
      for(i = 0, il = comment.length;i < il;++i) {
        c = comment.charCodeAt(i);
        if(c > 255) {
          output[op++] = c >>> 8 & 255
        }
        output[op++] = c & 255
      }
      output[op++] = 0
    }
    if(this.flags["fhcrc"]) {
      crc16 = Zlib.CRC32.calc(output, 0, op) & 65535;
      output[op++] = crc16 & 255;
      output[op++] = crc16 >>> 8 & 255
    }
    this.deflateOptions["outputBuffer"] = output;
    this.deflateOptions["outputIndex"] = op;
    rawdeflate = new Zlib.RawDeflate(input, this.deflateOptions);
    output = rawdeflate.compress();
    op = rawdeflate.op;
    if(USE_TYPEDARRAY) {
      if(op + 8 > output.buffer.byteLength) {
        this.output = new Uint8Array(op + 8);
        this.output.set(new Uint8Array(output.buffer));
        output = this.output
      }else {
        output = new Uint8Array(output.buffer)
      }
    }
    crc32 = Zlib.CRC32.calc(input);
    output[op++] = crc32 & 255;
    output[op++] = crc32 >>> 8 & 255;
    output[op++] = crc32 >>> 16 & 255;
    output[op++] = crc32 >>> 24 & 255;
    il = input.length;
    output[op++] = il & 255;
    output[op++] = il >>> 8 & 255;
    output[op++] = il >>> 16 & 255;
    output[op++] = il >>> 24 & 255;
    this.ip = ip;
    if(USE_TYPEDARRAY && op < output.length) {
      this.output = output = output.subarray(0, op)
    }
    return output
  };
  Zlib.Gzip.OperatingSystem = {FAT:0, AMIGA:1, VMS:2, UNIX:3, VM_CMS:4, ATARI_TOS:5, HPFS:6, MACINTOSH:7, Z_SYSTEM:8, CP_M:9, TOPS_20:10, NTFS:11, QDOS:12, ACORN_RISCOS:13, UNKNOWN:255};
  Zlib.Gzip.FlagsMask = {FTEXT:1, FHCRC:2, FEXTRA:4, FNAME:8, FCOMMENT:16}
});
goog.provide("Zlib.RawInflateStream");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.Huffman");
var ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE = 32768;
goog.scope(function() {
  var buildHuffmanTable = Zlib.Huffman.buildHuffmanTable;
  Zlib.RawInflateStream = function(input, ip, opt_buffersize) {
    this.blocks = [];
    this.bufferSize = opt_buffersize ? opt_buffersize : ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE;
    this.totalpos = 0;
    this.ip = ip === void 0 ? 0 : ip;
    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    this.input = USE_TYPEDARRAY ? new Uint8Array(input) : input;
    this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(this.bufferSize);
    this.op = 0;
    this.bfinal = false;
    this.blockLength;
    this.resize = false;
    this.litlenTable;
    this.distTable;
    this.sp = 0;
    this.status = Zlib.RawInflateStream.Status.INITIALIZED;
    this.ip_;
    this.bitsbuflen_;
    this.bitsbuf_
  };
  Zlib.RawInflateStream.BlockType = {UNCOMPRESSED:0, FIXED:1, DYNAMIC:2};
  Zlib.RawInflateStream.Status = {INITIALIZED:0, BLOCK_HEADER_START:1, BLOCK_HEADER_END:2, BLOCK_BODY_START:3, BLOCK_BODY_END:4, DECODE_BLOCK_START:5, DECODE_BLOCK_END:6};
  Zlib.RawInflateStream.prototype.decompress = function(newInput, ip) {
    var stop = false;
    if(newInput !== void 0) {
      this.input = newInput
    }
    if(ip !== void 0) {
      this.ip = ip
    }
    while(!stop) {
      switch(this.status) {
        case Zlib.RawInflateStream.Status.INITIALIZED:
        ;
        case Zlib.RawInflateStream.Status.BLOCK_HEADER_START:
          if(this.readBlockHeader() < 0) {
            stop = true
          }
          break;
        case Zlib.RawInflateStream.Status.BLOCK_HEADER_END:
        ;
        case Zlib.RawInflateStream.Status.BLOCK_BODY_START:
          switch(this.currentBlockType) {
            case Zlib.RawInflateStream.BlockType.UNCOMPRESSED:
              if(this.readUncompressedBlockHeader() < 0) {
                stop = true
              }
              break;
            case Zlib.RawInflateStream.BlockType.FIXED:
              if(this.parseFixedHuffmanBlock() < 0) {
                stop = true
              }
              break;
            case Zlib.RawInflateStream.BlockType.DYNAMIC:
              if(this.parseDynamicHuffmanBlock() < 0) {
                stop = true
              }
              break
          }
          break;
        case Zlib.RawInflateStream.Status.BLOCK_BODY_END:
        ;
        case Zlib.RawInflateStream.Status.DECODE_BLOCK_START:
          switch(this.currentBlockType) {
            case Zlib.RawInflateStream.BlockType.UNCOMPRESSED:
              if(this.parseUncompressedBlock() < 0) {
                stop = true
              }
              break;
            case Zlib.RawInflateStream.BlockType.FIXED:
            ;
            case Zlib.RawInflateStream.BlockType.DYNAMIC:
              if(this.decodeHuffman() < 0) {
                stop = true
              }
              break
          }
          break;
        case Zlib.RawInflateStream.Status.DECODE_BLOCK_END:
          if(this.bfinal) {
            stop = true
          }else {
            this.status = Zlib.RawInflateStream.Status.INITIALIZED
          }
          break
      }
    }
    return this.concatBuffer()
  };
  Zlib.RawInflateStream.MaxBackwardLength = 32768;
  Zlib.RawInflateStream.MaxCopyLength = 258;
  Zlib.RawInflateStream.Order = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  Zlib.RawInflateStream.LengthCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258]);
  Zlib.RawInflateStream.LengthExtraTable = function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table
  }([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0]);
  Zlib.RawInflateStream.DistCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577]);
  Zlib.RawInflateStream.DistExtraTable = function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table
  }([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
  Zlib.RawInflateStream.FixedLiteralLengthTable = function(table) {
    return table
  }(function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(288);
    var i, il;
    for(i = 0, il = lengths.length;i < il;++i) {
      lengths[i] = i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8
    }
    return buildHuffmanTable(lengths)
  }());
  Zlib.RawInflateStream.FixedDistanceTable = function(table) {
    return table
  }(function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(30);
    var i, il;
    for(i = 0, il = lengths.length;i < il;++i) {
      lengths[i] = 5
    }
    return buildHuffmanTable(lengths)
  }());
  Zlib.RawInflateStream.prototype.readBlockHeader = function() {
    var hdr;
    this.status = Zlib.RawInflateStream.Status.BLOCK_HEADER_START;
    this.save_();
    if((hdr = this.readBits(3)) < 0) {
      this.restore_();
      return-1
    }
    if(hdr & 1) {
      this.bfinal = true
    }
    hdr >>>= 1;
    switch(hdr) {
      case 0:
        this.currentBlockType = Zlib.RawInflateStream.BlockType.UNCOMPRESSED;
        break;
      case 1:
        this.currentBlockType = Zlib.RawInflateStream.BlockType.FIXED;
        break;
      case 2:
        this.currentBlockType = Zlib.RawInflateStream.BlockType.DYNAMIC;
        break;
      default:
        throw new Error("unknown BTYPE: " + hdr);
    }
    this.status = Zlib.RawInflateStream.Status.BLOCK_HEADER_END
  };
  Zlib.RawInflateStream.prototype.readBits = function(length) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    var octet;
    while(bitsbuflen < length) {
      if(input.length <= ip) {
        return-1
      }
      octet = input[ip++];
      bitsbuf |= octet << bitsbuflen;
      bitsbuflen += 8
    }
    octet = bitsbuf & (1 << length) - 1;
    bitsbuf >>>= length;
    bitsbuflen -= length;
    this.bitsbuf = bitsbuf;
    this.bitsbuflen = bitsbuflen;
    this.ip = ip;
    return octet
  };
  Zlib.RawInflateStream.prototype.readCodeByTable = function(table) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    var codeTable = table[0];
    var maxCodeLength = table[1];
    var octet;
    var codeWithLength;
    var codeLength;
    while(bitsbuflen < maxCodeLength) {
      if(input.length <= ip) {
        return-1
      }
      octet = input[ip++];
      bitsbuf |= octet << bitsbuflen;
      bitsbuflen += 8
    }
    codeWithLength = codeTable[bitsbuf & (1 << maxCodeLength) - 1];
    codeLength = codeWithLength >>> 16;
    if(codeLength > bitsbuflen) {
      throw new Error("invalid code length: " + codeLength);
    }
    this.bitsbuf = bitsbuf >> codeLength;
    this.bitsbuflen = bitsbuflen - codeLength;
    this.ip = ip;
    return codeWithLength & 65535
  };
  Zlib.RawInflateStream.prototype.readUncompressedBlockHeader = function() {
    var len;
    var nlen;
    var input = this.input;
    var ip = this.ip;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
    if(ip + 4 >= input.length) {
      return-1
    }
    len = input[ip++] | input[ip++] << 8;
    nlen = input[ip++] | input[ip++] << 8;
    if(len === ~nlen) {
      throw new Error("invalid uncompressed block header: length verify");
    }
    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    this.ip = ip;
    this.blockLength = len;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END
  };
  Zlib.RawInflateStream.prototype.parseUncompressedBlock = function() {
    var input = this.input;
    var ip = this.ip;
    var output = this.output;
    var op = this.op;
    var len = this.blockLength;
    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_START;
    while(len--) {
      if(op === output.length) {
        output = this.expandBuffer({fixRatio:2})
      }
      if(ip >= input.length) {
        this.ip = ip;
        this.op = op;
        this.blockLength = len + 1;
        return-1
      }
      output[op++] = input[ip++]
    }
    if(len < 0) {
      this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_END
    }
    this.ip = ip;
    this.op = op;
    return 0
  };
  Zlib.RawInflateStream.prototype.parseFixedHuffmanBlock = function() {
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
    this.litlenTable = Zlib.RawInflateStream.FixedLiteralLengthTable;
    this.distTable = Zlib.RawInflateStream.FixedDistanceTable;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END;
    return 0
  };
  Zlib.RawInflateStream.prototype.save_ = function() {
    this.ip_ = this.ip;
    this.bitsbuflen_ = this.bitsbuflen;
    this.bitsbuf_ = this.bitsbuf
  };
  Zlib.RawInflateStream.prototype.restore_ = function() {
    this.ip = this.ip_;
    this.bitsbuflen = this.bitsbuflen_;
    this.bitsbuf = this.bitsbuf_
  };
  Zlib.RawInflateStream.prototype.parseDynamicHuffmanBlock = function() {
    var hlit;
    var hdist;
    var hclen;
    var codeLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.RawInflateStream.Order.length);
    var codeLengthsTable;
    var litlenLengths;
    var distLengths;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
    this.save_();
    hlit = this.readBits(5) + 257;
    hdist = this.readBits(5) + 1;
    hclen = this.readBits(4) + 4;
    if(hlit < 0 || hdist < 0 || hclen < 0) {
      this.restore_();
      return-1
    }
    try {
      parseDynamicHuffmanBlockImpl.call(this)
    }catch(e) {
      this.restore_();
      return-1
    }
    function parseDynamicHuffmanBlockImpl() {
      var bits;
      var code;
      var prev = 0;
      var repeat;
      var lengthTable;
      var i;
      var il;
      for(i = 0;i < hclen;++i) {
        if((bits = this.readBits(3)) < 0) {
          throw new Error("not enough input");
        }
        codeLengths[Zlib.RawInflateStream.Order[i]] = bits
      }
      codeLengthsTable = buildHuffmanTable(codeLengths);
      lengthTable = new (USE_TYPEDARRAY ? Uint8Array : Array)(hlit + hdist);
      for(i = 0, il = hlit + hdist;i < il;) {
        code = this.readCodeByTable(codeLengthsTable);
        if(code < 0) {
          throw new Error("not enough input");
        }
        switch(code) {
          case 16:
            if((bits = this.readBits(2)) < 0) {
              throw new Error("not enough input");
            }
            repeat = 3 + bits;
            while(repeat--) {
              lengthTable[i++] = prev
            }
            break;
          case 17:
            if((bits = this.readBits(3)) < 0) {
              throw new Error("not enough input");
            }
            repeat = 3 + bits;
            while(repeat--) {
              lengthTable[i++] = 0
            }
            prev = 0;
            break;
          case 18:
            if((bits = this.readBits(7)) < 0) {
              throw new Error("not enough input");
            }
            repeat = 11 + bits;
            while(repeat--) {
              lengthTable[i++] = 0
            }
            prev = 0;
            break;
          default:
            lengthTable[i++] = code;
            prev = code;
            break
        }
      }
      litlenLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(hlit);
      distLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(hdist);
      this.litlenTable = USE_TYPEDARRAY ? buildHuffmanTable(lengthTable.subarray(0, hlit)) : buildHuffmanTable(lengthTable.slice(0, hlit));
      this.distTable = USE_TYPEDARRAY ? buildHuffmanTable(lengthTable.subarray(hlit)) : buildHuffmanTable(lengthTable.slice(hlit))
    }
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END;
    return 0
  };
  Zlib.RawInflateStream.prototype.decodeHuffman = function() {
    var output = this.output;
    var op = this.op;
    var code;
    var ti;
    var codeDist;
    var codeLength;
    var litlen = this.litlenTable;
    var dist = this.distTable;
    var olength = output.length;
    var bits;
    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_START;
    while(true) {
      this.save_();
      code = this.readCodeByTable(litlen);
      if(code < 0) {
        this.op = op;
        this.restore_();
        return-1
      }
      if(code === 256) {
        break
      }
      if(code < 256) {
        if(op === olength) {
          output = this.expandBuffer();
          olength = output.length
        }
        output[op++] = code;
        continue
      }
      ti = code - 257;
      codeLength = Zlib.RawInflateStream.LengthCodeTable[ti];
      if(Zlib.RawInflateStream.LengthExtraTable[ti] > 0) {
        bits = this.readBits(Zlib.RawInflateStream.LengthExtraTable[ti]);
        if(bits < 0) {
          this.op = op;
          this.restore_();
          return-1
        }
        codeLength += bits
      }
      code = this.readCodeByTable(dist);
      if(code < 0) {
        this.op = op;
        this.restore_();
        return-1
      }
      codeDist = Zlib.RawInflateStream.DistCodeTable[code];
      if(Zlib.RawInflateStream.DistExtraTable[code] > 0) {
        bits = this.readBits(Zlib.RawInflateStream.DistExtraTable[code]);
        if(bits < 0) {
          this.op = op;
          this.restore_();
          return-1
        }
        codeDist += bits
      }
      if(op + codeLength >= olength) {
        output = this.expandBuffer();
        olength = output.length
      }
      while(codeLength--) {
        output[op] = output[op++ - codeDist]
      }
      if(this.ip === this.input.length) {
        this.op = op;
        return-1
      }
    }
    while(this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--
    }
    this.op = op;
    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_END
  };
  Zlib.RawInflateStream.prototype.expandBuffer = function(opt_param) {
    var buffer;
    var ratio = this.input.length / this.ip + 1 | 0;
    var maxHuffCode;
    var newSize;
    var maxInflateSize;
    var input = this.input;
    var output = this.output;
    if(opt_param) {
      if(typeof opt_param.fixRatio === "number") {
        ratio = opt_param.fixRatio
      }
      if(typeof opt_param.addRatio === "number") {
        ratio += opt_param.addRatio
      }
    }
    if(ratio < 2) {
      maxHuffCode = (input.length - this.ip) / this.litlenTable[2];
      maxInflateSize = maxHuffCode / 2 * 258 | 0;
      newSize = maxInflateSize < output.length ? output.length + maxInflateSize : output.length << 1
    }else {
      newSize = output.length * ratio
    }
    if(USE_TYPEDARRAY) {
      buffer = new Uint8Array(newSize);
      buffer.set(output)
    }else {
      buffer = output
    }
    this.output = buffer;
    return this.output
  };
  Zlib.RawInflateStream.prototype.concatBuffer = function() {
    var buffer;
    var op = this.op;
    var tmp;
    if(this.resize) {
      if(USE_TYPEDARRAY) {
        buffer = new Uint8Array(this.output.subarray(this.sp, op))
      }else {
        buffer = this.output.slice(this.sp, op)
      }
    }else {
      buffer = USE_TYPEDARRAY ? this.output.subarray(this.sp, op) : this.output.slice(this.sp, op)
    }
    this.sp = op;
    if(op > Zlib.RawInflateStream.MaxBackwardLength + this.bufferSize) {
      this.op = this.sp = Zlib.RawInflateStream.MaxBackwardLength;
      if(USE_TYPEDARRAY) {
        tmp = (this.output);
        this.output = new Uint8Array(this.bufferSize + Zlib.RawInflateStream.MaxBackwardLength);
        this.output.set(tmp.subarray(op - Zlib.RawInflateStream.MaxBackwardLength, op))
      }else {
        this.output = this.output.slice(op - Zlib.RawInflateStream.MaxBackwardLength)
      }
    }
    return buffer
  }
});
goog.provide("Zlib.RawInflate");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.Huffman");
var ZLIB_RAW_INFLATE_BUFFER_SIZE = 32768;
goog.scope(function() {
  var buildHuffmanTable = Zlib.Huffman.buildHuffmanTable;
  Zlib.RawInflate = function(input, opt_params) {
    this.buffer;
    this.blocks = [];
    this.bufferSize = ZLIB_RAW_INFLATE_BUFFER_SIZE;
    this.totalpos = 0;
    this.ip = 0;
    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    this.input = USE_TYPEDARRAY ? new Uint8Array(input) : input;
    this.output;
    this.op;
    this.bfinal = false;
    this.bufferType = Zlib.RawInflate.BufferType.ADAPTIVE;
    this.resize = false;
    if(opt_params || !(opt_params = {})) {
      if(opt_params["index"]) {
        this.ip = opt_params["index"]
      }
      if(opt_params["bufferSize"]) {
        this.bufferSize = opt_params["bufferSize"]
      }
      if(opt_params["bufferType"]) {
        this.bufferType = opt_params["bufferType"]
      }
      if(opt_params["resize"]) {
        this.resize = opt_params["resize"]
      }
    }
    switch(this.bufferType) {
      case Zlib.RawInflate.BufferType.BLOCK:
        this.op = Zlib.RawInflate.MaxBackwardLength;
        this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.RawInflate.MaxBackwardLength + this.bufferSize + Zlib.RawInflate.MaxCopyLength);
        break;
      case Zlib.RawInflate.BufferType.ADAPTIVE:
        this.op = 0;
        this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(this.bufferSize);
        this.expandBuffer = this.expandBufferAdaptive;
        this.concatBuffer = this.concatBufferDynamic;
        this.decodeHuffman = this.decodeHuffmanAdaptive;
        break;
      default:
        throw new Error("invalid inflate mode");
    }
  };
  Zlib.RawInflate.BufferType = {BLOCK:0, ADAPTIVE:1};
  Zlib.RawInflate.prototype.decompress = function() {
    while(!this.bfinal) {
      this.parseBlock()
    }
    return this.concatBuffer()
  };
  Zlib.RawInflate.MaxBackwardLength = 32768;
  Zlib.RawInflate.MaxCopyLength = 258;
  Zlib.RawInflate.Order = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  Zlib.RawInflate.LengthCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258]);
  Zlib.RawInflate.LengthExtraTable = function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table
  }([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0]);
  Zlib.RawInflate.DistCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577]);
  Zlib.RawInflate.DistExtraTable = function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table
  }([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
  Zlib.RawInflate.FixedLiteralLengthTable = function(table) {
    return table
  }(function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(288);
    var i, il;
    for(i = 0, il = lengths.length;i < il;++i) {
      lengths[i] = i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8
    }
    return buildHuffmanTable(lengths)
  }());
  Zlib.RawInflate.FixedDistanceTable = function(table) {
    return table
  }(function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(30);
    var i, il;
    for(i = 0, il = lengths.length;i < il;++i) {
      lengths[i] = 5
    }
    return buildHuffmanTable(lengths)
  }());
  Zlib.RawInflate.prototype.parseBlock = function() {
    var hdr = this.readBits(3);
    if(hdr & 1) {
      this.bfinal = true
    }
    hdr >>>= 1;
    switch(hdr) {
      case 0:
        this.parseUncompressedBlock();
        break;
      case 1:
        this.parseFixedHuffmanBlock();
        break;
      case 2:
        this.parseDynamicHuffmanBlock();
        break;
      default:
        throw new Error("unknown BTYPE: " + hdr);
    }
  };
  Zlib.RawInflate.prototype.readBits = function(length) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    var inputLength = input.length;
    var octet;
    while(bitsbuflen < length) {
      if(ip >= inputLength) {
        throw new Error("input buffer is broken");
      }
      bitsbuf |= input[ip++] << bitsbuflen;
      bitsbuflen += 8
    }
    octet = bitsbuf & (1 << length) - 1;
    bitsbuf >>>= length;
    bitsbuflen -= length;
    this.bitsbuf = bitsbuf;
    this.bitsbuflen = bitsbuflen;
    this.ip = ip;
    return octet
  };
  Zlib.RawInflate.prototype.readCodeByTable = function(table) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    var inputLength = input.length;
    var codeTable = table[0];
    var maxCodeLength = table[1];
    var codeWithLength;
    var codeLength;
    while(bitsbuflen < maxCodeLength) {
      if(ip >= inputLength) {
        break
      }
      bitsbuf |= input[ip++] << bitsbuflen;
      bitsbuflen += 8
    }
    codeWithLength = codeTable[bitsbuf & (1 << maxCodeLength) - 1];
    codeLength = codeWithLength >>> 16;
    if(codeLength > bitsbuflen) {
      throw new Error("invalid code length: " + codeLength);
    }
    this.bitsbuf = bitsbuf >> codeLength;
    this.bitsbuflen = bitsbuflen - codeLength;
    this.ip = ip;
    return codeWithLength & 65535
  };
  Zlib.RawInflate.prototype.parseUncompressedBlock = function() {
    var input = this.input;
    var ip = this.ip;
    var output = this.output;
    var op = this.op;
    var inputLength = input.length;
    var len;
    var nlen;
    var olength = output.length;
    var preCopy;
    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    if(ip + 1 >= inputLength) {
      throw new Error("invalid uncompressed block header: LEN");
    }
    len = input[ip++] | input[ip++] << 8;
    if(ip + 1 >= inputLength) {
      throw new Error("invalid uncompressed block header: NLEN");
    }
    nlen = input[ip++] | input[ip++] << 8;
    if(len === ~nlen) {
      throw new Error("invalid uncompressed block header: length verify");
    }
    if(ip + len > input.length) {
      throw new Error("input buffer is broken");
    }
    switch(this.bufferType) {
      case Zlib.RawInflate.BufferType.BLOCK:
        while(op + len > output.length) {
          preCopy = olength - op;
          len -= preCopy;
          if(USE_TYPEDARRAY) {
            output.set(input.subarray(ip, ip + preCopy), op);
            op += preCopy;
            ip += preCopy
          }else {
            while(preCopy--) {
              output[op++] = input[ip++]
            }
          }
          this.op = op;
          output = this.expandBuffer();
          op = this.op
        }
        break;
      case Zlib.RawInflate.BufferType.ADAPTIVE:
        while(op + len > output.length) {
          output = this.expandBuffer({fixRatio:2})
        }
        break;
      default:
        throw new Error("invalid inflate mode");
    }
    if(USE_TYPEDARRAY) {
      output.set(input.subarray(ip, ip + len), op);
      op += len;
      ip += len
    }else {
      while(len--) {
        output[op++] = input[ip++]
      }
    }
    this.ip = ip;
    this.op = op;
    this.output = output
  };
  Zlib.RawInflate.prototype.parseFixedHuffmanBlock = function() {
    this.decodeHuffman(Zlib.RawInflate.FixedLiteralLengthTable, Zlib.RawInflate.FixedDistanceTable)
  };
  Zlib.RawInflate.prototype.parseDynamicHuffmanBlock = function() {
    var hlit = this.readBits(5) + 257;
    var hdist = this.readBits(5) + 1;
    var hclen = this.readBits(4) + 4;
    var codeLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.RawInflate.Order.length);
    var codeLengthsTable;
    var litlenTable;
    var distTable;
    var lengthTable;
    var code;
    var prev;
    var repeat;
    var i;
    var il;
    for(i = 0;i < hclen;++i) {
      codeLengths[Zlib.RawInflate.Order[i]] = this.readBits(3)
    }
    if(!USE_TYPEDARRAY) {
      for(i = hclen, hclen = codeLengths.length;i < hclen;++i) {
        codeLengths[Zlib.RawInflate.Order[i]] = 0
      }
    }
    codeLengthsTable = buildHuffmanTable(codeLengths);
    lengthTable = new (USE_TYPEDARRAY ? Uint8Array : Array)(hlit + hdist);
    for(i = 0, il = hlit + hdist;i < il;) {
      code = this.readCodeByTable(codeLengthsTable);
      switch(code) {
        case 16:
          repeat = 3 + this.readBits(2);
          while(repeat--) {
            lengthTable[i++] = prev
          }
          break;
        case 17:
          repeat = 3 + this.readBits(3);
          while(repeat--) {
            lengthTable[i++] = 0
          }
          prev = 0;
          break;
        case 18:
          repeat = 11 + this.readBits(7);
          while(repeat--) {
            lengthTable[i++] = 0
          }
          prev = 0;
          break;
        default:
          lengthTable[i++] = code;
          prev = code;
          break
      }
    }
    litlenTable = USE_TYPEDARRAY ? buildHuffmanTable(lengthTable.subarray(0, hlit)) : buildHuffmanTable(lengthTable.slice(0, hlit));
    distTable = USE_TYPEDARRAY ? buildHuffmanTable(lengthTable.subarray(hlit)) : buildHuffmanTable(lengthTable.slice(hlit));
    this.decodeHuffman(litlenTable, distTable)
  };
  Zlib.RawInflate.prototype.decodeHuffman = function(litlen, dist) {
    var output = this.output;
    var op = this.op;
    this.currentLitlenTable = litlen;
    var olength = output.length - Zlib.RawInflate.MaxCopyLength;
    var code;
    var ti;
    var codeDist;
    var codeLength;
    while((code = this.readCodeByTable(litlen)) !== 256) {
      if(code < 256) {
        if(op >= olength) {
          this.op = op;
          output = this.expandBuffer();
          op = this.op
        }
        output[op++] = code;
        continue
      }
      ti = code - 257;
      codeLength = Zlib.RawInflate.LengthCodeTable[ti];
      if(Zlib.RawInflate.LengthExtraTable[ti] > 0) {
        codeLength += this.readBits(Zlib.RawInflate.LengthExtraTable[ti])
      }
      code = this.readCodeByTable(dist);
      codeDist = Zlib.RawInflate.DistCodeTable[code];
      if(Zlib.RawInflate.DistExtraTable[code] > 0) {
        codeDist += this.readBits(Zlib.RawInflate.DistExtraTable[code])
      }
      if(op >= olength) {
        this.op = op;
        output = this.expandBuffer();
        op = this.op
      }
      while(codeLength--) {
        output[op] = output[op++ - codeDist]
      }
    }
    while(this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--
    }
    this.op = op
  };
  Zlib.RawInflate.prototype.decodeHuffmanAdaptive = function(litlen, dist) {
    var output = this.output;
    var op = this.op;
    this.currentLitlenTable = litlen;
    var olength = output.length;
    var code;
    var ti;
    var codeDist;
    var codeLength;
    while((code = this.readCodeByTable(litlen)) !== 256) {
      if(code < 256) {
        if(op >= olength) {
          output = this.expandBuffer();
          olength = output.length
        }
        output[op++] = code;
        continue
      }
      ti = code - 257;
      codeLength = Zlib.RawInflate.LengthCodeTable[ti];
      if(Zlib.RawInflate.LengthExtraTable[ti] > 0) {
        codeLength += this.readBits(Zlib.RawInflate.LengthExtraTable[ti])
      }
      code = this.readCodeByTable(dist);
      codeDist = Zlib.RawInflate.DistCodeTable[code];
      if(Zlib.RawInflate.DistExtraTable[code] > 0) {
        codeDist += this.readBits(Zlib.RawInflate.DistExtraTable[code])
      }
      if(op + codeLength > olength) {
        output = this.expandBuffer();
        olength = output.length
      }
      while(codeLength--) {
        output[op] = output[op++ - codeDist]
      }
    }
    while(this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--
    }
    this.op = op
  };
  Zlib.RawInflate.prototype.expandBuffer = function(opt_param) {
    var buffer = new (USE_TYPEDARRAY ? Uint8Array : Array)(this.op - Zlib.RawInflate.MaxBackwardLength);
    var backward = this.op - Zlib.RawInflate.MaxBackwardLength;
    var i;
    var il;
    var output = this.output;
    if(USE_TYPEDARRAY) {
      buffer.set(output.subarray(Zlib.RawInflate.MaxBackwardLength, buffer.length))
    }else {
      for(i = 0, il = buffer.length;i < il;++i) {
        buffer[i] = output[i + Zlib.RawInflate.MaxBackwardLength]
      }
    }
    this.blocks.push(buffer);
    this.totalpos += buffer.length;
    if(USE_TYPEDARRAY) {
      output.set(output.subarray(backward, backward + Zlib.RawInflate.MaxBackwardLength))
    }else {
      for(i = 0;i < Zlib.RawInflate.MaxBackwardLength;++i) {
        output[i] = output[backward + i]
      }
    }
    this.op = Zlib.RawInflate.MaxBackwardLength;
    return output
  };
  Zlib.RawInflate.prototype.expandBufferAdaptive = function(opt_param) {
    var buffer;
    var ratio = this.input.length / this.ip + 1 | 0;
    var maxHuffCode;
    var newSize;
    var maxInflateSize;
    var input = this.input;
    var output = this.output;
    if(opt_param) {
      if(typeof opt_param.fixRatio === "number") {
        ratio = opt_param.fixRatio
      }
      if(typeof opt_param.addRatio === "number") {
        ratio += opt_param.addRatio
      }
    }
    if(ratio < 2) {
      maxHuffCode = (input.length - this.ip) / this.currentLitlenTable[2];
      maxInflateSize = maxHuffCode / 2 * 258 | 0;
      newSize = maxInflateSize < output.length ? output.length + maxInflateSize : output.length << 1
    }else {
      newSize = output.length * ratio
    }
    if(USE_TYPEDARRAY) {
      buffer = new Uint8Array(newSize);
      buffer.set(output)
    }else {
      buffer = output
    }
    this.output = buffer;
    return this.output
  };
  Zlib.RawInflate.prototype.concatBuffer = function() {
    var pos = 0;
    var limit = this.totalpos + (this.op - Zlib.RawInflate.MaxBackwardLength);
    var output = this.output;
    var blocks = this.blocks;
    var block;
    var buffer = new (USE_TYPEDARRAY ? Uint8Array : Array)(limit);
    var i;
    var il;
    var j;
    var jl;
    if(blocks.length === 0) {
      return USE_TYPEDARRAY ? this.output.subarray(Zlib.RawInflate.MaxBackwardLength, this.op) : this.output.slice(Zlib.RawInflate.MaxBackwardLength, this.op)
    }
    for(i = 0, il = blocks.length;i < il;++i) {
      block = blocks[i];
      for(j = 0, jl = block.length;j < jl;++j) {
        buffer[pos++] = block[j]
      }
    }
    for(i = Zlib.RawInflate.MaxBackwardLength, il = this.op;i < il;++i) {
      buffer[pos++] = output[i]
    }
    this.blocks = [];
    this.buffer = buffer;
    return this.buffer
  };
  Zlib.RawInflate.prototype.concatBufferDynamic = function() {
    var buffer;
    var op = this.op;
    if(USE_TYPEDARRAY) {
      if(this.resize) {
        buffer = new Uint8Array(op);
        buffer.set(this.output.subarray(0, op))
      }else {
        buffer = this.output.subarray(0, op)
      }
    }else {
      if(this.output.length > op) {
        this.output.length = op
      }
      buffer = this.output
    }
    this.buffer = buffer;
    return this.buffer
  }
});
goog.provide("Zlib.Gunzip");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.CRC32");
goog.require("Zlib.Gzip");
goog.require("Zlib.RawInflate");
goog.require("Zlib.GunzipMember");
goog.scope(function() {
  Zlib.Gunzip = function(input, opt_params) {
    this.input = input;
    this.ip = 0;
    this.member = [];
    this.decompressed = false
  };
  Zlib.Gunzip.prototype.getMembers = function() {
    if(!this.decompressed) {
      this.decompress()
    }
    return this.member.slice()
  };
  Zlib.Gunzip.prototype.decompress = function() {
    var il = this.input.length;
    while(this.ip < il) {
      this.decodeMember()
    }
    this.decompressed = true;
    return this.concatMember()
  };
  Zlib.Gunzip.prototype.decodeMember = function() {
    var member = new Zlib.GunzipMember;
    var isize;
    var rawinflate;
    var inflated;
    var inflen;
    var c;
    var ci;
    var str;
    var mtime;
    var crc32;
    var input = this.input;
    var ip = this.ip;
    member.id1 = input[ip++];
    member.id2 = input[ip++];
    if(member.id1 !== 31 || member.id2 !== 139) {
      throw new Error("invalid file signature:" + member.id1 + "," + member.id2);
    }
    member.cm = input[ip++];
    switch(member.cm) {
      case 8:
        break;
      default:
        throw new Error("unknown compression method: " + member.cm);
    }
    member.flg = input[ip++];
    mtime = input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24;
    member.mtime = new Date(mtime * 1E3);
    member.xfl = input[ip++];
    member.os = input[ip++];
    if((member.flg & Zlib.Gzip.FlagsMask.FEXTRA) > 0) {
      member.xlen = input[ip++] | input[ip++] << 8;
      ip = this.decodeSubField(ip, member.xlen)
    }
    if((member.flg & Zlib.Gzip.FlagsMask.FNAME) > 0) {
      for(str = [], ci = 0;(c = input[ip++]) > 0;) {
        str[ci++] = String.fromCharCode(c)
      }
      member.name = str.join("")
    }
    if((member.flg & Zlib.Gzip.FlagsMask.FCOMMENT) > 0) {
      for(str = [], ci = 0;(c = input[ip++]) > 0;) {
        str[ci++] = String.fromCharCode(c)
      }
      member.comment = str.join("")
    }
    if((member.flg & Zlib.Gzip.FlagsMask.FHCRC) > 0) {
      member.crc16 = Zlib.CRC32.calc(input, 0, ip) & 65535;
      if(member.crc16 !== (input[ip++] | input[ip++] << 8)) {
        throw new Error("invalid header crc16");
      }
    }
    isize = input[input.length - 4] | input[input.length - 3] << 8 | input[input.length - 2] << 16 | input[input.length - 1] << 24;
    if(input.length - ip - 4 - 4 < isize * 512) {
      inflen = isize
    }
    rawinflate = new Zlib.RawInflate(input, {"index":ip, "bufferSize":inflen});
    member.data = inflated = rawinflate.decompress();
    ip = rawinflate.ip;
    member.crc32 = crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    if(Zlib.CRC32.calc(inflated) !== crc32) {
      throw new Error("invalid CRC-32 checksum: 0x" + Zlib.CRC32.calc(inflated).toString(16) + " / 0x" + crc32.toString(16));
    }
    member.isize = isize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    if((inflated.length & 4294967295) !== isize) {
      throw new Error("invalid input size: " + (inflated.length & 4294967295) + " / " + isize);
    }
    this.member.push(member);
    this.ip = ip
  };
  Zlib.Gunzip.prototype.decodeSubField = function(ip, length) {
    return ip + length
  };
  Zlib.Gunzip.prototype.concatMember = function() {
    var member = this.member;
    var i;
    var il;
    var p = 0;
    var size = 0;
    var buffer;
    for(i = 0, il = member.length;i < il;++i) {
      size += member[i].data.length
    }
    if(USE_TYPEDARRAY) {
      buffer = new Uint8Array(size);
      for(i = 0;i < il;++i) {
        buffer.set(member[i].data, p);
        p += member[i].data.length
      }
    }else {
      buffer = [];
      for(i = 0;i < il;++i) {
        buffer[i] = member[i].data
      }
      buffer = Array.prototype.concat.apply([], buffer)
    }
    return buffer
  }
});
goog.provide("Zlib.Util");
goog.scope(function() {
  Zlib.Util.stringToByteArray = function(str) {
    var tmp = str.split("");
    var i;
    var il;
    for(i = 0, il = tmp.length;i < il;i++) {
      tmp[i] = (tmp[i].charCodeAt(0) & 255) >>> 0
    }
    return tmp
  }
});
goog.provide("Zlib.Adler32");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.Util");
goog.scope(function() {
  Zlib.Adler32 = function(array) {
    if(typeof array === "string") {
      array = Zlib.Util.stringToByteArray(array)
    }
    return Zlib.Adler32.update(1, array)
  };
  Zlib.Adler32.update = function(adler, array) {
    var s1 = adler & 65535;
    var s2 = adler >>> 16 & 65535;
    var len = array.length;
    var tlen;
    var i = 0;
    while(len > 0) {
      tlen = len > Zlib.Adler32.OptimizationParameter ? Zlib.Adler32.OptimizationParameter : len;
      len -= tlen;
      do {
        s1 += array[i++];
        s2 += s1
      }while(--tlen);
      s1 %= 65521;
      s2 %= 65521
    }
    return(s2 << 16 | s1) >>> 0
  };
  Zlib.Adler32.OptimizationParameter = 1024
});
goog.provide("Zlib.Inflate");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.Adler32");
goog.require("Zlib.RawInflate");
goog.scope(function() {
  Zlib.Inflate = function(input, opt_params) {
    var bufferSize;
    var bufferType;
    var cmf;
    var flg;
    this.input = input;
    this.ip = 0;
    this.rawinflate;
    this.verify;
    if(opt_params || !(opt_params = {})) {
      if(opt_params["index"]) {
        this.ip = opt_params["index"]
      }
      if(opt_params["verify"]) {
        this.verify = opt_params["verify"]
      }
    }
    cmf = input[this.ip++];
    flg = input[this.ip++];
    switch(cmf & 15) {
      case Zlib.CompressionMethod.DEFLATE:
        this.method = Zlib.CompressionMethod.DEFLATE;
        break;
      default:
        throw new Error("unsupported compression method");
    }
    if(((cmf << 8) + flg) % 31 !== 0) {
      throw new Error("invalid fcheck flag:" + ((cmf << 8) + flg) % 31);
    }
    if(flg & 32) {
      throw new Error("fdict flag is not supported");
    }
    this.rawinflate = new Zlib.RawInflate(input, {"index":this.ip, "bufferSize":opt_params["bufferSize"], "bufferType":opt_params["bufferType"], "resize":opt_params["resize"]})
  };
  Zlib.Inflate.BufferType = Zlib.RawInflate.BufferType;
  Zlib.Inflate.prototype.decompress = function() {
    var input = this.input;
    var buffer;
    var adler32;
    buffer = this.rawinflate.decompress();
    this.ip = this.rawinflate.ip;
    if(this.verify) {
      adler32 = (input[this.ip++] << 24 | input[this.ip++] << 16 | input[this.ip++] << 8 | input[this.ip++]) >>> 0;
      if(adler32 !== Zlib.Adler32(buffer)) {
        throw new Error("invalid adler-32 checksum");
      }
    }
    return buffer
  }
});
goog.provide("Zlib.Zip");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.RawDeflate");
goog.require("Zlib.CRC32");
goog.scope(function() {
  Zlib.Zip = function(opt_params) {
    opt_params = opt_params || {};
    this.files = [];
    this.comment = opt_params["comment"];
    this.password
  };
  Zlib.Zip.CompressionMethod = {STORE:0, DEFLATE:8};
  Zlib.Zip.OperatingSystem = {MSDOS:0, UNIX:3, MACINTOSH:7};
  Zlib.Zip.Flags = {ENCRYPT:1, DESCRIPTOR:8, UTF8:2048};
  Zlib.Zip.FileHeaderSignature = [80, 75, 1, 2];
  Zlib.Zip.LocalFileHeaderSignature = [80, 75, 3, 4];
  Zlib.Zip.CentralDirectorySignature = [80, 75, 5, 6];
  Zlib.Zip.prototype.addFile = function(input, opt_params) {
    opt_params = opt_params || {};
    var filename = "" || opt_params["filename"];
    var compressed;
    var size = input.length;
    var crc32 = 0;
    if(USE_TYPEDARRAY && input instanceof Array) {
      input = new Uint8Array(input)
    }
    if(typeof opt_params["compressionMethod"] !== "number") {
      opt_params["compressionMethod"] = Zlib.Zip.CompressionMethod.DEFLATE
    }
    if(opt_params["compress"]) {
      switch(opt_params["compressionMethod"]) {
        case Zlib.Zip.CompressionMethod.STORE:
          break;
        case Zlib.Zip.CompressionMethod.DEFLATE:
          crc32 = Zlib.CRC32.calc(input);
          input = this.deflateWithOption(input, opt_params);
          compressed = true;
          break;
        default:
          throw new Error("unknown compression method:" + opt_params["compressionMethod"]);
      }
    }
    this.files.push({buffer:input, option:opt_params, compressed:compressed, encrypted:false, size:size, crc32:crc32})
  };
  Zlib.Zip.prototype.setPassword = function(password) {
    this.password = password
  };
  Zlib.Zip.prototype.compress = function() {
    var files = this.files;
    var file;
    var output;
    var op1;
    var op2;
    var op3;
    var localFileSize = 0;
    var centralDirectorySize = 0;
    var endOfCentralDirectorySize;
    var offset;
    var needVersion;
    var flags;
    var compressionMethod;
    var date;
    var crc32;
    var size;
    var plainSize;
    var filenameLength;
    var extraFieldLength;
    var commentLength;
    var filename;
    var extraField;
    var comment;
    var buffer;
    var tmp;
    var key;
    var i;
    var il;
    var j;
    var jl;
    for(i = 0, il = files.length;i < il;++i) {
      file = files[i];
      filenameLength = file.option["filename"] ? file.option["filename"].length : 0;
      extraFieldLength = file.option["extraField"] ? file.option["extraField"].length : 0;
      commentLength = file.option["comment"] ? file.option["comment"].length : 0;
      if(!file.compressed) {
        file.crc32 = Zlib.CRC32.calc(file.buffer);
        switch(file.option["compressionMethod"]) {
          case Zlib.Zip.CompressionMethod.STORE:
            break;
          case Zlib.Zip.CompressionMethod.DEFLATE:
            file.buffer = this.deflateWithOption(file.buffer, file.option);
            file.compressed = true;
            break;
          default:
            throw new Error("unknown compression method:" + file.option["compressionMethod"]);
        }
      }
      if(file.option["password"] !== void 0 || this.password !== void 0) {
        key = this.createEncryptionKey(file.option["password"] || this.password);
        buffer = file.buffer;
        if(USE_TYPEDARRAY) {
          tmp = new Uint8Array(buffer.length + 12);
          tmp.set(buffer, 12);
          buffer = tmp
        }else {
          buffer.unshift(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
        }
        for(j = 0;j < 12;++j) {
          buffer[j] = this.encode(key, i === 11 ? file.crc32 & 255 : Math.random() * 256 | 0)
        }
        for(jl = buffer.length;j < jl;++j) {
          buffer[j] = this.encode(key, buffer[j])
        }
        file.buffer = buffer
      }
      localFileSize += 30 + filenameLength + file.buffer.length;
      centralDirectorySize += 46 + filenameLength + commentLength
    }
    endOfCentralDirectorySize = 22 + (this.comment ? this.comment.length : 0);
    output = new (USE_TYPEDARRAY ? Uint8Array : Array)(localFileSize + centralDirectorySize + endOfCentralDirectorySize);
    op1 = 0;
    op2 = localFileSize;
    op3 = op2 + centralDirectorySize;
    for(i = 0, il = files.length;i < il;++i) {
      file = files[i];
      filenameLength = file.option["filename"] ? file.option["filename"].length : 0;
      extraFieldLength = 0;
      commentLength = file.option["comment"] ? file.option["comment"].length : 0;
      offset = op1;
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[0];
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[1];
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[2];
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[3];
      output[op2++] = Zlib.Zip.FileHeaderSignature[0];
      output[op2++] = Zlib.Zip.FileHeaderSignature[1];
      output[op2++] = Zlib.Zip.FileHeaderSignature[2];
      output[op2++] = Zlib.Zip.FileHeaderSignature[3];
      needVersion = 20;
      output[op2++] = needVersion & 255;
      output[op2++] = (file.option["os"]) || Zlib.Zip.OperatingSystem.MSDOS;
      output[op1++] = output[op2++] = needVersion & 255;
      output[op1++] = output[op2++] = needVersion >> 8 & 255;
      flags = 0;
      if(file.option["password"] || this.password) {
        flags |= Zlib.Zip.Flags.ENCRYPT
      }
      output[op1++] = output[op2++] = flags & 255;
      output[op1++] = output[op2++] = flags >> 8 & 255;
      compressionMethod = (file.option["compressionMethod"]);
      output[op1++] = output[op2++] = compressionMethod & 255;
      output[op1++] = output[op2++] = compressionMethod >> 8 & 255;
      date = (file.option["date"]) || new Date;
      output[op1++] = output[op2++] = (date.getMinutes() & 7) << 5 | date.getSeconds() / 2 | 0;
      output[op1++] = output[op2++] = date.getHours() << 3 | date.getMinutes() >> 3;
      output[op1++] = output[op2++] = (date.getMonth() + 1 & 7) << 5 | date.getDate();
      output[op1++] = output[op2++] = (date.getFullYear() - 1980 & 127) << 1 | date.getMonth() + 1 >> 3;
      crc32 = file.crc32;
      output[op1++] = output[op2++] = crc32 & 255;
      output[op1++] = output[op2++] = crc32 >> 8 & 255;
      output[op1++] = output[op2++] = crc32 >> 16 & 255;
      output[op1++] = output[op2++] = crc32 >> 24 & 255;
      size = file.buffer.length;
      output[op1++] = output[op2++] = size & 255;
      output[op1++] = output[op2++] = size >> 8 & 255;
      output[op1++] = output[op2++] = size >> 16 & 255;
      output[op1++] = output[op2++] = size >> 24 & 255;
      plainSize = file.size;
      output[op1++] = output[op2++] = plainSize & 255;
      output[op1++] = output[op2++] = plainSize >> 8 & 255;
      output[op1++] = output[op2++] = plainSize >> 16 & 255;
      output[op1++] = output[op2++] = plainSize >> 24 & 255;
      output[op1++] = output[op2++] = filenameLength & 255;
      output[op1++] = output[op2++] = filenameLength >> 8 & 255;
      output[op1++] = output[op2++] = extraFieldLength & 255;
      output[op1++] = output[op2++] = extraFieldLength >> 8 & 255;
      output[op2++] = commentLength & 255;
      output[op2++] = commentLength >> 8 & 255;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = offset & 255;
      output[op2++] = offset >> 8 & 255;
      output[op2++] = offset >> 16 & 255;
      output[op2++] = offset >> 24 & 255;
      filename = file.option["filename"];
      if(filename) {
        if(USE_TYPEDARRAY) {
          output.set(filename, op1);
          output.set(filename, op2);
          op1 += filenameLength;
          op2 += filenameLength
        }else {
          for(j = 0;j < filenameLength;++j) {
            output[op1++] = output[op2++] = filename[j]
          }
        }
      }
      extraField = file.option["extraField"];
      if(extraField) {
        if(USE_TYPEDARRAY) {
          output.set(extraField, op1);
          output.set(extraField, op2);
          op1 += extraFieldLength;
          op2 += extraFieldLength
        }else {
          for(j = 0;j < commentLength;++j) {
            output[op1++] = output[op2++] = extraField[j]
          }
        }
      }
      comment = file.option["comment"];
      if(comment) {
        if(USE_TYPEDARRAY) {
          output.set(comment, op2);
          op2 += commentLength
        }else {
          for(j = 0;j < commentLength;++j) {
            output[op2++] = comment[j]
          }
        }
      }
      if(USE_TYPEDARRAY) {
        output.set(file.buffer, op1);
        op1 += file.buffer.length
      }else {
        for(j = 0, jl = file.buffer.length;j < jl;++j) {
          output[op1++] = file.buffer[j]
        }
      }
    }
    output[op3++] = Zlib.Zip.CentralDirectorySignature[0];
    output[op3++] = Zlib.Zip.CentralDirectorySignature[1];
    output[op3++] = Zlib.Zip.CentralDirectorySignature[2];
    output[op3++] = Zlib.Zip.CentralDirectorySignature[3];
    output[op3++] = 0;
    output[op3++] = 0;
    output[op3++] = 0;
    output[op3++] = 0;
    output[op3++] = il & 255;
    output[op3++] = il >> 8 & 255;
    output[op3++] = il & 255;
    output[op3++] = il >> 8 & 255;
    output[op3++] = centralDirectorySize & 255;
    output[op3++] = centralDirectorySize >> 8 & 255;
    output[op3++] = centralDirectorySize >> 16 & 255;
    output[op3++] = centralDirectorySize >> 24 & 255;
    output[op3++] = localFileSize & 255;
    output[op3++] = localFileSize >> 8 & 255;
    output[op3++] = localFileSize >> 16 & 255;
    output[op3++] = localFileSize >> 24 & 255;
    commentLength = this.comment ? this.comment.length : 0;
    output[op3++] = commentLength & 255;
    output[op3++] = commentLength >> 8 & 255;
    if(this.comment) {
      if(USE_TYPEDARRAY) {
        output.set(this.comment, op3);
        op3 += commentLength
      }else {
        for(j = 0, jl = commentLength;j < jl;++j) {
          output[op3++] = this.comment[j]
        }
      }
    }
    return output
  };
  Zlib.Zip.prototype.deflateWithOption = function(input, opt_params) {
    var deflator = new Zlib.RawDeflate(input, opt_params["deflateOption"]);
    return deflator.compress()
  };
  Zlib.Zip.prototype.getByte = function(key) {
    var tmp = key[2] & 65535 | 2;
    return tmp * (tmp ^ 1) >> 8 & 255
  };
  Zlib.Zip.prototype.encode = function(key, n) {
    var tmp = this.getByte((key));
    this.updateKeys((key), n);
    return tmp ^ n
  };
  Zlib.Zip.prototype.updateKeys = function(key, n) {
    key[0] = Zlib.CRC32.single(key[0], n);
    key[1] = (((key[1] + (key[0] & 255)) * 20173 >>> 0) * 6681 >>> 0) + 1 >>> 0;
    key[2] = Zlib.CRC32.single(key[2], key[1] >>> 24)
  };
  Zlib.Zip.prototype.createEncryptionKey = function(password) {
    var key = [305419896, 591751049, 878082192];
    var i;
    var il;
    if(USE_TYPEDARRAY) {
      key = new Uint32Array(key)
    }
    for(i = 0, il = password.length;i < il;++i) {
      this.updateKeys(key, password[i] & 255)
    }
    return key
  }
});
goog.provide("Zlib.Unzip");
goog.require("USE_TYPEDARRAY");
goog.require("FixPhantomJSFunctionApplyBug_StringFromCharCode");
goog.require("Zlib.RawInflate");
goog.require("Zlib.CRC32");
goog.require("Zlib.Zip");
goog.scope(function() {
  Zlib.Unzip = function(input, opt_params) {
    opt_params = opt_params || {};
    this.input = USE_TYPEDARRAY && input instanceof Array ? new Uint8Array(input) : input;
    this.ip = 0;
    this.eocdrOffset;
    this.numberOfThisDisk;
    this.startDisk;
    this.totalEntriesThisDisk;
    this.totalEntries;
    this.centralDirectorySize;
    this.centralDirectoryOffset;
    this.commentLength;
    this.comment;
    this.fileHeaderList;
    this.filenameToIndex;
    this.verify = opt_params["verify"] || false;
    this.password = opt_params["password"]
  };
  Zlib.Unzip.CompressionMethod = Zlib.Zip.CompressionMethod;
  Zlib.Unzip.FileHeaderSignature = Zlib.Zip.FileHeaderSignature;
  Zlib.Unzip.LocalFileHeaderSignature = Zlib.Zip.LocalFileHeaderSignature;
  Zlib.Unzip.CentralDirectorySignature = Zlib.Zip.CentralDirectorySignature;
  Zlib.Unzip.FileHeader = function(input, ip) {
    this.input = input;
    this.offset = ip;
    this.length;
    this.version;
    this.os;
    this.needVersion;
    this.flags;
    this.compression;
    this.time;
    this.date;
    this.crc32;
    this.compressedSize;
    this.plainSize;
    this.fileNameLength;
    this.extraFieldLength;
    this.fileCommentLength;
    this.diskNumberStart;
    this.internalFileAttributes;
    this.externalFileAttributes;
    this.relativeOffset;
    this.filename;
    this.extraField;
    this.comment
  };
  Zlib.Unzip.FileHeader.prototype.parse = function() {
    var input = this.input;
    var ip = this.offset;
    if(input[ip++] !== Zlib.Unzip.FileHeaderSignature[0] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[1] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[2] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[3]) {
      throw new Error("invalid file header signature");
    }
    this.version = input[ip++];
    this.os = input[ip++];
    this.needVersion = input[ip++] | input[ip++] << 8;
    this.flags = input[ip++] | input[ip++] << 8;
    this.compression = input[ip++] | input[ip++] << 8;
    this.time = input[ip++] | input[ip++] << 8;
    this.date = input[ip++] | input[ip++] << 8;
    this.crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.compressedSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.plainSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.fileNameLength = input[ip++] | input[ip++] << 8;
    this.extraFieldLength = input[ip++] | input[ip++] << 8;
    this.fileCommentLength = input[ip++] | input[ip++] << 8;
    this.diskNumberStart = input[ip++] | input[ip++] << 8;
    this.internalFileAttributes = input[ip++] | input[ip++] << 8;
    this.externalFileAttributes = input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24;
    this.relativeOffset = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.filename = String.fromCharCode.apply(null, USE_TYPEDARRAY ? input.subarray(ip, ip += this.fileNameLength) : input.slice(ip, ip += this.fileNameLength));
    this.extraField = USE_TYPEDARRAY ? input.subarray(ip, ip += this.extraFieldLength) : input.slice(ip, ip += this.extraFieldLength);
    this.comment = USE_TYPEDARRAY ? input.subarray(ip, ip + this.fileCommentLength) : input.slice(ip, ip + this.fileCommentLength);
    this.length = ip - this.offset
  };
  Zlib.Unzip.LocalFileHeader = function(input, ip) {
    this.input = input;
    this.offset = ip;
    this.length;
    this.needVersion;
    this.flags;
    this.compression;
    this.time;
    this.date;
    this.crc32;
    this.compressedSize;
    this.plainSize;
    this.fileNameLength;
    this.extraFieldLength;
    this.filename;
    this.extraField
  };
  Zlib.Unzip.LocalFileHeader.Flags = Zlib.Zip.Flags;
  Zlib.Unzip.LocalFileHeader.prototype.parse = function() {
    var input = this.input;
    var ip = this.offset;
    if(input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[0] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[1] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[2] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[3]) {
      throw new Error("invalid local file header signature");
    }
    this.needVersion = input[ip++] | input[ip++] << 8;
    this.flags = input[ip++] | input[ip++] << 8;
    this.compression = input[ip++] | input[ip++] << 8;
    this.time = input[ip++] | input[ip++] << 8;
    this.date = input[ip++] | input[ip++] << 8;
    this.crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.compressedSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.plainSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.fileNameLength = input[ip++] | input[ip++] << 8;
    this.extraFieldLength = input[ip++] | input[ip++] << 8;
    this.filename = String.fromCharCode.apply(null, USE_TYPEDARRAY ? input.subarray(ip, ip += this.fileNameLength) : input.slice(ip, ip += this.fileNameLength));
    this.extraField = USE_TYPEDARRAY ? input.subarray(ip, ip += this.extraFieldLength) : input.slice(ip, ip += this.extraFieldLength);
    this.length = ip - this.offset
  };
  Zlib.Unzip.prototype.searchEndOfCentralDirectoryRecord = function() {
    var input = this.input;
    var ip;
    for(ip = input.length - 12;ip > 0;--ip) {
      if(input[ip] === Zlib.Unzip.CentralDirectorySignature[0] && input[ip + 1] === Zlib.Unzip.CentralDirectorySignature[1] && input[ip + 2] === Zlib.Unzip.CentralDirectorySignature[2] && input[ip + 3] === Zlib.Unzip.CentralDirectorySignature[3]) {
        this.eocdrOffset = ip;
        return
      }
    }
    throw new Error("End of Central Directory Record not found");
  };
  Zlib.Unzip.prototype.parseEndOfCentralDirectoryRecord = function() {
    var input = this.input;
    var ip;
    if(!this.eocdrOffset) {
      this.searchEndOfCentralDirectoryRecord()
    }
    ip = this.eocdrOffset;
    if(input[ip++] !== Zlib.Unzip.CentralDirectorySignature[0] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[1] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[2] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[3]) {
      throw new Error("invalid signature");
    }
    this.numberOfThisDisk = input[ip++] | input[ip++] << 8;
    this.startDisk = input[ip++] | input[ip++] << 8;
    this.totalEntriesThisDisk = input[ip++] | input[ip++] << 8;
    this.totalEntries = input[ip++] | input[ip++] << 8;
    this.centralDirectorySize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.centralDirectoryOffset = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.commentLength = input[ip++] | input[ip++] << 8;
    this.comment = USE_TYPEDARRAY ? input.subarray(ip, ip + this.commentLength) : input.slice(ip, ip + this.commentLength)
  };
  Zlib.Unzip.prototype.parseFileHeader = function() {
    var filelist = [];
    var filetable = {};
    var ip;
    var fileHeader;
    var i;
    var il;
    if(this.fileHeaderList) {
      return
    }
    if(this.centralDirectoryOffset === void 0) {
      this.parseEndOfCentralDirectoryRecord()
    }
    ip = this.centralDirectoryOffset;
    for(i = 0, il = this.totalEntries;i < il;++i) {
      fileHeader = new Zlib.Unzip.FileHeader(this.input, ip);
      fileHeader.parse();
      ip += fileHeader.length;
      filelist[i] = fileHeader;
      filetable[fileHeader.filename] = i
    }
    if(this.centralDirectorySize < ip - this.centralDirectoryOffset) {
      throw new Error("invalid file header size");
    }
    this.fileHeaderList = filelist;
    this.filenameToIndex = filetable
  };
  Zlib.Unzip.prototype.getFileData = function(index, opt_params) {
    opt_params = opt_params || {};
    var input = this.input;
    var fileHeaderList = this.fileHeaderList;
    var localFileHeader;
    var offset;
    var length;
    var buffer;
    var crc32;
    var key;
    var i;
    var il;
    if(!fileHeaderList) {
      this.parseFileHeader()
    }
    if(fileHeaderList[index] === void 0) {
      throw new Error("wrong index");
    }
    offset = fileHeaderList[index].relativeOffset;
    localFileHeader = new Zlib.Unzip.LocalFileHeader(this.input, offset);
    localFileHeader.parse();
    offset += localFileHeader.length;
    length = localFileHeader.compressedSize;
    if((localFileHeader.flags & Zlib.Unzip.LocalFileHeader.Flags.ENCRYPT) !== 0) {
      if(!(opt_params["password"] || this.password)) {
        throw new Error("please set password");
      }
      key = this.createDecryptionKey(opt_params["password"] || this.password);
      for(i = offset, il = offset + 12;i < il;++i) {
        this.decode(key, input[i])
      }
      offset += 12;
      length -= 12;
      for(i = offset, il = offset + length;i < il;++i) {
        input[i] = this.decode(key, input[i])
      }
    }
    switch(localFileHeader.compression) {
      case Zlib.Unzip.CompressionMethod.STORE:
        buffer = USE_TYPEDARRAY ? this.input.subarray(offset, offset + length) : this.input.slice(offset, offset + length);
        break;
      case Zlib.Unzip.CompressionMethod.DEFLATE:
        buffer = (new Zlib.RawInflate(this.input, {"index":offset, "bufferSize":localFileHeader.plainSize})).decompress();
        break;
      default:
        throw new Error("unknown compression type");
    }
    if(this.verify) {
      crc32 = Zlib.CRC32.calc(buffer);
      if(localFileHeader.crc32 !== crc32) {
        throw new Error("wrong crc: file=0x" + localFileHeader.crc32.toString(16) + ", data=0x" + crc32.toString(16));
      }
    }
    return buffer
  };
  Zlib.Unzip.prototype.getFilenames = function() {
    var filenameList = [];
    var i;
    var il;
    var fileHeaderList;
    if(!this.fileHeaderList) {
      this.parseFileHeader()
    }
    fileHeaderList = this.fileHeaderList;
    for(i = 0, il = fileHeaderList.length;i < il;++i) {
      filenameList[i] = fileHeaderList[i].filename
    }
    return filenameList
  };
  Zlib.Unzip.prototype.decompress = function(filename, opt_params) {
    var index;
    if(!this.filenameToIndex) {
      this.parseFileHeader()
    }
    index = this.filenameToIndex[filename];
    if(index === void 0) {
      throw new Error(filename + " not found");
    }
    return this.getFileData(index, opt_params)
  };
  Zlib.Unzip.prototype.setPassword = function(password) {
    this.password = password
  };
  Zlib.Unzip.prototype.decode = function(key, n) {
    n ^= this.getByte((key));
    this.updateKeys((key), n);
    return n
  };
  Zlib.Unzip.prototype.updateKeys = Zlib.Zip.prototype.updateKeys;
  Zlib.Unzip.prototype.createDecryptionKey = Zlib.Zip.prototype.createEncryptionKey;
  Zlib.Unzip.prototype.getByte = Zlib.Zip.prototype.getByte
});
goog.provide("Zlib");
goog.scope(function() {
  Zlib.CompressionMethod = {DEFLATE:8, RESERVED:15}
});
goog.provide("Zlib.Deflate");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib");
goog.require("Zlib.Adler32");
goog.require("Zlib.RawDeflate");
goog.scope(function() {
  Zlib.Deflate = function(input, opt_params) {
    this.input = input;
    this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.Deflate.DefaultBufferSize);
    this.compressionType = Zlib.Deflate.CompressionType.DYNAMIC;
    this.rawDeflate;
    var rawDeflateOption = {};
    var prop;
    if(opt_params || !(opt_params = {})) {
      if(typeof opt_params["compressionType"] === "number") {
        this.compressionType = opt_params["compressionType"]
      }
    }
    for(prop in opt_params) {
      rawDeflateOption[prop] = opt_params[prop]
    }
    rawDeflateOption["outputBuffer"] = this.output;
    this.rawDeflate = new Zlib.RawDeflate(this.input, rawDeflateOption)
  };
  Zlib.Deflate.DefaultBufferSize = 32768;
  Zlib.Deflate.CompressionType = Zlib.RawDeflate.CompressionType;
  Zlib.Deflate.compress = function(input, opt_params) {
    return(new Zlib.Deflate(input, opt_params)).compress()
  };
  Zlib.Deflate.prototype.compress = function() {
    var cm;
    var cinfo;
    var cmf;
    var flg;
    var fcheck;
    var fdict;
    var flevel;
    var clevel;
    var adler;
    var error = false;
    var output;
    var pos = 0;
    output = this.output;
    cm = Zlib.CompressionMethod.DEFLATE;
    switch(cm) {
      case Zlib.CompressionMethod.DEFLATE:
        cinfo = Math.LOG2E * Math.log(Zlib.RawDeflate.WindowSize) - 8;
        break;
      default:
        throw new Error("invalid compression method");
    }
    cmf = cinfo << 4 | cm;
    output[pos++] = cmf;
    fdict = 0;
    switch(cm) {
      case Zlib.CompressionMethod.DEFLATE:
        switch(this.compressionType) {
          case Zlib.Deflate.CompressionType.NONE:
            flevel = 0;
            break;
          case Zlib.Deflate.CompressionType.FIXED:
            flevel = 1;
            break;
          case Zlib.Deflate.CompressionType.DYNAMIC:
            flevel = 2;
            break;
          default:
            throw new Error("unsupported compression type");
        }
        break;
      default:
        throw new Error("invalid compression method");
    }
    flg = flevel << 6 | fdict << 5;
    fcheck = 31 - (cmf * 256 + flg) % 31;
    flg |= fcheck;
    output[pos++] = flg;
    adler = Zlib.Adler32(this.input);
    this.rawDeflate.op = pos;
    output = this.rawDeflate.compress();
    pos = output.length;
    if(USE_TYPEDARRAY) {
      output = new Uint8Array(output.buffer);
      if(output.length <= pos + 4) {
        this.output = new Uint8Array(output.length + 4);
        this.output.set(output);
        output = this.output
      }
      output = output.subarray(0, pos + 4)
    }
    output[pos++] = adler >> 24 & 255;
    output[pos++] = adler >> 16 & 255;
    output[pos++] = adler >> 8 & 255;
    output[pos++] = adler & 255;
    return output
  }
});
goog.provide("Zlib.exportObject");
goog.require("Zlib");
goog.scope(function() {
  Zlib.exportObject = function(enumString, exportKeyValue) {
    var keys;
    var key;
    var i;
    var il;
    if(Object.keys) {
      keys = Object.keys(exportKeyValue)
    }else {
      keys = [];
      i = 0;
      for(key in exportKeyValue) {
        keys[i++] = key
      }
    }
    for(i = 0, il = keys.length;i < il;++i) {
      key = keys[i];
      goog.exportSymbol(enumString + "." + key, exportKeyValue[key])
    }
  }
});
goog.provide("Zlib.InflateStream");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib");
goog.require("Zlib.RawInflateStream");
goog.scope(function() {
  Zlib.InflateStream = function(input) {
    this.input = input === void 0 ? new (USE_TYPEDARRAY ? Uint8Array : Array) : input;
    this.ip = 0;
    this.rawinflate = new Zlib.RawInflateStream(this.input, this.ip);
    this.method;
    this.output = this.rawinflate.output
  };
  Zlib.InflateStream.prototype.decompress = function(input) {
    var buffer;
    var adler32;
    if(input !== void 0) {
      if(USE_TYPEDARRAY) {
        var tmp = new Uint8Array(this.input.length + input.length);
        tmp.set(this.input, 0);
        tmp.set(input, this.input.length);
        this.input = tmp
      }else {
        this.input = this.input.concat(input)
      }
    }
    if(this.method === void 0) {
      if(this.readHeader() < 0) {
        return new (USE_TYPEDARRAY ? Uint8Array : Array)
      }
    }
    buffer = this.rawinflate.decompress(this.input, this.ip);
    if(this.rawinflate.ip !== 0) {
      this.input = USE_TYPEDARRAY ? this.input.subarray(this.rawinflate.ip) : this.input.slice(this.rawinflate.ip);
      this.ip = 0
    }
    return buffer
  };
  Zlib.InflateStream.prototype.readHeader = function() {
    var ip = this.ip;
    var input = this.input;
    var cmf = input[ip++];
    var flg = input[ip++];
    if(cmf === void 0 || flg === void 0) {
      return-1
    }
    switch(cmf & 15) {
      case Zlib.CompressionMethod.DEFLATE:
        this.method = Zlib.CompressionMethod.DEFLATE;
        break;
      default:
        throw new Error("unsupported compression method");
    }
    if(((cmf << 8) + flg) % 31 !== 0) {
      throw new Error("invalid fcheck flag:" + ((cmf << 8) + flg) % 31);
    }
    if(flg & 32) {
      throw new Error("fdict flag is not supported");
    }
    this.ip = ip
  }
});
goog.require("Zlib.Adler32");
goog.exportSymbol("Zlib.Adler32", Zlib.Adler32);
goog.exportSymbol("Zlib.Adler32.update", Zlib.Adler32.update);
goog.require("Zlib.CRC32");
goog.exportSymbol("Zlib.CRC32", Zlib.CRC32);
goog.exportSymbol("Zlib.CRC32.calc", Zlib.CRC32.calc);
goog.exportSymbol("Zlib.CRC32.update", Zlib.CRC32.update);
goog.require("Zlib.Deflate");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.Deflate", Zlib.Deflate);
goog.exportSymbol("Zlib.Deflate.compress", Zlib.Deflate.compress);
goog.exportSymbol("Zlib.Deflate.prototype.compress", Zlib.Deflate.prototype.compress);
Zlib.exportObject("Zlib.Deflate.CompressionType", {"NONE":Zlib.Deflate.CompressionType.NONE, "FIXED":Zlib.Deflate.CompressionType.FIXED, "DYNAMIC":Zlib.Deflate.CompressionType.DYNAMIC});
goog.require("Zlib.GunzipMember");
goog.exportSymbol("Zlib.GunzipMember", Zlib.GunzipMember);
goog.exportSymbol("Zlib.GunzipMember.prototype.getName", Zlib.GunzipMember.prototype.getName);
goog.exportSymbol("Zlib.GunzipMember.prototype.getData", Zlib.GunzipMember.prototype.getData);
goog.exportSymbol("Zlib.GunzipMember.prototype.getMtime", Zlib.GunzipMember.prototype.getMtime);
goog.require("Zlib.Gunzip");
goog.exportSymbol("Zlib.Gunzip", Zlib.Gunzip);
goog.exportSymbol("Zlib.Gunzip.prototype.decompress", Zlib.Gunzip.prototype.decompress);
goog.exportSymbol("Zlib.Gunzip.prototype.getMembers", Zlib.Gunzip.prototype.getMembers);
goog.require("Zlib.Gzip");
goog.exportSymbol("Zlib.Gzip", Zlib.Gzip);
goog.exportSymbol("Zlib.Gzip.prototype.compress", Zlib.Gzip.prototype.compress);
goog.require("Zlib.InflateStream");
goog.exportSymbol("Zlib.InflateStream", Zlib.InflateStream);
goog.exportSymbol("Zlib.InflateStream.prototype.decompress", Zlib.InflateStream.prototype.decompress);
goog.require("Zlib.Inflate");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.Inflate", Zlib.Inflate);
goog.exportSymbol("Zlib.Inflate.prototype.decompress", Zlib.Inflate.prototype.decompress);
Zlib.exportObject("Zlib.Inflate.BufferType", {"ADAPTIVE":Zlib.Inflate.BufferType.ADAPTIVE, "BLOCK":Zlib.Inflate.BufferType.BLOCK});
goog.require("Zlib.RawDeflate");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.RawDeflate", Zlib.RawDeflate);
goog.exportSymbol("Zlib.RawDeflate.prototype.compress", Zlib.RawDeflate.prototype.compress);
Zlib.exportObject("Zlib.RawDeflate.CompressionType", {"NONE":Zlib.RawDeflate.CompressionType.NONE, "FIXED":Zlib.RawDeflate.CompressionType.FIXED, "DYNAMIC":Zlib.RawDeflate.CompressionType.DYNAMIC});
goog.require("Zlib.RawInflateStream");
goog.exportSymbol("Zlib.RawInflateStream", Zlib.RawInflateStream);
goog.exportSymbol("Zlib.RawInflateStream.prototype.decompress", Zlib.RawInflateStream.prototype.decompress);
goog.require("Zlib.RawInflate");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.RawInflate", Zlib.RawInflate);
goog.exportSymbol("Zlib.RawInflate.prototype.decompress", Zlib.RawInflate.prototype.decompress);
Zlib.exportObject("Zlib.RawInflate.BufferType", {"ADAPTIVE":Zlib.RawInflate.BufferType.ADAPTIVE, "BLOCK":Zlib.RawInflate.BufferType.BLOCK});
goog.require("Zlib.Unzip");
goog.exportSymbol("Zlib.Unzip", Zlib.Unzip);
goog.exportSymbol("Zlib.Unzip.prototype.decompress", Zlib.Unzip.prototype.decompress);
goog.exportSymbol("Zlib.Unzip.prototype.getFilenames", Zlib.Unzip.prototype.getFilenames);
goog.exportSymbol("Zlib.Unzip.prototype.setPassword", Zlib.Unzip.prototype.setPassword);
goog.require("Zlib.Zip");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.Zip", Zlib.Zip);
goog.exportSymbol("Zlib.Zip.prototype.addFile", Zlib.Zip.prototype.addFile);
goog.exportSymbol("Zlib.Zip.prototype.compress", Zlib.Zip.prototype.compress);
goog.exportSymbol("Zlib.Zip.prototype.setPassword", Zlib.Zip.prototype.setPassword);
Zlib.exportObject("Zlib.Zip.CompressionMethod", {"STORE":Zlib.Zip.CompressionMethod.STORE, "DEFLATE":Zlib.Zip.CompressionMethod.DEFLATE});
Zlib.exportObject("Zlib.Zip.OperatingSystem", {"MSDOS":Zlib.Zip.OperatingSystem.MSDOS, "UNIX":Zlib.Zip.OperatingSystem.UNIX, "MACINTOSH":Zlib.Zip.OperatingSystem.MACINTOSH});
}).call(this);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluL3psaWIucHJldHR5LmpzIiwibGluZUNvdW50IjozNzUxLCJtYXBwaW5ncyI6IkEsbUhBNEJBLElBQUlBLFdBQVcsS0FVZjtJQUFJQyxPQUFPQSxJQUFQQSxJQUFlLEVBTW5CQTtJQUFBQyxPQUFBLEdBQWMsSUFXZEQ7SUFBQUUsTUFBQSxHQUFhLElBc0JiRjtJQUFBRyxPQUFBLEdBQWMsSUFZZEg7SUFBQUksUUFBQSxHQUFlQyxRQUFRLENBQUNDLElBQUQsQ0FBTztBQUM1QixLQUFJLENBQUNQLFFBQUwsQ0FBZTtBQU1iLE9BQUlDLElBQUFPLFlBQUEsQ0FBaUJELElBQWpCLENBQUo7QUFDRSxXQUFNRSxNQUFBLENBQU0sYUFBTixHQUFzQkYsSUFBdEIsR0FBNkIscUJBQTdCLENBQU4sQ0FERjs7QUFHQSxXQUFPTixJQUFBUyxvQkFBQSxDQUF5QkgsSUFBekIsQ0FFUDtRQUFJSSxZQUFZSixJQUNoQjtVQUFRSSxTQUFSLEdBQW9CQSxTQUFBQyxVQUFBLENBQW9CLENBQXBCLEVBQXVCRCxTQUFBRSxZQUFBLENBQXNCLEdBQXRCLENBQXZCLENBQXBCLENBQXlFO0FBQ3ZFLFNBQUlaLElBQUFhLGdCQUFBLENBQXFCSCxTQUFyQixDQUFKO0FBQ0UsYUFERjs7QUFHQVYsVUFBQVMsb0JBQUEsQ0FBeUJDLFNBQXpCLENBQUEsR0FBc0MsSUFKaUM7O0FBWjVEO0FBb0JmVixNQUFBYyxZQUFBLENBQWlCUixJQUFqQixDQXJCNEI7Q0ErQjlCTjtJQUFBZSxZQUFBLEdBQW1CQyxRQUFRLENBQUNDLFdBQUQsQ0FBYztBQUN2QyxLQUFJbEIsUUFBSixJQUFnQixDQUFDQyxJQUFBRSxNQUFqQixDQUE2QjtBQUMzQmUsZUFBQSxHQUFjQSxXQUFkLElBQTZCLEVBQzdCO1NBQU1ULE1BQUEsQ0FBTSxxREFDQSxHQUFBUyxXQUFBLEdBQWMsSUFBZCxHQUFxQkEsV0FBckIsR0FBbUMsR0FEekMsQ0FBTixDQUYyQjs7QUFEVSxDQVN6QztHQUFJLENBQUNsQixRQUFMLENBQWU7QUFTYkMsTUFBQU8sWUFBQSxHQUFtQlcsUUFBUSxDQUFDWixJQUFELENBQU87QUFDaEMsVUFBTyxDQUFDTixJQUFBUyxvQkFBQSxDQUF5QkgsSUFBekIsQ0FBUixJQUEwQyxDQUFDLENBQUNOLElBQUFhLGdCQUFBLENBQXFCUCxJQUFyQixDQURaO0dBWWxDTjtNQUFBUyxvQkFBQSxHQUEyQixFQXJCZDs7QUFxQ2ZULElBQUFjLFlBQUEsR0FBbUJLLFFBQVEsQ0FBQ2IsSUFBRCxFQUFPYyxVQUFQLEVBQW1CQyxvQkFBbkIsQ0FBeUM7QUFDbEUsTUFBSUMsUUFBUWhCLElBQUFpQixNQUFBLENBQVcsR0FBWCxDQUNaO01BQUlDLE1BQU1ILG9CQUFORyxJQUE4QnhCLElBQUFDLE9BS2xDO0tBQUksRUFBRXFCLEtBQUEsQ0FBTSxDQUFOLENBQUYsSUFBY0UsR0FBZCxDQUFKLElBQTBCQSxHQUFBQyxXQUExQjtBQUNFRCxPQUFBQyxXQUFBLENBQWUsTUFBZixHQUF3QkgsS0FBQSxDQUFNLENBQU4sQ0FBeEIsQ0FERjs7QUFVQSxNQUFLLElBQUlJLElBQVQsQ0FBZUosS0FBQUssT0FBZixLQUFnQ0QsSUFBaEMsR0FBdUNKLEtBQUFNLE1BQUEsRUFBdkMsRUFBQTtBQUNFLE9BQUksQ0FBQ04sS0FBQUssT0FBTCxJQUFxQjNCLElBQUE2QixNQUFBLENBQVdULFVBQVgsQ0FBckI7QUFFRUksU0FBQSxDQUFJRSxJQUFKLENBQUEsR0FBWU4sVUFGZDs7QUFHTyxTQUFJSSxHQUFBLENBQUlFLElBQUosQ0FBSjtBQUNMRixXQUFBLEdBQU1BLEdBQUEsQ0FBSUUsSUFBSixDQUREOztBQUdMRixXQUFBLEdBQU1BLEdBQUEsQ0FBSUUsSUFBSixDQUFOLEdBQWtCLEVBSGI7O0FBSFA7QUFERjtBQWpCa0UsQ0F3Q3BFMUI7SUFBQWEsZ0JBQUEsR0FBdUJpQixRQUFRLENBQUN4QixJQUFELEVBQU95QixPQUFQLENBQWdCO0FBQzdDLE1BQUlULFFBQVFoQixJQUFBaUIsTUFBQSxDQUFXLEdBQVgsQ0FDWjtNQUFJQyxNQUFNTyxPQUFOUCxJQUFpQnhCLElBQUFDLE9BQ3JCO01BQUssSUFBSXlCLElBQVQsQ0FBZUEsSUFBZixHQUFzQkosS0FBQU0sTUFBQSxFQUF0QixDQUFBO0FBQ0UsT0FBSTVCLElBQUFnQyxnQkFBQSxDQUFxQlIsR0FBQSxDQUFJRSxJQUFKLENBQXJCLENBQUo7QUFDRUYsU0FBQSxHQUFNQSxHQUFBLENBQUlFLElBQUosQ0FEUjs7QUFHRSxZQUFPLEtBSFQ7O0FBREY7QUFPQSxRQUFPRixJQVZzQztDQXNCL0N4QjtJQUFBaUMsVUFBQSxHQUFpQkMsUUFBUSxDQUFDQyxHQUFELEVBQU1DLFVBQU4sQ0FBa0I7QUFDekMsTUFBSW5DLFNBQVNtQyxVQUFUbkMsSUFBdUJELElBQUFDLE9BQzNCO01BQUssSUFBSW9DLENBQVQsR0FBY0YsSUFBZDtBQUNFbEMsVUFBQSxDQUFPb0MsQ0FBUCxDQUFBLEdBQVlGLEdBQUEsQ0FBSUUsQ0FBSixDQURkOztBQUZ5QyxDQWdCM0NyQztJQUFBc0MsY0FBQSxHQUFxQkMsUUFBUSxDQUFDQyxPQUFELEVBQVVDLFFBQVYsRUFBb0JDLFFBQXBCLENBQThCO0FBQ3pELEtBQUksQ0FBQzNDLFFBQUwsQ0FBZTtBQUNiLFFBQUlLLE9BQUosRUFBYXVDLE9BQ2I7UUFBSUMsT0FBT0osT0FBQUssUUFBQSxDQUFnQixLQUFoQixFQUF1QixHQUF2QixDQUNYO1FBQUlDLE9BQU85QyxJQUFBK0MsY0FDWDtRQUFLLElBQUlDLElBQUksQ0FBYixDQUFnQjVDLE9BQWhCLEdBQTBCcUMsUUFBQSxDQUFTTyxDQUFULENBQTFCLENBQXVDQSxDQUFBLEVBQXZDLENBQTRDO0FBQzFDRixVQUFBRyxXQUFBLENBQWdCN0MsT0FBaEIsQ0FBQSxHQUEyQndDLElBQzNCO1NBQUksRUFBRUEsSUFBRixJQUFVRSxJQUFBSSxZQUFWLENBQUo7QUFDRUosWUFBQUksWUFBQSxDQUFpQk4sSUFBakIsQ0FBQSxHQUF5QixFQUQzQjs7QUFHQUUsVUFBQUksWUFBQSxDQUFpQk4sSUFBakIsQ0FBQSxDQUF1QnhDLE9BQXZCLENBQUEsR0FBa0MsSUFMUTs7QUFPNUMsUUFBSyxJQUFJK0MsSUFBSSxDQUFiLENBQWdCUixPQUFoQixHQUEwQkQsUUFBQSxDQUFTUyxDQUFULENBQTFCLENBQXVDQSxDQUFBLEVBQXZDLENBQTRDO0FBQzFDLFNBQUksRUFBRVAsSUFBRixJQUFVRSxJQUFBSixTQUFWLENBQUo7QUFDRUksWUFBQUosU0FBQSxDQUFjRSxJQUFkLENBQUEsR0FBc0IsRUFEeEI7O0FBR0FFLFVBQUFKLFNBQUEsQ0FBY0UsSUFBZCxDQUFBLENBQW9CRCxPQUFwQixDQUFBLEdBQStCLElBSlc7O0FBWC9CO0FBRDBDLENBb0QzRDNDO0lBQUFvRCxvQkFBQSxHQUEyQixJQVkzQnBEO0lBQUEyQyxRQUFBLEdBQWVVLFFBQVEsQ0FBQy9DLElBQUQsQ0FBTztBQVE1QixLQUFJLENBQUNQLFFBQUwsQ0FBZTtBQUNiLE9BQUlDLElBQUFPLFlBQUEsQ0FBaUJELElBQWpCLENBQUo7QUFDRSxZQURGOztBQUlBLE9BQUlOLElBQUFvRCxvQkFBSixDQUE4QjtBQUM1QixVQUFJUixPQUFPNUMsSUFBQXNELGlCQUFBLENBQXNCaEQsSUFBdEIsQ0FDWDtTQUFJc0MsSUFBSixDQUFVO0FBQ1I1QyxZQUFBdUQsVUFBQSxDQUFlWCxJQUFmLENBQUEsR0FBdUIsSUFDdkI1QztZQUFBd0QsY0FBQSxFQUNBO2NBSFE7O0FBRmtCO0FBUzlCLFFBQUlDLGVBQWUsK0JBQWZBLEdBQWlEbkQsSUFDckQ7T0FBSU4sSUFBQUMsT0FBQXlELFFBQUo7QUFDRTFELFVBQUFDLE9BQUF5RCxRQUFBLENBQW9CLE9BQXBCLENBQUEsQ0FBNkJELFlBQTdCLENBREY7O0FBS0UsU0FBTWpELE1BQUEsQ0FBTWlELFlBQU4sQ0FBTixDQXBCVzs7QUFSYSxDQXNDOUJ6RDtJQUFBMkQsU0FBQSxHQUFnQixFQU9oQjNEO0lBQUFDLE9BQUEyRCxrQkFRQTVEO0lBQUFDLE9BQUE0RCxnQkFZQTdEO0lBQUFDLE9BQUE2RCxzQkFPQTlEO0lBQUErRCxhQUFBLEdBQW9CQyxRQUFRLEVBQUc7Q0FZL0JoRTtJQUFBaUUsaUJBQUEsR0FBd0JDLFFBQVEsQ0FBQ0MsZUFBRCxFQUFrQkMsUUFBbEIsQ0FBNEI7QUFDMUQsUUFBT0QsZ0JBRG1EO0NBcUI1RG5FO0lBQUFxRSxlQUFBLEdBQXNCQyxRQUFRLEVBQUc7QUFDL0IsT0FBTTlELE1BQUEsQ0FBTSwrQkFBTixDQUFOLENBRCtCO0NBV2pDUjtJQUFBdUUsbUJBQUEsR0FBMEJDLFFBQVEsQ0FBQ0MsSUFBRCxDQUFPO0FBQ3ZDQSxNQUFBQyxZQUFBLEdBQW1CQyxRQUFRLEVBQUc7QUFDNUIsT0FBSUYsSUFBQUcsVUFBSjtBQUNFLFlBQU9ILEtBQUFHLFVBRFQ7O0FBR0EsT0FBSTVFLElBQUFFLE1BQUo7QUFFRUYsVUFBQTZFLHdCQUFBLENBQTZCN0UsSUFBQTZFLHdCQUFBbEQsT0FBN0IsQ0FBQSxHQUFvRThDLElBRnRFOztBQUlBLFVBQU9BLEtBQUFHLFVBQVAsR0FBd0IsSUFBSUgsSUFSQTtHQURTO0NBcUJ6Q3pFO0lBQUE2RSx3QkFBQSxHQUErQixFQUcvQjtHQUFJLENBQUM5RSxRQUFMLElBQWlCQyxJQUFBb0Qsb0JBQWpCLENBQTJDO0FBT3pDcEQsTUFBQXVELFVBQUEsR0FBaUIsRUFTakJ2RDtNQUFBK0MsY0FBQSxHQUFxQixhQUNOLEVBRE0sYUFFUCxFQUZPLFdBR1QsRUFIUyxVQU1WLEVBTlUsVUFPVixFQVBVLENBZ0JyQi9DO01BQUE4RSxnQkFBQSxHQUF1QkMsUUFBUSxFQUFHO0FBQ2hDLFFBQUlDLE1BQU1oRixJQUFBQyxPQUFBZ0YsU0FDVjtVQUFPLE9BQU9ELElBQWQsSUFBcUIsV0FBckIsSUFDTyxPQURQLElBQ2tCQSxHQUhjO0dBV2xDaEY7TUFBQWtGLGNBQUEsR0FBcUJDLFFBQVEsRUFBRztBQUM5QixPQUFJbkYsSUFBQUMsT0FBQTJELGtCQUFKLENBQW1DO0FBQ2pDNUQsVUFBQTJELFNBQUEsR0FBZ0IzRCxJQUFBQyxPQUFBMkQsa0JBQ2hCO1lBRmlDO0tBQW5DO0FBR08sU0FBSSxDQUFDNUQsSUFBQThFLGdCQUFBLEVBQUw7QUFDTCxjQURLOztBQUhQO0FBTUEsUUFBSUUsTUFBTWhGLElBQUFDLE9BQUFnRixTQUNWO1FBQUlHLFVBQVVKLEdBQUFLLHFCQUFBLENBQXlCLFFBQXpCLENBR2Q7UUFBSyxJQUFJckMsSUFBSW9DLE9BQUF6RCxPQUFKcUIsR0FBcUIsQ0FBOUIsQ0FBaUNBLENBQWpDLElBQXNDLENBQXRDLENBQXlDLEVBQUVBLENBQTNDLENBQThDO0FBQzVDLFVBQUlzQyxNQUFNRixPQUFBLENBQVFwQyxDQUFSLENBQUFzQyxJQUNWO1VBQUlDLFFBQVFELEdBQUExRSxZQUFBLENBQWdCLEdBQWhCLENBQ1o7VUFBSTRFLElBQUlELEtBQUEsSUFBVSxFQUFWLEdBQWNELEdBQUEzRCxPQUFkLEdBQTJCNEQsS0FDbkM7U0FBSUQsR0FBQUcsT0FBQSxDQUFXRCxDQUFYLEdBQWUsQ0FBZixFQUFrQixDQUFsQixDQUFKLElBQTRCLFNBQTVCLENBQXVDO0FBQ3JDeEYsWUFBQTJELFNBQUEsR0FBZ0IyQixHQUFBRyxPQUFBLENBQVcsQ0FBWCxFQUFjRCxDQUFkLEdBQWtCLENBQWxCLENBQ2hCO2NBRnFDOztBQUpLO0FBWGhCLEdBNkJoQ3hGO01BQUEwRixjQUFBLEdBQXFCQyxRQUFRLENBQUNMLEdBQUQsQ0FBTTtBQUNqQyxRQUFJTSxlQUFlNUYsSUFBQUMsT0FBQTZELHNCQUFmOEIsSUFDQTVGLElBQUE2RixnQkFDSjtPQUFJLENBQUM3RixJQUFBK0MsY0FBQStDLFFBQUEsQ0FBMkJSLEdBQTNCLENBQUwsSUFBd0NNLFlBQUEsQ0FBYU4sR0FBYixDQUF4QztBQUNFdEYsVUFBQStDLGNBQUErQyxRQUFBLENBQTJCUixHQUEzQixDQUFBLEdBQWtDLElBRHBDOztBQUhpQyxHQWlCbkN0RjtNQUFBNkYsZ0JBQUEsR0FBdUJFLFFBQVEsQ0FBQ1QsR0FBRCxDQUFNO0FBQ25DLE9BQUl0RixJQUFBOEUsZ0JBQUEsRUFBSixDQUE0QjtBQUMxQixVQUFJRSxNQUFNaEYsSUFBQUMsT0FBQWdGLFNBQ1ZEO1NBQUFnQixNQUFBLENBQ0ksc0NBREosR0FDNkNWLEdBRDdDLEdBQ21ELE1BRG5ELEdBQzRELFNBRDVELENBRUE7WUFBTyxLQUptQjtLQUE1QjtBQU1FLFlBQU8sTUFOVDs7QUFEbUMsR0FpQnJDdEY7TUFBQXdELGNBQUEsR0FBcUJ5QyxRQUFRLEVBQUc7QUFFOUIsUUFBSWIsVUFBVSxFQUNkO1FBQUljLGFBQWEsRUFDakI7UUFBSXBELE9BQU85QyxJQUFBK0MsY0FFWG9EO1lBQVNBLFVBQVMsQ0FBQ3ZELElBQUQsQ0FBTztBQUN2QixTQUFJQSxJQUFKLElBQVlFLElBQUFnRCxRQUFaO0FBQ0UsY0FERjs7QUFNQSxTQUFJbEQsSUFBSixJQUFZRSxJQUFBc0QsUUFBWixDQUEwQjtBQUN4QixXQUFJLEVBQUV4RCxJQUFGLElBQVVzRCxVQUFWLENBQUosQ0FBMkI7QUFDekJBLG9CQUFBLENBQVd0RCxJQUFYLENBQUEsR0FBbUIsSUFDbkJ3QztpQkFBQWlCLEtBQUEsQ0FBYXpELElBQWIsQ0FGeUI7O0FBSTNCLGNBTHdCOztBQVExQkUsVUFBQXNELFFBQUEsQ0FBYXhELElBQWIsQ0FBQSxHQUFxQixJQUVyQjtTQUFJQSxJQUFKLElBQVlFLElBQUFKLFNBQVo7QUFDRSxZQUFLLElBQUk0RCxXQUFULEdBQXdCeEQsS0FBQUosU0FBQSxDQUFjRSxJQUFkLENBQXhCO0FBR0UsYUFBSSxDQUFDNUMsSUFBQU8sWUFBQSxDQUFpQitGLFdBQWpCLENBQUw7QUFDRSxlQUFJQSxXQUFKLElBQW1CeEQsSUFBQUcsV0FBbkI7QUFDRWtELHVCQUFBLENBQVVyRCxJQUFBRyxXQUFBLENBQWdCcUQsV0FBaEIsQ0FBVixDQURGOztBQUdFLG1CQUFNOUYsTUFBQSxDQUFNLDJCQUFOLEdBQW9DOEYsV0FBcEMsQ0FBTixDQUhGOztBQURGO0FBSEY7QUFERjtBQWNBLFNBQUksRUFBRTFELElBQUYsSUFBVXNELFVBQVYsQ0FBSixDQUEyQjtBQUN6QkEsa0JBQUEsQ0FBV3RELElBQVgsQ0FBQSxHQUFtQixJQUNuQndDO2VBQUFpQixLQUFBLENBQWF6RCxJQUFiLENBRnlCOztBQS9CSixLQUF6QnVEO0FBcUNBLFFBQUssSUFBSXZELElBQVQsR0FBaUI1QyxLQUFBdUQsVUFBakI7QUFDRSxTQUFJLENBQUNULElBQUFnRCxRQUFBLENBQWFsRCxJQUFiLENBQUw7QUFDRXVELGlCQUFBLENBQVV2RCxJQUFWLENBREY7O0FBREY7QUFNQSxRQUFLLElBQUlJLElBQUksQ0FBYixDQUFnQkEsQ0FBaEIsR0FBb0JvQyxPQUFBekQsT0FBcEIsQ0FBb0NxQixDQUFBLEVBQXBDO0FBQ0UsU0FBSW9DLE9BQUEsQ0FBUXBDLENBQVIsQ0FBSjtBQUNFaEQsWUFBQTBGLGNBQUEsQ0FBbUIxRixJQUFBMkQsU0FBbkIsR0FBbUN5QixPQUFBLENBQVFwQyxDQUFSLENBQW5DLENBREY7O0FBR0UsYUFBTXhDLE1BQUEsQ0FBTSx3QkFBTixDQUFOLENBSEY7O0FBREY7QUFqRDhCLEdBa0VoQ1I7TUFBQXNELGlCQUFBLEdBQXdCaUQsUUFBUSxDQUFDQyxJQUFELENBQU87QUFDckMsT0FBSUEsSUFBSixJQUFZeEcsSUFBQStDLGNBQUFFLFdBQVo7QUFDRSxZQUFPakQsS0FBQStDLGNBQUFFLFdBQUEsQ0FBOEJ1RCxJQUE5QixDQURUOztBQUdFLFlBQU8sS0FIVDs7QUFEcUMsR0FRdkN4RztNQUFBa0YsY0FBQSxFQUdBO0tBQUksQ0FBQ2xGLElBQUFDLE9BQUE0RCxnQkFBTDtBQUNFN0QsUUFBQTBGLGNBQUEsQ0FBbUIxRixJQUFBMkQsU0FBbkIsR0FBbUMsU0FBbkMsQ0FERjs7QUF2THlDO0FBeU0zQzNELElBQUF5RyxPQUFBLEdBQWNDLFFBQVEsQ0FBQ0MsS0FBRCxDQUFRO0FBQzVCLE1BQUlDLElBQUksTUFBT0QsTUFDZjtLQUFJQyxDQUFKLElBQVMsUUFBVDtBQUNFLE9BQUlELEtBQUosQ0FBVztBQU1ULFNBQUlBLEtBQUosWUFBcUJFLEtBQXJCO0FBQ0UsY0FBTyxPQURUOztBQUVPLFdBQUlGLEtBQUosWUFBcUJHLE1BQXJCO0FBQ0wsZ0JBQU9GLEVBREY7O0FBRlA7QUFTQSxVQUFJRyxZQUFZRCxNQUFBRSxVQUFBQyxTQUFBQyxLQUFBLENBQ1csQ0FBQVAsS0FBQSxDQURYLENBS2hCO1NBQUlJLFNBQUosSUFBaUIsaUJBQWpCO0FBQ0UsY0FBTyxRQURUOztBQXNCQSxTQUFLQSxTQUFMLElBQWtCLGdCQUFsQixJQUlLLE1BQU9KLE1BQUFoRixPQUpaLElBSTRCLFFBSjVCLElBS0ssTUFBT2dGLE1BQUFRLE9BTFosSUFLNEIsV0FMNUIsSUFNSyxNQUFPUixNQUFBUyxxQkFOWixJQU0wQyxXQU4xQyxJQU9LLENBQUNULEtBQUFTLHFCQUFBLENBQTJCLFFBQTNCLENBUE47QUFVRSxjQUFPLE9BVlQ7O0FBMEJBLFNBQUtMLFNBQUwsSUFBa0IsbUJBQWxCLElBQ0ksTUFBT0osTUFBQU8sS0FEWCxJQUN5QixXQUR6QixJQUVJLE1BQU9QLE1BQUFTLHFCQUZYLElBRXlDLFdBRnpDLElBR0ksQ0FBQ1QsS0FBQVMscUJBQUEsQ0FBMkIsTUFBM0IsQ0FITDtBQUlFLGNBQU8sVUFKVDs7QUFwRVMsS0FBWDtBQTZFRSxZQUFPLE1BN0VUOztBQURGO0FBaUZPLE9BQUlSLENBQUosSUFBUyxVQUFULElBQXVCLE1BQU9ELE1BQUFPLEtBQTlCLElBQTRDLFdBQTVDO0FBTUwsWUFBTyxRQU5GOztBQWpGUDtBQXlGQSxRQUFPTixFQTNGcUI7Q0F1RzlCNUc7SUFBQTZCLE1BQUEsR0FBYXdGLFFBQVEsQ0FBQ0MsR0FBRCxDQUFNO0FBQ3pCLFFBQU9BLElBQVAsS0FBZUMsU0FEVTtDQVUzQnZIO0lBQUF3SCxPQUFBLEdBQWNDLFFBQVEsQ0FBQ0gsR0FBRCxDQUFNO0FBQzFCLFFBQU9BLElBQVAsS0FBZSxJQURXO0NBVTVCdEg7SUFBQWdDLGdCQUFBLEdBQXVCMEYsUUFBUSxDQUFDSixHQUFELENBQU07QUFFbkMsUUFBT0EsSUFBUCxJQUFjLElBRnFCO0NBV3JDdEg7SUFBQTJILFFBQUEsR0FBZUMsUUFBUSxDQUFDTixHQUFELENBQU07QUFDM0IsUUFBT3RILEtBQUF5RyxPQUFBLENBQVlhLEdBQVosQ0FBUCxJQUEyQixPQURBO0NBWTdCdEg7SUFBQTZILFlBQUEsR0FBbUJDLFFBQVEsQ0FBQ1IsR0FBRCxDQUFNO0FBQy9CLE1BQUlTLE9BQU8vSCxJQUFBeUcsT0FBQSxDQUFZYSxHQUFaLENBQ1g7UUFBT1MsS0FBUCxJQUFlLE9BQWYsSUFBMEJBLElBQTFCLElBQWtDLFFBQWxDLElBQThDLE1BQU9ULElBQUEzRixPQUFyRCxJQUFtRSxRQUZwQztDQVlqQzNCO0lBQUFnSSxXQUFBLEdBQWtCQyxRQUFRLENBQUNYLEdBQUQsQ0FBTTtBQUM5QixRQUFPdEgsS0FBQWtJLFNBQUEsQ0FBY1osR0FBZCxDQUFQLElBQTZCLE1BQU9BLElBQUFhLFlBQXBDLElBQXVELFVBRHpCO0NBVWhDbkk7SUFBQW9JLFNBQUEsR0FBZ0JDLFFBQVEsQ0FBQ2YsR0FBRCxDQUFNO0FBQzVCLFFBQU8sT0FBT0EsSUFBZCxJQUFxQixRQURPO0NBVTlCdEg7SUFBQXNJLFVBQUEsR0FBaUJDLFFBQVEsQ0FBQ2pCLEdBQUQsQ0FBTTtBQUM3QixRQUFPLE9BQU9BLElBQWQsSUFBcUIsU0FEUTtDQVUvQnRIO0lBQUF3SSxTQUFBLEdBQWdCQyxRQUFRLENBQUNuQixHQUFELENBQU07QUFDNUIsUUFBTyxPQUFPQSxJQUFkLElBQXFCLFFBRE87Q0FVOUJ0SDtJQUFBMEksV0FBQSxHQUFrQkMsUUFBUSxDQUFDckIsR0FBRCxDQUFNO0FBQzlCLFFBQU90SCxLQUFBeUcsT0FBQSxDQUFZYSxHQUFaLENBQVAsSUFBMkIsVUFERztDQVdoQ3RIO0lBQUFrSSxTQUFBLEdBQWdCVSxRQUFRLENBQUN0QixHQUFELENBQU07QUFDNUIsTUFBSVMsT0FBTyxNQUFPVCxJQUNsQjtRQUFPUyxLQUFQLElBQWUsUUFBZixJQUEyQlQsR0FBM0IsSUFBa0MsSUFBbEMsSUFBMENTLElBQTFDLElBQWtELFVBRnRCO0NBbUI5Qi9IO0lBQUE2SSxPQUFBLEdBQWNDLFFBQVEsQ0FBQzNHLEdBQUQsQ0FBTTtBQU0xQixRQUFPQSxJQUFBLENBQUluQyxJQUFBK0ksY0FBSixDQUFQLEtBQ0s1RyxHQUFBLENBQUluQyxJQUFBK0ksY0FBSixDQURMLEdBQytCLEVBQUUvSSxJQUFBZ0osWUFEakMsQ0FOMEI7Q0FpQjVCaEo7SUFBQWlKLFVBQUEsR0FBaUJDLFFBQVEsQ0FBQy9HLEdBQUQsQ0FBTTtBQUs3QixLQUFJLGlCQUFKLElBQXlCQSxHQUF6QjtBQUNFQSxPQUFBZ0gsZ0JBQUEsQ0FBb0JuSixJQUFBK0ksY0FBcEIsQ0FERjs7QUFJQSxLQUFJO0FBQ0YsV0FBTzVHLEdBQUEsQ0FBSW5DLElBQUErSSxjQUFKLENBREw7R0FFRixNQUFPSyxFQUFQLENBQVc7O0FBWGdCLENBc0IvQnBKO0lBQUErSSxjQUFBLEdBQXFCLGNBQXJCLEdBQ0lNLElBQUFDLE1BQUEsQ0FBV0QsSUFBQUUsT0FBQSxFQUFYLEdBQTJCLFVBQTNCLENBQUF0QyxTQUFBLENBQWdELEVBQWhELENBUUpqSDtJQUFBZ0osWUFBQSxHQUFtQixDQVVuQmhKO0lBQUF3SixZQUFBLEdBQW1CeEosSUFBQTZJLE9BUW5CN0k7SUFBQXlKLGVBQUEsR0FBc0J6SixJQUFBaUosVUFrQnRCako7SUFBQTBKLFlBQUEsR0FBbUJDLFFBQVEsQ0FBQ3hILEdBQUQsQ0FBTTtBQUMvQixNQUFJNEYsT0FBTy9ILElBQUF5RyxPQUFBLENBQVl0RSxHQUFaLENBQ1g7S0FBSTRGLElBQUosSUFBWSxRQUFaLElBQXdCQSxJQUF4QixJQUFnQyxPQUFoQyxDQUF5QztBQUN2QyxPQUFJNUYsR0FBQXlILE1BQUo7QUFDRSxZQUFPekgsSUFBQXlILE1BQUEsRUFEVDs7QUFHQSxRQUFJQSxRQUFRN0IsSUFBQSxJQUFRLE9BQVIsR0FBa0IsRUFBbEIsR0FBdUIsRUFDbkM7UUFBSyxJQUFJOEIsR0FBVCxHQUFnQjFILElBQWhCO0FBQ0V5SCxXQUFBLENBQU1DLEdBQU4sQ0FBQSxHQUFhN0osSUFBQTBKLFlBQUEsQ0FBaUJ2SCxHQUFBLENBQUkwSCxHQUFKLENBQWpCLENBRGY7O0FBR0EsVUFBT0QsTUFSZ0M7O0FBV3pDLFFBQU96SCxJQWJ3QjtDQTJCakMyRTtNQUFBRSxVQUFBNEMsTUFpQkE1SjtJQUFBOEosWUFBQSxHQUFtQkMsUUFBUSxDQUFDQyxFQUFELEVBQUtDLE9BQUwsRUFBYzdGLFFBQWQsQ0FBd0I7QUFDakQsUUFBaUMsQ0FBQTRGLEVBQUE5QyxLQUFBZ0QsTUFBQSxDQUFjRixFQUFBRyxLQUFkLEVBQXVCQyxTQUF2QixDQUFBLENBRGdCO0NBZ0JuRHBLO0lBQUFxSyxRQUFBLEdBQWVDLFFBQVEsQ0FBQ04sRUFBRCxFQUFLQyxPQUFMLEVBQWM3RixRQUFkLENBQXdCO0FBQzdDLEtBQUksQ0FBQzRGLEVBQUw7QUFDRSxTQUFNLEtBQUl4SixLQUFWLENBREY7O0FBSUEsS0FBSTRKLFNBQUF6SSxPQUFKLEdBQXVCLENBQXZCLENBQTBCO0FBQ3hCLFFBQUk0SSxZQUFZMUQsS0FBQUcsVUFBQXdELE1BQUF0RCxLQUFBLENBQTJCa0QsU0FBM0IsRUFBc0MsQ0FBdEMsQ0FDaEI7VUFBTyxTQUFRLEVBQUc7QUFFaEIsVUFBSUssVUFBVTVELEtBQUFHLFVBQUF3RCxNQUFBdEQsS0FBQSxDQUEyQmtELFNBQTNCLENBQ2R2RDtXQUFBRyxVQUFBMEQsUUFBQVIsTUFBQSxDQUE4Qk8sT0FBOUIsRUFBdUNGLFNBQXZDLENBQ0E7WUFBT1AsR0FBQUUsTUFBQSxDQUFTRCxPQUFULEVBQWtCUSxPQUFsQixDQUpTO0tBRk07R0FBMUI7QUFVRSxVQUFPLFNBQVEsRUFBRztBQUNoQixZQUFPVCxHQUFBRSxNQUFBLENBQVNELE9BQVQsRUFBa0JHLFNBQWxCLENBRFM7S0FWcEI7O0FBTDZDLENBNkMvQ3BLO0lBQUFtSyxLQUFBLEdBQVlRLFFBQVEsQ0FBQ1gsRUFBRCxFQUFLQyxPQUFMLEVBQWM3RixRQUFkLENBQXdCO0FBRTFDLEtBQUl3RyxRQUFBNUQsVUFBQW1ELEtBQUosSUFRSVMsUUFBQTVELFVBQUFtRCxLQUFBbEQsU0FBQSxFQUFBNEQsUUFBQSxDQUEyQyxhQUEzQyxDQVJKLElBUWtFLEVBUmxFO0FBU0U3SyxRQUFBbUssS0FBQSxHQUFZbkssSUFBQThKLFlBVGQ7O0FBV0U5SixRQUFBbUssS0FBQSxHQUFZbkssSUFBQXFLLFFBWGQ7O0FBYUEsUUFBT3JLLEtBQUFtSyxLQUFBRCxNQUFBLENBQWdCLElBQWhCLEVBQXNCRSxTQUF0QixDQWZtQztDQWlDNUNwSztJQUFBOEssUUFBQSxHQUFlQyxRQUFRLENBQUNmLEVBQUQsRUFBSzVGLFFBQUwsQ0FBZTtBQUNwQyxNQUFJNEcsT0FBT25FLEtBQUFHLFVBQUF3RCxNQUFBdEQsS0FBQSxDQUEyQmtELFNBQTNCLEVBQXNDLENBQXRDLENBQ1g7UUFBTyxTQUFRLEVBQUc7QUFFaEIsUUFBSUssVUFBVTVELEtBQUFHLFVBQUF3RCxNQUFBdEQsS0FBQSxDQUEyQmtELFNBQTNCLENBQ2RLO1dBQUFDLFFBQUFSLE1BQUEsQ0FBc0JPLE9BQXRCLEVBQStCTyxJQUEvQixDQUNBO1VBQU9oQixHQUFBRSxNQUFBLENBQVMsSUFBVCxFQUFlTyxPQUFmLENBSlM7R0FGa0I7Q0FrQnRDeks7SUFBQWlMLE1BQUEsR0FBYUMsUUFBUSxDQUFDQyxNQUFELEVBQVNDLE1BQVQsQ0FBaUI7QUFDcEMsTUFBSyxJQUFJL0ksQ0FBVCxHQUFjK0ksT0FBZDtBQUNFRCxVQUFBLENBQU85SSxDQUFQLENBQUEsR0FBWStJLE1BQUEsQ0FBTy9JLENBQVAsQ0FEZDs7QUFEb0MsQ0FpQnRDckM7SUFBQXFMLElBQUEsR0FBV0MsSUFBQUQsSUFBWCxJQUF3QixRQUFRLEVBQUc7QUFHakMsUUFBTyxDQUFDLElBQUlDLElBSHFCO0NBY25DdEw7SUFBQXVMLFdBQUEsR0FBa0JDLFFBQVEsQ0FBQ0MsTUFBRCxDQUFTO0FBQ2pDLEtBQUl6TCxJQUFBQyxPQUFBd0IsV0FBSjtBQUNFekIsUUFBQUMsT0FBQXdCLFdBQUEsQ0FBdUJnSyxNQUF2QixFQUErQixZQUEvQixDQURGOztBQUVPLE9BQUl6TCxJQUFBQyxPQUFBeUwsS0FBSixDQUFzQjtBQUUzQixTQUFJMUwsSUFBQTJMLHFCQUFKLElBQWlDLElBQWpDLENBQXVDO0FBQ3JDM0wsWUFBQUMsT0FBQXlMLEtBQUEsQ0FBaUIsZUFBakIsQ0FDQTtXQUFJLE1BQU8xTCxLQUFBQyxPQUFBLENBQVksTUFBWixDQUFYLElBQWtDLFdBQWxDLENBQStDO0FBQzdDLGlCQUFPRCxJQUFBQyxPQUFBLENBQVksTUFBWixDQUNQRDtjQUFBMkwscUJBQUEsR0FBNEIsSUFGaUI7U0FBL0M7QUFJRTNMLGNBQUEyTCxxQkFBQSxHQUE0QixLQUo5Qjs7QUFGcUM7QUFVdkMsU0FBSTNMLElBQUEyTCxxQkFBSjtBQUNFM0wsWUFBQUMsT0FBQXlMLEtBQUEsQ0FBaUJELE1BQWpCLENBREY7V0FFTztBQUNMLFlBQUl6RyxNQUFNaEYsSUFBQUMsT0FBQWdGLFNBQ1Y7WUFBSTJHLFlBQVk1RyxHQUFBNkcsY0FBQSxDQUFrQixRQUFsQixDQUNoQkQ7aUJBQUE3RCxLQUFBLEdBQWlCLGlCQUNqQjZEO2lCQUFBRSxNQUFBLEdBQWtCLEtBR2xCRjtpQkFBQUcsWUFBQSxDQUFzQi9HLEdBQUFnSCxlQUFBLENBQW1CUCxNQUFuQixDQUF0QixDQUNBekc7V0FBQWlILEtBQUFGLFlBQUEsQ0FBcUJILFNBQXJCLENBQ0E1RztXQUFBaUgsS0FBQUMsWUFBQSxDQUFxQk4sU0FBckIsQ0FUSzs7QUFkb0IsS0FBdEI7QUEwQkwsV0FBTXBMLE1BQUEsQ0FBTSwrQkFBTixDQUFOLENBMUJLOztBQUZQO0FBRGlDLENBeUNuQ1I7SUFBQTJMLHFCQUFBLEdBQTRCLElBVTVCM0w7SUFBQW1NLGdCQVVBbk07SUFBQW9NLHFCQW1DQXBNO0lBQUFxTSxXQUFBLEdBQWtCQyxRQUFRLENBQUN2RixTQUFELEVBQVl3RixZQUFaLENBQTBCO0FBQ2xELE1BQUlDLGFBQWFBLFFBQVEsQ0FBQ0MsT0FBRCxDQUFVO0FBQ2pDLFVBQU96TSxLQUFBbU0sZ0JBQUEsQ0FBcUJNLE9BQXJCLENBQVAsSUFBd0NBLE9BRFA7R0FJbkM7TUFBSUMsZ0JBQWdCQSxRQUFRLENBQUNELE9BQUQsQ0FBVTtBQUVwQyxRQUFJbkwsUUFBUW1MLE9BQUFsTCxNQUFBLENBQWMsR0FBZCxDQUNaO1FBQUlvTCxTQUFTLEVBQ2I7UUFBSyxJQUFJM0osSUFBSSxDQUFiLENBQWdCQSxDQUFoQixHQUFvQjFCLEtBQUFLLE9BQXBCLENBQWtDcUIsQ0FBQSxFQUFsQztBQUNFMkosWUFBQXRHLEtBQUEsQ0FBWW1HLFVBQUEsQ0FBV2xMLEtBQUEsQ0FBTTBCLENBQU4sQ0FBWCxDQUFaLENBREY7O0FBR0EsVUFBTzJKLE9BQUFDLEtBQUEsQ0FBWSxHQUFaLENBUDZCO0dBVXRDO01BQUlDLE1BQ0o7S0FBSTdNLElBQUFtTSxnQkFBSjtBQUNFVSxVQUFBLEdBQVM3TSxJQUFBb00scUJBQUEsSUFBNkIsVUFBN0IsR0FDTEksVUFESyxHQUNRRSxhQUZuQjs7QUFJRUcsVUFBQSxHQUFTQSxRQUFRLENBQUNDLENBQUQsQ0FBSTtBQUNuQixZQUFPQSxFQURZO0tBSnZCOztBQVNBLEtBQUlQLFlBQUo7QUFDRSxVQUFPeEYsVUFBUCxHQUFtQixHQUFuQixHQUF5QjhGLE1BQUEsQ0FBT04sWUFBUCxDQUQzQjs7QUFHRSxVQUFPTSxPQUFBLENBQU85RixTQUFQLENBSFQ7O0FBekJrRCxDQXdEcEQvRztJQUFBK00sa0JBQUEsR0FBeUJDLFFBQVEsQ0FBQ0MsT0FBRCxFQUFVQyxTQUFWLENBQXFCO0FBQ3BEbE4sTUFBQW1NLGdCQUFBLEdBQXVCYyxPQUN2QmpOO01BQUFvTSxxQkFBQSxHQUE0QmMsU0FGd0I7Q0FrQnREbE47SUFBQUMsT0FBQWtOLHlCQUdBO0dBQUksQ0FBQ3BOLFFBQUwsSUFBaUJDLElBQUFDLE9BQUFrTix5QkFBakI7QUFHRW5OLE1BQUFtTSxnQkFBQSxHQUF1Qm5NLElBQUFDLE9BQUFrTix5QkFIekI7O0FBYUFuTixJQUFBb04sT0FBQSxHQUFjQyxRQUFRLENBQUNDLEdBQUQsRUFBTUMsVUFBTixDQUFrQjtBQUN0QyxNQUFJQyxTQUFTRCxVQUFUQyxJQUF1QixFQUMzQjtNQUFLLElBQUkzRCxHQUFULEdBQWdCMkQsT0FBaEIsQ0FBd0I7QUFDdEIsUUFBSTdHLFFBQVM5RCxDQUFBLEVBQUFBLEdBQUsySyxNQUFBLENBQU8zRCxHQUFQLENBQUxoSCxTQUFBLENBQTBCLEtBQTFCLEVBQWlDLE1BQWpDLENBQ2J5SztPQUFBLEdBQU1BLEdBQUF6SyxRQUFBLENBQVksSUFBSTRLLE1BQUosQ0FBVyxRQUFYLEdBQXNCNUQsR0FBdEIsR0FBNEIsS0FBNUIsRUFBbUMsSUFBbkMsQ0FBWixFQUFzRGxELEtBQXRELENBRmdCOztBQUl4QixRQUFPMkcsSUFOK0I7Q0FrQ3hDdE47SUFBQTBOLGFBQUEsR0FBb0JDLFFBQVEsQ0FBQ0MsVUFBRCxFQUFhQyxNQUFiLEVBQXFCeE0sb0JBQXJCLENBQTJDO0FBQ3JFckIsTUFBQWMsWUFBQSxDQUFpQjhNLFVBQWpCLEVBQTZCQyxNQUE3QixFQUFxQ3hNLG9CQUFyQyxDQURxRTtDQWF2RXJCO0lBQUE4TixlQUFBLEdBQXNCQyxRQUFRLENBQUNGLE1BQUQsRUFBU0csVUFBVCxFQUFxQkMsTUFBckIsQ0FBNkI7QUFDekRKLFFBQUEsQ0FBT0csVUFBUCxDQUFBLEdBQXFCQyxNQURvQztDQW1DM0RqTztJQUFBa08sU0FBQSxHQUFnQkMsUUFBUSxDQUFDQyxTQUFELEVBQVlDLFVBQVosQ0FBd0I7QUFFOUNDLFVBQVNBLFNBQVEsRUFBRztHQUFwQkE7QUFDQUEsVUFBQXRILFVBQUEsR0FBcUJxSCxVQUFBckgsVUFDckJvSDtXQUFBRyxZQUFBLEdBQXdCRixVQUFBckgsVUFDeEJvSDtXQUFBcEgsVUFBQSxHQUFzQixJQUFJc0gsUUFDMUJGO1dBQUFwSCxVQUFBd0gsWUFBQSxHQUFrQ0osU0FOWTtDQW1DaERwTztJQUFBeU8sS0FBQSxHQUFZQyxRQUFRLENBQUNDLEVBQUQsRUFBS0MsY0FBTCxFQUFxQnhLLFFBQXJCLENBQStCO0FBQ2pELE1BQUl5SyxTQUFTekUsU0FBQTBFLE9BQUFELE9BQ2I7S0FBSUEsTUFBQU4sWUFBSjtBQUVFLFVBQU9NLE9BQUFOLFlBQUFDLFlBQUF0RSxNQUFBLENBQ0h5RSxFQURHLEVBQ0M5SCxLQUFBRyxVQUFBd0QsTUFBQXRELEtBQUEsQ0FBMkJrRCxTQUEzQixFQUFzQyxDQUF0QyxDQURELENBRlQ7O0FBTUEsTUFBSVksT0FBT25FLEtBQUFHLFVBQUF3RCxNQUFBdEQsS0FBQSxDQUEyQmtELFNBQTNCLEVBQXNDLENBQXRDLENBQ1g7TUFBSTJFLGNBQWMsS0FDbEI7TUFBSyxJQUFJdEssT0FBT2tLLEVBQUFILFlBQWhCLENBQ0svSixJQURMLENBQ1dBLElBRFgsR0FDa0JBLElBQUE4SixZQURsQixJQUNzQzlKLElBQUE4SixZQUFBQyxZQUR0QztBQUVFLE9BQUkvSixJQUFBdUMsVUFBQSxDQUFlNEgsY0FBZixDQUFKLEtBQXVDQyxNQUF2QztBQUNFRSxpQkFBQSxHQUFjLElBRGhCOztBQUVPLFNBQUlBLFdBQUo7QUFDTCxjQUFPdEssS0FBQXVDLFVBQUEsQ0FBZTRILGNBQWYsQ0FBQTFFLE1BQUEsQ0FBcUN5RSxFQUFyQyxFQUF5QzNELElBQXpDLENBREY7O0FBRlA7QUFGRjtBQWFBLEtBQUkyRCxFQUFBLENBQUdDLGNBQUgsQ0FBSixLQUEyQkMsTUFBM0I7QUFDRSxVQUFPRixHQUFBSCxZQUFBeEgsVUFBQSxDQUF5QjRILGNBQXpCLENBQUExRSxNQUFBLENBQStDeUUsRUFBL0MsRUFBbUQzRCxJQUFuRCxDQURUOztBQUdFLFNBQU14SyxNQUFBLENBQ0YsNkNBREUsR0FFRixpQ0FGRSxDQUFOLENBSEY7O0FBdkJpRCxDQTBDbkRSO0lBQUFnUCxNQUFBLEdBQWFDLFFBQVEsQ0FBQ2pGLEVBQUQsQ0FBSztBQUN4QkEsSUFBQTlDLEtBQUEsQ0FBUWxILElBQUFDLE9BQVIsQ0FEd0I7QztBQ2o5QzFCRCxJQUFBSSxRQUFBLENBQWEsZ0JBQWIsQ0FNQTtJQUFJOE8saUJBQ0QsTUFBT0MsV0FETkQsS0FDcUIsV0FEckJBLElBRUQsTUFBT0UsWUFGTkYsS0FFc0IsV0FGdEJBLElBR0QsTUFBT0csWUFITkgsS0FHc0IsV0FIdEJBLElBSUQsTUFBT0ksU0FKTkosS0FJbUIsVztBQ1h2QmxQLElBQUFJLFFBQUEsQ0FBYSxnQkFBYixDQUVBSjtJQUFBMkMsUUFBQSxDQUFhLGdCQUFiLENBRUEzQztJQUFBZ1AsTUFBQSxDQUFXLFFBQVEsRUFBRztBQVF0Qk8sTUFBQUMsVUFBQSxHQUFpQkMsUUFBUSxDQUFDQyxNQUFELEVBQVNDLGNBQVQsQ0FBeUI7QUFFaEQsUUFBQUMsTUFBQSxHQUFhLE1BQU9ELGVBQVAsS0FBMEIsUUFBMUIsR0FBcUNBLGNBQXJDLEdBQXNELENBRW5FO1FBQUFFLFNBQUEsR0FBZ0IsQ0FFaEI7UUFBQUgsT0FBQSxHQUFjQSxNQUFBLGFBQW1CUixjQUFBLEdBQWlCQyxVQUFqQixHQUE4QnRJLEtBQWpELElBQ1o2SSxNQURZLEdBRVosS0FBS1IsY0FBQSxHQUFpQkMsVUFBakIsR0FBOEJ0SSxLQUFuQyxFQUEwQzBJLElBQUFDLFVBQUFNLGlCQUExQyxDQUdGO09BQUksSUFBQUosT0FBQS9OLE9BQUosR0FBeUIsQ0FBekIsSUFBOEIsSUFBQWlPLE1BQTlCO0FBQ0UsV0FBTSxLQUFJcFAsS0FBSixDQUFVLGVBQVYsQ0FBTixDQURGOztBQUVPLFNBQUksSUFBQWtQLE9BQUEvTixPQUFKLElBQTBCLElBQUFpTyxNQUExQjtBQUNMLFlBQUFHLGFBQUEsRUFESzs7QUFGUDtBQVhnRCxHQXVCbERSO01BQUFDLFVBQUFNLGlCQUFBLEdBQWtDLEtBTWxDUDtNQUFBQyxVQUFBeEksVUFBQStJLGFBQUEsR0FBd0NDLFFBQVEsRUFBRztBQUVqRCxRQUFJQyxTQUFTLElBQUFQLE9BRWI7UUFBSTFNLENBRUo7UUFBSWtOLEtBQUtELE1BQUF0TyxPQUVUO1FBQUkrTixTQUNGLEtBQUtSLGNBQUEsR0FBaUJDLFVBQWpCLEdBQThCdEksS0FBbkMsRUFBMENxSixFQUExQyxJQUFnRCxDQUFoRCxDQUdGO09BQUloQixjQUFKO0FBQ0VRLFlBQUFTLElBQUEsQ0FBV0YsTUFBWCxDQURGOztBQUlFLFVBQUtqTixDQUFMLEdBQVMsQ0FBVCxDQUFZQSxDQUFaLEdBQWdCa04sRUFBaEIsQ0FBb0IsRUFBRWxOLENBQXRCO0FBQ0UwTSxjQUFBLENBQU8xTSxDQUFQLENBQUEsR0FBWWlOLE1BQUEsQ0FBT2pOLENBQVAsQ0FEZDs7QUFKRjtBQVNBLFVBQVEsS0FBQTBNLE9BQVIsR0FBc0JBLE1BckIyQjtHQStCbkRIO01BQUFDLFVBQUF4SSxVQUFBb0osVUFBQSxHQUFxQ0MsUUFBUSxDQUFDQyxNQUFELEVBQVNDLENBQVQsRUFBWUMsT0FBWixDQUFxQjtBQUNoRSxRQUFJZCxTQUFTLElBQUFBLE9BQ2I7UUFBSUUsUUFBUSxJQUFBQSxNQUNaO1FBQUlDLFdBQVcsSUFBQUEsU0FHZjtRQUFJWSxVQUFVZixNQUFBLENBQU9FLEtBQVAsQ0FFZDtRQUFJNU0sQ0FRSjBOO1lBQVNBLE9BQU0sQ0FBQ0gsQ0FBRCxDQUFJO0FBQ2pCLFlBQVFoQixLQUFBQyxVQUFBbUIsYUFBQSxDQUE0QkosQ0FBNUIsR0FBZ0MsR0FBaEMsQ0FBUixJQUFpRCxFQUFqRCxHQUNHaEIsSUFBQUMsVUFBQW1CLGFBQUEsQ0FBNEJKLENBQTVCLEtBQWtDLENBQWxDLEdBQXNDLEdBQXRDLENBREgsSUFDa0QsRUFEbEQsR0FFR2hCLElBQUFDLFVBQUFtQixhQUFBLENBQTRCSixDQUE1QixLQUFrQyxFQUFsQyxHQUF1QyxHQUF2QyxDQUZILElBRW1ELENBRm5ELEdBR0VoQixJQUFBQyxVQUFBbUIsYUFBQSxDQUE0QkosQ0FBNUIsS0FBa0MsRUFBbEMsR0FBdUMsR0FBdkMsQ0FKZTtLQUFuQkc7QUFPQSxPQUFJRixPQUFKLElBQWVELENBQWYsR0FBbUIsQ0FBbkI7QUFDRUQsWUFBQSxHQUFTQyxDQUFBLEdBQUksQ0FBSixHQUNQRyxNQUFBLENBQU9KLE1BQVAsQ0FETyxJQUNZLEVBRFosR0FDaUJDLENBRGpCLEdBRVBoQixJQUFBQyxVQUFBbUIsYUFBQSxDQUE0QkwsTUFBNUIsQ0FGTyxJQUVpQyxDQUZqQyxHQUVxQ0MsQ0FIaEQ7O0FBT0EsT0FBSUEsQ0FBSixHQUFRVixRQUFSLEdBQW1CLENBQW5CLENBQXNCO0FBQ3BCWSxhQUFBLEdBQVdBLE9BQVgsSUFBc0JGLENBQXRCLEdBQTJCRCxNQUMzQlQ7Y0FBQSxJQUFZVSxDQUZRO0tBQXRCO0FBS0UsVUFBS3ZOLENBQUwsR0FBUyxDQUFULENBQVlBLENBQVosR0FBZ0J1TixDQUFoQixDQUFtQixFQUFFdk4sQ0FBckIsQ0FBd0I7QUFDdEJ5TixlQUFBLEdBQVdBLE9BQVgsSUFBc0IsQ0FBdEIsR0FBNkJILE1BQTdCLElBQXVDQyxDQUF2QyxHQUEyQ3ZOLENBQTNDLEdBQStDLENBQS9DLEdBQW9ELENBR3BEO1dBQUksRUFBRTZNLFFBQU4sS0FBbUIsQ0FBbkIsQ0FBc0I7QUFDcEJBLGtCQUFBLEdBQVcsQ0FDWEg7Z0JBQUEsQ0FBT0UsS0FBQSxFQUFQLENBQUEsR0FBa0JMLElBQUFDLFVBQUFtQixhQUFBLENBQTRCRixPQUE1QixDQUNsQkE7aUJBQUEsR0FBVSxDQUdWO2FBQUliLEtBQUosS0FBY0YsTUFBQS9OLE9BQWQ7QUFDRStOLGtCQUFBLEdBQVMsSUFBQUssYUFBQSxFQURYOztBQU5vQjtBQUpBO0FBTDFCO0FBcUJBTCxVQUFBLENBQU9FLEtBQVAsQ0FBQSxHQUFnQmEsT0FFaEI7UUFBQWYsT0FBQSxHQUFjQSxNQUNkO1FBQUFHLFNBQUEsR0FBZ0JBLFFBQ2hCO1FBQUFELE1BQUEsR0FBYUEsS0F2RG1EO0dBK0RsRUw7TUFBQUMsVUFBQXhJLFVBQUE0SixPQUFBLEdBQWtDQyxRQUFRLEVBQUc7QUFDM0MsUUFBSW5CLFNBQVMsSUFBQUEsT0FDYjtRQUFJRSxRQUFRLElBQUFBLE1BR1o7UUFBSWtCLE1BR0o7T0FBSSxJQUFBakIsU0FBSixHQUFvQixDQUFwQixDQUF1QjtBQUNyQkgsWUFBQSxDQUFPRSxLQUFQLENBQUEsS0FBa0IsQ0FBbEIsR0FBc0IsSUFBQUMsU0FDdEJIO1lBQUEsQ0FBT0UsS0FBUCxDQUFBLEdBQWdCTCxJQUFBQyxVQUFBbUIsYUFBQSxDQUE0QmpCLE1BQUEsQ0FBT0UsS0FBUCxDQUE1QixDQUNoQkE7V0FBQSxFQUhxQjs7QUFPdkIsT0FBSVYsY0FBSjtBQUNFNEIsWUFBQSxHQUFTcEIsTUFBQXFCLFNBQUEsQ0FBZ0IsQ0FBaEIsRUFBbUJuQixLQUFuQixDQURYO1NBRU87QUFDTEYsWUFBQS9OLE9BQUEsR0FBZ0JpTyxLQUNoQmtCO1lBQUEsR0FBU3BCLE1BRko7O0FBS1AsVUFBT29CLE9BdEJvQztHQThCN0N2QjtNQUFBQyxVQUFBbUIsYUFBQSxHQUErQixRQUFRLENBQUNLLEtBQUQsQ0FBUTtBQUM3QyxVQUFPQSxNQURzQztHQUFoQixDQUUzQixRQUFRLEVBQUc7QUFFYixRQUFJQSxRQUFRLEtBQUs5QixjQUFBLEdBQWlCQyxVQUFqQixHQUE4QnRJLEtBQW5DLEVBQTBDLEdBQTFDLENBRVo7UUFBSTdELENBR0o7UUFBS0EsQ0FBTCxHQUFTLENBQVQsQ0FBWUEsQ0FBWixHQUFnQixHQUFoQixDQUFxQixFQUFFQSxDQUF2QjtBQUNFZ08sV0FBQSxDQUFNaE8sQ0FBTixDQUFBLEdBQVksUUFBUSxDQUFDdU4sQ0FBRCxDQUFJO0FBQ3RCLFlBQUlVLElBQUlWLENBQ1I7WUFBSTNKLElBQUksQ0FFUjtZQUFLMkosQ0FBTCxNQUFZLENBQVosQ0FBZUEsQ0FBZixDQUFrQkEsQ0FBbEIsTUFBeUIsQ0FBekIsQ0FBNEI7QUFDMUJVLFdBQUEsS0FBTSxDQUNOQTtXQUFBLElBQUtWLENBQUwsR0FBUyxDQUNUO1lBQUUzSixDQUh3Qjs7QUFNNUIsZUFBUXFLLENBQVIsSUFBYXJLLENBQWIsR0FBaUIsR0FBakIsTUFBMkIsQ0FWTDtPQUFaLENBV1Q1RCxDQVhTLENBRGQ7O0FBZUEsVUFBT2dPLE1BdEJNO0dBQVgsRUFGMkIsQ0FqS1Q7Q0FBdEIsQztBQ0pBaFIsSUFBQUksUUFBQSxDQUFhLFlBQWIsQ0FFQUo7SUFBQTJDLFFBQUEsQ0FBYSxnQkFBYixDQUdBO0lBQUl1TyxxQkFBcUIsS0FFekJsUjtJQUFBZ1AsTUFBQSxDQUFXLFFBQVEsRUFBRztBQVN0Qk8sTUFBQTRCLE1BQUFDLEtBQUEsR0FBa0JDLFFBQVEsQ0FBQ0MsSUFBRCxFQUFPQyxHQUFQLEVBQVk1UCxNQUFaLENBQW9CO0FBQzVDLFVBQU80TixLQUFBNEIsTUFBQUssT0FBQSxDQUFrQkYsSUFBbEIsRUFBd0IsQ0FBeEIsRUFBMkJDLEdBQTNCLEVBQWdDNVAsTUFBaEMsQ0FEcUM7R0FZOUM0TjtNQUFBNEIsTUFBQUssT0FBQSxHQUFvQkMsUUFBUSxDQUFDSCxJQUFELEVBQU9JLEdBQVAsRUFBWUgsR0FBWixFQUFpQjVQLE1BQWpCLENBQXlCO0FBQ25ELFFBQUlxUCxRQUFRekIsSUFBQTRCLE1BQUFRLE1BQ1o7UUFBSTNPLElBQUssTUFBT3VPLElBQVAsS0FBZSxRQUFmLEdBQTJCQSxHQUEzQixHQUFrQ0EsR0FBbEMsR0FBd0MsQ0FDakQ7UUFBSXJCLEtBQU0sTUFBT3ZPLE9BQVAsS0FBa0IsUUFBbEIsR0FBOEJBLE1BQTlCLEdBQXVDMlAsSUFBQTNQLE9BRWpEK1A7T0FBQSxJQUFPLFVBR1A7UUFBSzFPLENBQUwsR0FBU2tOLEVBQVQsR0FBYyxDQUFkLENBQWlCbE4sQ0FBQSxFQUFqQixDQUFzQixFQUFFdU8sR0FBeEI7QUFDRUcsU0FBQSxHQUFPQSxHQUFQLEtBQWUsQ0FBZixHQUFvQlYsS0FBQSxFQUFPVSxHQUFQLEdBQWFKLElBQUEsQ0FBS0MsR0FBTCxDQUFiLElBQTBCLEdBQTFCLENBRHRCOztBQUdBLFFBQUt2TyxDQUFMLEdBQVNrTixFQUFULElBQWUsQ0FBZixDQUFrQmxOLENBQUEsRUFBbEIsQ0FBdUJ1TyxHQUF2QixJQUE4QixDQUE5QixDQUFpQztBQUMvQkcsU0FBQSxHQUFPQSxHQUFQLEtBQWUsQ0FBZixHQUFvQlYsS0FBQSxFQUFPVSxHQUFQLEdBQWFKLElBQUEsQ0FBS0MsR0FBTCxDQUFiLElBQThCLEdBQTlCLENBQ3BCRztTQUFBLEdBQU9BLEdBQVAsS0FBZSxDQUFmLEdBQW9CVixLQUFBLEVBQU9VLEdBQVAsR0FBYUosSUFBQSxDQUFLQyxHQUFMLEdBQVcsQ0FBWCxDQUFiLElBQThCLEdBQTlCLENBQ3BCRztTQUFBLEdBQU9BLEdBQVAsS0FBZSxDQUFmLEdBQW9CVixLQUFBLEVBQU9VLEdBQVAsR0FBYUosSUFBQSxDQUFLQyxHQUFMLEdBQVcsQ0FBWCxDQUFiLElBQThCLEdBQTlCLENBQ3BCRztTQUFBLEdBQU9BLEdBQVAsS0FBZSxDQUFmLEdBQW9CVixLQUFBLEVBQU9VLEdBQVAsR0FBYUosSUFBQSxDQUFLQyxHQUFMLEdBQVcsQ0FBWCxDQUFiLElBQThCLEdBQTlCLENBQ3BCRztTQUFBLEdBQU9BLEdBQVAsS0FBZSxDQUFmLEdBQW9CVixLQUFBLEVBQU9VLEdBQVAsR0FBYUosSUFBQSxDQUFLQyxHQUFMLEdBQVcsQ0FBWCxDQUFiLElBQThCLEdBQTlCLENBQ3BCRztTQUFBLEdBQU9BLEdBQVAsS0FBZSxDQUFmLEdBQW9CVixLQUFBLEVBQU9VLEdBQVAsR0FBYUosSUFBQSxDQUFLQyxHQUFMLEdBQVcsQ0FBWCxDQUFiLElBQThCLEdBQTlCLENBQ3BCRztTQUFBLEdBQU9BLEdBQVAsS0FBZSxDQUFmLEdBQW9CVixLQUFBLEVBQU9VLEdBQVAsR0FBYUosSUFBQSxDQUFLQyxHQUFMLEdBQVcsQ0FBWCxDQUFiLElBQThCLEdBQTlCLENBQ3BCRztTQUFBLEdBQU9BLEdBQVAsS0FBZSxDQUFmLEdBQW9CVixLQUFBLEVBQU9VLEdBQVAsR0FBYUosSUFBQSxDQUFLQyxHQUFMLEdBQVcsQ0FBWCxDQUFiLElBQThCLEdBQTlCLENBUlc7O0FBV2pDLFdBQVFHLEdBQVIsR0FBYyxVQUFkLE1BQThCLENBdEJxQjtHQThCckRuQztNQUFBNEIsTUFBQVMsT0FBQSxHQUFvQkMsUUFBUSxDQUFDQyxHQUFELEVBQU1KLEdBQU4sQ0FBVztBQUNyQyxXQUFRbkMsSUFBQTRCLE1BQUFRLE1BQUEsRUFBa0JHLEdBQWxCLEdBQXdCSixHQUF4QixJQUErQixHQUEvQixDQUFSLEdBQWdESSxHQUFoRCxLQUF3RCxDQUF4RCxNQUFnRSxDQUQzQjtHQVN2Q3ZDO01BQUE0QixNQUFBWSxPQUFBLEdBQW9CLENBQ2xCLENBRGtCLEVBQ04sVUFETSxFQUNNLFVBRE4sRUFDa0IsVUFEbEIsRUFDOEIsU0FEOUIsRUFDMEMsVUFEMUMsRUFFbEIsVUFGa0IsRUFFTixVQUZNLEVBRU0sU0FGTixFQUVrQixVQUZsQixFQUU4QixVQUY5QixFQUUwQyxVQUYxQyxFQUdsQixTQUhrQixFQUdOLFVBSE0sRUFHTSxVQUhOLEVBR2tCLFVBSGxCLEVBRzhCLFNBSDlCLEVBRzBDLFVBSDFDLEVBSWxCLFVBSmtCLEVBSU4sVUFKTSxFQUlNLFNBSk4sRUFJa0IsVUFKbEIsRUFJOEIsVUFKOUIsRUFJMEMsVUFKMUMsRUFLbEIsU0FMa0IsRUFLTixVQUxNLEVBS00sVUFMTixFQUtrQixVQUxsQixFQUs4QixTQUw5QixFQUswQyxVQUwxQyxFQU1sQixVQU5rQixFQU1OLFVBTk0sRUFNTSxTQU5OLEVBTWtCLFVBTmxCLEVBTThCLFVBTjlCLEVBTTBDLFVBTjFDLEVBT2xCLFVBUGtCLEVBT04sVUFQTSxFQU9NLFVBUE4sRUFPa0IsVUFQbEIsRUFPOEIsU0FQOUIsRUFPMEMsVUFQMUM7QUFRbEIsWUFSa0IsRUFRTixVQVJNLEVBUU0sU0FSTixFQVFrQixVQVJsQixFQVE4QixVQVI5QixFQVEwQyxVQVIxQyxFQVNsQixTQVRrQixFQVNOLFVBVE0sRUFTTSxVQVROLEVBU2tCLFVBVGxCLEVBUzhCLFNBVDlCLEVBUzBDLFVBVDFDLEVBVWxCLFVBVmtCLEVBVU4sVUFWTSxFQVVNLFNBVk4sRUFVa0IsVUFWbEIsRUFVOEIsVUFWOUIsRUFVMEMsVUFWMUMsRUFXbEIsU0FYa0IsRUFXTixVQVhNLEVBV00sVUFYTixFQVdrQixVQVhsQixFQVc4QixVQVg5QixFQVcwQyxRQVgxQyxFQVlsQixVQVprQixFQVlOLFVBWk0sRUFZTSxVQVpOLEVBWWtCLFNBWmxCLEVBWThCLFVBWjlCLEVBWTBDLFVBWjFDLEVBYWxCLFVBYmtCLEVBYU4sU0FiTSxFQWFNLFVBYk4sRUFha0IsVUFibEIsRUFhOEIsVUFiOUIsRUFhMEMsU0FiMUMsRUFjbEIsVUFka0IsRUFjTixVQWRNLEVBY00sVUFkTixFQWNrQixTQWRsQixFQWM4QixVQWQ5QixFQWMwQyxVQWQxQyxFQWVsQixVQWZrQjtBQWVOLFdBZk0sRUFlTSxVQWZOLEVBZWtCLFVBZmxCLEVBZThCLFVBZjlCLEVBZTBDLFNBZjFDLEVBZ0JsQixVQWhCa0IsRUFnQk4sVUFoQk0sRUFnQk0sVUFoQk4sRUFnQmtCLFNBaEJsQixFQWdCOEIsVUFoQjlCLEVBZ0IwQyxVQWhCMUMsRUFpQmxCLFVBakJrQixFQWlCTixTQWpCTSxFQWlCTSxVQWpCTixFQWlCa0IsVUFqQmxCLEVBaUI4QixVQWpCOUIsRUFpQjBDLFVBakIxQyxFQWtCbEIsVUFsQmtCLEVBa0JOLFVBbEJNLEVBa0JNLFVBbEJOLEVBa0JrQixTQWxCbEIsRUFrQjhCLFVBbEI5QixFQWtCMEMsVUFsQjFDLEVBbUJsQixVQW5Ca0IsRUFtQk4sU0FuQk0sRUFtQk0sVUFuQk4sRUFtQmtCLFVBbkJsQixFQW1COEIsVUFuQjlCLEVBbUIwQyxTQW5CMUMsRUFvQmxCLFVBcEJrQixFQW9CTixVQXBCTSxFQW9CTSxVQXBCTixFQW9Ca0IsU0FwQmxCLEVBb0I4QixVQXBCOUIsRUFvQjBDLFVBcEIxQyxFQXFCbEIsVUFyQmtCLEVBcUJOLFNBckJNLEVBcUJNLFVBckJOLEVBcUJrQixVQXJCbEIsRUFxQjhCLFVBckI5QixFQXFCMEMsU0FyQjFDLEVBc0JsQixVQXRCa0IsRUFzQk4sVUF0Qk07QUFzQk0sWUF0Qk4sRUFzQmtCLFVBdEJsQixFQXNCOEIsUUF0QjlCLEVBc0IwQyxVQXRCMUMsRUF1QmxCLFVBdkJrQixFQXVCTixVQXZCTSxFQXVCTSxRQXZCTixFQXVCa0IsVUF2QmxCLEVBdUI4QixVQXZCOUIsRUF1QjBDLFVBdkIxQyxFQXdCbEIsU0F4QmtCLEVBd0JOLFVBeEJNLEVBd0JNLFVBeEJOLEVBd0JrQixVQXhCbEIsRUF3QjhCLFNBeEI5QixFQXdCMEMsVUF4QjFDLEVBeUJsQixVQXpCa0IsRUF5Qk4sVUF6Qk0sRUF5Qk0sU0F6Qk4sRUF5QmtCLFVBekJsQixFQXlCOEIsVUF6QjlCLEVBeUIwQyxVQXpCMUMsRUEwQmxCLFNBMUJrQixFQTBCTixVQTFCTSxFQTBCTSxVQTFCTixFQTBCa0IsVUExQmxCLEVBMEI4QixTQTFCOUIsRUEwQjBDLFVBMUIxQyxFQTJCbEIsVUEzQmtCLEVBMkJOLFVBM0JNLEVBMkJNLFNBM0JOLEVBMkJrQixVQTNCbEIsRUEyQjhCLFVBM0I5QixFQTJCMEMsVUEzQjFDLEVBNEJsQixTQTVCa0IsRUE0Qk4sVUE1Qk0sRUE0Qk0sVUE1Qk4sRUE0QmtCLFVBNUJsQixFQTRCOEIsVUE1QjlCLEVBNEIwQyxVQTVCMUMsRUE2QmxCLFVBN0JrQixFQTZCTixVQTdCTSxFQTZCTSxTQTdCTjtBQTZCa0IsWUE3QmxCLEVBNkI4QixVQTdCOUIsRUE2QjBDLFVBN0IxQyxFQThCbEIsU0E5QmtCLEVBOEJOLFVBOUJNLEVBOEJNLFVBOUJOLEVBOEJrQixVQTlCbEIsRUE4QjhCLFNBOUI5QixFQThCMEMsVUE5QjFDLEVBK0JsQixVQS9Ca0IsRUErQk4sVUEvQk0sRUErQk0sU0EvQk4sRUErQmtCLFVBL0JsQixFQStCOEIsVUEvQjlCLEVBK0IwQyxVQS9CMUMsRUFnQ2xCLFNBaENrQixFQWdDTixVQWhDTSxFQWdDTSxVQWhDTixFQWdDa0IsVUFoQ2xCLEVBZ0M4QixTQWhDOUIsRUFnQzBDLFVBaEMxQyxFQWlDbEIsVUFqQ2tCLEVBaUNOLFVBakNNLEVBaUNNLFVBakNOLEVBaUNrQixRQWpDbEIsRUFpQzhCLFVBakM5QixFQWlDMEMsVUFqQzFDLEVBa0NsQixVQWxDa0IsRUFrQ04sUUFsQ00sRUFrQ00sVUFsQ04sRUFrQ2tCLFVBbENsQixFQWtDOEIsVUFsQzlCLEVBa0MwQyxTQWxDMUMsRUFtQ2xCLFVBbkNrQixFQW1DTixVQW5DTSxFQW1DTSxVQW5DTixFQW1Da0IsU0FuQ2xCLEVBbUM4QixVQW5DOUIsRUFtQzBDLFVBbkMxQyxFQW9DbEIsVUFwQ2tCLEVBb0NOLFNBcENNLEVBb0NNLFVBcENOLEVBb0NrQixVQXBDbEI7QUFvQzhCLFlBcEM5QixFQW9DMEMsU0FwQzFDLEVBcUNsQixVQXJDa0IsRUFxQ04sVUFyQ00sRUFxQ00sVUFyQ04sRUFxQ2tCLFNBckNsQixFQXFDOEIsVUFyQzlCLEVBcUMwQyxVQXJDMUMsRUFzQ2xCLFVBdENrQixFQXNDTixTQXRDTSxFQXNDTSxVQXRDTixFQXNDa0IsVUF0Q2xCLEVBc0M4QixVQXRDOUIsRUFzQzBDLFNBdEMxQyxFQXVDbEIsVUF2Q2tCLEVBdUNOLFVBdkNNLEVBdUNNLFVBdkNOLEVBdUNrQixVQXZDbEIsRUF1QzhCLFVBdkM5QixFQXVDMEMsVUF2QzFDLEVBd0NsQixVQXhDa0IsRUF3Q04sUUF4Q00sRUF3Q00sVUF4Q04sRUF3Q2tCLFVBeENsQixFQXdDOEIsVUF4QzlCLEVBd0MwQyxTQXhDMUMsRUF5Q2xCLFVBekNrQixFQXlDTixVQXpDTSxFQXlDTSxVQXpDTixFQXlDa0IsU0F6Q2xCLEVBeUM4QixVQXpDOUIsRUF5QzBDLFVBekMxQyxFQTBDbEIsVUExQ2tCLEVBMENOLFNBMUNNLEVBMENNLFVBMUNOLEVBMENrQixVQTFDbEIsRUEwQzhCLFVBMUM5QixFQTBDMEMsU0ExQzFDLEVBMkNsQixVQTNDa0IsRUEyQ04sVUEzQ00sRUEyQ00sVUEzQ04sRUEyQ2tCLFNBM0NsQixDQWtEcEJ4QztNQUFBNEIsTUFBQVEsTUFBQSxHQUFtQlQsa0JBQUEsR0FBc0IsUUFBUSxFQUFHO0FBRWxELFFBQUlGLFFBQVEsS0FBSzlCLGNBQUEsR0FBaUJHLFdBQWpCLEdBQStCeEksS0FBcEMsRUFBMkMsR0FBM0MsQ0FFWjtRQUFJbUwsQ0FFSjtRQUFJaFAsQ0FFSjtRQUFJRyxDQUVKO1FBQUtILENBQUwsR0FBUyxDQUFULENBQVlBLENBQVosR0FBZ0IsR0FBaEIsQ0FBcUIsRUFBRUEsQ0FBdkIsQ0FBMEI7QUFDeEJnUCxPQUFBLEdBQUloUCxDQUNKO1VBQUtHLENBQUwsR0FBUyxDQUFULENBQVlBLENBQVosR0FBZ0IsQ0FBaEIsQ0FBbUIsRUFBRUEsQ0FBckI7QUFDRTZPLFNBQUEsR0FBS0EsQ0FBQSxHQUFJLENBQUosR0FBVSxVQUFWLEdBQXdCQSxDQUF4QixLQUE4QixDQUE5QixHQUFxQ0EsQ0FBckMsS0FBMkMsQ0FEbEQ7O0FBR0FoQixXQUFBLENBQU1oTyxDQUFOLENBQUEsR0FBV2dQLENBQVgsS0FBaUIsQ0FMTzs7QUFRMUIsVUFBT2hCLE1BbEIyQztHQUFYLEVBQXRCLEdBbUJaOUIsY0FBQSxHQUFpQixJQUFJRyxXQUFKLENBQWdCRSxJQUFBNEIsTUFBQVksT0FBaEIsQ0FBakIsR0FBc0R4QyxJQUFBNEIsTUFBQVksT0FqSXZDO0NBQXRCLEM7QUNWQS9SLElBQUFJLFFBQUEsQ0FBYSxpREFBYixDQUVBO0dBQUlKLElBQUFDLE9BQUEsQ0FBWSxZQUFaLENBQUosS0FBa0MsSUFBSyxFQUF2QztBQUNFLEtBQUk7QUFFRnlMLFFBQUEsQ0FBSyx1REFBTCxDQUZFO0dBR0YsTUFBTXVHLENBQU4sQ0FBUztBQUNUQyxVQUFBQyxhQUFBakksTUFBQSxHQUE2QixRQUFRLENBQUNrSSxpQkFBRCxDQUFvQjtBQUN2RCxZQUFPLFNBQVEsQ0FBQ0MsT0FBRCxFQUFVckgsSUFBVixDQUFnQjtBQUM3QixjQUFPb0gsa0JBQUFsTCxLQUFBLENBQXVCZ0wsTUFBQUMsYUFBdkIsRUFBNENFLE9BQTVDLEVBQXFEeEwsS0FBQUcsVUFBQXdELE1BQUF0RCxLQUFBLENBQTJCOEQsSUFBM0IsQ0FBckQsQ0FEc0I7T0FEd0I7S0FBNUIsQ0FJMUJrSCxNQUFBQyxhQUFBakksTUFKMEIsQ0FEcEI7O0FBSmI7QSxDQ0ZBbEssSUFBQUksUUFBQSxDQUFhLG1CQUFiLENBRUFKO0lBQUFnUCxNQUFBLENBQVcsUUFBUSxFQUFHO0FBS3RCTyxNQUFBK0MsYUFBQSxHQUFvQkMsUUFBUSxFQUFHO0FBRTdCLFFBQUFDLElBRUE7UUFBQUMsSUFFQTtRQUFBQyxHQUVBO1FBQUFDLElBRUE7UUFBQUMsTUFFQTtRQUFBQyxJQUVBO1FBQUFDLEdBRUE7UUFBQUMsTUFFQTtRQUFBQyxLQUVBO1FBQUFDLE1BRUE7UUFBQUMsTUFFQTtRQUFBNVMsS0FFQTtRQUFBNlMsUUFFQTtRQUFBN0IsS0E1QjZCO0dBK0IvQi9CO01BQUErQyxhQUFBdEwsVUFBQW9NLFFBQUEsR0FBc0NDLFFBQVEsRUFBRztBQUMvQyxVQUFPLEtBQUEvUyxLQUR3QztHQUlqRGlQO01BQUErQyxhQUFBdEwsVUFBQXNNLFFBQUEsR0FBc0NDLFFBQVEsRUFBRztBQUMvQyxVQUFPLEtBQUFqQyxLQUR3QztHQUlqRC9CO01BQUErQyxhQUFBdEwsVUFBQXdNLFNBQUEsR0FBdUNDLFFBQVEsRUFBRztBQUNoRCxVQUFPLEtBQUFiLE1BRHlDO0dBNUM1QjtDQUF0QixDO0FDRUE1UyxJQUFBSSxRQUFBLENBQWEsV0FBYixDQUVBSjtJQUFBMkMsUUFBQSxDQUFhLGdCQUFiLENBRUEzQztJQUFBZ1AsTUFBQSxDQUFXLFFBQVEsRUFBRztBQU90Qk8sTUFBQW1FLEtBQUEsR0FBWUMsUUFBUSxDQUFDaFMsTUFBRCxDQUFTO0FBQzNCLFFBQUErTixPQUFBLEdBQWMsS0FBS1IsY0FBQSxHQUFpQkUsV0FBakIsR0FBK0J2SSxLQUFwQyxFQUEyQ2xGLE1BQTNDLEdBQW9ELENBQXBELENBQ2Q7UUFBQUEsT0FBQSxHQUFjLENBRmE7R0FXN0I0TjtNQUFBbUUsS0FBQTFNLFVBQUE0TSxVQUFBLEdBQWdDQyxRQUFRLENBQUNqRSxLQUFELENBQVE7QUFDOUMsWUFBU0EsS0FBVCxHQUFpQixDQUFqQixJQUFzQixDQUF0QixHQUEwQixDQUExQixJQUErQixDQURlO0dBU2hETDtNQUFBbUUsS0FBQTFNLFVBQUE4TSxTQUFBLEdBQStCQyxRQUFRLENBQUNuRSxLQUFELENBQVE7QUFDN0MsVUFBTyxFQUFQLEdBQVdBLEtBQVgsR0FBbUIsQ0FEMEI7R0FVL0NMO01BQUFtRSxLQUFBMU0sVUFBQVgsS0FBQSxHQUEyQjJOLFFBQVEsQ0FBQ3BFLEtBQUQsRUFBUWpKLEtBQVIsQ0FBZTtBQUNoRCxRQUFJOEosT0FBSixFQUFhd0QsTUFBYixFQUNJQyxPQUFPLElBQUF4RSxPQURYLEVBRUl5RSxJQUVKMUQ7V0FBQSxHQUFVLElBQUE5TyxPQUNWdVM7UUFBQSxDQUFLLElBQUF2UyxPQUFBLEVBQUwsQ0FBQSxHQUFzQmdGLEtBQ3RCdU47UUFBQSxDQUFLLElBQUF2UyxPQUFBLEVBQUwsQ0FBQSxHQUFzQmlPLEtBR3RCO1VBQU9hLE9BQVAsR0FBaUIsQ0FBakIsQ0FBb0I7QUFDbEJ3RCxZQUFBLEdBQVMsSUFBQUwsVUFBQSxDQUFlbkQsT0FBZixDQUdUO1NBQUl5RCxJQUFBLENBQUt6RCxPQUFMLENBQUosR0FBb0J5RCxJQUFBLENBQUtELE1BQUwsQ0FBcEIsQ0FBa0M7QUFDaENFLFlBQUEsR0FBT0QsSUFBQSxDQUFLekQsT0FBTCxDQUNQeUQ7WUFBQSxDQUFLekQsT0FBTCxDQUFBLEdBQWdCeUQsSUFBQSxDQUFLRCxNQUFMLENBQ2hCQztZQUFBLENBQUtELE1BQUwsQ0FBQSxHQUFlRSxJQUVmQTtZQUFBLEdBQU9ELElBQUEsQ0FBS3pELE9BQUwsR0FBZSxDQUFmLENBQ1B5RDtZQUFBLENBQUt6RCxPQUFMLEdBQWUsQ0FBZixDQUFBLEdBQW9CeUQsSUFBQSxDQUFLRCxNQUFMLEdBQWMsQ0FBZCxDQUNwQkM7WUFBQSxDQUFLRCxNQUFMLEdBQWMsQ0FBZCxDQUFBLEdBQW1CRSxJQUVuQjFEO2VBQUEsR0FBVXdELE1BVHNCO09BQWxDO0FBWUUsYUFaRjs7QUFKa0I7QUFvQnBCLFVBQU8sS0FBQXRTLE9BOUJ5QztHQXNDbEQ0TjtNQUFBbUUsS0FBQTFNLFVBQUFvTixJQUFBLEdBQTBCQyxRQUFRLEVBQUc7QUFDbkMsUUFBSXpFLEtBQUosRUFBV2pKLEtBQVgsRUFDSXVOLE9BQU8sSUFBQXhFLE9BRFgsRUFDd0J5RSxJQUR4QixFQUVJMUQsT0FGSixFQUVhd0QsTUFFYnROO1NBQUEsR0FBUXVOLElBQUEsQ0FBSyxDQUFMLENBQ1J0RTtTQUFBLEdBQVFzRSxJQUFBLENBQUssQ0FBTCxDQUdSO1FBQUF2UyxPQUFBLElBQWUsQ0FDZnVTO1FBQUEsQ0FBSyxDQUFMLENBQUEsR0FBVUEsSUFBQSxDQUFLLElBQUF2UyxPQUFMLENBQ1Z1UztRQUFBLENBQUssQ0FBTCxDQUFBLEdBQVVBLElBQUEsQ0FBSyxJQUFBdlMsT0FBTCxHQUFtQixDQUFuQixDQUVWc1M7VUFBQSxHQUFTLENBRVQ7VUFBTyxJQUFQLENBQWE7QUFDWHhELGFBQUEsR0FBVSxJQUFBcUQsU0FBQSxDQUFjRyxNQUFkLENBR1Y7U0FBSXhELE9BQUosSUFBZSxJQUFBOU8sT0FBZjtBQUNFLGFBREY7O0FBS0EsU0FBSThPLE9BQUosR0FBYyxDQUFkLEdBQWtCLElBQUE5TyxPQUFsQixJQUFpQ3VTLElBQUEsQ0FBS3pELE9BQUwsR0FBZSxDQUFmLENBQWpDLEdBQXFEeUQsSUFBQSxDQUFLekQsT0FBTCxDQUFyRDtBQUNFQSxlQUFBLElBQVcsQ0FEYjs7QUFLQSxTQUFJeUQsSUFBQSxDQUFLekQsT0FBTCxDQUFKLEdBQW9CeUQsSUFBQSxDQUFLRCxNQUFMLENBQXBCLENBQWtDO0FBQ2hDRSxZQUFBLEdBQU9ELElBQUEsQ0FBS0QsTUFBTCxDQUNQQztZQUFBLENBQUtELE1BQUwsQ0FBQSxHQUFlQyxJQUFBLENBQUt6RCxPQUFMLENBQ2Z5RDtZQUFBLENBQUt6RCxPQUFMLENBQUEsR0FBZ0IwRCxJQUVoQkE7WUFBQSxHQUFPRCxJQUFBLENBQUtELE1BQUwsR0FBYyxDQUFkLENBQ1BDO1lBQUEsQ0FBS0QsTUFBTCxHQUFjLENBQWQsQ0FBQSxHQUFtQkMsSUFBQSxDQUFLekQsT0FBTCxHQUFlLENBQWYsQ0FDbkJ5RDtZQUFBLENBQUt6RCxPQUFMLEdBQWUsQ0FBZixDQUFBLEdBQW9CMEQsSUFQWTtPQUFsQztBQVNFLGFBVEY7O0FBWUFGLFlBQUEsR0FBU3hELE9BMUJFOztBQTZCYixVQUFPLE9BQVFiLEtBQVIsUUFBc0JqSixLQUF0QixTQUFxQyxJQUFBaEYsT0FBckMsQ0E1QzRCO0dBM0VmO0NBQXRCLEM7QUNSQTNCLElBQUFJLFFBQUEsQ0FBYSxjQUFiLENBRUFKO0lBQUEyQyxRQUFBLENBQWEsZ0JBQWIsQ0FFQTNDO0lBQUFnUCxNQUFBLENBQVcsUUFBUSxFQUFHO0FBT3RCTyxNQUFBK0UsUUFBQUMsa0JBQUEsR0FBaUNDLFFBQVEsQ0FBQ0MsT0FBRCxDQUFVO0FBRWpELFFBQUlDLFdBQVdELE9BQUE5UyxPQUVmO1FBQUlnVCxnQkFBZ0IsQ0FFcEI7UUFBSUMsZ0JBQWdCQyxNQUFBQyxrQkFFcEI7UUFBSUMsSUFFSjtRQUFJL0QsS0FFSjtRQUFJZ0UsU0FFSjtRQUFJQyxJQUtKO1FBQUlDLElBRUo7UUFBSUMsUUFFSjtRQUFJQyxLQUVKO1FBQUlwUyxDQUVKO1FBQUlrTixFQUVKO1FBQUkvTSxDQUVKO1FBQUl3RCxLQUdKO1FBQUszRCxDQUFBLEdBQUksQ0FBSixFQUFPa04sRUFBUCxHQUFZd0UsUUFBakIsQ0FBMkIxUixDQUEzQixHQUErQmtOLEVBQS9CLENBQW1DLEVBQUVsTixDQUFyQyxDQUF3QztBQUN0QyxTQUFJeVIsT0FBQSxDQUFRelIsQ0FBUixDQUFKLEdBQWlCMlIsYUFBakI7QUFDRUEscUJBQUEsR0FBZ0JGLE9BQUEsQ0FBUXpSLENBQVIsQ0FEbEI7O0FBR0EsU0FBSXlSLE9BQUEsQ0FBUXpSLENBQVIsQ0FBSixHQUFpQjRSLGFBQWpCO0FBQ0VBLHFCQUFBLEdBQWdCSCxPQUFBLENBQVF6UixDQUFSLENBRGxCOztBQUpzQztBQVN4QytSLFFBQUEsR0FBTyxDQUFQLElBQVlKLGFBQ1ozRDtTQUFBLEdBQVEsS0FBSzlCLGNBQUEsR0FBaUJHLFdBQWpCLEdBQStCeEksS0FBcEMsRUFBMkNrTyxJQUEzQyxDQUdSO1FBQUtDLFNBQUEsR0FBWSxDQUFaLEVBQWVDLElBQWYsR0FBc0IsQ0FBdEIsRUFBeUJDLElBQXpCLEdBQWdDLENBQXJDLENBQXdDRixTQUF4QyxJQUFxREwsYUFBckQsQ0FBQSxDQUFxRTtBQUNuRSxVQUFLM1IsQ0FBTCxHQUFTLENBQVQsQ0FBWUEsQ0FBWixHQUFnQjBSLFFBQWhCLENBQTBCLEVBQUUxUixDQUE1QjtBQUNFLFdBQUl5UixPQUFBLENBQVF6UixDQUFSLENBQUosS0FBbUJnUyxTQUFuQixDQUE4QjtBQUU1QixjQUFLRyxRQUFBLEdBQVcsQ0FBWCxFQUFjQyxLQUFkLEdBQXNCSCxJQUF0QixFQUE0QjlSLENBQTVCLEdBQWdDLENBQXJDLENBQXdDQSxDQUF4QyxHQUE0QzZSLFNBQTVDLENBQXVELEVBQUU3UixDQUF6RCxDQUE0RDtBQUMxRGdTLG9CQUFBLEdBQVlBLFFBQVosSUFBd0IsQ0FBeEIsR0FBOEJDLEtBQTlCLEdBQXNDLENBQ3RDQTtpQkFBQSxLQUFVLENBRmdEOztBQVM1RHpPLGVBQUEsR0FBU3FPLFNBQVQsSUFBc0IsRUFBdEIsR0FBNEJoUyxDQUM1QjtjQUFLRyxDQUFMLEdBQVNnUyxRQUFULENBQW1CaFMsQ0FBbkIsR0FBdUI0UixJQUF2QixDQUE2QjVSLENBQTdCLElBQWtDK1IsSUFBbEM7QUFDRWxFLGlCQUFBLENBQU03TixDQUFOLENBQUEsR0FBV3dELEtBRGI7O0FBSUEsWUFBRXNPLElBaEIwQjs7QUFEaEM7QUFzQkEsUUFBRUQsU0FDRkM7VUFBQSxLQUFTLENBQ1RDO1VBQUEsS0FBUyxDQXpCMEQ7O0FBNEJyRSxVQUFPLENBQUNsRSxLQUFELEVBQVEyRCxhQUFSLEVBQXVCQyxhQUF2QixDQTNFMEM7R0FQN0I7Q0FBdEIsQztBQ0FBNVUsSUFBQUksUUFBQSxDQUFhLGlCQUFiLENBRUFKO0lBQUEyQyxRQUFBLENBQWEsZ0JBQWIsQ0FDQTNDO0lBQUEyQyxRQUFBLENBQWEsZ0JBQWIsQ0FDQTNDO0lBQUEyQyxRQUFBLENBQWEsV0FBYixDQUVBM0M7SUFBQWdQLE1BQUEsQ0FBVyxRQUFRLEVBQUc7QUFjdEJPLE1BQUE4RixXQUFBLEdBQWtCQyxRQUFRLENBQUNDLEtBQUQsRUFBUUMsVUFBUixDQUFvQjtBQUU1QyxRQUFBQyxnQkFBQSxHQUF1QmxHLElBQUE4RixXQUFBSyxnQkFBQUMsUUFFdkI7UUFBQUMsS0FBQSxHQUFZLENBRVo7UUFBQUMsWUFFQTtRQUFBQyxVQUVBO1FBQUFQLE1BQUEsR0FDR3JHLGNBQUEsSUFBa0JxRyxLQUFsQixZQUFtQzFPLEtBQW5DLEdBQTRDLElBQUlzSSxVQUFKLENBQWVvRyxLQUFmLENBQTVDLEdBQW9FQSxLQUV2RTtRQUFBekUsT0FFQTtRQUFBaUYsR0FBQSxHQUFVLENBR1Y7T0FBSVAsVUFBSixDQUFnQjtBQUNkLFNBQUlBLFVBQUEsQ0FBVyxNQUFYLENBQUo7QUFDRSxZQUFBSSxLQUFBLEdBQVlKLFVBQUEsQ0FBVyxNQUFYLENBRGQ7O0FBR0EsU0FBSSxNQUFPQSxXQUFBLENBQVcsaUJBQVgsQ0FBWCxLQUE2QyxRQUE3QztBQUNFLFlBQUFDLGdCQUFBLEdBQXVCRCxVQUFBLENBQVcsaUJBQVgsQ0FEekI7O0FBR0EsU0FBSUEsVUFBQSxDQUFXLGNBQVgsQ0FBSjtBQUNFLFlBQUExRSxPQUFBLEdBQ0c1QixjQUFBLElBQWtCc0csVUFBQSxDQUFXLGNBQVgsQ0FBbEIsWUFBd0QzTyxLQUF4RCxHQUNELElBQUlzSSxVQUFKLENBQWVxRyxVQUFBLENBQVcsY0FBWCxDQUFmLENBREMsR0FDNENBLFVBQUEsQ0FBVyxjQUFYLENBSGpEOztBQUtBLFNBQUksTUFBT0EsV0FBQSxDQUFXLGFBQVgsQ0FBWCxLQUF5QyxRQUF6QztBQUNFLFlBQUFPLEdBQUEsR0FBVVAsVUFBQSxDQUFXLGFBQVgsQ0FEWjs7QUFaYztBQWlCaEIsT0FBSSxDQUFDLElBQUExRSxPQUFMO0FBQ0UsVUFBQUEsT0FBQSxHQUFjLEtBQUs1QixjQUFBLEdBQWlCQyxVQUFqQixHQUE4QnRJLEtBQW5DLEVBQTBDLEtBQTFDLENBRGhCOztBQW5DNEMsR0EyQzlDMEk7TUFBQThGLFdBQUFLLGdCQUFBLEdBQWtDLE1BQzFCLENBRDBCLFFBRXpCLENBRnlCLFVBR3ZCLENBSHVCLFdBSXRCLENBSnNCLENBYWxDbkc7TUFBQThGLFdBQUFXLGNBQUEsR0FBZ0MsQ0FPaEN6RztNQUFBOEYsV0FBQVksY0FBQSxHQUFnQyxHQU9oQzFHO01BQUE4RixXQUFBYSxXQUFBLEdBQTZCLEtBTzdCM0c7TUFBQThGLFdBQUFjLGNBQUEsR0FBZ0MsRUFPaEM1RztNQUFBOEYsV0FBQWUsT0FBQSxHQUF5QixHQU96QjdHO01BQUE4RixXQUFBZ0Isa0JBQUEsR0FBcUMsUUFBUSxFQUFHO0FBQzlDLFFBQUlyRixRQUFRLEVBQVosRUFBZ0JoTyxDQUVoQjtRQUFLQSxDQUFMLEdBQVMsQ0FBVCxDQUFZQSxDQUFaLEdBQWdCLEdBQWhCLENBQXFCQSxDQUFBLEVBQXJCO0FBQ0UsYUFBUSxJQUFSO0FBQ0UsYUFBTUEsQ0FBTixJQUFXLEdBQVg7QUFBaUJnTyxlQUFBM0ssS0FBQSxDQUFXLENBQUNyRCxDQUFELEdBQVcsRUFBWCxFQUFrQixDQUFsQixDQUFYLENBQWtDO2VBQ25EO2FBQU1BLENBQU4sSUFBVyxHQUFYO0FBQWlCZ08sZUFBQTNLLEtBQUEsQ0FBVyxDQUFDckQsQ0FBRCxHQUFLLEdBQUwsR0FBVyxHQUFYLEVBQWtCLENBQWxCLENBQVgsQ0FBa0M7ZUFDbkQ7YUFBTUEsQ0FBTixJQUFXLEdBQVg7QUFBaUJnTyxlQUFBM0ssS0FBQSxDQUFXLENBQUNyRCxDQUFELEdBQUssR0FBTCxHQUFXLENBQVgsRUFBa0IsQ0FBbEIsQ0FBWCxDQUFrQztlQUNuRDthQUFNQSxDQUFOLElBQVcsR0FBWDtBQUFpQmdPLGVBQUEzSyxLQUFBLENBQVcsQ0FBQ3JELENBQUQsR0FBSyxHQUFMLEdBQVcsR0FBWCxFQUFrQixDQUFsQixDQUFYLENBQWtDO2VBQ25EOztBQUNFLGVBQU0sbUJBQU4sR0FBNEJBLENBQTVCLENBTko7O0FBREY7QUFXQSxVQUFPZ08sTUFkdUM7R0FBWCxFQXFCckN6QjtNQUFBOEYsV0FBQXJPLFVBQUFzUCxTQUFBLEdBQXFDQyxRQUFRLEVBQUc7QUFFOUMsUUFBSUMsVUFFSjtRQUFJQyxRQUVKO1FBQUk5VSxNQUVKO1FBQUk0VCxRQUFRLElBQUFBLE1BR1o7V0FBUSxJQUFBRSxnQkFBUjtBQUNFLFdBQUtsRyxJQUFBOEYsV0FBQUssZ0JBQUFnQixLQUFMO0FBRUUsWUFBS0QsUUFBQSxHQUFXLENBQVgsRUFBYzlVLE1BQWQsR0FBdUI0VCxLQUFBNVQsT0FBNUIsQ0FBMEM4VSxRQUExQyxHQUFxRDlVLE1BQXJELENBQUEsQ0FBOEQ7QUFDNUQ2VSxvQkFBQSxHQUFhdEgsY0FBQSxHQUNYcUcsS0FBQXhFLFNBQUEsQ0FBZTBGLFFBQWYsRUFBeUJBLFFBQXpCLEdBQW9DLEtBQXBDLENBRFcsR0FFWGxCLEtBQUEvSyxNQUFBLENBQVlpTSxRQUFaLEVBQXNCQSxRQUF0QixHQUFpQyxLQUFqQyxDQUNGQTtrQkFBQSxJQUFZRCxVQUFBN1UsT0FDWjtjQUFBZ1Ysb0JBQUEsQ0FBeUJILFVBQXpCLEVBQXNDQyxRQUF0QyxLQUFtRDlVLE1BQW5ELENBTDREOztBQU85RCxhQUNGO1dBQUs0TixJQUFBOEYsV0FBQUssZ0JBQUFrQixNQUFMO0FBQ0UsWUFBQTlGLE9BQUEsR0FBYyxJQUFBK0Ysc0JBQUEsQ0FBMkJ0QixLQUEzQixFQUFrQyxJQUFsQyxDQUNkO1lBQUFRLEdBQUEsR0FBVSxJQUFBakYsT0FBQW5QLE9BQ1Y7YUFDRjtXQUFLNE4sSUFBQThGLFdBQUFLLGdCQUFBQyxRQUFMO0FBQ0UsWUFBQTdFLE9BQUEsR0FBYyxJQUFBZ0csd0JBQUEsQ0FBNkJ2QixLQUE3QixFQUFvQyxJQUFwQyxDQUNkO1lBQUFRLEdBQUEsR0FBVSxJQUFBakYsT0FBQW5QLE9BQ1Y7YUFDRjs7QUFDRSxhQUFNLDBCQUFOLENBcEJKOztBQXVCQSxVQUFPLEtBQUFtUCxPQWxDdUM7R0EyQ2hEdkI7TUFBQThGLFdBQUFyTyxVQUFBMlAsb0JBQUEsR0FDQUksUUFBUSxDQUFDUCxVQUFELEVBQWFRLFlBQWIsQ0FBMkI7QUFFakMsUUFBSUMsTUFFSjtRQUFJQyxLQUVKO1FBQUlDLEdBRUo7UUFBSUMsSUFFSjtRQUFJcFUsQ0FFSjtRQUFJa04sRUFFSjtRQUFJWSxTQUFTLElBQUFBLE9BQ2I7UUFBSWlGLEtBQUssSUFBQUEsR0FHVDtPQUFJN0csY0FBSixDQUFvQjtBQUNsQjRCLFlBQUEsR0FBUyxJQUFJM0IsVUFBSixDQUFlLElBQUEyQixPQUFBcEIsT0FBZixDQUNUO1lBQU9vQixNQUFBblAsT0FBUCxJQUF3Qm9VLEVBQXhCLEdBQTZCUyxVQUFBN1UsT0FBN0IsR0FBaUQsQ0FBakQ7QUFDRW1QLGNBQUEsR0FBUyxJQUFJM0IsVUFBSixDQUFlMkIsTUFBQW5QLE9BQWYsSUFBZ0MsQ0FBaEMsQ0FEWDs7QUFHQW1QLFlBQUFYLElBQUEsQ0FBVyxJQUFBVyxPQUFYLENBTGtCOztBQVNwQm1HLFVBQUEsR0FBU0QsWUFBQSxHQUFlLENBQWYsR0FBbUIsQ0FDNUJFO1NBQUEsR0FBUTNILElBQUE4RixXQUFBSyxnQkFBQWdCLEtBQ1I1RjtVQUFBLENBQU9pRixFQUFBLEVBQVAsQ0FBQSxHQUFnQmtCLE1BQWhCLEdBQTJCQyxLQUEzQixJQUFvQyxDQUdwQ0M7T0FBQSxHQUFNWCxVQUFBN1UsT0FDTnlWO1FBQUEsR0FBUSxDQUFDRCxHQUFULEdBQWUsS0FBZixHQUEwQixLQUMxQnJHO1VBQUEsQ0FBT2lGLEVBQUEsRUFBUCxDQUFBLEdBQXdCb0IsR0FBeEIsR0FBOEIsR0FDOUJyRztVQUFBLENBQU9pRixFQUFBLEVBQVAsQ0FBQSxHQUFpQm9CLEdBQWpCLEtBQXlCLENBQXpCLEdBQThCLEdBQzlCckc7VUFBQSxDQUFPaUYsRUFBQSxFQUFQLENBQUEsR0FBdUJxQixJQUF2QixHQUE4QixHQUM5QnRHO1VBQUEsQ0FBT2lGLEVBQUEsRUFBUCxDQUFBLEdBQWdCcUIsSUFBaEIsS0FBeUIsQ0FBekIsR0FBOEIsR0FHOUI7T0FBSWxJLGNBQUosQ0FBb0I7QUFDakI0QixZQUFBWCxJQUFBLENBQVdxRyxVQUFYLEVBQXVCVCxFQUF2QixDQUNBQTtRQUFBLElBQU1TLFVBQUE3VSxPQUNObVA7WUFBQSxHQUFTQSxNQUFBQyxTQUFBLENBQWdCLENBQWhCLEVBQW1CZ0YsRUFBbkIsQ0FIUTtLQUFwQixJQUlPO0FBQ0wsVUFBSy9TLENBQUEsR0FBSSxDQUFKLEVBQU9rTixFQUFQLEdBQVlzRyxVQUFBN1UsT0FBakIsQ0FBb0NxQixDQUFwQyxHQUF3Q2tOLEVBQXhDLENBQTRDLEVBQUVsTixDQUE5QztBQUNFOE4sY0FBQSxDQUFPaUYsRUFBQSxFQUFQLENBQUEsR0FBZVMsVUFBQSxDQUFXeFQsQ0FBWCxDQURqQjs7QUFHQThOLFlBQUFuUCxPQUFBLEdBQWdCb1UsRUFKWDs7QUFPUCxRQUFBQSxHQUFBLEdBQVVBLEVBQ1Y7UUFBQWpGLE9BQUEsR0FBY0EsTUFFZDtVQUFPQSxPQXREMEI7R0ErRG5DdkI7TUFBQThGLFdBQUFyTyxVQUFBNlAsc0JBQUEsR0FDQVEsUUFBUSxDQUFDYixVQUFELEVBQWFRLFlBQWIsQ0FBMkI7QUFFakMsUUFBSU0sU0FBUyxJQUFJL0gsSUFBQUMsVUFBSixDQUFtQk4sY0FBQSxHQUM5QixJQUFJQyxVQUFKLENBQWUsSUFBQTJCLE9BQUFwQixPQUFmLENBRDhCLEdBQ08sSUFBQW9CLE9BRDFCLEVBQ3VDLElBQUFpRixHQUR2QyxDQUdiO1FBQUlrQixNQUVKO1FBQUlDLEtBRUo7UUFBSTVGLElBR0oyRjtVQUFBLEdBQVNELFlBQUEsR0FBZSxDQUFmLEdBQW1CLENBQzVCRTtTQUFBLEdBQVEzSCxJQUFBOEYsV0FBQUssZ0JBQUFrQixNQUVSVTtVQUFBbEgsVUFBQSxDQUFpQjZHLE1BQWpCLEVBQXlCLENBQXpCLEVBQTRCLElBQTVCLENBQ0FLO1VBQUFsSCxVQUFBLENBQWlCOEcsS0FBakIsRUFBd0IsQ0FBeEIsRUFBMkIsSUFBM0IsQ0FFQTVGO1FBQUEsR0FBTyxJQUFBaUcsS0FBQSxDQUFVZixVQUFWLENBQ1A7UUFBQWdCLGFBQUEsQ0FBa0JsRyxJQUFsQixFQUF3QmdHLE1BQXhCLENBRUE7VUFBT0EsT0FBQTFHLE9BQUEsRUFyQjBCO0dBOEJuQ3JCO01BQUE4RixXQUFBck8sVUFBQThQLHdCQUFBLEdBQ0FXLFFBQVEsQ0FBQ2pCLFVBQUQsRUFBYVEsWUFBYixDQUEyQjtBQUVqQyxRQUFJTSxTQUFTLElBQUkvSCxJQUFBQyxVQUFKLENBQW1CTixjQUFBLEdBQzlCLElBQUlDLFVBQUosQ0FBZSxJQUFBMkIsT0FBQXBCLE9BQWYsQ0FEOEIsR0FDTyxJQUFBb0IsT0FEMUIsRUFDdUMsSUFBQWlGLEdBRHZDLENBR2I7UUFBSWtCLE1BRUo7UUFBSUMsS0FFSjtRQUFJNUYsSUFFSjtRQUFJb0csSUFFSjtRQUFJQyxLQUVKO1FBQUlDLEtBRUo7UUFBSUMsYUFDRSxDQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsRUFBeUIsQ0FBekIsRUFBNEIsRUFBNUIsRUFBZ0MsQ0FBaEMsRUFBbUMsRUFBbkMsRUFBdUMsQ0FBdkMsRUFBMEMsRUFBMUMsRUFBOEMsQ0FBOUMsRUFBaUQsRUFBakQsRUFBcUQsQ0FBckQsRUFBd0QsRUFBeEQsRUFBNEQsQ0FBNUQsRUFBK0QsRUFBL0QsQ0FFTjtRQUFJQyxhQUVKO1FBQUlDLFdBRUo7UUFBSUMsV0FFSjtRQUFJQyxTQUtKO1FBQUlDLFdBRUo7UUFBSUMsV0FFSjtRQUFJQyxlQUFlLElBQUl2UixLQUFKLENBQVUsRUFBVixDQUVuQjtRQUFJd1IsU0FFSjtRQUFJcEQsSUFFSjtRQUFJcUQsTUFFSjtRQUFJdFYsQ0FFSjtRQUFJa04sRUFHSitHO1VBQUEsR0FBU0QsWUFBQSxHQUFlLENBQWYsR0FBbUIsQ0FDNUJFO1NBQUEsR0FBUTNILElBQUE4RixXQUFBSyxnQkFBQUMsUUFFUjJCO1VBQUFsSCxVQUFBLENBQWlCNkcsTUFBakIsRUFBeUIsQ0FBekIsRUFBNEIsSUFBNUIsQ0FDQUs7VUFBQWxILFVBQUEsQ0FBaUI4RyxLQUFqQixFQUF3QixDQUF4QixFQUEyQixJQUEzQixDQUVBNUY7UUFBQSxHQUFPLElBQUFpRyxLQUFBLENBQVVmLFVBQVYsQ0FHUHNCO2lCQUFBLEdBQWdCLElBQUFTLFlBQUEsQ0FBaUIsSUFBQTFDLFlBQWpCLEVBQW1DLEVBQW5DLENBQ2hCa0M7ZUFBQSxHQUFjLElBQUFTLHFCQUFBLENBQTBCVixhQUExQixDQUNkRTtlQUFBLEdBQWMsSUFBQU8sWUFBQSxDQUFpQixJQUFBekMsVUFBakIsRUFBaUMsQ0FBakMsQ0FDZG1DO2FBQUEsR0FBWSxJQUFBTyxxQkFBQSxDQUEwQlIsV0FBMUIsQ0FHWjtRQUFLTixJQUFMLEdBQVksR0FBWixDQUFpQkEsSUFBakIsR0FBd0IsR0FBeEIsSUFBK0JJLGFBQUEsQ0FBY0osSUFBZCxHQUFxQixDQUFyQixDQUEvQixLQUEyRCxDQUEzRCxDQUE4REEsSUFBQSxFQUE5RDs7QUFDQSxRQUFLQyxLQUFMLEdBQWEsRUFBYixDQUFpQkEsS0FBakIsR0FBeUIsQ0FBekIsSUFBOEJLLFdBQUEsQ0FBWUwsS0FBWixHQUFvQixDQUFwQixDQUE5QixLQUF5RCxDQUF6RCxDQUE0REEsS0FBQSxFQUE1RDs7QUFHQU8sZUFBQSxHQUNFLElBQUFPLGdCQUFBLENBQXFCZixJQUFyQixFQUEyQkksYUFBM0IsRUFBMENILEtBQTFDLEVBQWlESyxXQUFqRCxDQUNGRztlQUFBLEdBQWMsSUFBQUksWUFBQSxDQUFpQkwsV0FBQVEsTUFBakIsRUFBb0MsQ0FBcEMsQ0FDZDtRQUFLMVYsQ0FBTCxHQUFTLENBQVQsQ0FBWUEsQ0FBWixHQUFnQixFQUFoQixDQUFvQkEsQ0FBQSxFQUFwQjtBQUNFb1Ysa0JBQUEsQ0FBYXBWLENBQWIsQ0FBQSxHQUFrQm1WLFdBQUEsQ0FBWU4sVUFBQSxDQUFXN1UsQ0FBWCxDQUFaLENBRHBCOztBQUdBLFFBQUs0VSxLQUFMLEdBQWEsRUFBYixDQUFpQkEsS0FBakIsR0FBeUIsQ0FBekIsSUFBOEJRLFlBQUEsQ0FBYVIsS0FBYixHQUFxQixDQUFyQixDQUE5QixLQUEwRCxDQUExRCxDQUE2REEsS0FBQSxFQUE3RDs7QUFFQVMsYUFBQSxHQUFZLElBQUFHLHFCQUFBLENBQTBCTCxXQUExQixDQUdaYjtVQUFBbEgsVUFBQSxDQUFpQnNILElBQWpCLEdBQXdCLEdBQXhCLEVBQTZCLENBQTdCLEVBQWdDLElBQWhDLENBQ0FKO1VBQUFsSCxVQUFBLENBQWlCdUgsS0FBakIsR0FBeUIsQ0FBekIsRUFBNEIsQ0FBNUIsRUFBK0IsSUFBL0IsQ0FDQUw7VUFBQWxILFVBQUEsQ0FBaUJ3SCxLQUFqQixHQUF5QixDQUF6QixFQUE0QixDQUE1QixFQUErQixJQUEvQixDQUNBO1FBQUs1VSxDQUFMLEdBQVMsQ0FBVCxDQUFZQSxDQUFaLEdBQWdCNFUsS0FBaEIsQ0FBdUI1VSxDQUFBLEVBQXZCO0FBQ0VzVSxZQUFBbEgsVUFBQSxDQUFpQmdJLFlBQUEsQ0FBYXBWLENBQWIsQ0FBakIsRUFBa0MsQ0FBbEMsRUFBcUMsSUFBckMsQ0FERjs7QUFLQSxRQUFLQSxDQUFBLEdBQUksQ0FBSixFQUFPa04sRUFBUCxHQUFZZ0ksV0FBQVMsTUFBQWhYLE9BQWpCLENBQTJDcUIsQ0FBM0MsR0FBK0NrTixFQUEvQyxDQUFtRGxOLENBQUEsRUFBbkQsQ0FBd0Q7QUFDdERpUyxVQUFBLEdBQU9pRCxXQUFBUyxNQUFBLENBQWtCM1YsQ0FBbEIsQ0FFUHNVO1lBQUFsSCxVQUFBLENBQWlCaUksU0FBQSxDQUFVcEQsSUFBVixDQUFqQixFQUFrQ2tELFdBQUEsQ0FBWWxELElBQVosQ0FBbEMsRUFBcUQsSUFBckQsQ0FHQTtTQUFJQSxJQUFKLElBQVksRUFBWixDQUFnQjtBQUNkalMsU0FBQSxFQUNBO2VBQVFpUyxJQUFSO0FBQ0UsZUFBSyxFQUFMO0FBQVNxRCxrQkFBQSxHQUFTLENBQUc7aUJBQ3JCO2VBQUssRUFBTDtBQUFTQSxrQkFBQSxHQUFTLENBQUc7aUJBQ3JCO2VBQUssRUFBTDtBQUFTQSxrQkFBQSxHQUFTLENBQUc7aUJBQ3JCOztBQUNFLGlCQUFNLGdCQUFOLEdBQXlCckQsSUFBekIsQ0FMSjs7QUFRQXFDLGNBQUFsSCxVQUFBLENBQWlCOEgsV0FBQVMsTUFBQSxDQUFrQjNWLENBQWxCLENBQWpCLEVBQXVDc1YsTUFBdkMsRUFBK0MsSUFBL0MsQ0FWYzs7QUFOc0M7QUFvQnhELFFBQUFNLGVBQUEsQ0FDRXRILElBREYsRUFFRSxDQUFDeUcsV0FBRCxFQUFjRCxhQUFkLENBRkYsRUFHRSxDQUFDRyxTQUFELEVBQVlELFdBQVosQ0FIRixFQUlFVixNQUpGLENBT0E7VUFBT0EsT0FBQTFHLE9BQUEsRUFqSDBCO0dBMkhuQ3JCO01BQUE4RixXQUFBck8sVUFBQTRSLGVBQUEsR0FDQUMsUUFBUSxDQUFDQyxTQUFELEVBQVlDLE1BQVosRUFBb0JDLElBQXBCLEVBQTBCMUIsTUFBMUIsQ0FBa0M7QUFFeEMsUUFBSTFILEtBRUo7UUFBSWpPLE1BRUo7UUFBSXNYLE9BRUo7UUFBSWhFLElBRUo7UUFBSThDLFdBRUo7UUFBSUQsYUFFSjtRQUFJRyxTQUVKO1FBQUlELFdBRUpEO2VBQUEsR0FBY2dCLE1BQUEsQ0FBTyxDQUFQLENBQ2RqQjtpQkFBQSxHQUFnQmlCLE1BQUEsQ0FBTyxDQUFQLENBQ2hCZDthQUFBLEdBQVllLElBQUEsQ0FBSyxDQUFMLENBQ1poQjtlQUFBLEdBQWNnQixJQUFBLENBQUssQ0FBTCxDQUdkO1FBQUtwSixLQUFBLEdBQVEsQ0FBUixFQUFXak8sTUFBWCxHQUFvQm1YLFNBQUFuWCxPQUF6QixDQUEyQ2lPLEtBQTNDLEdBQW1Eak8sTUFBbkQsQ0FBMkQsRUFBRWlPLEtBQTdELENBQW9FO0FBQ2xFcUosYUFBQSxHQUFVSCxTQUFBLENBQVVsSixLQUFWLENBR1YwSDtZQUFBbEgsVUFBQSxDQUFpQjJILFdBQUEsQ0FBWWtCLE9BQVosQ0FBakIsRUFBdUNuQixhQUFBLENBQWNtQixPQUFkLENBQXZDLEVBQStELElBQS9ELENBR0E7U0FBSUEsT0FBSixHQUFjLEdBQWQsQ0FBbUI7QUFFakIzQixjQUFBbEgsVUFBQSxDQUFpQjBJLFNBQUEsQ0FBVSxFQUFFbEosS0FBWixDQUFqQixFQUFxQ2tKLFNBQUEsQ0FBVSxFQUFFbEosS0FBWixDQUFyQyxFQUF5RCxJQUF6RCxDQUVBcUY7WUFBQSxHQUFPNkQsU0FBQSxDQUFVLEVBQUVsSixLQUFaLENBQ1AwSDtjQUFBbEgsVUFBQSxDQUFpQjZILFNBQUEsQ0FBVWhELElBQVYsQ0FBakIsRUFBa0MrQyxXQUFBLENBQVkvQyxJQUFaLENBQWxDLEVBQXFELElBQXJELENBRUFxQztjQUFBbEgsVUFBQSxDQUFpQjBJLFNBQUEsQ0FBVSxFQUFFbEosS0FBWixDQUFqQixFQUFxQ2tKLFNBQUEsQ0FBVSxFQUFFbEosS0FBWixDQUFyQyxFQUF5RCxJQUF6RCxDQVBpQjtPQUFuQjtBQVNPLFdBQUlxSixPQUFKLEtBQWdCLEdBQWhCO0FBQ0wsZUFESzs7QUFUUDtBQVBrRTtBQXFCcEUsVUFBTzNCLE9BN0NpQztHQXNEMUMvSDtNQUFBOEYsV0FBQXJPLFVBQUF3USxhQUFBLEdBQXlDMEIsUUFBUSxDQUFDSixTQUFELEVBQVl4QixNQUFaLENBQW9CO0FBRW5FLFFBQUkxSCxLQUVKO1FBQUlqTyxNQUVKO1FBQUlzWCxPQUdKO1FBQUtySixLQUFBLEdBQVEsQ0FBUixFQUFXak8sTUFBWCxHQUFvQm1YLFNBQUFuWCxPQUF6QixDQUEyQ2lPLEtBQTNDLEdBQW1Eak8sTUFBbkQsQ0FBMkRpTyxLQUFBLEVBQTNELENBQW9FO0FBQ2xFcUosYUFBQSxHQUFVSCxTQUFBLENBQVVsSixLQUFWLENBR1ZMO1VBQUFDLFVBQUF4SSxVQUFBb0osVUFBQWxHLE1BQUEsQ0FDRW9OLE1BREYsRUFFRS9ILElBQUE4RixXQUFBZ0Isa0JBQUEsQ0FBa0M0QyxPQUFsQyxDQUZGLENBTUE7U0FBSUEsT0FBSixHQUFjLEdBQWQsQ0FBcUI7QUFFbkIzQixjQUFBbEgsVUFBQSxDQUFpQjBJLFNBQUEsQ0FBVSxFQUFFbEosS0FBWixDQUFqQixFQUFxQ2tKLFNBQUEsQ0FBVSxFQUFFbEosS0FBWixDQUFyQyxFQUF5RCxJQUF6RCxDQUVBMEg7Y0FBQWxILFVBQUEsQ0FBaUIwSSxTQUFBLENBQVUsRUFBRWxKLEtBQVosQ0FBakIsRUFBcUMsQ0FBckMsQ0FFQTBIO2NBQUFsSCxVQUFBLENBQWlCMEksU0FBQSxDQUFVLEVBQUVsSixLQUFaLENBQWpCLEVBQXFDa0osU0FBQSxDQUFVLEVBQUVsSixLQUFaLENBQXJDLEVBQXlELElBQXpELENBTm1CO09BQXJCO0FBUU8sV0FBSXFKLE9BQUosS0FBZ0IsR0FBaEI7QUFDTCxlQURLOztBQVJQO0FBVmtFO0FBdUJwRSxVQUFPM0IsT0FoQzREO0dBeUNyRS9IO01BQUE4RixXQUFBOEQsVUFBQSxHQUE0QkMsUUFBUSxDQUFDelgsTUFBRCxFQUFTMFgsZ0JBQVQsQ0FBMkI7QUFFN0QsUUFBQTFYLE9BQUEsR0FBY0EsTUFFZDtRQUFBMFgsaUJBQUEsR0FBd0JBLGdCQUpxQztHQWEvRDlKO01BQUE4RixXQUFBOEQsVUFBQUcsZ0JBQUEsR0FBNkMsUUFBUSxDQUFDdEksS0FBRCxDQUFRO0FBQzNELFVBQU85QixlQUFBLEdBQWlCLElBQUlHLFdBQUosQ0FBZ0IyQixLQUFoQixDQUFqQixHQUEwQ0EsS0FEVTtHQUFoQixDQUV6QyxRQUFRLEVBQUc7QUFFYixRQUFJQSxRQUFRLEVBRVo7UUFBSWhPLENBRUo7UUFBSWdQLENBRUo7UUFBS2hQLENBQUwsR0FBUyxDQUFULENBQVlBLENBQVosSUFBaUIsR0FBakIsQ0FBc0JBLENBQUEsRUFBdEIsQ0FBMkI7QUFDekJnUCxPQUFBLEdBQUlpRCxJQUFBLENBQUtqUyxDQUFMLENBQ0pnTztXQUFBLENBQU1oTyxDQUFOLENBQUEsR0FBWWdQLENBQUEsQ0FBRSxDQUFGLENBQVosSUFBb0IsRUFBcEIsR0FBMkJBLENBQUEsQ0FBRSxDQUFGLENBQTNCLElBQW1DLEVBQW5DLEdBQXlDQSxDQUFBLENBQUUsQ0FBRixDQUZoQjs7QUFTM0JpRCxZQUFTQSxLQUFJLENBQUN0VCxNQUFELENBQVM7QUFDcEIsYUFBUSxJQUFSO0FBQ0UsYUFBTUEsTUFBTixLQUFpQixDQUFqQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBc0I7ZUFDbEQ7YUFBTUEsTUFBTixLQUFpQixDQUFqQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBc0I7ZUFDbEQ7YUFBTUEsTUFBTixLQUFpQixDQUFqQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBc0I7ZUFDbEQ7YUFBTUEsTUFBTixLQUFpQixDQUFqQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBc0I7ZUFDbEQ7YUFBTUEsTUFBTixLQUFpQixDQUFqQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBc0I7ZUFDbEQ7YUFBTUEsTUFBTixLQUFpQixDQUFqQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBc0I7ZUFDbEQ7YUFBTUEsTUFBTixLQUFpQixDQUFqQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBc0I7ZUFDbEQ7YUFBTUEsTUFBTixLQUFpQixFQUFqQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDcEQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDcEQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEdBQWYsRUFBb0IsQ0FBcEIsQ0FBd0I7ZUFDckQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEdBQWYsRUFBb0IsQ0FBcEIsQ0FBd0I7ZUFDckQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEdBQWYsRUFBb0IsQ0FBcEIsQ0FBd0I7ZUFDckQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFB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QUwsa0JBQUFDLFFBRmdCLENBRC9CLENBTUE3WDtJQUFBZ2YsYUFBQSxDQUNFLDBCQURGLEVBQzhCLENBQzFCLE9BRDBCLENBQ2pCaGYsSUFBQWlZLElBQUFqSyxnQkFBQW1NLE1BRGlCLEVBRTFCLE1BRjBCLENBRWxCbmEsSUFBQWlZLElBQUFqSyxnQkFBQTBSLEtBRmtCLEVBRzFCLFdBSDBCLENBR2IxZixJQUFBaVksSUFBQWpLLGdCQUFBMlIsVUFIYSxDQUQ5QjsiLCJzb3VyY2VzIjpbImNsb3N1cmUtcHJpbWl0aXZlcy9iYXNlLmpzIiwiZGVmaW5lL3R5cGVkYXJyYXkvaHlicmlkLmpzIiwic3JjL2JpdHN0cmVhbS5qcyIsInNyYy9jcmMzMi5qcyIsInNyYy9maXhfcGhhbnRvbWpzX2Z1bmN0aW9uX2FwcGx5X2J1Zy5qcyIsInNyYy9ndW56aXBfbWVtYmVyLmpzIiwic3JjL2hlYXAuanMiLCJzcmMvaHVmZm1hbi5qcyIsInNyYy9yYXdkZWZsYXRlLmpzIiwic3JjL2d6aXAuanMiLCJzcmMvcmF3aW5mbGF0ZV9zdHJlYW0uanMiLCJzcmMvcmF3aW5mbGF0ZS5qcyIsInNyYy9ndW56aXAuanMiLCJzcmMvdXRpbC5qcyIsInNyYy9hZGxlcjMyLmpzIiwic3JjL2luZmxhdGUuanMiLCJzcmMvemlwLmpzIiwic3JjL3VuemlwLmpzIiwic3JjL3psaWIuanMiLCJzcmMvZGVmbGF0ZS5qcyIsInNyYy9leHBvcnRfb2JqZWN0LmpzIiwic3JjL2luZmxhdGVfc3RyZWFtLmpzIiwiZXhwb3J0L2FkbGVyMzIuanMiLCJleHBvcnQvY3JjMzIuanMiLCJleHBvcnQvZGVmbGF0ZS5qcyIsImV4cG9ydC9ndW56aXBfbWVtYmVyLmpzIiwiZXhwb3J0L2d1bnppcC5qcyIsImV4cG9ydC9nemlwLmpzIiwiZXhwb3J0L2luZmxhdGVfc3RyZWFtLmpzIiwiZXhwb3J0L2luZmxhdGUuanMiLCJleHBvcnQvcmF3ZGVmbGF0ZS5qcyIsImV4cG9ydC9yYXdpbmZsYXRlX3N0cmVhbS5qcyIsImV4cG9ydC9yYXdpbmZsYXRlLmpzIiwiZXhwb3J0L3VuemlwLmpzIiwiZXhwb3J0L3ppcC5qcyJdLCJuYW1lcyI6WyJDT01QSUxFRCIsImdvb2ciLCJnbG9iYWwiLCJERUJVRyIsIkxPQ0FMRSIsInByb3ZpZGUiLCJnb29nLnByb3ZpZGUiLCJuYW1lIiwiaXNQcm92aWRlZF8iLCJFcnJvciIsImltcGxpY2l0TmFtZXNwYWNlc18iLCJuYW1lc3BhY2UiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsImdldE9iamVjdEJ5TmFtZSIsImV4cG9ydFBhdGhfIiwic2V0VGVzdE9ubHkiLCJnb29nLnNldFRlc3RPbmx5Iiwib3B0X21lc3NhZ2UiLCJnb29nLmlzUHJvdmlkZWRfIiwiZ29vZy5leHBvcnRQYXRoXyIsIm9wdF9vYmplY3QiLCJvcHRfb2JqZWN0VG9FeHBvcnRUbyIsInBhcnRzIiwic3BsaXQiLCJjdXIiLCJleGVjU2NyaXB0IiwicGFydCIsImxlbmd0aCIsInNoaWZ0IiwiaXNEZWYiLCJnb29nLmdldE9iamVjdEJ5TmFtZSIsIm9wdF9vYmoiLCJpc0RlZkFuZE5vdE51bGwiLCJnbG9iYWxpemUiLCJnb29nLmdsb2JhbGl6ZSIsIm9iaiIsIm9wdF9nbG9iYWwiLCJ4IiwiYWRkRGVwZW5kZW5jeSIsImdvb2cuYWRkRGVwZW5kZW5jeSIsInJlbFBhdGgiLCJwcm92aWRlcyIsInJlcXVpcmVzIiwicmVxdWlyZSIsInBhdGgiLCJyZXBsYWNlIiwiZGVwcyIsImRlcGVuZGVuY2llc18iLCJpIiwibmFtZVRvUGF0aCIsInBhdGhUb05hbWVzIiwiaiIsIkVOQUJMRV9ERUJVR19MT0FERVIiLCJnb29nLnJlcXVpcmUiLCJnZXRQYXRoRnJvbURlcHNfIiwiaW5jbHVkZWRfIiwid3JpdGVTY3JpcHRzXyIsImVycm9yTWVzc2FnZSIsImNvbnNvbGUiLCJiYXNlUGF0aCIsIkNMT1NVUkVfQkFTRV9QQVRIIiwiQ0xPU1VSRV9OT19ERVBTIiwiQ0xPU1VSRV9JTVBPUlRfU0NSSVBUIiwibnVsbEZ1bmN0aW9uIiwiZ29vZy5udWxsRnVuY3Rpb24iLCJpZGVudGl0eUZ1bmN0aW9uIiwiZ29vZy5pZGVudGl0eUZ1bmN0aW9uIiwib3B0X3JldHVyblZhbHVlIiwidmFyX2FyZ3MiLCJhYnN0cmFjdE1ldGhvZCIsImdvb2cuYWJzdHJhY3RNZXRob2QiLCJhZGRTaW5nbGV0b25HZXR0ZXIiLCJnb29nLmFkZFNpbmdsZXRvbkdldHRlciIsImN0b3IiLCJnZXRJbnN0YW5jZSIsImN0b3IuZ2V0SW5zdGFuY2UiLCJpbnN0YW5jZV8iLCJpbnN0YW50aWF0ZWRTaW5nbGV0b25zXyIsImluSHRtbERvY3VtZW50XyIsImdvb2cuaW5IdG1sRG9jdW1lbnRfIiwiZG9jIiwiZG9jdW1lbnQiLCJmaW5kQmFzZVBhdGhfIiwiZ29vZy5maW5kQmFzZVBhdGhfIiwic2NyaXB0cyIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwic3JjIiwicW1hcmsiLCJsIiwic3Vic3RyIiwiaW1wb3J0U2NyaXB0XyIsImdvb2cuaW1wb3J0U2NyaXB0XyIsImltcG9ydFNjcmlwdCIsIndyaXRlU2NyaXB0VGFnXyIsIndyaXR0ZW4iLCJnb29nLndyaXRlU2NyaXB0VGFnXyIsIndyaXRlIiwiZ29vZy53cml0ZVNjcmlwdHNfIiwic2VlblNjcmlwdCIsInZpc2l0Tm9kZSIsInZpc2l0ZWQiLCJwdXNoIiwicmVxdWlyZU5hbWUiLCJnb29nLmdldFBhdGhGcm9tRGVwc18iLCJydWxlIiwidHlwZU9mIiwiZ29vZy50eXBlT2YiLCJ2YWx1ZSIsInMiLCJBcnJheSIsIk9iamVjdCIsImNsYXNzTmFtZSIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2FsbCIsInNwbGljZSIsInByb3BlcnR5SXNFbnVtZXJhYmxlIiwiZ29vZy5pc0RlZiIsInZhbCIsInVuZGVmaW5lZCIsImlzTnVsbCIsImdvb2cuaXNOdWxsIiwiZ29vZy5pc0RlZkFuZE5vdE51bGwiLCJpc0FycmF5IiwiZ29vZy5pc0FycmF5IiwiaXNBcnJheUxpa2UiLCJnb29nLmlzQXJyYXlMaWtlIiwidHlwZSIsImlzRGF0ZUxpa2UiLCJnb29nLmlzRGF0ZUxpa2UiLCJpc09iamVjdCIsImdldEZ1bGxZZWFyIiwiaXNTdHJpbmciLCJnb29nLmlzU3RyaW5nIiwiaXNCb29sZWFuIiwiZ29vZy5pc0Jvb2xlYW4iLCJpc051bWJlciIsImdvb2cuaXNOdW1iZXIiLCJpc0Z1bmN0aW9uIiwiZ29vZy5pc0Z1bmN0aW9uIiwiZ29vZy5pc09iamVjdCIsImdldFVpZCIsImdvb2cuZ2V0VWlkIiwiVUlEX1BST1BFUlRZXyIsInVpZENvdW50ZXJfIiwicmVtb3ZlVWlkIiwiZ29vZy5yZW1vdmVVaWQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJleCIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImdldEhhc2hDb2RlIiwicmVtb3ZlSGFzaENvZGUiLCJjbG9uZU9iamVjdCIsImdvb2cuY2xvbmVPYmplY3QiLCJjbG9uZSIsImtleSIsImJpbmROYXRpdmVfIiwiZ29vZy5iaW5kTmF0aXZlXyIsImZuIiwic2VsZk9iaiIsImFwcGx5IiwiYmluZCIsImFyZ3VtZW50cyIsImJpbmRKc18iLCJnb29nLmJpbmRKc18iLCJib3VuZEFyZ3MiLCJzbGljZSIsIm5ld0FyZ3MiLCJ1bnNoaWZ0IiwiZ29vZy5iaW5kIiwiRnVuY3Rpb24iLCJpbmRleE9mIiwicGFydGlhbCIsImdvb2cucGFydGlhbCIsImFyZ3MiLCJtaXhpbiIsImdvb2cubWl4aW4iLCJ0YXJnZXQiLCJzb3VyY2UiLCJub3ciLCJEYXRlIiwiZ2xvYmFsRXZhbCIsImdvb2cuZ2xvYmFsRXZhbCIsInNjcmlwdCIsImV2YWwiLCJldmFsV29ya3NGb3JHbG9iYWxzXyIsInNjcmlwdEVsdCIsImNyZWF0ZUVsZW1lbnQiLCJkZWZlciIsImFwcGVuZENoaWxkIiwiY3JlYXRlVGV4dE5vZGUiLCJib2R5IiwicmVtb3ZlQ2hpbGQiLCJjc3NOYW1lTWFwcGluZ18iLCJjc3NOYW1lTWFwcGluZ1N0eWxlXyIsImdldENzc05hbWUiLCJnb29nLmdldENzc05hbWUiLCJvcHRfbW9kaWZpZXIiLCJnZXRNYXBwaW5nIiwiY3NzTmFtZSIsInJlbmFtZUJ5UGFydHMiLCJtYXBwZWQiLCJqb2luIiwicmVuYW1lIiwiYSIsInNldENzc05hbWVNYXBwaW5nIiwiZ29vZy5zZXRDc3NOYW1lTWFwcGluZyIsIm1hcHBpbmciLCJvcHRfc3R5bGUiLCJDTE9TVVJFX0NTU19OQU1FX01BUFBJTkciLCJnZXRNc2ciLCJnb29nLmdldE1zZyIsInN0ciIsIm9wdF92YWx1ZXMiLCJ2YWx1ZXMiLCJSZWdFeHAiLCJleHBvcnRTeW1ib2wiLCJnb29nLmV4cG9ydFN5bWJvbCIsInB1YmxpY1BhdGgiLCJvYmplY3QiLCJleHBvcnRQcm9wZXJ0eSIsImdvb2cuZXhwb3J0UHJvcGVydHkiLCJwdWJsaWNOYW1lIiwic3ltYm9sIiwiaW5oZXJpdHMiLCJnb29nLmluaGVyaXRzIiwiY2hpbGRDdG9yIiwicGFyZW50Q3RvciIsInRlbXBDdG9yIiwic3VwZXJDbGFzc18iLCJjb25zdHJ1Y3RvciIsImJhc2UiLCJnb29nLmJhc2UiLCJtZSIsIm9wdF9tZXRob2ROYW1lIiwiY2FsbGVyIiwiY2FsbGVlIiwiZm91bmRDYWxsZXIiLCJzY29wZSIsImdvb2cuc2NvcGUiLCJVU0VfVFlQRURBUlJBWSIsIlVpbnQ4QXJyYXkiLCJVaW50MTZBcnJheSIsIlVpbnQzMkFycmF5IiwiRGF0YVZpZXciLCJabGliIiwiQml0U3RyZWFtIiwiWmxpYi5CaXRTdHJlYW0iLCJidWZmZXIiLCJidWZmZXJQb3NpdGlvbiIsImluZGV4IiwiYml0aW5kZXgiLCJEZWZhdWx0QmxvY2tTaXplIiwiZXhwYW5kQnVmZmVyIiwiWmxpYi5CaXRTdHJlYW0ucHJvdG90eXBlLmV4cGFuZEJ1ZmZlciIsIm9sZGJ1ZiIsImlsIiwic2V0Iiwid3JpdGVCaXRzIiwiWmxpYi5CaXRTdHJlYW0ucHJvdG90eXBlLndyaXRlQml0cyIsIm51bWJlciIsIm4iLCJyZXZlcnNlIiwiY3VycmVudCIsInJldjMyXyIsIlJldmVyc2VUYWJsZSIsImZpbmlzaCIsIlpsaWIuQml0U3RyZWFtLnByb3RvdHlwZS5maW5pc2giLCJvdXRwdXQiLCJzdWJhcnJheSIsInRhYmxlIiwiciIsIlpMSUJfQ1JDMzJfQ09NUEFDVCIsIkNSQzMyIiwiY2FsYyIsIlpsaWIuQ1JDMzIuY2FsYyIsImRhdGEiLCJwb3MiLCJ1cGRhdGUiLCJabGliLkNSQzMyLnVwZGF0ZSIsImNyYyIsIlRhYmxlIiwic2luZ2xlIiwiWmxpYi5DUkMzMi5zaW5nbGUiLCJudW0iLCJUYWJsZV8iLCJjIiwiZSIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImZyb21DaGFyQ29kZUFwcGx5IiwidGhpc29iaiIsIkd1bnppcE1lbWJlciIsIlpsaWIuR3VuemlwTWVtYmVyIiwiaWQxIiwiaWQyIiwiY20iLCJmbGciLCJtdGltZSIsInhmbCIsIm9zIiwiY3JjMTYiLCJ4bGVuIiwiY3JjMzIiLCJpc2l6ZSIsImNvbW1lbnQiLCJnZXROYW1lIiwiWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldE5hbWUiLCJnZXREYXRhIiwiWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldERhdGEiLCJnZXRNdGltZSIsIlpsaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXRNdGltZSIsIkhlYXAiLCJabGliLkhlYXAiLCJnZXRQYXJlbnQiLCJabGliLkhlYXAucHJvdG90eXBlLmdldFBhcmVudCIsImdldENoaWxkIiwiWmxpYi5IZWFwLnByb3RvdHlwZS5nZXRDaGlsZCIsIlpsaWIuSGVhcC5wcm90b3R5cGUucHVzaCIsInBhcmVudCIsImhlYXAiLCJzd2FwIiwicG9wIiwiWmxpYi5IZWFwLnByb3RvdHlwZS5wb3AiLCJIdWZmbWFuIiwiYnVpbGRIdWZmbWFuVGFibGUiLCJabGliLkh1ZmZtYW4uYnVpbGRIdWZmbWFuVGFibGUiLCJsZW5ndGhzIiwibGlzdFNpemUiLCJtYXhDb2RlTGVuZ3RoIiwibWluQ29kZUxlbmd0aCIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwic2l6ZSIsImJpdExlbmd0aCIsImNvZGUiLCJza2lwIiwicmV2ZXJzZWQiLCJydGVtcCIsIlJhd0RlZmxhdGUiLCJabGliLlJhd0RlZmxhdGUiLCJpbnB1dCIsIm9wdF9wYXJhbXMiLCJjb21wcmVzc2lvblR5cGUiLCJDb21wcmVzc2lvblR5cGUiLCJEWU5BTUlDIiwibGF6eSIsImZyZXFzTGl0TGVuIiwiZnJlcXNEaXN0Iiwib3AiLCJMejc3TWluTGVuZ3RoIiwiTHo3N01heExlbmd0aCIsIldpbmRvd1NpemUiLCJNYXhDb2RlTGVuZ3RoIiwiSFVGTUFYIiwiRml4ZWRIdWZmbWFuVGFibGUiLCJjb21wcmVzcyIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuY29tcHJlc3MiLCJibG9ja0FycmF5IiwicG9zaXRpb24iLCJOT05FIiwibWFrZU5vY29tcHJlc3NCbG9jayIsIkZJWEVEIiwibWFrZUZpeGVkSHVmZm1hbkJsb2NrIiwibWFrZUR5bmFtaWNIdWZmbWFuQmxvY2siLCJabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLm1ha2VOb2NvbXByZXNzQmxvY2siLCJpc0ZpbmFsQmxvY2siLCJiZmluYWwiLCJidHlwZSIsImxlbiIsIm5sZW4iLCJabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLm1ha2VGaXhlZEh1ZmZtYW5CbG9jayIsInN0cmVhbSIsImx6NzciLCJmaXhlZEh1ZmZtYW4iLCJabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLm1ha2VEeW5hbWljSHVmZm1hbkJsb2NrIiwiaGxpdCIsImhkaXN0IiwiaGNsZW4iLCJoY2xlbk9yZGVyIiwibGl0TGVuTGVuZ3RocyIsImxpdExlbkNvZGVzIiwiZGlzdExlbmd0aHMiLCJkaXN0Q29kZXMiLCJ0cmVlU3ltYm9scyIsInRyZWVMZW5ndGhzIiwidHJhbnNMZW5ndGhzIiwidHJlZUNvZGVzIiwiYml0bGVuIiwiZ2V0TGVuZ3Roc18iLCJnZXRDb2Rlc0Zyb21MZW5ndGhzXyIsImdldFRyZWVTeW1ib2xzXyIsImZyZXFzIiwiY29kZXMiLCJkeW5hbWljSHVmZm1hbiIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuZHluYW1pY0h1ZmZtYW4iLCJkYXRhQXJyYXkiLCJsaXRMZW4iLCJkaXN0IiwibGl0ZXJhbCIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuZml4ZWRIdWZmbWFuIiwiTHo3N01hdGNoIiwiWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaCIsImJhY2t3YXJkRGlzdGFuY2UiLCJMZW5ndGhDb2RlVGFibGUiLCJnZXREaXN0YW5jZUNvZGVfIiwiWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaC5wcm90b3R5cGUuZ2V0RGlzdGFuY2VDb2RlXyIsInRvTHo3N0FycmF5IiwiWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaC5wcm90b3R5cGUudG9Mejc3QXJyYXkiLCJjb2RlQXJyYXkiLCJabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmx6NzciLCJtYXRjaEtleSIsIndpbmRvd1NpemUiLCJtYXRjaExpc3QiLCJsb25nZXN0TWF0Y2giLCJwcmV2TWF0Y2giLCJsejc3YnVmIiwic2tpcExlbmd0aCIsInRtcCIsIndyaXRlTWF0Y2giLCJtYXRjaCIsIm9mZnNldCIsImx6NzdBcnJheSIsInNlYXJjaExvbmdlc3RNYXRjaF8iLCJabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLnNlYXJjaExvbmdlc3RNYXRjaF8iLCJjdXJyZW50TWF0Y2giLCJtYXRjaE1heCIsIm1hdGNoTGVuZ3RoIiwiZGwiLCJabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmdldFRyZWVTeW1ib2xzXyIsImxpdGxlbkxlbmd0aHMiLCJydW5MZW5ndGgiLCJyZXN1bHQiLCJuUmVzdWx0IiwicnB0IiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5nZXRMZW5ndGhzXyIsImxpbWl0IiwiblN5bWJvbHMiLCJub2RlcyIsImNvZGVMZW5ndGgiLCJyZXZlcnNlUGFja2FnZU1lcmdlXyIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUucmV2ZXJzZVBhY2thZ2VNZXJnZV8iLCJzeW1ib2xzIiwibWluaW11bUNvc3QiLCJmbGFnIiwiY3VycmVudFBvc2l0aW9uIiwiZXhjZXNzIiwiaGFsZiIsInQiLCJ3ZWlnaHQiLCJuZXh0IiwidGFrZVBhY2thZ2UiLCJabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmdldENvZGVzRnJvbUxlbmd0aHNfIiwiY291bnQiLCJzdGFydENvZGUiLCJtIiwiR3ppcCIsIlpsaWIuR3ppcCIsImlwIiwiZmxhZ3MiLCJmaWxlbmFtZSIsImRlZmxhdGVPcHRpb25zIiwiRGVmYXVsdEJ1ZmZlclNpemUiLCJabGliLkd6aXAucHJvdG90eXBlLmNvbXByZXNzIiwicmF3ZGVmbGF0ZSIsIkZsYWdzTWFzayIsIkZOQU1FIiwiRkNPTU1FTlQiLCJGSENSQyIsIk9wZXJhdGluZ1N5c3RlbSIsIlVOS05PV04iLCJjaGFyQ29kZUF0IiwiYnl0ZUxlbmd0aCIsIlpMSUJfU1RSRUFNX1JBV19JTkZMQVRFX0JVRkZFUl9TSVpFIiwiUmF3SW5mbGF0ZVN0cmVhbSIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbSIsIm9wdF9idWZmZXJzaXplIiwiYmxvY2tzIiwiYnVmZmVyU2l6ZSIsInRvdGFscG9zIiwiYml0c2J1ZiIsImJpdHNidWZsZW4iLCJibG9ja0xlbmd0aCIsInJlc2l6ZSIsImxpdGxlblRhYmxlIiwiZGlzdFRhYmxlIiwic3AiLCJzdGF0dXMiLCJTdGF0dXMiLCJJTklUSUFMSVpFRCIsImlwXyIsImJpdHNidWZsZW5fIiwiYml0c2J1Zl8iLCJCbG9ja1R5cGUiLCJkZWNvbXByZXNzIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5kZWNvbXByZXNzIiwibmV3SW5wdXQiLCJzdG9wIiwiQkxPQ0tfSEVBREVSX1NUQVJUIiwicmVhZEJsb2NrSGVhZGVyIiwiQkxPQ0tfSEVBREVSX0VORCIsIkJMT0NLX0JPRFlfU1RBUlQiLCJjdXJyZW50QmxvY2tUeXBlIiwiVU5DT01QUkVTU0VEIiwicmVhZFVuY29tcHJlc3NlZEJsb2NrSGVhZGVyIiwicGFyc2VGaXhlZEh1ZmZtYW5CbG9jayIsInBhcnNlRHluYW1pY0h1ZmZtYW5CbG9jayIsIkJMT0NLX0JPRFlfRU5EIiwiREVDT0RFX0JMT0NLX1NUQVJUIiwicGFyc2VVbmNvbXByZXNzZWRCbG9jayIsImRlY29kZUh1ZmZtYW4iLCJERUNPREVfQkxPQ0tfRU5EIiwiY29uY2F0QnVmZmVyIiwiTWF4QmFja3dhcmRMZW5ndGgiLCJNYXhDb3B5TGVuZ3RoIiwiT3JkZXIiLCJMZW5ndGhFeHRyYVRhYmxlIiwiRGlzdENvZGVUYWJsZSIsIkRpc3RFeHRyYVRhYmxlIiwiRml4ZWRMaXRlcmFsTGVuZ3RoVGFibGUiLCJGaXhlZERpc3RhbmNlVGFibGUiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRCbG9ja0hlYWRlciIsImhkciIsInNhdmVfIiwicmVhZEJpdHMiLCJyZXN0b3JlXyIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucmVhZEJpdHMiLCJvY3RldCIsInJlYWRDb2RlQnlUYWJsZSIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucmVhZENvZGVCeVRhYmxlIiwiY29kZVRhYmxlIiwiY29kZVdpdGhMZW5ndGgiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRVbmNvbXByZXNzZWRCbG9ja0hlYWRlciIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucGFyc2VVbmNvbXByZXNzZWRCbG9jayIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucGFyc2VGaXhlZEh1ZmZtYW5CbG9jayIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuc2F2ZV8iLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlc3RvcmVfIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5wYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2siLCJjb2RlTGVuZ3RocyIsImNvZGVMZW5ndGhzVGFibGUiLCJwYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2tJbXBsIiwiYml0cyIsInByZXYiLCJyZXBlYXQiLCJsZW5ndGhUYWJsZSIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb2RlSHVmZm1hbiIsInRpIiwiY29kZURpc3QiLCJsaXRsZW4iLCJvbGVuZ3RoIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5leHBhbmRCdWZmZXIiLCJvcHRfcGFyYW0iLCJyYXRpbyIsIm1heEh1ZmZDb2RlIiwibmV3U2l6ZSIsIm1heEluZmxhdGVTaXplIiwiZml4UmF0aW8iLCJhZGRSYXRpbyIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuY29uY2F0QnVmZmVyIiwiWkxJQl9SQVdfSU5GTEFURV9CVUZGRVJfU0laRSIsIlJhd0luZmxhdGUiLCJabGliLlJhd0luZmxhdGUiLCJidWZmZXJUeXBlIiwiQnVmZmVyVHlwZSIsIkFEQVBUSVZFIiwiQkxPQ0siLCJleHBhbmRCdWZmZXJBZGFwdGl2ZSIsImNvbmNhdEJ1ZmZlckR5bmFtaWMiLCJkZWNvZGVIdWZmbWFuQWRhcHRpdmUiLCJabGliLlJhd0luZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3MiLCJwYXJzZUJsb2NrIiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5wYXJzZUJsb2NrIiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5yZWFkQml0cyIsImlucHV0TGVuZ3RoIiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5yZWFkQ29kZUJ5VGFibGUiLCJabGliLlJhd0luZmxhdGUucHJvdG90eXBlLnBhcnNlVW5jb21wcmVzc2VkQmxvY2siLCJwcmVDb3B5IiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5wYXJzZUZpeGVkSHVmZm1hbkJsb2NrIiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5wYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2siLCJabGliLlJhd0luZmxhdGUucHJvdG90eXBlLmRlY29kZUh1ZmZtYW4iLCJjdXJyZW50TGl0bGVuVGFibGUiLCJabGliLlJhd0luZmxhdGUucHJvdG90eXBlLmRlY29kZUh1ZmZtYW5BZGFwdGl2ZSIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyIiwiYmFja3dhcmQiLCJabGliLlJhd0luZmxhdGUucHJvdG90eXBlLmV4cGFuZEJ1ZmZlckFkYXB0aXZlIiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5jb25jYXRCdWZmZXIiLCJibG9jayIsImpsIiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5jb25jYXRCdWZmZXJEeW5hbWljIiwiR3VuemlwIiwiWmxpYi5HdW56aXAiLCJtZW1iZXIiLCJkZWNvbXByZXNzZWQiLCJnZXRNZW1iZXJzIiwiWmxpYi5HdW56aXAucHJvdG90eXBlLmdldE1lbWJlcnMiLCJabGliLkd1bnppcC5wcm90b3R5cGUuZGVjb21wcmVzcyIsImRlY29kZU1lbWJlciIsImNvbmNhdE1lbWJlciIsIlpsaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvZGVNZW1iZXIiLCJyYXdpbmZsYXRlIiwiaW5mbGF0ZWQiLCJpbmZsZW4iLCJjaSIsIkZFWFRSQSIsImRlY29kZVN1YkZpZWxkIiwiWmxpYi5HdW56aXAucHJvdG90eXBlLmRlY29kZVN1YkZpZWxkIiwiWmxpYi5HdW56aXAucHJvdG90eXBlLmNvbmNhdE1lbWJlciIsInAiLCJjb25jYXQiLCJVdGlsIiwic3RyaW5nVG9CeXRlQXJyYXkiLCJabGliLlV0aWwuc3RyaW5nVG9CeXRlQXJyYXkiLCJBZGxlcjMyIiwiWmxpYi5BZGxlcjMyIiwiYXJyYXkiLCJabGliLkFkbGVyMzIudXBkYXRlIiwiYWRsZXIiLCJzMSIsInMyIiwidGxlbiIsIk9wdGltaXphdGlvblBhcmFtZXRlciIsIkluZmxhdGUiLCJabGliLkluZmxhdGUiLCJjbWYiLCJ2ZXJpZnkiLCJDb21wcmVzc2lvbk1ldGhvZCIsIkRFRkxBVEUiLCJtZXRob2QiLCJabGliLkluZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3MiLCJhZGxlcjMyIiwiWmlwIiwiWmxpYi5aaXAiLCJmaWxlcyIsInBhc3N3b3JkIiwiRmxhZ3MiLCJGaWxlSGVhZGVyU2lnbmF0dXJlIiwiTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlIiwiQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZSIsImFkZEZpbGUiLCJabGliLlppcC5wcm90b3R5cGUuYWRkRmlsZSIsImNvbXByZXNzZWQiLCJTVE9SRSIsImRlZmxhdGVXaXRoT3B0aW9uIiwic2V0UGFzc3dvcmQiLCJabGliLlppcC5wcm90b3R5cGUuc2V0UGFzc3dvcmQiLCJabGliLlppcC5wcm90b3R5cGUuY29tcHJlc3MiLCJmaWxlIiwib3AxIiwib3AyIiwib3AzIiwibG9jYWxGaWxlU2l6ZSIsImNlbnRyYWxEaXJlY3RvcnlTaXplIiwiZW5kT2ZDZW50cmFsRGlyZWN0b3J5U2l6ZSIsIm5lZWRWZXJzaW9uIiwiY29tcHJlc3Npb25NZXRob2QiLCJkYXRlIiwicGxhaW5TaXplIiwiZmlsZW5hbWVMZW5ndGgiLCJleHRyYUZpZWxkTGVuZ3RoIiwiY29tbWVudExlbmd0aCIsImV4dHJhRmllbGQiLCJvcHRpb24iLCJjcmVhdGVFbmNyeXB0aW9uS2V5IiwiZW5jb2RlIiwiTVNET1MiLCJFTkNSWVBUIiwiZ2V0TWludXRlcyIsImdldFNlY29uZHMiLCJnZXRIb3VycyIsImdldE1vbnRoIiwiZ2V0RGF0ZSIsIlpsaWIuWmlwLnByb3RvdHlwZS5kZWZsYXRlV2l0aE9wdGlvbiIsImRlZmxhdG9yIiwiZ2V0Qnl0ZSIsIlpsaWIuWmlwLnByb3RvdHlwZS5nZXRCeXRlIiwiWmxpYi5aaXAucHJvdG90eXBlLmVuY29kZSIsInVwZGF0ZUtleXMiLCJabGliLlppcC5wcm90b3R5cGUudXBkYXRlS2V5cyIsIlpsaWIuWmlwLnByb3RvdHlwZS5jcmVhdGVFbmNyeXB0aW9uS2V5IiwiVW56aXAiLCJabGliLlVuemlwIiwiZW9jZHJPZmZzZXQiLCJudW1iZXJPZlRoaXNEaXNrIiwic3RhcnREaXNrIiwidG90YWxFbnRyaWVzVGhpc0Rpc2siLCJ0b3RhbEVudHJpZXMiLCJjZW50cmFsRGlyZWN0b3J5T2Zmc2V0IiwiZmlsZUhlYWRlckxpc3QiLCJmaWxlbmFtZVRvSW5kZXgiLCJGaWxlSGVhZGVyIiwiWmxpYi5VbnppcC5GaWxlSGVhZGVyIiwidmVyc2lvbiIsImNvbXByZXNzaW9uIiwidGltZSIsImNvbXByZXNzZWRTaXplIiwiZmlsZU5hbWVMZW5ndGgiLCJmaWxlQ29tbWVudExlbmd0aCIsImRpc2tOdW1iZXJTdGFydCIsImludGVybmFsRmlsZUF0dHJpYnV0ZXMiLCJleHRlcm5hbEZpbGVBdHRyaWJ1dGVzIiwicmVsYXRpdmVPZmZzZXQiLCJwYXJzZSIsIlpsaWIuVW56aXAuRmlsZUhlYWRlci5wcm90b3R5cGUucGFyc2UiLCJMb2NhbEZpbGVIZWFkZXIiLCJabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlciIsIlpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyLnByb3RvdHlwZS5wYXJzZSIsInNlYXJjaEVuZE9mQ2VudHJhbERpcmVjdG9yeVJlY29yZCIsIlpsaWIuVW56aXAucHJvdG90eXBlLnNlYXJjaEVuZE9mQ2VudHJhbERpcmVjdG9yeVJlY29yZCIsInBhcnNlRW5kT2ZDZW50cmFsRGlyZWN0b3J5UmVjb3JkIiwiWmxpYi5VbnppcC5wcm90b3R5cGUucGFyc2VFbmRPZkNlbnRyYWxEaXJlY3RvcnlSZWNvcmQiLCJwYXJzZUZpbGVIZWFkZXIiLCJabGliLlVuemlwLnByb3RvdHlwZS5wYXJzZUZpbGVIZWFkZXIiLCJmaWxlbGlzdCIsImZpbGV0YWJsZSIsImZpbGVIZWFkZXIiLCJnZXRGaWxlRGF0YSIsIlpsaWIuVW56aXAucHJvdG90eXBlLmdldEZpbGVEYXRhIiwibG9jYWxGaWxlSGVhZGVyIiwiY3JlYXRlRGVjcnlwdGlvbktleSIsImRlY29kZSIsImdldEZpbGVuYW1lcyIsIlpsaWIuVW56aXAucHJvdG90eXBlLmdldEZpbGVuYW1lcyIsImZpbGVuYW1lTGlzdCIsIlpsaWIuVW56aXAucHJvdG90eXBlLmRlY29tcHJlc3MiLCJabGliLlVuemlwLnByb3RvdHlwZS5zZXRQYXNzd29yZCIsIlpsaWIuVW56aXAucHJvdG90eXBlLmRlY29kZSIsIkRlZmxhdGUiLCJabGliLkRlZmxhdGUiLCJyYXdEZWZsYXRlIiwicmF3RGVmbGF0ZU9wdGlvbiIsInByb3AiLCJabGliLkRlZmxhdGUuY29tcHJlc3MiLCJabGliLkRlZmxhdGUucHJvdG90eXBlLmNvbXByZXNzIiwiY2luZm8iLCJmY2hlY2siLCJmZGljdCIsImZsZXZlbCIsImNsZXZlbCIsImVycm9yIiwiTE9HMkUiLCJsb2ciLCJleHBvcnRPYmplY3QiLCJabGliLmV4cG9ydE9iamVjdCIsImVudW1TdHJpbmciLCJleHBvcnRLZXlWYWx1ZSIsImtleXMiLCJJbmZsYXRlU3RyZWFtIiwiWmxpYi5JbmZsYXRlU3RyZWFtIiwiWmxpYi5JbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5kZWNvbXByZXNzIiwicmVhZEhlYWRlciIsIlpsaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucmVhZEhlYWRlciIsIlVOSVgiLCJNQUNJTlRPU0giXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMDYgVGhlIENsb3N1cmUgTGlicmFyeSBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vXG4vLyAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy9cbi8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbi8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBCb290c3RyYXAgZm9yIHRoZSBHb29nbGUgSlMgTGlicmFyeSAoQ2xvc3VyZSkuXG4gKlxuICogSW4gdW5jb21waWxlZCBtb2RlIGJhc2UuanMgd2lsbCB3cml0ZSBvdXQgQ2xvc3VyZSdzIGRlcHMgZmlsZSwgdW5sZXNzIHRoZVxuICogZ2xvYmFsIDxjb2RlPkNMT1NVUkVfTk9fREVQUzwvY29kZT4gaXMgc2V0IHRvIHRydWUuICBUaGlzIGFsbG93cyBwcm9qZWN0cyB0b1xuICogaW5jbHVkZSB0aGVpciBvd24gZGVwcyBmaWxlKHMpIGZyb20gZGlmZmVyZW50IGxvY2F0aW9ucy5cbiAqXG4gKi9cblxuXG4vKipcbiAqIEBkZWZpbmUge2Jvb2xlYW59IE92ZXJyaWRkZW4gdG8gdHJ1ZSBieSB0aGUgY29tcGlsZXIgd2hlbiAtLWNsb3N1cmVfcGFzc1xuICogICAgIG9yIC0tbWFya19hc19jb21waWxlZCBpcyBzcGVjaWZpZWQuXG4gKi9cbnZhciBDT01QSUxFRCA9IGZhbHNlO1xuXG5cbi8qKlxuICogQmFzZSBuYW1lc3BhY2UgZm9yIHRoZSBDbG9zdXJlIGxpYnJhcnkuICBDaGVja3MgdG8gc2VlIGdvb2cgaXNcbiAqIGFscmVhZHkgZGVmaW5lZCBpbiB0aGUgY3VycmVudCBzY29wZSBiZWZvcmUgYXNzaWduaW5nIHRvIHByZXZlbnRcbiAqIGNsb2JiZXJpbmcgaWYgYmFzZS5qcyBpcyBsb2FkZWQgbW9yZSB0aGFuIG9uY2UuXG4gKlxuICogQGNvbnN0XG4gKi9cbnZhciBnb29nID0gZ29vZyB8fCB7fTsgLy8gSWRlbnRpZmllcyB0aGlzIGZpbGUgYXMgdGhlIENsb3N1cmUgYmFzZS5cblxuXG4vKipcbiAqIFJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIGNvbnRleHQuICBJbiBtb3N0IGNhc2VzIHRoaXMgd2lsbCBiZSAnd2luZG93Jy5cbiAqL1xuZ29vZy5nbG9iYWwgPSB0aGlzO1xuXG5cbi8qKlxuICogQGRlZmluZSB7Ym9vbGVhbn0gREVCVUcgaXMgcHJvdmlkZWQgYXMgYSBjb252ZW5pZW5jZSBzbyB0aGF0IGRlYnVnZ2luZyBjb2RlXG4gKiB0aGF0IHNob3VsZCBub3QgYmUgaW5jbHVkZWQgaW4gYSBwcm9kdWN0aW9uIGpzX2JpbmFyeSBjYW4gYmUgZWFzaWx5IHN0cmlwcGVkXG4gKiBieSBzcGVjaWZ5aW5nIC0tZGVmaW5lIGdvb2cuREVCVUc9ZmFsc2UgdG8gdGhlIEpTQ29tcGlsZXIuIEZvciBleGFtcGxlLCBtb3N0XG4gKiB0b1N0cmluZygpIG1ldGhvZHMgc2hvdWxkIGJlIGRlY2xhcmVkIGluc2lkZSBhbiBcImlmIChnb29nLkRFQlVHKVwiIGNvbmRpdGlvbmFsXG4gKiBiZWNhdXNlIHRoZXkgYXJlIGdlbmVyYWxseSB1c2VkIGZvciBkZWJ1Z2dpbmcgcHVycG9zZXMgYW5kIGl0IGlzIGRpZmZpY3VsdFxuICogZm9yIHRoZSBKU0NvbXBpbGVyIHRvIHN0YXRpY2FsbHkgZGV0ZXJtaW5lIHdoZXRoZXIgdGhleSBhcmUgdXNlZC5cbiAqL1xuZ29vZy5ERUJVRyA9IHRydWU7XG5cblxuLyoqXG4gKiBAZGVmaW5lIHtzdHJpbmd9IExPQ0FMRSBkZWZpbmVzIHRoZSBsb2NhbGUgYmVpbmcgdXNlZCBmb3IgY29tcGlsYXRpb24uIEl0IGlzXG4gKiB1c2VkIHRvIHNlbGVjdCBsb2NhbGUgc3BlY2lmaWMgZGF0YSB0byBiZSBjb21waWxlZCBpbiBqcyBiaW5hcnkuIEJVSUxEIHJ1bGVcbiAqIGNhbiBzcGVjaWZ5IHRoaXMgdmFsdWUgYnkgXCItLWRlZmluZSBnb29nLkxPQ0FMRT08bG9jYWxlX25hbWU+XCIgYXMgSlNDb21waWxlclxuICogb3B0aW9uLlxuICpcbiAqIFRha2UgaW50byBhY2NvdW50IHRoYXQgdGhlIGxvY2FsZSBjb2RlIGZvcm1hdCBpcyBpbXBvcnRhbnQuIFlvdSBzaG91bGQgdXNlXG4gKiB0aGUgY2Fub25pY2FsIFVuaWNvZGUgZm9ybWF0IHdpdGggaHlwaGVuIGFzIGEgZGVsaW1pdGVyLiBMYW5ndWFnZSBtdXN0IGJlXG4gKiBsb3dlcmNhc2UsIExhbmd1YWdlIFNjcmlwdCAtIENhcGl0YWxpemVkLCBSZWdpb24gLSBVUFBFUkNBU0UuXG4gKiBUaGVyZSBhcmUgZmV3IGV4YW1wbGVzOiBwdC1CUiwgZW4sIGVuLVVTLCBzci1MYXRpbi1CTywgemgtSGFucy1DTi5cbiAqXG4gKiBTZWUgbW9yZSBpbmZvIGFib3V0IGxvY2FsZSBjb2RlcyBoZXJlOlxuICogaHR0cDovL3d3dy51bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvI1VuaWNvZGVfTGFuZ3VhZ2VfYW5kX0xvY2FsZV9JZGVudGlmaWVyc1xuICpcbiAqIEZvciBsYW5ndWFnZSBjb2RlcyB5b3Ugc2hvdWxkIHVzZSB2YWx1ZXMgZGVmaW5lZCBieSBJU08gNjkzLTEuIFNlZSBpdCBoZXJlXG4gKiBodHRwOi8vd3d3LnczLm9yZy9XQUkvRVIvSUcvZXJ0L2lzbzYzOS5odG0uIFRoZXJlIGlzIG9ubHkgb25lIGV4Y2VwdGlvbiBmcm9tXG4gKiB0aGlzIHJ1bGU6IHRoZSBIZWJyZXcgbGFuZ3VhZ2UuIEZvciBsZWdhY3kgcmVhc29ucyB0aGUgb2xkIGNvZGUgKGl3KSBzaG91bGRcbiAqIGJlIHVzZWQgaW5zdGVhZCBvZiB0aGUgbmV3IGNvZGUgKGhlKSwgc2VlIGh0dHA6Ly93aWtpL01haW4vSUlJU3lub255bXMuXG4gKi9cbmdvb2cuTE9DQUxFID0gJ2VuJzsgIC8vIGRlZmF1bHQgdG8gZW5cblxuXG4vKipcbiAqIENyZWF0ZXMgb2JqZWN0IHN0dWJzIGZvciBhIG5hbWVzcGFjZS4gIFRoZSBwcmVzZW5jZSBvZiBvbmUgb3IgbW9yZVxuICogZ29vZy5wcm92aWRlKCkgY2FsbHMgaW5kaWNhdGUgdGhhdCB0aGUgZmlsZSBkZWZpbmVzIHRoZSBnaXZlblxuICogb2JqZWN0cy9uYW1lc3BhY2VzLiAgQnVpbGQgdG9vbHMgYWxzbyBzY2FuIGZvciBwcm92aWRlL3JlcXVpcmUgc3RhdGVtZW50c1xuICogdG8gZGlzY2VybiBkZXBlbmRlbmNpZXMsIGJ1aWxkIGRlcGVuZGVuY3kgZmlsZXMgKHNlZSBkZXBzLmpzKSwgZXRjLlxuICogQHNlZSBnb29nLnJlcXVpcmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIE5hbWVzcGFjZSBwcm92aWRlZCBieSB0aGlzIGZpbGUgaW4gdGhlIGZvcm1cbiAqICAgICBcImdvb2cucGFja2FnZS5wYXJ0XCIuXG4gKi9cbmdvb2cucHJvdmlkZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgaWYgKCFDT01QSUxFRCkge1xuICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBzYW1lIG5hbWVzcGFjZSBpc24ndCBwcm92aWRlZCB0d2ljZS4gVGhpcyBpcyBpbnRlbmRlZFxuICAgIC8vIHRvIHRlYWNoIG5ldyBkZXZlbG9wZXJzIHRoYXQgJ2dvb2cucHJvdmlkZScgaXMgZWZmZWN0aXZlbHkgYSB2YXJpYWJsZVxuICAgIC8vIGRlY2xhcmF0aW9uLiBBbmQgd2hlbiBKU0NvbXBpbGVyIHRyYW5zZm9ybXMgZ29vZy5wcm92aWRlIGludG8gYSByZWFsXG4gICAgLy8gdmFyaWFibGUgZGVjbGFyYXRpb24sIHRoZSBjb21waWxlZCBKUyBzaG91bGQgd29yayB0aGUgc2FtZSBhcyB0aGUgcmF3XG4gICAgLy8gSlMtLWV2ZW4gd2hlbiB0aGUgcmF3IEpTIHVzZXMgZ29vZy5wcm92aWRlIGluY29ycmVjdGx5LlxuICAgIGlmIChnb29nLmlzUHJvdmlkZWRfKG5hbWUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignTmFtZXNwYWNlIFwiJyArIG5hbWUgKyAnXCIgYWxyZWFkeSBkZWNsYXJlZC4nKTtcbiAgICB9XG4gICAgZGVsZXRlIGdvb2cuaW1wbGljaXROYW1lc3BhY2VzX1tuYW1lXTtcblxuICAgIHZhciBuYW1lc3BhY2UgPSBuYW1lO1xuICAgIHdoaWxlICgobmFtZXNwYWNlID0gbmFtZXNwYWNlLnN1YnN0cmluZygwLCBuYW1lc3BhY2UubGFzdEluZGV4T2YoJy4nKSkpKSB7XG4gICAgICBpZiAoZ29vZy5nZXRPYmplY3RCeU5hbWUobmFtZXNwYWNlKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGdvb2cuaW1wbGljaXROYW1lc3BhY2VzX1tuYW1lc3BhY2VdID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBnb29nLmV4cG9ydFBhdGhfKG5hbWUpO1xufTtcblxuXG4vKipcbiAqIE1hcmtzIHRoYXQgdGhlIGN1cnJlbnQgZmlsZSBzaG91bGQgb25seSBiZSB1c2VkIGZvciB0ZXN0aW5nLCBhbmQgbmV2ZXIgZm9yXG4gKiBsaXZlIGNvZGUgaW4gcHJvZHVjdGlvbi5cbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X21lc3NhZ2UgT3B0aW9uYWwgbWVzc2FnZSB0byBhZGQgdG8gdGhlIGVycm9yIHRoYXQnc1xuICogICAgIHJhaXNlZCB3aGVuIHVzZWQgaW4gcHJvZHVjdGlvbiBjb2RlLlxuICovXG5nb29nLnNldFRlc3RPbmx5ID0gZnVuY3Rpb24ob3B0X21lc3NhZ2UpIHtcbiAgaWYgKENPTVBJTEVEICYmICFnb29nLkRFQlVHKSB7XG4gICAgb3B0X21lc3NhZ2UgPSBvcHRfbWVzc2FnZSB8fCAnJztcbiAgICB0aHJvdyBFcnJvcignSW1wb3J0aW5nIHRlc3Qtb25seSBjb2RlIGludG8gbm9uLWRlYnVnIGVudmlyb25tZW50JyArXG4gICAgICAgICAgICAgICAgb3B0X21lc3NhZ2UgPyAnOiAnICsgb3B0X21lc3NhZ2UgOiAnLicpO1xuICB9XG59O1xuXG5cbmlmICghQ09NUElMRUQpIHtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGdpdmVuIG5hbWUgaGFzIGJlZW4gZ29vZy5wcm92aWRlZC4gVGhpcyB3aWxsIHJldHVybiBmYWxzZSBmb3JcbiAgICogbmFtZXMgdGhhdCBhcmUgYXZhaWxhYmxlIG9ubHkgYXMgaW1wbGljaXQgbmFtZXNwYWNlcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgb2JqZWN0IHRvIGxvb2sgZm9yLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHRoZSBuYW1lIGhhcyBiZWVuIHByb3ZpZGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy5pc1Byb3ZpZGVkXyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gIWdvb2cuaW1wbGljaXROYW1lc3BhY2VzX1tuYW1lXSAmJiAhIWdvb2cuZ2V0T2JqZWN0QnlOYW1lKG5hbWUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBOYW1lc3BhY2VzIGltcGxpY2l0bHkgZGVmaW5lZCBieSBnb29nLnByb3ZpZGUuIEZvciBleGFtcGxlLFxuICAgKiBnb29nLnByb3ZpZGUoJ2dvb2cuZXZlbnRzLkV2ZW50JykgaW1wbGljaXRseSBkZWNsYXJlc1xuICAgKiB0aGF0ICdnb29nJyBhbmQgJ2dvb2cuZXZlbnRzJyBtdXN0IGJlIG5hbWVzcGFjZXMuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnb29nLmltcGxpY2l0TmFtZXNwYWNlc18gPSB7fTtcbn1cblxuXG4vKipcbiAqIEJ1aWxkcyBhbiBvYmplY3Qgc3RydWN0dXJlIGZvciB0aGUgcHJvdmlkZWQgbmFtZXNwYWNlIHBhdGgsXG4gKiBlbnN1cmluZyB0aGF0IG5hbWVzIHRoYXQgYWxyZWFkeSBleGlzdCBhcmUgbm90IG92ZXJ3cml0dGVuLiBGb3JcbiAqIGV4YW1wbGU6XG4gKiBcImEuYi5jXCIgLT4gYSA9IHt9O2EuYj17fTthLmIuYz17fTtcbiAqIFVzZWQgYnkgZ29vZy5wcm92aWRlIGFuZCBnb29nLmV4cG9ydFN5bWJvbC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIG9iamVjdCB0aGF0IHRoaXMgZmlsZSBkZWZpbmVzLlxuICogQHBhcmFtIHsqPX0gb3B0X29iamVjdCB0aGUgb2JqZWN0IHRvIGV4cG9zZSBhdCB0aGUgZW5kIG9mIHRoZSBwYXRoLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfb2JqZWN0VG9FeHBvcnRUbyBUaGUgb2JqZWN0IHRvIGFkZCB0aGUgcGF0aCB0bzsgZGVmYXVsdFxuICogICAgIGlzIHxnb29nLmdsb2JhbHwuXG4gKiBAcHJpdmF0ZVxuICovXG5nb29nLmV4cG9ydFBhdGhfID0gZnVuY3Rpb24obmFtZSwgb3B0X29iamVjdCwgb3B0X29iamVjdFRvRXhwb3J0VG8pIHtcbiAgdmFyIHBhcnRzID0gbmFtZS5zcGxpdCgnLicpO1xuICB2YXIgY3VyID0gb3B0X29iamVjdFRvRXhwb3J0VG8gfHwgZ29vZy5nbG9iYWw7XG5cbiAgLy8gSW50ZXJuZXQgRXhwbG9yZXIgZXhoaWJpdHMgc3RyYW5nZSBiZWhhdmlvciB3aGVuIHRocm93aW5nIGVycm9ycyBmcm9tXG4gIC8vIG1ldGhvZHMgZXh0ZXJuZWQgaW4gdGhpcyBtYW5uZXIuICBTZWUgdGhlIHRlc3RFeHBvcnRTeW1ib2xFeGNlcHRpb25zIGluXG4gIC8vIGJhc2VfdGVzdC5odG1sIGZvciBhbiBleGFtcGxlLlxuICBpZiAoIShwYXJ0c1swXSBpbiBjdXIpICYmIGN1ci5leGVjU2NyaXB0KSB7XG4gICAgY3VyLmV4ZWNTY3JpcHQoJ3ZhciAnICsgcGFydHNbMF0pO1xuICB9XG5cbiAgLy8gQ2VydGFpbiBicm93c2VycyBjYW5ub3QgcGFyc2UgY29kZSBpbiB0aGUgZm9ybSBmb3IoKGEgaW4gYik7IGM7KTtcbiAgLy8gVGhpcyBwYXR0ZXJuIGlzIHByb2R1Y2VkIGJ5IHRoZSBKU0NvbXBpbGVyIHdoZW4gaXQgY29sbGFwc2VzIHRoZVxuICAvLyBzdGF0ZW1lbnQgYWJvdmUgaW50byB0aGUgY29uZGl0aW9uYWwgbG9vcCBiZWxvdy4gVG8gcHJldmVudCB0aGlzIGZyb21cbiAgLy8gaGFwcGVuaW5nLCB1c2UgYSBmb3ItbG9vcCBhbmQgcmVzZXJ2ZSB0aGUgaW5pdCBsb2dpYyBhcyBiZWxvdy5cblxuICAvLyBQYXJlbnRoZXNlcyBhZGRlZCB0byBlbGltaW5hdGUgc3RyaWN0IEpTIHdhcm5pbmcgaW4gRmlyZWZveC5cbiAgZm9yICh2YXIgcGFydDsgcGFydHMubGVuZ3RoICYmIChwYXJ0ID0gcGFydHMuc2hpZnQoKSk7KSB7XG4gICAgaWYgKCFwYXJ0cy5sZW5ndGggJiYgZ29vZy5pc0RlZihvcHRfb2JqZWN0KSkge1xuICAgICAgLy8gbGFzdCBwYXJ0IGFuZCB3ZSBoYXZlIGFuIG9iamVjdDsgdXNlIGl0XG4gICAgICBjdXJbcGFydF0gPSBvcHRfb2JqZWN0O1xuICAgIH0gZWxzZSBpZiAoY3VyW3BhcnRdKSB7XG4gICAgICBjdXIgPSBjdXJbcGFydF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1ciA9IGN1cltwYXJ0XSA9IHt9O1xuICAgIH1cbiAgfVxufTtcblxuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IGJhc2VkIG9uIGl0cyBmdWxseSBxdWFsaWZpZWQgZXh0ZXJuYWwgbmFtZS4gIElmIHlvdSBhcmVcbiAqIHVzaW5nIGEgY29tcGlsYXRpb24gcGFzcyB0aGF0IHJlbmFtZXMgcHJvcGVydHkgbmFtZXMgYmV3YXJlIHRoYXQgdXNpbmcgdGhpc1xuICogZnVuY3Rpb24gd2lsbCBub3QgZmluZCByZW5hbWVkIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIGZ1bGx5IHF1YWxpZmllZCBuYW1lLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfb2JqIFRoZSBvYmplY3Qgd2l0aGluIHdoaWNoIHRvIGxvb2s7IGRlZmF1bHQgaXNcbiAqICAgICB8Z29vZy5nbG9iYWx8LlxuICogQHJldHVybiB7P30gVGhlIHZhbHVlIChvYmplY3Qgb3IgcHJpbWl0aXZlKSBvciwgaWYgbm90IGZvdW5kLCBudWxsLlxuICovXG5nb29nLmdldE9iamVjdEJ5TmFtZSA9IGZ1bmN0aW9uKG5hbWUsIG9wdF9vYmopIHtcbiAgdmFyIHBhcnRzID0gbmFtZS5zcGxpdCgnLicpO1xuICB2YXIgY3VyID0gb3B0X29iaiB8fCBnb29nLmdsb2JhbDtcbiAgZm9yICh2YXIgcGFydDsgcGFydCA9IHBhcnRzLnNoaWZ0KCk7ICkge1xuICAgIGlmIChnb29nLmlzRGVmQW5kTm90TnVsbChjdXJbcGFydF0pKSB7XG4gICAgICBjdXIgPSBjdXJbcGFydF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY3VyO1xufTtcblxuXG4vKipcbiAqIEdsb2JhbGl6ZXMgYSB3aG9sZSBuYW1lc3BhY2UsIHN1Y2ggYXMgZ29vZyBvciBnb29nLmxhbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgbmFtZXNwYWNlIHRvIGdsb2JhbGl6ZS5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X2dsb2JhbCBUaGUgb2JqZWN0IHRvIGFkZCB0aGUgcHJvcGVydGllcyB0by5cbiAqIEBkZXByZWNhdGVkIFByb3BlcnRpZXMgbWF5IGJlIGV4cGxpY2l0bHkgZXhwb3J0ZWQgdG8gdGhlIGdsb2JhbCBzY29wZSwgYnV0XG4gKiAgICAgdGhpcyBzaG91bGQgbm8gbG9uZ2VyIGJlIGRvbmUgaW4gYnVsay5cbiAqL1xuZ29vZy5nbG9iYWxpemUgPSBmdW5jdGlvbihvYmosIG9wdF9nbG9iYWwpIHtcbiAgdmFyIGdsb2JhbCA9IG9wdF9nbG9iYWwgfHwgZ29vZy5nbG9iYWw7XG4gIGZvciAodmFyIHggaW4gb2JqKSB7XG4gICAgZ2xvYmFsW3hdID0gb2JqW3hdO1xuICB9XG59O1xuXG5cbi8qKlxuICogQWRkcyBhIGRlcGVuZGVuY3kgZnJvbSBhIGZpbGUgdG8gdGhlIGZpbGVzIGl0IHJlcXVpcmVzLlxuICogQHBhcmFtIHtzdHJpbmd9IHJlbFBhdGggVGhlIHBhdGggdG8gdGhlIGpzIGZpbGUuXG4gKiBAcGFyYW0ge0FycmF5fSBwcm92aWRlcyBBbiBhcnJheSBvZiBzdHJpbmdzIHdpdGggdGhlIG5hbWVzIG9mIHRoZSBvYmplY3RzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzIGZpbGUgcHJvdmlkZXMuXG4gKiBAcGFyYW0ge0FycmF5fSByZXF1aXJlcyBBbiBhcnJheSBvZiBzdHJpbmdzIHdpdGggdGhlIG5hbWVzIG9mIHRoZSBvYmplY3RzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzIGZpbGUgcmVxdWlyZXMuXG4gKi9cbmdvb2cuYWRkRGVwZW5kZW5jeSA9IGZ1bmN0aW9uKHJlbFBhdGgsIHByb3ZpZGVzLCByZXF1aXJlcykge1xuICBpZiAoIUNPTVBJTEVEKSB7XG4gICAgdmFyIHByb3ZpZGUsIHJlcXVpcmU7XG4gICAgdmFyIHBhdGggPSByZWxQYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICB2YXIgZGVwcyA9IGdvb2cuZGVwZW5kZW5jaWVzXztcbiAgICBmb3IgKHZhciBpID0gMDsgcHJvdmlkZSA9IHByb3ZpZGVzW2ldOyBpKyspIHtcbiAgICAgIGRlcHMubmFtZVRvUGF0aFtwcm92aWRlXSA9IHBhdGg7XG4gICAgICBpZiAoIShwYXRoIGluIGRlcHMucGF0aFRvTmFtZXMpKSB7XG4gICAgICAgIGRlcHMucGF0aFRvTmFtZXNbcGF0aF0gPSB7fTtcbiAgICAgIH1cbiAgICAgIGRlcHMucGF0aFRvTmFtZXNbcGF0aF1bcHJvdmlkZV0gPSB0cnVlO1xuICAgIH1cbiAgICBmb3IgKHZhciBqID0gMDsgcmVxdWlyZSA9IHJlcXVpcmVzW2pdOyBqKyspIHtcbiAgICAgIGlmICghKHBhdGggaW4gZGVwcy5yZXF1aXJlcykpIHtcbiAgICAgICAgZGVwcy5yZXF1aXJlc1twYXRoXSA9IHt9O1xuICAgICAgfVxuICAgICAgZGVwcy5yZXF1aXJlc1twYXRoXVtyZXF1aXJlXSA9IHRydWU7XG4gICAgfVxuICB9XG59O1xuXG5cblxuXG4vLyBOT1RFKG5uYXplKTogVGhlIGRlYnVnIERPTSBsb2FkZXIgd2FzIGluY2x1ZGVkIGluIGJhc2UuanMgYXMgYW4gb3JpZ25hbFxuLy8gd2F5IHRvIGRvIFwiZGVidWctbW9kZVwiIGRldmVsb3BtZW50LiAgVGhlIGRlcGVuZGVuY3kgc3lzdGVtIGNhbiBzb21ldGltZXNcbi8vIGJlIGNvbmZ1c2luZywgYXMgY2FuIHRoZSBkZWJ1ZyBET00gbG9hZGVyJ3MgYXN5bmNyb25vdXMgbmF0dXJlLlxuLy9cbi8vIFdpdGggdGhlIERPTSBsb2FkZXIsIGEgY2FsbCB0byBnb29nLnJlcXVpcmUoKSBpcyBub3QgYmxvY2tpbmcgLS0gdGhlXG4vLyBzY3JpcHQgd2lsbCBub3QgbG9hZCB1bnRpbCBzb21lIHBvaW50IGFmdGVyIHRoZSBjdXJyZW50IHNjcmlwdC4gIElmIGFcbi8vIG5hbWVzcGFjZSBpcyBuZWVkZWQgYXQgcnVudGltZSwgaXQgbmVlZHMgdG8gYmUgZGVmaW5lZCBpbiBhIHByZXZpb3VzXG4vLyBzY3JpcHQsIG9yIGxvYWRlZCB2aWEgcmVxdWlyZSgpIHdpdGggaXRzIHJlZ2lzdGVyZWQgZGVwZW5kZW5jaWVzLlxuLy8gVXNlci1kZWZpbmVkIG5hbWVzcGFjZXMgbWF5IG5lZWQgdGhlaXIgb3duIGRlcHMgZmlsZS4gIFNlZSBodHRwOi8vZ28vanNfZGVwcyxcbi8vIGh0dHA6Ly9nby9nZW5qc2RlcHMsIG9yLCBleHRlcm5hbGx5LCBEZXBzV3JpdGVyLlxuLy8gaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9jbG9zdXJlL2xpYnJhcnkvZG9jcy9kZXBzd3JpdGVyLmh0bWxcbi8vXG4vLyBCZWNhdXNlIG9mIGxlZ2FjeSBjbGllbnRzLCB0aGUgRE9NIGxvYWRlciBjYW4ndCBiZSBlYXNpbHkgcmVtb3ZlZCBmcm9tXG4vLyBiYXNlLmpzLiAgV29yayBpcyBiZWluZyBkb25lIHRvIG1ha2UgaXQgZGlzYWJsZWFibGUgb3IgcmVwbGFjZWFibGUgZm9yXG4vLyBkaWZmZXJlbnQgZW52aXJvbm1lbnRzIChET00tbGVzcyBKYXZhU2NyaXB0IGludGVycHJldGVycyBsaWtlIFJoaW5vIG9yIFY4LFxuLy8gZm9yIGV4YW1wbGUpLiBTZWUgYm9vdHN0cmFwLyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cblxuXG4vKipcbiAqIEBkZWZpbmUge2Jvb2xlYW59IFdoZXRoZXIgdG8gZW5hYmxlIHRoZSBkZWJ1ZyBsb2FkZXIuXG4gKlxuICogSWYgZW5hYmxlZCwgYSBjYWxsIHRvIGdvb2cucmVxdWlyZSgpIHdpbGwgYXR0ZW1wdCB0byBsb2FkIHRoZSBuYW1lc3BhY2UgYnlcbiAqIGFwcGVuZGluZyBhIHNjcmlwdCB0YWcgdG8gdGhlIERPTSAoaWYgdGhlIG5hbWVzcGFjZSBoYXMgYmVlbiByZWdpc3RlcmVkKS5cbiAqXG4gKiBJZiBkaXNhYmxlZCwgZ29vZy5yZXF1aXJlKCkgd2lsbCBzaW1wbHkgYXNzZXJ0IHRoYXQgdGhlIG5hbWVzcGFjZSBoYXMgYmVlblxuICogcHJvdmlkZWQgKGFuZCBkZXBlbmQgb24gdGhlIGZhY3QgdGhhdCBzb21lIG91dHNpZGUgdG9vbCBjb3JyZWN0bHkgb3JkZXJlZFxuICogdGhlIHNjcmlwdCkuXG4gKi9cbmdvb2cuRU5BQkxFX0RFQlVHX0xPQURFUiA9IHRydWU7XG5cblxuLyoqXG4gKiBJbXBsZW1lbnRzIGEgc3lzdGVtIGZvciB0aGUgZHluYW1pYyByZXNvbHV0aW9uIG9mIGRlcGVuZGVuY2llc1xuICogdGhhdCB3b3JrcyBpbiBwYXJhbGxlbCB3aXRoIHRoZSBCVUlMRCBzeXN0ZW0uIE5vdGUgdGhhdCBhbGwgY2FsbHNcbiAqIHRvIGdvb2cucmVxdWlyZSB3aWxsIGJlIHN0cmlwcGVkIGJ5IHRoZSBKU0NvbXBpbGVyIHdoZW4gdGhlXG4gKiAtLWNsb3N1cmVfcGFzcyBvcHRpb24gaXMgdXNlZC5cbiAqIEBzZWUgZ29vZy5wcm92aWRlXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBOYW1lc3BhY2UgdG8gaW5jbHVkZSAoYXMgd2FzIGdpdmVuIGluIGdvb2cucHJvdmlkZSgpKVxuICogICAgIGluIHRoZSBmb3JtIFwiZ29vZy5wYWNrYWdlLnBhcnRcIi5cbiAqL1xuZ29vZy5yZXF1aXJlID0gZnVuY3Rpb24obmFtZSkge1xuXG4gIC8vIGlmIHRoZSBvYmplY3QgYWxyZWFkeSBleGlzdHMgd2UgZG8gbm90IG5lZWQgZG8gZG8gYW55dGhpbmdcbiAgLy8gVE9ETyhhcnYpOiBJZiB3ZSBzdGFydCB0byBzdXBwb3J0IHJlcXVpcmUgYmFzZWQgb24gZmlsZSBuYW1lIHRoaXMgaGFzXG4gIC8vICAgICAgICAgICAgdG8gY2hhbmdlXG4gIC8vIFRPRE8oYXJ2KTogSWYgd2UgYWxsb3cgZ29vZy5mb28uKiB0aGlzIGhhcyB0byBjaGFuZ2VcbiAgLy8gVE9ETyhhcnYpOiBJZiB3ZSBpbXBsZW1lbnQgZHluYW1pYyBsb2FkIGFmdGVyIHBhZ2UgbG9hZCB3ZSBzaG91bGQgcHJvYmFibHlcbiAgLy8gICAgICAgICAgICBub3QgcmVtb3ZlIHRoaXMgY29kZSBmb3IgdGhlIGNvbXBpbGVkIG91dHB1dFxuICBpZiAoIUNPTVBJTEVEKSB7XG4gICAgaWYgKGdvb2cuaXNQcm92aWRlZF8obmFtZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZ29vZy5FTkFCTEVfREVCVUdfTE9BREVSKSB7XG4gICAgICB2YXIgcGF0aCA9IGdvb2cuZ2V0UGF0aEZyb21EZXBzXyhuYW1lKTtcbiAgICAgIGlmIChwYXRoKSB7XG4gICAgICAgIGdvb2cuaW5jbHVkZWRfW3BhdGhdID0gdHJ1ZTtcbiAgICAgICAgZ29vZy53cml0ZVNjcmlwdHNfKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZXJyb3JNZXNzYWdlID0gJ2dvb2cucmVxdWlyZSBjb3VsZCBub3QgZmluZDogJyArIG5hbWU7XG4gICAgaWYgKGdvb2cuZ2xvYmFsLmNvbnNvbGUpIHtcbiAgICAgIGdvb2cuZ2xvYmFsLmNvbnNvbGVbJ2Vycm9yJ10oZXJyb3JNZXNzYWdlKTtcbiAgICB9XG5cblxuICAgICAgdGhyb3cgRXJyb3IoZXJyb3JNZXNzYWdlKTtcblxuICB9XG59O1xuXG5cbi8qKlxuICogUGF0aCBmb3IgaW5jbHVkZWQgc2NyaXB0c1xuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZ29vZy5iYXNlUGF0aCA9ICcnO1xuXG5cbi8qKlxuICogQSBob29rIGZvciBvdmVycmlkaW5nIHRoZSBiYXNlIHBhdGguXG4gKiBAdHlwZSB7c3RyaW5nfHVuZGVmaW5lZH1cbiAqL1xuZ29vZy5nbG9iYWwuQ0xPU1VSRV9CQVNFX1BBVEg7XG5cblxuLyoqXG4gKiBXaGV0aGVyIHRvIHdyaXRlIG91dCBDbG9zdXJlJ3MgZGVwcyBmaWxlLiBCeSBkZWZhdWx0LFxuICogdGhlIGRlcHMgYXJlIHdyaXR0ZW4uXG4gKiBAdHlwZSB7Ym9vbGVhbnx1bmRlZmluZWR9XG4gKi9cbmdvb2cuZ2xvYmFsLkNMT1NVUkVfTk9fREVQUztcblxuXG4vKipcbiAqIEEgZnVuY3Rpb24gdG8gaW1wb3J0IGEgc2luZ2xlIHNjcmlwdC4gVGhpcyBpcyBtZWFudCB0byBiZSBvdmVycmlkZGVuIHdoZW5cbiAqIENsb3N1cmUgaXMgYmVpbmcgcnVuIGluIG5vbi1IVE1MIGNvbnRleHRzLCBzdWNoIGFzIHdlYiB3b3JrZXJzLiBJdCdzIGRlZmluZWRcbiAqIGluIHRoZSBnbG9iYWwgc2NvcGUgc28gdGhhdCBpdCBjYW4gYmUgc2V0IGJlZm9yZSBiYXNlLmpzIGlzIGxvYWRlZCwgd2hpY2hcbiAqIGFsbG93cyBkZXBzLmpzIHRvIGJlIGltcG9ydGVkIHByb3Blcmx5LlxuICpcbiAqIFRoZSBmdW5jdGlvbiBpcyBwYXNzZWQgdGhlIHNjcmlwdCBzb3VyY2UsIHdoaWNoIGlzIGEgcmVsYXRpdmUgVVJJLiBJdCBzaG91bGRcbiAqIHJldHVybiB0cnVlIGlmIHRoZSBzY3JpcHQgd2FzIGltcG9ydGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmdvb2cuZ2xvYmFsLkNMT1NVUkVfSU1QT1JUX1NDUklQVDtcblxuXG4vKipcbiAqIE51bGwgZnVuY3Rpb24gdXNlZCBmb3IgZGVmYXVsdCB2YWx1ZXMgb2YgY2FsbGJhY2tzLCBldGMuXG4gKiBAcmV0dXJuIHt2b2lkfSBOb3RoaW5nLlxuICovXG5nb29nLm51bGxGdW5jdGlvbiA9IGZ1bmN0aW9uKCkge307XG5cblxuLyoqXG4gKiBUaGUgaWRlbnRpdHkgZnVuY3Rpb24uIFJldHVybnMgaXRzIGZpcnN0IGFyZ3VtZW50LlxuICpcbiAqIEBwYXJhbSB7Kj19IG9wdF9yZXR1cm5WYWx1ZSBUaGUgc2luZ2xlIHZhbHVlIHRoYXQgd2lsbCBiZSByZXR1cm5lZC5cbiAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3MgT3B0aW9uYWwgdHJhaWxpbmcgYXJndW1lbnRzLiBUaGVzZSBhcmUgaWdub3JlZC5cbiAqIEByZXR1cm4gez99IFRoZSBmaXJzdCBhcmd1bWVudC4gV2UgY2FuJ3Qga25vdyB0aGUgdHlwZSAtLSBqdXN0IHBhc3MgaXQgYWxvbmdcbiAqICAgICAgd2l0aG91dCB0eXBlLlxuICogQGRlcHJlY2F0ZWQgVXNlIGdvb2cuZnVuY3Rpb25zLmlkZW50aXR5IGluc3RlYWQuXG4gKi9cbmdvb2cuaWRlbnRpdHlGdW5jdGlvbiA9IGZ1bmN0aW9uKG9wdF9yZXR1cm5WYWx1ZSwgdmFyX2FyZ3MpIHtcbiAgcmV0dXJuIG9wdF9yZXR1cm5WYWx1ZTtcbn07XG5cblxuLyoqXG4gKiBXaGVuIGRlZmluaW5nIGEgY2xhc3MgRm9vIHdpdGggYW4gYWJzdHJhY3QgbWV0aG9kIGJhcigpLCB5b3UgY2FuIGRvOlxuICpcbiAqIEZvby5wcm90b3R5cGUuYmFyID0gZ29vZy5hYnN0cmFjdE1ldGhvZFxuICpcbiAqIE5vdyBpZiBhIHN1YmNsYXNzIG9mIEZvbyBmYWlscyB0byBvdmVycmlkZSBiYXIoKSwgYW4gZXJyb3JcbiAqIHdpbGwgYmUgdGhyb3duIHdoZW4gYmFyKCkgaXMgaW52b2tlZC5cbiAqXG4gKiBOb3RlOiBUaGlzIGRvZXMgbm90IHRha2UgdGhlIG5hbWUgb2YgdGhlIGZ1bmN0aW9uIHRvIG92ZXJyaWRlIGFzXG4gKiBhbiBhcmd1bWVudCBiZWNhdXNlIHRoYXQgd291bGQgbWFrZSBpdCBtb3JlIGRpZmZpY3VsdCB0byBvYmZ1c2NhdGVcbiAqIG91ciBKYXZhU2NyaXB0IGNvZGUuXG4gKlxuICogQHR5cGUgeyFGdW5jdGlvbn1cbiAqIEB0aHJvd3Mge0Vycm9yfSB3aGVuIGludm9rZWQgdG8gaW5kaWNhdGUgdGhlIG1ldGhvZCBzaG91bGQgYmVcbiAqICAgb3ZlcnJpZGRlbi5cbiAqL1xuZ29vZy5hYnN0cmFjdE1ldGhvZCA9IGZ1bmN0aW9uKCkge1xuICB0aHJvdyBFcnJvcigndW5pbXBsZW1lbnRlZCBhYnN0cmFjdCBtZXRob2QnKTtcbn07XG5cblxuLyoqXG4gKiBBZGRzIGEge0Bjb2RlIGdldEluc3RhbmNlfSBzdGF0aWMgbWV0aG9kIHRoYXQgYWx3YXlzIHJldHVybiB0aGUgc2FtZSBpbnN0YW5jZVxuICogb2JqZWN0LlxuICogQHBhcmFtIHshRnVuY3Rpb259IGN0b3IgVGhlIGNvbnN0cnVjdG9yIGZvciB0aGUgY2xhc3MgdG8gYWRkIHRoZSBzdGF0aWNcbiAqICAgICBtZXRob2QgdG8uXG4gKi9cbmdvb2cuYWRkU2luZ2xldG9uR2V0dGVyID0gZnVuY3Rpb24oY3Rvcikge1xuICBjdG9yLmdldEluc3RhbmNlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGN0b3IuaW5zdGFuY2VfKSB7XG4gICAgICByZXR1cm4gY3Rvci5pbnN0YW5jZV87XG4gICAgfVxuICAgIGlmIChnb29nLkRFQlVHKSB7XG4gICAgICAvLyBOT1RFOiBKU0NvbXBpbGVyIGNhbid0IG9wdGltaXplIGF3YXkgQXJyYXkjcHVzaC5cbiAgICAgIGdvb2cuaW5zdGFudGlhdGVkU2luZ2xldG9uc19bZ29vZy5pbnN0YW50aWF0ZWRTaW5nbGV0b25zXy5sZW5ndGhdID0gY3RvcjtcbiAgICB9XG4gICAgcmV0dXJuIGN0b3IuaW5zdGFuY2VfID0gbmV3IGN0b3I7XG4gIH07XG59O1xuXG5cbi8qKlxuICogQWxsIHNpbmdsZXRvbiBjbGFzc2VzIHRoYXQgaGF2ZSBiZWVuIGluc3RhbnRpYXRlZCwgZm9yIHRlc3RpbmcuIERvbid0IHJlYWRcbiAqIGl0IGRpcmVjdGx5LCB1c2UgdGhlIHtAY29kZSBnb29nLnRlc3Rpbmcuc2luZ2xldG9ufSBtb2R1bGUuIFRoZSBjb21waWxlclxuICogcmVtb3ZlcyB0aGlzIHZhcmlhYmxlIGlmIHVudXNlZC5cbiAqIEB0eXBlIHshQXJyYXkuPCFGdW5jdGlvbj59XG4gKiBAcHJpdmF0ZVxuICovXG5nb29nLmluc3RhbnRpYXRlZFNpbmdsZXRvbnNfID0gW107XG5cblxuaWYgKCFDT01QSUxFRCAmJiBnb29nLkVOQUJMRV9ERUJVR19MT0FERVIpIHtcbiAgLyoqXG4gICAqIE9iamVjdCB1c2VkIHRvIGtlZXAgdHJhY2sgb2YgdXJscyB0aGF0IGhhdmUgYWxyZWFkeSBiZWVuIGFkZGVkLiBUaGlzXG4gICAqIHJlY29yZCBhbGxvd3MgdGhlIHByZXZlbnRpb24gb2YgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy5pbmNsdWRlZF8gPSB7fTtcblxuXG4gIC8qKlxuICAgKiBUaGlzIG9iamVjdCBpcyB1c2VkIHRvIGtlZXAgdHJhY2sgb2YgZGVwZW5kZW5jaWVzIGFuZCBvdGhlciBkYXRhIHRoYXQgaXNcbiAgICogdXNlZCBmb3IgbG9hZGluZyBzY3JpcHRzXG4gICAqIEBwcml2YXRlXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBnb29nLmRlcGVuZGVuY2llc18gPSB7XG4gICAgcGF0aFRvTmFtZXM6IHt9LCAvLyAxIHRvIG1hbnlcbiAgICBuYW1lVG9QYXRoOiB7fSwgLy8gMSB0byAxXG4gICAgcmVxdWlyZXM6IHt9LCAvLyAxIHRvIG1hbnlcbiAgICAvLyB1c2VkIHdoZW4gcmVzb2x2aW5nIGRlcGVuZGVuY2llcyB0byBwcmV2ZW50IHVzIGZyb21cbiAgICAvLyB2aXNpdGluZyB0aGUgZmlsZSB0d2ljZVxuICAgIHZpc2l0ZWQ6IHt9LFxuICAgIHdyaXR0ZW46IHt9IC8vIHVzZWQgdG8ga2VlcCB0cmFjayBvZiBzY3JpcHQgZmlsZXMgd2UgaGF2ZSB3cml0dGVuXG4gIH07XG5cblxuICAvKipcbiAgICogVHJpZXMgdG8gZGV0ZWN0IHdoZXRoZXIgaXMgaW4gdGhlIGNvbnRleHQgb2YgYW4gSFRNTCBkb2N1bWVudC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiBpdCBsb29rcyBsaWtlIEhUTUwgZG9jdW1lbnQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnb29nLmluSHRtbERvY3VtZW50XyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkb2MgPSBnb29nLmdsb2JhbC5kb2N1bWVudDtcbiAgICByZXR1cm4gdHlwZW9mIGRvYyAhPSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICAnd3JpdGUnIGluIGRvYzsgIC8vIFhVTERvY3VtZW50IG1pc3NlcyB3cml0ZS5cbiAgfTtcblxuXG4gIC8qKlxuICAgKiBUcmllcyB0byBkZXRlY3QgdGhlIGJhc2UgcGF0aCBvZiB0aGUgYmFzZS5qcyBzY3JpcHQgdGhhdCBib290c3RyYXBzIENsb3N1cmVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdvb2cuZmluZEJhc2VQYXRoXyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChnb29nLmdsb2JhbC5DTE9TVVJFX0JBU0VfUEFUSCkge1xuICAgICAgZ29vZy5iYXNlUGF0aCA9IGdvb2cuZ2xvYmFsLkNMT1NVUkVfQkFTRV9QQVRIO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoIWdvb2cuaW5IdG1sRG9jdW1lbnRfKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGRvYyA9IGdvb2cuZ2xvYmFsLmRvY3VtZW50O1xuICAgIHZhciBzY3JpcHRzID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTtcbiAgICAvLyBTZWFyY2ggYmFja3dhcmRzIHNpbmNlIHRoZSBjdXJyZW50IHNjcmlwdCBpcyBpbiBhbG1vc3QgYWxsIGNhc2VzIHRoZSBvbmVcbiAgICAvLyB0aGF0IGhhcyBiYXNlLmpzLlxuICAgIGZvciAodmFyIGkgPSBzY3JpcHRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB2YXIgc3JjID0gc2NyaXB0c1tpXS5zcmM7XG4gICAgICB2YXIgcW1hcmsgPSBzcmMubGFzdEluZGV4T2YoJz8nKTtcbiAgICAgIHZhciBsID0gcW1hcmsgPT0gLTEgPyBzcmMubGVuZ3RoIDogcW1hcms7XG4gICAgICBpZiAoc3JjLnN1YnN0cihsIC0gNywgNykgPT0gJ2Jhc2UuanMnKSB7XG4gICAgICAgIGdvb2cuYmFzZVBhdGggPSBzcmMuc3Vic3RyKDAsIGwgLSA3KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuXG4gIC8qKlxuICAgKiBJbXBvcnRzIGEgc2NyaXB0IGlmLCBhbmQgb25seSBpZiwgdGhhdCBzY3JpcHQgaGFzbid0IGFscmVhZHkgYmVlbiBpbXBvcnRlZC5cbiAgICogKE11c3QgYmUgY2FsbGVkIGF0IGV4ZWN1dGlvbiB0aW1lKVxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3JjIFNjcmlwdCBzb3VyY2UuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnb29nLmltcG9ydFNjcmlwdF8gPSBmdW5jdGlvbihzcmMpIHtcbiAgICB2YXIgaW1wb3J0U2NyaXB0ID0gZ29vZy5nbG9iYWwuQ0xPU1VSRV9JTVBPUlRfU0NSSVBUIHx8XG4gICAgICAgIGdvb2cud3JpdGVTY3JpcHRUYWdfO1xuICAgIGlmICghZ29vZy5kZXBlbmRlbmNpZXNfLndyaXR0ZW5bc3JjXSAmJiBpbXBvcnRTY3JpcHQoc3JjKSkge1xuICAgICAgZ29vZy5kZXBlbmRlbmNpZXNfLndyaXR0ZW5bc3JjXSA9IHRydWU7XG4gICAgfVxuICB9O1xuXG5cbiAgLyoqXG4gICAqIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIG9mIHRoZSBpbXBvcnQgZnVuY3Rpb24uIFdyaXRlcyBhIHNjcmlwdCB0YWcgdG9cbiAgICogaW1wb3J0IHRoZSBzY3JpcHQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzcmMgVGhlIHNjcmlwdCBzb3VyY2UuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNjcmlwdCB3YXMgaW1wb3J0ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdvb2cud3JpdGVTY3JpcHRUYWdfID0gZnVuY3Rpb24oc3JjKSB7XG4gICAgaWYgKGdvb2cuaW5IdG1sRG9jdW1lbnRfKCkpIHtcbiAgICAgIHZhciBkb2MgPSBnb29nLmdsb2JhbC5kb2N1bWVudDtcbiAgICAgIGRvYy53cml0ZShcbiAgICAgICAgICAnPHNjcmlwdCB0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCIgc3JjPVwiJyArIHNyYyArICdcIj48LycgKyAnc2NyaXB0PicpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG5cblxuICAvKipcbiAgICogUmVzb2x2ZXMgZGVwZW5kZW5jaWVzIGJhc2VkIG9uIHRoZSBkZXBlbmRlbmNpZXMgYWRkZWQgdXNpbmcgYWRkRGVwZW5kZW5jeVxuICAgKiBhbmQgY2FsbHMgaW1wb3J0U2NyaXB0XyBpbiB0aGUgY29ycmVjdCBvcmRlci5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdvb2cud3JpdGVTY3JpcHRzXyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIHRoZSBzY3JpcHRzIHdlIG5lZWQgdG8gd3JpdGUgdGhpcyB0aW1lXG4gICAgdmFyIHNjcmlwdHMgPSBbXTtcbiAgICB2YXIgc2VlblNjcmlwdCA9IHt9O1xuICAgIHZhciBkZXBzID0gZ29vZy5kZXBlbmRlbmNpZXNfO1xuXG4gICAgZnVuY3Rpb24gdmlzaXROb2RlKHBhdGgpIHtcbiAgICAgIGlmIChwYXRoIGluIGRlcHMud3JpdHRlbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIHdlIGhhdmUgYWxyZWFkeSB2aXNpdGVkIHRoaXMgb25lLiBXZSBjYW4gZ2V0IGhlcmUgaWYgd2UgaGF2ZSBjeWNsaWNcbiAgICAgIC8vIGRlcGVuZGVuY2llc1xuICAgICAgaWYgKHBhdGggaW4gZGVwcy52aXNpdGVkKSB7XG4gICAgICAgIGlmICghKHBhdGggaW4gc2VlblNjcmlwdCkpIHtcbiAgICAgICAgICBzZWVuU2NyaXB0W3BhdGhdID0gdHJ1ZTtcbiAgICAgICAgICBzY3JpcHRzLnB1c2gocGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBkZXBzLnZpc2l0ZWRbcGF0aF0gPSB0cnVlO1xuXG4gICAgICBpZiAocGF0aCBpbiBkZXBzLnJlcXVpcmVzKSB7XG4gICAgICAgIGZvciAodmFyIHJlcXVpcmVOYW1lIGluIGRlcHMucmVxdWlyZXNbcGF0aF0pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgcmVxdWlyZWQgbmFtZSBpcyBkZWZpbmVkLCB3ZSBhc3N1bWUgdGhhdCBpdCB3YXMgYWxyZWFkeVxuICAgICAgICAgIC8vIGJvb3RzdHJhcHBlZCBieSBvdGhlciBtZWFucy5cbiAgICAgICAgICBpZiAoIWdvb2cuaXNQcm92aWRlZF8ocmVxdWlyZU5hbWUpKSB7XG4gICAgICAgICAgICBpZiAocmVxdWlyZU5hbWUgaW4gZGVwcy5uYW1lVG9QYXRoKSB7XG4gICAgICAgICAgICAgIHZpc2l0Tm9kZShkZXBzLm5hbWVUb1BhdGhbcmVxdWlyZU5hbWVdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IEVycm9yKCdVbmRlZmluZWQgbmFtZVRvUGF0aCBmb3IgJyArIHJlcXVpcmVOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCEocGF0aCBpbiBzZWVuU2NyaXB0KSkge1xuICAgICAgICBzZWVuU2NyaXB0W3BhdGhdID0gdHJ1ZTtcbiAgICAgICAgc2NyaXB0cy5wdXNoKHBhdGgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIHBhdGggaW4gZ29vZy5pbmNsdWRlZF8pIHtcbiAgICAgIGlmICghZGVwcy53cml0dGVuW3BhdGhdKSB7XG4gICAgICAgIHZpc2l0Tm9kZShwYXRoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNjcmlwdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChzY3JpcHRzW2ldKSB7XG4gICAgICAgIGdvb2cuaW1wb3J0U2NyaXB0Xyhnb29nLmJhc2VQYXRoICsgc2NyaXB0c1tpXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBFcnJvcignVW5kZWZpbmVkIHNjcmlwdCBpbnB1dCcpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuXG4gIC8qKlxuICAgKiBMb29rcyBhdCB0aGUgZGVwZW5kZW5jeSBydWxlcyBhbmQgdHJpZXMgdG8gZGV0ZXJtaW5lIHRoZSBzY3JpcHQgZmlsZSB0aGF0XG4gICAqIGZ1bGZpbGxzIGEgcGFydGljdWxhciBydWxlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcnVsZSBJbiB0aGUgZm9ybSBnb29nLm5hbWVzcGFjZS5DbGFzcyBvciBwcm9qZWN0LnNjcmlwdC5cbiAgICogQHJldHVybiB7P3N0cmluZ30gVXJsIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHJ1bGUsIG9yIG51bGwuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnb29nLmdldFBhdGhGcm9tRGVwc18gPSBmdW5jdGlvbihydWxlKSB7XG4gICAgaWYgKHJ1bGUgaW4gZ29vZy5kZXBlbmRlbmNpZXNfLm5hbWVUb1BhdGgpIHtcbiAgICAgIHJldHVybiBnb29nLmRlcGVuZGVuY2llc18ubmFtZVRvUGF0aFtydWxlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xuXG4gIGdvb2cuZmluZEJhc2VQYXRoXygpO1xuXG4gIC8vIEFsbG93IHByb2plY3RzIHRvIG1hbmFnZSB0aGUgZGVwcyBmaWxlcyB0aGVtc2VsdmVzLlxuICBpZiAoIWdvb2cuZ2xvYmFsLkNMT1NVUkVfTk9fREVQUykge1xuICAgIGdvb2cuaW1wb3J0U2NyaXB0Xyhnb29nLmJhc2VQYXRoICsgJ2RlcHMuanMnKTtcbiAgfVxufVxuXG5cblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIExhbmd1YWdlIEVuaGFuY2VtZW50c1xuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuXG4vKipcbiAqIFRoaXMgaXMgYSBcImZpeGVkXCIgdmVyc2lvbiBvZiB0aGUgdHlwZW9mIG9wZXJhdG9yLiAgSXQgZGlmZmVycyBmcm9tIHRoZSB0eXBlb2ZcbiAqIG9wZXJhdG9yIGluIHN1Y2ggYSB3YXkgdGhhdCBudWxsIHJldHVybnMgJ251bGwnIGFuZCBhcnJheXMgcmV0dXJuICdhcnJheScuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBnZXQgdGhlIHR5cGUgb2YuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSB0eXBlLlxuICovXG5nb29nLnR5cGVPZiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBzID0gdHlwZW9mIHZhbHVlO1xuICBpZiAocyA9PSAnb2JqZWN0Jykge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgLy8gQ2hlY2sgdGhlc2UgZmlyc3QsIHNvIHdlIGNhbiBhdm9pZCBjYWxsaW5nIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcgaWZcbiAgICAgIC8vIHBvc3NpYmxlLlxuICAgICAgLy9cbiAgICAgIC8vIElFIGltcHJvcGVybHkgbWFyc2hhbHMgdHllcG9mIGFjcm9zcyBleGVjdXRpb24gY29udGV4dHMsIGJ1dCBhXG4gICAgICAvLyBjcm9zcy1jb250ZXh0IG9iamVjdCB3aWxsIHN0aWxsIHJldHVybiBmYWxzZSBmb3IgXCJpbnN0YW5jZW9mIE9iamVjdFwiLlxuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuICdhcnJheSc7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfVxuXG4gICAgICAvLyBIQUNLOiBJbiBvcmRlciB0byB1c2UgYW4gT2JqZWN0IHByb3RvdHlwZSBtZXRob2Qgb24gdGhlIGFyYml0cmFyeVxuICAgICAgLy8gICB2YWx1ZSwgdGhlIGNvbXBpbGVyIHJlcXVpcmVzIHRoZSB2YWx1ZSBiZSBjYXN0IHRvIHR5cGUgT2JqZWN0LFxuICAgICAgLy8gICBldmVuIHRob3VnaCB0aGUgRUNNQSBzcGVjIGV4cGxpY2l0bHkgYWxsb3dzIGl0LlxuICAgICAgdmFyIGNsYXNzTmFtZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChcbiAgICAgICAgICAvKiogQHR5cGUge09iamVjdH0gKi8gKHZhbHVlKSk7XG4gICAgICAvLyBJbiBGaXJlZm94IDMuNiwgYXR0ZW1wdGluZyB0byBhY2Nlc3MgaWZyYW1lIHdpbmRvdyBvYmplY3RzJyBsZW5ndGhcbiAgICAgIC8vIHByb3BlcnR5IHRocm93cyBhbiBOU19FUlJPUl9GQUlMVVJFLCBzbyB3ZSBuZWVkIHRvIHNwZWNpYWwtY2FzZSBpdFxuICAgICAgLy8gaGVyZS5cbiAgICAgIGlmIChjbGFzc05hbWUgPT0gJ1tvYmplY3QgV2luZG93XScpIHtcbiAgICAgICAgcmV0dXJuICdvYmplY3QnO1xuICAgICAgfVxuXG4gICAgICAvLyBXZSBjYW5ub3QgYWx3YXlzIHVzZSBjb25zdHJ1Y3RvciA9PSBBcnJheSBvciBpbnN0YW5jZW9mIEFycmF5IGJlY2F1c2VcbiAgICAgIC8vIGRpZmZlcmVudCBmcmFtZXMgaGF2ZSBkaWZmZXJlbnQgQXJyYXkgb2JqZWN0cy4gSW4gSUU2LCBpZiB0aGUgaWZyYW1lXG4gICAgICAvLyB3aGVyZSB0aGUgYXJyYXkgd2FzIGNyZWF0ZWQgaXMgZGVzdHJveWVkLCB0aGUgYXJyYXkgbG9zZXMgaXRzXG4gICAgICAvLyBwcm90b3R5cGUuIFRoZW4gZGVyZWZlcmVuY2luZyB2YWwuc3BsaWNlIGhlcmUgdGhyb3dzIGFuIGV4Y2VwdGlvbiwgc29cbiAgICAgIC8vIHdlIGNhbid0IHVzZSBnb29nLmlzRnVuY3Rpb24uIENhbGxpbmcgdHlwZW9mIGRpcmVjdGx5IHJldHVybnMgJ3Vua25vd24nXG4gICAgICAvLyBzbyB0aGF0IHdpbGwgd29yay4gSW4gdGhpcyBjYXNlLCB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIGZhbHNlIGFuZFxuICAgICAgLy8gbW9zdCBhcnJheSBmdW5jdGlvbnMgd2lsbCBzdGlsbCB3b3JrIGJlY2F1c2UgdGhlIGFycmF5IGlzIHN0aWxsXG4gICAgICAvLyBhcnJheS1saWtlIChzdXBwb3J0cyBsZW5ndGggYW5kIFtdKSBldmVuIHRob3VnaCBpdCBoYXMgbG9zdCBpdHNcbiAgICAgIC8vIHByb3RvdHlwZS5cbiAgICAgIC8vIE1hcmsgTWlsbGVyIG5vdGljZWQgdGhhdCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG4gICAgICAvLyBhbGxvd3MgYWNjZXNzIHRvIHRoZSB1bmZvcmdlYWJsZSBbW0NsYXNzXV0gcHJvcGVydHkuXG4gICAgICAvLyAgMTUuMi40LjIgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyAoIClcbiAgICAgIC8vICBXaGVuIHRoZSB0b1N0cmluZyBtZXRob2QgaXMgY2FsbGVkLCB0aGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcbiAgICAgIC8vICAgICAgMS4gR2V0IHRoZSBbW0NsYXNzXV0gcHJvcGVydHkgb2YgdGhpcyBvYmplY3QuXG4gICAgICAvLyAgICAgIDIuIENvbXB1dGUgYSBzdHJpbmcgdmFsdWUgYnkgY29uY2F0ZW5hdGluZyB0aGUgdGhyZWUgc3RyaW5nc1xuICAgICAgLy8gICAgICAgICBcIltvYmplY3QgXCIsIFJlc3VsdCgxKSwgYW5kIFwiXVwiLlxuICAgICAgLy8gICAgICAzLiBSZXR1cm4gUmVzdWx0KDIpLlxuICAgICAgLy8gYW5kIHRoaXMgYmVoYXZpb3Igc3Vydml2ZXMgdGhlIGRlc3RydWN0aW9uIG9mIHRoZSBleGVjdXRpb24gY29udGV4dC5cbiAgICAgIGlmICgoY2xhc3NOYW1lID09ICdbb2JqZWN0IEFycmF5XScgfHxcbiAgICAgICAgICAgLy8gSW4gSUUgYWxsIG5vbiB2YWx1ZSB0eXBlcyBhcmUgd3JhcHBlZCBhcyBvYmplY3RzIGFjcm9zcyB3aW5kb3dcbiAgICAgICAgICAgLy8gYm91bmRhcmllcyAobm90IGlmcmFtZSB0aG91Z2gpIHNvIHdlIGhhdmUgdG8gZG8gb2JqZWN0IGRldGVjdGlvblxuICAgICAgICAgICAvLyBmb3IgdGhpcyBlZGdlIGNhc2VcbiAgICAgICAgICAgdHlwZW9mIHZhbHVlLmxlbmd0aCA9PSAnbnVtYmVyJyAmJlxuICAgICAgICAgICB0eXBlb2YgdmFsdWUuc3BsaWNlICE9ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgIHR5cGVvZiB2YWx1ZS5wcm9wZXJ0eUlzRW51bWVyYWJsZSAhPSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICAhdmFsdWUucHJvcGVydHlJc0VudW1lcmFibGUoJ3NwbGljZScpXG5cbiAgICAgICAgICApKSB7XG4gICAgICAgIHJldHVybiAnYXJyYXknO1xuICAgICAgfVxuICAgICAgLy8gSEFDSzogVGhlcmUgaXMgc3RpbGwgYW4gYXJyYXkgY2FzZSB0aGF0IGZhaWxzLlxuICAgICAgLy8gICAgIGZ1bmN0aW9uIEFycmF5SW1wb3N0b3IoKSB7fVxuICAgICAgLy8gICAgIEFycmF5SW1wb3N0b3IucHJvdG90eXBlID0gW107XG4gICAgICAvLyAgICAgdmFyIGltcG9zdG9yID0gbmV3IEFycmF5SW1wb3N0b3I7XG4gICAgICAvLyB0aGlzIGNhbiBiZSBmaXhlZCBieSBnZXR0aW5nIHJpZCBvZiB0aGUgZmFzdCBwYXRoXG4gICAgICAvLyAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSkgYW5kIHNvbGVseSByZWx5aW5nIG9uXG4gICAgICAvLyAodmFsdWUgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy52YWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJylcbiAgICAgIC8vIGJ1dCB0aGF0IHdvdWxkIHJlcXVpcmUgbWFueSBtb3JlIGZ1bmN0aW9uIGNhbGxzIGFuZCBpcyBub3Qgd2FycmFudGVkXG4gICAgICAvLyB1bmxlc3MgY2xvc3VyZSBjb2RlIGlzIHJlY2VpdmluZyBvYmplY3RzIGZyb20gdW50cnVzdGVkIHNvdXJjZXMuXG5cbiAgICAgIC8vIElFIGluIGNyb3NzLXdpbmRvdyBjYWxscyBkb2VzIG5vdCBjb3JyZWN0bHkgbWFyc2hhbCB0aGUgZnVuY3Rpb24gdHlwZVxuICAgICAgLy8gKGl0IGFwcGVhcnMganVzdCBhcyBhbiBvYmplY3QpIHNvIHdlIGNhbm5vdCB1c2UganVzdCB0eXBlb2YgdmFsID09XG4gICAgICAvLyAnZnVuY3Rpb24nLiBIb3dldmVyLCBpZiB0aGUgb2JqZWN0IGhhcyBhIGNhbGwgcHJvcGVydHksIGl0IGlzIGFcbiAgICAgIC8vIGZ1bmN0aW9uLlxuICAgICAgaWYgKChjbGFzc05hbWUgPT0gJ1tvYmplY3QgRnVuY3Rpb25dJyB8fFxuICAgICAgICAgIHR5cGVvZiB2YWx1ZS5jYWxsICE9ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgdHlwZW9mIHZhbHVlLnByb3BlcnR5SXNFbnVtZXJhYmxlICE9ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgIXZhbHVlLnByb3BlcnR5SXNFbnVtZXJhYmxlKCdjYWxsJykpKSB7XG4gICAgICAgIHJldHVybiAnZnVuY3Rpb24nO1xuICAgICAgfVxuXG5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdudWxsJztcbiAgICB9XG5cbiAgfSBlbHNlIGlmIChzID09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHZhbHVlLmNhbGwgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBJbiBTYWZhcmkgdHlwZW9mIG5vZGVMaXN0IHJldHVybnMgJ2Z1bmN0aW9uJywgYW5kIG9uIEZpcmVmb3hcbiAgICAvLyB0eXBlb2YgYmVoYXZlcyBzaW1pbGFybHkgZm9yIEhUTUx7QXBwbGV0LEVtYmVkLE9iamVjdH1FbGVtZW50c1xuICAgIC8vIGFuZCBSZWdFeHBzLiAgV2Ugd291bGQgbGlrZSB0byByZXR1cm4gb2JqZWN0IGZvciB0aG9zZSBhbmQgd2UgY2FuXG4gICAgLy8gZGV0ZWN0IGFuIGludmFsaWQgZnVuY3Rpb24gYnkgbWFraW5nIHN1cmUgdGhhdCB0aGUgZnVuY3Rpb25cbiAgICAvLyBvYmplY3QgaGFzIGEgY2FsbCBtZXRob2QuXG4gICAgcmV0dXJuICdvYmplY3QnO1xuICB9XG4gIHJldHVybiBzO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIG5vdCB8dW5kZWZpbmVkfC5cbiAqIFdBUk5JTkc6IERvIG5vdCB1c2UgdGhpcyB0byB0ZXN0IGlmIGFuIG9iamVjdCBoYXMgYSBwcm9wZXJ0eS4gVXNlIHRoZSBpblxuICogb3BlcmF0b3IgaW5zdGVhZC4gIEFkZGl0aW9uYWxseSwgdGhpcyBmdW5jdGlvbiBhc3N1bWVzIHRoYXQgdGhlIGdsb2JhbFxuICogdW5kZWZpbmVkIHZhcmlhYmxlIGhhcyBub3QgYmVlbiByZWRlZmluZWQuXG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBkZWZpbmVkLlxuICovXG5nb29nLmlzRGVmID0gZnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB2YWwgIT09IHVuZGVmaW5lZDtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyB8bnVsbHxcbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIG51bGwuXG4gKi9cbmdvb2cuaXNOdWxsID0gZnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB2YWwgPT09IG51bGw7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgZGVmaW5lZCBhbmQgbm90IG51bGxcbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGRlZmluZWQgYW5kIG5vdCBudWxsLlxuICovXG5nb29nLmlzRGVmQW5kTm90TnVsbCA9IGZ1bmN0aW9uKHZhbCkge1xuICAvLyBOb3RlIHRoYXQgdW5kZWZpbmVkID09IG51bGwuXG4gIHJldHVybiB2YWwgIT0gbnVsbDtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBhbiBhcnJheVxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgYW4gYXJyYXkuXG4gKi9cbmdvb2cuaXNBcnJheSA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gZ29vZy50eXBlT2YodmFsKSA9PSAnYXJyYXknO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgb2JqZWN0IGxvb2tzIGxpa2UgYW4gYXJyYXkuIFRvIHF1YWxpZnkgYXMgYXJyYXkgbGlrZVxuICogdGhlIHZhbHVlIG5lZWRzIHRvIGJlIGVpdGhlciBhIE5vZGVMaXN0IG9yIGFuIG9iamVjdCB3aXRoIGEgTnVtYmVyIGxlbmd0aFxuICogcHJvcGVydHkuXG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBhbiBhcnJheS5cbiAqL1xuZ29vZy5pc0FycmF5TGlrZSA9IGZ1bmN0aW9uKHZhbCkge1xuICB2YXIgdHlwZSA9IGdvb2cudHlwZU9mKHZhbCk7XG4gIHJldHVybiB0eXBlID09ICdhcnJheScgfHwgdHlwZSA9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsLmxlbmd0aCA9PSAnbnVtYmVyJztcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9iamVjdCBsb29rcyBsaWtlIGEgRGF0ZS4gVG8gcXVhbGlmeSBhcyBEYXRlLWxpa2VcbiAqIHRoZSB2YWx1ZSBuZWVkcyB0byBiZSBhbiBvYmplY3QgYW5kIGhhdmUgYSBnZXRGdWxsWWVhcigpIGZ1bmN0aW9uLlxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgYSBsaWtlIGEgRGF0ZS5cbiAqL1xuZ29vZy5pc0RhdGVMaWtlID0gZnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBnb29nLmlzT2JqZWN0KHZhbCkgJiYgdHlwZW9mIHZhbC5nZXRGdWxsWWVhciA9PSAnZnVuY3Rpb24nO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGEgc3RyaW5nXG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBhIHN0cmluZy5cbiAqL1xuZ29vZy5pc1N0cmluZyA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PSAnc3RyaW5nJztcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBhIGJvb2xlYW5cbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGJvb2xlYW4uXG4gKi9cbmdvb2cuaXNCb29sZWFuID0gZnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09ICdib29sZWFuJztcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBhIG51bWJlclxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgYSBudW1iZXIuXG4gKi9cbmdvb2cuaXNOdW1iZXIgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT0gJ251bWJlcic7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYSBmdW5jdGlvblxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgYSBmdW5jdGlvbi5cbiAqL1xuZ29vZy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBnb29nLnR5cGVPZih2YWwpID09ICdmdW5jdGlvbic7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYW4gb2JqZWN0LiAgVGhpcyBpbmNsdWRlcyBhcnJheXNcbiAqIGFuZCBmdW5jdGlvbnMuXG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBhbiBvYmplY3QuXG4gKi9cbmdvb2cuaXNPYmplY3QgPSBmdW5jdGlvbih2YWwpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICByZXR1cm4gdHlwZSA9PSAnb2JqZWN0JyAmJiB2YWwgIT0gbnVsbCB8fCB0eXBlID09ICdmdW5jdGlvbic7XG4gIC8vIHJldHVybiBPYmplY3QodmFsKSA9PT0gdmFsIGFsc28gd29ya3MsIGJ1dCBpcyBzbG93ZXIsIGVzcGVjaWFsbHkgaWYgdmFsIGlzXG4gIC8vIG5vdCBhbiBvYmplY3QuXG59O1xuXG5cbi8qKlxuICogR2V0cyBhIHVuaXF1ZSBJRCBmb3IgYW4gb2JqZWN0LiBUaGlzIG11dGF0ZXMgdGhlIG9iamVjdCBzbyB0aGF0IGZ1cnRoZXJcbiAqIGNhbGxzIHdpdGggdGhlIHNhbWUgb2JqZWN0IGFzIGEgcGFyYW1ldGVyIHJldHVybnMgdGhlIHNhbWUgdmFsdWUuIFRoZSB1bmlxdWVcbiAqIElEIGlzIGd1YXJhbnRlZWQgdG8gYmUgdW5pcXVlIGFjcm9zcyB0aGUgY3VycmVudCBzZXNzaW9uIGFtb25nc3Qgb2JqZWN0cyB0aGF0XG4gKiBhcmUgcGFzc2VkIGludG8ge0Bjb2RlIGdldFVpZH0uIFRoZXJlIGlzIG5vIGd1YXJhbnRlZSB0aGF0IHRoZSBJRCBpcyB1bmlxdWVcbiAqIG9yIGNvbnNpc3RlbnQgYWNyb3NzIHNlc3Npb25zLiBJdCBpcyB1bnNhZmUgdG8gZ2VuZXJhdGUgdW5pcXVlIElEIGZvclxuICogZnVuY3Rpb24gcHJvdG90eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gZ2V0IHRoZSB1bmlxdWUgSUQgZm9yLlxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgdW5pcXVlIElEIGZvciB0aGUgb2JqZWN0LlxuICovXG5nb29nLmdldFVpZCA9IGZ1bmN0aW9uKG9iaikge1xuICAvLyBUT0RPKGFydik6IE1ha2UgdGhlIHR5cGUgc3RyaWN0ZXIsIGRvIG5vdCBhY2NlcHQgbnVsbC5cblxuICAvLyBJbiBPcGVyYSB3aW5kb3cuaGFzT3duUHJvcGVydHkgZXhpc3RzIGJ1dCBhbHdheXMgcmV0dXJucyBmYWxzZSBzbyB3ZSBhdm9pZFxuICAvLyB1c2luZyBpdC4gQXMgYSBjb25zZXF1ZW5jZSB0aGUgdW5pcXVlIElEIGdlbmVyYXRlZCBmb3IgQmFzZUNsYXNzLnByb3RvdHlwZVxuICAvLyBhbmQgU3ViQ2xhc3MucHJvdG90eXBlIHdpbGwgYmUgdGhlIHNhbWUuXG4gIHJldHVybiBvYmpbZ29vZy5VSURfUFJPUEVSVFlfXSB8fFxuICAgICAgKG9ialtnb29nLlVJRF9QUk9QRVJUWV9dID0gKytnb29nLnVpZENvdW50ZXJfKTtcbn07XG5cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSB1bmlxdWUgSUQgZnJvbSBhbiBvYmplY3QuIFRoaXMgaXMgdXNlZnVsIGlmIHRoZSBvYmplY3Qgd2FzXG4gKiBwcmV2aW91c2x5IG11dGF0ZWQgdXNpbmcge0Bjb2RlIGdvb2cuZ2V0VWlkfSBpbiB3aGljaCBjYXNlIHRoZSBtdXRhdGlvbiBpc1xuICogdW5kb25lLlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHJlbW92ZSB0aGUgdW5pcXVlIElEIGZpZWxkIGZyb20uXG4gKi9cbmdvb2cucmVtb3ZlVWlkID0gZnVuY3Rpb24ob2JqKSB7XG4gIC8vIFRPRE8oYXJ2KTogTWFrZSB0aGUgdHlwZSBzdHJpY3RlciwgZG8gbm90IGFjY2VwdCBudWxsLlxuXG4gIC8vIERPTSBub2RlcyBpbiBJRSBhcmUgbm90IGluc3RhbmNlIG9mIE9iamVjdCBhbmQgdGhyb3dzIGV4Y2VwdGlvblxuICAvLyBmb3IgZGVsZXRlLiBJbnN0ZWFkIHdlIHRyeSB0byB1c2UgcmVtb3ZlQXR0cmlidXRlXG4gIGlmICgncmVtb3ZlQXR0cmlidXRlJyBpbiBvYmopIHtcbiAgICBvYmoucmVtb3ZlQXR0cmlidXRlKGdvb2cuVUlEX1BST1BFUlRZXyk7XG4gIH1cbiAgLyoqIEBwcmVzZXJ2ZVRyeSAqL1xuICB0cnkge1xuICAgIGRlbGV0ZSBvYmpbZ29vZy5VSURfUFJPUEVSVFlfXTtcbiAgfSBjYXRjaCAoZXgpIHtcbiAgfVxufTtcblxuXG4vKipcbiAqIE5hbWUgZm9yIHVuaXF1ZSBJRCBwcm9wZXJ0eS4gSW5pdGlhbGl6ZWQgaW4gYSB3YXkgdG8gaGVscCBhdm9pZCBjb2xsaXNpb25zXG4gKiB3aXRoIG90aGVyIGNsb3N1cmUgamF2YXNjcmlwdCBvbiB0aGUgc2FtZSBwYWdlLlxuICogQHR5cGUge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbmdvb2cuVUlEX1BST1BFUlRZXyA9ICdjbG9zdXJlX3VpZF8nICtcbiAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyMTQ3NDgzNjQ4KS50b1N0cmluZygzNik7XG5cblxuLyoqXG4gKiBDb3VudGVyIGZvciBVSUQuXG4gKiBAdHlwZSB7bnVtYmVyfVxuICogQHByaXZhdGVcbiAqL1xuZ29vZy51aWRDb3VudGVyXyA9IDA7XG5cblxuLyoqXG4gKiBBZGRzIGEgaGFzaCBjb2RlIGZpZWxkIHRvIGFuIG9iamVjdC4gVGhlIGhhc2ggY29kZSBpcyB1bmlxdWUgZm9yIHRoZVxuICogZ2l2ZW4gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIGdldCB0aGUgaGFzaCBjb2RlIGZvci5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIGhhc2ggY29kZSBmb3IgdGhlIG9iamVjdC5cbiAqIEBkZXByZWNhdGVkIFVzZSBnb29nLmdldFVpZCBpbnN0ZWFkLlxuICovXG5nb29nLmdldEhhc2hDb2RlID0gZ29vZy5nZXRVaWQ7XG5cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBoYXNoIGNvZGUgZmllbGQgZnJvbSBhbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcmVtb3ZlIHRoZSBmaWVsZCBmcm9tLlxuICogQGRlcHJlY2F0ZWQgVXNlIGdvb2cucmVtb3ZlVWlkIGluc3RlYWQuXG4gKi9cbmdvb2cucmVtb3ZlSGFzaENvZGUgPSBnb29nLnJlbW92ZVVpZDtcblxuXG4vKipcbiAqIENsb25lcyBhIHZhbHVlLiBUaGUgaW5wdXQgbWF5IGJlIGFuIE9iamVjdCwgQXJyYXksIG9yIGJhc2ljIHR5cGUuIE9iamVjdHMgYW5kXG4gKiBhcnJheXMgd2lsbCBiZSBjbG9uZWQgcmVjdXJzaXZlbHkuXG4gKlxuICogV0FSTklOR1M6XG4gKiA8Y29kZT5nb29nLmNsb25lT2JqZWN0PC9jb2RlPiBkb2VzIG5vdCBkZXRlY3QgcmVmZXJlbmNlIGxvb3BzLiBPYmplY3RzIHRoYXRcbiAqIHJlZmVyIHRvIHRoZW1zZWx2ZXMgd2lsbCBjYXVzZSBpbmZpbml0ZSByZWN1cnNpb24uXG4gKlxuICogPGNvZGU+Z29vZy5jbG9uZU9iamVjdDwvY29kZT4gaXMgdW5hd2FyZSBvZiB1bmlxdWUgaWRlbnRpZmllcnMsIGFuZCBjb3BpZXNcbiAqIFVJRHMgY3JlYXRlZCBieSA8Y29kZT5nZXRVaWQ8L2NvZGU+IGludG8gY2xvbmVkIHJlc3VsdHMuXG4gKlxuICogQHBhcmFtIHsqfSBvYmogVGhlIHZhbHVlIHRvIGNsb25lLlxuICogQHJldHVybiB7Kn0gQSBjbG9uZSBvZiB0aGUgaW5wdXQgdmFsdWUuXG4gKiBAZGVwcmVjYXRlZCBnb29nLmNsb25lT2JqZWN0IGlzIHVuc2FmZS4gUHJlZmVyIHRoZSBnb29nLm9iamVjdCBtZXRob2RzLlxuICovXG5nb29nLmNsb25lT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciB0eXBlID0gZ29vZy50eXBlT2Yob2JqKTtcbiAgaWYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnYXJyYXknKSB7XG4gICAgaWYgKG9iai5jbG9uZSkge1xuICAgICAgcmV0dXJuIG9iai5jbG9uZSgpO1xuICAgIH1cbiAgICB2YXIgY2xvbmUgPSB0eXBlID09ICdhcnJheScgPyBbXSA6IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGNsb25lW2tleV0gPSBnb29nLmNsb25lT2JqZWN0KG9ialtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cblxuLyoqXG4gKiBGb3J3YXJkIGRlY2xhcmF0aW9uIGZvciB0aGUgY2xvbmUgbWV0aG9kLiBUaGlzIGlzIG5lY2Vzc2FyeSB1bnRpbCB0aGVcbiAqIGNvbXBpbGVyIGNhbiBiZXR0ZXIgc3VwcG9ydCBkdWNrLXR5cGluZyBjb25zdHJ1Y3RzIGFzIHVzZWQgaW5cbiAqIGdvb2cuY2xvbmVPYmplY3QuXG4gKlxuICogVE9ETyhicmVubmVtYW4pOiBSZW1vdmUgb25jZSB0aGUgSlNDb21waWxlciBjYW4gaW5mZXIgdGhhdCB0aGUgY2hlY2sgZm9yXG4gKiBwcm90by5jbG9uZSBpcyBzYWZlIGluIGdvb2cuY2xvbmVPYmplY3QuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5PYmplY3QucHJvdG90eXBlLmNsb25lO1xuXG5cbi8qKlxuICogQSBuYXRpdmUgaW1wbGVtZW50YXRpb24gb2YgZ29vZy5iaW5kLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQSBmdW5jdGlvbiB0byBwYXJ0aWFsbHkgYXBwbHkuXG4gKiBAcGFyYW0ge09iamVjdHx1bmRlZmluZWR9IHNlbGZPYmogU3BlY2lmaWVzIHRoZSBvYmplY3Qgd2hpY2ggfHRoaXN8IHNob3VsZFxuICogICAgIHBvaW50IHRvIHdoZW4gdGhlIGZ1bmN0aW9uIGlzIHJ1bi5cbiAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3MgQWRkaXRpb25hbCBhcmd1bWVudHMgdGhhdCBhcmUgcGFydGlhbGx5XG4gKiAgICAgYXBwbGllZCB0byB0aGUgZnVuY3Rpb24uXG4gKiBAcmV0dXJuIHshRnVuY3Rpb259IEEgcGFydGlhbGx5LWFwcGxpZWQgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYmluZCgpIHdhc1xuICogICAgIGludm9rZWQgYXMgYSBtZXRob2Qgb2YuXG4gKiBAcHJpdmF0ZVxuICogQHN1cHByZXNzIHtkZXByZWNhdGVkfSBUaGUgY29tcGlsZXIgdGhpbmtzIHRoYXQgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmRcbiAqICAgICBpcyBkZXByZWNhdGVkIGJlY2F1c2Ugc29tZSBwZW9wbGUgaGF2ZSBkZWNsYXJlZCBhIHB1cmUtSlMgdmVyc2lvbi5cbiAqICAgICBPbmx5IHRoZSBwdXJlLUpTIHZlcnNpb24gaXMgdHJ1bHkgZGVwcmVjYXRlZC5cbiAqL1xuZ29vZy5iaW5kTmF0aXZlXyA9IGZ1bmN0aW9uKGZuLCBzZWxmT2JqLCB2YXJfYXJncykge1xuICByZXR1cm4gLyoqIEB0eXBlIHshRnVuY3Rpb259ICovIChmbi5jYWxsLmFwcGx5KGZuLmJpbmQsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEEgcHVyZS1KUyBpbXBsZW1lbnRhdGlvbiBvZiBnb29nLmJpbmQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBBIGZ1bmN0aW9uIHRvIHBhcnRpYWxseSBhcHBseS5cbiAqIEBwYXJhbSB7T2JqZWN0fHVuZGVmaW5lZH0gc2VsZk9iaiBTcGVjaWZpZXMgdGhlIG9iamVjdCB3aGljaCB8dGhpc3wgc2hvdWxkXG4gKiAgICAgcG9pbnQgdG8gd2hlbiB0aGUgZnVuY3Rpb24gaXMgcnVuLlxuICogQHBhcmFtIHsuLi4qfSB2YXJfYXJncyBBZGRpdGlvbmFsIGFyZ3VtZW50cyB0aGF0IGFyZSBwYXJ0aWFsbHlcbiAqICAgICBhcHBsaWVkIHRvIHRoZSBmdW5jdGlvbi5cbiAqIEByZXR1cm4geyFGdW5jdGlvbn0gQSBwYXJ0aWFsbHktYXBwbGllZCBmb3JtIG9mIHRoZSBmdW5jdGlvbiBiaW5kKCkgd2FzXG4gKiAgICAgaW52b2tlZCBhcyBhIG1ldGhvZCBvZi5cbiAqIEBwcml2YXRlXG4gKi9cbmdvb2cuYmluZEpzXyA9IGZ1bmN0aW9uKGZuLCBzZWxmT2JqLCB2YXJfYXJncykge1xuICBpZiAoIWZuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gIH1cblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICB2YXIgYm91bmRBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBQcmVwZW5kIHRoZSBib3VuZCBhcmd1bWVudHMgdG8gdGhlIGN1cnJlbnQgYXJndW1lbnRzLlxuICAgICAgdmFyIG5ld0FyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuYXBwbHkobmV3QXJncywgYm91bmRBcmdzKTtcbiAgICAgIHJldHVybiBmbi5hcHBseShzZWxmT2JqLCBuZXdBcmdzKTtcbiAgICB9O1xuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KHNlbGZPYmosIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxufTtcblxuXG4vKipcbiAqIFBhcnRpYWxseSBhcHBsaWVzIHRoaXMgZnVuY3Rpb24gdG8gYSBwYXJ0aWN1bGFyICd0aGlzIG9iamVjdCcgYW5kIHplcm8gb3JcbiAqIG1vcmUgYXJndW1lbnRzLiBUaGUgcmVzdWx0IGlzIGEgbmV3IGZ1bmN0aW9uIHdpdGggc29tZSBhcmd1bWVudHMgb2YgdGhlIGZpcnN0XG4gKiBmdW5jdGlvbiBwcmUtZmlsbGVkIGFuZCB0aGUgdmFsdWUgb2YgfHRoaXN8ICdwcmUtc3BlY2lmaWVkJy48YnI+PGJyPlxuICpcbiAqIFJlbWFpbmluZyBhcmd1bWVudHMgc3BlY2lmaWVkIGF0IGNhbGwtdGltZSBhcmUgYXBwZW5kZWQgdG8gdGhlIHByZS1cbiAqIHNwZWNpZmllZCBvbmVzLjxicj48YnI+XG4gKlxuICogQWxzbyBzZWU6IHtAbGluayAjcGFydGlhbH0uPGJyPjxicj5cbiAqXG4gKiBVc2FnZTpcbiAqIDxwcmU+dmFyIGJhck1ldGhCb3VuZCA9IGJpbmQobXlGdW5jdGlvbiwgbXlPYmosICdhcmcxJywgJ2FyZzInKTtcbiAqIGJhck1ldGhCb3VuZCgnYXJnMycsICdhcmc0Jyk7PC9wcmU+XG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQSBmdW5jdGlvbiB0byBwYXJ0aWFsbHkgYXBwbHkuXG4gKiBAcGFyYW0ge09iamVjdHx1bmRlZmluZWR9IHNlbGZPYmogU3BlY2lmaWVzIHRoZSBvYmplY3Qgd2hpY2ggfHRoaXN8IHNob3VsZFxuICogICAgIHBvaW50IHRvIHdoZW4gdGhlIGZ1bmN0aW9uIGlzIHJ1bi5cbiAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3MgQWRkaXRpb25hbCBhcmd1bWVudHMgdGhhdCBhcmUgcGFydGlhbGx5XG4gKiAgICAgYXBwbGllZCB0byB0aGUgZnVuY3Rpb24uXG4gKiBAcmV0dXJuIHshRnVuY3Rpb259IEEgcGFydGlhbGx5LWFwcGxpZWQgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYmluZCgpIHdhc1xuICogICAgIGludm9rZWQgYXMgYSBtZXRob2Qgb2YuXG4gKiBAc3VwcHJlc3Mge2RlcHJlY2F0ZWR9IFNlZSBhYm92ZS5cbiAqL1xuZ29vZy5iaW5kID0gZnVuY3Rpb24oZm4sIHNlbGZPYmosIHZhcl9hcmdzKSB7XG4gIC8vIFRPRE8obmlja3NhbnRvcyk6IG5hcnJvdyB0aGUgdHlwZSBzaWduYXR1cmUuXG4gIGlmIChGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAmJlxuICAgICAgLy8gTk9URShuaWNrc2FudG9zKTogU29tZWJvZHkgcHVsbGVkIGJhc2UuanMgaW50byB0aGUgZGVmYXVsdFxuICAgICAgLy8gQ2hyb21lIGV4dGVuc2lvbiBlbnZpcm9ubWVudC4gVGhpcyBtZWFucyB0aGF0IGZvciBDaHJvbWUgZXh0ZW5zaW9ucyxcbiAgICAgIC8vIHRoZXkgZ2V0IHRoZSBpbXBsZW1lbnRhdGlvbiBvZiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCB0aGF0XG4gICAgICAvLyBjYWxscyBnb29nLmJpbmQgaW5zdGVhZCBvZiB0aGUgbmF0aXZlIG9uZS4gRXZlbiB3b3JzZSwgd2UgZG9uJ3Qgd2FudFxuICAgICAgLy8gdG8gaW50cm9kdWNlIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSBiZXR3ZWVuIGdvb2cuYmluZCBhbmRcbiAgICAgIC8vIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLCBzbyB3ZSBoYXZlIHRvIGhhY2sgdGhpcyB0byBtYWtlIHN1cmUgaXRcbiAgICAgIC8vIHdvcmtzIGNvcnJlY3RseS5cbiAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLnRvU3RyaW5nKCkuaW5kZXhPZignbmF0aXZlIGNvZGUnKSAhPSAtMSkge1xuICAgIGdvb2cuYmluZCA9IGdvb2cuYmluZE5hdGl2ZV87XG4gIH0gZWxzZSB7XG4gICAgZ29vZy5iaW5kID0gZ29vZy5iaW5kSnNfO1xuICB9XG4gIHJldHVybiBnb29nLmJpbmQuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbn07XG5cblxuLyoqXG4gKiBMaWtlIGJpbmQoKSwgZXhjZXB0IHRoYXQgYSAndGhpcyBvYmplY3QnIGlzIG5vdCByZXF1aXJlZC4gVXNlZnVsIHdoZW4gdGhlXG4gKiB0YXJnZXQgZnVuY3Rpb24gaXMgYWxyZWFkeSBib3VuZC5cbiAqXG4gKiBVc2FnZTpcbiAqIHZhciBnID0gcGFydGlhbChmLCBhcmcxLCBhcmcyKTtcbiAqIGcoYXJnMywgYXJnNCk7XG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQSBmdW5jdGlvbiB0byBwYXJ0aWFsbHkgYXBwbHkuXG4gKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIEFkZGl0aW9uYWwgYXJndW1lbnRzIHRoYXQgYXJlIHBhcnRpYWxseVxuICogICAgIGFwcGxpZWQgdG8gZm4uXG4gKiBAcmV0dXJuIHshRnVuY3Rpb259IEEgcGFydGlhbGx5LWFwcGxpZWQgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYmluZCgpIHdhc1xuICogICAgIGludm9rZWQgYXMgYSBtZXRob2Qgb2YuXG4gKi9cbmdvb2cucGFydGlhbCA9IGZ1bmN0aW9uKGZuLCB2YXJfYXJncykge1xuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAvLyBQcmVwZW5kIHRoZSBib3VuZCBhcmd1bWVudHMgdG8gdGhlIGN1cnJlbnQgYXJndW1lbnRzLlxuICAgIHZhciBuZXdBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICBuZXdBcmdzLnVuc2hpZnQuYXBwbHkobmV3QXJncywgYXJncyk7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIG5ld0FyZ3MpO1xuICB9O1xufTtcblxuXG4vKipcbiAqIENvcGllcyBhbGwgdGhlIG1lbWJlcnMgb2YgYSBzb3VyY2Ugb2JqZWN0IHRvIGEgdGFyZ2V0IG9iamVjdC4gVGhpcyBtZXRob2RcbiAqIGRvZXMgbm90IHdvcmsgb24gYWxsIGJyb3dzZXJzIGZvciBhbGwgb2JqZWN0cyB0aGF0IGNvbnRhaW4ga2V5cyBzdWNoIGFzXG4gKiB0b1N0cmluZyBvciBoYXNPd25Qcm9wZXJ0eS4gVXNlIGdvb2cub2JqZWN0LmV4dGVuZCBmb3IgdGhpcyBwdXJwb3NlLlxuICogQHBhcmFtIHtPYmplY3R9IHRhcmdldCBUYXJnZXQuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFNvdXJjZS5cbiAqL1xuZ29vZy5taXhpbiA9IGZ1bmN0aW9uKHRhcmdldCwgc291cmNlKSB7XG4gIGZvciAodmFyIHggaW4gc291cmNlKSB7XG4gICAgdGFyZ2V0W3hdID0gc291cmNlW3hdO1xuICB9XG5cbiAgLy8gRm9yIElFNyBvciBsb3dlciwgdGhlIGZvci1pbi1sb29wIGRvZXMgbm90IGNvbnRhaW4gYW55IHByb3BlcnRpZXMgdGhhdCBhcmVcbiAgLy8gbm90IGVudW1lcmFibGUgb24gdGhlIHByb3RvdHlwZSBvYmplY3QgKGZvciBleGFtcGxlLCBpc1Byb3RvdHlwZU9mIGZyb21cbiAgLy8gT2JqZWN0LnByb3RvdHlwZSkgYnV0IGFsc28gaXQgd2lsbCBub3QgaW5jbHVkZSAncmVwbGFjZScgb24gb2JqZWN0cyB0aGF0XG4gIC8vIGV4dGVuZCBTdHJpbmcgYW5kIGNoYW5nZSAncmVwbGFjZScgKG5vdCB0aGF0IGl0IGlzIGNvbW1vbiBmb3IgYW55b25lIHRvXG4gIC8vIGV4dGVuZCBhbnl0aGluZyBleGNlcHQgT2JqZWN0KS5cbn07XG5cblxuLyoqXG4gKiBAcmV0dXJuIHtudW1iZXJ9IEFuIGludGVnZXIgdmFsdWUgcmVwcmVzZW50aW5nIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzXG4gKiAgICAgYmV0d2VlbiBtaWRuaWdodCwgSmFudWFyeSAxLCAxOTcwIGFuZCB0aGUgY3VycmVudCB0aW1lLlxuICovXG5nb29nLm5vdyA9IERhdGUubm93IHx8IChmdW5jdGlvbigpIHtcbiAgLy8gVW5hcnkgcGx1cyBvcGVyYXRvciBjb252ZXJ0cyBpdHMgb3BlcmFuZCB0byBhIG51bWJlciB3aGljaCBpbiB0aGUgY2FzZSBvZlxuICAvLyBhIGRhdGUgaXMgZG9uZSBieSBjYWxsaW5nIGdldFRpbWUoKS5cbiAgcmV0dXJuICtuZXcgRGF0ZSgpO1xufSk7XG5cblxuLyoqXG4gKiBFdmFscyBqYXZhc2NyaXB0IGluIHRoZSBnbG9iYWwgc2NvcGUuICBJbiBJRSB0aGlzIHVzZXMgZXhlY1NjcmlwdCwgb3RoZXJcbiAqIGJyb3dzZXJzIHVzZSBnb29nLmdsb2JhbC5ldmFsLiBJZiBnb29nLmdsb2JhbC5ldmFsIGRvZXMgbm90IGV2YWx1YXRlIGluIHRoZVxuICogZ2xvYmFsIHNjb3BlIChmb3IgZXhhbXBsZSwgaW4gU2FmYXJpKSwgYXBwZW5kcyBhIHNjcmlwdCB0YWcgaW5zdGVhZC5cbiAqIFRocm93cyBhbiBleGNlcHRpb24gaWYgbmVpdGhlciBleGVjU2NyaXB0IG9yIGV2YWwgaXMgZGVmaW5lZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzY3JpcHQgSmF2YVNjcmlwdCBzdHJpbmcuXG4gKi9cbmdvb2cuZ2xvYmFsRXZhbCA9IGZ1bmN0aW9uKHNjcmlwdCkge1xuICBpZiAoZ29vZy5nbG9iYWwuZXhlY1NjcmlwdCkge1xuICAgIGdvb2cuZ2xvYmFsLmV4ZWNTY3JpcHQoc2NyaXB0LCAnSmF2YVNjcmlwdCcpO1xuICB9IGVsc2UgaWYgKGdvb2cuZ2xvYmFsLmV2YWwpIHtcbiAgICAvLyBUZXN0IHRvIHNlZSBpZiBldmFsIHdvcmtzXG4gICAgaWYgKGdvb2cuZXZhbFdvcmtzRm9yR2xvYmFsc18gPT0gbnVsbCkge1xuICAgICAgZ29vZy5nbG9iYWwuZXZhbCgndmFyIF9ldF8gPSAxOycpO1xuICAgICAgaWYgKHR5cGVvZiBnb29nLmdsb2JhbFsnX2V0XyddICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGRlbGV0ZSBnb29nLmdsb2JhbFsnX2V0XyddO1xuICAgICAgICBnb29nLmV2YWxXb3Jrc0Zvckdsb2JhbHNfID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdvb2cuZXZhbFdvcmtzRm9yR2xvYmFsc18gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZ29vZy5ldmFsV29ya3NGb3JHbG9iYWxzXykge1xuICAgICAgZ29vZy5nbG9iYWwuZXZhbChzY3JpcHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZG9jID0gZ29vZy5nbG9iYWwuZG9jdW1lbnQ7XG4gICAgICB2YXIgc2NyaXB0RWx0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgc2NyaXB0RWx0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgIHNjcmlwdEVsdC5kZWZlciA9IGZhbHNlO1xuICAgICAgLy8gTm90ZSh1c2VyKTogY2FuJ3QgdXNlIC5pbm5lckhUTUwgc2luY2UgXCJ0KCc8dGVzdD4nKVwiIHdpbGwgZmFpbCBhbmRcbiAgICAgIC8vIC50ZXh0IGRvZXNuJ3Qgd29yayBpbiBTYWZhcmkgMi4gIFRoZXJlZm9yZSB3ZSBhcHBlbmQgYSB0ZXh0IG5vZGUuXG4gICAgICBzY3JpcHRFbHQuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKHNjcmlwdCkpO1xuICAgICAgZG9jLmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0RWx0KTtcbiAgICAgIGRvYy5ib2R5LnJlbW92ZUNoaWxkKHNjcmlwdEVsdCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IEVycm9yKCdnb29nLmdsb2JhbEV2YWwgbm90IGF2YWlsYWJsZScpO1xuICB9XG59O1xuXG5cbi8qKlxuICogSW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IHdlIGNhbiBjYWxsICdldmFsJyBkaXJlY3RseSB0byBldmFsIGNvZGUgaW4gdGhlXG4gKiBnbG9iYWwgc2NvcGUuIFNldCB0byBhIEJvb2xlYW4gYnkgdGhlIGZpcnN0IGNhbGwgdG8gZ29vZy5nbG9iYWxFdmFsICh3aGljaFxuICogZW1waXJpY2FsbHkgdGVzdHMgd2hldGhlciBldmFsIHdvcmtzIGZvciBnbG9iYWxzKS4gQHNlZSBnb29nLmdsb2JhbEV2YWxcbiAqIEB0eXBlIHs/Ym9vbGVhbn1cbiAqIEBwcml2YXRlXG4gKi9cbmdvb2cuZXZhbFdvcmtzRm9yR2xvYmFsc18gPSBudWxsO1xuXG5cbi8qKlxuICogT3B0aW9uYWwgbWFwIG9mIENTUyBjbGFzcyBuYW1lcyB0byBvYmZ1c2NhdGVkIG5hbWVzIHVzZWQgd2l0aFxuICogZ29vZy5nZXRDc3NOYW1lKCkuXG4gKiBAdHlwZSB7T2JqZWN0fHVuZGVmaW5lZH1cbiAqIEBwcml2YXRlXG4gKiBAc2VlIGdvb2cuc2V0Q3NzTmFtZU1hcHBpbmdcbiAqL1xuZ29vZy5jc3NOYW1lTWFwcGluZ187XG5cblxuLyoqXG4gKiBPcHRpb25hbCBvYmZ1c2NhdGlvbiBzdHlsZSBmb3IgQ1NTIGNsYXNzIG5hbWVzLiBTaG91bGQgYmUgc2V0IHRvIGVpdGhlclxuICogJ0JZX1dIT0xFJyBvciAnQllfUEFSVCcgaWYgZGVmaW5lZC5cbiAqIEB0eXBlIHtzdHJpbmd8dW5kZWZpbmVkfVxuICogQHByaXZhdGVcbiAqIEBzZWUgZ29vZy5zZXRDc3NOYW1lTWFwcGluZ1xuICovXG5nb29nLmNzc05hbWVNYXBwaW5nU3R5bGVfO1xuXG5cbi8qKlxuICogSGFuZGxlcyBzdHJpbmdzIHRoYXQgYXJlIGludGVuZGVkIHRvIGJlIHVzZWQgYXMgQ1NTIGNsYXNzIG5hbWVzLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gd29ya3MgaW4gdGFuZGVtIHdpdGggQHNlZSBnb29nLnNldENzc05hbWVNYXBwaW5nLlxuICpcbiAqIFdpdGhvdXQgYW55IG1hcHBpbmcgc2V0LCB0aGUgYXJndW1lbnRzIGFyZSBzaW1wbGUgam9pbmVkIHdpdGggYVxuICogaHlwaGVuIGFuZCBwYXNzZWQgdGhyb3VnaCB1bmFsdGVyZWQuXG4gKlxuICogV2hlbiB0aGVyZSBpcyBhIG1hcHBpbmcsIHRoZXJlIGFyZSB0d28gcG9zc2libGUgc3R5bGVzIGluIHdoaWNoXG4gKiB0aGVzZSBtYXBwaW5ncyBhcmUgdXNlZC4gSW4gdGhlIEJZX1BBUlQgc3R5bGUsIGVhY2ggcGFydCAoaS5lLiBpblxuICogYmV0d2VlbiBoeXBoZW5zKSBvZiB0aGUgcGFzc2VkIGluIGNzcyBuYW1lIGlzIHJld3JpdHRlbiBhY2NvcmRpbmdcbiAqIHRvIHRoZSBtYXAuIEluIHRoZSBCWV9XSE9MRSBzdHlsZSwgdGhlIGZ1bGwgY3NzIG5hbWUgaXMgbG9va2VkIHVwIGluXG4gKiB0aGUgbWFwIGRpcmVjdGx5LiBJZiBhIHJld3JpdGUgaXMgbm90IHNwZWNpZmllZCBieSB0aGUgbWFwLCB0aGVcbiAqIGNvbXBpbGVyIHdpbGwgb3V0cHV0IGEgd2FybmluZy5cbiAqXG4gKiBXaGVuIHRoZSBtYXBwaW5nIGlzIHBhc3NlZCB0byB0aGUgY29tcGlsZXIsIGl0IHdpbGwgcmVwbGFjZSBjYWxsc1xuICogdG8gZ29vZy5nZXRDc3NOYW1lIHdpdGggdGhlIHN0cmluZ3MgZnJvbSB0aGUgbWFwcGluZywgZS5nLlxuICogICAgIHZhciB4ID0gZ29vZy5nZXRDc3NOYW1lKCdmb28nKTtcbiAqICAgICB2YXIgeSA9IGdvb2cuZ2V0Q3NzTmFtZSh0aGlzLmJhc2VDbGFzcywgJ2FjdGl2ZScpO1xuICogIGJlY29tZXM6XG4gKiAgICAgdmFyIHg9ICdmb28nO1xuICogICAgIHZhciB5ID0gdGhpcy5iYXNlQ2xhc3MgKyAnLWFjdGl2ZSc7XG4gKlxuICogSWYgb25lIGFyZ3VtZW50IGlzIHBhc3NlZCBpdCB3aWxsIGJlIHByb2Nlc3NlZCwgaWYgdHdvIGFyZSBwYXNzZWRcbiAqIG9ubHkgdGhlIG1vZGlmaWVyIHdpbGwgYmUgcHJvY2Vzc2VkLCBhcyBpdCBpcyBhc3N1bWVkIHRoZSBmaXJzdFxuICogYXJndW1lbnQgd2FzIGdlbmVyYXRlZCBhcyBhIHJlc3VsdCBvZiBjYWxsaW5nIGdvb2cuZ2V0Q3NzTmFtZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lIFRoZSBjbGFzcyBuYW1lLlxuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfbW9kaWZpZXIgQSBtb2RpZmllciB0byBiZSBhcHBlbmRlZCB0byB0aGUgY2xhc3MgbmFtZS5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGNsYXNzIG5hbWUgb3IgdGhlIGNvbmNhdGVuYXRpb24gb2YgdGhlIGNsYXNzIG5hbWUgYW5kXG4gKiAgICAgdGhlIG1vZGlmaWVyLlxuICovXG5nb29nLmdldENzc05hbWUgPSBmdW5jdGlvbihjbGFzc05hbWUsIG9wdF9tb2RpZmllcikge1xuICB2YXIgZ2V0TWFwcGluZyA9IGZ1bmN0aW9uKGNzc05hbWUpIHtcbiAgICByZXR1cm4gZ29vZy5jc3NOYW1lTWFwcGluZ19bY3NzTmFtZV0gfHwgY3NzTmFtZTtcbiAgfTtcblxuICB2YXIgcmVuYW1lQnlQYXJ0cyA9IGZ1bmN0aW9uKGNzc05hbWUpIHtcbiAgICAvLyBSZW1hcCBhbGwgdGhlIHBhcnRzIGluZGl2aWR1YWxseS5cbiAgICB2YXIgcGFydHMgPSBjc3NOYW1lLnNwbGl0KCctJyk7XG4gICAgdmFyIG1hcHBlZCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG1hcHBlZC5wdXNoKGdldE1hcHBpbmcocGFydHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcHBlZC5qb2luKCctJyk7XG4gIH07XG5cbiAgdmFyIHJlbmFtZTtcbiAgaWYgKGdvb2cuY3NzTmFtZU1hcHBpbmdfKSB7XG4gICAgcmVuYW1lID0gZ29vZy5jc3NOYW1lTWFwcGluZ1N0eWxlXyA9PSAnQllfV0hPTEUnID9cbiAgICAgICAgZ2V0TWFwcGluZyA6IHJlbmFtZUJ5UGFydHM7XG4gIH0gZWxzZSB7XG4gICAgcmVuYW1lID0gZnVuY3Rpb24oYSkge1xuICAgICAgcmV0dXJuIGE7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChvcHRfbW9kaWZpZXIpIHtcbiAgICByZXR1cm4gY2xhc3NOYW1lICsgJy0nICsgcmVuYW1lKG9wdF9tb2RpZmllcik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJlbmFtZShjbGFzc05hbWUpO1xuICB9XG59O1xuXG5cbi8qKlxuICogU2V0cyB0aGUgbWFwIHRvIGNoZWNrIHdoZW4gcmV0dXJuaW5nIGEgdmFsdWUgZnJvbSBnb29nLmdldENzc05hbWUoKS4gRXhhbXBsZTpcbiAqIDxwcmU+XG4gKiBnb29nLnNldENzc05hbWVNYXBwaW5nKHtcbiAqICAgXCJnb29nXCI6IFwiYVwiLFxuICogICBcImRpc2FibGVkXCI6IFwiYlwiLFxuICogfSk7XG4gKlxuICogdmFyIHggPSBnb29nLmdldENzc05hbWUoJ2dvb2cnKTtcbiAqIC8vIFRoZSBmb2xsb3dpbmcgZXZhbHVhdGVzIHRvOiBcImEgYS1iXCIuXG4gKiBnb29nLmdldENzc05hbWUoJ2dvb2cnKSArICcgJyArIGdvb2cuZ2V0Q3NzTmFtZSh4LCAnZGlzYWJsZWQnKVxuICogPC9wcmU+XG4gKiBXaGVuIGRlY2xhcmVkIGFzIGEgbWFwIG9mIHN0cmluZyBsaXRlcmFscyB0byBzdHJpbmcgbGl0ZXJhbHMsIHRoZSBKU0NvbXBpbGVyXG4gKiB3aWxsIHJlcGxhY2UgYWxsIGNhbGxzIHRvIGdvb2cuZ2V0Q3NzTmFtZSgpIHVzaW5nIHRoZSBzdXBwbGllZCBtYXAgaWYgdGhlXG4gKiAtLWNsb3N1cmVfcGFzcyBmbGFnIGlzIHNldC5cbiAqXG4gKiBAcGFyYW0geyFPYmplY3R9IG1hcHBpbmcgQSBtYXAgb2Ygc3RyaW5ncyB0byBzdHJpbmdzIHdoZXJlIGtleXMgYXJlIHBvc3NpYmxlXG4gKiAgICAgYXJndW1lbnRzIHRvIGdvb2cuZ2V0Q3NzTmFtZSgpIGFuZCB2YWx1ZXMgYXJlIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlc1xuICogICAgIHRoYXQgc2hvdWxkIGJlIHJldHVybmVkLlxuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfc3R5bGUgVGhlIHN0eWxlIG9mIGNzcyBuYW1lIG1hcHBpbmcuIFRoZXJlIGFyZSB0d28gdmFsaWRcbiAqICAgICBvcHRpb25zOiAnQllfUEFSVCcsIGFuZCAnQllfV0hPTEUnLlxuICogQHNlZSBnb29nLmdldENzc05hbWUgZm9yIGEgZGVzY3JpcHRpb24uXG4gKi9cbmdvb2cuc2V0Q3NzTmFtZU1hcHBpbmcgPSBmdW5jdGlvbihtYXBwaW5nLCBvcHRfc3R5bGUpIHtcbiAgZ29vZy5jc3NOYW1lTWFwcGluZ18gPSBtYXBwaW5nO1xuICBnb29nLmNzc05hbWVNYXBwaW5nU3R5bGVfID0gb3B0X3N0eWxlO1xufTtcblxuXG4vKipcbiAqIFRvIHVzZSBDU1MgcmVuYW1pbmcgaW4gY29tcGlsZWQgbW9kZSwgb25lIG9mIHRoZSBpbnB1dCBmaWxlcyBzaG91bGQgaGF2ZSBhXG4gKiBjYWxsIHRvIGdvb2cuc2V0Q3NzTmFtZU1hcHBpbmcoKSB3aXRoIGFuIG9iamVjdCBsaXRlcmFsIHRoYXQgdGhlIEpTQ29tcGlsZXJcbiAqIGNhbiBleHRyYWN0IGFuZCB1c2UgdG8gcmVwbGFjZSBhbGwgY2FsbHMgdG8gZ29vZy5nZXRDc3NOYW1lKCkuIEluIHVuY29tcGlsZWRcbiAqIG1vZGUsIEphdmFTY3JpcHQgY29kZSBzaG91bGQgYmUgbG9hZGVkIGJlZm9yZSB0aGlzIGJhc2UuanMgZmlsZSB0aGF0IGRlY2xhcmVzXG4gKiBhIGdsb2JhbCB2YXJpYWJsZSwgQ0xPU1VSRV9DU1NfTkFNRV9NQVBQSU5HLCB3aGljaCBpcyB1c2VkIGJlbG93LiBUaGlzIGlzXG4gKiB0byBlbnN1cmUgdGhhdCB0aGUgbWFwcGluZyBpcyBsb2FkZWQgYmVmb3JlIGFueSBjYWxscyB0byBnb29nLmdldENzc05hbWUoKVxuICogYXJlIG1hZGUgaW4gdW5jb21waWxlZCBtb2RlLlxuICpcbiAqIEEgaG9vayBmb3Igb3ZlcnJpZGluZyB0aGUgQ1NTIG5hbWUgbWFwcGluZy5cbiAqIEB0eXBlIHtPYmplY3R8dW5kZWZpbmVkfVxuICovXG5nb29nLmdsb2JhbC5DTE9TVVJFX0NTU19OQU1FX01BUFBJTkc7XG5cblxuaWYgKCFDT01QSUxFRCAmJiBnb29nLmdsb2JhbC5DTE9TVVJFX0NTU19OQU1FX01BUFBJTkcpIHtcbiAgLy8gVGhpcyBkb2VzIG5vdCBjYWxsIGdvb2cuc2V0Q3NzTmFtZU1hcHBpbmcoKSBiZWNhdXNlIHRoZSBKU0NvbXBpbGVyXG4gIC8vIHJlcXVpcmVzIHRoYXQgZ29vZy5zZXRDc3NOYW1lTWFwcGluZygpIGJlIGNhbGxlZCB3aXRoIGFuIG9iamVjdCBsaXRlcmFsLlxuICBnb29nLmNzc05hbWVNYXBwaW5nXyA9IGdvb2cuZ2xvYmFsLkNMT1NVUkVfQ1NTX05BTUVfTUFQUElORztcbn1cblxuXG4vKipcbiAqIEFic3RyYWN0IGltcGxlbWVudGF0aW9uIG9mIGdvb2cuZ2V0TXNnIGZvciB1c2Ugd2l0aCBsb2NhbGl6ZWQgbWVzc2FnZXMuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIFRyYW5zbGF0YWJsZSBzdHJpbmcsIHBsYWNlcyBob2xkZXJzIGluIHRoZSBmb3JtIHskZm9vfS5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3ZhbHVlcyBNYXAgb2YgcGxhY2UgaG9sZGVyIG5hbWUgdG8gdmFsdWUuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IG1lc3NhZ2Ugd2l0aCBwbGFjZWhvbGRlcnMgZmlsbGVkLlxuICovXG5nb29nLmdldE1zZyA9IGZ1bmN0aW9uKHN0ciwgb3B0X3ZhbHVlcykge1xuICB2YXIgdmFsdWVzID0gb3B0X3ZhbHVlcyB8fCB7fTtcbiAgZm9yICh2YXIga2V5IGluIHZhbHVlcykge1xuICAgIHZhciB2YWx1ZSA9ICgnJyArIHZhbHVlc1trZXldKS5yZXBsYWNlKC9cXCQvZywgJyQkJCQnKTtcbiAgICBzdHIgPSBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxce1xcXFwkJyArIGtleSArICdcXFxcfScsICdnaScpLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLyoqXG4gKiBFeHBvc2VzIGFuIHVub2JmdXNjYXRlZCBnbG9iYWwgbmFtZXNwYWNlIHBhdGggZm9yIHRoZSBnaXZlbiBvYmplY3QuXG4gKiBOb3RlIHRoYXQgZmllbGRzIG9mIHRoZSBleHBvcnRlZCBvYmplY3QgKndpbGwqIGJlIG9iZnVzY2F0ZWQsXG4gKiB1bmxlc3MgdGhleSBhcmUgZXhwb3J0ZWQgaW4gdHVybiB2aWEgdGhpcyBmdW5jdGlvbiBvclxuICogZ29vZy5leHBvcnRQcm9wZXJ0eVxuICpcbiAqIDxwPkFsc28gaGFuZHkgZm9yIG1ha2luZyBwdWJsaWMgaXRlbXMgdGhhdCBhcmUgZGVmaW5lZCBpbiBhbm9ueW1vdXNcbiAqIGNsb3N1cmVzLlxuICpcbiAqIGV4LiBnb29nLmV4cG9ydFN5bWJvbCgncHVibGljLnBhdGguRm9vJywgRm9vKTtcbiAqXG4gKiBleC4gZ29vZy5leHBvcnRTeW1ib2woJ3B1YmxpYy5wYXRoLkZvby5zdGF0aWNGdW5jdGlvbicsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgRm9vLnN0YXRpY0Z1bmN0aW9uKTtcbiAqICAgICBwdWJsaWMucGF0aC5Gb28uc3RhdGljRnVuY3Rpb24oKTtcbiAqXG4gKiBleC4gZ29vZy5leHBvcnRTeW1ib2woJ3B1YmxpYy5wYXRoLkZvby5wcm90b3R5cGUubXlNZXRob2QnLFxuICogICAgICAgICAgICAgICAgICAgICAgIEZvby5wcm90b3R5cGUubXlNZXRob2QpO1xuICogICAgIG5ldyBwdWJsaWMucGF0aC5Gb28oKS5teU1ldGhvZCgpO1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwdWJsaWNQYXRoIFVub2JmdXNjYXRlZCBuYW1lIHRvIGV4cG9ydC5cbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IE9iamVjdCB0aGUgbmFtZSBzaG91bGQgcG9pbnQgdG8uXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9vYmplY3RUb0V4cG9ydFRvIFRoZSBvYmplY3QgdG8gYWRkIHRoZSBwYXRoIHRvOyBkZWZhdWx0XG4gKiAgICAgaXMgfGdvb2cuZ2xvYmFsfC5cbiAqL1xuZ29vZy5leHBvcnRTeW1ib2wgPSBmdW5jdGlvbihwdWJsaWNQYXRoLCBvYmplY3QsIG9wdF9vYmplY3RUb0V4cG9ydFRvKSB7XG4gIGdvb2cuZXhwb3J0UGF0aF8ocHVibGljUGF0aCwgb2JqZWN0LCBvcHRfb2JqZWN0VG9FeHBvcnRUbyk7XG59O1xuXG5cbi8qKlxuICogRXhwb3J0cyBhIHByb3BlcnR5IHVub2JmdXNjYXRlZCBpbnRvIHRoZSBvYmplY3QncyBuYW1lc3BhY2UuXG4gKiBleC4gZ29vZy5leHBvcnRQcm9wZXJ0eShGb28sICdzdGF0aWNGdW5jdGlvbicsIEZvby5zdGF0aWNGdW5jdGlvbik7XG4gKiBleC4gZ29vZy5leHBvcnRQcm9wZXJ0eShGb28ucHJvdG90eXBlLCAnbXlNZXRob2QnLCBGb28ucHJvdG90eXBlLm15TWV0aG9kKTtcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgT2JqZWN0IHdob3NlIHN0YXRpYyBwcm9wZXJ0eSBpcyBiZWluZyBleHBvcnRlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwdWJsaWNOYW1lIFVub2JmdXNjYXRlZCBuYW1lIHRvIGV4cG9ydC5cbiAqIEBwYXJhbSB7Kn0gc3ltYm9sIE9iamVjdCB0aGUgbmFtZSBzaG91bGQgcG9pbnQgdG8uXG4gKi9cbmdvb2cuZXhwb3J0UHJvcGVydHkgPSBmdW5jdGlvbihvYmplY3QsIHB1YmxpY05hbWUsIHN5bWJvbCkge1xuICBvYmplY3RbcHVibGljTmFtZV0gPSBzeW1ib2w7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFVzYWdlOlxuICogPHByZT5cbiAqIGZ1bmN0aW9uIFBhcmVudENsYXNzKGEsIGIpIHsgfVxuICogUGFyZW50Q2xhc3MucHJvdG90eXBlLmZvbyA9IGZ1bmN0aW9uKGEpIHsgfVxuICpcbiAqIGZ1bmN0aW9uIENoaWxkQ2xhc3MoYSwgYiwgYykge1xuICogICBnb29nLmJhc2UodGhpcywgYSwgYik7XG4gKiB9XG4gKiBnb29nLmluaGVyaXRzKENoaWxkQ2xhc3MsIFBhcmVudENsYXNzKTtcbiAqXG4gKiB2YXIgY2hpbGQgPSBuZXcgQ2hpbGRDbGFzcygnYScsICdiJywgJ3NlZScpO1xuICogY2hpbGQuZm9vKCk7IC8vIHdvcmtzXG4gKiA8L3ByZT5cbiAqXG4gKiBJbiBhZGRpdGlvbiwgYSBzdXBlcmNsYXNzJyBpbXBsZW1lbnRhdGlvbiBvZiBhIG1ldGhvZCBjYW4gYmUgaW52b2tlZFxuICogYXMgZm9sbG93czpcbiAqXG4gKiA8cHJlPlxuICogQ2hpbGRDbGFzcy5wcm90b3R5cGUuZm9vID0gZnVuY3Rpb24oYSkge1xuICogICBDaGlsZENsYXNzLnN1cGVyQ2xhc3NfLmZvby5jYWxsKHRoaXMsIGEpO1xuICogICAvLyBvdGhlciBjb2RlXG4gKiB9O1xuICogPC9wcmU+XG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2hpbGRDdG9yIENoaWxkIGNsYXNzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcGFyZW50Q3RvciBQYXJlbnQgY2xhc3MuXG4gKi9cbmdvb2cuaW5oZXJpdHMgPSBmdW5jdGlvbihjaGlsZEN0b3IsIHBhcmVudEN0b3IpIHtcbiAgLyoqIEBjb25zdHJ1Y3RvciAqL1xuICBmdW5jdGlvbiB0ZW1wQ3RvcigpIHt9O1xuICB0ZW1wQ3Rvci5wcm90b3R5cGUgPSBwYXJlbnRDdG9yLnByb3RvdHlwZTtcbiAgY2hpbGRDdG9yLnN1cGVyQ2xhc3NfID0gcGFyZW50Q3Rvci5wcm90b3R5cGU7XG4gIGNoaWxkQ3Rvci5wcm90b3R5cGUgPSBuZXcgdGVtcEN0b3IoKTtcbiAgY2hpbGRDdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGNoaWxkQ3Rvcjtcbn07XG5cblxuLyoqXG4gKiBDYWxsIHVwIHRvIHRoZSBzdXBlcmNsYXNzLlxuICpcbiAqIElmIHRoaXMgaXMgY2FsbGVkIGZyb20gYSBjb25zdHJ1Y3RvciwgdGhlbiB0aGlzIGNhbGxzIHRoZSBzdXBlcmNsYXNzXG4gKiBjb250cnVjdG9yIHdpdGggYXJndW1lbnRzIDEtTi5cbiAqXG4gKiBJZiB0aGlzIGlzIGNhbGxlZCBmcm9tIGEgcHJvdG90eXBlIG1ldGhvZCwgdGhlbiB5b3UgbXVzdCBwYXNzXG4gKiB0aGUgbmFtZSBvZiB0aGUgbWV0aG9kIGFzIHRoZSBzZWNvbmQgYXJndW1lbnQgdG8gdGhpcyBmdW5jdGlvbi4gSWZcbiAqIHlvdSBkbyBub3QsIHlvdSB3aWxsIGdldCBhIHJ1bnRpbWUgZXJyb3IuIFRoaXMgY2FsbHMgdGhlIHN1cGVyY2xhc3MnXG4gKiBtZXRob2Qgd2l0aCBhcmd1bWVudHMgMi1OLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gb25seSB3b3JrcyBpZiB5b3UgdXNlIGdvb2cuaW5oZXJpdHMgdG8gZXhwcmVzc1xuICogaW5oZXJpdGFuY2UgcmVsYXRpb25zaGlwcyBiZXR3ZWVuIHlvdXIgY2xhc3Nlcy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGEgY29tcGlsZXIgcHJpbWl0aXZlLiBBdCBjb21waWxlLXRpbWUsIHRoZVxuICogY29tcGlsZXIgd2lsbCBkbyBtYWNybyBleHBhbnNpb24gdG8gcmVtb3ZlIGEgbG90IG9mXG4gKiB0aGUgZXh0cmEgb3ZlcmhlYWQgdGhhdCB0aGlzIGZ1bmN0aW9uIGludHJvZHVjZXMuIFRoZSBjb21waWxlclxuICogd2lsbCBhbHNvIGVuZm9yY2UgYSBsb3Qgb2YgdGhlIGFzc3VtcHRpb25zIHRoYXQgdGhpcyBmdW5jdGlvblxuICogbWFrZXMsIGFuZCB0cmVhdCBpdCBhcyBhIGNvbXBpbGVyIGVycm9yIGlmIHlvdSBicmVhayB0aGVtLlxuICpcbiAqIEBwYXJhbSB7IU9iamVjdH0gbWUgU2hvdWxkIGFsd2F5cyBiZSBcInRoaXNcIi5cbiAqIEBwYXJhbSB7Kj19IG9wdF9tZXRob2ROYW1lIFRoZSBtZXRob2QgbmFtZSBpZiBjYWxsaW5nIGEgc3VwZXIgbWV0aG9kLlxuICogQHBhcmFtIHsuLi4qfSB2YXJfYXJncyBUaGUgcmVzdCBvZiB0aGUgYXJndW1lbnRzLlxuICogQHJldHVybiB7Kn0gVGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgc3VwZXJjbGFzcyBtZXRob2QuXG4gKi9cbmdvb2cuYmFzZSA9IGZ1bmN0aW9uKG1lLCBvcHRfbWV0aG9kTmFtZSwgdmFyX2FyZ3MpIHtcbiAgdmFyIGNhbGxlciA9IGFyZ3VtZW50cy5jYWxsZWUuY2FsbGVyO1xuICBpZiAoY2FsbGVyLnN1cGVyQ2xhc3NfKSB7XG4gICAgLy8gVGhpcyBpcyBhIGNvbnN0cnVjdG9yLiBDYWxsIHRoZSBzdXBlcmNsYXNzIGNvbnN0cnVjdG9yLlxuICAgIHJldHVybiBjYWxsZXIuc3VwZXJDbGFzc18uY29uc3RydWN0b3IuYXBwbHkoXG4gICAgICAgIG1lLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfVxuXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgdmFyIGZvdW5kQ2FsbGVyID0gZmFsc2U7XG4gIGZvciAodmFyIGN0b3IgPSBtZS5jb25zdHJ1Y3RvcjtcbiAgICAgICBjdG9yOyBjdG9yID0gY3Rvci5zdXBlckNsYXNzXyAmJiBjdG9yLnN1cGVyQ2xhc3NfLmNvbnN0cnVjdG9yKSB7XG4gICAgaWYgKGN0b3IucHJvdG90eXBlW29wdF9tZXRob2ROYW1lXSA9PT0gY2FsbGVyKSB7XG4gICAgICBmb3VuZENhbGxlciA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChmb3VuZENhbGxlcikge1xuICAgICAgcmV0dXJuIGN0b3IucHJvdG90eXBlW29wdF9tZXRob2ROYW1lXS5hcHBseShtZSwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgd2UgZGlkIG5vdCBmaW5kIHRoZSBjYWxsZXIgaW4gdGhlIHByb3RvdHlwZSBjaGFpbixcbiAgLy8gdGhlbiBvbmUgb2YgdHdvIHRoaW5ncyBoYXBwZW5lZDpcbiAgLy8gMSkgVGhlIGNhbGxlciBpcyBhbiBpbnN0YW5jZSBtZXRob2QuXG4gIC8vIDIpIFRoaXMgbWV0aG9kIHdhcyBub3QgY2FsbGVkIGJ5IHRoZSByaWdodCBjYWxsZXIuXG4gIGlmIChtZVtvcHRfbWV0aG9kTmFtZV0gPT09IGNhbGxlcikge1xuICAgIHJldHVybiBtZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGVbb3B0X21ldGhvZE5hbWVdLmFwcGx5KG1lLCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgJ2dvb2cuYmFzZSBjYWxsZWQgZnJvbSBhIG1ldGhvZCBvZiBvbmUgbmFtZSAnICtcbiAgICAgICAgJ3RvIGEgbWV0aG9kIG9mIGEgZGlmZmVyZW50IG5hbWUnKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIEFsbG93IGZvciBhbGlhc2luZyB3aXRoaW4gc2NvcGUgZnVuY3Rpb25zLiAgVGhpcyBmdW5jdGlvbiBleGlzdHMgZm9yXG4gKiB1bmNvbXBpbGVkIGNvZGUgLSBpbiBjb21waWxlZCBjb2RlIHRoZSBjYWxscyB3aWxsIGJlIGlubGluZWQgYW5kIHRoZVxuICogYWxpYXNlcyBhcHBsaWVkLiAgSW4gdW5jb21waWxlZCBjb2RlIHRoZSBmdW5jdGlvbiBpcyBzaW1wbHkgcnVuIHNpbmNlIHRoZVxuICogYWxpYXNlcyBhcyB3cml0dGVuIGFyZSB2YWxpZCBKYXZhU2NyaXB0LlxuICogQHBhcmFtIHtmdW5jdGlvbigpfSBmbiBGdW5jdGlvbiB0byBjYWxsLiAgVGhpcyBmdW5jdGlvbiBjYW4gY29udGFpbiBhbGlhc2VzXG4gKiAgICAgdG8gbmFtZXNwYWNlcyAoZS5nLiBcInZhciBkb20gPSBnb29nLmRvbVwiKSBvciBjbGFzc2VzXG4gKiAgICAoZS5nLiBcInZhciBUaW1lciA9IGdvb2cuVGltZXJcIikuXG4gKi9cbmdvb2cuc2NvcGUgPSBmdW5jdGlvbihmbikge1xuICBmbi5jYWxsKGdvb2cuZ2xvYmFsKTtcbn07XG5cblxuIiwiLyoqXG4gKiBkZWZpbmVzXG4gKi9cblxuZ29vZy5wcm92aWRlKCdVU0VfVFlQRURBUlJBWScpO1xuXG4vLyBTYWZhcmkg44GMIHR5cGVvZiBVaW50OEFycmF5ID09PSAnb2JqZWN0JyDjgavjgarjgovjgZ/jgoHjgIFcbi8vIOacquWumue+qeOBi+WQpuOBi+OBpyBUeXBlZCBBcnJheSDjga7kvb/nlKjjgpLmsbrlrprjgZnjgotcblxuLyoqIEBjb25zdCB7Ym9vbGVhbn0gdXNlIHR5cGVkIGFycmF5IGZsYWcuICovXG52YXIgVVNFX1RZUEVEQVJSQVkgPVxuICAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSAmJlxuICAodHlwZW9mIFVpbnQxNkFycmF5ICE9PSAndW5kZWZpbmVkJykgJiZcbiAgKHR5cGVvZiBVaW50MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcpICYmXG4gICh0eXBlb2YgRGF0YVZpZXcgIT09ICd1bmRlZmluZWQnKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBiaXQg5Y2Y5L2N44Gn44Gu5pu444GN6L6844G/5a6f6KOFLlxuICovXG5nb29nLnByb3ZpZGUoJ1psaWIuQml0U3RyZWFtJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiDjg5Pjg4Pjg4jjgrnjg4jjg6rjg7zjg6BcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHshKEFycmF5fFVpbnQ4QXJyYXkpPX0gYnVmZmVyIG91dHB1dCBidWZmZXIuXG4gKiBAcGFyYW0ge251bWJlcj19IGJ1ZmZlclBvc2l0aW9uIHN0YXJ0IGJ1ZmZlciBwb2ludGVyLlxuICovXG5abGliLkJpdFN0cmVhbSA9IGZ1bmN0aW9uKGJ1ZmZlciwgYnVmZmVyUG9zaXRpb24pIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJ1ZmZlciBpbmRleC4gKi9cbiAgdGhpcy5pbmRleCA9IHR5cGVvZiBidWZmZXJQb3NpdGlvbiA9PT0gJ251bWJlcicgPyBidWZmZXJQb3NpdGlvbiA6IDA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBiaXQgaW5kZXguICovXG4gIHRoaXMuYml0aW5kZXggPSAwO1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IGJpdC1zdHJlYW0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5idWZmZXIgPSBidWZmZXIgaW5zdGFuY2VvZiAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpID9cbiAgICBidWZmZXIgOlxuICAgIG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKFpsaWIuQml0U3RyZWFtLkRlZmF1bHRCbG9ja1NpemUpO1xuXG4gIC8vIOWFpeWKm+OBleOCjOOBnyBpbmRleCDjgYzotrPjgorjgarjgYvjgaPjgZ/jgonmi6HlvLXjgZnjgovjgYzjgIHlgI3jgavjgZfjgabjgoLjg4Djg6HjgarjgonkuI3mraPjgajjgZnjgotcbiAgaWYgKHRoaXMuYnVmZmVyLmxlbmd0aCAqIDIgPD0gdGhpcy5pbmRleCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgaW5kZXhcIik7XG4gIH0gZWxzZSBpZiAodGhpcy5idWZmZXIubGVuZ3RoIDw9IHRoaXMuaW5kZXgpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigpO1xuICB9XG59O1xuXG4vKipcbiAqIOODh+ODleOCqeODq+ODiOODluODreODg+OCr+OCteOCpOOCui5cbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn1cbiAqL1xuWmxpYi5CaXRTdHJlYW0uRGVmYXVsdEJsb2NrU2l6ZSA9IDB4ODAwMDtcblxuLyoqXG4gKiBleHBhbmQgYnVmZmVyLlxuICogQHJldHVybiB7IShBcnJheXxVaW50OEFycmF5KX0gbmV3IGJ1ZmZlci5cbiAqL1xuWmxpYi5CaXRTdHJlYW0ucHJvdG90eXBlLmV4cGFuZEJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IG9sZCBidWZmZXIuICovXG4gIHZhciBvbGRidWYgPSB0aGlzLmJ1ZmZlcjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGxpbWl0ZXIuICovXG4gIHZhciBpbCA9IG9sZGJ1Zi5sZW5ndGg7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gbmV3IGJ1ZmZlci4gKi9cbiAgdmFyIGJ1ZmZlciA9XG4gICAgbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoaWwgPDwgMSk7XG5cbiAgLy8gY29weSBidWZmZXJcbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgYnVmZmVyLnNldChvbGRidWYpO1xuICB9IGVsc2Uge1xuICAgIC8vIFhYWDogbG9vcCB1bnJvbGxpbmdcbiAgICBmb3IgKGkgPSAwOyBpIDwgaWw7ICsraSkge1xuICAgICAgYnVmZmVyW2ldID0gb2xkYnVmW2ldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAodGhpcy5idWZmZXIgPSBidWZmZXIpO1xufTtcblxuXG4vKipcbiAqIOaVsOWApOOCkuODk+ODg+ODiOOBp+aMh+WumuOBl+OBn+aVsOOBoOOBkeabuOOBjei+vOOCgC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXIg5pu444GN6L6844KA5pWw5YCkLlxuICogQHBhcmFtIHtudW1iZXJ9IG4g5pu444GN6L6844KA44OT44OD44OI5pWwLlxuICogQHBhcmFtIHtib29sZWFuPX0gcmV2ZXJzZSDpgIbpoIbjgavmm7jjgY3ovrzjgoDjgarjgonjgbAgdHJ1ZS5cbiAqL1xuWmxpYi5CaXRTdHJlYW0ucHJvdG90eXBlLndyaXRlQml0cyA9IGZ1bmN0aW9uKG51bWJlciwgbiwgcmV2ZXJzZSkge1xuICB2YXIgYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gIHZhciBpbmRleCA9IHRoaXMuaW5kZXg7XG4gIHZhciBiaXRpbmRleCA9IHRoaXMuYml0aW5kZXg7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGN1cnJlbnQgb2N0ZXQuICovXG4gIHZhciBjdXJyZW50ID0gYnVmZmVyW2luZGV4XTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGk7XG5cbiAgLyoqXG4gICAqIDMyLWJpdCDmlbTmlbDjga7jg5Pjg4Pjg4jpoIbjgpLpgIbjgavjgZnjgotcbiAgICogQHBhcmFtIHtudW1iZXJ9IG4gMzItYml0IGludGVnZXIuXG4gICAqIEByZXR1cm4ge251bWJlcn0gcmV2ZXJzZWQgMzItYml0IGludGVnZXIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiByZXYzMl8obikge1xuICAgIHJldHVybiAoWmxpYi5CaXRTdHJlYW0uUmV2ZXJzZVRhYmxlW24gJiAweEZGXSA8PCAyNCkgfFxuICAgICAgKFpsaWIuQml0U3RyZWFtLlJldmVyc2VUYWJsZVtuID4+PiA4ICYgMHhGRl0gPDwgMTYpIHxcbiAgICAgIChabGliLkJpdFN0cmVhbS5SZXZlcnNlVGFibGVbbiA+Pj4gMTYgJiAweEZGXSA8PCA4KSB8XG4gICAgICBabGliLkJpdFN0cmVhbS5SZXZlcnNlVGFibGVbbiA+Pj4gMjQgJiAweEZGXTtcbiAgfVxuXG4gIGlmIChyZXZlcnNlICYmIG4gPiAxKSB7XG4gICAgbnVtYmVyID0gbiA+IDggP1xuICAgICAgcmV2MzJfKG51bWJlcikgPj4gKDMyIC0gbikgOlxuICAgICAgWmxpYi5CaXRTdHJlYW0uUmV2ZXJzZVRhYmxlW251bWJlcl0gPj4gKDggLSBuKTtcbiAgfVxuXG4gIC8vIEJ5dGUg5aKD55WM44KS6LaF44GI44Gq44GE44Go44GNXG4gIGlmIChuICsgYml0aW5kZXggPCA4KSB7XG4gICAgY3VycmVudCA9IChjdXJyZW50IDw8IG4pIHwgbnVtYmVyO1xuICAgIGJpdGluZGV4ICs9IG47XG4gIC8vIEJ5dGUg5aKD55WM44KS6LaF44GI44KL44Go44GNXG4gIH0gZWxzZSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgY3VycmVudCA9IChjdXJyZW50IDw8IDEpIHwgKChudW1iZXIgPj4gbiAtIGkgLSAxKSAmIDEpO1xuXG4gICAgICAvLyBuZXh0IGJ5dGVcbiAgICAgIGlmICgrK2JpdGluZGV4ID09PSA4KSB7XG4gICAgICAgIGJpdGluZGV4ID0gMDtcbiAgICAgICAgYnVmZmVyW2luZGV4KytdID0gWmxpYi5CaXRTdHJlYW0uUmV2ZXJzZVRhYmxlW2N1cnJlbnRdO1xuICAgICAgICBjdXJyZW50ID0gMDtcblxuICAgICAgICAvLyBleHBhbmRcbiAgICAgICAgaWYgKGluZGV4ID09PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgYnVmZmVyID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBidWZmZXJbaW5kZXhdID0gY3VycmVudDtcblxuICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgdGhpcy5iaXRpbmRleCA9IGJpdGluZGV4O1xuICB0aGlzLmluZGV4ID0gaW5kZXg7XG59O1xuXG5cbi8qKlxuICog44K544OI44Oq44O844Og44Gu57WC56uv5Yem55CG44KS6KGM44GGXG4gKiBAcmV0dXJuIHshKEFycmF5fFVpbnQ4QXJyYXkpfSDntYLnq6/lh6bnkIblvozjga7jg5Djg4Pjg5XjgqHjgpIgYnl0ZSBhcnJheSDjgafov5TjgZkuXG4gKi9cblpsaWIuQml0U3RyZWFtLnByb3RvdHlwZS5maW5pc2ggPSBmdW5jdGlvbigpIHtcbiAgdmFyIGJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICB2YXIgaW5kZXggPSB0aGlzLmluZGV4O1xuXG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdmFyIG91dHB1dDtcblxuICAvLyBiaXRpbmRleCDjgYwgMCDjga7mmYLjga/kvZnliIbjgasgaW5kZXgg44GM6YCy44KT44Gn44GE44KL54q25oWLXG4gIGlmICh0aGlzLmJpdGluZGV4ID4gMCkge1xuICAgIGJ1ZmZlcltpbmRleF0gPDw9IDggLSB0aGlzLmJpdGluZGV4O1xuICAgIGJ1ZmZlcltpbmRleF0gPSBabGliLkJpdFN0cmVhbS5SZXZlcnNlVGFibGVbYnVmZmVyW2luZGV4XV07XG4gICAgaW5kZXgrKztcbiAgfVxuXG4gIC8vIGFycmF5IHRydW5jYXRpb25cbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgb3V0cHV0ID0gYnVmZmVyLnN1YmFycmF5KDAsIGluZGV4KTtcbiAgfSBlbHNlIHtcbiAgICBidWZmZXIubGVuZ3RoID0gaW5kZXg7XG4gICAgb3V0cHV0ID0gYnVmZmVyO1xuICB9XG5cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogMC0yNTUg44Gu44OT44OD44OI6aCG44KS5Y+N6Lui44GX44Gf44OG44O844OW44OrXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfVxuICovXG5abGliLkJpdFN0cmVhbS5SZXZlcnNlVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIHRhYmxlO1xufSkoKGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IHJldmVyc2UgdGFibGUuICovXG4gIHZhciB0YWJsZSA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKDI1Nik7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBpO1xuXG4gIC8vIGdlbmVyYXRlXG4gIGZvciAoaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICAgIHRhYmxlW2ldID0gKGZ1bmN0aW9uKG4pIHtcbiAgICAgIHZhciByID0gbjtcbiAgICAgIHZhciBzID0gNztcblxuICAgICAgZm9yIChuID4+Pj0gMTsgbjsgbiA+Pj49IDEpIHtcbiAgICAgICAgciA8PD0gMTtcbiAgICAgICAgciB8PSBuICYgMTtcbiAgICAgICAgLS1zO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKHIgPDwgcyAmIDB4ZmYpID4+PiAwO1xuICAgIH0pKGkpO1xuICB9XG5cbiAgcmV0dXJuIHRhYmxlO1xufSkoKSk7XG5cblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENSQzMyIOWun+ijhS5cbiAqL1xuZ29vZy5wcm92aWRlKCdabGliLkNSQzMyJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcblxuLyoqIEBkZWZpbmUge2Jvb2xlYW59ICovXG52YXIgWkxJQl9DUkMzMl9DT01QQUNUID0gZmFsc2U7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQ1JDMzIg44OP44OD44K344Ol5YCk44KS5Y+W5b6XXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGRhdGEgZGF0YSBieXRlIGFycmF5LlxuICogQHBhcmFtIHtudW1iZXI9fSBwb3MgZGF0YSBwb3NpdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyPX0gbGVuZ3RoIGRhdGEgbGVuZ3RoLlxuICogQHJldHVybiB7bnVtYmVyfSBDUkMzMi5cbiAqL1xuWmxpYi5DUkMzMi5jYWxjID0gZnVuY3Rpb24oZGF0YSwgcG9zLCBsZW5ndGgpIHtcbiAgcmV0dXJuIFpsaWIuQ1JDMzIudXBkYXRlKGRhdGEsIDAsIHBvcywgbGVuZ3RoKTtcbn07XG5cbi8qKlxuICogQ1JDMzLjg4/jg4Pjgrfjg6XlgKTjgpLmm7TmlrBcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gZGF0YSBkYXRhIGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0ge251bWJlcn0gY3JjIENSQzMyLlxuICogQHBhcmFtIHtudW1iZXI9fSBwb3MgZGF0YSBwb3NpdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyPX0gbGVuZ3RoIGRhdGEgbGVuZ3RoLlxuICogQHJldHVybiB7bnVtYmVyfSBDUkMzMi5cbiAqL1xuWmxpYi5DUkMzMi51cGRhdGUgPSBmdW5jdGlvbihkYXRhLCBjcmMsIHBvcywgbGVuZ3RoKSB7XG4gIHZhciB0YWJsZSA9IFpsaWIuQ1JDMzIuVGFibGU7XG4gIHZhciBpID0gKHR5cGVvZiBwb3MgPT09ICdudW1iZXInKSA/IHBvcyA6IChwb3MgPSAwKTtcbiAgdmFyIGlsID0gKHR5cGVvZiBsZW5ndGggPT09ICdudW1iZXInKSA/IGxlbmd0aCA6IGRhdGEubGVuZ3RoO1xuXG4gIGNyYyBePSAweGZmZmZmZmZmO1xuXG4gIC8vIGxvb3AgdW5yb2xsaW5nIGZvciBwZXJmb3JtYW5jZVxuICBmb3IgKGkgPSBpbCAmIDc7IGktLTsgKytwb3MpIHtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW3Bvc10pICYgMHhmZl07XG4gIH1cbiAgZm9yIChpID0gaWwgPj4gMzsgaS0tOyBwb3MgKz0gOCkge1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdGFibGVbKGNyYyBeIGRhdGFbcG9zICAgIF0pICYgMHhmZl07XG4gICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVsoY3JjIF4gZGF0YVtwb3MgKyAxXSkgJiAweGZmXTtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW3BvcyArIDJdKSAmIDB4ZmZdO1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdGFibGVbKGNyYyBeIGRhdGFbcG9zICsgM10pICYgMHhmZl07XG4gICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVsoY3JjIF4gZGF0YVtwb3MgKyA0XSkgJiAweGZmXTtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW3BvcyArIDVdKSAmIDB4ZmZdO1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdGFibGVbKGNyYyBeIGRhdGFbcG9zICsgNl0pICYgMHhmZl07XG4gICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVsoY3JjIF4gZGF0YVtwb3MgKyA3XSkgJiAweGZmXTtcbiAgfVxuXG4gIHJldHVybiAoY3JjIF4gMHhmZmZmZmZmZikgPj4+IDA7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBjcmNcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cblpsaWIuQ1JDMzIuc2luZ2xlID0gZnVuY3Rpb24obnVtLCBjcmMpIHtcbiAgcmV0dXJuIChabGliLkNSQzMyLlRhYmxlWyhudW0gXiBjcmMpICYgMHhmZl0gXiAobnVtID4+PiA4KSkgPj4+IDA7XG59O1xuXG4vKipcbiAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cbiAqIEBjb25zdFxuICogQHByaXZhdGVcbiAqL1xuWmxpYi5DUkMzMi5UYWJsZV8gPSBbXG4gIDB4MDAwMDAwMDAsIDB4NzcwNzMwOTYsIDB4ZWUwZTYxMmMsIDB4OTkwOTUxYmEsIDB4MDc2ZGM0MTksIDB4NzA2YWY0OGYsXG4gIDB4ZTk2M2E1MzUsIDB4OWU2NDk1YTMsIDB4MGVkYjg4MzIsIDB4NzlkY2I4YTQsIDB4ZTBkNWU5MWUsIDB4OTdkMmQ5ODgsXG4gIDB4MDliNjRjMmIsIDB4N2ViMTdjYmQsIDB4ZTdiODJkMDcsIDB4OTBiZjFkOTEsIDB4MWRiNzEwNjQsIDB4NmFiMDIwZjIsXG4gIDB4ZjNiOTcxNDgsIDB4ODRiZTQxZGUsIDB4MWFkYWQ0N2QsIDB4NmRkZGU0ZWIsIDB4ZjRkNGI1NTEsIDB4ODNkMzg1YzcsXG4gIDB4MTM2Yzk4NTYsIDB4NjQ2YmE4YzAsIDB4ZmQ2MmY5N2EsIDB4OGE2NWM5ZWMsIDB4MTQwMTVjNGYsIDB4NjMwNjZjZDksXG4gIDB4ZmEwZjNkNjMsIDB4OGQwODBkZjUsIDB4M2I2ZTIwYzgsIDB4NGM2OTEwNWUsIDB4ZDU2MDQxZTQsIDB4YTI2NzcxNzIsXG4gIDB4M2MwM2U0ZDEsIDB4NGIwNGQ0NDcsIDB4ZDIwZDg1ZmQsIDB4YTUwYWI1NmIsIDB4MzViNWE4ZmEsIDB4NDJiMjk4NmMsXG4gIDB4ZGJiYmM5ZDYsIDB4YWNiY2Y5NDAsIDB4MzJkODZjZTMsIDB4NDVkZjVjNzUsIDB4ZGNkNjBkY2YsIDB4YWJkMTNkNTksXG4gIDB4MjZkOTMwYWMsIDB4NTFkZTAwM2EsIDB4YzhkNzUxODAsIDB4YmZkMDYxMTYsIDB4MjFiNGY0YjUsIDB4NTZiM2M0MjMsXG4gIDB4Y2ZiYTk1OTksIDB4YjhiZGE1MGYsIDB4MjgwMmI4OWUsIDB4NWYwNTg4MDgsIDB4YzYwY2Q5YjIsIDB4YjEwYmU5MjQsXG4gIDB4MmY2ZjdjODcsIDB4NTg2ODRjMTEsIDB4YzE2MTFkYWIsIDB4YjY2NjJkM2QsIDB4NzZkYzQxOTAsIDB4MDFkYjcxMDYsXG4gIDB4OThkMjIwYmMsIDB4ZWZkNTEwMmEsIDB4NzFiMTg1ODksIDB4MDZiNmI1MWYsIDB4OWZiZmU0YTUsIDB4ZThiOGQ0MzMsXG4gIDB4NzgwN2M5YTIsIDB4MGYwMGY5MzQsIDB4OTYwOWE4OGUsIDB4ZTEwZTk4MTgsIDB4N2Y2YTBkYmIsIDB4MDg2ZDNkMmQsXG4gIDB4OTE2NDZjOTcsIDB4ZTY2MzVjMDEsIDB4NmI2YjUxZjQsIDB4MWM2YzYxNjIsIDB4ODU2NTMwZDgsIDB4ZjI2MjAwNGUsXG4gIDB4NmMwNjk1ZWQsIDB4MWIwMWE1N2IsIDB4ODIwOGY0YzEsIDB4ZjUwZmM0NTcsIDB4NjViMGQ5YzYsIDB4MTJiN2U5NTAsXG4gIDB4OGJiZWI4ZWEsIDB4ZmNiOTg4N2MsIDB4NjJkZDFkZGYsIDB4MTVkYTJkNDksIDB4OGNkMzdjZjMsIDB4ZmJkNDRjNjUsXG4gIDB4NGRiMjYxNTgsIDB4M2FiNTUxY2UsIDB4YTNiYzAwNzQsIDB4ZDRiYjMwZTIsIDB4NGFkZmE1NDEsIDB4M2RkODk1ZDcsXG4gIDB4YTRkMWM0NmQsIDB4ZDNkNmY0ZmIsIDB4NDM2OWU5NmEsIDB4MzQ2ZWQ5ZmMsIDB4YWQ2Nzg4NDYsIDB4ZGE2MGI4ZDAsXG4gIDB4NDQwNDJkNzMsIDB4MzMwMzFkZTUsIDB4YWEwYTRjNWYsIDB4ZGQwZDdjYzksIDB4NTAwNTcxM2MsIDB4MjcwMjQxYWEsXG4gIDB4YmUwYjEwMTAsIDB4YzkwYzIwODYsIDB4NTc2OGI1MjUsIDB4MjA2Zjg1YjMsIDB4Yjk2NmQ0MDksIDB4Y2U2MWU0OWYsXG4gIDB4NWVkZWY5MGUsIDB4MjlkOWM5OTgsIDB4YjBkMDk4MjIsIDB4YzdkN2E4YjQsIDB4NTliMzNkMTcsIDB4MmViNDBkODEsXG4gIDB4YjdiZDVjM2IsIDB4YzBiYTZjYWQsIDB4ZWRiODgzMjAsIDB4OWFiZmIzYjYsIDB4MDNiNmUyMGMsIDB4NzRiMWQyOWEsXG4gIDB4ZWFkNTQ3MzksIDB4OWRkMjc3YWYsIDB4MDRkYjI2MTUsIDB4NzNkYzE2ODMsIDB4ZTM2MzBiMTIsIDB4OTQ2NDNiODQsXG4gIDB4MGQ2ZDZhM2UsIDB4N2E2YTVhYTgsIDB4ZTQwZWNmMGIsIDB4OTMwOWZmOWQsIDB4MGEwMGFlMjcsIDB4N2QwNzllYjEsXG4gIDB4ZjAwZjkzNDQsIDB4ODcwOGEzZDIsIDB4MWUwMWYyNjgsIDB4NjkwNmMyZmUsIDB4Zjc2MjU3NWQsIDB4ODA2NTY3Y2IsXG4gIDB4MTk2YzM2NzEsIDB4NmU2YjA2ZTcsIDB4ZmVkNDFiNzYsIDB4ODlkMzJiZTAsIDB4MTBkYTdhNWEsIDB4NjdkZDRhY2MsXG4gIDB4ZjliOWRmNmYsIDB4OGViZWVmZjksIDB4MTdiN2JlNDMsIDB4NjBiMDhlZDUsIDB4ZDZkNmEzZTgsIDB4YTFkMTkzN2UsXG4gIDB4MzhkOGMyYzQsIDB4NGZkZmYyNTIsIDB4ZDFiYjY3ZjEsIDB4YTZiYzU3NjcsIDB4M2ZiNTA2ZGQsIDB4NDhiMjM2NGIsXG4gIDB4ZDgwZDJiZGEsIDB4YWYwYTFiNGMsIDB4MzYwMzRhZjYsIDB4NDEwNDdhNjAsIDB4ZGY2MGVmYzMsIDB4YTg2N2RmNTUsXG4gIDB4MzE2ZThlZWYsIDB4NDY2OWJlNzksIDB4Y2I2MWIzOGMsIDB4YmM2NjgzMWEsIDB4MjU2ZmQyYTAsIDB4NTI2OGUyMzYsXG4gIDB4Y2MwYzc3OTUsIDB4YmIwYjQ3MDMsIDB4MjIwMjE2YjksIDB4NTUwNTI2MmYsIDB4YzViYTNiYmUsIDB4YjJiZDBiMjgsXG4gIDB4MmJiNDVhOTIsIDB4NWNiMzZhMDQsIDB4YzJkN2ZmYTcsIDB4YjVkMGNmMzEsIDB4MmNkOTllOGIsIDB4NWJkZWFlMWQsXG4gIDB4OWI2NGMyYjAsIDB4ZWM2M2YyMjYsIDB4NzU2YWEzOWMsIDB4MDI2ZDkzMGEsIDB4OWMwOTA2YTksIDB4ZWIwZTM2M2YsXG4gIDB4NzIwNzY3ODUsIDB4MDUwMDU3MTMsIDB4OTViZjRhODIsIDB4ZTJiODdhMTQsIDB4N2JiMTJiYWUsIDB4MGNiNjFiMzgsXG4gIDB4OTJkMjhlOWIsIDB4ZTVkNWJlMGQsIDB4N2NkY2VmYjcsIDB4MGJkYmRmMjEsIDB4ODZkM2QyZDQsIDB4ZjFkNGUyNDIsXG4gIDB4NjhkZGIzZjgsIDB4MWZkYTgzNmUsIDB4ODFiZTE2Y2QsIDB4ZjZiOTI2NWIsIDB4NmZiMDc3ZTEsIDB4MThiNzQ3NzcsXG4gIDB4ODgwODVhZTYsIDB4ZmYwZjZhNzAsIDB4NjYwNjNiY2EsIDB4MTEwMTBiNWMsIDB4OGY2NTllZmYsIDB4Zjg2MmFlNjksXG4gIDB4NjE2YmZmZDMsIDB4MTY2Y2NmNDUsIDB4YTAwYWUyNzgsIDB4ZDcwZGQyZWUsIDB4NGUwNDgzNTQsIDB4MzkwM2IzYzIsXG4gIDB4YTc2NzI2NjEsIDB4ZDA2MDE2ZjcsIDB4NDk2OTQ3NGQsIDB4M2U2ZTc3ZGIsIDB4YWVkMTZhNGEsIDB4ZDlkNjVhZGMsXG4gIDB4NDBkZjBiNjYsIDB4MzdkODNiZjAsIDB4YTliY2FlNTMsIDB4ZGViYjllYzUsIDB4NDdiMmNmN2YsIDB4MzBiNWZmZTksXG4gIDB4YmRiZGYyMWMsIDB4Y2FiYWMyOGEsIDB4NTNiMzkzMzAsIDB4MjRiNGEzYTYsIDB4YmFkMDM2MDUsIDB4Y2RkNzA2OTMsXG4gIDB4NTRkZTU3MjksIDB4MjNkOTY3YmYsIDB4YjM2NjdhMmUsIDB4YzQ2MTRhYjgsIDB4NWQ2ODFiMDIsIDB4MmE2ZjJiOTQsXG4gIDB4YjQwYmJlMzcsIDB4YzMwYzhlYTEsIDB4NWEwNWRmMWIsIDB4MmQwMmVmOGRcbl07XG5cbi8qKlxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSBDUkMtMzIgVGFibGUuXG4gKiBAY29uc3RcbiAqL1xuWmxpYi5DUkMzMi5UYWJsZSA9IFpMSUJfQ1JDMzJfQ09NUEFDVCA/IChmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi9cbiAgdmFyIHRhYmxlID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQzMkFycmF5IDogQXJyYXkpKDI1Nik7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgYztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGo7XG5cbiAgZm9yIChpID0gMDsgaSA8IDI1NjsgKytpKSB7XG4gICAgYyA9IGk7XG4gICAgZm9yIChqID0gMDsgaiA8IDg7ICsraikge1xuICAgICAgYyA9IChjICYgMSkgPyAoMHhlZEI4ODMyMCBeIChjID4+PiAxKSkgOiAoYyA+Pj4gMSk7XG4gICAgfVxuICAgIHRhYmxlW2ldID0gYyA+Pj4gMDtcbiAgfVxuXG4gIHJldHVybiB0YWJsZTtcbn0pKCkgOiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50MzJBcnJheShabGliLkNSQzMyLlRhYmxlXykgOiBabGliLkNSQzMyLlRhYmxlXztcblxufSk7XG4iLCJnb29nLnByb3ZpZGUoJ0ZpeFBoYW50b21KU0Z1bmN0aW9uQXBwbHlCdWdfU3RyaW5nRnJvbUNoYXJDb2RlJyk7XG5cbmlmIChnb29nLmdsb2JhbFsnVWludDhBcnJheSddICE9PSB2b2lkIDApIHtcbiAgdHJ5IHtcbiAgICAvLyBhbnRpLW9wdGltaXphdGlvblxuICAgIGV2YWwoXCJTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIG5ldyBVaW50OEFycmF5KFswXSkpO1wiKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseSA9IChmdW5jdGlvbihmcm9tQ2hhckNvZGVBcHBseSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHRoaXNvYmosIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIGZyb21DaGFyQ29kZUFwcGx5LmNhbGwoU3RyaW5nLmZyb21DaGFyQ29kZSwgdGhpc29iaiwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncykpO1xuICAgICAgfVxuICAgIH0pKFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkpO1xuICB9XG59IiwiZ29vZy5wcm92aWRlKCdabGliLkd1bnppcE1lbWJlcicpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5abGliLkd1bnppcE1lbWJlciA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gc2lnbmF0dXJlIGZpcnN0IGJ5dGUuICovXG4gIHRoaXMuaWQxO1xuICAvKiogQHR5cGUge251bWJlcn0gc2lnbmF0dXJlIHNlY29uZCBieXRlLiAqL1xuICB0aGlzLmlkMjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvbXByZXNzaW9uIG1ldGhvZC4gKi9cbiAgdGhpcy5jbTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGZsYWdzLiAqL1xuICB0aGlzLmZsZztcbiAgLyoqIEB0eXBlIHtEYXRlfSBtb2RpZmljYXRpb24gdGltZS4gKi9cbiAgdGhpcy5tdGltZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGV4dHJhIGZsYWdzLiAqL1xuICB0aGlzLnhmbDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG9wZXJhdGluZyBzeXN0ZW0gbnVtYmVyLiAqL1xuICB0aGlzLm9zO1xuICAvKiogQHR5cGUge251bWJlcn0gQ1JDLTE2IHZhbHVlIGZvciBGSENSQyBmbGFnLiAqL1xuICB0aGlzLmNyYzE2O1xuICAvKiogQHR5cGUge251bWJlcn0gZXh0cmEgbGVuZ3RoLiAqL1xuICB0aGlzLnhsZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBDUkMtMzIgdmFsdWUgZm9yIHZlcmlmaWNhdGlvbi4gKi9cbiAgdGhpcy5jcmMzMjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IHNpemUgbW9kdWxvIDMyIHZhbHVlLiAqL1xuICB0aGlzLmlzaXplO1xuICAvKiogQHR5cGUge3N0cmluZ30gZmlsZW5hbWUuICovXG4gIHRoaXMubmFtZTtcbiAgLyoqIEB0eXBlIHtzdHJpbmd9IGNvbW1lbnQuICovXG4gIHRoaXMuY29tbWVudDtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSAqL1xuICB0aGlzLmRhdGE7XG59O1xuXG5abGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TmFtZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5uYW1lO1xufTtcblxuWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldERhdGEgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YTtcbn07XG5cblpsaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXRNdGltZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5tdGltZTtcbn1cblxufSk7IiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEhlYXAgU29ydCDlrp/oo4UuIOODj+ODleODnuODs+espuWPt+WMluOBp+S9v+eUqOOBmeOCiy5cbiAqL1xuXG5nb29nLnByb3ZpZGUoJ1psaWIuSGVhcCcpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICog44Kr44K544K/44Og44OP44OV44Oe44Oz56ym5Y+344Gn5L2/55So44GZ44KL44OS44O844OX5a6f6KOFXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIOODkuODvOODl+OCteOCpOOCui5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5abGliLkhlYXAgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgdGhpcy5idWZmZXIgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDE2QXJyYXkgOiBBcnJheSkobGVuZ3RoICogMik7XG4gIHRoaXMubGVuZ3RoID0gMDtcbn07XG5cbi8qKlxuICog6Kaq44OO44O844OJ44GuIGluZGV4IOWPluW+l1xuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IOWtkOODjuODvOODieOBriBpbmRleC5cbiAqIEByZXR1cm4ge251bWJlcn0g6Kaq44OO44O844OJ44GuIGluZGV4LlxuICpcbiAqL1xuWmxpYi5IZWFwLnByb3RvdHlwZS5nZXRQYXJlbnQgPSBmdW5jdGlvbihpbmRleCkge1xuICByZXR1cm4gKChpbmRleCAtIDIpIC8gNCB8IDApICogMjtcbn07XG5cbi8qKlxuICog5a2Q44OO44O844OJ44GuIGluZGV4IOWPluW+l1xuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IOimquODjuODvOODieOBriBpbmRleC5cbiAqIEByZXR1cm4ge251bWJlcn0g5a2Q44OO44O844OJ44GuIGluZGV4LlxuICovXG5abGliLkhlYXAucHJvdG90eXBlLmdldENoaWxkID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgcmV0dXJuIDIgKiBpbmRleCArIDI7XG59O1xuXG4vKipcbiAqIEhlYXAg44Gr5YCk44KS6L+95Yqg44GZ44KLXG4gKiBAcGFyYW0ge251bWJlcn0gaW5kZXgg44Kt44O8IGluZGV4LlxuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIOWApC5cbiAqIEByZXR1cm4ge251bWJlcn0g54++5Zyo44Gu44OS44O844OX6ZW3LlxuICovXG5abGliLkhlYXAucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbihpbmRleCwgdmFsdWUpIHtcbiAgdmFyIGN1cnJlbnQsIHBhcmVudCxcbiAgICAgIGhlYXAgPSB0aGlzLmJ1ZmZlcixcbiAgICAgIHN3YXA7XG5cbiAgY3VycmVudCA9IHRoaXMubGVuZ3RoO1xuICBoZWFwW3RoaXMubGVuZ3RoKytdID0gdmFsdWU7XG4gIGhlYXBbdGhpcy5sZW5ndGgrK10gPSBpbmRleDtcblxuICAvLyDjg6vjg7zjg4jjg47jg7zjg4njgavjgZ/jganjgornnYDjgY/jgb7jgaflhaXjgozmm7/jgYjjgpLoqabjgb/jgotcbiAgd2hpbGUgKGN1cnJlbnQgPiAwKSB7XG4gICAgcGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoY3VycmVudCk7XG5cbiAgICAvLyDopqrjg47jg7zjg4njgajmr5TovIPjgZfjgabopqrjga7mlrnjgYzlsI/jgZXjgZHjgozjgbDlhaXjgozmm7/jgYjjgotcbiAgICBpZiAoaGVhcFtjdXJyZW50XSA+IGhlYXBbcGFyZW50XSkge1xuICAgICAgc3dhcCA9IGhlYXBbY3VycmVudF07XG4gICAgICBoZWFwW2N1cnJlbnRdID0gaGVhcFtwYXJlbnRdO1xuICAgICAgaGVhcFtwYXJlbnRdID0gc3dhcDtcblxuICAgICAgc3dhcCA9IGhlYXBbY3VycmVudCArIDFdO1xuICAgICAgaGVhcFtjdXJyZW50ICsgMV0gPSBoZWFwW3BhcmVudCArIDFdO1xuICAgICAgaGVhcFtwYXJlbnQgKyAxXSA9IHN3YXA7XG5cbiAgICAgIGN1cnJlbnQgPSBwYXJlbnQ7XG4gICAgLy8g5YWl44KM5pu/44GI44GM5b+F6KaB44Gq44GP44Gq44Gj44Gf44KJ44Gd44GT44Gn5oqc44GR44KLXG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogSGVhcOOBi+OCieS4gOeVquWkp+OBjeOBhOWApOOCkui/lOOBmVxuICogQHJldHVybiB7e2luZGV4OiBudW1iZXIsIHZhbHVlOiBudW1iZXIsIGxlbmd0aDogbnVtYmVyfX0ge2luZGV4OiDjgq3jg7xpbmRleCxcbiAqICAgICB2YWx1ZTog5YCkLCBsZW5ndGg6IOODkuODvOODl+mVt30g44GuIE9iamVjdC5cbiAqL1xuWmxpYi5IZWFwLnByb3RvdHlwZS5wb3AgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGluZGV4LCB2YWx1ZSxcbiAgICAgIGhlYXAgPSB0aGlzLmJ1ZmZlciwgc3dhcCxcbiAgICAgIGN1cnJlbnQsIHBhcmVudDtcblxuICB2YWx1ZSA9IGhlYXBbMF07XG4gIGluZGV4ID0gaGVhcFsxXTtcblxuICAvLyDlvozjgo3jgYvjgonlgKTjgpLlj5bjgotcbiAgdGhpcy5sZW5ndGggLT0gMjtcbiAgaGVhcFswXSA9IGhlYXBbdGhpcy5sZW5ndGhdO1xuICBoZWFwWzFdID0gaGVhcFt0aGlzLmxlbmd0aCArIDFdO1xuXG4gIHBhcmVudCA9IDA7XG4gIC8vIOODq+ODvOODiOODjuODvOODieOBi+OCieS4i+OBjOOBo+OBpuOBhOOBj1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIGN1cnJlbnQgPSB0aGlzLmdldENoaWxkKHBhcmVudCk7XG5cbiAgICAvLyDnr4Tlm7Ljg4Hjgqfjg4Pjgq9cbiAgICBpZiAoY3VycmVudCA+PSB0aGlzLmxlbmd0aCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8g6Zqj44Gu44OO44O844OJ44Go5q+U6LyD44GX44Gm44CB6Zqj44Gu5pa544GM5YCk44GM5aSn44GN44GR44KM44Gw6Zqj44KS54++5Zyo44OO44O844OJ44Go44GX44Gm6YG45oqeXG4gICAgaWYgKGN1cnJlbnQgKyAyIDwgdGhpcy5sZW5ndGggJiYgaGVhcFtjdXJyZW50ICsgMl0gPiBoZWFwW2N1cnJlbnRdKSB7XG4gICAgICBjdXJyZW50ICs9IDI7XG4gICAgfVxuXG4gICAgLy8g6Kaq44OO44O844OJ44Go5q+U6LyD44GX44Gm6Kaq44Gu5pa544GM5bCP44GV44GE5aC05ZCI44Gv5YWl44KM5pu/44GI44KLXG4gICAgaWYgKGhlYXBbY3VycmVudF0gPiBoZWFwW3BhcmVudF0pIHtcbiAgICAgIHN3YXAgPSBoZWFwW3BhcmVudF07XG4gICAgICBoZWFwW3BhcmVudF0gPSBoZWFwW2N1cnJlbnRdO1xuICAgICAgaGVhcFtjdXJyZW50XSA9IHN3YXA7XG5cbiAgICAgIHN3YXAgPSBoZWFwW3BhcmVudCArIDFdO1xuICAgICAgaGVhcFtwYXJlbnQgKyAxXSA9IGhlYXBbY3VycmVudCArIDFdO1xuICAgICAgaGVhcFtjdXJyZW50ICsgMV0gPSBzd2FwO1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBwYXJlbnQgPSBjdXJyZW50O1xuICB9XG5cbiAgcmV0dXJuIHtpbmRleDogaW5kZXgsIHZhbHVlOiB2YWx1ZSwgbGVuZ3RoOiB0aGlzLmxlbmd0aH07XG59O1xuXG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsImdvb2cucHJvdmlkZSgnWmxpYi5IdWZmbWFuJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBidWlsZCBodWZmbWFuIHRhYmxlIGZyb20gbGVuZ3RoIGxpc3QuXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGxlbmd0aHMgbGVuZ3RoIGxpc3QuXG4gKiBAcmV0dXJuIHshQXJyYXl9IGh1ZmZtYW4gdGFibGUuXG4gKi9cblpsaWIuSHVmZm1hbi5idWlsZEh1ZmZtYW5UYWJsZSA9IGZ1bmN0aW9uKGxlbmd0aHMpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxlbmd0aCBsaXN0IHNpemUuICovXG4gIHZhciBsaXN0U2l6ZSA9IGxlbmd0aHMubGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gbWF4IGNvZGUgbGVuZ3RoIGZvciB0YWJsZSBzaXplLiAqL1xuICB2YXIgbWF4Q29kZUxlbmd0aCA9IDA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtaW4gY29kZSBsZW5ndGggZm9yIHRhYmxlIHNpemUuICovXG4gIHZhciBtaW5Db2RlTGVuZ3RoID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAvKiogQHR5cGUge251bWJlcn0gdGFibGUgc2l6ZS4gKi9cbiAgdmFyIHNpemU7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gaHVmZm1hbiBjb2RlIHRhYmxlLiAqL1xuICB2YXIgdGFibGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBiaXQgbGVuZ3RoLiAqL1xuICB2YXIgYml0TGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlLiAqL1xuICB2YXIgY29kZTtcbiAgLyoqXG4gICAqIOOCteOCpOOCuuOBjCAyXm1heGxlbmd0aCDlgIvjga7jg4bjg7zjg5bjg6vjgpLln4vjgoHjgovjgZ/jgoHjga7jgrnjgq3jg4Pjg5fplbcuXG4gICAqIEB0eXBlIHtudW1iZXJ9IHNraXAgbGVuZ3RoIGZvciB0YWJsZSBmaWxsaW5nLlxuICAgKi9cbiAgdmFyIHNraXA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSByZXZlcnNlZCBjb2RlLiAqL1xuICB2YXIgcmV2ZXJzZWQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSByZXZlcnNlIHRlbXAuICovXG4gIHZhciBydGVtcDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGxpbWl0LiAqL1xuICB2YXIgaWw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBqO1xuICAvKiogQHR5cGUge251bWJlcn0gdGFibGUgdmFsdWUuICovXG4gIHZhciB2YWx1ZTtcblxuICAvLyBNYXRoLm1heCDjga/pgYXjgYTjga7jgafmnIDplbfjga7lgKTjga8gZm9yLWxvb3Ag44Gn5Y+W5b6X44GZ44KLXG4gIGZvciAoaSA9IDAsIGlsID0gbGlzdFNpemU7IGkgPCBpbDsgKytpKSB7XG4gICAgaWYgKGxlbmd0aHNbaV0gPiBtYXhDb2RlTGVuZ3RoKSB7XG4gICAgICBtYXhDb2RlTGVuZ3RoID0gbGVuZ3Roc1tpXTtcbiAgICB9XG4gICAgaWYgKGxlbmd0aHNbaV0gPCBtaW5Db2RlTGVuZ3RoKSB7XG4gICAgICBtaW5Db2RlTGVuZ3RoID0gbGVuZ3Roc1tpXTtcbiAgICB9XG4gIH1cblxuICBzaXplID0gMSA8PCBtYXhDb2RlTGVuZ3RoO1xuICB0YWJsZSA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50MzJBcnJheSA6IEFycmF5KShzaXplKTtcblxuICAvLyDjg5Pjg4Pjg4jplbfjga7nn63jgYTpoIbjgYvjgonjg4/jg5Xjg57jg7PnrKblj7fjgpLlibLjgorlvZPjgabjgotcbiAgZm9yIChiaXRMZW5ndGggPSAxLCBjb2RlID0gMCwgc2tpcCA9IDI7IGJpdExlbmd0aCA8PSBtYXhDb2RlTGVuZ3RoOykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0U2l6ZTsgKytpKSB7XG4gICAgICBpZiAobGVuZ3Roc1tpXSA9PT0gYml0TGVuZ3RoKSB7XG4gICAgICAgIC8vIOODk+ODg+ODiOOCquODvOODgOODvOOBjOmAhuOBq+OBquOCi+OBn+OCgeODk+ODg+ODiOmVt+WIhuS4puOBs+OCkuWPjei7ouOBmeOCi1xuICAgICAgICBmb3IgKHJldmVyc2VkID0gMCwgcnRlbXAgPSBjb2RlLCBqID0gMDsgaiA8IGJpdExlbmd0aDsgKytqKSB7XG4gICAgICAgICAgcmV2ZXJzZWQgPSAocmV2ZXJzZWQgPDwgMSkgfCAocnRlbXAgJiAxKTtcbiAgICAgICAgICBydGVtcCA+Pj0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOacgOWkp+ODk+ODg+ODiOmVt+OCkuOCguOBqOOBq+ODhuODvOODluODq+OCkuS9nOOCi+OBn+OCgeOAgVxuICAgICAgICAvLyDmnIDlpKfjg5Pjg4Pjg4jplbfku6XlpJbjgafjga8gMCAvIDEg44Gp44Gh44KJ44Gn44KC6Imv44GE566H5omA44GM44Gn44GN44KLXG4gICAgICAgIC8vIOOBneOBruOBqeOBoeOCieOBp+OCguiJr+OBhOWgtOaJgOOBr+WQjOOBmOWApOOBp+Wfi+OCgeOCi+OBk+OBqOOBp1xuICAgICAgICAvLyDmnKzmnaXjga7jg5Pjg4Pjg4jplbfku6XkuIrjga7jg5Pjg4Pjg4jmlbDlj5blvpfjgZfjgabjgoLllY/poYzjgYzotbfjgZPjgonjgarjgYTjgojjgYbjgavjgZnjgotcbiAgICAgICAgdmFsdWUgPSAoYml0TGVuZ3RoIDw8IDE2KSB8IGk7XG4gICAgICAgIGZvciAoaiA9IHJldmVyc2VkOyBqIDwgc2l6ZTsgaiArPSBza2lwKSB7XG4gICAgICAgICAgdGFibGVbal0gPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgICsrY29kZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmrKHjga7jg5Pjg4Pjg4jplbfjgbhcbiAgICArK2JpdExlbmd0aDtcbiAgICBjb2RlIDw8PSAxO1xuICAgIHNraXAgPDw9IDE7XG4gIH1cblxuICByZXR1cm4gW3RhYmxlLCBtYXhDb2RlTGVuZ3RoLCBtaW5Db2RlTGVuZ3RoXTtcbn07XG5cblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERlZmxhdGUgKFJGQzE5NTEpIOespuWPt+WMluOCouODq+OCtOODquOCuuODoOWun+ijhS5cbiAqL1xuXG5nb29nLnByb3ZpZGUoJ1psaWIuUmF3RGVmbGF0ZScpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuQml0U3RyZWFtJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuSGVhcCcpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIFJhdyBEZWZsYXRlIOWun+ijhVxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbnB1dCDnrKblj7fljJbjgZnjgovlr77osaHjga7jg5Djg4Pjg5XjgqEuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9uIHBhcmFtZXRlcnMuXG4gKlxuICogdHlwZWQgYXJyYXkg44GM5L2/55So5Y+v6IO944Gq44Go44GN44CBb3V0cHV0QnVmZmVyIOOBjCBBcnJheSDjga/oh6rli5XnmoTjgasgVWludDhBcnJheSDjgatcbiAqIOWkieaPm+OBleOCjOOBvuOBmS5cbiAqIOWIpeOBruOCquODluOCuOOCp+OCr+ODiOOBq+OBquOCi+OBn+OCgeWHuuWKm+ODkOODg+ODleOCoeOCkuWPgueFp+OBl+OBpuOBhOOCi+WkieaVsOOBquOBqeOBr1xuICog5pu05paw44GZ44KL5b+F6KaB44GM44GC44KK44G+44GZLlxuICovXG5abGliLlJhd0RlZmxhdGUgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICAvKiogQHR5cGUge1psaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGV9ICovXG4gIHRoaXMuY29tcHJlc3Npb25UeXBlID0gWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5EWU5BTUlDO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5sYXp5ID0gMDtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi9cbiAgdGhpcy5mcmVxc0xpdExlbjtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi9cbiAgdGhpcy5mcmVxc0Rpc3Q7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdGhpcy5pbnB1dCA9XG4gICAgKFVTRV9UWVBFREFSUkFZICYmIGlucHV0IGluc3RhbmNlb2YgQXJyYXkpID8gbmV3IFVpbnQ4QXJyYXkoaW5wdXQpIDogaW5wdXQ7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IG91dHB1dCBidWZmZXIuICovXG4gIHRoaXMub3V0cHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gcG9zIG91dHB1dCBidWZmZXIgcG9zaXRpb24uICovXG4gIHRoaXMub3AgPSAwO1xuXG4gIC8vIG9wdGlvbiBwYXJhbWV0ZXJzXG4gIGlmIChvcHRfcGFyYW1zKSB7XG4gICAgaWYgKG9wdF9wYXJhbXNbJ2xhenknXSkge1xuICAgICAgdGhpcy5sYXp5ID0gb3B0X3BhcmFtc1snbGF6eSddO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uVHlwZSddID09PSAnbnVtYmVyJykge1xuICAgICAgdGhpcy5jb21wcmVzc2lvblR5cGUgPSBvcHRfcGFyYW1zWydjb21wcmVzc2lvblR5cGUnXTtcbiAgICB9XG4gICAgaWYgKG9wdF9wYXJhbXNbJ291dHB1dEJ1ZmZlciddKSB7XG4gICAgICB0aGlzLm91dHB1dCA9XG4gICAgICAgIChVU0VfVFlQRURBUlJBWSAmJiBvcHRfcGFyYW1zWydvdXRwdXRCdWZmZXInXSBpbnN0YW5jZW9mIEFycmF5KSA/XG4gICAgICAgIG5ldyBVaW50OEFycmF5KG9wdF9wYXJhbXNbJ291dHB1dEJ1ZmZlciddKSA6IG9wdF9wYXJhbXNbJ291dHB1dEJ1ZmZlciddO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdF9wYXJhbXNbJ291dHB1dEluZGV4J10gPT09ICdudW1iZXInKSB7XG4gICAgICB0aGlzLm9wID0gb3B0X3BhcmFtc1snb3V0cHV0SW5kZXgnXTtcbiAgICB9XG4gIH1cblxuICBpZiAoIXRoaXMub3V0cHV0KSB7XG4gICAgdGhpcy5vdXRwdXQgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgweDgwMDApO1xuICB9XG59O1xuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUgPSB7XG4gIE5PTkU6IDAsXG4gIEZJWEVEOiAxLFxuICBEWU5BTUlDOiAyLFxuICBSRVNFUlZFRDogM1xufTtcblxuXG4vKipcbiAqIExaNzcg44Gu5pyA5bCP44Oe44OD44OB6ZW3XG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5Mejc3TWluTGVuZ3RoID0gMztcblxuLyoqXG4gKiBMWjc3IOOBruacgOWkp+ODnuODg+ODgemVt1xuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5abGliLlJhd0RlZmxhdGUuTHo3N01heExlbmd0aCA9IDI1ODtcblxuLyoqXG4gKiBMWjc3IOOBruOCpuOCo+ODs+ODieOCpuOCteOCpOOCulxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5abGliLlJhd0RlZmxhdGUuV2luZG93U2l6ZSA9IDB4ODAwMDtcblxuLyoqXG4gKiDmnIDplbfjga7nrKblj7fplbdcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn1cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLk1heENvZGVMZW5ndGggPSAxNjtcblxuLyoqXG4gKiDjg4/jg5Xjg57jg7PnrKblj7fjga7mnIDlpKfmlbDlgKRcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn1cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLkhVRk1BWCA9IDI4NjtcblxuLyoqXG4gKiDlm7rlrprjg4/jg5Xjg57jg7PnrKblj7fjga7nrKblj7fljJbjg4bjg7zjg5bjg6tcbiAqIEBjb25zdFxuICogQHR5cGUge0FycmF5LjxBcnJheS48bnVtYmVyLCBudW1iZXI+Pn1cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLkZpeGVkSHVmZm1hblRhYmxlID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdGFibGUgPSBbXSwgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgMjg4OyBpKyspIHtcbiAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgIGNhc2UgKGkgPD0gMTQzKTogdGFibGUucHVzaChbaSAgICAgICArIDB4MDMwLCA4XSk7IGJyZWFrO1xuICAgICAgY2FzZSAoaSA8PSAyNTUpOiB0YWJsZS5wdXNoKFtpIC0gMTQ0ICsgMHgxOTAsIDldKTsgYnJlYWs7XG4gICAgICBjYXNlIChpIDw9IDI3OSk6IHRhYmxlLnB1c2goW2kgLSAyNTYgKyAweDAwMCwgN10pOyBicmVhaztcbiAgICAgIGNhc2UgKGkgPD0gMjg3KTogdGFibGUucHVzaChbaSAtIDI4MCArIDB4MEMwLCA4XSk7IGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgJ2ludmFsaWQgbGl0ZXJhbDogJyArIGk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhYmxlO1xufSkoKTtcblxuLyoqXG4gKiBERUZMQVRFIOODluODreODg+OCr+OBruS9nOaIkFxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0g5Zyn57iu5riI44G/IGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuY29tcHJlc3MgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgYmxvY2tBcnJheTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBwb3NpdGlvbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsZW5ndGg7XG5cbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcblxuICAvLyBjb21wcmVzc2lvblxuICBzd2l0Y2ggKHRoaXMuY29tcHJlc3Npb25UeXBlKSB7XG4gICAgY2FzZSBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlLk5PTkU6XG4gICAgICAvLyBlYWNoIDY1NTM1LUJ5dGUgKGxlbmd0aCBoZWFkZXI6IDE2LWJpdClcbiAgICAgIGZvciAocG9zaXRpb24gPSAwLCBsZW5ndGggPSBpbnB1dC5sZW5ndGg7IHBvc2l0aW9uIDwgbGVuZ3RoOykge1xuICAgICAgICBibG9ja0FycmF5ID0gVVNFX1RZUEVEQVJSQVkgP1xuICAgICAgICAgIGlucHV0LnN1YmFycmF5KHBvc2l0aW9uLCBwb3NpdGlvbiArIDB4ZmZmZikgOlxuICAgICAgICAgIGlucHV0LnNsaWNlKHBvc2l0aW9uLCBwb3NpdGlvbiArIDB4ZmZmZik7XG4gICAgICAgIHBvc2l0aW9uICs9IGJsb2NrQXJyYXkubGVuZ3RoO1xuICAgICAgICB0aGlzLm1ha2VOb2NvbXByZXNzQmxvY2soYmxvY2tBcnJheSwgKHBvc2l0aW9uID09PSBsZW5ndGgpKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5GSVhFRDpcbiAgICAgIHRoaXMub3V0cHV0ID0gdGhpcy5tYWtlRml4ZWRIdWZmbWFuQmxvY2soaW5wdXQsIHRydWUpO1xuICAgICAgdGhpcy5vcCA9IHRoaXMub3V0cHV0Lmxlbmd0aDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5EWU5BTUlDOlxuICAgICAgdGhpcy5vdXRwdXQgPSB0aGlzLm1ha2VEeW5hbWljSHVmZm1hbkJsb2NrKGlucHV0LCB0cnVlKTtcbiAgICAgIHRoaXMub3AgPSB0aGlzLm91dHB1dC5sZW5ndGg7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgJ2ludmFsaWQgY29tcHJlc3Npb24gdHlwZSc7XG4gIH1cblxuICByZXR1cm4gdGhpcy5vdXRwdXQ7XG59O1xuXG4vKipcbiAqIOmdnuWcp+e4ruODluODreODg+OCr+OBruS9nOaIkFxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBibG9ja0FycmF5IOODluODreODg+OCr+ODh+ODvOOCvyBieXRlIGFycmF5LlxuICogQHBhcmFtIHshYm9vbGVhbn0gaXNGaW5hbEJsb2NrIOacgOW+jOOBruODluODreODg+OCr+OBquOCieOBsHRydWUuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSDpnZ7lnKfnuK7jg5bjg63jg4Pjgq8gYnl0ZSBhcnJheS5cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5tYWtlTm9jb21wcmVzc0Jsb2NrID1cbmZ1bmN0aW9uKGJsb2NrQXJyYXksIGlzRmluYWxCbG9jaykge1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGJmaW5hbDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlfSAqL1xuICB2YXIgYnR5cGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGVuO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG5sZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbDtcblxuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gIHZhciBvcCA9IHRoaXMub3A7XG5cbiAgLy8gZXhwYW5kIGJ1ZmZlclxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBvdXRwdXQgPSBuZXcgVWludDhBcnJheSh0aGlzLm91dHB1dC5idWZmZXIpO1xuICAgIHdoaWxlIChvdXRwdXQubGVuZ3RoIDw9IG9wICsgYmxvY2tBcnJheS5sZW5ndGggKyA1KSB7XG4gICAgICBvdXRwdXQgPSBuZXcgVWludDhBcnJheShvdXRwdXQubGVuZ3RoIDw8IDEpO1xuICAgIH1cbiAgICBvdXRwdXQuc2V0KHRoaXMub3V0cHV0KTtcbiAgfVxuXG4gIC8vIGhlYWRlclxuICBiZmluYWwgPSBpc0ZpbmFsQmxvY2sgPyAxIDogMDtcbiAgYnR5cGUgPSBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlLk5PTkU7XG4gIG91dHB1dFtvcCsrXSA9IChiZmluYWwpIHwgKGJ0eXBlIDw8IDEpO1xuXG4gIC8vIGxlbmd0aFxuICBsZW4gPSBibG9ja0FycmF5Lmxlbmd0aDtcbiAgbmxlbiA9ICh+bGVuICsgMHgxMDAwMCkgJiAweGZmZmY7XG4gIG91dHB1dFtvcCsrXSA9ICAgICAgICAgIGxlbiAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9ICAobGVuID4+PiA4KSAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9ICAgICAgICAgbmxlbiAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IChubGVuID4+PiA4KSAmIDB4ZmY7XG5cbiAgLy8gY29weSBidWZmZXJcbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgIG91dHB1dC5zZXQoYmxvY2tBcnJheSwgb3ApO1xuICAgICBvcCArPSBibG9ja0FycmF5Lmxlbmd0aDtcbiAgICAgb3V0cHV0ID0gb3V0cHV0LnN1YmFycmF5KDAsIG9wKTtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKGkgPSAwLCBpbCA9IGJsb2NrQXJyYXkubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgICAgb3V0cHV0W29wKytdID0gYmxvY2tBcnJheVtpXTtcbiAgICB9XG4gICAgb3V0cHV0Lmxlbmd0aCA9IG9wO1xuICB9XG5cbiAgdGhpcy5vcCA9IG9wO1xuICB0aGlzLm91dHB1dCA9IG91dHB1dDtcblxuICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiDlm7rlrprjg4/jg5Xjg57jg7Pjg5bjg63jg4Pjgq/jga7kvZzmiJBcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gYmxvY2tBcnJheSDjg5bjg63jg4Pjgq/jg4fjg7zjgr8gYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7IWJvb2xlYW59IGlzRmluYWxCbG9jayDmnIDlvozjga7jg5bjg63jg4Pjgq/jgarjgonjgbB0cnVlLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0g5Zu65a6a44OP44OV44Oe44Oz56ym5Y+35YyW44OW44Ot44OD44KvIGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZUZpeGVkSHVmZm1hbkJsb2NrID1cbmZ1bmN0aW9uKGJsb2NrQXJyYXksIGlzRmluYWxCbG9jaykge1xuICAvKiogQHR5cGUge1psaWIuQml0U3RyZWFtfSAqL1xuICB2YXIgc3RyZWFtID0gbmV3IFpsaWIuQml0U3RyZWFtKFVTRV9UWVBFREFSUkFZID9cbiAgICBuZXcgVWludDhBcnJheSh0aGlzLm91dHB1dC5idWZmZXIpIDogdGhpcy5vdXRwdXQsIHRoaXMub3ApO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGJmaW5hbDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlfSAqL1xuICB2YXIgYnR5cGU7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9ICovXG4gIHZhciBkYXRhO1xuXG4gIC8vIGhlYWRlclxuICBiZmluYWwgPSBpc0ZpbmFsQmxvY2sgPyAxIDogMDtcbiAgYnR5cGUgPSBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkZJWEVEO1xuXG4gIHN0cmVhbS53cml0ZUJpdHMoYmZpbmFsLCAxLCB0cnVlKTtcbiAgc3RyZWFtLndyaXRlQml0cyhidHlwZSwgMiwgdHJ1ZSk7XG5cbiAgZGF0YSA9IHRoaXMubHo3NyhibG9ja0FycmF5KTtcbiAgdGhpcy5maXhlZEh1ZmZtYW4oZGF0YSwgc3RyZWFtKTtcblxuICByZXR1cm4gc3RyZWFtLmZpbmlzaCgpO1xufTtcblxuLyoqXG4gKiDli5XnmoTjg4/jg5Xjg57jg7Pjg5bjg63jg4Pjgq/jga7kvZzmiJBcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gYmxvY2tBcnJheSDjg5bjg63jg4Pjgq/jg4fjg7zjgr8gYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7IWJvb2xlYW59IGlzRmluYWxCbG9jayDmnIDlvozjga7jg5bjg63jg4Pjgq/jgarjgonjgbB0cnVlLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0g5YuV55qE44OP44OV44Oe44Oz56ym5Y+344OW44Ot44OD44KvIGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZUR5bmFtaWNIdWZmbWFuQmxvY2sgPVxuZnVuY3Rpb24oYmxvY2tBcnJheSwgaXNGaW5hbEJsb2NrKSB7XG4gIC8qKiBAdHlwZSB7WmxpYi5CaXRTdHJlYW19ICovXG4gIHZhciBzdHJlYW0gPSBuZXcgWmxpYi5CaXRTdHJlYW0oVVNFX1RZUEVEQVJSQVkgP1xuICAgIG5ldyBVaW50OEFycmF5KHRoaXMub3V0cHV0LmJ1ZmZlcikgOiB0aGlzLm91dHB1dCwgdGhpcy5vcCk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgYmZpbmFsO1xuICAvKiogQHR5cGUge1psaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGV9ICovXG4gIHZhciBidHlwZTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gKi9cbiAgdmFyIGRhdGE7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaGxpdDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBoZGlzdDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBoY2xlbjtcbiAgLyoqIEBjb25zdCBAdHlwZSB7QXJyYXkuPG51bWJlcj59ICovXG4gIHZhciBoY2xlbk9yZGVyID1cbiAgICAgICAgWzE2LCAxNywgMTgsIDAsIDgsIDcsIDksIDYsIDEwLCA1LCAxMSwgNCwgMTIsIDMsIDEzLCAyLCAxNCwgMSwgMTVdO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBsaXRMZW5MZW5ndGhzO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSAqL1xuICB2YXIgbGl0TGVuQ29kZXM7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIGRpc3RMZW5ndGhzO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSAqL1xuICB2YXIgZGlzdENvZGVzO1xuICAvKiogQHR5cGUge3tcbiAgICogICBjb2RlczogIShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSksXG4gICAqICAgZnJlcXM6ICEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSlcbiAgICogfX0gKi9cbiAgdmFyIHRyZWVTeW1ib2xzO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciB0cmVlTGVuZ3RocztcbiAgLyoqIEB0eXBlIHtBcnJheX0gKi9cbiAgdmFyIHRyYW5zTGVuZ3RocyA9IG5ldyBBcnJheSgxOSk7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9ICovXG4gIHZhciB0cmVlQ29kZXM7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgY29kZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBiaXRsZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbDtcblxuICAvLyBoZWFkZXJcbiAgYmZpbmFsID0gaXNGaW5hbEJsb2NrID8gMSA6IDA7XG4gIGJ0eXBlID0gWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5EWU5BTUlDO1xuXG4gIHN0cmVhbS53cml0ZUJpdHMoYmZpbmFsLCAxLCB0cnVlKTtcbiAgc3RyZWFtLndyaXRlQml0cyhidHlwZSwgMiwgdHJ1ZSk7XG5cbiAgZGF0YSA9IHRoaXMubHo3NyhibG9ja0FycmF5KTtcblxuICAvLyDjg6rjg4bjg6njg6vjg7vplbfjgZUsIOi3nembouOBruODj+ODleODnuODs+espuWPt+OBqOespuWPt+mVt+OBrueul+WHulxuICBsaXRMZW5MZW5ndGhzID0gdGhpcy5nZXRMZW5ndGhzXyh0aGlzLmZyZXFzTGl0TGVuLCAxNSk7XG4gIGxpdExlbkNvZGVzID0gdGhpcy5nZXRDb2Rlc0Zyb21MZW5ndGhzXyhsaXRMZW5MZW5ndGhzKTtcbiAgZGlzdExlbmd0aHMgPSB0aGlzLmdldExlbmd0aHNfKHRoaXMuZnJlcXNEaXN0LCA3KTtcbiAgZGlzdENvZGVzID0gdGhpcy5nZXRDb2Rlc0Zyb21MZW5ndGhzXyhkaXN0TGVuZ3Rocyk7XG5cbiAgLy8gSExJVCwgSERJU1Qg44Gu5rG65a6aXG4gIGZvciAoaGxpdCA9IDI4NjsgaGxpdCA+IDI1NyAmJiBsaXRMZW5MZW5ndGhzW2hsaXQgLSAxXSA9PT0gMDsgaGxpdC0tKSB7fVxuICBmb3IgKGhkaXN0ID0gMzA7IGhkaXN0ID4gMSAmJiBkaXN0TGVuZ3Roc1toZGlzdCAtIDFdID09PSAwOyBoZGlzdC0tKSB7fVxuXG4gIC8vIEhDTEVOXG4gIHRyZWVTeW1ib2xzID1cbiAgICB0aGlzLmdldFRyZWVTeW1ib2xzXyhobGl0LCBsaXRMZW5MZW5ndGhzLCBoZGlzdCwgZGlzdExlbmd0aHMpO1xuICB0cmVlTGVuZ3RocyA9IHRoaXMuZ2V0TGVuZ3Roc18odHJlZVN5bWJvbHMuZnJlcXMsIDcpO1xuICBmb3IgKGkgPSAwOyBpIDwgMTk7IGkrKykge1xuICAgIHRyYW5zTGVuZ3Roc1tpXSA9IHRyZWVMZW5ndGhzW2hjbGVuT3JkZXJbaV1dO1xuICB9XG4gIGZvciAoaGNsZW4gPSAxOTsgaGNsZW4gPiA0ICYmIHRyYW5zTGVuZ3Roc1toY2xlbiAtIDFdID09PSAwOyBoY2xlbi0tKSB7fVxuXG4gIHRyZWVDb2RlcyA9IHRoaXMuZ2V0Q29kZXNGcm9tTGVuZ3Roc18odHJlZUxlbmd0aHMpO1xuXG4gIC8vIOWHuuWKm1xuICBzdHJlYW0ud3JpdGVCaXRzKGhsaXQgLSAyNTcsIDUsIHRydWUpO1xuICBzdHJlYW0ud3JpdGVCaXRzKGhkaXN0IC0gMSwgNSwgdHJ1ZSk7XG4gIHN0cmVhbS53cml0ZUJpdHMoaGNsZW4gLSA0LCA0LCB0cnVlKTtcbiAgZm9yIChpID0gMDsgaSA8IGhjbGVuOyBpKyspIHtcbiAgICBzdHJlYW0ud3JpdGVCaXRzKHRyYW5zTGVuZ3Roc1tpXSwgMywgdHJ1ZSk7XG4gIH1cblxuICAvLyDjg4Tjg6rjg7zjga7lh7rliptcbiAgZm9yIChpID0gMCwgaWwgPSB0cmVlU3ltYm9scy5jb2Rlcy5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XG4gICAgY29kZSA9IHRyZWVTeW1ib2xzLmNvZGVzW2ldO1xuXG4gICAgc3RyZWFtLndyaXRlQml0cyh0cmVlQ29kZXNbY29kZV0sIHRyZWVMZW5ndGhzW2NvZGVdLCB0cnVlKTtcblxuICAgIC8vIGV4dHJhIGJpdHNcbiAgICBpZiAoY29kZSA+PSAxNikge1xuICAgICAgaSsrO1xuICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgIGNhc2UgMTY6IGJpdGxlbiA9IDI7IGJyZWFrO1xuICAgICAgICBjYXNlIDE3OiBiaXRsZW4gPSAzOyBicmVhaztcbiAgICAgICAgY2FzZSAxODogYml0bGVuID0gNzsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgJ2ludmFsaWQgY29kZTogJyArIGNvZGU7XG4gICAgICB9XG5cbiAgICAgIHN0cmVhbS53cml0ZUJpdHModHJlZVN5bWJvbHMuY29kZXNbaV0sIGJpdGxlbiwgdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5keW5hbWljSHVmZm1hbihcbiAgICBkYXRhLFxuICAgIFtsaXRMZW5Db2RlcywgbGl0TGVuTGVuZ3Roc10sXG4gICAgW2Rpc3RDb2RlcywgZGlzdExlbmd0aHNdLFxuICAgIHN0cmVhbVxuICApO1xuXG4gIHJldHVybiBzdHJlYW0uZmluaXNoKCk7XG59O1xuXG5cbi8qKlxuICog5YuV55qE44OP44OV44Oe44Oz56ym5Y+35YyWKOOCq+OCueOCv+ODoOODj+ODleODnuODs+ODhuODvOODluODqylcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9IGRhdGFBcnJheSBMWjc3IOespuWPt+WMlua4iOOBvyBieXRlIGFycmF5LlxuICogQHBhcmFtIHshWmxpYi5CaXRTdHJlYW19IHN0cmVhbSDmm7jjgY3ovrzjgb/nlKjjg5Pjg4Pjg4jjgrnjg4jjg6rjg7zjg6AuXG4gKiBAcmV0dXJuIHshWmxpYi5CaXRTdHJlYW19IOODj+ODleODnuODs+espuWPt+WMlua4iOOBv+ODk+ODg+ODiOOCueODiOODquODvOODoOOCquODluOCuOOCp+OCr+ODiC5cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5keW5hbWljSHVmZm1hbiA9XG5mdW5jdGlvbihkYXRhQXJyYXksIGxpdExlbiwgZGlzdCwgc3RyZWFtKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaW5kZXg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxpdGVyYWw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgY29kZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsaXRMZW5Db2RlcztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsaXRMZW5MZW5ndGhzO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGRpc3RDb2RlcztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBkaXN0TGVuZ3RocztcblxuICBsaXRMZW5Db2RlcyA9IGxpdExlblswXTtcbiAgbGl0TGVuTGVuZ3RocyA9IGxpdExlblsxXTtcbiAgZGlzdENvZGVzID0gZGlzdFswXTtcbiAgZGlzdExlbmd0aHMgPSBkaXN0WzFdO1xuXG4gIC8vIOespuWPt+OCkiBCaXRTdHJlYW0g44Gr5pu444GN6L6844KT44Gn44GE44GPXG4gIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBkYXRhQXJyYXkubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgKytpbmRleCkge1xuICAgIGxpdGVyYWwgPSBkYXRhQXJyYXlbaW5kZXhdO1xuXG4gICAgLy8gbGl0ZXJhbCBvciBsZW5ndGhcbiAgICBzdHJlYW0ud3JpdGVCaXRzKGxpdExlbkNvZGVzW2xpdGVyYWxdLCBsaXRMZW5MZW5ndGhzW2xpdGVyYWxdLCB0cnVlKTtcblxuICAgIC8vIOmVt+OBleODu+i3nembouespuWPt1xuICAgIGlmIChsaXRlcmFsID4gMjU2KSB7XG4gICAgICAvLyBsZW5ndGggZXh0cmFcbiAgICAgIHN0cmVhbS53cml0ZUJpdHMoZGF0YUFycmF5WysraW5kZXhdLCBkYXRhQXJyYXlbKytpbmRleF0sIHRydWUpO1xuICAgICAgLy8gZGlzdGFuY2VcbiAgICAgIGNvZGUgPSBkYXRhQXJyYXlbKytpbmRleF07XG4gICAgICBzdHJlYW0ud3JpdGVCaXRzKGRpc3RDb2Rlc1tjb2RlXSwgZGlzdExlbmd0aHNbY29kZV0sIHRydWUpO1xuICAgICAgLy8gZGlzdGFuY2UgZXh0cmFcbiAgICAgIHN0cmVhbS53cml0ZUJpdHMoZGF0YUFycmF5WysraW5kZXhdLCBkYXRhQXJyYXlbKytpbmRleF0sIHRydWUpO1xuICAgIC8vIOe1guerr1xuICAgIH0gZWxzZSBpZiAobGl0ZXJhbCA9PT0gMjU2KSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RyZWFtO1xufTtcblxuLyoqXG4gKiDlm7rlrprjg4/jg5Xjg57jg7PnrKblj7fljJZcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9IGRhdGFBcnJheSBMWjc3IOespuWPt+WMlua4iOOBvyBieXRlIGFycmF5LlxuICogQHBhcmFtIHshWmxpYi5CaXRTdHJlYW19IHN0cmVhbSDmm7jjgY3ovrzjgb/nlKjjg5Pjg4Pjg4jjgrnjg4jjg6rjg7zjg6AuXG4gKiBAcmV0dXJuIHshWmxpYi5CaXRTdHJlYW19IOODj+ODleODnuODs+espuWPt+WMlua4iOOBv+ODk+ODg+ODiOOCueODiOODquODvOODoOOCquODluOCuOOCp+OCr+ODiC5cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5maXhlZEh1ZmZtYW4gPSBmdW5jdGlvbihkYXRhQXJyYXksIHN0cmVhbSkge1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGluZGV4O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsaXRlcmFsO1xuXG4gIC8vIOespuWPt+OCkiBCaXRTdHJlYW0g44Gr5pu444GN6L6844KT44Gn44GE44GPXG4gIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBkYXRhQXJyYXkubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgIGxpdGVyYWwgPSBkYXRhQXJyYXlbaW5kZXhdO1xuXG4gICAgLy8g56ym5Y+344Gu5pu444GN6L6844G/XG4gICAgWmxpYi5CaXRTdHJlYW0ucHJvdG90eXBlLndyaXRlQml0cy5hcHBseShcbiAgICAgIHN0cmVhbSxcbiAgICAgIFpsaWIuUmF3RGVmbGF0ZS5GaXhlZEh1ZmZtYW5UYWJsZVtsaXRlcmFsXVxuICAgICk7XG5cbiAgICAvLyDplbfjgZXjg7vot53pm6LnrKblj7dcbiAgICBpZiAobGl0ZXJhbCA+IDB4MTAwKSB7XG4gICAgICAvLyBsZW5ndGggZXh0cmFcbiAgICAgIHN0cmVhbS53cml0ZUJpdHMoZGF0YUFycmF5WysraW5kZXhdLCBkYXRhQXJyYXlbKytpbmRleF0sIHRydWUpO1xuICAgICAgLy8gZGlzdGFuY2VcbiAgICAgIHN0cmVhbS53cml0ZUJpdHMoZGF0YUFycmF5WysraW5kZXhdLCA1KTtcbiAgICAgIC8vIGRpc3RhbmNlIGV4dHJhXG4gICAgICBzdHJlYW0ud3JpdGVCaXRzKGRhdGFBcnJheVsrK2luZGV4XSwgZGF0YUFycmF5WysraW5kZXhdLCB0cnVlKTtcbiAgICAvLyDntYLnq69cbiAgICB9IGVsc2UgaWYgKGxpdGVyYWwgPT09IDB4MTAwKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RyZWFtO1xufTtcblxuLyoqXG4gKiDjg57jg4Pjg4Hmg4XloLFcbiAqIEBwYXJhbSB7IW51bWJlcn0gbGVuZ3RoIOODnuODg+ODgeOBl+OBn+mVt+OBlS5cbiAqIEBwYXJhbSB7IW51bWJlcn0gYmFja3dhcmREaXN0YW5jZSDjg57jg4Pjg4HkvY3nva7jgajjga7ot53pm6IuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaCA9IGZ1bmN0aW9uKGxlbmd0aCwgYmFja3dhcmREaXN0YW5jZSkge1xuICAvKiogQHR5cGUge251bWJlcn0gbWF0Y2ggbGVuZ3RoLiAqL1xuICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJhY2t3YXJkIGRpc3RhbmNlLiAqL1xuICB0aGlzLmJhY2t3YXJkRGlzdGFuY2UgPSBiYWNrd2FyZERpc3RhbmNlO1xufTtcblxuLyoqXG4gKiDplbfjgZXnrKblj7fjg4bjg7zjg5bjg6suXG4gKiBb44Kz44O844OJLCDmi6HlvLXjg5Pjg4Pjg4gsIOaLoeW8teODk+ODg+ODiOmVt10g44Gu6YWN5YiX44Go44Gq44Gj44Gm44GE44KLLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9XG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2guTGVuZ3RoQ29kZVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50MzJBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKChmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHshQXJyYXl9ICovXG4gIHZhciB0YWJsZSA9IFtdO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7IUFycmF5LjxudW1iZXI+fSAqL1xuICB2YXIgYztcblxuICBmb3IgKGkgPSAzOyBpIDw9IDI1ODsgaSsrKSB7XG4gICAgYyA9IGNvZGUoaSk7XG4gICAgdGFibGVbaV0gPSAoY1syXSA8PCAyNCkgfCAoY1sxXSA8PCAxNikgfCBjWzBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggbHo3NyBsZW5ndGguXG4gICAqIEByZXR1cm4geyFBcnJheS48bnVtYmVyPn0gbHo3NyBjb2Rlcy5cbiAgICovXG4gIGZ1bmN0aW9uIGNvZGUobGVuZ3RoKSB7XG4gICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDMpOiByZXR1cm4gWzI1NywgbGVuZ3RoIC0gMywgMF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoID09PSA0KTogcmV0dXJuIFsyNTgsIGxlbmd0aCAtIDQsIDBdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA9PT0gNSk6IHJldHVybiBbMjU5LCBsZW5ndGggLSA1LCAwXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDYpOiByZXR1cm4gWzI2MCwgbGVuZ3RoIC0gNiwgMF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoID09PSA3KTogcmV0dXJuIFsyNjEsIGxlbmd0aCAtIDcsIDBdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA9PT0gOCk6IHJldHVybiBbMjYyLCBsZW5ndGggLSA4LCAwXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDkpOiByZXR1cm4gWzI2MywgbGVuZ3RoIC0gOSwgMF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoID09PSAxMCk6IHJldHVybiBbMjY0LCBsZW5ndGggLSAxMCwgMF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDEyKTogcmV0dXJuIFsyNjUsIGxlbmd0aCAtIDExLCAxXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMTQpOiByZXR1cm4gWzI2NiwgbGVuZ3RoIC0gMTMsIDFdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAxNik6IHJldHVybiBbMjY3LCBsZW5ndGggLSAxNSwgMV07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDE4KTogcmV0dXJuIFsyNjgsIGxlbmd0aCAtIDE3LCAxXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMjIpOiByZXR1cm4gWzI2OSwgbGVuZ3RoIC0gMTksIDJdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAyNik6IHJldHVybiBbMjcwLCBsZW5ndGggLSAyMywgMl07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDMwKTogcmV0dXJuIFsyNzEsIGxlbmd0aCAtIDI3LCAyXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMzQpOiByZXR1cm4gWzI3MiwgbGVuZ3RoIC0gMzEsIDJdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSA0Mik6IHJldHVybiBbMjczLCBsZW5ndGggLSAzNSwgM107IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDUwKTogcmV0dXJuIFsyNzQsIGxlbmd0aCAtIDQzLCAzXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gNTgpOiByZXR1cm4gWzI3NSwgbGVuZ3RoIC0gNTEsIDNdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSA2Nik6IHJldHVybiBbMjc2LCBsZW5ndGggLSA1OSwgM107IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDgyKTogcmV0dXJuIFsyNzcsIGxlbmd0aCAtIDY3LCA0XTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gOTgpOiByZXR1cm4gWzI3OCwgbGVuZ3RoIC0gODMsIDRdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAxMTQpOiByZXR1cm4gWzI3OSwgbGVuZ3RoIC0gOTksIDRdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAxMzApOiByZXR1cm4gWzI4MCwgbGVuZ3RoIC0gMTE1LCA0XTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMTYyKTogcmV0dXJuIFsyODEsIGxlbmd0aCAtIDEzMSwgNV07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDE5NCk6IHJldHVybiBbMjgyLCBsZW5ndGggLSAxNjMsIDVdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAyMjYpOiByZXR1cm4gWzI4MywgbGVuZ3RoIC0gMTk1LCA1XTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMjU3KTogcmV0dXJuIFsyODQsIGxlbmd0aCAtIDIyNywgNV07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoID09PSAyNTgpOiByZXR1cm4gWzI4NSwgbGVuZ3RoIC0gMjU4LCAwXTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiB0aHJvdyAnaW52YWxpZCBsZW5ndGg6ICcgKyBsZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhYmxlO1xufSkoKSk7XG5cbi8qKlxuICog6Led6Zui56ym5Y+344OG44O844OW44OrXG4gKiBAcGFyYW0geyFudW1iZXJ9IGRpc3Qg6Led6ZuiLlxuICogQHJldHVybiB7IUFycmF5LjxudW1iZXI+fSDjgrPjg7zjg4njgIHmi6HlvLXjg5Pjg4Pjg4jjgIHmi6HlvLXjg5Pjg4Pjg4jplbfjga7phY3liJcuXG4gKiBAcHJpdmF0ZVxuICovXG5abGliLlJhd0RlZmxhdGUuTHo3N01hdGNoLnByb3RvdHlwZS5nZXREaXN0YW5jZUNvZGVfID0gZnVuY3Rpb24oZGlzdCkge1xuICAvKiogQHR5cGUgeyFBcnJheS48bnVtYmVyPn0gZGlzdGFuY2UgY29kZSB0YWJsZS4gKi9cbiAgdmFyIHI7XG5cbiAgc3dpdGNoICh0cnVlKSB7XG4gICAgY2FzZSAoZGlzdCA9PT0gMSk6IHIgPSBbMCwgZGlzdCAtIDEsIDBdOyBicmVhaztcbiAgICBjYXNlIChkaXN0ID09PSAyKTogciA9IFsxLCBkaXN0IC0gMiwgMF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPT09IDMpOiByID0gWzIsIGRpc3QgLSAzLCAwXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA9PT0gNCk6IHIgPSBbMywgZGlzdCAtIDQsIDBdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDYpOiByID0gWzQsIGRpc3QgLSA1LCAxXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA4KTogciA9IFs1LCBkaXN0IC0gNywgMV07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMTIpOiByID0gWzYsIGRpc3QgLSA5LCAyXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAxNik6IHIgPSBbNywgZGlzdCAtIDEzLCAyXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAyNCk6IHIgPSBbOCwgZGlzdCAtIDE3LCAzXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAzMik6IHIgPSBbOSwgZGlzdCAtIDI1LCAzXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA0OCk6IHIgPSBbMTAsIGRpc3QgLSAzMywgNF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gNjQpOiByID0gWzExLCBkaXN0IC0gNDksIDRdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDk2KTogciA9IFsxMiwgZGlzdCAtIDY1LCA1XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAxMjgpOiByID0gWzEzLCBkaXN0IC0gOTcsIDVdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDE5Mik6IHIgPSBbMTQsIGRpc3QgLSAxMjksIDZdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDI1Nik6IHIgPSBbMTUsIGRpc3QgLSAxOTMsIDZdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDM4NCk6IHIgPSBbMTYsIGRpc3QgLSAyNTcsIDddOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDUxMik6IHIgPSBbMTcsIGRpc3QgLSAzODUsIDddOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDc2OCk6IHIgPSBbMTgsIGRpc3QgLSA1MTMsIDhdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDEwMjQpOiByID0gWzE5LCBkaXN0IC0gNzY5LCA4XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAxNTM2KTogciA9IFsyMCwgZGlzdCAtIDEwMjUsIDldOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDIwNDgpOiByID0gWzIxLCBkaXN0IC0gMTUzNywgOV07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMzA3Mik6IHIgPSBbMjIsIGRpc3QgLSAyMDQ5LCAxMF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gNDA5Nik6IHIgPSBbMjMsIGRpc3QgLSAzMDczLCAxMF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gNjE0NCk6IHIgPSBbMjQsIGRpc3QgLSA0MDk3LCAxMV07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gODE5Mik6IHIgPSBbMjUsIGRpc3QgLSA2MTQ1LCAxMV07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMTIyODgpOiByID0gWzI2LCBkaXN0IC0gODE5MywgMTJdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDE2Mzg0KTogciA9IFsyNywgZGlzdCAtIDEyMjg5LCAxMl07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMjQ1NzYpOiByID0gWzI4LCBkaXN0IC0gMTYzODUsIDEzXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAzMjc2OCk6IHIgPSBbMjksIGRpc3QgLSAyNDU3NywgMTNdOyBicmVhaztcbiAgICBkZWZhdWx0OiB0aHJvdyAnaW52YWxpZCBkaXN0YW5jZSc7XG4gIH1cblxuICByZXR1cm4gcjtcbn07XG5cbi8qKlxuICog44Oe44OD44OB5oOF5aCx44KSIExaNzcg56ym5Y+35YyW6YWN5YiX44Gn6L+U44GZLlxuICog44Gq44GK44CB44GT44GT44Gn44Gv5Lul5LiL44Gu5YaF6YOo5LuV5qeY44Gn56ym5Y+35YyW44GX44Gm44GE44KLXG4gKiBbIENPREUsIEVYVFJBLUJJVC1MRU4sIEVYVFJBLCBDT0RFLCBFWFRSQS1CSVQtTEVOLCBFWFRSQSBdXG4gKiBAcmV0dXJuIHshQXJyYXkuPG51bWJlcj59IExaNzcg56ym5Y+35YyWIGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2gucHJvdG90eXBlLnRvTHo3N0FycmF5ID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgZGlzdCA9IHRoaXMuYmFja3dhcmREaXN0YW5jZTtcbiAgLyoqIEB0eXBlIHtBcnJheX0gKi9cbiAgdmFyIGNvZGVBcnJheSA9IFtdO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHBvcyA9IDA7XG4gIC8qKiBAdHlwZSB7IUFycmF5LjxudW1iZXI+fSAqL1xuICB2YXIgY29kZTtcblxuICAvLyBsZW5ndGhcbiAgY29kZSA9IFpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2guTGVuZ3RoQ29kZVRhYmxlW2xlbmd0aF07XG4gIGNvZGVBcnJheVtwb3MrK10gPSBjb2RlICYgMHhmZmZmO1xuICBjb2RlQXJyYXlbcG9zKytdID0gKGNvZGUgPj4gMTYpICYgMHhmZjtcbiAgY29kZUFycmF5W3BvcysrXSA9IGNvZGUgPj4gMjQ7XG5cbiAgLy8gZGlzdGFuY2VcbiAgY29kZSA9IHRoaXMuZ2V0RGlzdGFuY2VDb2RlXyhkaXN0KTtcbiAgY29kZUFycmF5W3BvcysrXSA9IGNvZGVbMF07XG4gIGNvZGVBcnJheVtwb3MrK10gPSBjb2RlWzFdO1xuICBjb2RlQXJyYXlbcG9zKytdID0gY29kZVsyXTtcblxuICByZXR1cm4gY29kZUFycmF5O1xufTtcblxuLyoqXG4gKiBMWjc3IOWun+ijhVxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBkYXRhQXJyYXkgTFo3NyDnrKblj7fljJbjgZnjgovjg5DjgqTjg4jphY3liJcuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gTFo3NyDnrKblj7fljJbjgZfjgZ/phY3liJcuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubHo3NyA9IGZ1bmN0aW9uKGRhdGFBcnJheSkge1xuICAvKiogQHR5cGUge251bWJlcn0gaW5wdXQgcG9zaXRpb24gKi9cbiAgdmFyIHBvc2l0aW9uO1xuICAvKiogQHR5cGUge251bWJlcn0gaW5wdXQgbGVuZ3RoICovXG4gIHZhciBsZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIgKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGxpbWl0ZXIgKi9cbiAgdmFyIGlsO1xuICAvKiogQHR5cGUge251bWJlcn0gY2hhaW5lZC1oYXNoLXRhYmxlIGtleSAqL1xuICB2YXIgbWF0Y2hLZXk7XG4gIC8qKiBAdHlwZSB7T2JqZWN0LjxudW1iZXIsIEFycmF5LjxudW1iZXI+Pn0gY2hhaW5lZC1oYXNoLXRhYmxlICovXG4gIHZhciB0YWJsZSA9IHt9O1xuICAvKiogQGNvbnN0IEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciB3aW5kb3dTaXplID0gWmxpYi5SYXdEZWZsYXRlLldpbmRvd1NpemU7XG4gIC8qKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59IG1hdGNoIGxpc3QgKi9cbiAgdmFyIG1hdGNoTGlzdDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGUuTHo3N01hdGNofSBsb25nZXN0IG1hdGNoICovXG4gIHZhciBsb25nZXN0TWF0Y2g7XG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaH0gcHJldmlvdXMgbG9uZ2VzdCBtYXRjaCAqL1xuICB2YXIgcHJldk1hdGNoO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSBsejc3IGJ1ZmZlciAqL1xuICB2YXIgbHo3N2J1ZiA9IFVTRV9UWVBFREFSUkFZID9cbiAgICBuZXcgVWludDE2QXJyYXkoZGF0YUFycmF5Lmxlbmd0aCAqIDIpIDogW107XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsejc3IG91dHB1dCBidWZmZXIgcG9pbnRlciAqL1xuICB2YXIgcG9zID0gMDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGx6Nzcgc2tpcCBsZW5ndGggKi9cbiAgdmFyIHNraXBMZW5ndGggPSAwO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqL1xuICB2YXIgZnJlcXNMaXRMZW4gPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDMyQXJyYXkgOiBBcnJheSkoMjg2KTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi9cbiAgdmFyIGZyZXFzRGlzdCA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50MzJBcnJheSA6IEFycmF5KSgzMCk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGF6eSA9IHRoaXMubGF6eTtcbiAgLyoqIEB0eXBlIHsqfSB0ZW1wb3JhcnkgdmFyaWFibGUgKi9cbiAgdmFyIHRtcDtcblxuICAvLyDliJ3mnJ/ljJZcbiAgaWYgKCFVU0VfVFlQRURBUlJBWSkge1xuICAgIGZvciAoaSA9IDA7IGkgPD0gMjg1OykgeyBmcmVxc0xpdExlbltpKytdID0gMDsgfVxuICAgIGZvciAoaSA9IDA7IGkgPD0gMjk7KSB7IGZyZXFzRGlzdFtpKytdID0gMDsgfVxuICB9XG4gIGZyZXFzTGl0TGVuWzI1Nl0gPSAxOyAvLyBFT0Ig44Gu5pyA5L2O5Ye654++5Zue5pWw44GvIDFcblxuICAvKipcbiAgICog44Oe44OD44OB44OH44O844K/44Gu5pu444GN6L6844G/XG4gICAqIEBwYXJhbSB7WmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaH0gbWF0Y2ggTFo3NyBNYXRjaCBkYXRhLlxuICAgKiBAcGFyYW0geyFudW1iZXJ9IG9mZnNldCDjgrnjgq3jg4Pjg5fplovlp4vkvY3nva4o55u45a++5oyH5a6aKS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZ1bmN0aW9uIHdyaXRlTWF0Y2gobWF0Y2gsIG9mZnNldCkge1xuICAgIC8qKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59ICovXG4gICAgdmFyIGx6NzdBcnJheSA9IG1hdGNoLnRvTHo3N0FycmF5KCk7XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgdmFyIGk7XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgdmFyIGlsO1xuXG4gICAgZm9yIChpID0gMCwgaWwgPSBsejc3QXJyYXkubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgICAgbHo3N2J1Zltwb3MrK10gPSBsejc3QXJyYXlbaV07XG4gICAgfVxuICAgIGZyZXFzTGl0TGVuW2x6NzdBcnJheVswXV0rKztcbiAgICBmcmVxc0Rpc3RbbHo3N0FycmF5WzNdXSsrO1xuICAgIHNraXBMZW5ndGggPSBtYXRjaC5sZW5ndGggKyBvZmZzZXQgLSAxO1xuICAgIHByZXZNYXRjaCA9IG51bGw7XG4gIH1cblxuICAvLyBMWjc3IOespuWPt+WMllxuICBmb3IgKHBvc2l0aW9uID0gMCwgbGVuZ3RoID0gZGF0YUFycmF5Lmxlbmd0aDsgcG9zaXRpb24gPCBsZW5ndGg7ICsrcG9zaXRpb24pIHtcbiAgICAvLyDjg4/jg4Pjgrfjg6Xjgq3jg7zjga7kvZzmiJBcbiAgICBmb3IgKG1hdGNoS2V5ID0gMCwgaSA9IDAsIGlsID0gWmxpYi5SYXdEZWZsYXRlLkx6NzdNaW5MZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICBpZiAocG9zaXRpb24gKyBpID09PSBsZW5ndGgpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBtYXRjaEtleSA9IChtYXRjaEtleSA8PCA4KSB8IGRhdGFBcnJheVtwb3NpdGlvbiArIGldO1xuICAgIH1cblxuICAgIC8vIOODhuODvOODluODq+OBjOacquWumue+qeOBoOOBo+OBn+OCieS9nOaIkOOBmeOCi1xuICAgIGlmICh0YWJsZVttYXRjaEtleV0gPT09IHZvaWQgMCkgeyB0YWJsZVttYXRjaEtleV0gPSBbXTsgfVxuICAgIG1hdGNoTGlzdCA9IHRhYmxlW21hdGNoS2V5XTtcblxuICAgIC8vIHNraXBcbiAgICBpZiAoc2tpcExlbmd0aC0tID4gMCkge1xuICAgICAgbWF0Y2hMaXN0LnB1c2gocG9zaXRpb24pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8g44Oe44OD44OB44OG44O844OW44Or44Gu5pu05pawICjmnIDlpKfmiLvjgorot53pm6LjgpLotoXjgYjjgabjgYTjgovjgoLjga7jgpLliYrpmaTjgZnjgospXG4gICAgd2hpbGUgKG1hdGNoTGlzdC5sZW5ndGggPiAwICYmIHBvc2l0aW9uIC0gbWF0Y2hMaXN0WzBdID4gd2luZG93U2l6ZSkge1xuICAgICAgbWF0Y2hMaXN0LnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgLy8g44OH44O844K/5pyr5bC+44Gn44Oe44OD44OB44GX44KI44GG44GM44Gq44GE5aC05ZCI44Gv44Gd44Gu44G+44G+5rWB44GX44GT44KAXG4gICAgaWYgKHBvc2l0aW9uICsgWmxpYi5SYXdEZWZsYXRlLkx6NzdNaW5MZW5ndGggPj0gbGVuZ3RoKSB7XG4gICAgICBpZiAocHJldk1hdGNoKSB7XG4gICAgICAgIHdyaXRlTWF0Y2gocHJldk1hdGNoLCAtMSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDAsIGlsID0gbGVuZ3RoIC0gcG9zaXRpb247IGkgPCBpbDsgKytpKSB7XG4gICAgICAgIHRtcCA9IGRhdGFBcnJheVtwb3NpdGlvbiArIGldO1xuICAgICAgICBsejc3YnVmW3BvcysrXSA9IHRtcDtcbiAgICAgICAgKytmcmVxc0xpdExlblt0bXBdO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8g44Oe44OD44OB5YCZ6KOc44GL44KJ5pyA6ZW344Gu44KC44Gu44KS5o6i44GZXG4gICAgaWYgKG1hdGNoTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICBsb25nZXN0TWF0Y2ggPSB0aGlzLnNlYXJjaExvbmdlc3RNYXRjaF8oZGF0YUFycmF5LCBwb3NpdGlvbiwgbWF0Y2hMaXN0KTtcblxuICAgICAgaWYgKHByZXZNYXRjaCkge1xuICAgICAgICAvLyDnj77lnKjjga7jg57jg4Pjg4Hjga7mlrnjgYzliY3lm57jga7jg57jg4Pjg4HjgojjgorjgoLplbfjgYRcbiAgICAgICAgaWYgKHByZXZNYXRjaC5sZW5ndGggPCBsb25nZXN0TWF0Y2gubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gd3JpdGUgcHJldmlvdXMgbGl0ZXJhbFxuICAgICAgICAgIHRtcCA9IGRhdGFBcnJheVtwb3NpdGlvbiAtIDFdO1xuICAgICAgICAgIGx6NzdidWZbcG9zKytdID0gdG1wO1xuICAgICAgICAgICsrZnJlcXNMaXRMZW5bdG1wXTtcblxuICAgICAgICAgIC8vIHdyaXRlIGN1cnJlbnQgbWF0Y2hcbiAgICAgICAgICB3cml0ZU1hdGNoKGxvbmdlc3RNYXRjaCwgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gd3JpdGUgcHJldmlvdXMgbWF0Y2hcbiAgICAgICAgICB3cml0ZU1hdGNoKHByZXZNYXRjaCwgLTEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGxvbmdlc3RNYXRjaC5sZW5ndGggPCBsYXp5KSB7XG4gICAgICAgIHByZXZNYXRjaCA9IGxvbmdlc3RNYXRjaDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdyaXRlTWF0Y2gobG9uZ2VzdE1hdGNoLCAwKTtcbiAgICAgIH1cbiAgICAvLyDliY3lm57jg57jg4Pjg4HjgZfjgabjgYTjgabku4rlm57jg57jg4Pjg4HjgYzjgarjgYvjgaPjgZ/jgonliY3lm57jga7jgpLmjqHnlKhcbiAgICB9IGVsc2UgaWYgKHByZXZNYXRjaCkge1xuICAgICAgd3JpdGVNYXRjaChwcmV2TWF0Y2gsIC0xKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wID0gZGF0YUFycmF5W3Bvc2l0aW9uXTtcbiAgICAgIGx6NzdidWZbcG9zKytdID0gdG1wO1xuICAgICAgKytmcmVxc0xpdExlblt0bXBdO1xuICAgIH1cblxuICAgIG1hdGNoTGlzdC5wdXNoKHBvc2l0aW9uKTsgLy8g44Oe44OD44OB44OG44O844OW44Or44Gr54++5Zyo44Gu5L2N572u44KS5L+d5a2YXG4gIH1cblxuICAvLyDntYLnq6/lh6bnkIZcbiAgbHo3N2J1Zltwb3MrK10gPSAyNTY7XG4gIGZyZXFzTGl0TGVuWzI1Nl0rKztcbiAgdGhpcy5mcmVxc0xpdExlbiA9IGZyZXFzTGl0TGVuO1xuICB0aGlzLmZyZXFzRGlzdCA9IGZyZXFzRGlzdDtcblxuICByZXR1cm4gLyoqIEB0eXBlIHshKFVpbnQxNkFycmF5fEFycmF5LjxudW1iZXI+KX0gKi8gKFxuICAgIFVTRV9UWVBFREFSUkFZID8gIGx6NzdidWYuc3ViYXJyYXkoMCwgcG9zKSA6IGx6NzdidWZcbiAgKTtcbn07XG5cbi8qKlxuICog44Oe44OD44OB44GX44Gf5YCZ6KOc44Gu5Lit44GL44KJ5pyA6ZW35LiA6Ie044KS5o6i44GZXG4gKiBAcGFyYW0geyFPYmplY3R9IGRhdGEgcGxhaW4gZGF0YSBieXRlIGFycmF5LlxuICogQHBhcmFtIHshbnVtYmVyfSBwb3NpdGlvbiBwbGFpbiBkYXRhIGJ5dGUgYXJyYXkgcG9zaXRpb24uXG4gKiBAcGFyYW0geyFBcnJheS48bnVtYmVyPn0gbWF0Y2hMaXN0IOWAmeijnOOBqOOBquOCi+S9jee9ruOBrumFjeWIly5cbiAqIEByZXR1cm4geyFabGliLlJhd0RlZmxhdGUuTHo3N01hdGNofSDmnIDplbfjgYvjgaTmnIDnn63ot53pm6Ljga7jg57jg4Pjg4Hjgqrjg5bjgrjjgqfjgq/jg4guXG4gKiBAcHJpdmF0ZVxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLnNlYXJjaExvbmdlc3RNYXRjaF8gPVxuZnVuY3Rpb24oZGF0YSwgcG9zaXRpb24sIG1hdGNoTGlzdCkge1xuICB2YXIgbWF0Y2gsXG4gICAgICBjdXJyZW50TWF0Y2gsXG4gICAgICBtYXRjaE1heCA9IDAsIG1hdGNoTGVuZ3RoLFxuICAgICAgaSwgaiwgbCwgZGwgPSBkYXRhLmxlbmd0aDtcblxuICAvLyDlgJnoo5zjgpLlvozjgo3jgYvjgokgMSDjgaTjgZrjgaTntZ7jgorovrzjgpPjgafjgobjgY9cbiAgcGVybWF0Y2g6XG4gIGZvciAoaSA9IDAsIGwgPSBtYXRjaExpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgbWF0Y2ggPSBtYXRjaExpc3RbbCAtIGkgLSAxXTtcbiAgICBtYXRjaExlbmd0aCA9IFpsaWIuUmF3RGVmbGF0ZS5Mejc3TWluTGVuZ3RoO1xuXG4gICAgLy8g5YmN5Zue44G+44Gn44Gu5pyA6ZW35LiA6Ie044KS5pyr5bC+44GL44KJ5LiA6Ie05qSc57Si44GZ44KLXG4gICAgaWYgKG1hdGNoTWF4ID4gWmxpYi5SYXdEZWZsYXRlLkx6NzdNaW5MZW5ndGgpIHtcbiAgICAgIGZvciAoaiA9IG1hdGNoTWF4OyBqID4gWmxpYi5SYXdEZWZsYXRlLkx6NzdNaW5MZW5ndGg7IGotLSkge1xuICAgICAgICBpZiAoZGF0YVttYXRjaCArIGogLSAxXSAhPT0gZGF0YVtwb3NpdGlvbiArIGogLSAxXSkge1xuICAgICAgICAgIGNvbnRpbnVlIHBlcm1hdGNoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBtYXRjaExlbmd0aCA9IG1hdGNoTWF4O1xuICAgIH1cblxuICAgIC8vIOacgOmVt+S4gOiHtOaOoue0olxuICAgIHdoaWxlIChtYXRjaExlbmd0aCA8IFpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF4TGVuZ3RoICYmXG4gICAgICAgICAgIHBvc2l0aW9uICsgbWF0Y2hMZW5ndGggPCBkbCAmJlxuICAgICAgICAgICBkYXRhW21hdGNoICsgbWF0Y2hMZW5ndGhdID09PSBkYXRhW3Bvc2l0aW9uICsgbWF0Y2hMZW5ndGhdKSB7XG4gICAgICArK21hdGNoTGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIOODnuODg+ODgemVt+OBjOWQjOOBmOWgtOWQiOOBr+W+jOaWueOCkuWEquWFiFxuICAgIGlmIChtYXRjaExlbmd0aCA+IG1hdGNoTWF4KSB7XG4gICAgICBjdXJyZW50TWF0Y2ggPSBtYXRjaDtcbiAgICAgIG1hdGNoTWF4ID0gbWF0Y2hMZW5ndGg7XG4gICAgfVxuXG4gICAgLy8g5pyA6ZW344GM56K65a6a44GX44Gf44KJ5b6M44Gu5Yem55CG44Gv55yB55WlXG4gICAgaWYgKG1hdGNoTGVuZ3RoID09PSBabGliLlJhd0RlZmxhdGUuTHo3N01heExlbmd0aCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBabGliLlJhd0RlZmxhdGUuTHo3N01hdGNoKG1hdGNoTWF4LCBwb3NpdGlvbiAtIGN1cnJlbnRNYXRjaCk7XG59O1xuXG4vKipcbiAqIFRyZWUtVHJhbnNtaXQgU3ltYm9scyDjga7nrpflh7pcbiAqIHJlZmVyZW5jZTogUHVUVFkgRGVmbGF0ZSBpbXBsZW1lbnRhdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IGhsaXQgSExJVC5cbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gbGl0bGVuTGVuZ3RocyDjg6rjg4bjg6njg6vjgajplbfjgZXnrKblj7fjga7nrKblj7fplbfphY3liJcuXG4gKiBAcGFyYW0ge251bWJlcn0gaGRpc3QgSERJU1QuXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGRpc3RMZW5ndGhzIOi3nembouespuWPt+OBruespuWPt+mVt+mFjeWIly5cbiAqIEByZXR1cm4ge3tcbiAqICAgY29kZXM6ICEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpLFxuICogICBmcmVxczogIShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KVxuICogfX0gVHJlZS1UcmFuc21pdCBTeW1ib2xzLlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmdldFRyZWVTeW1ib2xzXyA9XG5mdW5jdGlvbihobGl0LCBsaXRsZW5MZW5ndGhzLCBoZGlzdCwgZGlzdExlbmd0aHMpIHtcbiAgdmFyIHNyYyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50MzJBcnJheSA6IEFycmF5KShobGl0ICsgaGRpc3QpLFxuICAgICAgaSwgaiwgcnVuTGVuZ3RoLCBsLFxuICAgICAgcmVzdWx0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQzMkFycmF5IDogQXJyYXkpKDI4NiArIDMwKSxcbiAgICAgIG5SZXN1bHQsXG4gICAgICBycHQsXG4gICAgICBmcmVxcyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKDE5KTtcblxuICBqID0gMDtcbiAgZm9yIChpID0gMDsgaSA8IGhsaXQ7IGkrKykge1xuICAgIHNyY1tqKytdID0gbGl0bGVuTGVuZ3Roc1tpXTtcbiAgfVxuICBmb3IgKGkgPSAwOyBpIDwgaGRpc3Q7IGkrKykge1xuICAgIHNyY1tqKytdID0gZGlzdExlbmd0aHNbaV07XG4gIH1cblxuICAvLyDliJ3mnJ/ljJZcbiAgaWYgKCFVU0VfVFlQRURBUlJBWSkge1xuICAgIGZvciAoaSA9IDAsIGwgPSBmcmVxcy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgIGZyZXFzW2ldID0gMDtcbiAgICB9XG4gIH1cblxuICAvLyDnrKblj7fljJZcbiAgblJlc3VsdCA9IDA7XG4gIGZvciAoaSA9IDAsIGwgPSBzcmMubGVuZ3RoOyBpIDwgbDsgaSArPSBqKSB7XG4gICAgLy8gUnVuIExlbmd0aCBFbmNvZGluZ1xuICAgIGZvciAoaiA9IDE7IGkgKyBqIDwgbCAmJiBzcmNbaSArIGpdID09PSBzcmNbaV07ICsraikge31cblxuICAgIHJ1bkxlbmd0aCA9IGo7XG5cbiAgICBpZiAoc3JjW2ldID09PSAwKSB7XG4gICAgICAvLyAwIOOBrue5sOOCiui/lOOBl+OBjCAzIOWbnuacqua6gOOBquOCieOBsOOBneOBruOBvuOBvlxuICAgICAgaWYgKHJ1bkxlbmd0aCA8IDMpIHtcbiAgICAgICAgd2hpbGUgKHJ1bkxlbmd0aC0tID4gMCkge1xuICAgICAgICAgIHJlc3VsdFtuUmVzdWx0KytdID0gMDtcbiAgICAgICAgICBmcmVxc1swXSsrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aGlsZSAocnVuTGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIOe5sOOCiui/lOOBl+OBr+acgOWkpyAxMzgg44G+44Gn44Gq44Gu44Gn5YiH44KK6Kmw44KB44KLXG4gICAgICAgICAgcnB0ID0gKHJ1bkxlbmd0aCA8IDEzOCA/IHJ1bkxlbmd0aCA6IDEzOCk7XG5cbiAgICAgICAgICBpZiAocnB0ID4gcnVuTGVuZ3RoIC0gMyAmJiBycHQgPCBydW5MZW5ndGgpIHtcbiAgICAgICAgICAgIHJwdCA9IHJ1bkxlbmd0aCAtIDM7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gMy0xMCDlm54gLT4gMTdcbiAgICAgICAgICBpZiAocnB0IDw9IDEwKSB7XG4gICAgICAgICAgICByZXN1bHRbblJlc3VsdCsrXSA9IDE3O1xuICAgICAgICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBycHQgLSAzO1xuICAgICAgICAgICAgZnJlcXNbMTddKys7XG4gICAgICAgICAgLy8gMTEtMTM4IOWbniAtPiAxOFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRbblJlc3VsdCsrXSA9IDE4O1xuICAgICAgICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBycHQgLSAxMTtcbiAgICAgICAgICAgIGZyZXFzWzE4XSsrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJ1bkxlbmd0aCAtPSBycHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBzcmNbaV07XG4gICAgICBmcmVxc1tzcmNbaV1dKys7XG4gICAgICBydW5MZW5ndGgtLTtcblxuICAgICAgLy8g57mw44KK6L+U44GX5Zue5pWw44GMM+Wbnuacqua6gOOBquOCieOBsOODqeODs+ODrOODs+OCsOOCueespuWPt+OBr+imgeOCieOBquOBhFxuICAgICAgaWYgKHJ1bkxlbmd0aCA8IDMpIHtcbiAgICAgICAgd2hpbGUgKHJ1bkxlbmd0aC0tID4gMCkge1xuICAgICAgICAgIHJlc3VsdFtuUmVzdWx0KytdID0gc3JjW2ldO1xuICAgICAgICAgIGZyZXFzW3NyY1tpXV0rKztcbiAgICAgICAgfVxuICAgICAgLy8gMyDlm57ku6XkuIrjgarjgonjgbDjg6njg7Pjg6zjg7PjgrDjgrnnrKblj7fljJZcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChydW5MZW5ndGggPiAwKSB7XG4gICAgICAgICAgLy8gcnVuTGVuZ3Ro44KSIDMtNiDjgafliIblibJcbiAgICAgICAgICBycHQgPSAocnVuTGVuZ3RoIDwgNiA/IHJ1bkxlbmd0aCA6IDYpO1xuXG4gICAgICAgICAgaWYgKHJwdCA+IHJ1bkxlbmd0aCAtIDMgJiYgcnB0IDwgcnVuTGVuZ3RoKSB7XG4gICAgICAgICAgICBycHQgPSBydW5MZW5ndGggLSAzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdFtuUmVzdWx0KytdID0gMTY7XG4gICAgICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBycHQgLSAzO1xuICAgICAgICAgIGZyZXFzWzE2XSsrO1xuXG4gICAgICAgICAgcnVuTGVuZ3RoIC09IHJwdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29kZXM6XG4gICAgICBVU0VfVFlQRURBUlJBWSA/IHJlc3VsdC5zdWJhcnJheSgwLCBuUmVzdWx0KSA6IHJlc3VsdC5zbGljZSgwLCBuUmVzdWx0KSxcbiAgICBmcmVxczogZnJlcXNcbiAgfTtcbn07XG5cbi8qKlxuICog44OP44OV44Oe44Oz56ym5Y+344Gu6ZW344GV44KS5Y+W5b6X44GZ44KLXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheXxVaW50MzJBcnJheSl9IGZyZXFzIOWHuuePvuOCq+OCpuODs+ODiC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCDnrKblj7fplbfjga7liLbpmZAuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSDnrKblj7fplbfphY3liJcuXG4gKiBAcHJpdmF0ZVxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmdldExlbmd0aHNfID0gZnVuY3Rpb24oZnJlcXMsIGxpbWl0KSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgblN5bWJvbHMgPSBmcmVxcy5sZW5ndGg7XG4gIC8qKiBAdHlwZSB7WmxpYi5IZWFwfSAqL1xuICB2YXIgaGVhcCA9IG5ldyBabGliLkhlYXAoMiAqIFpsaWIuUmF3RGVmbGF0ZS5IVUZNQVgpO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBsZW5ndGggPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShuU3ltYm9scyk7XG4gIC8qKiBAdHlwZSB7QXJyYXl9ICovXG4gIHZhciBub2RlcztcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi9cbiAgdmFyIHZhbHVlcztcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgY29kZUxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlsO1xuXG4gIC8vIOmFjeWIl+OBruWIneacn+WMllxuICBpZiAoIVVTRV9UWVBFREFSUkFZKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG5TeW1ib2xzOyBpKyspIHtcbiAgICAgIGxlbmd0aFtpXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgLy8g44OS44O844OX44Gu5qeL56+JXG4gIGZvciAoaSA9IDA7IGkgPCBuU3ltYm9sczsgKytpKSB7XG4gICAgaWYgKGZyZXFzW2ldID4gMCkge1xuICAgICAgaGVhcC5wdXNoKGksIGZyZXFzW2ldKTtcbiAgICB9XG4gIH1cbiAgbm9kZXMgPSBuZXcgQXJyYXkoaGVhcC5sZW5ndGggLyAyKTtcbiAgdmFsdWVzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQzMkFycmF5IDogQXJyYXkpKGhlYXAubGVuZ3RoIC8gMik7XG5cbiAgLy8g6Z2eIDAg44Gu6KaB57Sg44GM5LiA44Gk44Gg44GR44Gg44Gj44Gf5aC05ZCI44Gv44CB44Gd44Gu44K344Oz44Oc44Or44Gr56ym5Y+36ZW3IDEg44KS5Ymy44KK5b2T44Gm44Gm57WC5LqGXG4gIGlmIChub2Rlcy5sZW5ndGggPT09IDEpIHtcbiAgICBsZW5ndGhbaGVhcC5wb3AoKS5pbmRleF0gPSAxO1xuICAgIHJldHVybiBsZW5ndGg7XG4gIH1cblxuICAvLyBSZXZlcnNlIFBhY2thZ2UgTWVyZ2UgQWxnb3JpdGhtIOOBq+OCiOOCiyBDYW5vbmljYWwgSHVmZm1hbiBDb2RlIOOBruespuWPt+mVt+axuuWumlxuICBmb3IgKGkgPSAwLCBpbCA9IGhlYXAubGVuZ3RoIC8gMjsgaSA8IGlsOyArK2kpIHtcbiAgICBub2Rlc1tpXSA9IGhlYXAucG9wKCk7XG4gICAgdmFsdWVzW2ldID0gbm9kZXNbaV0udmFsdWU7XG4gIH1cbiAgY29kZUxlbmd0aCA9IHRoaXMucmV2ZXJzZVBhY2thZ2VNZXJnZV8odmFsdWVzLCB2YWx1ZXMubGVuZ3RoLCBsaW1pdCk7XG5cbiAgZm9yIChpID0gMCwgaWwgPSBub2Rlcy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgbGVuZ3RoW25vZGVzW2ldLmluZGV4XSA9IGNvZGVMZW5ndGhbaV07XG4gIH1cblxuICByZXR1cm4gbGVuZ3RoO1xufTtcblxuLyoqXG4gKiBSZXZlcnNlIFBhY2thZ2UgTWVyZ2UgQWxnb3JpdGhtLlxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gZnJlcXMgc29ydGVkIHByb2JhYmlsaXR5LlxuICogQHBhcmFtIHtudW1iZXJ9IHN5bWJvbHMgbnVtYmVyIG9mIHN5bWJvbHMuXG4gKiBAcGFyYW0ge251bWJlcn0gbGltaXQgY29kZSBsZW5ndGggbGltaXQuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBjb2RlIGxlbmd0aHMuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUucmV2ZXJzZVBhY2thZ2VNZXJnZV8gPSBmdW5jdGlvbihmcmVxcywgc3ltYm9scywgbGltaXQpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gKi9cbiAgdmFyIG1pbmltdW1Db3N0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQxNkFycmF5IDogQXJyYXkpKGxpbWl0KTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgZmxhZyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKGxpbWl0KTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgY29kZUxlbmd0aCA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKHN5bWJvbHMpO1xuICAvKiogQHR5cGUge0FycmF5fSAqL1xuICB2YXIgdmFsdWUgPSBuZXcgQXJyYXkobGltaXQpO1xuICAvKiogQHR5cGUge0FycmF5fSAqL1xuICB2YXIgdHlwZSAgPSBuZXcgQXJyYXkobGltaXQpO1xuICAvKiogQHR5cGUge0FycmF5LjxudW1iZXI+fSAqL1xuICB2YXIgY3VycmVudFBvc2l0aW9uID0gbmV3IEFycmF5KGxpbWl0KTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBleGNlc3MgPSAoMSA8PCBsaW1pdCkgLSBzeW1ib2xzO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGhhbGYgPSAoMSA8PCAobGltaXQgLSAxKSk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBqO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgd2VpZ2h0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG5leHQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBqXG4gICAqL1xuICBmdW5jdGlvbiB0YWtlUGFja2FnZShqKSB7XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgdmFyIHggPSB0eXBlW2pdW2N1cnJlbnRQb3NpdGlvbltqXV07XG5cbiAgICBpZiAoeCA9PT0gc3ltYm9scykge1xuICAgICAgdGFrZVBhY2thZ2UoaisxKTtcbiAgICAgIHRha2VQYWNrYWdlKGorMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC0tY29kZUxlbmd0aFt4XTtcbiAgICB9XG5cbiAgICArK2N1cnJlbnRQb3NpdGlvbltqXTtcbiAgfVxuXG4gIG1pbmltdW1Db3N0W2xpbWl0LTFdID0gc3ltYm9scztcblxuICBmb3IgKGogPSAwOyBqIDwgbGltaXQ7ICsraikge1xuICAgIGlmIChleGNlc3MgPCBoYWxmKSB7XG4gICAgICBmbGFnW2pdID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgZmxhZ1tqXSA9IDE7XG4gICAgICBleGNlc3MgLT0gaGFsZjtcbiAgICB9XG4gICAgZXhjZXNzIDw8PSAxO1xuICAgIG1pbmltdW1Db3N0W2xpbWl0LTItal0gPSAobWluaW11bUNvc3RbbGltaXQtMS1qXSAvIDIgfCAwKSArIHN5bWJvbHM7XG4gIH1cbiAgbWluaW11bUNvc3RbMF0gPSBmbGFnWzBdO1xuXG4gIHZhbHVlWzBdID0gbmV3IEFycmF5KG1pbmltdW1Db3N0WzBdKTtcbiAgdHlwZVswXSAgPSBuZXcgQXJyYXkobWluaW11bUNvc3RbMF0pO1xuICBmb3IgKGogPSAxOyBqIDwgbGltaXQ7ICsraikge1xuICAgIGlmIChtaW5pbXVtQ29zdFtqXSA+IDIgKiBtaW5pbXVtQ29zdFtqLTFdICsgZmxhZ1tqXSkge1xuICAgICAgbWluaW11bUNvc3Rbal0gPSAyICogbWluaW11bUNvc3Rbai0xXSArIGZsYWdbal07XG4gICAgfVxuICAgIHZhbHVlW2pdID0gbmV3IEFycmF5KG1pbmltdW1Db3N0W2pdKTtcbiAgICB0eXBlW2pdICA9IG5ldyBBcnJheShtaW5pbXVtQ29zdFtqXSk7XG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgc3ltYm9sczsgKytpKSB7XG4gICAgY29kZUxlbmd0aFtpXSA9IGxpbWl0O1xuICB9XG5cbiAgZm9yICh0ID0gMDsgdCA8IG1pbmltdW1Db3N0W2xpbWl0LTFdOyArK3QpIHtcbiAgICB2YWx1ZVtsaW1pdC0xXVt0XSA9IGZyZXFzW3RdO1xuICAgIHR5cGVbbGltaXQtMV1bdF0gID0gdDtcbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBsaW1pdDsgKytpKSB7XG4gICAgY3VycmVudFBvc2l0aW9uW2ldID0gMDtcbiAgfVxuICBpZiAoZmxhZ1tsaW1pdC0xXSA9PT0gMSkge1xuICAgIC0tY29kZUxlbmd0aFswXTtcbiAgICArK2N1cnJlbnRQb3NpdGlvbltsaW1pdC0xXTtcbiAgfVxuXG4gIGZvciAoaiA9IGxpbWl0LTI7IGogPj0gMDsgLS1qKSB7XG4gICAgaSA9IDA7XG4gICAgd2VpZ2h0ID0gMDtcbiAgICBuZXh0ID0gY3VycmVudFBvc2l0aW9uW2orMV07XG5cbiAgICBmb3IgKHQgPSAwOyB0IDwgbWluaW11bUNvc3Rbal07IHQrKykge1xuICAgICAgd2VpZ2h0ID0gdmFsdWVbaisxXVtuZXh0XSArIHZhbHVlW2orMV1bbmV4dCsxXTtcblxuICAgICAgaWYgKHdlaWdodCA+IGZyZXFzW2ldKSB7XG4gICAgICAgIHZhbHVlW2pdW3RdID0gd2VpZ2h0O1xuICAgICAgICB0eXBlW2pdW3RdID0gc3ltYm9scztcbiAgICAgICAgbmV4dCArPSAyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVbal1bdF0gPSBmcmVxc1tpXTtcbiAgICAgICAgdHlwZVtqXVt0XSA9IGk7XG4gICAgICAgICsraTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjdXJyZW50UG9zaXRpb25bal0gPSAwO1xuICAgIGlmIChmbGFnW2pdID09PSAxKSB7XG4gICAgICB0YWtlUGFja2FnZShqKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29kZUxlbmd0aDtcbn07XG5cbi8qKlxuICog56ym5Y+36ZW36YWN5YiX44GL44KJ44OP44OV44Oe44Oz56ym5Y+344KS5Y+W5b6X44GZ44KLXG4gKiByZWZlcmVuY2U6IFB1VFRZIERlZmxhdGUgaW1wbGVtZW50YXRpb25cbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gbGVuZ3RocyDnrKblj7fplbfphY3liJcuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0g44OP44OV44Oe44Oz56ym5Y+36YWN5YiXLlxuICogQHByaXZhdGVcbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5nZXRDb2Rlc0Zyb21MZW5ndGhzXyA9IGZ1bmN0aW9uKGxlbmd0aHMpIHtcbiAgdmFyIGNvZGVzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQxNkFycmF5IDogQXJyYXkpKGxlbmd0aHMubGVuZ3RoKSxcbiAgICAgIGNvdW50ID0gW10sXG4gICAgICBzdGFydENvZGUgPSBbXSxcbiAgICAgIGNvZGUgPSAwLCBpLCBpbCwgaiwgbTtcblxuICAvLyBDb3VudCB0aGUgY29kZXMgb2YgZWFjaCBsZW5ndGguXG4gIGZvciAoaSA9IDAsIGlsID0gbGVuZ3Rocy5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XG4gICAgY291bnRbbGVuZ3Roc1tpXV0gPSAoY291bnRbbGVuZ3Roc1tpXV0gfCAwKSArIDE7XG4gIH1cblxuICAvLyBEZXRlcm1pbmUgdGhlIHN0YXJ0aW5nIGNvZGUgZm9yIGVhY2ggbGVuZ3RoIGJsb2NrLlxuICBmb3IgKGkgPSAxLCBpbCA9IFpsaWIuUmF3RGVmbGF0ZS5NYXhDb2RlTGVuZ3RoOyBpIDw9IGlsOyBpKyspIHtcbiAgICBzdGFydENvZGVbaV0gPSBjb2RlO1xuICAgIGNvZGUgKz0gY291bnRbaV0gfCAwO1xuICAgIGNvZGUgPDw9IDE7XG4gIH1cblxuICAvLyBEZXRlcm1pbmUgdGhlIGNvZGUgZm9yIGVhY2ggc3ltYm9sLiBNaXJyb3JlZCwgb2YgY291cnNlLlxuICBmb3IgKGkgPSAwLCBpbCA9IGxlbmd0aHMubGVuZ3RoOyBpIDwgaWw7IGkrKykge1xuICAgIGNvZGUgPSBzdGFydENvZGVbbGVuZ3Roc1tpXV07XG4gICAgc3RhcnRDb2RlW2xlbmd0aHNbaV1dICs9IDE7XG4gICAgY29kZXNbaV0gPSAwO1xuXG4gICAgZm9yIChqID0gMCwgbSA9IGxlbmd0aHNbaV07IGogPCBtOyBqKyspIHtcbiAgICAgIGNvZGVzW2ldID0gKGNvZGVzW2ldIDw8IDEpIHwgKGNvZGUgJiAxKTtcbiAgICAgIGNvZGUgPj4+PSAxO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb2Rlcztcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBHWklQIChSRkMxOTUyKSDlrp/oo4UuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5HemlwJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5DUkMzMicpO1xuZ29vZy5yZXF1aXJlKCdabGliLlJhd0RlZmxhdGUnKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICovXG5abGliLkd6aXAgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGlucHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5pbnB1dCA9IGlucHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gaW5wdXQgYnVmZmVyIHBvaW50ZXIuICovXG4gIHRoaXMuaXAgPSAwO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuICovXG4gIHRoaXMub3V0cHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5vcCA9IDA7XG4gIC8qKiBAdHlwZSB7IU9iamVjdH0gZmxhZ3Mgb3B0aW9uIGZsYWdzLiAqL1xuICB0aGlzLmZsYWdzID0ge307XG4gIC8qKiBAdHlwZSB7IXN0cmluZ30gZmlsZW5hbWUuICovXG4gIHRoaXMuZmlsZW5hbWU7XG4gIC8qKiBAdHlwZSB7IXN0cmluZ30gY29tbWVudC4gKi9cbiAgdGhpcy5jb21tZW50O1xuICAvKiogQHR5cGUgeyFPYmplY3R9IGRlZmxhdGUgb3B0aW9ucy4gKi9cbiAgdGhpcy5kZWZsYXRlT3B0aW9ucztcblxuICAvLyBvcHRpb24gcGFyYW1ldGVyc1xuICBpZiAob3B0X3BhcmFtcykge1xuICAgIGlmIChvcHRfcGFyYW1zWydmbGFncyddKSB7XG4gICAgICB0aGlzLmZsYWdzID0gb3B0X3BhcmFtc1snZmxhZ3MnXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW1zWydmaWxlbmFtZSddID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5maWxlbmFtZSA9IG9wdF9wYXJhbXNbJ2ZpbGVuYW1lJ107XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtc1snY29tbWVudCddID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5jb21tZW50ID0gb3B0X3BhcmFtc1snY29tbWVudCddO1xuICAgIH1cbiAgICBpZiAob3B0X3BhcmFtc1snZGVmbGF0ZU9wdGlvbnMnXSkge1xuICAgICAgdGhpcy5kZWZsYXRlT3B0aW9ucyA9IG9wdF9wYXJhbXNbJ2RlZmxhdGVPcHRpb25zJ107XG4gICAgfVxuICB9XG5cbiAgaWYgKCF0aGlzLmRlZmxhdGVPcHRpb25zKSB7XG4gICAgdGhpcy5kZWZsYXRlT3B0aW9ucyA9IHt9O1xuICB9XG59O1xuXG4vKipcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKiBAY29uc3RcbiAqL1xuWmxpYi5HemlwLkRlZmF1bHRCdWZmZXJTaXplID0gMHg4MDAwO1xuXG4vKipcbiAqIGVuY29kZSBnemlwIG1lbWJlcnMuXG4gKiBAcmV0dXJuIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBnemlwIGJpbmFyeSBhcnJheS5cbiAqL1xuWmxpYi5HemlwLnByb3RvdHlwZS5jb21wcmVzcyA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gZmxhZ3MuICovXG4gIHZhciBmbGc7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtb2RpZmljYXRpb24gdGltZS4gKi9cbiAgdmFyIG10aW1lO1xuICAvKiogQHR5cGUge251bWJlcn0gQ1JDLTE2IHZhbHVlIGZvciBGSENSQyBmbGFnLiAqL1xuICB2YXIgY3JjMTY7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBDUkMtMzIgdmFsdWUgZm9yIHZlcmlmaWNhdGlvbi4gKi9cbiAgdmFyIGNyYzMyO1xuICAvKiogQHR5cGUgeyFabGliLlJhd0RlZmxhdGV9IHJhdyBkZWZsYXRlIG9iamVjdC4gKi9cbiAgdmFyIHJhd2RlZmxhdGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjaGFyYWN0ZXIgY29kZSAqL1xuICB2YXIgYztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGxpbWl0ZXIuICovXG4gIHZhciBpbDtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyLiAqL1xuICB2YXIgb3V0cHV0ID1cbiAgICBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShabGliLkd6aXAuRGVmYXVsdEJ1ZmZlclNpemUpO1xuICAvKiogQHR5cGUge251bWJlcn0gb3V0cHV0IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB2YXIgb3AgPSAwO1xuXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG4gIHZhciBmaWxlbmFtZSA9IHRoaXMuZmlsZW5hbWU7XG4gIHZhciBjb21tZW50ID0gdGhpcy5jb21tZW50O1xuXG4gIC8vIGNoZWNrIHNpZ25hdHVyZVxuICBvdXRwdXRbb3ArK10gPSAweDFmO1xuICBvdXRwdXRbb3ArK10gPSAweDhiO1xuXG4gIC8vIGNoZWNrIGNvbXByZXNzaW9uIG1ldGhvZFxuICBvdXRwdXRbb3ArK10gPSA4OyAvKiBYWFg6IHVzZSBabGliIGNvbnN0ICovXG5cbiAgLy8gZmxhZ3NcbiAgZmxnID0gMDtcbiAgaWYgKHRoaXMuZmxhZ3NbJ2ZuYW1lJ10pICAgIGZsZyB8PSBabGliLkd6aXAuRmxhZ3NNYXNrLkZOQU1FO1xuICBpZiAodGhpcy5mbGFnc1snZmNvbW1lbnQnXSkgZmxnIHw9IFpsaWIuR3ppcC5GbGFnc01hc2suRkNPTU1FTlQ7XG4gIGlmICh0aGlzLmZsYWdzWydmaGNyYyddKSAgICBmbGcgfD0gWmxpYi5HemlwLkZsYWdzTWFzay5GSENSQztcbiAgLy8gWFhYOiBGVEVYVFxuICAvLyBYWFg6IEZFWFRSQVxuICBvdXRwdXRbb3ArK10gPSBmbGc7XG5cbiAgLy8gbW9kaWZpY2F0aW9uIHRpbWVcbiAgbXRpbWUgPSAoRGF0ZS5ub3cgPyBEYXRlLm5vdygpIDogK25ldyBEYXRlKCkpIC8gMTAwMCB8IDA7XG4gIG91dHB1dFtvcCsrXSA9IG10aW1lICAgICAgICAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IG10aW1lID4+PiAgOCAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IG10aW1lID4+PiAxNiAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IG10aW1lID4+PiAyNCAmIDB4ZmY7XG5cbiAgLy8gZXh0cmEgZmxhZ3NcbiAgb3V0cHV0W29wKytdID0gMDtcblxuICAvLyBvcGVyYXRpbmcgc3lzdGVtXG4gIG91dHB1dFtvcCsrXSA9IFpsaWIuR3ppcC5PcGVyYXRpbmdTeXN0ZW0uVU5LTk9XTjtcblxuICAvLyBleHRyYVxuICAvKiBOT1AgKi9cblxuICAvLyBmbmFtZVxuICBpZiAodGhpcy5mbGFnc1snZm5hbWUnXSAhPT0gdm9pZCAwKSB7XG4gICAgZm9yIChpID0gMCwgaWwgPSBmaWxlbmFtZS5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICBjID0gZmlsZW5hbWUuY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjID4gMHhmZikgeyBvdXRwdXRbb3ArK10gPSAoYyA+Pj4gOCkgJiAweGZmOyB9XG4gICAgICBvdXRwdXRbb3ArK10gPSBjICYgMHhmZjtcbiAgICB9XG4gICAgb3V0cHV0W29wKytdID0gMDsgLy8gbnVsbCB0ZXJtaW5hdGlvblxuICB9XG5cbiAgLy8gZmNvbW1lbnRcbiAgaWYgKHRoaXMuZmxhZ3NbJ2NvbW1lbnQnXSkge1xuICAgIGZvciAoaSA9IDAsIGlsID0gY29tbWVudC5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICBjID0gY29tbWVudC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGMgPiAweGZmKSB7IG91dHB1dFtvcCsrXSA9IChjID4+PiA4KSAmIDB4ZmY7IH1cbiAgICAgIG91dHB1dFtvcCsrXSA9IGMgJiAweGZmO1xuICAgIH1cbiAgICBvdXRwdXRbb3ArK10gPSAwOyAvLyBudWxsIHRlcm1pbmF0aW9uXG4gIH1cblxuICAvLyBmaGNyY1xuICBpZiAodGhpcy5mbGFnc1snZmhjcmMnXSkge1xuICAgIGNyYzE2ID0gWmxpYi5DUkMzMi5jYWxjKG91dHB1dCwgMCwgb3ApICYgMHhmZmZmO1xuICAgIG91dHB1dFtvcCsrXSA9IChjcmMxNiAgICAgICkgJiAweGZmO1xuICAgIG91dHB1dFtvcCsrXSA9IChjcmMxNiA+Pj4gOCkgJiAweGZmO1xuICB9XG5cbiAgLy8gYWRkIGNvbXByZXNzIG9wdGlvblxuICB0aGlzLmRlZmxhdGVPcHRpb25zWydvdXRwdXRCdWZmZXInXSA9IG91dHB1dDtcbiAgdGhpcy5kZWZsYXRlT3B0aW9uc1snb3V0cHV0SW5kZXgnXSA9IG9wO1xuXG4gIC8vIGNvbXByZXNzXG4gIHJhd2RlZmxhdGUgPSBuZXcgWmxpYi5SYXdEZWZsYXRlKGlucHV0LCB0aGlzLmRlZmxhdGVPcHRpb25zKTtcbiAgb3V0cHV0ID0gcmF3ZGVmbGF0ZS5jb21wcmVzcygpO1xuICBvcCA9IHJhd2RlZmxhdGUub3A7XG5cbiAgLy8gZXhwYW5kIGJ1ZmZlclxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBpZiAob3AgKyA4ID4gb3V0cHV0LmJ1ZmZlci5ieXRlTGVuZ3RoKSB7XG4gICAgICB0aGlzLm91dHB1dCA9IG5ldyBVaW50OEFycmF5KG9wICsgOCk7XG4gICAgICB0aGlzLm91dHB1dC5zZXQobmV3IFVpbnQ4QXJyYXkob3V0cHV0LmJ1ZmZlcikpO1xuICAgICAgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dCA9IG5ldyBVaW50OEFycmF5KG91dHB1dC5idWZmZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNyYzMyXG4gIGNyYzMyID0gWmxpYi5DUkMzMi5jYWxjKGlucHV0KTtcbiAgb3V0cHV0W29wKytdID0gKGNyYzMyICAgICAgICkgJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAoY3JjMzIgPj4+ICA4KSAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IChjcmMzMiA+Pj4gMTYpICYgMHhmZjtcbiAgb3V0cHV0W29wKytdID0gKGNyYzMyID4+PiAyNCkgJiAweGZmO1xuXG4gIC8vIGlucHV0IHNpemVcbiAgaWwgPSBpbnB1dC5sZW5ndGg7XG4gIG91dHB1dFtvcCsrXSA9IChpbCAgICAgICApICYgMHhmZjtcbiAgb3V0cHV0W29wKytdID0gKGlsID4+PiAgOCkgJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAoaWwgPj4+IDE2KSAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IChpbCA+Pj4gMjQpICYgMHhmZjtcblxuICB0aGlzLmlwID0gaXA7XG5cbiAgaWYgKFVTRV9UWVBFREFSUkFZICYmIG9wIDwgb3V0cHV0Lmxlbmd0aCkge1xuICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0ID0gb3V0cHV0LnN1YmFycmF5KDAsIG9wKTtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKiogQGVudW0ge251bWJlcn0gKi9cblpsaWIuR3ppcC5PcGVyYXRpbmdTeXN0ZW0gPSB7XG4gIEZBVDogMCxcbiAgQU1JR0E6IDEsXG4gIFZNUzogMixcbiAgVU5JWDogMyxcbiAgVk1fQ01TOiA0LFxuICBBVEFSSV9UT1M6IDUsXG4gIEhQRlM6IDYsXG4gIE1BQ0lOVE9TSDogNyxcbiAgWl9TWVNURU06IDgsXG4gIENQX006IDksXG4gIFRPUFNfMjA6IDEwLFxuICBOVEZTOiAxMSxcbiAgUURPUzogMTIsXG4gIEFDT1JOX1JJU0NPUzogMTMsXG4gIFVOS05PV046IDI1NVxufTtcblxuLyoqIEBlbnVtIHtudW1iZXJ9ICovXG5abGliLkd6aXAuRmxhZ3NNYXNrID0ge1xuICBGVEVYVDogMHgwMSxcbiAgRkhDUkM6IDB4MDIsXG4gIEZFWFRSQTogMHgwNCxcbiAgRk5BTUU6IDB4MDgsXG4gIEZDT01NRU5UOiAweDEwXG59O1xuXG59KTtcbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsImdvb2cucHJvdmlkZSgnWmxpYi5SYXdJbmZsYXRlU3RyZWFtJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5IdWZmbWFuJyk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIEBkZWZpbmUge251bWJlcn0gYnVmZmVyIGJsb2NrIHNpemUuICovXG52YXIgWkxJQl9TVFJFQU1fUkFXX0lORkxBVEVfQlVGRkVSX1NJWkUgPSAweDgwMDA7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxudmFyIGJ1aWxkSHVmZm1hblRhYmxlID0gWmxpYi5IdWZmbWFuLmJ1aWxkSHVmZm1hblRhYmxlO1xuXG4vKipcbiAqIEBwYXJhbSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxuICogQHBhcmFtIHtudW1iZXJ9IGlwIGlucHV0IGJ1ZmZlciBwb2ludGVyLlxuICogQHBhcmFtIHtudW1iZXI9fSBvcHRfYnVmZmVyc2l6ZSBidWZmZXIgYmxvY2sgc2l6ZS5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0gPSBmdW5jdGlvbihpbnB1dCwgaXAsIG9wdF9idWZmZXJzaXplKSB7XG4gIC8qKiBAdHlwZSB7IUFycmF5LjwoQXJyYXl8VWludDhBcnJheSk+fSAqL1xuICB0aGlzLmJsb2NrcyA9IFtdO1xuICAvKiogQHR5cGUge251bWJlcn0gYmxvY2sgc2l6ZS4gKi9cbiAgdGhpcy5idWZmZXJTaXplID1cbiAgICBvcHRfYnVmZmVyc2l6ZSA/IG9wdF9idWZmZXJzaXplIDogWkxJQl9TVFJFQU1fUkFXX0lORkxBVEVfQlVGRkVSX1NJWkU7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gdG90YWwgb3V0cHV0IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB0aGlzLnRvdGFscG9zID0gMDtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSBpbnB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy5pcCA9IGlwID09PSB2b2lkIDAgPyAwIDogaXA7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gYml0IHN0cmVhbSByZWFkZXIgYnVmZmVyLiAqL1xuICB0aGlzLmJpdHNidWYgPSAwO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IGJpdCBzdHJlYW0gcmVhZGVyIGJ1ZmZlciBzaXplLiAqL1xuICB0aGlzLmJpdHNidWZsZW4gPSAwO1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IGlucHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5pbnB1dCA9IFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQ4QXJyYXkoaW5wdXQpIDogaW5wdXQ7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5KX0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5vdXRwdXQgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSh0aGlzLmJ1ZmZlclNpemUpO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IG91dHB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy5vcCA9IDA7XG4gIC8qKiBAdHlwZSB7Ym9vbGVhbn0gaXMgZmluYWwgYmxvY2sgZmxhZy4gKi9cbiAgdGhpcy5iZmluYWwgPSBmYWxzZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHVuY29tcHJlc3NlZCBibG9jayBsZW5ndGguICovXG4gIHRoaXMuYmxvY2tMZW5ndGg7XG4gIC8qKiBAdHlwZSB7Ym9vbGVhbn0gcmVzaXplIGZsYWcgZm9yIG1lbW9yeSBzaXplIG9wdGltaXphdGlvbi4gKi9cbiAgdGhpcy5yZXNpemUgPSBmYWxzZTtcbiAgLyoqIEB0eXBlIHtBcnJheX0gKi9cbiAgdGhpcy5saXRsZW5UYWJsZTtcbiAgLyoqIEB0eXBlIHtBcnJheX0gKi9cbiAgdGhpcy5kaXN0VGFibGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLnNwID0gMDsgLy8gc3RyZWFtIHBvaW50ZXJcbiAgLyoqIEB0eXBlIHtabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzfSAqL1xuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuSU5JVElBTElaRUQ7XG5cbiAgLy9cbiAgLy8gYmFja3VwXG4gIC8vXG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gKi9cbiAgdGhpcy5pcF87XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gKi9cbiAgdGhpcy5iaXRzYnVmbGVuXztcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSAqL1xuICB0aGlzLmJpdHNidWZfO1xufTtcblxuLyoqXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0uQmxvY2tUeXBlID0ge1xuICBVTkNPTVBSRVNTRUQ6IDAsXG4gIEZJWEVEOiAxLFxuICBEWU5BTUlDOiAyXG59O1xuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMgPSB7XG4gIElOSVRJQUxJWkVEOiAwLFxuICBCTE9DS19IRUFERVJfU1RBUlQ6IDEsXG4gIEJMT0NLX0hFQURFUl9FTkQ6IDIsXG4gIEJMT0NLX0JPRFlfU1RBUlQ6IDMsXG4gIEJMT0NLX0JPRFlfRU5EOiA0LFxuICBERUNPREVfQkxPQ0tfU1RBUlQ6IDUsXG4gIERFQ09ERV9CTE9DS19FTkQ6IDZcbn07XG5cbi8qKlxuICogZGVjb21wcmVzcy5cbiAqIEByZXR1cm4geyEoVWludDhBcnJheXxBcnJheSl9IGluZmxhdGVkIGJ1ZmZlci5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5kZWNvbXByZXNzID0gZnVuY3Rpb24obmV3SW5wdXQsIGlwKSB7XG4gIC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cbiAgdmFyIHN0b3AgPSBmYWxzZTtcblxuICBpZiAobmV3SW5wdXQgIT09IHZvaWQgMCkge1xuICAgIHRoaXMuaW5wdXQgPSBuZXdJbnB1dDtcbiAgfVxuXG4gIGlmIChpcCAhPT0gdm9pZCAwKSB7XG4gICAgdGhpcy5pcCA9IGlwO1xuICB9XG5cbiAgLy8gZGVjb21wcmVzc1xuICB3aGlsZSAoIXN0b3ApIHtcbiAgICBzd2l0Y2ggKHRoaXMuc3RhdHVzKSB7XG4gICAgICAvLyBibG9jayBoZWFkZXJcbiAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5JTklUSUFMSVpFRDpcbiAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19IRUFERVJfU1RBUlQ6XG4gICAgICAgIGlmICh0aGlzLnJlYWRCbG9ja0hlYWRlcigpIDwgMCkge1xuICAgICAgICAgIHN0b3AgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gYmxvY2sgYm9keVxuICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkJMT0NLX0hFQURFUl9FTkQ6IC8qIEZBTExUSFJPVUdIICovXG4gICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9TVEFSVDpcbiAgICAgICAgc3dpdGNoKHRoaXMuY3VycmVudEJsb2NrVHlwZSkge1xuICAgICAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5VTkNPTVBSRVNTRUQ6XG4gICAgICAgICAgICBpZiAodGhpcy5yZWFkVW5jb21wcmVzc2VkQmxvY2tIZWFkZXIoKSA8IDApIHtcbiAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuRklYRUQ6XG4gICAgICAgICAgICBpZiAodGhpcy5wYXJzZUZpeGVkSHVmZm1hbkJsb2NrKCkgPCAwKSB7XG4gICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uQmxvY2tUeXBlLkRZTkFNSUM6XG4gICAgICAgICAgICBpZiAodGhpcy5wYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2soKSA8IDApIHtcbiAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIC8vIGRlY29kZSBkYXRhXG4gICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9FTkQ6XG4gICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuREVDT0RFX0JMT0NLX1NUQVJUOlxuICAgICAgICBzd2l0Y2godGhpcy5jdXJyZW50QmxvY2tUeXBlKSB7XG4gICAgICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uQmxvY2tUeXBlLlVOQ09NUFJFU1NFRDpcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcnNlVW5jb21wcmVzc2VkQmxvY2soKSA8IDApIHtcbiAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuRklYRUQ6IC8qIEZBTExUSFJPVUdIICovXG4gICAgICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uQmxvY2tUeXBlLkRZTkFNSUM6XG4gICAgICAgICAgICBpZiAodGhpcy5kZWNvZGVIdWZmbWFuKCkgPCAwKSB7XG4gICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuREVDT0RFX0JMT0NLX0VORDpcbiAgICAgICAgaWYgKHRoaXMuYmZpbmFsKSB7XG4gICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLklOSVRJQUxJWkVEO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzLmNvbmNhdEJ1ZmZlcigpO1xufTtcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9IG1heCBiYWNrd2FyZCBsZW5ndGggZm9yIExaNzcuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5NYXhCYWNrd2FyZExlbmd0aCA9IDMyNzY4O1xuXG4vKipcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn0gbWF4IGNvcHkgbGVuZ3RoIGZvciBMWjc3LlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0uTWF4Q29weUxlbmd0aCA9IDI1ODtcblxuLyoqXG4gKiBodWZmbWFuIG9yZGVyXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0uT3JkZXIgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQxNkFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoWzE2LCAxNywgMTgsIDAsIDgsIDcsIDksIDYsIDEwLCA1LCAxMSwgNCwgMTIsIDMsIDEzLCAyLCAxNCwgMSwgMTVdKTtcblxuLyoqXG4gKiBodWZmbWFuIGxlbmd0aCBjb2RlIHRhYmxlLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5MZW5ndGhDb2RlVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQxNkFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoW1xuICAweDAwMDMsIDB4MDAwNCwgMHgwMDA1LCAweDAwMDYsIDB4MDAwNywgMHgwMDA4LCAweDAwMDksIDB4MDAwYSwgMHgwMDBiLFxuICAweDAwMGQsIDB4MDAwZiwgMHgwMDExLCAweDAwMTMsIDB4MDAxNywgMHgwMDFiLCAweDAwMWYsIDB4MDAyMywgMHgwMDJiLFxuICAweDAwMzMsIDB4MDAzYiwgMHgwMDQzLCAweDAwNTMsIDB4MDA2MywgMHgwMDczLCAweDAwODMsIDB4MDBhMywgMHgwMGMzLFxuICAweDAwZTMsIDB4MDEwMiwgMHgwMTAyLCAweDAxMDJcbl0pO1xuXG4vKipcbiAqIGh1ZmZtYW4gbGVuZ3RoIGV4dHJhLWJpdHMgdGFibGUuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0uTGVuZ3RoRXh0cmFUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDhBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFtcbiAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMSwgMSwgMiwgMiwgMiwgMiwgMywgMywgMywgMywgNCwgNCwgNCwgNCwgNSwgNSxcbiAgNSwgNSwgMCwgMCwgMFxuXSk7XG5cbi8qKlxuICogaHVmZm1hbiBkaXN0IGNvZGUgdGFibGUuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkRpc3RDb2RlVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQxNkFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoW1xuICAweDAwMDEsIDB4MDAwMiwgMHgwMDAzLCAweDAwMDQsIDB4MDAwNSwgMHgwMDA3LCAweDAwMDksIDB4MDAwZCwgMHgwMDExLFxuICAweDAwMTksIDB4MDAyMSwgMHgwMDMxLCAweDAwNDEsIDB4MDA2MSwgMHgwMDgxLCAweDAwYzEsIDB4MDEwMSwgMHgwMTgxLFxuICAweDAyMDEsIDB4MDMwMSwgMHgwNDAxLCAweDA2MDEsIDB4MDgwMSwgMHgwYzAxLCAweDEwMDEsIDB4MTgwMSwgMHgyMDAxLFxuICAweDMwMDEsIDB4NDAwMSwgMHg2MDAxXG5dKTtcblxuLyoqXG4gKiBodWZmbWFuIGRpc3QgZXh0cmEtYml0cyB0YWJsZS5cbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5EaXN0RXh0cmFUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDhBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFtcbiAgMCwgMCwgMCwgMCwgMSwgMSwgMiwgMiwgMywgMywgNCwgNCwgNSwgNSwgNiwgNiwgNywgNywgOCwgOCwgOSwgOSwgMTAsIDEwLCAxMSxcbiAgMTEsIDEyLCAxMiwgMTMsIDEzXG5dKTtcblxuLyoqXG4gKiBmaXhlZCBodWZmbWFuIGxlbmd0aCBjb2RlIHRhYmxlXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshQXJyYXl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5GaXhlZExpdGVyYWxMZW5ndGhUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gdGFibGU7XG59KSgoZnVuY3Rpb24oKSB7XG4gIHZhciBsZW5ndGhzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoMjg4KTtcbiAgdmFyIGksIGlsO1xuXG4gIGZvciAoaSA9IDAsIGlsID0gbGVuZ3Rocy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgbGVuZ3Roc1tpXSA9XG4gICAgICAoaSA8PSAxNDMpID8gOCA6XG4gICAgICAoaSA8PSAyNTUpID8gOSA6XG4gICAgICAoaSA8PSAyNzkpID8gNyA6XG4gICAgICA4O1xuICB9XG5cbiAgcmV0dXJuIGJ1aWxkSHVmZm1hblRhYmxlKGxlbmd0aHMpO1xufSkoKSk7XG5cbi8qKlxuICogZml4ZWQgaHVmZm1hbiBkaXN0YW5jZSBjb2RlIHRhYmxlXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshQXJyYXl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5GaXhlZERpc3RhbmNlVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIHRhYmxlO1xufSkoKGZ1bmN0aW9uKCkge1xuICB2YXIgbGVuZ3RocyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKDMwKTtcbiAgdmFyIGksIGlsO1xuXG4gIGZvciAoaSA9IDAsIGlsID0gbGVuZ3Rocy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgbGVuZ3Roc1tpXSA9IDU7XG4gIH1cblxuICByZXR1cm4gYnVpbGRIdWZmbWFuVGFibGUobGVuZ3Rocyk7XG59KSgpKTtcblxuLyoqXG4gKiBwYXJzZSBkZWZsYXRlZCBibG9jay5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkQmxvY2tIZWFkZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGhlYWRlciAqL1xuICB2YXIgaGRyO1xuXG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19IRUFERVJfU1RBUlQ7XG5cbiAgdGhpcy5zYXZlXygpO1xuICBpZiAoKGhkciA9IHRoaXMucmVhZEJpdHMoMykpIDwgMCkge1xuICAgIHRoaXMucmVzdG9yZV8oKTtcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvLyBCRklOQUxcbiAgaWYgKGhkciAmIDB4MSkge1xuICAgIHRoaXMuYmZpbmFsID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIEJUWVBFXG4gIGhkciA+Pj49IDE7XG4gIHN3aXRjaCAoaGRyKSB7XG4gICAgY2FzZSAwOiAvLyB1bmNvbXByZXNzZWRcbiAgICAgIHRoaXMuY3VycmVudEJsb2NrVHlwZSA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuVU5DT01QUkVTU0VEO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAxOiAvLyBmaXhlZCBodWZmbWFuXG4gICAgICB0aGlzLmN1cnJlbnRCbG9ja1R5cGUgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uQmxvY2tUeXBlLkZJWEVEO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOiAvLyBkeW5hbWljIGh1ZmZtYW5cbiAgICAgIHRoaXMuY3VycmVudEJsb2NrVHlwZSA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuRFlOQU1JQztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6IC8vIHJlc2VydmVkIG9yIG90aGVyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gQlRZUEU6ICcgKyBoZHIpO1xuICB9XG5cbiAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkJMT0NLX0hFQURFUl9FTkQ7XG59O1xuXG4vKipcbiAqIHJlYWQgaW5mbGF0ZSBiaXRzXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIGJpdHMgbGVuZ3RoLlxuICogQHJldHVybiB7bnVtYmVyfSByZWFkIGJpdHMuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucmVhZEJpdHMgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgdmFyIGJpdHNidWYgPSB0aGlzLmJpdHNidWY7XG4gIHZhciBiaXRzYnVmbGVuID0gdGhpcy5iaXRzYnVmbGVuO1xuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgaXAgPSB0aGlzLmlwO1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBhbmQgb3V0cHV0IGJ5dGUuICovXG4gIHZhciBvY3RldDtcblxuICAvLyBub3QgZW5vdWdoIGJ1ZmZlclxuICB3aGlsZSAoYml0c2J1ZmxlbiA8IGxlbmd0aCkge1xuICAgIC8vIGlucHV0IGJ5dGVcbiAgICBpZiAoaW5wdXQubGVuZ3RoIDw9IGlwKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIG9jdGV0ID0gaW5wdXRbaXArK107XG5cbiAgICAvLyBjb25jYXQgb2N0ZXRcbiAgICBiaXRzYnVmIHw9IG9jdGV0IDw8IGJpdHNidWZsZW47XG4gICAgYml0c2J1ZmxlbiArPSA4O1xuICB9XG5cbiAgLy8gb3V0cHV0IGJ5dGVcbiAgb2N0ZXQgPSBiaXRzYnVmICYgLyogTUFTSyAqLyAoKDEgPDwgbGVuZ3RoKSAtIDEpO1xuICBiaXRzYnVmID4+Pj0gbGVuZ3RoO1xuICBiaXRzYnVmbGVuIC09IGxlbmd0aDtcblxuICB0aGlzLmJpdHNidWYgPSBiaXRzYnVmO1xuICB0aGlzLmJpdHNidWZsZW4gPSBiaXRzYnVmbGVuO1xuICB0aGlzLmlwID0gaXA7XG5cbiAgcmV0dXJuIG9jdGV0O1xufTtcblxuLyoqXG4gKiByZWFkIGh1ZmZtYW4gY29kZSB1c2luZyB0YWJsZVxuICogQHBhcmFtIHtBcnJheX0gdGFibGUgaHVmZm1hbiBjb2RlIHRhYmxlLlxuICogQHJldHVybiB7bnVtYmVyfSBodWZmbWFuIGNvZGUuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucmVhZENvZGVCeVRhYmxlID0gZnVuY3Rpb24odGFibGUpIHtcbiAgdmFyIGJpdHNidWYgPSB0aGlzLmJpdHNidWY7XG4gIHZhciBiaXRzYnVmbGVuID0gdGhpcy5iaXRzYnVmbGVuO1xuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgaXAgPSB0aGlzLmlwO1xuXG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gaHVmZm1hbiBjb2RlIHRhYmxlICovXG4gIHZhciBjb2RlVGFibGUgPSB0YWJsZVswXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBtYXhDb2RlTGVuZ3RoID0gdGFibGVbMV07XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBieXRlICovXG4gIHZhciBvY3RldDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvZGUgbGVuZ3RoICYgY29kZSAoMTZiaXQsIDE2Yml0KSAqL1xuICB2YXIgY29kZVdpdGhMZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjb2RlIGJpdHMgbGVuZ3RoICovXG4gIHZhciBjb2RlTGVuZ3RoO1xuXG4gIC8vIG5vdCBlbm91Z2ggYnVmZmVyXG4gIHdoaWxlIChiaXRzYnVmbGVuIDwgbWF4Q29kZUxlbmd0aCkge1xuICAgIGlmIChpbnB1dC5sZW5ndGggPD0gaXApIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgb2N0ZXQgPSBpbnB1dFtpcCsrXTtcbiAgICBiaXRzYnVmIHw9IG9jdGV0IDw8IGJpdHNidWZsZW47XG4gICAgYml0c2J1ZmxlbiArPSA4O1xuICB9XG5cbiAgLy8gcmVhZCBtYXggbGVuZ3RoXG4gIGNvZGVXaXRoTGVuZ3RoID0gY29kZVRhYmxlW2JpdHNidWYgJiAoKDEgPDwgbWF4Q29kZUxlbmd0aCkgLSAxKV07XG4gIGNvZGVMZW5ndGggPSBjb2RlV2l0aExlbmd0aCA+Pj4gMTY7XG5cbiAgaWYgKGNvZGVMZW5ndGggPiBiaXRzYnVmbGVuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGNvZGUgbGVuZ3RoOiAnICsgY29kZUxlbmd0aCk7XG4gIH1cblxuICB0aGlzLmJpdHNidWYgPSBiaXRzYnVmID4+IGNvZGVMZW5ndGg7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IGJpdHNidWZsZW4gLSBjb2RlTGVuZ3RoO1xuICB0aGlzLmlwID0gaXA7XG5cbiAgcmV0dXJuIGNvZGVXaXRoTGVuZ3RoICYgMHhmZmZmO1xufTtcblxuLyoqXG4gKiByZWFkIHVuY29tcHJlc3NlZCBibG9jayBoZWFkZXJcbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkVW5jb21wcmVzc2VkQmxvY2tIZWFkZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJsb2NrIGxlbmd0aCAqL1xuICB2YXIgbGVuO1xuICAvKiogQHR5cGUge251bWJlcn0gbnVtYmVyIGZvciBjaGVjayBibG9jayBsZW5ndGggKi9cbiAgdmFyIG5sZW47XG5cbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgdmFyIGlwID0gdGhpcy5pcDtcblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9TVEFSVDtcblxuICBpZiAoaXAgKyA0ID49IGlucHV0Lmxlbmd0aCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGxlbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuICBubGVuID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gY2hlY2sgbGVuICYgbmxlblxuICBpZiAobGVuID09PSB+bmxlbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB1bmNvbXByZXNzZWQgYmxvY2sgaGVhZGVyOiBsZW5ndGggdmVyaWZ5Jyk7XG4gIH1cblxuICAvLyBza2lwIGJ1ZmZlcmVkIGhlYWRlciBiaXRzXG4gIHRoaXMuYml0c2J1ZiA9IDA7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IDA7XG5cbiAgdGhpcy5pcCA9IGlwO1xuICB0aGlzLmJsb2NrTGVuZ3RoID0gbGVuO1xuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9FTkQ7XG59O1xuXG4vKipcbiAqIHBhcnNlIHVuY29tcHJlc3NlZCBibG9jay5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5wYXJzZVVuY29tcHJlc3NlZEJsb2NrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG4gIHZhciBvdXRwdXQgPSB0aGlzLm91dHB1dDtcbiAgdmFyIG9wID0gdGhpcy5vcDtcbiAgdmFyIGxlbiA9IHRoaXMuYmxvY2tMZW5ndGg7XG5cbiAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkRFQ09ERV9CTE9DS19TVEFSVDtcblxuICAvLyBjb3B5XG4gIC8vIFhYWDog44Go44KK44GC44GI44Ga57Sg55u044Gr44Kz44OU44O8XG4gIHdoaWxlIChsZW4tLSkge1xuICAgIGlmIChvcCA9PT0gb3V0cHV0Lmxlbmd0aCkge1xuICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoe2ZpeFJhdGlvOiAyfSk7XG4gICAgfVxuXG4gICAgLy8gbm90IGVub3VnaCBpbnB1dCBidWZmZXJcbiAgICBpZiAoaXAgPj0gaW5wdXQubGVuZ3RoKSB7XG4gICAgICB0aGlzLmlwID0gaXA7XG4gICAgICB0aGlzLm9wID0gb3A7XG4gICAgICB0aGlzLmJsb2NrTGVuZ3RoID0gbGVuICsgMTsgLy8g44Kz44OU44O844GX44Gm44Gq44GE44Gu44Gn5oi744GZXG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgb3V0cHV0W29wKytdID0gaW5wdXRbaXArK107XG4gIH1cblxuICBpZiAobGVuIDwgMCkge1xuICAgIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5ERUNPREVfQkxPQ0tfRU5EO1xuICB9XG5cbiAgdGhpcy5pcCA9IGlwO1xuICB0aGlzLm9wID0gb3A7XG5cbiAgcmV0dXJuIDA7XG59O1xuXG4vKipcbiAqIHBhcnNlIGZpeGVkIGh1ZmZtYW4gYmxvY2suXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucGFyc2VGaXhlZEh1ZmZtYW5CbG9jayA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9TVEFSVDtcblxuICB0aGlzLmxpdGxlblRhYmxlID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkZpeGVkTGl0ZXJhbExlbmd0aFRhYmxlO1xuICB0aGlzLmRpc3RUYWJsZSA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5GaXhlZERpc3RhbmNlVGFibGU7XG5cbiAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkJMT0NLX0JPRFlfRU5EO1xuXG4gIHJldHVybiAwO1xufTtcblxuLyoqXG4gKiDjgqrjg5bjgrjjgqfjgq/jg4jjga7jgrPjg7Pjg4bjgq3jgrnjg4jjgpLliKXjga7jg5fjg63jg5Hjg4bjgqPjgavpgIDpgb/jgZnjgosuXG4gKiBAcHJpdmF0ZVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnNhdmVfID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXBfID0gdGhpcy5pcDtcbiAgdGhpcy5iaXRzYnVmbGVuXyA9IHRoaXMuYml0c2J1ZmxlbjtcbiAgdGhpcy5iaXRzYnVmXyA9IHRoaXMuYml0c2J1Zjtcbn07XG5cbi8qKlxuICog5Yil44Gu44OX44Ot44OR44OG44Kj44Gr6YCA6YG/44GX44Gf44Kz44Oz44OG44Kt44K544OI44KS5b6p5YWD44GZ44KLLlxuICogQHByaXZhdGVcbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZXN0b3JlXyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlwID0gdGhpcy5pcF87XG4gIHRoaXMuYml0c2J1ZmxlbiA9IHRoaXMuYml0c2J1Zmxlbl87XG4gIHRoaXMuYml0c2J1ZiA9IHRoaXMuYml0c2J1Zl87XG59O1xuXG4vKipcbiAqIHBhcnNlIGR5bmFtaWMgaHVmZm1hbiBibG9jay5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5wYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG51bWJlciBvZiBsaXRlcmFsIGFuZCBsZW5ndGggY29kZXMuICovXG4gIHZhciBobGl0O1xuICAvKiogQHR5cGUge251bWJlcn0gbnVtYmVyIG9mIGRpc3RhbmNlIGNvZGVzLiAqL1xuICB2YXIgaGRpc3Q7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgb2YgY29kZSBsZW5ndGhzLiAqL1xuICB2YXIgaGNsZW47XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5KX0gY29kZSBsZW5ndGhzLiAqL1xuICB2YXIgY29kZUxlbmd0aHMgPVxuICAgIG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5PcmRlci5sZW5ndGgpO1xuICAvKiogQHR5cGUgeyFBcnJheX0gY29kZSBsZW5ndGhzIHRhYmxlLiAqL1xuICB2YXIgY29kZUxlbmd0aHNUYWJsZTtcbiAgLyoqIEB0eXBlIHshKFVpbnQzMkFycmF5fEFycmF5KX0gbGl0ZXJhbCBhbmQgbGVuZ3RoIGNvZGUgbGVuZ3Rocy4gKi9cbiAgdmFyIGxpdGxlbkxlbmd0aHM7XG4gIC8qKiBAdHlwZSB7IShVaW50MzJBcnJheXxBcnJheSl9IGRpc3RhbmNlIGNvZGUgbGVuZ3Rocy4gKi9cbiAgdmFyIGRpc3RMZW5ndGhzO1xuXG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX1NUQVJUO1xuXG4gIHRoaXMuc2F2ZV8oKTtcbiAgaGxpdCA9IHRoaXMucmVhZEJpdHMoNSkgKyAyNTc7XG4gIGhkaXN0ID0gdGhpcy5yZWFkQml0cyg1KSArIDE7XG4gIGhjbGVuID0gdGhpcy5yZWFkQml0cyg0KSArIDQ7XG4gIGlmIChobGl0IDwgMCB8fCBoZGlzdCA8IDAgfHwgaGNsZW4gPCAwKSB7XG4gICAgdGhpcy5yZXN0b3JlXygpO1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrSW1wbC5jYWxsKHRoaXMpO1xuICB9IGNhdGNoKGUpIHtcbiAgICB0aGlzLnJlc3RvcmVfKCk7XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrSW1wbCgpIHtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgYml0cztcbiAgICB2YXIgY29kZTtcbiAgICB2YXIgcHJldiA9IDA7XG4gICAgdmFyIHJlcGVhdDtcbiAgICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheS48bnVtYmVyPil9IGNvZGUgbGVuZ3RoIHRhYmxlLiAqL1xuICAgIHZhciBsZW5ndGhUYWJsZTtcbiAgICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBjb3VudGVyLiAqL1xuICAgIHZhciBpO1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGxpbWl0LiAqL1xuICAgIHZhciBpbDtcblxuICAgIC8vIGRlY29kZSBjb2RlIGxlbmd0aHNcbiAgICBmb3IgKGkgPSAwOyBpIDwgaGNsZW47ICsraSkge1xuICAgICAgaWYgKChiaXRzID0gdGhpcy5yZWFkQml0cygzKSkgPCAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbm90IGVub3VnaCBpbnB1dCcpO1xuICAgICAgfVxuICAgICAgY29kZUxlbmd0aHNbWmxpYi5SYXdJbmZsYXRlU3RyZWFtLk9yZGVyW2ldXSA9IGJpdHM7XG4gICAgfVxuXG4gICAgLy8gZGVjb2RlIGxlbmd0aCB0YWJsZVxuICAgIGNvZGVMZW5ndGhzVGFibGUgPSBidWlsZEh1ZmZtYW5UYWJsZShjb2RlTGVuZ3Rocyk7XG4gICAgbGVuZ3RoVGFibGUgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShobGl0ICsgaGRpc3QpO1xuICAgIGZvciAoaSA9IDAsIGlsID0gaGxpdCArIGhkaXN0OyBpIDwgaWw7KSB7XG4gICAgICBjb2RlID0gdGhpcy5yZWFkQ29kZUJ5VGFibGUoY29kZUxlbmd0aHNUYWJsZSk7XG4gICAgICBpZiAoY29kZSA8IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdub3QgZW5vdWdoIGlucHV0Jyk7XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICBpZiAoKGJpdHMgPSB0aGlzLnJlYWRCaXRzKDIpKSA8IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm90IGVub3VnaCBpbnB1dCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXBlYXQgPSAzICsgYml0cztcbiAgICAgICAgICB3aGlsZSAocmVwZWF0LS0pIHsgbGVuZ3RoVGFibGVbaSsrXSA9IHByZXY7IH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgICBpZiAoKGJpdHMgPSB0aGlzLnJlYWRCaXRzKDMpKSA8IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm90IGVub3VnaCBpbnB1dCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXBlYXQgPSAzICsgYml0cztcbiAgICAgICAgICB3aGlsZSAocmVwZWF0LS0pIHsgbGVuZ3RoVGFibGVbaSsrXSA9IDA7IH1cbiAgICAgICAgICBwcmV2ID0gMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICBpZiAoKGJpdHMgPSB0aGlzLnJlYWRCaXRzKDcpKSA8IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm90IGVub3VnaCBpbnB1dCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXBlYXQgPSAxMSArIGJpdHM7XG4gICAgICAgICAgd2hpbGUgKHJlcGVhdC0tKSB7IGxlbmd0aFRhYmxlW2krK10gPSAwOyB9XG4gICAgICAgICAgcHJldiA9IDA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbGVuZ3RoVGFibGVbaSsrXSA9IGNvZGU7XG4gICAgICAgICAgcHJldiA9IGNvZGU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbGl0ZXJhbCBhbmQgbGVuZ3RoIGNvZGVcbiAgICBsaXRsZW5MZW5ndGhzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoaGxpdCk7XG5cbiAgICAvLyBkaXN0YW5jZSBjb2RlXG4gICAgZGlzdExlbmd0aHMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShoZGlzdCk7XG5cbiAgICB0aGlzLmxpdGxlblRhYmxlID0gVVNFX1RZUEVEQVJSQVlcbiAgICAgID8gYnVpbGRIdWZmbWFuVGFibGUobGVuZ3RoVGFibGUuc3ViYXJyYXkoMCwgaGxpdCkpXG4gICAgICA6IGJ1aWxkSHVmZm1hblRhYmxlKGxlbmd0aFRhYmxlLnNsaWNlKDAsIGhsaXQpKTtcbiAgICB0aGlzLmRpc3RUYWJsZSA9IFVTRV9UWVBFREFSUkFZXG4gICAgICA/IGJ1aWxkSHVmZm1hblRhYmxlKGxlbmd0aFRhYmxlLnN1YmFycmF5KGhsaXQpKVxuICAgICAgOiBidWlsZEh1ZmZtYW5UYWJsZShsZW5ndGhUYWJsZS5zbGljZShobGl0KSk7XG4gIH1cblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfQk9EWV9FTkQ7XG5cbiAgcmV0dXJuIDA7XG59O1xuXG4vKipcbiAqIGRlY29kZSBodWZmbWFuIGNvZGUgKGR5bmFtaWMpXG4gKiBAcmV0dXJuIHsobnVtYmVyfHVuZGVmaW5lZCl9IC0xIGlzIGVycm9yLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29kZUh1ZmZtYW4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuICB2YXIgb3AgPSB0aGlzLm9wO1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBodWZmbWFuIGNvZGUuICovXG4gIHZhciBjb2RlO1xuICAvKiogQHR5cGUge251bWJlcn0gdGFibGUgaW5kZXguICovXG4gIHZhciB0aTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZSBkaXN0aW5hdGlvbi4gKi9cbiAgdmFyIGNvZGVEaXN0O1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlIGxlbmd0aC4gKi9cbiAgdmFyIGNvZGVMZW5ndGg7XG5cbiAgdmFyIGxpdGxlbiA9IHRoaXMubGl0bGVuVGFibGU7XG4gIHZhciBkaXN0ID0gdGhpcy5kaXN0VGFibGU7XG5cbiAgdmFyIG9sZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuICB2YXIgYml0cztcblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuREVDT0RFX0JMT0NLX1NUQVJUO1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgdGhpcy5zYXZlXygpO1xuXG4gICAgY29kZSA9IHRoaXMucmVhZENvZGVCeVRhYmxlKGxpdGxlbik7XG4gICAgaWYgKGNvZGUgPCAwKSB7XG4gICAgICB0aGlzLm9wID0gb3A7XG4gICAgICB0aGlzLnJlc3RvcmVfKCk7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgaWYgKGNvZGUgPT09IDI1Nikge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gbGl0ZXJhbFxuICAgIGlmIChjb2RlIDwgMjU2KSB7XG4gICAgICBpZiAob3AgPT09IG9sZW5ndGgpIHtcbiAgICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgICAgb2xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG4gICAgICB9XG4gICAgICBvdXRwdXRbb3ArK10gPSBjb2RlO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsZW5ndGggY29kZVxuICAgIHRpID0gY29kZSAtIDI1NztcbiAgICBjb2RlTGVuZ3RoID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkxlbmd0aENvZGVUYWJsZVt0aV07XG4gICAgaWYgKFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5MZW5ndGhFeHRyYVRhYmxlW3RpXSA+IDApIHtcbiAgICAgIGJpdHMgPSB0aGlzLnJlYWRCaXRzKFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5MZW5ndGhFeHRyYVRhYmxlW3RpXSk7XG4gICAgICBpZiAoYml0cyA8IDApIHtcbiAgICAgICAgdGhpcy5vcCA9IG9wO1xuICAgICAgICB0aGlzLnJlc3RvcmVfKCk7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIGNvZGVMZW5ndGggKz0gYml0cztcbiAgICB9XG5cbiAgICAvLyBkaXN0IGNvZGVcbiAgICBjb2RlID0gdGhpcy5yZWFkQ29kZUJ5VGFibGUoZGlzdCk7XG4gICAgaWYgKGNvZGUgPCAwKSB7XG4gICAgICB0aGlzLm9wID0gb3A7XG4gICAgICB0aGlzLnJlc3RvcmVfKCk7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIGNvZGVEaXN0ID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkRpc3RDb2RlVGFibGVbY29kZV07XG4gICAgaWYgKFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5EaXN0RXh0cmFUYWJsZVtjb2RlXSA+IDApIHtcbiAgICAgIGJpdHMgPSB0aGlzLnJlYWRCaXRzKFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5EaXN0RXh0cmFUYWJsZVtjb2RlXSk7XG4gICAgICBpZiAoYml0cyA8IDApIHtcbiAgICAgICAgdGhpcy5vcCA9IG9wO1xuICAgICAgICB0aGlzLnJlc3RvcmVfKCk7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIGNvZGVEaXN0ICs9IGJpdHM7XG4gICAgfVxuXG4gICAgLy8gbHo3NyBkZWNvZGVcbiAgICBpZiAob3AgKyBjb2RlTGVuZ3RoID49IG9sZW5ndGgpIHtcbiAgICAgIG91dHB1dCA9IHRoaXMuZXhwYW5kQnVmZmVyKCk7XG4gICAgICBvbGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcbiAgICB9XG5cbiAgICB3aGlsZSAoY29kZUxlbmd0aC0tKSB7XG4gICAgICBvdXRwdXRbb3BdID0gb3V0cHV0WyhvcCsrKSAtIGNvZGVEaXN0XTtcbiAgICB9XG5cbiAgICAvLyBicmVha1xuICAgIGlmICh0aGlzLmlwID09PSB0aGlzLmlucHV0Lmxlbmd0aCkge1xuICAgICAgdGhpcy5vcCA9IG9wO1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgfVxuXG4gIHdoaWxlICh0aGlzLmJpdHNidWZsZW4gPj0gOCkge1xuICAgIHRoaXMuYml0c2J1ZmxlbiAtPSA4O1xuICAgIHRoaXMuaXAtLTtcbiAgfVxuXG4gIHRoaXMub3AgPSBvcDtcbiAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkRFQ09ERV9CTE9DS19FTkQ7XG59O1xuXG4vKipcbiAqIGV4cGFuZCBvdXRwdXQgYnVmZmVyLiAoZHluYW1pYylcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICogQHJldHVybiB7IShBcnJheXxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlciBwb2ludGVyLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmV4cGFuZEJ1ZmZlciA9IGZ1bmN0aW9uKG9wdF9wYXJhbSkge1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IHN0b3JlIGJ1ZmZlci4gKi9cbiAgdmFyIGJ1ZmZlcjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGV4cGFudGlvbiByYXRpby4gKi9cbiAgdmFyIHJhdGlvID0gKHRoaXMuaW5wdXQubGVuZ3RoIC8gdGhpcy5pcCArIDEpIHwgMDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG1heGltdW0gbnVtYmVyIG9mIGh1ZmZtYW4gY29kZS4gKi9cbiAgdmFyIG1heEh1ZmZDb2RlO1xuICAvKiogQHR5cGUge251bWJlcn0gbmV3IG91dHB1dCBidWZmZXIgc2l6ZS4gKi9cbiAgdmFyIG5ld1NpemU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtYXggaW5mbGF0ZSBzaXplLiAqL1xuICB2YXIgbWF4SW5mbGF0ZVNpemU7XG5cbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuXG4gIGlmIChvcHRfcGFyYW0pIHtcbiAgICBpZiAodHlwZW9mIG9wdF9wYXJhbS5maXhSYXRpbyA9PT0gJ251bWJlcicpIHtcbiAgICAgIHJhdGlvID0gb3B0X3BhcmFtLmZpeFJhdGlvO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdF9wYXJhbS5hZGRSYXRpbyA9PT0gJ251bWJlcicpIHtcbiAgICAgIHJhdGlvICs9IG9wdF9wYXJhbS5hZGRSYXRpbztcbiAgICB9XG4gIH1cblxuICAvLyBjYWxjdWxhdGUgbmV3IGJ1ZmZlciBzaXplXG4gIGlmIChyYXRpbyA8IDIpIHtcbiAgICBtYXhIdWZmQ29kZSA9XG4gICAgICAoaW5wdXQubGVuZ3RoIC0gdGhpcy5pcCkgLyB0aGlzLmxpdGxlblRhYmxlWzJdO1xuICAgIG1heEluZmxhdGVTaXplID0gKG1heEh1ZmZDb2RlIC8gMiAqIDI1OCkgfCAwO1xuICAgIG5ld1NpemUgPSBtYXhJbmZsYXRlU2l6ZSA8IG91dHB1dC5sZW5ndGggP1xuICAgICAgb3V0cHV0Lmxlbmd0aCArIG1heEluZmxhdGVTaXplIDpcbiAgICAgIG91dHB1dC5sZW5ndGggPDwgMTtcbiAgfSBlbHNlIHtcbiAgICBuZXdTaXplID0gb3V0cHV0Lmxlbmd0aCAqIHJhdGlvO1xuICB9XG5cbiAgLy8gYnVmZmVyIGV4cGFudGlvblxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShuZXdTaXplKTtcbiAgICBidWZmZXIuc2V0KG91dHB1dCk7XG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyID0gb3V0cHV0O1xuICB9XG5cbiAgdGhpcy5vdXRwdXQgPSBidWZmZXI7XG5cbiAgcmV0dXJuIHRoaXMub3V0cHV0O1xufTtcblxuLyoqXG4gKiBjb25jYXQgb3V0cHV0IGJ1ZmZlci4gKGR5bmFtaWMpXG4gKiBAcmV0dXJuIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmNvbmNhdEJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuICovXG4gIHZhciBidWZmZXI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgb3AgPSB0aGlzLm9wO1xuICAvKiogQHR5cGUge1VpbnQ4QXJyYXl9ICovXG4gIHZhciB0bXA7XG5cbiAgaWYgKHRoaXMucmVzaXplKSB7XG4gICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheSh0aGlzLm91dHB1dC5zdWJhcnJheSh0aGlzLnNwLCBvcCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXIgPSB0aGlzLm91dHB1dC5zbGljZSh0aGlzLnNwLCBvcCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGJ1ZmZlciA9XG4gICAgICBVU0VfVFlQRURBUlJBWSA/IHRoaXMub3V0cHV0LnN1YmFycmF5KHRoaXMuc3AsIG9wKSA6IHRoaXMub3V0cHV0LnNsaWNlKHRoaXMuc3AsIG9wKTtcbiAgfVxuXG4gIHRoaXMuc3AgPSBvcDtcblxuICAvLyBjb21wYWN0aW9uXG4gIGlmIChvcCA+IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5NYXhCYWNrd2FyZExlbmd0aCArIHRoaXMuYnVmZmVyU2l6ZSkge1xuICAgIHRoaXMub3AgPSB0aGlzLnNwID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLk1heEJhY2t3YXJkTGVuZ3RoO1xuICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgICAgdG1wID0gLyoqIEB0eXBlIHtVaW50OEFycmF5fSAqLyh0aGlzLm91dHB1dCk7XG4gICAgICB0aGlzLm91dHB1dCA9IG5ldyBVaW50OEFycmF5KHRoaXMuYnVmZmVyU2l6ZSArIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5NYXhCYWNrd2FyZExlbmd0aCk7XG4gICAgICB0aGlzLm91dHB1dC5zZXQodG1wLnN1YmFycmF5KG9wIC0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLk1heEJhY2t3YXJkTGVuZ3RoLCBvcCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm91dHB1dCA9IHRoaXMub3V0cHV0LnNsaWNlKG9wIC0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLk1heEJhY2t3YXJkTGVuZ3RoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmZmVyO1xufTtcblxuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuIiwiZ29vZy5wcm92aWRlKCdabGliLlJhd0luZmxhdGUnKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkh1ZmZtYW4nKTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogQGRlZmluZSB7bnVtYmVyfSBidWZmZXIgYmxvY2sgc2l6ZS4gKi9cbnZhciBaTElCX1JBV19JTkZMQVRFX0JVRkZFUl9TSVpFID0gMHg4MDAwOyAvLyBbIDB4ODAwMCA+PSBaTElCX0JVRkZFUl9CTE9DS19TSVpFIF1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG52YXIgYnVpbGRIdWZmbWFuVGFibGUgPSBabGliLkh1ZmZtYW4uYnVpbGRIdWZmbWFuVGFibGU7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0geyEoVWludDhBcnJheXxBcnJheS48bnVtYmVyPil9IGlucHV0IGlucHV0IGJ1ZmZlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXIuXG4gKlxuICogb3B0X3BhcmFtcyDjga/ku6XkuIvjga7jg5fjg63jg5Hjg4bjgqPjgpLmjIflrprjgZnjgovkuovjgYzjgafjgY3jgb7jgZnjgIJcbiAqICAgLSBpbmRleDogaW5wdXQgYnVmZmVyIOOBriBkZWZsYXRlIOOCs+ODs+ODhuODiuOBrumWi+Wni+S9jee9ri5cbiAqICAgLSBibG9ja1NpemU6IOODkOODg+ODleOCoeOBruODluODreODg+OCr+OCteOCpOOCui5cbiAqICAgLSBidWZmZXJUeXBlOiBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZSDjga7lgKTjgavjgojjgaPjgabjg5Djg4Pjg5XjgqHjga7nrqHnkIbmlrnms5XjgpLmjIflrprjgZnjgosuXG4gKiAgIC0gcmVzaXplOiDnorrkv53jgZfjgZ/jg5Djg4Pjg5XjgqHjgYzlrp/pmpvjga7lpKfjgY3jgZXjgojjgorlpKfjgY3jgYvjgaPjgZ/loLTlkIjjgavliIfjgoroqbDjgoHjgosuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZSA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyICovXG4gIHRoaXMuYnVmZmVyO1xuICAvKiogQHR5cGUgeyFBcnJheS48KEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpPn0gKi9cbiAgdGhpcy5ibG9ja3MgPSBbXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJsb2NrIHNpemUuICovXG4gIHRoaXMuYnVmZmVyU2l6ZSA9IFpMSUJfUkFXX0lORkxBVEVfQlVGRkVSX1NJWkU7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gdG90YWwgb3V0cHV0IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB0aGlzLnRvdGFscG9zID0gMDtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSBpbnB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy5pcCA9IDA7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gYml0IHN0cmVhbSByZWFkZXIgYnVmZmVyLiAqL1xuICB0aGlzLmJpdHNidWYgPSAwO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IGJpdCBzdHJlYW0gcmVhZGVyIGJ1ZmZlciBzaXplLiAqL1xuICB0aGlzLmJpdHNidWZsZW4gPSAwO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGlucHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5pbnB1dCA9IFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQ4QXJyYXkoaW5wdXQpIDogaW5wdXQ7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5vdXRwdXQ7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gb3V0cHV0IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB0aGlzLm9wO1xuICAvKiogQHR5cGUge2Jvb2xlYW59IGlzIGZpbmFsIGJsb2NrIGZsYWcuICovXG4gIHRoaXMuYmZpbmFsID0gZmFsc2U7XG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGV9IGJ1ZmZlciBtYW5hZ2VtZW50LiAqL1xuICB0aGlzLmJ1ZmZlclR5cGUgPSBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZS5BREFQVElWRTtcbiAgLyoqIEB0eXBlIHtib29sZWFufSByZXNpemUgZmxhZyBmb3IgbWVtb3J5IHNpemUgb3B0aW1pemF0aW9uLiAqL1xuICB0aGlzLnJlc2l6ZSA9IGZhbHNlO1xuXG4gIC8vIG9wdGlvbiBwYXJhbWV0ZXJzXG4gIGlmIChvcHRfcGFyYW1zIHx8ICEob3B0X3BhcmFtcyA9IHt9KSkge1xuICAgIGlmIChvcHRfcGFyYW1zWydpbmRleCddKSB7XG4gICAgICB0aGlzLmlwID0gb3B0X3BhcmFtc1snaW5kZXgnXTtcbiAgICB9XG4gICAgaWYgKG9wdF9wYXJhbXNbJ2J1ZmZlclNpemUnXSkge1xuICAgICAgdGhpcy5idWZmZXJTaXplID0gb3B0X3BhcmFtc1snYnVmZmVyU2l6ZSddO1xuICAgIH1cbiAgICBpZiAob3B0X3BhcmFtc1snYnVmZmVyVHlwZSddKSB7XG4gICAgICB0aGlzLmJ1ZmZlclR5cGUgPSBvcHRfcGFyYW1zWydidWZmZXJUeXBlJ107XG4gICAgfVxuICAgIGlmIChvcHRfcGFyYW1zWydyZXNpemUnXSkge1xuICAgICAgdGhpcy5yZXNpemUgPSBvcHRfcGFyYW1zWydyZXNpemUnXTtcbiAgICB9XG4gIH1cblxuICAvLyBpbml0aWFsaXplXG4gIHN3aXRjaCAodGhpcy5idWZmZXJUeXBlKSB7XG4gICAgY2FzZSBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZS5CTE9DSzpcbiAgICAgIHRoaXMub3AgPSBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGg7XG4gICAgICB0aGlzLm91dHB1dCA9XG4gICAgICAgIG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKFxuICAgICAgICAgIFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aCArXG4gICAgICAgICAgdGhpcy5idWZmZXJTaXplICtcbiAgICAgICAgICBabGliLlJhd0luZmxhdGUuTWF4Q29weUxlbmd0aFxuICAgICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZS5BREFQVElWRTpcbiAgICAgIHRoaXMub3AgPSAwO1xuICAgICAgdGhpcy5vdXRwdXQgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSh0aGlzLmJ1ZmZlclNpemUpO1xuICAgICAgdGhpcy5leHBhbmRCdWZmZXIgPSB0aGlzLmV4cGFuZEJ1ZmZlckFkYXB0aXZlO1xuICAgICAgdGhpcy5jb25jYXRCdWZmZXIgPSB0aGlzLmNvbmNhdEJ1ZmZlckR5bmFtaWM7XG4gICAgICB0aGlzLmRlY29kZUh1ZmZtYW4gPSB0aGlzLmRlY29kZUh1ZmZtYW5BZGFwdGl2ZTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgaW5mbGF0ZSBtb2RlJyk7XG4gIH1cbn07XG5cbi8qKlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUgPSB7XG4gIEJMT0NLOiAwLFxuICBBREFQVElWRTogMVxufTtcblxuLyoqXG4gKiBkZWNvbXByZXNzLlxuICogQHJldHVybiB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gaW5mbGF0ZWQgYnVmZmVyLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3MgPSBmdW5jdGlvbigpIHtcbiAgd2hpbGUgKCF0aGlzLmJmaW5hbCkge1xuICAgIHRoaXMucGFyc2VCbG9jaygpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuY29uY2F0QnVmZmVyKCk7XG59O1xuXG4vKipcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn0gbWF4IGJhY2t3YXJkIGxlbmd0aCBmb3IgTFo3Ny5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoID0gMzI3Njg7XG5cbi8qKlxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfSBtYXggY29weSBsZW5ndGggZm9yIExaNzcuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5NYXhDb3B5TGVuZ3RoID0gMjU4O1xuXG4vKipcbiAqIGh1ZmZtYW4gb3JkZXJcbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5PcmRlciA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDE2QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbMTYsIDE3LCAxOCwgMCwgOCwgNywgOSwgNiwgMTAsIDUsIDExLCA0LCAxMiwgMywgMTMsIDIsIDE0LCAxLCAxNV0pO1xuXG4vKipcbiAqIGh1ZmZtYW4gbGVuZ3RoIGNvZGUgdGFibGUuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLkxlbmd0aENvZGVUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDE2QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbXG4gIDB4MDAwMywgMHgwMDA0LCAweDAwMDUsIDB4MDAwNiwgMHgwMDA3LCAweDAwMDgsIDB4MDAwOSwgMHgwMDBhLCAweDAwMGIsXG4gIDB4MDAwZCwgMHgwMDBmLCAweDAwMTEsIDB4MDAxMywgMHgwMDE3LCAweDAwMWIsIDB4MDAxZiwgMHgwMDIzLCAweDAwMmIsXG4gIDB4MDAzMywgMHgwMDNiLCAweDAwNDMsIDB4MDA1MywgMHgwMDYzLCAweDAwNzMsIDB4MDA4MywgMHgwMGEzLCAweDAwYzMsXG4gIDB4MDBlMywgMHgwMTAyLCAweDAxMDIsIDB4MDEwMlxuXSk7XG5cbi8qKlxuICogaHVmZm1hbiBsZW5ndGggZXh0cmEtYml0cyB0YWJsZS5cbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5MZW5ndGhFeHRyYVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50OEFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoW1xuICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxLCAxLCAxLCAyLCAyLCAyLCAyLCAzLCAzLCAzLCAzLCA0LCA0LCA0LCA0LCA1LCA1LFxuICA1LCA1LCAwLCAwLCAwXG5dKTtcblxuLyoqXG4gKiBodWZmbWFuIGRpc3QgY29kZSB0YWJsZS5cbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGUuRGlzdENvZGVUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDE2QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbXG4gIDB4MDAwMSwgMHgwMDAyLCAweDAwMDMsIDB4MDAwNCwgMHgwMDA1LCAweDAwMDcsIDB4MDAwOSwgMHgwMDBkLCAweDAwMTEsXG4gIDB4MDAxOSwgMHgwMDIxLCAweDAwMzEsIDB4MDA0MSwgMHgwMDYxLCAweDAwODEsIDB4MDBjMSwgMHgwMTAxLCAweDAxODEsXG4gIDB4MDIwMSwgMHgwMzAxLCAweDA0MDEsIDB4MDYwMSwgMHgwODAxLCAweDBjMDEsIDB4MTAwMSwgMHgxODAxLCAweDIwMDEsXG4gIDB4MzAwMSwgMHg0MDAxLCAweDYwMDFcbl0pO1xuXG4vKipcbiAqIGh1ZmZtYW4gZGlzdCBleHRyYS1iaXRzIHRhYmxlLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLkRpc3RFeHRyYVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50OEFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoW1xuICAwLCAwLCAwLCAwLCAxLCAxLCAyLCAyLCAzLCAzLCA0LCA0LCA1LCA1LCA2LCA2LCA3LCA3LCA4LCA4LCA5LCA5LCAxMCwgMTAsIDExLFxuICAxMSwgMTIsIDEyLCAxMywgMTNcbl0pO1xuXG4vKipcbiAqIGZpeGVkIGh1ZmZtYW4gbGVuZ3RoIGNvZGUgdGFibGVcbiAqIEBjb25zdFxuICogQHR5cGUgeyFBcnJheX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLkZpeGVkTGl0ZXJhbExlbmd0aFRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiB0YWJsZTtcbn0pKChmdW5jdGlvbigpIHtcbiAgdmFyIGxlbmd0aHMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgyODgpO1xuICB2YXIgaSwgaWw7XG5cbiAgZm9yIChpID0gMCwgaWwgPSBsZW5ndGhzLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICBsZW5ndGhzW2ldID1cbiAgICAgIChpIDw9IDE0MykgPyA4IDpcbiAgICAgIChpIDw9IDI1NSkgPyA5IDpcbiAgICAgIChpIDw9IDI3OSkgPyA3IDpcbiAgICAgIDg7XG4gIH1cblxuICByZXR1cm4gYnVpbGRIdWZmbWFuVGFibGUobGVuZ3Rocyk7XG59KSgpKTtcblxuLyoqXG4gKiBmaXhlZCBodWZmbWFuIGRpc3RhbmNlIGNvZGUgdGFibGVcbiAqIEBjb25zdFxuICogQHR5cGUgeyFBcnJheX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLkZpeGVkRGlzdGFuY2VUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gdGFibGU7XG59KSgoZnVuY3Rpb24oKSB7XG4gIHZhciBsZW5ndGhzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoMzApO1xuICB2YXIgaSwgaWw7XG5cbiAgZm9yIChpID0gMCwgaWwgPSBsZW5ndGhzLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICBsZW5ndGhzW2ldID0gNTtcbiAgfVxuXG4gIHJldHVybiBidWlsZEh1ZmZtYW5UYWJsZShsZW5ndGhzKTtcbn0pKCkpO1xuXG4vKipcbiAqIHBhcnNlIGRlZmxhdGVkIGJsb2NrLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLnBhcnNlQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGhlYWRlciAqL1xuICB2YXIgaGRyID0gdGhpcy5yZWFkQml0cygzKTtcblxuICAvLyBCRklOQUxcbiAgaWYgKGhkciAmIDB4MSkge1xuICAgIHRoaXMuYmZpbmFsID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIEJUWVBFXG4gIGhkciA+Pj49IDE7XG4gIHN3aXRjaCAoaGRyKSB7XG4gICAgLy8gdW5jb21wcmVzc2VkXG4gICAgY2FzZSAwOlxuICAgICAgdGhpcy5wYXJzZVVuY29tcHJlc3NlZEJsb2NrKCk7XG4gICAgICBicmVhaztcbiAgICAvLyBmaXhlZCBodWZmbWFuXG4gICAgY2FzZSAxOlxuICAgICAgdGhpcy5wYXJzZUZpeGVkSHVmZm1hbkJsb2NrKCk7XG4gICAgICBicmVhaztcbiAgICAvLyBkeW5hbWljIGh1ZmZtYW5cbiAgICBjYXNlIDI6XG4gICAgICB0aGlzLnBhcnNlRHluYW1pY0h1ZmZtYW5CbG9jaygpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gcmVzZXJ2ZWQgb3Igb3RoZXJcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIEJUWVBFOiAnICsgaGRyKTtcbiAgfVxufTtcblxuLyoqXG4gKiByZWFkIGluZmxhdGUgYml0c1xuICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCBiaXRzIGxlbmd0aC5cbiAqIEByZXR1cm4ge251bWJlcn0gcmVhZCBiaXRzLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLnJlYWRCaXRzID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gIHZhciBiaXRzYnVmID0gdGhpcy5iaXRzYnVmO1xuICB2YXIgYml0c2J1ZmxlbiA9IHRoaXMuYml0c2J1ZmxlbjtcbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgdmFyIGlwID0gdGhpcy5pcDtcblxuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gaW5wdXQgYW5kIG91dHB1dCBieXRlLiAqL1xuICB2YXIgb2N0ZXQ7XG5cbiAgLy8gbm90IGVub3VnaCBidWZmZXJcbiAgd2hpbGUgKGJpdHNidWZsZW4gPCBsZW5ndGgpIHtcbiAgICAvLyBpbnB1dCBieXRlXG4gICAgaWYgKGlwID49IGlucHV0TGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0IGJ1ZmZlciBpcyBicm9rZW4nKTtcbiAgICB9XG5cbiAgICAvLyBjb25jYXQgb2N0ZXRcbiAgICBiaXRzYnVmIHw9IGlucHV0W2lwKytdIDw8IGJpdHNidWZsZW47XG4gICAgYml0c2J1ZmxlbiArPSA4O1xuICB9XG5cbiAgLy8gb3V0cHV0IGJ5dGVcbiAgb2N0ZXQgPSBiaXRzYnVmICYgLyogTUFTSyAqLyAoKDEgPDwgbGVuZ3RoKSAtIDEpO1xuICBiaXRzYnVmID4+Pj0gbGVuZ3RoO1xuICBiaXRzYnVmbGVuIC09IGxlbmd0aDtcblxuICB0aGlzLmJpdHNidWYgPSBiaXRzYnVmO1xuICB0aGlzLmJpdHNidWZsZW4gPSBiaXRzYnVmbGVuO1xuICB0aGlzLmlwID0gaXA7XG5cbiAgcmV0dXJuIG9jdGV0O1xufTtcblxuLyoqXG4gKiByZWFkIGh1ZmZtYW4gY29kZSB1c2luZyB0YWJsZVxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXl8VWludDE2QXJyYXkpfSB0YWJsZSBodWZmbWFuIGNvZGUgdGFibGUuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IGh1ZmZtYW4gY29kZS5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5yZWFkQ29kZUJ5VGFibGUgPSBmdW5jdGlvbih0YWJsZSkge1xuICB2YXIgYml0c2J1ZiA9IHRoaXMuYml0c2J1ZjtcbiAgdmFyIGJpdHNidWZsZW4gPSB0aGlzLmJpdHNidWZsZW47XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBodWZmbWFuIGNvZGUgdGFibGUgKi9cbiAgdmFyIGNvZGVUYWJsZSA9IHRhYmxlWzBdO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG1heENvZGVMZW5ndGggPSB0YWJsZVsxXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvZGUgbGVuZ3RoICYgY29kZSAoMTZiaXQsIDE2Yml0KSAqL1xuICB2YXIgY29kZVdpdGhMZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjb2RlIGJpdHMgbGVuZ3RoICovXG4gIHZhciBjb2RlTGVuZ3RoO1xuXG4gIC8vIG5vdCBlbm91Z2ggYnVmZmVyXG4gIHdoaWxlIChiaXRzYnVmbGVuIDwgbWF4Q29kZUxlbmd0aCkge1xuICAgIGlmIChpcCA+PSBpbnB1dExlbmd0aCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGJpdHNidWYgfD0gaW5wdXRbaXArK10gPDwgYml0c2J1ZmxlbjtcbiAgICBiaXRzYnVmbGVuICs9IDg7XG4gIH1cblxuICAvLyByZWFkIG1heCBsZW5ndGhcbiAgY29kZVdpdGhMZW5ndGggPSBjb2RlVGFibGVbYml0c2J1ZiAmICgoMSA8PCBtYXhDb2RlTGVuZ3RoKSAtIDEpXTtcbiAgY29kZUxlbmd0aCA9IGNvZGVXaXRoTGVuZ3RoID4+PiAxNjtcblxuICBpZiAoY29kZUxlbmd0aCA+IGJpdHNidWZsZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgY29kZSBsZW5ndGg6ICcgKyBjb2RlTGVuZ3RoKTtcbiAgfVxuXG4gIHRoaXMuYml0c2J1ZiA9IGJpdHNidWYgPj4gY29kZUxlbmd0aDtcbiAgdGhpcy5iaXRzYnVmbGVuID0gYml0c2J1ZmxlbiAtIGNvZGVMZW5ndGg7XG4gIHRoaXMuaXAgPSBpcDtcblxuICByZXR1cm4gY29kZVdpdGhMZW5ndGggJiAweGZmZmY7XG59O1xuXG4vKipcbiAqIHBhcnNlIHVuY29tcHJlc3NlZCBibG9jay5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5wYXJzZVVuY29tcHJlc3NlZEJsb2NrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG4gIHZhciBvdXRwdXQgPSB0aGlzLm91dHB1dDtcbiAgdmFyIG9wID0gdGhpcy5vcDtcblxuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gYmxvY2sgbGVuZ3RoICovXG4gIHZhciBsZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgZm9yIGNoZWNrIGJsb2NrIGxlbmd0aCAqL1xuICB2YXIgbmxlbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG91dHB1dCBidWZmZXIgbGVuZ3RoICovXG4gIHZhciBvbGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvcHkgY291bnRlciAqL1xuICB2YXIgcHJlQ29weTtcblxuICAvLyBza2lwIGJ1ZmZlcmVkIGhlYWRlciBiaXRzXG4gIHRoaXMuYml0c2J1ZiA9IDA7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IDA7XG5cbiAgLy8gbGVuXG4gIGlmIChpcCArIDEgPj0gaW5wdXRMZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgdW5jb21wcmVzc2VkIGJsb2NrIGhlYWRlcjogTEVOJyk7XG4gIH1cbiAgbGVuID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gbmxlblxuICBpZiAoaXAgKyAxID49IGlucHV0TGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHVuY29tcHJlc3NlZCBibG9jayBoZWFkZXI6IE5MRU4nKTtcbiAgfVxuICBubGVuID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gY2hlY2sgbGVuICYgbmxlblxuICBpZiAobGVuID09PSB+bmxlbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB1bmNvbXByZXNzZWQgYmxvY2sgaGVhZGVyOiBsZW5ndGggdmVyaWZ5Jyk7XG4gIH1cblxuICAvLyBjaGVjayBzaXplXG4gIGlmIChpcCArIGxlbiA+IGlucHV0Lmxlbmd0aCkgeyB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0IGJ1ZmZlciBpcyBicm9rZW4nKTsgfVxuXG4gIC8vIGV4cGFuZCBidWZmZXJcbiAgc3dpdGNoICh0aGlzLmJ1ZmZlclR5cGUpIHtcbiAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlLkJMT0NLOlxuICAgICAgLy8gcHJlIGNvcHlcbiAgICAgIHdoaWxlIChvcCArIGxlbiA+IG91dHB1dC5sZW5ndGgpIHtcbiAgICAgICAgcHJlQ29weSA9IG9sZW5ndGggLSBvcDtcbiAgICAgICAgbGVuIC09IHByZUNvcHk7XG4gICAgICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgICAgICAgIG91dHB1dC5zZXQoaW5wdXQuc3ViYXJyYXkoaXAsIGlwICsgcHJlQ29weSksIG9wKTtcbiAgICAgICAgICBvcCArPSBwcmVDb3B5O1xuICAgICAgICAgIGlwICs9IHByZUNvcHk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2hpbGUgKHByZUNvcHktLSkge1xuICAgICAgICAgICAgb3V0cHV0W29wKytdID0gaW5wdXRbaXArK107XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgICAgb3AgPSB0aGlzLm9wO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZS5BREFQVElWRTpcbiAgICAgIHdoaWxlIChvcCArIGxlbiA+IG91dHB1dC5sZW5ndGgpIHtcbiAgICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoe2ZpeFJhdGlvOiAyfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGluZmxhdGUgbW9kZScpO1xuICB9XG5cbiAgLy8gY29weVxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBvdXRwdXQuc2V0KGlucHV0LnN1YmFycmF5KGlwLCBpcCArIGxlbiksIG9wKTtcbiAgICBvcCArPSBsZW47XG4gICAgaXAgKz0gbGVuO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgb3V0cHV0W29wKytdID0gaW5wdXRbaXArK107XG4gICAgfVxuICB9XG5cbiAgdGhpcy5pcCA9IGlwO1xuICB0aGlzLm9wID0gb3A7XG4gIHRoaXMub3V0cHV0ID0gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBwYXJzZSBmaXhlZCBodWZmbWFuIGJsb2NrLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLnBhcnNlRml4ZWRIdWZmbWFuQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5kZWNvZGVIdWZmbWFuKFxuICAgIFpsaWIuUmF3SW5mbGF0ZS5GaXhlZExpdGVyYWxMZW5ndGhUYWJsZSxcbiAgICBabGliLlJhd0luZmxhdGUuRml4ZWREaXN0YW5jZVRhYmxlXG4gICk7XG59O1xuXG4vKipcbiAqIHBhcnNlIGR5bmFtaWMgaHVmZm1hbiBibG9jay5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5wYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG51bWJlciBvZiBsaXRlcmFsIGFuZCBsZW5ndGggY29kZXMuICovXG4gIHZhciBobGl0ID0gdGhpcy5yZWFkQml0cyg1KSArIDI1NztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG51bWJlciBvZiBkaXN0YW5jZSBjb2Rlcy4gKi9cbiAgdmFyIGhkaXN0ID0gdGhpcy5yZWFkQml0cyg1KSArIDE7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgb2YgY29kZSBsZW5ndGhzLiAqL1xuICB2YXIgaGNsZW4gPSB0aGlzLnJlYWRCaXRzKDQpICsgNDtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBjb2RlIGxlbmd0aHMuICovXG4gIHZhciBjb2RlTGVuZ3RocyA9XG4gICAgbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoWmxpYi5SYXdJbmZsYXRlLk9yZGVyLmxlbmd0aCk7XG4gIC8qKiBAdHlwZSB7IUFycmF5fSBjb2RlIGxlbmd0aHMgdGFibGUuICovXG4gIHZhciBjb2RlTGVuZ3Roc1RhYmxlO1xuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheS48bnVtYmVyPil9IGxpdGVyYWwgYW5kIGxlbmd0aCBjb2RlIHRhYmxlLiAqL1xuICB2YXIgbGl0bGVuVGFibGU7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gZGlzdGFuY2UgY29kZSB0YWJsZS4gKi9cbiAgdmFyIGRpc3RUYWJsZTtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBjb2RlIGxlbmd0aCB0YWJsZS4gKi9cbiAgdmFyIGxlbmd0aFRhYmxlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNvZGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgcHJldjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciByZXBlYXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBsaW1pdC4gKi9cbiAgdmFyIGlsO1xuXG4gIC8vIGRlY29kZSBjb2RlIGxlbmd0aHNcbiAgZm9yIChpID0gMDsgaSA8IGhjbGVuOyArK2kpIHtcbiAgICBjb2RlTGVuZ3Roc1tabGliLlJhd0luZmxhdGUuT3JkZXJbaV1dID0gdGhpcy5yZWFkQml0cygzKTtcbiAgfVxuICBpZiAoIVVTRV9UWVBFREFSUkFZKSB7XG4gICAgZm9yIChpID0gaGNsZW4sIGhjbGVuID0gY29kZUxlbmd0aHMubGVuZ3RoOyBpIDwgaGNsZW47ICsraSkge1xuICAgICAgY29kZUxlbmd0aHNbWmxpYi5SYXdJbmZsYXRlLk9yZGVyW2ldXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgLy8gZGVjb2RlIGxlbmd0aCB0YWJsZVxuICBjb2RlTGVuZ3Roc1RhYmxlID0gYnVpbGRIdWZmbWFuVGFibGUoY29kZUxlbmd0aHMpO1xuICBsZW5ndGhUYWJsZSA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKGhsaXQgKyBoZGlzdCk7XG4gIGZvciAoaSA9IDAsIGlsID0gaGxpdCArIGhkaXN0OyBpIDwgaWw7KSB7XG4gICAgY29kZSA9IHRoaXMucmVhZENvZGVCeVRhYmxlKGNvZGVMZW5ndGhzVGFibGUpO1xuICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgY2FzZSAxNjpcbiAgICAgICAgcmVwZWF0ID0gMyArIHRoaXMucmVhZEJpdHMoMik7XG4gICAgICAgIHdoaWxlIChyZXBlYXQtLSkgeyBsZW5ndGhUYWJsZVtpKytdID0gcHJldjsgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTc6XG4gICAgICAgIHJlcGVhdCA9IDMgKyB0aGlzLnJlYWRCaXRzKDMpO1xuICAgICAgICB3aGlsZSAocmVwZWF0LS0pIHsgbGVuZ3RoVGFibGVbaSsrXSA9IDA7IH1cbiAgICAgICAgcHJldiA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxODpcbiAgICAgICAgcmVwZWF0ID0gMTEgKyB0aGlzLnJlYWRCaXRzKDcpO1xuICAgICAgICB3aGlsZSAocmVwZWF0LS0pIHsgbGVuZ3RoVGFibGVbaSsrXSA9IDA7IH1cbiAgICAgICAgcHJldiA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuZ3RoVGFibGVbaSsrXSA9IGNvZGU7XG4gICAgICAgIHByZXYgPSBjb2RlO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBsaXRsZW5UYWJsZSA9IFVTRV9UWVBFREFSUkFZXG4gICAgPyBidWlsZEh1ZmZtYW5UYWJsZShsZW5ndGhUYWJsZS5zdWJhcnJheSgwLCBobGl0KSlcbiAgICA6IGJ1aWxkSHVmZm1hblRhYmxlKGxlbmd0aFRhYmxlLnNsaWNlKDAsIGhsaXQpKTtcbiAgZGlzdFRhYmxlID0gVVNFX1RZUEVEQVJSQVlcbiAgICA/IGJ1aWxkSHVmZm1hblRhYmxlKGxlbmd0aFRhYmxlLnN1YmFycmF5KGhsaXQpKVxuICAgIDogYnVpbGRIdWZmbWFuVGFibGUobGVuZ3RoVGFibGUuc2xpY2UoaGxpdCkpO1xuXG4gIHRoaXMuZGVjb2RlSHVmZm1hbihsaXRsZW5UYWJsZSwgZGlzdFRhYmxlKTtcbn07XG5cbi8qKlxuICogZGVjb2RlIGh1ZmZtYW4gY29kZVxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gbGl0bGVuIGxpdGVyYWwgYW5kIGxlbmd0aCBjb2RlIHRhYmxlLlxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBkaXN0IGRpc3RpbmF0aW9uIGNvZGUgdGFibGUuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb2RlSHVmZm1hbiA9IGZ1bmN0aW9uKGxpdGxlbiwgZGlzdCkge1xuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gIHZhciBvcCA9IHRoaXMub3A7XG5cbiAgdGhpcy5jdXJyZW50TGl0bGVuVGFibGUgPSBsaXRsZW47XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG91dHB1dCBwb3NpdGlvbiBsaW1pdC4gKi9cbiAgdmFyIG9sZW5ndGggPSBvdXRwdXQubGVuZ3RoIC0gWmxpYi5SYXdJbmZsYXRlLk1heENvcHlMZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBodWZmbWFuIGNvZGUuICovXG4gIHZhciBjb2RlO1xuICAvKiogQHR5cGUge251bWJlcn0gdGFibGUgaW5kZXguICovXG4gIHZhciB0aTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZSBkaXN0aW5hdGlvbi4gKi9cbiAgdmFyIGNvZGVEaXN0O1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlIGxlbmd0aC4gKi9cbiAgdmFyIGNvZGVMZW5ndGg7XG5cbiAgd2hpbGUgKChjb2RlID0gdGhpcy5yZWFkQ29kZUJ5VGFibGUobGl0bGVuKSkgIT09IDI1Nikge1xuICAgIC8vIGxpdGVyYWxcbiAgICBpZiAoY29kZSA8IDI1Nikge1xuICAgICAgaWYgKG9wID49IG9sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5vcCA9IG9wO1xuICAgICAgICBvdXRwdXQgPSB0aGlzLmV4cGFuZEJ1ZmZlcigpO1xuICAgICAgICBvcCA9IHRoaXMub3A7XG4gICAgICB9XG4gICAgICBvdXRwdXRbb3ArK10gPSBjb2RlO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsZW5ndGggY29kZVxuICAgIHRpID0gY29kZSAtIDI1NztcbiAgICBjb2RlTGVuZ3RoID0gWmxpYi5SYXdJbmZsYXRlLkxlbmd0aENvZGVUYWJsZVt0aV07XG4gICAgaWYgKFpsaWIuUmF3SW5mbGF0ZS5MZW5ndGhFeHRyYVRhYmxlW3RpXSA+IDApIHtcbiAgICAgIGNvZGVMZW5ndGggKz0gdGhpcy5yZWFkQml0cyhabGliLlJhd0luZmxhdGUuTGVuZ3RoRXh0cmFUYWJsZVt0aV0pO1xuICAgIH1cblxuICAgIC8vIGRpc3QgY29kZVxuICAgIGNvZGUgPSB0aGlzLnJlYWRDb2RlQnlUYWJsZShkaXN0KTtcbiAgICBjb2RlRGlzdCA9IFpsaWIuUmF3SW5mbGF0ZS5EaXN0Q29kZVRhYmxlW2NvZGVdO1xuICAgIGlmIChabGliLlJhd0luZmxhdGUuRGlzdEV4dHJhVGFibGVbY29kZV0gPiAwKSB7XG4gICAgICBjb2RlRGlzdCArPSB0aGlzLnJlYWRCaXRzKFpsaWIuUmF3SW5mbGF0ZS5EaXN0RXh0cmFUYWJsZVtjb2RlXSk7XG4gICAgfVxuXG4gICAgLy8gbHo3NyBkZWNvZGVcbiAgICBpZiAob3AgPj0gb2xlbmd0aCkge1xuICAgICAgdGhpcy5vcCA9IG9wO1xuICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgIG9wID0gdGhpcy5vcDtcbiAgICB9XG4gICAgd2hpbGUgKGNvZGVMZW5ndGgtLSkge1xuICAgICAgb3V0cHV0W29wXSA9IG91dHB1dFsob3ArKykgLSBjb2RlRGlzdF07XG4gICAgfVxuICB9XG5cbiAgd2hpbGUgKHRoaXMuYml0c2J1ZmxlbiA+PSA4KSB7XG4gICAgdGhpcy5iaXRzYnVmbGVuIC09IDg7XG4gICAgdGhpcy5pcC0tO1xuICB9XG4gIHRoaXMub3AgPSBvcDtcbn07XG5cbi8qKlxuICogZGVjb2RlIGh1ZmZtYW4gY29kZSAoYWRhcHRpdmUpXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSBsaXRsZW4gbGl0ZXJhbCBhbmQgbGVuZ3RoIGNvZGUgdGFibGUuXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGRpc3QgZGlzdGluYXRpb24gY29kZSB0YWJsZS5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5kZWNvZGVIdWZmbWFuQWRhcHRpdmUgPSBmdW5jdGlvbihsaXRsZW4sIGRpc3QpIHtcbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuICB2YXIgb3AgPSB0aGlzLm9wO1xuXG4gIHRoaXMuY3VycmVudExpdGxlblRhYmxlID0gbGl0bGVuO1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBvdXRwdXQgcG9zaXRpb24gbGltaXQuICovXG4gIHZhciBvbGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZS4gKi9cbiAgdmFyIGNvZGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSB0YWJsZSBpbmRleC4gKi9cbiAgdmFyIHRpO1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlIGRpc3RpbmF0aW9uLiAqL1xuICB2YXIgY29kZURpc3Q7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBodWZmbWFuIGNvZGUgbGVuZ3RoLiAqL1xuICB2YXIgY29kZUxlbmd0aDtcblxuICB3aGlsZSAoKGNvZGUgPSB0aGlzLnJlYWRDb2RlQnlUYWJsZShsaXRsZW4pKSAhPT0gMjU2KSB7XG4gICAgLy8gbGl0ZXJhbFxuICAgIGlmIChjb2RlIDwgMjU2KSB7XG4gICAgICBpZiAob3AgPj0gb2xlbmd0aCkge1xuICAgICAgICBvdXRwdXQgPSB0aGlzLmV4cGFuZEJ1ZmZlcigpO1xuICAgICAgICBvbGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIG91dHB1dFtvcCsrXSA9IGNvZGU7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxlbmd0aCBjb2RlXG4gICAgdGkgPSBjb2RlIC0gMjU3O1xuICAgIGNvZGVMZW5ndGggPSBabGliLlJhd0luZmxhdGUuTGVuZ3RoQ29kZVRhYmxlW3RpXTtcbiAgICBpZiAoWmxpYi5SYXdJbmZsYXRlLkxlbmd0aEV4dHJhVGFibGVbdGldID4gMCkge1xuICAgICAgY29kZUxlbmd0aCArPSB0aGlzLnJlYWRCaXRzKFpsaWIuUmF3SW5mbGF0ZS5MZW5ndGhFeHRyYVRhYmxlW3RpXSk7XG4gICAgfVxuXG4gICAgLy8gZGlzdCBjb2RlXG4gICAgY29kZSA9IHRoaXMucmVhZENvZGVCeVRhYmxlKGRpc3QpO1xuICAgIGNvZGVEaXN0ID0gWmxpYi5SYXdJbmZsYXRlLkRpc3RDb2RlVGFibGVbY29kZV07XG4gICAgaWYgKFpsaWIuUmF3SW5mbGF0ZS5EaXN0RXh0cmFUYWJsZVtjb2RlXSA+IDApIHtcbiAgICAgIGNvZGVEaXN0ICs9IHRoaXMucmVhZEJpdHMoWmxpYi5SYXdJbmZsYXRlLkRpc3RFeHRyYVRhYmxlW2NvZGVdKTtcbiAgICB9XG5cbiAgICAvLyBsejc3IGRlY29kZVxuICAgIGlmIChvcCArIGNvZGVMZW5ndGggPiBvbGVuZ3RoKSB7XG4gICAgICBvdXRwdXQgPSB0aGlzLmV4cGFuZEJ1ZmZlcigpO1xuICAgICAgb2xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG4gICAgfVxuICAgIHdoaWxlIChjb2RlTGVuZ3RoLS0pIHtcbiAgICAgIG91dHB1dFtvcF0gPSBvdXRwdXRbKG9wKyspIC0gY29kZURpc3RdO1xuICAgIH1cbiAgfVxuXG4gIHdoaWxlICh0aGlzLmJpdHNidWZsZW4gPj0gOCkge1xuICAgIHRoaXMuYml0c2J1ZmxlbiAtPSA4O1xuICAgIHRoaXMuaXAtLTtcbiAgfVxuICB0aGlzLm9wID0gb3A7XG59O1xuXG4vKipcbiAqIGV4cGFuZCBvdXRwdXQgYnVmZmVyLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW0gb3B0aW9uIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLmV4cGFuZEJ1ZmZlciA9IGZ1bmN0aW9uKG9wdF9wYXJhbSkge1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IHN0b3JlIGJ1ZmZlci4gKi9cbiAgdmFyIGJ1ZmZlciA9XG4gICAgbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoXG4gICAgICAgIHRoaXMub3AgLSBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGhcbiAgICApO1xuICAvKiogQHR5cGUge251bWJlcn0gYmFja3dhcmQgYmFzZSBwb2ludCAqL1xuICB2YXIgYmFja3dhcmQgPSB0aGlzLm9wIC0gWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gY29weSBpbmRleC4gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjb3B5IGxpbWl0ICovXG4gIHZhciBpbDtcblxuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG5cbiAgLy8gY29weSB0byBvdXRwdXQgYnVmZmVyXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIGJ1ZmZlci5zZXQob3V0cHV0LnN1YmFycmF5KFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aCwgYnVmZmVyLmxlbmd0aCkpO1xuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDAsIGlsID0gYnVmZmVyLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGJ1ZmZlcltpXSA9IG91dHB1dFtpICsgWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoXTtcbiAgICB9XG4gIH1cblxuICB0aGlzLmJsb2Nrcy5wdXNoKGJ1ZmZlcik7XG4gIHRoaXMudG90YWxwb3MgKz0gYnVmZmVyLmxlbmd0aDtcblxuICAvLyBjb3B5IHRvIGJhY2t3YXJkIGJ1ZmZlclxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBvdXRwdXQuc2V0KFxuICAgICAgb3V0cHV0LnN1YmFycmF5KGJhY2t3YXJkLCBiYWNrd2FyZCArIFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aClcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDA7IGkgPCBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGg7ICsraSkge1xuICAgICAgb3V0cHV0W2ldID0gb3V0cHV0W2JhY2t3YXJkICsgaV07XG4gICAgfVxuICB9XG5cbiAgdGhpcy5vcCA9IFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aDtcblxuICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBleHBhbmQgb3V0cHV0IGJ1ZmZlci4gKGFkYXB0aXZlKVxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW0gb3B0aW9uIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyIHBvaW50ZXIuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyQWRhcHRpdmUgPSBmdW5jdGlvbihvcHRfcGFyYW0pIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBzdG9yZSBidWZmZXIuICovXG4gIHZhciBidWZmZXI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBleHBhbnRpb24gcmF0aW8uICovXG4gIHZhciByYXRpbyA9ICh0aGlzLmlucHV0Lmxlbmd0aCAvIHRoaXMuaXAgKyAxKSB8IDA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtYXhpbXVtIG51bWJlciBvZiBodWZmbWFuIGNvZGUuICovXG4gIHZhciBtYXhIdWZmQ29kZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG5ldyBvdXRwdXQgYnVmZmVyIHNpemUuICovXG4gIHZhciBuZXdTaXplO1xuICAvKiogQHR5cGUge251bWJlcn0gbWF4IGluZmxhdGUgc2l6ZS4gKi9cbiAgdmFyIG1heEluZmxhdGVTaXplO1xuXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBvdXRwdXQgPSB0aGlzLm91dHB1dDtcblxuICBpZiAob3B0X3BhcmFtKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW0uZml4UmF0aW8gPT09ICdudW1iZXInKSB7XG4gICAgICByYXRpbyA9IG9wdF9wYXJhbS5maXhSYXRpbztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW0uYWRkUmF0aW8gPT09ICdudW1iZXInKSB7XG4gICAgICByYXRpbyArPSBvcHRfcGFyYW0uYWRkUmF0aW87XG4gICAgfVxuICB9XG5cbiAgLy8gY2FsY3VsYXRlIG5ldyBidWZmZXIgc2l6ZVxuICBpZiAocmF0aW8gPCAyKSB7XG4gICAgbWF4SHVmZkNvZGUgPVxuICAgICAgKGlucHV0Lmxlbmd0aCAtIHRoaXMuaXApIC8gdGhpcy5jdXJyZW50TGl0bGVuVGFibGVbMl07XG4gICAgbWF4SW5mbGF0ZVNpemUgPSAobWF4SHVmZkNvZGUgLyAyICogMjU4KSB8IDA7XG4gICAgbmV3U2l6ZSA9IG1heEluZmxhdGVTaXplIDwgb3V0cHV0Lmxlbmd0aCA/XG4gICAgICBvdXRwdXQubGVuZ3RoICsgbWF4SW5mbGF0ZVNpemUgOlxuICAgICAgb3V0cHV0Lmxlbmd0aCA8PCAxO1xuICB9IGVsc2Uge1xuICAgIG5ld1NpemUgPSBvdXRwdXQubGVuZ3RoICogcmF0aW87XG4gIH1cblxuICAvLyBidWZmZXIgZXhwYW50aW9uXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG5ld1NpemUpO1xuICAgIGJ1ZmZlci5zZXQob3V0cHV0KTtcbiAgfSBlbHNlIHtcbiAgICBidWZmZXIgPSBvdXRwdXQ7XG4gIH1cblxuICB0aGlzLm91dHB1dCA9IGJ1ZmZlcjtcblxuICByZXR1cm4gdGhpcy5vdXRwdXQ7XG59O1xuXG4vKipcbiAqIGNvbmNhdCBvdXRwdXQgYnVmZmVyLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5jb25jYXRCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB2YXIgcG9zID0gMDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB2YXIgbGltaXQgPSB0aGlzLnRvdGFscG9zICsgKHRoaXMub3AgLSBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGgpO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBibG9jayBhcnJheS4gKi9cbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuICAvKiogQHR5cGUgeyFBcnJheX0gYmxvY2tzIGFycmF5LiAqL1xuICB2YXIgYmxvY2tzID0gdGhpcy5ibG9ja3M7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJsb2NrIGFycmF5LiAqL1xuICB2YXIgYmxvY2s7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdmFyIGJ1ZmZlciA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKGxpbWl0KTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGxpbWl0ZXIuICovXG4gIHZhciBpbDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGo7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGxpbWl0ZXIuICovXG4gIHZhciBqbDtcblxuICAvLyBzaW5nbGUgYnVmZmVyXG4gIGlmIChibG9ja3MubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID9cbiAgICAgIHRoaXMub3V0cHV0LnN1YmFycmF5KFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aCwgdGhpcy5vcCkgOlxuICAgICAgdGhpcy5vdXRwdXQuc2xpY2UoWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoLCB0aGlzLm9wKTtcbiAgfVxuXG4gIC8vIGNvcHkgdG8gYnVmZmVyXG4gIGZvciAoaSA9IDAsIGlsID0gYmxvY2tzLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICBibG9jayA9IGJsb2Nrc1tpXTtcbiAgICBmb3IgKGogPSAwLCBqbCA9IGJsb2NrLmxlbmd0aDsgaiA8IGpsOyArK2opIHtcbiAgICAgIGJ1ZmZlcltwb3MrK10gPSBibG9ja1tqXTtcbiAgICB9XG4gIH1cblxuICAvLyBjdXJyZW50IGJ1ZmZlclxuICBmb3IgKGkgPSBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGgsIGlsID0gdGhpcy5vcDsgaSA8IGlsOyArK2kpIHtcbiAgICBidWZmZXJbcG9zKytdID0gb3V0cHV0W2ldO1xuICB9XG5cbiAgdGhpcy5ibG9ja3MgPSBbXTtcbiAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG5cbiAgcmV0dXJuIHRoaXMuYnVmZmVyO1xufTtcblxuLyoqXG4gKiBjb25jYXQgb3V0cHV0IGJ1ZmZlci4gKGR5bmFtaWMpXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLmNvbmNhdEJ1ZmZlckR5bmFtaWMgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtBcnJheS48bnVtYmVyPnxVaW50OEFycmF5fSBvdXRwdXQgYnVmZmVyLiAqL1xuICB2YXIgYnVmZmVyO1xuICB2YXIgb3AgPSB0aGlzLm9wO1xuXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIGlmICh0aGlzLnJlc2l6ZSkge1xuICAgICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkob3ApO1xuICAgICAgYnVmZmVyLnNldCh0aGlzLm91dHB1dC5zdWJhcnJheSgwLCBvcCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXIgPSB0aGlzLm91dHB1dC5zdWJhcnJheSgwLCBvcCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmICh0aGlzLm91dHB1dC5sZW5ndGggPiBvcCkge1xuICAgICAgdGhpcy5vdXRwdXQubGVuZ3RoID0gb3A7XG4gICAgfVxuICAgIGJ1ZmZlciA9IHRoaXMub3V0cHV0O1xuICB9XG5cbiAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG5cbiAgcmV0dXJuIHRoaXMuYnVmZmVyO1xufTtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEdaSVAgKFJGQzE5NTIpIOWxlemWi+OCs+ODs+ODhuODiuWun+ijhS5cbiAqL1xuZ29vZy5wcm92aWRlKCdabGliLkd1bnppcCcpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuQ1JDMzInKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5HemlwJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuUmF3SW5mbGF0ZScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkd1bnppcE1lbWJlcicpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBpbnB1dCBpbnB1dCBidWZmZXIuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9uIHBhcmFtZXRlcnMuXG4gKi9cblpsaWIuR3VuemlwID0gZnVuY3Rpb24oaW5wdXQsIG9wdF9wYXJhbXMpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbnB1dCBidWZmZXIuICovXG4gIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB0aGlzLmlwID0gMDtcbiAgLyoqIEB0eXBlIHtBcnJheS48WmxpYi5HdW56aXBNZW1iZXI+fSAqL1xuICB0aGlzLm1lbWJlciA9IFtdO1xuICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gIHRoaXMuZGVjb21wcmVzc2VkID0gZmFsc2U7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge0FycmF5LjxabGliLkd1bnppcE1lbWJlcj59XG4gKi9cblpsaWIuR3VuemlwLnByb3RvdHlwZS5nZXRNZW1iZXJzID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5kZWNvbXByZXNzZWQpIHtcbiAgICB0aGlzLmRlY29tcHJlc3MoKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLm1lbWJlci5zbGljZSgpO1xufTtcblxuLyoqXG4gKiBpbmZsYXRlIGd6aXAgZGF0YS5cbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGluZmxhdGVkIGJ1ZmZlci5cbiAqL1xuWmxpYi5HdW56aXAucHJvdG90eXBlLmRlY29tcHJlc3MgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IGxlbmd0aC4gKi9cbiAgdmFyIGlsID0gdGhpcy5pbnB1dC5sZW5ndGg7XG5cbiAgd2hpbGUgKHRoaXMuaXAgPCBpbCkge1xuICAgIHRoaXMuZGVjb2RlTWVtYmVyKCk7XG4gIH1cblxuICB0aGlzLmRlY29tcHJlc3NlZCA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXMuY29uY2F0TWVtYmVyKCk7XG59O1xuXG4vKipcbiAqIGRlY29kZSBnemlwIG1lbWJlci5cbiAqL1xuWmxpYi5HdW56aXAucHJvdG90eXBlLmRlY29kZU1lbWJlciA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge1psaWIuR3VuemlwTWVtYmVyfSAqL1xuICB2YXIgbWVtYmVyID0gbmV3IFpsaWIuR3VuemlwTWVtYmVyKCk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaXNpemU7XG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdJbmZsYXRlfSBSYXdJbmZsYXRlIGltcGxlbWVudGF0aW9uLiAqL1xuICB2YXIgcmF3aW5mbGF0ZTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbmZsYXRlZCBkYXRhLiAqL1xuICB2YXIgaW5mbGF0ZWQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbmZsYXRlIHNpemUgKi9cbiAgdmFyIGluZmxlbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNoYXJhY3RlciBjb2RlICovXG4gIHZhciBjO1xuICAvKiogQHR5cGUge251bWJlcn0gY2hhcmFjdGVyIGluZGV4IGluIHN0cmluZy4gKi9cbiAgdmFyIGNpO1xuICAvKiogQHR5cGUge0FycmF5LjxzdHJpbmc+fSBjaGFyYWN0ZXIgYXJyYXkuICovXG4gIHZhciBzdHI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtb2RpZmljYXRpb24gdGltZS4gKi9cbiAgdmFyIG10aW1lO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNyYzMyO1xuXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG5cbiAgbWVtYmVyLmlkMSA9IGlucHV0W2lwKytdO1xuICBtZW1iZXIuaWQyID0gaW5wdXRbaXArK107XG5cbiAgLy8gY2hlY2sgc2lnbmF0dXJlXG4gIGlmIChtZW1iZXIuaWQxICE9PSAweDFmIHx8IG1lbWJlci5pZDIgIT09IDB4OGIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmlsZSBzaWduYXR1cmU6JyArIG1lbWJlci5pZDEgKyAnLCcgKyBtZW1iZXIuaWQyKTtcbiAgfVxuXG4gIC8vIGNoZWNrIGNvbXByZXNzaW9uIG1ldGhvZFxuICBtZW1iZXIuY20gPSBpbnB1dFtpcCsrXTtcbiAgc3dpdGNoIChtZW1iZXIuY20pIHtcbiAgICBjYXNlIDg6IC8qIFhYWDogdXNlIFpsaWIgY29uc3QgKi9cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gY29tcHJlc3Npb24gbWV0aG9kOiAnICsgbWVtYmVyLmNtKTtcbiAgfVxuXG4gIC8vIGZsYWdzXG4gIG1lbWJlci5mbGcgPSBpbnB1dFtpcCsrXTtcblxuICAvLyBtb2RpZmljYXRpb24gdGltZVxuICBtdGltZSA9IChpbnB1dFtpcCsrXSkgICAgICAgfFxuICAgICAgICAgIChpbnB1dFtpcCsrXSA8PCA4KSAgfFxuICAgICAgICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfFxuICAgICAgICAgIChpbnB1dFtpcCsrXSA8PCAyNCk7XG4gIG1lbWJlci5tdGltZSA9IG5ldyBEYXRlKG10aW1lICogMTAwMCk7XG5cbiAgLy8gZXh0cmEgZmxhZ3NcbiAgbWVtYmVyLnhmbCA9IGlucHV0W2lwKytdO1xuXG4gIC8vIG9wZXJhdGluZyBzeXN0ZW1cbiAgbWVtYmVyLm9zID0gaW5wdXRbaXArK107XG5cbiAgLy8gZXh0cmFcbiAgaWYgKChtZW1iZXIuZmxnICYgWmxpYi5HemlwLkZsYWdzTWFzay5GRVhUUkEpID4gMCkge1xuICAgIG1lbWJlci54bGVuID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG4gICAgaXAgPSB0aGlzLmRlY29kZVN1YkZpZWxkKGlwLCBtZW1iZXIueGxlbik7XG4gIH1cblxuICAvLyBmbmFtZVxuICBpZiAoKG1lbWJlci5mbGcgJiBabGliLkd6aXAuRmxhZ3NNYXNrLkZOQU1FKSA+IDApIHtcbiAgICBmb3Ioc3RyID0gW10sIGNpID0gMDsgKGMgPSBpbnB1dFtpcCsrXSkgPiAwOykge1xuICAgICAgc3RyW2NpKytdID0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICB9XG4gICAgbWVtYmVyLm5hbWUgPSBzdHIuam9pbignJyk7XG4gIH1cblxuICAvLyBmY29tbWVudFxuICBpZiAoKG1lbWJlci5mbGcgJiBabGliLkd6aXAuRmxhZ3NNYXNrLkZDT01NRU5UKSA+IDApIHtcbiAgICBmb3Ioc3RyID0gW10sIGNpID0gMDsgKGMgPSBpbnB1dFtpcCsrXSkgPiAwOykge1xuICAgICAgc3RyW2NpKytdID0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICB9XG4gICAgbWVtYmVyLmNvbW1lbnQgPSBzdHIuam9pbignJyk7XG4gIH1cblxuICAvLyBmaGNyY1xuICBpZiAoKG1lbWJlci5mbGcgJiBabGliLkd6aXAuRmxhZ3NNYXNrLkZIQ1JDKSA+IDApIHtcbiAgICBtZW1iZXIuY3JjMTYgPSBabGliLkNSQzMyLmNhbGMoaW5wdXQsIDAsIGlwKSAmIDB4ZmZmZjtcbiAgICBpZiAobWVtYmVyLmNyYzE2ICE9PSAoaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgaGVhZGVyIGNyYzE2Jyk7XG4gICAgfVxuICB9XG5cbiAgLy8gaXNpemUg44KS5LqL5YmN44Gr5Y+W5b6X44GZ44KL44Go5bGV6ZaL5b6M44Gu44K144Kk44K644GM5YiG44GL44KL44Gf44KB44CBXG4gIC8vIGluZmxhdGXlh6bnkIbjga7jg5Djg4Pjg5XjgqHjgrXjgqTjgrrjgYzkuovliY3jgavliIbjgYvjgorjgIHpq5jpgJ/jgavjgarjgotcbiAgaXNpemUgPSAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gNF0pICAgICAgIHwgKGlucHV0W2lucHV0Lmxlbmd0aCAtIDNdIDw8IDgpIHxcbiAgICAgICAgICAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMl0gPDwgMTYpIHwgKGlucHV0W2lucHV0Lmxlbmd0aCAtIDFdIDw8IDI0KTtcblxuICAvLyBpc2l6ZSDjga7lpqXlvZPmgKfjg4Hjgqfjg4Pjgq9cbiAgLy8g44OP44OV44Oe44Oz56ym5Y+344Gn44Gv5pyA5bCPIDItYml0IOOBruOBn+OCgeOAgeacgOWkp+OBpyAxLzQg44Gr44Gq44KLXG4gIC8vIExaNzcg56ym5Y+344Gn44GvIOmVt+OBleOBqOi3nemboiAyLUJ5dGUg44Gn5pyA5aSnIDI1OC1CeXRlIOOCkuihqOePvuOBp+OBjeOCi+OBn+OCgeOAgVxuICAvLyAxLzEyOCDjgavjgarjgovjgajjgZnjgotcbiAgLy8g44GT44GT44GL44KJ5YWl5Yqb44OQ44OD44OV44Kh44Gu5q6L44KK44GMIGlzaXplIOOBriA1MTIg5YCN5Lul5LiK44Gg44Gj44Gf44KJXG4gIC8vIOOCteOCpOOCuuaMh+WumuOBruODkOODg+ODleOCoeeiuuS/neOBr+ihjOOCj+OBquOBhOS6i+OBqOOBmeOCi1xuICBpZiAoaW5wdXQubGVuZ3RoIC0gaXAgLSAvKiBDUkMtMzIgKi80IC0gLyogSVNJWkUgKi80IDwgaXNpemUgKiA1MTIpIHtcbiAgICBpbmZsZW4gPSBpc2l6ZTtcbiAgfVxuXG4gIC8vIGNvbXByZXNzZWQgYmxvY2tcbiAgcmF3aW5mbGF0ZSA9IG5ldyBabGliLlJhd0luZmxhdGUoaW5wdXQsIHsnaW5kZXgnOiBpcCwgJ2J1ZmZlclNpemUnOiBpbmZsZW59KTtcbiAgbWVtYmVyLmRhdGEgPSBpbmZsYXRlZCA9IHJhd2luZmxhdGUuZGVjb21wcmVzcygpO1xuICBpcCA9IHJhd2luZmxhdGUuaXA7XG5cbiAgLy8gY3JjMzJcbiAgbWVtYmVyLmNyYzMyID0gY3JjMzIgPVxuICAgICgoaW5wdXRbaXArK10pICAgICAgIHwgKGlucHV0W2lwKytdIDw8IDgpIHxcbiAgICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNCkpID4+PiAwO1xuICBpZiAoWmxpYi5DUkMzMi5jYWxjKGluZmxhdGVkKSAhPT0gY3JjMzIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgQ1JDLTMyIGNoZWNrc3VtOiAweCcgK1xuICAgICAgICBabGliLkNSQzMyLmNhbGMoaW5mbGF0ZWQpLnRvU3RyaW5nKDE2KSArICcgLyAweCcgKyBjcmMzMi50b1N0cmluZygxNikpO1xuICB9XG5cbiAgLy8gaW5wdXQgc2l6ZVxuICBtZW1iZXIuaXNpemUgPSBpc2l6ZSA9XG4gICAgKChpbnB1dFtpcCsrXSkgICAgICAgfCAoaW5wdXRbaXArK10gPDwgOCkgfFxuICAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KSkgPj4+IDA7XG4gIGlmICgoaW5mbGF0ZWQubGVuZ3RoICYgMHhmZmZmZmZmZikgIT09IGlzaXplKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGlucHV0IHNpemU6ICcgK1xuICAgICAgICAoaW5mbGF0ZWQubGVuZ3RoICYgMHhmZmZmZmZmZikgKyAnIC8gJyArIGlzaXplKTtcbiAgfVxuXG4gIHRoaXMubWVtYmVyLnB1c2gobWVtYmVyKTtcbiAgdGhpcy5pcCA9IGlwO1xufTtcblxuLyoqXG4gKiDjgrXjg5bjg5XjgqPjg7zjg6vjg4njga7jg4fjgrPjg7zjg4lcbiAqIFhYWDog54++5Zyo44Gv5L2V44KC44Gb44Ga44K544Kt44OD44OX44GZ44KLXG4gKi9cblpsaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvZGVTdWJGaWVsZCA9IGZ1bmN0aW9uKGlwLCBsZW5ndGgpIHtcbiAgcmV0dXJuIGlwICsgbGVuZ3RoO1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfVxuICovXG5abGliLkd1bnppcC5wcm90b3R5cGUuY29uY2F0TWVtYmVyID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7QXJyYXkuPFpsaWIuR3VuemlwTWVtYmVyPn0gKi9cbiAgdmFyIG1lbWJlciA9IHRoaXMubWVtYmVyO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaWw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgcCA9IDA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgc2l6ZSA9IDA7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIGJ1ZmZlcjtcblxuICBmb3IgKGkgPSAwLCBpbCA9IG1lbWJlci5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgc2l6ZSArPSBtZW1iZXJbaV0uZGF0YS5sZW5ndGg7XG4gIH1cblxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShzaXplKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgaWw7ICsraSkge1xuICAgICAgYnVmZmVyLnNldChtZW1iZXJbaV0uZGF0YSwgcCk7XG4gICAgICBwICs9IG1lbWJlcltpXS5kYXRhLmxlbmd0aDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGJ1ZmZlcltpXSA9IG1lbWJlcltpXS5kYXRhO1xuICAgIH1cbiAgICBidWZmZXIgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBidWZmZXIpO1xuICB9XG5cbiAgcmV0dXJuIGJ1ZmZlcjtcbn07XG5cbn0pO1xuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IOmbkeWkmuOBqumWouaVsOe+pOOCkuOBvuOBqOOCgeOBn+ODouOCuOODpeODvOODq+Wun+ijhS5cbiAqL1xuZ29vZy5wcm92aWRlKCdabGliLlV0aWwnKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBCeXRlIFN0cmluZyDjgYvjgokgQnl0ZSBBcnJheSDjgavlpInmj5suXG4gKiBAcGFyYW0geyFzdHJpbmd9IHN0ciBieXRlIHN0cmluZy5cbiAqIEByZXR1cm4geyFBcnJheS48bnVtYmVyPn0gYnl0ZSBhcnJheS5cbiAqL1xuWmxpYi5VdGlsLnN0cmluZ1RvQnl0ZUFycmF5ID0gZnVuY3Rpb24oc3RyKSB7XG4gIC8qKiBAdHlwZSB7IUFycmF5Ljwoc3RyaW5nfG51bWJlcik+fSAqL1xuICB2YXIgdG1wID0gc3RyLnNwbGl0KCcnKTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlsO1xuXG4gIGZvciAoaSA9IDAsIGlsID0gdG1wLmxlbmd0aDsgaSA8IGlsOyBpKyspIHtcbiAgICB0bXBbaV0gPSAodG1wW2ldLmNoYXJDb2RlQXQoMCkgJiAweGZmKSA+Pj4gMDtcbiAgfVxuXG4gIHJldHVybiB0bXA7XG59O1xuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuXG4vKiB2aW06c2V0IGV4cGFuZHRhYiB0cz0yIHN3PTIgdHc9ODA6ICovXG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQWRsZXIzMiBjaGVja3N1bSDlrp/oo4UuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5BZGxlcjMyJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5VdGlsJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQWRsZXIzMiDjg4/jg4Pjgrfjg6XlgKTjga7kvZzmiJBcbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5fHN0cmluZyl9IGFycmF5IOeul+WHuuOBq+S9v+eUqOOBmeOCiyBieXRlIGFycmF5LlxuICogQHJldHVybiB7bnVtYmVyfSBBZGxlcjMyIOODj+ODg+OCt+ODpeWApC5cbiAqL1xuWmxpYi5BZGxlcjMyID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgaWYgKHR5cGVvZihhcnJheSkgPT09ICdzdHJpbmcnKSB7XG4gICAgYXJyYXkgPSBabGliLlV0aWwuc3RyaW5nVG9CeXRlQXJyYXkoYXJyYXkpO1xuICB9XG4gIHJldHVybiBabGliLkFkbGVyMzIudXBkYXRlKDEsIGFycmF5KTtcbn07XG5cbi8qKlxuICogQWRsZXIzMiDjg4/jg4Pjgrfjg6XlgKTjga7mm7TmlrBcbiAqIEBwYXJhbSB7bnVtYmVyfSBhZGxlciDnj77lnKjjga7jg4/jg4Pjgrfjg6XlgKQuXG4gKiBAcGFyYW0geyEoQXJyYXl8VWludDhBcnJheSl9IGFycmF5IOabtOaWsOOBq+S9v+eUqOOBmeOCiyBieXRlIGFycmF5LlxuICogQHJldHVybiB7bnVtYmVyfSBBZGxlcjMyIOODj+ODg+OCt+ODpeWApC5cbiAqL1xuWmxpYi5BZGxlcjMyLnVwZGF0ZSA9IGZ1bmN0aW9uKGFkbGVyLCBhcnJheSkge1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHMxID0gYWRsZXIgJiAweGZmZmY7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgczIgPSAoYWRsZXIgPj4+IDE2KSAmIDB4ZmZmZjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGFycmF5IGxlbmd0aCAqL1xuICB2YXIgbGVuID0gYXJyYXkubGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBsZW5ndGggKGRvbid0IG92ZXJmbG93KSAqL1xuICB2YXIgdGxlbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGFycmF5IGluZGV4ICovXG4gIHZhciBpID0gMDtcblxuICB3aGlsZSAobGVuID4gMCkge1xuICAgIHRsZW4gPSBsZW4gPiBabGliLkFkbGVyMzIuT3B0aW1pemF0aW9uUGFyYW1ldGVyID9cbiAgICAgIFpsaWIuQWRsZXIzMi5PcHRpbWl6YXRpb25QYXJhbWV0ZXIgOiBsZW47XG4gICAgbGVuIC09IHRsZW47XG4gICAgZG8ge1xuICAgICAgczEgKz0gYXJyYXlbaSsrXTtcbiAgICAgIHMyICs9IHMxO1xuICAgIH0gd2hpbGUgKC0tdGxlbik7XG5cbiAgICBzMSAlPSA2NTUyMTtcbiAgICBzMiAlPSA2NTUyMTtcbiAgfVxuXG4gIHJldHVybiAoKHMyIDw8IDE2KSB8IHMxKSA+Pj4gMDtcbn07XG5cbi8qKlxuICogQWRsZXIzMiDmnIDpganljJbjg5Hjg6njg6Hjg7zjgr9cbiAqIOePvueKtuOBp+OBryAxMDI0IOeoi+W6puOBjOacgOmBqS5cbiAqIEBzZWUgaHR0cDovL2pzcGVyZi5jb20vYWRsZXItMzItc2ltcGxlLXZzLW9wdGltaXplZC8zXG4gKiBAZGVmaW5lIHtudW1iZXJ9XG4gKi9cblpsaWIuQWRsZXIzMi5PcHRpbWl6YXRpb25QYXJhbWV0ZXIgPSAxMDI0O1xuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuXG4vKiB2aW06c2V0IGV4cGFuZHRhYiB0cz0yIHN3PTIgdHc9ODA6ICovXG4iLCJnb29nLnByb3ZpZGUoJ1psaWIuSW5mbGF0ZScpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuQWRsZXIzMicpO1xuZ29vZy5yZXF1aXJlKCdabGliLlJhd0luZmxhdGUnKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShVaW50OEFycmF5fEFycmF5KX0gaW5wdXQgZGVmbGF0ZWQgYnVmZmVyLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICpcbiAqIG9wdF9wYXJhbXMg44Gv5Lul5LiL44Gu44OX44Ot44OR44OG44Kj44KS5oyH5a6a44GZ44KL5LqL44GM44Gn44GN44G+44GZ44CCXG4gKiAgIC0gaW5kZXg6IGlucHV0IGJ1ZmZlciDjga4gZGVmbGF0ZSDjgrPjg7Pjg4bjg4rjga7plovlp4vkvY3nva4uXG4gKiAgIC0gYmxvY2tTaXplOiDjg5Djg4Pjg5XjgqHjga7jg5bjg63jg4Pjgq/jgrXjgqTjgrouXG4gKiAgIC0gdmVyaWZ5OiDkvLjlvLXjgYzntYLjgo/jgaPjgZ/lvowgYWRsZXItMzIgY2hlY2tzdW0g44Gu5qSc6Ki844KS6KGM44GG44GLLlxuICogICAtIGJ1ZmZlclR5cGU6IFpsaWIuSW5mbGF0ZS5CdWZmZXJUeXBlIOOBruWApOOBq+OCiOOBo+OBpuODkOODg+ODleOCoeOBrueuoeeQhuaWueazleOCkuaMh+WumuOBmeOCiy5cbiAqICAgICAgIFpsaWIuSW5mbGF0ZS5CdWZmZXJUeXBlIOOBryBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZSDjga7jgqjjgqTjg6rjgqLjgrkuXG4gKi9cblpsaWIuSW5mbGF0ZSA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgYnVmZmVyU2l6ZTtcbiAgLyoqIEB0eXBlIHtabGliLkluZmxhdGUuQnVmZmVyVHlwZX0gKi9cbiAgdmFyIGJ1ZmZlclR5cGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgY21mO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGZsZztcblxuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheSl9ICovXG4gIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMuaXAgPSAwO1xuICAvKiogQHR5cGUge1psaWIuUmF3SW5mbGF0ZX0gKi9cbiAgdGhpcy5yYXdpbmZsYXRlO1xuICAvKiogQHR5cGUgeyhib29sZWFufHVuZGVmaW5lZCl9IHZlcmlmeSBmbGFnLiAqL1xuICB0aGlzLnZlcmlmeTtcblxuICAvLyBvcHRpb24gcGFyYW1ldGVyc1xuICBpZiAob3B0X3BhcmFtcyB8fCAhKG9wdF9wYXJhbXMgPSB7fSkpIHtcbiAgICBpZiAob3B0X3BhcmFtc1snaW5kZXgnXSkge1xuICAgICAgdGhpcy5pcCA9IG9wdF9wYXJhbXNbJ2luZGV4J107XG4gICAgfVxuICAgIGlmIChvcHRfcGFyYW1zWyd2ZXJpZnknXSkge1xuICAgICAgdGhpcy52ZXJpZnkgPSBvcHRfcGFyYW1zWyd2ZXJpZnknXTtcbiAgICB9XG4gIH1cblxuICAvLyBDb21wcmVzc2lvbiBNZXRob2QgYW5kIEZsYWdzXG4gIGNtZiA9IGlucHV0W3RoaXMuaXArK107XG4gIGZsZyA9IGlucHV0W3RoaXMuaXArK107XG5cbiAgLy8gY29tcHJlc3Npb24gbWV0aG9kXG4gIHN3aXRjaCAoY21mICYgMHgwZikge1xuICAgIGNhc2UgWmxpYi5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxuICAgICAgdGhpcy5tZXRob2QgPSBabGliLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBjb21wcmVzc2lvbiBtZXRob2QnKTtcbiAgfVxuXG4gIC8vIGZjaGVja1xuICBpZiAoKChjbWYgPDwgOCkgKyBmbGcpICUgMzEgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmNoZWNrIGZsYWc6JyArICgoY21mIDw8IDgpICsgZmxnKSAlIDMxKTtcbiAgfVxuXG4gIC8vIGZkaWN0IChub3Qgc3VwcG9ydGVkKVxuICBpZiAoZmxnICYgMHgyMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignZmRpY3QgZmxhZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gIH1cblxuICAvLyBSYXdJbmZsYXRlXG4gIHRoaXMucmF3aW5mbGF0ZSA9IG5ldyBabGliLlJhd0luZmxhdGUoaW5wdXQsIHtcbiAgICAnaW5kZXgnOiB0aGlzLmlwLFxuICAgICdidWZmZXJTaXplJzogb3B0X3BhcmFtc1snYnVmZmVyU2l6ZSddLFxuICAgICdidWZmZXJUeXBlJzogb3B0X3BhcmFtc1snYnVmZmVyVHlwZSddLFxuICAgICdyZXNpemUnOiBvcHRfcGFyYW1zWydyZXNpemUnXVxuICB9KTtcbn1cblxuLyoqXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5abGliLkluZmxhdGUuQnVmZmVyVHlwZSA9IFpsaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlO1xuXG4vKipcbiAqIGRlY29tcHJlc3MuXG4gKiBAcmV0dXJuIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSBpbmZsYXRlZCBidWZmZXIuXG4gKi9cblpsaWIuSW5mbGF0ZS5wcm90b3R5cGUuZGVjb21wcmVzcyA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IGlucHV0IGJ1ZmZlci4gKi9cbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSBpbmZsYXRlZCBidWZmZXIuICovXG4gIHZhciBidWZmZXI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBhZGxlci0zMiBjaGVja3N1bSAqL1xuICB2YXIgYWRsZXIzMjtcblxuICBidWZmZXIgPSB0aGlzLnJhd2luZmxhdGUuZGVjb21wcmVzcygpO1xuICB0aGlzLmlwID0gdGhpcy5yYXdpbmZsYXRlLmlwO1xuXG4gIC8vIHZlcmlmeSBhZGxlci0zMlxuICBpZiAodGhpcy52ZXJpZnkpIHtcbiAgICBhZGxlcjMyID0gKFxuICAgICAgaW5wdXRbdGhpcy5pcCsrXSA8PCAyNCB8IGlucHV0W3RoaXMuaXArK10gPDwgMTYgfFxuICAgICAgaW5wdXRbdGhpcy5pcCsrXSA8PCA4IHwgaW5wdXRbdGhpcy5pcCsrXVxuICAgICkgPj4+IDA7XG5cbiAgICBpZiAoYWRsZXIzMiAhPT0gWmxpYi5BZGxlcjMyKGJ1ZmZlcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhZGxlci0zMiBjaGVja3N1bScpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZmZXI7XG59O1xuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuXG4vKiB2aW06c2V0IGV4cGFuZHRhYiB0cz0yIHN3PTIgdHc9ODA6ICovXG4iLCJnb29nLnByb3ZpZGUoJ1psaWIuWmlwJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5SYXdEZWZsYXRlJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuQ1JDMzInKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9ucy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5abGliLlppcCA9IGZ1bmN0aW9uKG9wdF9wYXJhbXMpIHtcbiAgb3B0X3BhcmFtcyA9IG9wdF9wYXJhbXMgfHwge307XG4gIC8qKiBAdHlwZSB7QXJyYXkuPHtcbiAgICogICBidWZmZXI6ICEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSksXG4gICAqICAgb3B0aW9uOiBPYmplY3QsXG4gICAqICAgY29tcHJlc3NlZDogYm9vbGVhbixcbiAgICogICBlbmNyeXB0ZWQ6IGJvb2xlYW4sXG4gICAqICAgc2l6ZTogbnVtYmVyLFxuICAgKiAgIGNyYzMyOiBudW1iZXJcbiAgICogfT59ICovXG4gIHRoaXMuZmlsZXMgPSBbXTtcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHRoaXMuY29tbWVudCA9IG9wdF9wYXJhbXNbJ2NvbW1lbnQnXTtcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHRoaXMucGFzc3dvcmQ7XG59O1xuXG5cbi8qKlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2QgPSB7XG4gIFNUT1JFOiAwLFxuICBERUZMQVRFOiA4XG59O1xuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblpsaWIuWmlwLk9wZXJhdGluZ1N5c3RlbSA9IHtcbiAgTVNET1M6IDAsXG4gIFVOSVg6IDMsXG4gIE1BQ0lOVE9TSDogN1xufTtcblxuLyoqXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5abGliLlppcC5GbGFncyA9IHtcbiAgRU5DUllQVDogICAgMHgwMDAxLFxuICBERVNDUklQVE9SOiAweDAwMDgsXG4gIFVURjg6ICAgICAgIDB4MDgwMFxufTtcblxuLyoqXG4gKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XG4gKiBAY29uc3RcbiAqL1xuWmxpYi5aaXAuRmlsZUhlYWRlclNpZ25hdHVyZSA9IFsweDUwLCAweDRiLCAweDAxLCAweDAyXTtcblxuLyoqXG4gKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XG4gKiBAY29uc3RcbiAqL1xuWmxpYi5aaXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlID0gWzB4NTAsIDB4NGIsIDB4MDMsIDB4MDRdO1xuXG4vKipcbiAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cbiAqIEBjb25zdFxuICovXG5abGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlID0gWzB4NTAsIDB4NGIsIDB4MDUsIDB4MDZdO1xuXG4vKipcbiAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj58VWludDhBcnJheX0gaW5wdXRcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtcyBvcHRpb25zLlxuICovXG5abGliLlppcC5wcm90b3R5cGUuYWRkRmlsZSA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XG4gIG9wdF9wYXJhbXMgPSBvcHRfcGFyYW1zIHx8IHt9O1xuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgdmFyIGZpbGVuYW1lID0gJycgfHwgb3B0X3BhcmFtc1snZmlsZW5hbWUnXTtcbiAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICB2YXIgY29tcHJlc3NlZDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBzaXplID0gaW5wdXQubGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNyYzMyID0gMDtcblxuICBpZiAoVVNFX1RZUEVEQVJSQVkgJiYgaW5wdXQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGlucHV0ID0gbmV3IFVpbnQ4QXJyYXkoaW5wdXQpO1xuICB9XG5cbiAgLy8gZGVmYXVsdFxuICBpZiAodHlwZW9mIG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uTWV0aG9kJ10gIT09ICdudW1iZXInKSB7XG4gICAgb3B0X3BhcmFtc1snY29tcHJlc3Npb25NZXRob2QnXSA9IFpsaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU7XG4gIH1cblxuICAvLyDjgZ3jga7loLTjgaflnKfnuK7jgZnjgovloLTlkIhcbiAgaWYgKG9wdF9wYXJhbXNbJ2NvbXByZXNzJ10pIHtcbiAgICBzd2l0Y2ggKG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uTWV0aG9kJ10pIHtcbiAgICAgIGNhc2UgWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2QuU1RPUkU6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxuICAgICAgICBjcmMzMiA9IFpsaWIuQ1JDMzIuY2FsYyhpbnB1dCk7XG4gICAgICAgIGlucHV0ID0gdGhpcy5kZWZsYXRlV2l0aE9wdGlvbihpbnB1dCwgb3B0X3BhcmFtcyk7XG4gICAgICAgIGNvbXByZXNzZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Q6JyArIG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uTWV0aG9kJ10pO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuZmlsZXMucHVzaCh7XG4gICAgYnVmZmVyOiBpbnB1dCxcbiAgICBvcHRpb246IG9wdF9wYXJhbXMsXG4gICAgY29tcHJlc3NlZDogY29tcHJlc3NlZCxcbiAgICBlbmNyeXB0ZWQ6IGZhbHNlLFxuICAgIHNpemU6IHNpemUsXG4gICAgY3JjMzI6IGNyYzMyXG4gIH0pO1xufTtcblxuLyoqXG4gKiBAcGFyYW0geyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gcGFzc3dvcmRcbiAqL1xuWmxpYi5aaXAucHJvdG90eXBlLnNldFBhc3N3b3JkID0gZnVuY3Rpb24ocGFzc3dvcmQpIHtcbiAgdGhpcy5wYXNzd29yZCA9IHBhc3N3b3JkO1xufTtcblxuWmxpYi5aaXAucHJvdG90eXBlLmNvbXByZXNzID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7QXJyYXkuPHtcbiAgICogICBidWZmZXI6ICEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSksXG4gICAqICAgb3B0aW9uOiBPYmplY3QsXG4gICAqICAgY29tcHJlc3NlZDogYm9vbGVhbixcbiAgICogICBlbmNyeXB0ZWQ6IGJvb2xlYW4sXG4gICAqICAgc2l6ZTogbnVtYmVyLFxuICAgKiAgIGNyYzMyOiBudW1iZXJcbiAgICogfT59ICovXG4gIHZhciBmaWxlcyA9IHRoaXMuZmlsZXM7XG4gIC8qKiBAdHlwZSB7e1xuICAgKiAgIGJ1ZmZlcjogIShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KSxcbiAgICogICBvcHRpb246IE9iamVjdCxcbiAgICogICBjb21wcmVzc2VkOiBib29sZWFuLFxuICAgKiAgIGVuY3J5cHRlZDogYm9vbGVhbixcbiAgICogICBzaXplOiBudW1iZXIsXG4gICAqICAgY3JjMzI6IG51bWJlclxuICAgKiB9fSAqL1xuICB2YXIgZmlsZTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgb3V0cHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG9wMTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBvcDI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgb3AzO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxvY2FsRmlsZVNpemUgPSAwO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNlbnRyYWxEaXJlY3RvcnlTaXplID0gMDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBlbmRPZkNlbnRyYWxEaXJlY3RvcnlTaXplO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG9mZnNldDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBuZWVkVmVyc2lvbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBmbGFncztcbiAgLyoqIEB0eXBlIHtabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZH0gKi9cbiAgdmFyIGNvbXByZXNzaW9uTWV0aG9kO1xuICAvKiogQHR5cGUge0RhdGV9ICovXG4gIHZhciBkYXRlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNyYzMyO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHNpemU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgcGxhaW5TaXplO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGZpbGVuYW1lTGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGV4dHJhRmllbGRMZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgY29tbWVudExlbmd0aDtcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBmaWxlbmFtZTtcbiAgLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBleHRyYUZpZWxkO1xuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIGNvbW1lbnQ7XG4gIC8qKiBAdHlwZSB7KEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgYnVmZmVyO1xuICAvKiogQHR5cGUgeyp9ICovXG4gIHZhciB0bXA7XG4gIC8qKiBAdHlwZSB7QXJyYXkuPG51bWJlcj58VWludDMyQXJyYXl8T2JqZWN0fSAqL1xuICB2YXIga2V5O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaWw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgajtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBqbDtcblxuICAvLyDjg5XjgqHjgqTjg6vjga7lnKfnuK5cbiAgZm9yIChpID0gMCwgaWwgPSBmaWxlcy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgZmlsZSA9IGZpbGVzW2ldO1xuICAgIGZpbGVuYW1lTGVuZ3RoID1cbiAgICAgIChmaWxlLm9wdGlvblsnZmlsZW5hbWUnXSkgPyBmaWxlLm9wdGlvblsnZmlsZW5hbWUnXS5sZW5ndGggOiAwO1xuICAgIGV4dHJhRmllbGRMZW5ndGggPVxuICAgICAgKGZpbGUub3B0aW9uWydleHRyYUZpZWxkJ10pID8gZmlsZS5vcHRpb25bJ2V4dHJhRmllbGQnXS5sZW5ndGggOiAwO1xuICAgIGNvbW1lbnRMZW5ndGggPVxuICAgICAgKGZpbGUub3B0aW9uWydjb21tZW50J10pID8gZmlsZS5vcHRpb25bJ2NvbW1lbnQnXS5sZW5ndGggOiAwO1xuXG4gICAgLy8g5Zyn57iu44GV44KM44Gm44GE44Gq44GL44Gj44Gf44KJ5Zyn57iuXG4gICAgaWYgKCFmaWxlLmNvbXByZXNzZWQpIHtcbiAgICAgIC8vIOWcp+e4ruWJjeOBqyBDUkMzMiDjga7oqIjnrpfjgpLjgZfjgabjgYrjgY9cbiAgICAgIGZpbGUuY3JjMzIgPSBabGliLkNSQzMyLmNhbGMoZmlsZS5idWZmZXIpO1xuXG4gICAgICBzd2l0Y2ggKGZpbGUub3B0aW9uWydjb21wcmVzc2lvbk1ldGhvZCddKSB7XG4gICAgICAgIGNhc2UgWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2QuU1RPUkU6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTpcbiAgICAgICAgICBmaWxlLmJ1ZmZlciA9IHRoaXMuZGVmbGF0ZVdpdGhPcHRpb24oZmlsZS5idWZmZXIsIGZpbGUub3B0aW9uKTtcbiAgICAgICAgICBmaWxlLmNvbXByZXNzZWQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Q6JyArIGZpbGUub3B0aW9uWydjb21wcmVzc2lvbk1ldGhvZCddKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBlbmNyeXB0aW9uXG4gICAgaWYgKGZpbGUub3B0aW9uWydwYXNzd29yZCddICE9PSB2b2lkIDB8fCB0aGlzLnBhc3N3b3JkICE9PSB2b2lkIDApIHtcbiAgICAgIC8vIGluaXQgZW5jcnlwdGlvblxuICAgICAga2V5ID0gdGhpcy5jcmVhdGVFbmNyeXB0aW9uS2V5KGZpbGUub3B0aW9uWydwYXNzd29yZCddIHx8IHRoaXMucGFzc3dvcmQpO1xuXG4gICAgICAvLyBhZGQgaGVhZGVyXG4gICAgICBidWZmZXIgPSBmaWxlLmJ1ZmZlcjtcbiAgICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgICAgICB0bXAgPSBuZXcgVWludDhBcnJheShidWZmZXIubGVuZ3RoICsgMTIpO1xuICAgICAgICB0bXAuc2V0KGJ1ZmZlciwgMTIpO1xuICAgICAgICBidWZmZXIgPSB0bXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWZmZXIudW5zaGlmdCgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChqID0gMDsgaiA8IDEyOyArK2opIHtcbiAgICAgICAgYnVmZmVyW2pdID0gdGhpcy5lbmNvZGUoXG4gICAgICAgICAga2V5LFxuICAgICAgICAgIGkgPT09IDExID8gKGZpbGUuY3JjMzIgJiAweGZmKSA6IChNYXRoLnJhbmRvbSgpICogMjU2IHwgMClcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gZGF0YSBlbmNyeXB0aW9uXG4gICAgICBmb3IgKGpsID0gYnVmZmVyLmxlbmd0aDsgaiA8IGpsOyArK2opIHtcbiAgICAgICAgYnVmZmVyW2pdID0gdGhpcy5lbmNvZGUoa2V5LCBidWZmZXJbal0pO1xuICAgICAgfVxuICAgICAgZmlsZS5idWZmZXIgPSBidWZmZXI7XG4gICAgfVxuXG4gICAgLy8g5b+F6KaB44OQ44OD44OV44Kh44K144Kk44K644Gu6KiI566XXG4gICAgbG9jYWxGaWxlU2l6ZSArPVxuICAgICAgLy8gbG9jYWwgZmlsZSBoZWFkZXJcbiAgICAgIDMwICsgZmlsZW5hbWVMZW5ndGggK1xuICAgICAgLy8gZmlsZSBkYXRhXG4gICAgICBmaWxlLmJ1ZmZlci5sZW5ndGg7XG5cbiAgICBjZW50cmFsRGlyZWN0b3J5U2l6ZSArPVxuICAgICAgLy8gZmlsZSBoZWFkZXJcbiAgICAgIDQ2ICsgZmlsZW5hbWVMZW5ndGggKyBjb21tZW50TGVuZ3RoO1xuICB9XG5cbiAgLy8gZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5XG4gIGVuZE9mQ2VudHJhbERpcmVjdG9yeVNpemUgPSAyMiArICh0aGlzLmNvbW1lbnQgPyB0aGlzLmNvbW1lbnQubGVuZ3RoIDogMCk7XG4gIG91dHB1dCA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKFxuICAgIGxvY2FsRmlsZVNpemUgKyBjZW50cmFsRGlyZWN0b3J5U2l6ZSArIGVuZE9mQ2VudHJhbERpcmVjdG9yeVNpemVcbiAgKTtcbiAgb3AxID0gMDtcbiAgb3AyID0gbG9jYWxGaWxlU2l6ZTtcbiAgb3AzID0gb3AyICsgY2VudHJhbERpcmVjdG9yeVNpemU7XG5cbiAgLy8g44OV44Kh44Kk44Or44Gu5Zyn57iuXG4gIGZvciAoaSA9IDAsIGlsID0gZmlsZXMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgIGZpbGUgPSBmaWxlc1tpXTtcbiAgICBmaWxlbmFtZUxlbmd0aCA9XG4gICAgICBmaWxlLm9wdGlvblsnZmlsZW5hbWUnXSA/IGZpbGUub3B0aW9uWydmaWxlbmFtZSddLmxlbmd0aCA6ICAwO1xuICAgIGV4dHJhRmllbGRMZW5ndGggPSAwOyAvLyBUT0RPXG4gICAgY29tbWVudExlbmd0aCA9XG4gICAgICBmaWxlLm9wdGlvblsnY29tbWVudCddID8gZmlsZS5vcHRpb25bJ2NvbW1lbnQnXS5sZW5ndGggOiAwO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gbG9jYWwgZmlsZSBoZWFkZXIgJiBmaWxlIGhlYWRlclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgb2Zmc2V0ID0gb3AxO1xuXG4gICAgLy8gc2lnbmF0dXJlXG4gICAgLy8gbG9jYWwgZmlsZSBoZWFkZXJcbiAgICBvdXRwdXRbb3AxKytdID0gWmxpYi5aaXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlWzBdO1xuICAgIG91dHB1dFtvcDErK10gPSBabGliLlppcC5Mb2NhbEZpbGVIZWFkZXJTaWduYXR1cmVbMV07XG4gICAgb3V0cHV0W29wMSsrXSA9IFpsaWIuWmlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZVsyXTtcbiAgICBvdXRwdXRbb3AxKytdID0gWmxpYi5aaXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlWzNdO1xuICAgIC8vIGZpbGUgaGVhZGVyXG4gICAgb3V0cHV0W29wMisrXSA9IFpsaWIuWmlwLkZpbGVIZWFkZXJTaWduYXR1cmVbMF07XG4gICAgb3V0cHV0W29wMisrXSA9IFpsaWIuWmlwLkZpbGVIZWFkZXJTaWduYXR1cmVbMV07XG4gICAgb3V0cHV0W29wMisrXSA9IFpsaWIuWmlwLkZpbGVIZWFkZXJTaWduYXR1cmVbMl07XG4gICAgb3V0cHV0W29wMisrXSA9IFpsaWIuWmlwLkZpbGVIZWFkZXJTaWduYXR1cmVbM107XG5cbiAgICAvLyBjb21wcmVzc29yIGluZm9cbiAgICBuZWVkVmVyc2lvbiA9IDIwO1xuICAgIG91dHB1dFtvcDIrK10gPSBuZWVkVmVyc2lvbiAmIDB4ZmY7XG4gICAgb3V0cHV0W29wMisrXSA9XG4gICAgICAvKiogQHR5cGUge1psaWIuWmlwLk9wZXJhdGluZ1N5c3RlbX0gKi9cbiAgICAgIChmaWxlLm9wdGlvblsnb3MnXSkgfHxcbiAgICAgIFpsaWIuWmlwLk9wZXJhdGluZ1N5c3RlbS5NU0RPUztcblxuICAgIC8vIG5lZWQgdmVyc2lvblxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gIG5lZWRWZXJzaW9uICAgICAgICYgMHhmZjtcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChuZWVkVmVyc2lvbiA+PiA4KSAmIDB4ZmY7XG5cbiAgICAvLyBnZW5lcmFsIHB1cnBvc2UgYml0IGZsYWdcbiAgICBmbGFncyA9IDA7XG4gICAgaWYgKGZpbGUub3B0aW9uWydwYXNzd29yZCddIHx8IHRoaXMucGFzc3dvcmQpIHtcbiAgICAgIGZsYWdzIHw9IFpsaWIuWmlwLkZsYWdzLkVOQ1JZUFQ7XG4gICAgfVxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gIGZsYWdzICAgICAgICYgMHhmZjtcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChmbGFncyA+PiA4KSAmIDB4ZmY7XG5cbiAgICAvLyBjb21wcmVzc2lvbiBtZXRob2RcbiAgICBjb21wcmVzc2lvbk1ldGhvZCA9XG4gICAgICAvKiogQHR5cGUge1psaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kfSAqL1xuICAgICAgKGZpbGUub3B0aW9uWydjb21wcmVzc2lvbk1ldGhvZCddKTtcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9ICBjb21wcmVzc2lvbk1ldGhvZCAgICAgICAmIDB4ZmY7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAoY29tcHJlc3Npb25NZXRob2QgPj4gOCkgJiAweGZmO1xuXG4gICAgLy8gZGF0ZVxuICAgIGRhdGUgPSAvKiogQHR5cGUgeyhEYXRlfHVuZGVmaW5lZCl9ICovKGZpbGUub3B0aW9uWydkYXRlJ10pIHx8IG5ldyBEYXRlKCk7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPVxuICAgICAgKChkYXRlLmdldE1pbnV0ZXMoKSAmIDB4NykgPDwgNSkgfFxuICAgICAgKGRhdGUuZ2V0U2Vjb25kcygpIC8gMiB8IDApO1xuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID1cbiAgICAgIChkYXRlLmdldEhvdXJzKCkgICA8PCAzKSB8XG4gICAgICAoZGF0ZS5nZXRNaW51dGVzKCkgPj4gMyk7XG4gICAgLy9cbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9XG4gICAgICAoKGRhdGUuZ2V0TW9udGgoKSArIDEgJiAweDcpIDw8IDUpIHxcbiAgICAgIChkYXRlLmdldERhdGUoKSk7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPVxuICAgICAgKChkYXRlLmdldEZ1bGxZZWFyKCkgLSAxOTgwICYgMHg3ZikgPDwgMSkgfFxuICAgICAgKGRhdGUuZ2V0TW9udGgoKSArIDEgPj4gMyk7XG5cbiAgICAvLyBDUkMtMzJcbiAgICBjcmMzMiA9IGZpbGUuY3JjMzI7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAgY3JjMzIgICAgICAgICYgMHhmZjtcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChjcmMzMiA+PiAgOCkgJiAweGZmO1xuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKGNyYzMyID4+IDE2KSAmIDB4ZmY7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAoY3JjMzIgPj4gMjQpICYgMHhmZjtcblxuICAgIC8vIGNvbXByZXNzZWQgc2l6ZVxuICAgIHNpemUgPSBmaWxlLmJ1ZmZlci5sZW5ndGg7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAgc2l6ZSAgICAgICAgJiAweGZmO1xuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKHNpemUgPj4gIDgpICYgMHhmZjtcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChzaXplID4+IDE2KSAmIDB4ZmY7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAoc2l6ZSA+PiAyNCkgJiAweGZmO1xuXG4gICAgLy8gdW5jb21wcmVzc2VkIHNpemVcbiAgICBwbGFpblNpemUgPSBmaWxlLnNpemU7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAgcGxhaW5TaXplICAgICAgICAmIDB4ZmY7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAocGxhaW5TaXplID4+ICA4KSAmIDB4ZmY7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAocGxhaW5TaXplID4+IDE2KSAmIDB4ZmY7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAocGxhaW5TaXplID4+IDI0KSAmIDB4ZmY7XG5cbiAgICAvLyBmaWxlbmFtZSBsZW5ndGhcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9ICBmaWxlbmFtZUxlbmd0aCAgICAgICAmIDB4ZmY7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAoZmlsZW5hbWVMZW5ndGggPj4gOCkgJiAweGZmO1xuXG4gICAgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAgZXh0cmFGaWVsZExlbmd0aCAgICAgICAmIDB4ZmY7XG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAoZXh0cmFGaWVsZExlbmd0aCA+PiA4KSAmIDB4ZmY7XG5cbiAgICAvLyBmaWxlIGNvbW1lbnQgbGVuZ3RoXG4gICAgb3V0cHV0W29wMisrXSA9ICBjb21tZW50TGVuZ3RoICAgICAgICYgMHhmZjtcbiAgICBvdXRwdXRbb3AyKytdID0gKGNvbW1lbnRMZW5ndGggPj4gOCkgJiAweGZmO1xuXG4gICAgLy8gZGlzayBudW1iZXIgc3RhcnRcbiAgICBvdXRwdXRbb3AyKytdID0gMDtcbiAgICBvdXRwdXRbb3AyKytdID0gMDtcblxuICAgIC8vIGludGVybmFsIGZpbGUgYXR0cmlidXRlc1xuICAgIG91dHB1dFtvcDIrK10gPSAwO1xuICAgIG91dHB1dFtvcDIrK10gPSAwO1xuXG4gICAgLy8gZXh0ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXG4gICAgb3V0cHV0W29wMisrXSA9IDA7XG4gICAgb3V0cHV0W29wMisrXSA9IDA7XG4gICAgb3V0cHV0W29wMisrXSA9IDA7XG4gICAgb3V0cHV0W29wMisrXSA9IDA7XG5cbiAgICAvLyByZWxhdGl2ZSBvZmZzZXQgb2YgbG9jYWwgaGVhZGVyXG4gICAgb3V0cHV0W29wMisrXSA9ICBvZmZzZXQgICAgICAgICYgMHhmZjtcbiAgICBvdXRwdXRbb3AyKytdID0gKG9mZnNldCA+PiAgOCkgJiAweGZmO1xuICAgIG91dHB1dFtvcDIrK10gPSAob2Zmc2V0ID4+IDE2KSAmIDB4ZmY7XG4gICAgb3V0cHV0W29wMisrXSA9IChvZmZzZXQgPj4gMjQpICYgMHhmZjtcblxuICAgIC8vIGZpbGVuYW1lXG4gICAgZmlsZW5hbWUgPSBmaWxlLm9wdGlvblsnZmlsZW5hbWUnXTtcbiAgICBpZiAoZmlsZW5hbWUpIHtcbiAgICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgICAgICBvdXRwdXQuc2V0KGZpbGVuYW1lLCBvcDEpO1xuICAgICAgICBvdXRwdXQuc2V0KGZpbGVuYW1lLCBvcDIpO1xuICAgICAgICBvcDEgKz0gZmlsZW5hbWVMZW5ndGg7XG4gICAgICAgIG9wMiArPSBmaWxlbmFtZUxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBmaWxlbmFtZUxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSBmaWxlbmFtZVtqXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGV4dHJhIGZpZWxkXG4gICAgZXh0cmFGaWVsZCA9IGZpbGUub3B0aW9uWydleHRyYUZpZWxkJ107XG4gICAgaWYgKGV4dHJhRmllbGQpIHtcbiAgICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgICAgICBvdXRwdXQuc2V0KGV4dHJhRmllbGQsIG9wMSk7XG4gICAgICAgIG91dHB1dC5zZXQoZXh0cmFGaWVsZCwgb3AyKTtcbiAgICAgICAgb3AxICs9IGV4dHJhRmllbGRMZW5ndGg7XG4gICAgICAgIG9wMiArPSBleHRyYUZpZWxkTGVuZ3RoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGNvbW1lbnRMZW5ndGg7ICsraikge1xuICAgICAgICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gZXh0cmFGaWVsZFtqXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvbW1lbnRcbiAgICBjb21tZW50ID0gZmlsZS5vcHRpb25bJ2NvbW1lbnQnXTtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgICAgIG91dHB1dC5zZXQoY29tbWVudCwgb3AyKTtcbiAgICAgICAgb3AyICs9IGNvbW1lbnRMZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgY29tbWVudExlbmd0aDsgKytqKSB7XG4gICAgICAgICAgb3V0cHV0W29wMisrXSA9IGNvbW1lbnRbal07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBmaWxlIGRhdGFcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgICAgb3V0cHV0LnNldChmaWxlLmJ1ZmZlciwgb3AxKTtcbiAgICAgIG9wMSArPSBmaWxlLmJ1ZmZlci5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaiA9IDAsIGpsID0gZmlsZS5idWZmZXIubGVuZ3RoOyBqIDwgamw7ICsraikge1xuICAgICAgICBvdXRwdXRbb3AxKytdID0gZmlsZS5idWZmZXJbal07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGVuZCBvZiBjZW50cmFsIGRpcmVjdG9yeVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBzaWduYXR1cmVcbiAgb3V0cHV0W29wMysrXSA9IFpsaWIuWmlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbMF07XG4gIG91dHB1dFtvcDMrK10gPSBabGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzFdO1xuICBvdXRwdXRbb3AzKytdID0gWmxpYi5aaXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVsyXTtcbiAgb3V0cHV0W29wMysrXSA9IFpsaWIuWmlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbM107XG5cbiAgLy8gbnVtYmVyIG9mIHRoaXMgZGlza1xuICBvdXRwdXRbb3AzKytdID0gMDtcbiAgb3V0cHV0W29wMysrXSA9IDA7XG5cbiAgLy8gbnVtYmVyIG9mIHRoZSBkaXNrIHdpdGggdGhlIHN0YXJ0IG9mIHRoZSBjZW50cmFsIGRpcmVjdG9yeVxuICBvdXRwdXRbb3AzKytdID0gMDtcbiAgb3V0cHV0W29wMysrXSA9IDA7XG5cbiAgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXMgaW4gdGhlIGNlbnRyYWwgZGlyZWN0b3J5IG9uIHRoaXMgZGlza1xuICBvdXRwdXRbb3AzKytdID0gIGlsICAgICAgICYgMHhmZjtcbiAgb3V0cHV0W29wMysrXSA9IChpbCA+PiA4KSAmIDB4ZmY7XG5cbiAgLy8gdG90YWwgbnVtYmVyIG9mIGVudHJpZXMgaW4gdGhlIGNlbnRyYWwgZGlyZWN0b3J5XG4gIG91dHB1dFtvcDMrK10gPSAgaWwgICAgICAgJiAweGZmO1xuICBvdXRwdXRbb3AzKytdID0gKGlsID4+IDgpICYgMHhmZjtcblxuICAvLyBzaXplIG9mIHRoZSBjZW50cmFsIGRpcmVjdG9yeVxuICBvdXRwdXRbb3AzKytdID0gIGNlbnRyYWxEaXJlY3RvcnlTaXplICAgICAgICAmIDB4ZmY7XG4gIG91dHB1dFtvcDMrK10gPSAoY2VudHJhbERpcmVjdG9yeVNpemUgPj4gIDgpICYgMHhmZjtcbiAgb3V0cHV0W29wMysrXSA9IChjZW50cmFsRGlyZWN0b3J5U2l6ZSA+PiAxNikgJiAweGZmO1xuICBvdXRwdXRbb3AzKytdID0gKGNlbnRyYWxEaXJlY3RvcnlTaXplID4+IDI0KSAmIDB4ZmY7XG5cbiAgLy8gb2Zmc2V0IG9mIHN0YXJ0IG9mIGNlbnRyYWwgZGlyZWN0b3J5IHdpdGggcmVzcGVjdCB0byB0aGUgc3RhcnRpbmcgZGlzayBudW1iZXJcbiAgb3V0cHV0W29wMysrXSA9ICBsb2NhbEZpbGVTaXplICAgICAgICAmIDB4ZmY7XG4gIG91dHB1dFtvcDMrK10gPSAobG9jYWxGaWxlU2l6ZSA+PiAgOCkgJiAweGZmO1xuICBvdXRwdXRbb3AzKytdID0gKGxvY2FsRmlsZVNpemUgPj4gMTYpICYgMHhmZjtcbiAgb3V0cHV0W29wMysrXSA9IChsb2NhbEZpbGVTaXplID4+IDI0KSAmIDB4ZmY7XG5cbiAgLy8gLlpJUCBmaWxlIGNvbW1lbnQgbGVuZ3RoXG4gIGNvbW1lbnRMZW5ndGggPSB0aGlzLmNvbW1lbnQgPyB0aGlzLmNvbW1lbnQubGVuZ3RoIDogMDtcbiAgb3V0cHV0W29wMysrXSA9ICBjb21tZW50TGVuZ3RoICAgICAgICYgMHhmZjtcbiAgb3V0cHV0W29wMysrXSA9IChjb21tZW50TGVuZ3RoID4+IDgpICYgMHhmZjtcblxuICAvLyAuWklQIGZpbGUgY29tbWVudFxuICBpZiAodGhpcy5jb21tZW50KSB7XG4gICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgICBvdXRwdXQuc2V0KHRoaXMuY29tbWVudCwgb3AzKTtcbiAgICAgIG9wMyArPSBjb21tZW50TGVuZ3RoO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGogPSAwLCBqbCA9IGNvbW1lbnRMZW5ndGg7IGogPCBqbDsgKytqKSB7XG4gICAgICAgIG91dHB1dFtvcDMrK10gPSB0aGlzLmNvbW1lbnRbal07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbnB1dFxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbnMuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfVxuICovXG5abGliLlppcC5wcm90b3R5cGUuZGVmbGF0ZVdpdGhPcHRpb24gPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICAvKiogQHR5cGUge1psaWIuUmF3RGVmbGF0ZX0gKi9cbiAgdmFyIGRlZmxhdG9yID0gbmV3IFpsaWIuUmF3RGVmbGF0ZShpbnB1dCwgb3B0X3BhcmFtc1snZGVmbGF0ZU9wdGlvbiddKTtcblxuICByZXR1cm4gZGVmbGF0b3IuY29tcHJlc3MoKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHsoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSBrZXlcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuWmxpYi5aaXAucHJvdG90eXBlLmdldEJ5dGUgPSBmdW5jdGlvbihrZXkpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciB0bXAgPSAoKGtleVsyXSAmIDB4ZmZmZikgfCAyKTtcblxuICByZXR1cm4gKCh0bXAgKiAodG1wIF4gMSkpID4+IDgpICYgMHhmZjtcbn07XG5cbi8qKlxuICogQHBhcmFtIHsoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXl8T2JqZWN0KX0ga2V5XG4gKiBAcGFyYW0ge251bWJlcn0gblxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5abGliLlppcC5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24oa2V5LCBuKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgdG1wID0gdGhpcy5nZXRCeXRlKC8qKiBAdHlwZSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi8oa2V5KSk7XG5cbiAgdGhpcy51cGRhdGVLZXlzKC8qKiBAdHlwZSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi8oa2V5KSwgbik7XG5cbiAgcmV0dXJuIHRtcCBeIG47XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0ga2V5XG4gKiBAcGFyYW0ge251bWJlcn0gblxuICovXG5abGliLlppcC5wcm90b3R5cGUudXBkYXRlS2V5cyA9IGZ1bmN0aW9uKGtleSwgbikge1xuICBrZXlbMF0gPSBabGliLkNSQzMyLnNpbmdsZShrZXlbMF0sIG4pO1xuICBrZXlbMV0gPVxuICAgICgoKCgoa2V5WzFdICsgKGtleVswXSAmIDB4ZmYpKSAqIDIwMTczID4+PiAwKSAqIDY2ODEpID4+PiAwKSArIDEpID4+PiAwO1xuICBrZXlbMl0gPSBabGliLkNSQzMyLnNpbmdsZShrZXlbMl0sIGtleVsxXSA+Pj4gMjQpO1xufTtcblxuLyoqXG4gKiBAcGFyYW0geyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gcGFzc3dvcmRcbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXl8T2JqZWN0KX1cbiAqL1xuWmxpYi5aaXAucHJvdG90eXBlLmNyZWF0ZUVuY3J5cHRpb25LZXkgPSBmdW5jdGlvbihwYXNzd29yZCkge1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqL1xuICB2YXIga2V5ID0gWzMwNTQxOTg5NiwgNTkxNzUxMDQ5LCA4NzgwODIxOTJdO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaWw7XG5cbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAga2V5ID0gbmV3IFVpbnQzMkFycmF5KGtleSk7XG4gIH1cblxuICBmb3IgKGkgPSAwLCBpbCA9IHBhc3N3b3JkLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICB0aGlzLnVwZGF0ZUtleXMoa2V5LCBwYXNzd29yZFtpXSAmIDB4ZmYpO1xuICB9XG5cbiAgcmV0dXJuIGtleTtcbn07XG5cbn0pOyIsImdvb2cucHJvdmlkZSgnWmxpYi5VbnppcCcpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5nb29nLnJlcXVpcmUoJ0ZpeFBoYW50b21KU0Z1bmN0aW9uQXBwbHlCdWdfU3RyaW5nRnJvbUNoYXJDb2RlJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuUmF3SW5mbGF0ZScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkNSQzMyJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuWmlwJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbnB1dCBpbnB1dCBidWZmZXIuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9ucy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5abGliLlVuemlwID0gZnVuY3Rpb24oaW5wdXQsIG9wdF9wYXJhbXMpIHtcbiAgb3B0X3BhcmFtcyA9IG9wdF9wYXJhbXMgfHwge307XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdGhpcy5pbnB1dCA9XG4gICAgKFVTRV9UWVBFREFSUkFZICYmIChpbnB1dCBpbnN0YW5jZW9mIEFycmF5KSkgP1xuICAgIG5ldyBVaW50OEFycmF5KGlucHV0KSA6IGlucHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5pcCA9IDA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLmVvY2RyT2Zmc2V0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5udW1iZXJPZlRoaXNEaXNrO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5zdGFydERpc2s7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLnRvdGFsRW50cmllc1RoaXNEaXNrO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy50b3RhbEVudHJpZXM7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLmNlbnRyYWxEaXJlY3RvcnlTaXplO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5jZW50cmFsRGlyZWN0b3J5T2Zmc2V0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5jb21tZW50TGVuZ3RoO1xuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdGhpcy5jb21tZW50O1xuICAvKiogQHR5cGUge0FycmF5LjxabGliLlVuemlwLkZpbGVIZWFkZXI+fSAqL1xuICB0aGlzLmZpbGVIZWFkZXJMaXN0O1xuICAvKiogQHR5cGUge09iamVjdC48c3RyaW5nLCBudW1iZXI+fSAqL1xuICB0aGlzLmZpbGVuYW1lVG9JbmRleDtcbiAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICB0aGlzLnZlcmlmeSA9IG9wdF9wYXJhbXNbJ3ZlcmlmeSddIHx8IGZhbHNlO1xuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdGhpcy5wYXNzd29yZCA9IG9wdF9wYXJhbXNbJ3Bhc3N3b3JkJ107XG59O1xuXG5abGliLlVuemlwLkNvbXByZXNzaW9uTWV0aG9kID0gWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2Q7XG5cbi8qKlxuICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxuICogQGNvbnN0XG4gKi9cblpsaWIuVW56aXAuRmlsZUhlYWRlclNpZ25hdHVyZSA9IFpsaWIuWmlwLkZpbGVIZWFkZXJTaWduYXR1cmU7XG5cbi8qKlxuICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxuICogQGNvbnN0XG4gKi9cblpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlID0gWmxpYi5aaXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlO1xuXG4vKipcbiAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cbiAqIEBjb25zdFxuICovXG5abGliLlVuemlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmUgPSBabGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlO1xuXG4vKipcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxuICogQHBhcmFtIHtudW1iZXJ9IGlwIGlucHV0IHBvc2l0aW9uLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cblpsaWIuVW56aXAuRmlsZUhlYWRlciA9IGZ1bmN0aW9uKGlucHV0LCBpcCkge1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMub2Zmc2V0ID0gaXA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMudmVyc2lvbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMub3M7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLm5lZWRWZXJzaW9uO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5mbGFncztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMuY29tcHJlc3Npb247XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLnRpbWU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLmRhdGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLmNyYzMyO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5jb21wcmVzc2VkU2l6ZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMucGxhaW5TaXplO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5maWxlTmFtZUxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMuZXh0cmFGaWVsZExlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMuZmlsZUNvbW1lbnRMZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLmRpc2tOdW1iZXJTdGFydDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMuaW50ZXJuYWxGaWxlQXR0cmlidXRlcztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMuZXh0ZXJuYWxGaWxlQXR0cmlidXRlcztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMucmVsYXRpdmVPZmZzZXQ7XG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICB0aGlzLmZpbGVuYW1lO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHRoaXMuZXh0cmFGaWVsZDtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB0aGlzLmNvbW1lbnQ7XG59O1xuXG5abGliLlVuemlwLkZpbGVIZWFkZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpcCA9IHRoaXMub2Zmc2V0O1xuXG4gIC8vIGNlbnRyYWwgZmlsZSBoZWFkZXIgc2lnbmF0dXJlXG4gIGlmIChpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5GaWxlSGVhZGVyU2lnbmF0dXJlWzBdIHx8XG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5GaWxlSGVhZGVyU2lnbmF0dXJlWzFdIHx8XG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5GaWxlSGVhZGVyU2lnbmF0dXJlWzJdIHx8XG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5GaWxlSGVhZGVyU2lnbmF0dXJlWzNdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpbGUgaGVhZGVyIHNpZ25hdHVyZScpO1xuICB9XG5cbiAgLy8gdmVyc2lvbiBtYWRlIGJ5XG4gIHRoaXMudmVyc2lvbiA9IGlucHV0W2lwKytdO1xuICB0aGlzLm9zID0gaW5wdXRbaXArK107XG5cbiAgLy8gdmVyc2lvbiBuZWVkZWQgdG8gZXh0cmFjdFxuICB0aGlzLm5lZWRWZXJzaW9uID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gZ2VuZXJhbCBwdXJwb3NlIGJpdCBmbGFnXG4gIHRoaXMuZmxhZ3MgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcblxuICAvLyBjb21wcmVzc2lvbiBtZXRob2RcbiAgdGhpcy5jb21wcmVzc2lvbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuXG4gIC8vIGxhc3QgbW9kIGZpbGUgdGltZVxuICB0aGlzLnRpbWUgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcblxuICAvL2xhc3QgbW9kIGZpbGUgZGF0ZVxuICB0aGlzLmRhdGUgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcblxuICAvLyBjcmMtMzJcbiAgdGhpcy5jcmMzMiA9IChcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcbiAgKSA+Pj4gMDtcblxuICAvLyBjb21wcmVzc2VkIHNpemVcbiAgdGhpcy5jb21wcmVzc2VkU2l6ZSA9IChcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcbiAgKSA+Pj4gMDtcblxuICAvLyB1bmNvbXByZXNzZWQgc2l6ZVxuICB0aGlzLnBsYWluU2l6ZSA9IChcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcbiAgKSA+Pj4gMDtcblxuICAvLyBmaWxlIG5hbWUgbGVuZ3RoXG4gIHRoaXMuZmlsZU5hbWVMZW5ndGggPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcblxuICAvLyBleHRyYSBmaWVsZCBsZW5ndGhcbiAgdGhpcy5leHRyYUZpZWxkTGVuZ3RoID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gZmlsZSBjb21tZW50IGxlbmd0aFxuICB0aGlzLmZpbGVDb21tZW50TGVuZ3RoID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gZGlzayBudW1iZXIgc3RhcnRcbiAgdGhpcy5kaXNrTnVtYmVyU3RhcnQgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcblxuICAvLyBpbnRlcm5hbCBmaWxlIGF0dHJpYnV0ZXNcbiAgdGhpcy5pbnRlcm5hbEZpbGVBdHRyaWJ1dGVzID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gZXh0ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXG4gIHRoaXMuZXh0ZXJuYWxGaWxlQXR0cmlidXRlcyA9XG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpO1xuXG4gIC8vIHJlbGF0aXZlIG9mZnNldCBvZiBsb2NhbCBoZWFkZXJcbiAgdGhpcy5yZWxhdGl2ZU9mZnNldCA9IChcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcbiAgKSA+Pj4gMDtcblxuICAvLyBmaWxlIG5hbWVcbiAgdGhpcy5maWxlbmFtZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgVVNFX1RZUEVEQVJSQVkgP1xuICAgIGlucHV0LnN1YmFycmF5KGlwLCBpcCArPSB0aGlzLmZpbGVOYW1lTGVuZ3RoKSA6XG4gICAgaW5wdXQuc2xpY2UoaXAsIGlwICs9IHRoaXMuZmlsZU5hbWVMZW5ndGgpXG4gICk7XG5cbiAgLy8gZXh0cmEgZmllbGRcbiAgdGhpcy5leHRyYUZpZWxkID0gVVNFX1RZUEVEQVJSQVkgP1xuICAgIGlucHV0LnN1YmFycmF5KGlwLCBpcCArPSB0aGlzLmV4dHJhRmllbGRMZW5ndGgpIDpcbiAgICBpbnB1dC5zbGljZShpcCwgaXAgKz0gdGhpcy5leHRyYUZpZWxkTGVuZ3RoKTtcblxuICAvLyBmaWxlIGNvbW1lbnRcbiAgdGhpcy5jb21tZW50ID0gVVNFX1RZUEVEQVJSQVkgP1xuICAgIGlucHV0LnN1YmFycmF5KGlwLCBpcCArIHRoaXMuZmlsZUNvbW1lbnRMZW5ndGgpIDpcbiAgICBpbnB1dC5zbGljZShpcCwgaXAgKyB0aGlzLmZpbGVDb21tZW50TGVuZ3RoKTtcblxuICB0aGlzLmxlbmd0aCA9IGlwIC0gdGhpcy5vZmZzZXQ7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5wdXQgaW5wdXQgYnVmZmVyLlxuICogQHBhcmFtIHtudW1iZXJ9IGlwIGlucHV0IHBvc2l0aW9uLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cblpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyID0gZnVuY3Rpb24oaW5wdXQsIGlwKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdGhpcy5pbnB1dCA9IGlucHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5vZmZzZXQgPSBpcDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMubGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5uZWVkVmVyc2lvbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMuZmxhZ3M7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLmNvbXByZXNzaW9uO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy50aW1lO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5kYXRlO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5jcmMzMjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMuY29tcHJlc3NlZFNpemU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLnBsYWluU2l6ZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMuZmlsZU5hbWVMZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLmV4dHJhRmllbGRMZW5ndGg7XG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICB0aGlzLmZpbGVuYW1lO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHRoaXMuZXh0cmFGaWVsZDtcbn07XG5cblpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyLkZsYWdzID0gWmxpYi5aaXAuRmxhZ3M7XG5cblpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaXAgPSB0aGlzLm9mZnNldDtcblxuICAvLyBsb2NhbCBmaWxlIGhlYWRlciBzaWduYXR1cmVcbiAgaWYgKGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZVswXSB8fFxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlWzFdIHx8XG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXJTaWduYXR1cmVbMl0gfHxcbiAgICAgIGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZVszXSkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBsb2NhbCBmaWxlIGhlYWRlciBzaWduYXR1cmUnKTtcbiAgfVxuXG4gIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcbiAgdGhpcy5uZWVkVmVyc2lvbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuXG4gIC8vIGdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZ1xuICB0aGlzLmZsYWdzID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gY29tcHJlc3Npb24gbWV0aG9kXG4gIHRoaXMuY29tcHJlc3Npb24gPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcblxuICAvLyBsYXN0IG1vZCBmaWxlIHRpbWVcbiAgdGhpcy50aW1lID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy9sYXN0IG1vZCBmaWxlIGRhdGVcbiAgdGhpcy5kYXRlID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gY3JjLTMyXG4gIHRoaXMuY3JjMzIgPSAoXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXG4gICkgPj4+IDA7XG5cbiAgLy8gY29tcHJlc3NlZCBzaXplXG4gIHRoaXMuY29tcHJlc3NlZFNpemUgPSAoXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXG4gICkgPj4+IDA7XG5cbiAgLy8gdW5jb21wcmVzc2VkIHNpemVcbiAgdGhpcy5wbGFpblNpemUgPSAoXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXG4gICkgPj4+IDA7XG5cbiAgLy8gZmlsZSBuYW1lIGxlbmd0aFxuICB0aGlzLmZpbGVOYW1lTGVuZ3RoID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG4gIHRoaXMuZXh0cmFGaWVsZExlbmd0aCA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuXG4gIC8vIGZpbGUgbmFtZVxuICB0aGlzLmZpbGVuYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBVU0VfVFlQRURBUlJBWSA/XG4gICAgaW5wdXQuc3ViYXJyYXkoaXAsIGlwICs9IHRoaXMuZmlsZU5hbWVMZW5ndGgpIDpcbiAgICBpbnB1dC5zbGljZShpcCwgaXAgKz0gdGhpcy5maWxlTmFtZUxlbmd0aClcbiAgKTtcblxuICAvLyBleHRyYSBmaWVsZFxuICB0aGlzLmV4dHJhRmllbGQgPSBVU0VfVFlQRURBUlJBWSA/XG4gICAgaW5wdXQuc3ViYXJyYXkoaXAsIGlwICs9IHRoaXMuZXh0cmFGaWVsZExlbmd0aCkgOlxuICAgIGlucHV0LnNsaWNlKGlwLCBpcCArPSB0aGlzLmV4dHJhRmllbGRMZW5ndGgpO1xuXG4gIHRoaXMubGVuZ3RoID0gaXAgLSB0aGlzLm9mZnNldDtcbn07XG5cblxuWmxpYi5VbnppcC5wcm90b3R5cGUuc2VhcmNoRW5kT2ZDZW50cmFsRGlyZWN0b3J5UmVjb3JkID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpcDtcblxuICBmb3IgKGlwID0gaW5wdXQubGVuZ3RoIC0gMTI7IGlwID4gMDsgLS1pcCkge1xuICAgIGlmIChpbnB1dFtpcCAgXSA9PT0gWmxpYi5VbnppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzBdICYmXG4gICAgICAgIGlucHV0W2lwKzFdID09PSBabGliLlVuemlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbMV0gJiZcbiAgICAgICAgaW5wdXRbaXArMl0gPT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVsyXSAmJlxuICAgICAgICBpbnB1dFtpcCszXSA9PT0gWmxpYi5VbnppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzNdKSB7XG4gICAgICB0aGlzLmVvY2RyT2Zmc2V0ID0gaXA7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdFbmQgb2YgQ2VudHJhbCBEaXJlY3RvcnkgUmVjb3JkIG5vdCBmb3VuZCcpO1xufTtcblxuWmxpYi5VbnppcC5wcm90b3R5cGUucGFyc2VFbmRPZkNlbnRyYWxEaXJlY3RvcnlSZWNvcmQgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlwO1xuXG4gIGlmICghdGhpcy5lb2Nkck9mZnNldCkge1xuICAgIHRoaXMuc2VhcmNoRW5kT2ZDZW50cmFsRGlyZWN0b3J5UmVjb3JkKCk7XG4gIH1cbiAgaXAgPSB0aGlzLmVvY2RyT2Zmc2V0O1xuXG4gIC8vIHNpZ25hdHVyZVxuICBpZiAoaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVswXSB8fFxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVsxXSB8fFxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVsyXSB8fFxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVszXSkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzaWduYXR1cmUnKTtcbiAgfVxuXG4gIC8vIG51bWJlciBvZiB0aGlzIGRpc2tcbiAgdGhpcy5udW1iZXJPZlRoaXNEaXNrID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gbnVtYmVyIG9mIHRoZSBkaXNrIHdpdGggdGhlIHN0YXJ0IG9mIHRoZSBjZW50cmFsIGRpcmVjdG9yeVxuICB0aGlzLnN0YXJ0RGlzayA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuXG4gIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzIGluIHRoZSBjZW50cmFsIGRpcmVjdG9yeSBvbiB0aGlzIGRpc2tcbiAgdGhpcy50b3RhbEVudHJpZXNUaGlzRGlzayA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuXG4gIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzIGluIHRoZSBjZW50cmFsIGRpcmVjdG9yeVxuICB0aGlzLnRvdGFsRW50cmllcyA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xuXG4gIC8vIHNpemUgb2YgdGhlIGNlbnRyYWwgZGlyZWN0b3J5XG4gIHRoaXMuY2VudHJhbERpcmVjdG9yeVNpemUgPSAoXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXG4gICkgPj4+IDA7XG5cbiAgLy8gb2Zmc2V0IG9mIHN0YXJ0IG9mIGNlbnRyYWwgZGlyZWN0b3J5IHdpdGggcmVzcGVjdCB0byB0aGUgc3RhcnRpbmcgZGlzayBudW1iZXJcbiAgdGhpcy5jZW50cmFsRGlyZWN0b3J5T2Zmc2V0ID0gKFxuICAgIChpbnB1dFtpcCsrXSAgICAgICkgfCAoaW5wdXRbaXArK10gPDwgIDgpIHxcbiAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KVxuICApID4+PiAwO1xuXG4gIC8vIC5aSVAgZmlsZSBjb21tZW50IGxlbmd0aFxuICB0aGlzLmNvbW1lbnRMZW5ndGggPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcblxuICAvLyAuWklQIGZpbGUgY29tbWVudFxuICB0aGlzLmNvbW1lbnQgPSBVU0VfVFlQRURBUlJBWSA/XG4gICAgaW5wdXQuc3ViYXJyYXkoaXAsIGlwICsgdGhpcy5jb21tZW50TGVuZ3RoKSA6XG4gICAgaW5wdXQuc2xpY2UoaXAsIGlwICsgdGhpcy5jb21tZW50TGVuZ3RoKTtcbn07XG5cblpsaWIuVW56aXAucHJvdG90eXBlLnBhcnNlRmlsZUhlYWRlciA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge0FycmF5LjxabGliLlVuemlwLkZpbGVIZWFkZXI+fSAqL1xuICB2YXIgZmlsZWxpc3QgPSBbXTtcbiAgLyoqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgbnVtYmVyPn0gKi9cbiAgdmFyIGZpbGV0YWJsZSA9IHt9O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlwO1xuICAvKiogQHR5cGUge1psaWIuVW56aXAuRmlsZUhlYWRlcn0gKi9cbiAgdmFyIGZpbGVIZWFkZXI7XG4gIC8qOiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyo6IEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbDtcblxuICBpZiAodGhpcy5maWxlSGVhZGVyTGlzdCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0aGlzLmNlbnRyYWxEaXJlY3RvcnlPZmZzZXQgPT09IHZvaWQgMCkge1xuICAgIHRoaXMucGFyc2VFbmRPZkNlbnRyYWxEaXJlY3RvcnlSZWNvcmQoKTtcbiAgfVxuICBpcCA9IHRoaXMuY2VudHJhbERpcmVjdG9yeU9mZnNldDtcblxuICBmb3IgKGkgPSAwLCBpbCA9IHRoaXMudG90YWxFbnRyaWVzOyBpIDwgaWw7ICsraSkge1xuICAgIGZpbGVIZWFkZXIgPSBuZXcgWmxpYi5VbnppcC5GaWxlSGVhZGVyKHRoaXMuaW5wdXQsIGlwKTtcbiAgICBmaWxlSGVhZGVyLnBhcnNlKCk7XG4gICAgaXAgKz0gZmlsZUhlYWRlci5sZW5ndGg7XG4gICAgZmlsZWxpc3RbaV0gPSBmaWxlSGVhZGVyO1xuICAgIGZpbGV0YWJsZVtmaWxlSGVhZGVyLmZpbGVuYW1lXSA9IGk7XG4gIH1cblxuICBpZiAodGhpcy5jZW50cmFsRGlyZWN0b3J5U2l6ZSA8IGlwIC0gdGhpcy5jZW50cmFsRGlyZWN0b3J5T2Zmc2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpbGUgaGVhZGVyIHNpemUnKTtcbiAgfVxuXG4gIHRoaXMuZmlsZUhlYWRlckxpc3QgPSBmaWxlbGlzdDtcbiAgdGhpcy5maWxlbmFtZVRvSW5kZXggPSBmaWxldGFibGU7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBmaWxlIGhlYWRlciBpbmRleC5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtc1xuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gZmlsZSBkYXRhLlxuICovXG5abGliLlVuemlwLnByb3RvdHlwZS5nZXRGaWxlRGF0YSA9IGZ1bmN0aW9uKGluZGV4LCBvcHRfcGFyYW1zKSB7XG4gIG9wdF9wYXJhbXMgPSBvcHRfcGFyYW1zIHx8IHt9O1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIC8qKiBAdHlwZSB7QXJyYXkuPFpsaWIuVW56aXAuRmlsZUhlYWRlcj59ICovXG4gIHZhciBmaWxlSGVhZGVyTGlzdCA9IHRoaXMuZmlsZUhlYWRlckxpc3Q7XG4gIC8qKiBAdHlwZSB7WmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXJ9ICovXG4gIHZhciBsb2NhbEZpbGVIZWFkZXI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgb2Zmc2V0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxlbmd0aDtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgYnVmZmVyO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNyYzMyO1xuICAvKiogQHR5cGUge0FycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5fE9iamVjdH0gKi9cbiAgdmFyIGtleTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlsO1xuXG4gIGlmICghZmlsZUhlYWRlckxpc3QpIHtcbiAgICB0aGlzLnBhcnNlRmlsZUhlYWRlcigpO1xuICB9XG5cbiAgaWYgKGZpbGVIZWFkZXJMaXN0W2luZGV4XSA9PT0gdm9pZCAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd3cm9uZyBpbmRleCcpO1xuICB9XG5cbiAgb2Zmc2V0ID0gZmlsZUhlYWRlckxpc3RbaW5kZXhdLnJlbGF0aXZlT2Zmc2V0O1xuICBsb2NhbEZpbGVIZWFkZXIgPSBuZXcgWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXIodGhpcy5pbnB1dCwgb2Zmc2V0KTtcbiAgbG9jYWxGaWxlSGVhZGVyLnBhcnNlKCk7XG4gIG9mZnNldCArPSBsb2NhbEZpbGVIZWFkZXIubGVuZ3RoO1xuICBsZW5ndGggPSBsb2NhbEZpbGVIZWFkZXIuY29tcHJlc3NlZFNpemU7XG5cbiAgLy8gZGVjcnlwdGlvblxuICBpZiAoKGxvY2FsRmlsZUhlYWRlci5mbGFncyAmIFpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyLkZsYWdzLkVOQ1JZUFQpICE9PSAwKSB7XG4gICAgaWYgKCEob3B0X3BhcmFtc1sncGFzc3dvcmQnXSB8fCB0aGlzLnBhc3N3b3JkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdwbGVhc2Ugc2V0IHBhc3N3b3JkJyk7XG4gICAgfVxuICAgIGtleSA9ICB0aGlzLmNyZWF0ZURlY3J5cHRpb25LZXkob3B0X3BhcmFtc1sncGFzc3dvcmQnXSB8fCB0aGlzLnBhc3N3b3JkKTtcblxuICAgIC8vIGVuY3J5cHRpb24gaGVhZGVyXG4gICAgZm9yKGkgPSBvZmZzZXQsIGlsID0gb2Zmc2V0ICsgMTI7IGkgPCBpbDsgKytpKSB7XG4gICAgICB0aGlzLmRlY29kZShrZXksIGlucHV0W2ldKTtcbiAgICB9XG4gICAgb2Zmc2V0ICs9IDEyO1xuICAgIGxlbmd0aCAtPSAxMjtcblxuICAgIC8vIGRlY3J5cHRpb25cbiAgICBmb3IgKGkgPSBvZmZzZXQsIGlsID0gb2Zmc2V0ICsgbGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgICAgaW5wdXRbaV0gPSB0aGlzLmRlY29kZShrZXksIGlucHV0W2ldKTtcbiAgICB9XG4gIH1cblxuICBzd2l0Y2ggKGxvY2FsRmlsZUhlYWRlci5jb21wcmVzc2lvbikge1xuICAgIGNhc2UgWmxpYi5VbnppcC5Db21wcmVzc2lvbk1ldGhvZC5TVE9SRTpcbiAgICAgIGJ1ZmZlciA9IFVTRV9UWVBFREFSUkFZID9cbiAgICAgICAgdGhpcy5pbnB1dC5zdWJhcnJheShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCkgOlxuICAgICAgICB0aGlzLmlucHV0LnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgbGVuZ3RoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgWmxpYi5VbnppcC5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxuICAgICAgYnVmZmVyID0gbmV3IFpsaWIuUmF3SW5mbGF0ZSh0aGlzLmlucHV0LCB7XG4gICAgICAgICdpbmRleCc6IG9mZnNldCxcbiAgICAgICAgJ2J1ZmZlclNpemUnOiBsb2NhbEZpbGVIZWFkZXIucGxhaW5TaXplXG4gICAgICB9KS5kZWNvbXByZXNzKCk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIGNvbXByZXNzaW9uIHR5cGUnKTtcbiAgfVxuXG4gIGlmICh0aGlzLnZlcmlmeSkge1xuICAgIGNyYzMyID0gWmxpYi5DUkMzMi5jYWxjKGJ1ZmZlcik7XG4gICAgaWYgKGxvY2FsRmlsZUhlYWRlci5jcmMzMiAhPT0gY3JjMzIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ3dyb25nIGNyYzogZmlsZT0weCcgKyBsb2NhbEZpbGVIZWFkZXIuY3JjMzIudG9TdHJpbmcoMTYpICtcbiAgICAgICAgJywgZGF0YT0weCcgKyBjcmMzMi50b1N0cmluZygxNilcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZmZlcjtcbn07XG5cbi8qKlxuICogQHJldHVybiB7QXJyYXkuPHN0cmluZz59XG4gKi9cblpsaWIuVW56aXAucHJvdG90eXBlLmdldEZpbGVuYW1lcyA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge0FycmF5LjxzdHJpbmc+fSAqL1xuICB2YXIgZmlsZW5hbWVMaXN0ID0gW107XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbDtcbiAgLyoqIEB0eXBlIHtBcnJheS48WmxpYi5VbnppcC5GaWxlSGVhZGVyPn0gKi9cbiAgdmFyIGZpbGVIZWFkZXJMaXN0O1xuXG4gIGlmICghdGhpcy5maWxlSGVhZGVyTGlzdCkge1xuICAgIHRoaXMucGFyc2VGaWxlSGVhZGVyKCk7XG4gIH1cbiAgZmlsZUhlYWRlckxpc3QgPSB0aGlzLmZpbGVIZWFkZXJMaXN0O1xuXG4gIGZvciAoaSA9IDAsIGlsID0gZmlsZUhlYWRlckxpc3QubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgIGZpbGVuYW1lTGlzdFtpXSA9IGZpbGVIZWFkZXJMaXN0W2ldLmZpbGVuYW1lO1xuICB9XG5cbiAgcmV0dXJuIGZpbGVuYW1lTGlzdDtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIGV4dHJhY3QgZmlsZW5hbWUuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXNcbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGRlY29tcHJlc3NlZCBkYXRhLlxuICovXG5abGliLlVuemlwLnByb3RvdHlwZS5kZWNvbXByZXNzID0gZnVuY3Rpb24oZmlsZW5hbWUsIG9wdF9wYXJhbXMpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbmRleDtcblxuICBpZiAoIXRoaXMuZmlsZW5hbWVUb0luZGV4KSB7XG4gICAgdGhpcy5wYXJzZUZpbGVIZWFkZXIoKTtcbiAgfVxuICBpbmRleCA9IHRoaXMuZmlsZW5hbWVUb0luZGV4W2ZpbGVuYW1lXTtcblxuICBpZiAoaW5kZXggPT09IHZvaWQgMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihmaWxlbmFtZSArICcgbm90IGZvdW5kJyk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5nZXRGaWxlRGF0YShpbmRleCwgb3B0X3BhcmFtcyk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7KEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBwYXNzd29yZFxuICovXG5abGliLlVuemlwLnByb3RvdHlwZS5zZXRQYXNzd29yZCA9IGZ1bmN0aW9uKHBhc3N3b3JkKSB7XG4gIHRoaXMucGFzc3dvcmQgPSBwYXNzd29yZDtcbn07XG5cbi8qKlxuICogQHBhcmFtIHsoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXl8T2JqZWN0KX0ga2V5XG4gKiBAcGFyYW0ge251bWJlcn0gblxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5abGliLlVuemlwLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbihrZXksIG4pIHtcbiAgbiBePSB0aGlzLmdldEJ5dGUoLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqLyhrZXkpKTtcbiAgdGhpcy51cGRhdGVLZXlzKC8qKiBAdHlwZSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi8oa2V5KSwgbik7XG5cbiAgcmV0dXJuIG47XG59O1xuXG4vLyBjb21tb24gbWV0aG9kXG5abGliLlVuemlwLnByb3RvdHlwZS51cGRhdGVLZXlzID0gWmxpYi5aaXAucHJvdG90eXBlLnVwZGF0ZUtleXM7XG5abGliLlVuemlwLnByb3RvdHlwZS5jcmVhdGVEZWNyeXB0aW9uS2V5ID0gWmxpYi5aaXAucHJvdG90eXBlLmNyZWF0ZUVuY3J5cHRpb25LZXk7XG5abGliLlVuemlwLnByb3RvdHlwZS5nZXRCeXRlID0gWmxpYi5aaXAucHJvdG90eXBlLmdldEJ5dGU7XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgWmxpYiBuYW1lc3BhY2UuIFpsaWIg44Gu5LuV5qeY44Gr5rqW5oug44GX44Gf5Zyn57iu44GvIFpsaWIuRGVmbGF0ZSDjgaflrp/oo4VcbiAqIOOBleOCjOOBpuOBhOOCiy4g44GT44KM44GvIEluZmxhdGUg44Go44Gu5YWx5a2Y44KS6ICD5oWu44GX44Gm44GE44KL54K6LlxuICovXG5cbmdvb2cucHJvdmlkZSgnWmxpYicpO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQ29tcHJlc3Npb24gTWV0aG9kXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5abGliLkNvbXByZXNzaW9uTWV0aG9kID0ge1xuICBERUZMQVRFOiA4LFxuICBSRVNFUlZFRDogMTVcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBEZWZsYXRlIChSRkMxOTUxKSDlrp/oo4UuXG4gKiBEZWZsYXRl44Ki44Or44K044Oq44K644Og5pys5L2T44GvIFpsaWIuUmF3RGVmbGF0ZSDjgaflrp/oo4XjgZXjgozjgabjgYTjgosuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5EZWZsYXRlJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYicpO1xuZ29vZy5yZXF1aXJlKCdabGliLkFkbGVyMzInKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5SYXdEZWZsYXRlJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogWmxpYiBEZWZsYXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5KX0gaW5wdXQg56ym5Y+35YyW44GZ44KL5a++6LGh44GuIGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9uIHBhcmFtZXRlcnMuXG4gKi9cblpsaWIuRGVmbGF0ZSA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gKi9cbiAgdGhpcy5pbnB1dCA9IGlucHV0O1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9ICovXG4gIHRoaXMub3V0cHV0ID1cbiAgICBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShabGliLkRlZmxhdGUuRGVmYXVsdEJ1ZmZlclNpemUpO1xuICAvKiogQHR5cGUge1psaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGV9ICovXG4gIHRoaXMuY29tcHJlc3Npb25UeXBlID0gWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5EWU5BTUlDO1xuICAvKiogQHR5cGUge1psaWIuUmF3RGVmbGF0ZX0gKi9cbiAgdGhpcy5yYXdEZWZsYXRlO1xuICAvKiogQHR5cGUge09iamVjdH0gKi9cbiAgdmFyIHJhd0RlZmxhdGVPcHRpb24gPSB7fTtcbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gIHZhciBwcm9wO1xuXG4gIC8vIG9wdGlvbiBwYXJhbWV0ZXJzXG4gIGlmIChvcHRfcGFyYW1zIHx8ICEob3B0X3BhcmFtcyA9IHt9KSkge1xuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtc1snY29tcHJlc3Npb25UeXBlJ10gPT09ICdudW1iZXInKSB7XG4gICAgICB0aGlzLmNvbXByZXNzaW9uVHlwZSA9IG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uVHlwZSddO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNvcHkgb3B0aW9uc1xuICBmb3IgKHByb3AgaW4gb3B0X3BhcmFtcykge1xuICAgIHJhd0RlZmxhdGVPcHRpb25bcHJvcF0gPSBvcHRfcGFyYW1zW3Byb3BdO1xuICB9XG5cbiAgLy8gc2V0IHJhdy1kZWZsYXRlIG91dHB1dCBidWZmZXJcbiAgcmF3RGVmbGF0ZU9wdGlvblsnb3V0cHV0QnVmZmVyJ10gPSB0aGlzLm91dHB1dDtcblxuICB0aGlzLnJhd0RlZmxhdGUgPSBuZXcgWmxpYi5SYXdEZWZsYXRlKHRoaXMuaW5wdXQsIHJhd0RlZmxhdGVPcHRpb24pO1xufTtcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9IOODh+ODleOCqeODq+ODiOODkOODg+ODleOCoeOCteOCpOOCui5cbiAqL1xuWmxpYi5EZWZsYXRlLkRlZmF1bHRCdWZmZXJTaXplID0gMHg4MDAwO1xuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblpsaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGUgPSBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlO1xuXG4vKipcbiAqIOebtOaOpeWcp+e4ruOBq+aOm+OBkeOCiy5cbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5KX0gaW5wdXQgdGFyZ2V0IGJ1ZmZlci5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtcyBvcHRpb24gcGFyYW1ldGVycy5cbiAqIEByZXR1cm4geyEoQXJyYXl8VWludDhBcnJheSl9IGNvbXByZXNzZWQgZGF0YSBieXRlIGFycmF5LlxuICovXG5abGliLkRlZmxhdGUuY29tcHJlc3MgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICByZXR1cm4gKG5ldyBabGliLkRlZmxhdGUoaW5wdXQsIG9wdF9wYXJhbXMpKS5jb21wcmVzcygpO1xufTtcblxuLyoqXG4gKiBEZWZsYXRlIENvbXByZXNzaW9uLlxuICogQHJldHVybiB7IShBcnJheXxVaW50OEFycmF5KX0gY29tcHJlc3NlZCBkYXRhIGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuRGVmbGF0ZS5wcm90b3R5cGUuY29tcHJlc3MgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtabGliLkNvbXByZXNzaW9uTWV0aG9kfSAqL1xuICB2YXIgY207XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgY2luZm87XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgY21mO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGZsZztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBmY2hlY2s7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgZmRpY3Q7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgZmxldmVsO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNsZXZlbDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBhZGxlcjtcbiAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICB2YXIgZXJyb3IgPSBmYWxzZTtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgb3V0cHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHBvcyA9IDA7XG5cbiAgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG5cbiAgLy8gQ29tcHJlc3Npb24gTWV0aG9kIGFuZCBGbGFnc1xuICBjbSA9IFpsaWIuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTtcbiAgc3dpdGNoIChjbSkge1xuICAgIGNhc2UgWmxpYi5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxuICAgICAgY2luZm8gPSBNYXRoLkxPRzJFICogTWF0aC5sb2coWmxpYi5SYXdEZWZsYXRlLldpbmRvd1NpemUpIC0gODtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgY29tcHJlc3Npb24gbWV0aG9kJyk7XG4gIH1cbiAgY21mID0gKGNpbmZvIDw8IDQpIHwgY207XG4gIG91dHB1dFtwb3MrK10gPSBjbWY7XG5cbiAgLy8gRmxhZ3NcbiAgZmRpY3QgPSAwO1xuICBzd2l0Y2ggKGNtKSB7XG4gICAgY2FzZSBabGliLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU6XG4gICAgICBzd2l0Y2ggKHRoaXMuY29tcHJlc3Npb25UeXBlKSB7XG4gICAgICAgIGNhc2UgWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5OT05FOiBmbGV2ZWwgPSAwOyBicmVhaztcbiAgICAgICAgY2FzZSBabGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkZJWEVEOiBmbGV2ZWwgPSAxOyBicmVhaztcbiAgICAgICAgY2FzZSBabGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkRZTkFNSUM6IGZsZXZlbCA9IDI7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIGNvbXByZXNzaW9uIHR5cGUnKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgY29tcHJlc3Npb24gbWV0aG9kJyk7XG4gIH1cbiAgZmxnID0gKGZsZXZlbCA8PCA2KSB8IChmZGljdCA8PCA1KTtcbiAgZmNoZWNrID0gMzEgLSAoY21mICogMjU2ICsgZmxnKSAlIDMxO1xuICBmbGcgfD0gZmNoZWNrO1xuICBvdXRwdXRbcG9zKytdID0gZmxnO1xuXG4gIC8vIEFkbGVyLTMyIGNoZWNrc3VtXG4gIGFkbGVyID0gWmxpYi5BZGxlcjMyKHRoaXMuaW5wdXQpO1xuXG4gIHRoaXMucmF3RGVmbGF0ZS5vcCA9IHBvcztcbiAgb3V0cHV0ID0gdGhpcy5yYXdEZWZsYXRlLmNvbXByZXNzKCk7XG4gIHBvcyA9IG91dHB1dC5sZW5ndGg7XG5cbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgLy8gc3ViYXJyYXkg5YiG44KS5YWD44Gr44KC44Gp44GZXG4gICAgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0LmJ1ZmZlcik7XG4gICAgLy8gZXhwYW5kIGJ1ZmZlclxuICAgIGlmIChvdXRwdXQubGVuZ3RoIDw9IHBvcyArIDQpIHtcbiAgICAgIHRoaXMub3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0Lmxlbmd0aCArIDQpO1xuICAgICAgdGhpcy5vdXRwdXQuc2V0KG91dHB1dCk7XG4gICAgICBvdXRwdXQgPSB0aGlzLm91dHB1dDtcbiAgICB9XG4gICAgb3V0cHV0ID0gb3V0cHV0LnN1YmFycmF5KDAsIHBvcyArIDQpO1xuICB9XG5cbiAgLy8gYWRsZXIzMlxuICBvdXRwdXRbcG9zKytdID0gKGFkbGVyID4+IDI0KSAmIDB4ZmY7XG4gIG91dHB1dFtwb3MrK10gPSAoYWRsZXIgPj4gMTYpICYgMHhmZjtcbiAgb3V0cHV0W3BvcysrXSA9IChhZGxlciA+PiAgOCkgJiAweGZmO1xuICBvdXRwdXRbcG9zKytdID0gKGFkbGVyICAgICAgKSAmIDB4ZmY7XG5cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsImdvb2cucHJvdmlkZSgnWmxpYi5leHBvcnRPYmplY3QnKTtcblxuZ29vZy5yZXF1aXJlKCdabGliJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cblpsaWIuZXhwb3J0T2JqZWN0ID0gZnVuY3Rpb24oZW51bVN0cmluZywgZXhwb3J0S2V5VmFsdWUpIHtcbiAgLyoqIEB0eXBlIHtBcnJheS48c3RyaW5nPn0gKi9cbiAgdmFyIGtleXM7XG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICB2YXIga2V5O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaWw7XG5cbiAgaWYgKE9iamVjdC5rZXlzKSB7XG4gICAga2V5cyA9IE9iamVjdC5rZXlzKGV4cG9ydEtleVZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBrZXlzID0gW107XG4gICAgaSA9IDA7XG4gICAgZm9yIChrZXkgaW4gZXhwb3J0S2V5VmFsdWUpIHtcbiAgICAgIGtleXNbaSsrXSA9IGtleTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGkgPSAwLCBpbCA9IGtleXMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgIGtleSA9IGtleXNbaV07XG4gICAgZ29vZy5leHBvcnRTeW1ib2woZW51bVN0cmluZyArICcuJyArIGtleSwgZXhwb3J0S2V5VmFsdWVba2V5XSlcbiAgfVxufTtcblxufSk7IiwiZ29vZy5wcm92aWRlKCdabGliLkluZmxhdGVTdHJlYW0nKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliJyk7XG4vL2dvb2cucmVxdWlyZSgnWmxpYi5BZGxlcjMyJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuUmF3SW5mbGF0ZVN0cmVhbScpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIEBwYXJhbSB7IShVaW50OEFycmF5fEFycmF5KX0gaW5wdXQgZGVmbGF0ZWQgYnVmZmVyLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cblpsaWIuSW5mbGF0ZVN0cmVhbSA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5KX0gKi9cbiAgdGhpcy5pbnB1dCA9IGlucHV0ID09PSB2b2lkIDAgPyBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgpIDogaW5wdXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLmlwID0gMDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0luZmxhdGVTdHJlYW19ICovXG4gIHRoaXMucmF3aW5mbGF0ZSA9IG5ldyBabGliLlJhd0luZmxhdGVTdHJlYW0odGhpcy5pbnB1dCwgdGhpcy5pcCk7XG4gIC8qKiBAdHlwZSB7WmxpYi5Db21wcmVzc2lvbk1ldGhvZH0gKi9cbiAgdGhpcy5tZXRob2Q7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gKi9cbiAgdGhpcy5vdXRwdXQgPSB0aGlzLnJhd2luZmxhdGUub3V0cHV0O1xufTtcblxuLyoqXG4gKiBkZWNvbXByZXNzLlxuICogQHJldHVybiB7IShVaW50OEFycmF5fEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyLlxuICovXG5abGliLkluZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3MgPSBmdW5jdGlvbihpbnB1dCkge1xuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheSl9IGluZmxhdGVkIGJ1ZmZlci4gKi9cbiAgdmFyIGJ1ZmZlcjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGFkbGVyLTMyIGNoZWNrc3VtICovXG4gIHZhciBhZGxlcjMyO1xuXG4gIC8vIOaWsOOBl+OBhOWFpeWKm+OCkuWFpeWKm+ODkOODg+ODleOCoeOBq+e1kOWQiOOBmeOCi1xuICAvLyBYWFggQXJyYXksIFVpbnQ4QXJyYXkg44Gu44OB44Kn44OD44Kv44KS6KGM44GG44GL56K66KqN44GZ44KLXG4gIGlmIChpbnB1dCAhPT0gdm9pZCAwKSB7XG4gICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgICB2YXIgdG1wID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5pbnB1dC5sZW5ndGggKyBpbnB1dC5sZW5ndGgpO1xuICAgICAgdG1wLnNldCh0aGlzLmlucHV0LCAwKTtcbiAgICAgIHRtcC5zZXQoaW5wdXQsIHRoaXMuaW5wdXQubGVuZ3RoKTtcbiAgICAgIHRoaXMuaW5wdXQgPSB0bXA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW5wdXQgPSB0aGlzLmlucHV0LmNvbmNhdChpbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMubWV0aG9kID09PSB2b2lkIDApIHtcbiAgICBpZih0aGlzLnJlYWRIZWFkZXIoKSA8IDApIHtcbiAgICAgIHJldHVybiBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgpO1xuICAgIH1cbiAgfVxuXG4gIGJ1ZmZlciA9IHRoaXMucmF3aW5mbGF0ZS5kZWNvbXByZXNzKHRoaXMuaW5wdXQsIHRoaXMuaXApO1xuICBpZiAodGhpcy5yYXdpbmZsYXRlLmlwICE9PSAwKSB7XG4gICAgdGhpcy5pbnB1dCA9IFVTRV9UWVBFREFSUkFZID9cbiAgICAgIHRoaXMuaW5wdXQuc3ViYXJyYXkodGhpcy5yYXdpbmZsYXRlLmlwKSA6XG4gICAgICB0aGlzLmlucHV0LnNsaWNlKHRoaXMucmF3aW5mbGF0ZS5pcCk7XG4gICAgdGhpcy5pcCA9IDA7XG4gIH1cblxuICAvLyB2ZXJpZnkgYWRsZXItMzJcbiAgLypcbiAgaWYgKHRoaXMudmVyaWZ5KSB7XG4gICAgYWRsZXIzMiA9XG4gICAgICBpbnB1dFt0aGlzLmlwKytdIDw8IDI0IHwgaW5wdXRbdGhpcy5pcCsrXSA8PCAxNiB8XG4gICAgICBpbnB1dFt0aGlzLmlwKytdIDw8IDggfCBpbnB1dFt0aGlzLmlwKytdO1xuXG4gICAgaWYgKGFkbGVyMzIgIT09IFpsaWIuQWRsZXIzMihidWZmZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYWRsZXItMzIgY2hlY2tzdW0nKTtcbiAgICB9XG4gIH1cbiAgKi9cblxuICByZXR1cm4gYnVmZmVyO1xufTtcblxuWmxpYi5JbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkSGVhZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG5cbiAgLy8gQ29tcHJlc3Npb24gTWV0aG9kIGFuZCBGbGFnc1xuICB2YXIgY21mID0gaW5wdXRbaXArK107XG4gIHZhciBmbGcgPSBpbnB1dFtpcCsrXTtcblxuICBpZiAoY21mID09PSB2b2lkIDAgfHwgZmxnID09PSB2b2lkIDApIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvLyBjb21wcmVzc2lvbiBtZXRob2RcbiAgc3dpdGNoIChjbWYgJiAweDBmKSB7XG4gICAgY2FzZSBabGliLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU6XG4gICAgICB0aGlzLm1ldGhvZCA9IFpsaWIuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIGNvbXByZXNzaW9uIG1ldGhvZCcpO1xuICB9XG5cbiAgLy8gZmNoZWNrXG4gIGlmICgoKGNtZiA8PCA4KSArIGZsZykgJSAzMSAhPT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmY2hlY2sgZmxhZzonICsgKChjbWYgPDwgOCkgKyBmbGcpICUgMzEpO1xuICB9XG5cbiAgLy8gZmRpY3QgKG5vdCBzdXBwb3J0ZWQpXG4gIGlmIChmbGcgJiAweDIwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdmZGljdCBmbGFnIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgfVxuXG4gIHRoaXMuaXAgPSBpcDtcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsImdvb2cucmVxdWlyZSgnWmxpYi5BZGxlcjMyJyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkFkbGVyMzInLCBabGliLkFkbGVyMzIpO1xuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuQWRsZXIzMi51cGRhdGUnLCBabGliLkFkbGVyMzIudXBkYXRlKTtcbiIsImdvb2cucmVxdWlyZSgnWmxpYi5DUkMzMicpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5DUkMzMicsIFpsaWIuQ1JDMzIpO1xuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuQ1JDMzIuY2FsYycsIFpsaWIuQ1JDMzIuY2FsYyk7XG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5DUkMzMi51cGRhdGUnLCBabGliLkNSQzMyLnVwZGF0ZSk7IiwiZ29vZy5yZXF1aXJlKCdabGliLkRlZmxhdGUnKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5leHBvcnRPYmplY3QnKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuRGVmbGF0ZScsIFpsaWIuRGVmbGF0ZSk7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuRGVmbGF0ZS5jb21wcmVzcycsXG4gIFpsaWIuRGVmbGF0ZS5jb21wcmVzc1xuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5EZWZsYXRlLnByb3RvdHlwZS5jb21wcmVzcycsXG4gIFpsaWIuRGVmbGF0ZS5wcm90b3R5cGUuY29tcHJlc3Ncbik7XG5abGliLmV4cG9ydE9iamVjdCgnWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZScsIHtcbiAgJ05PTkUnOiBabGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlLk5PTkUsXG4gICdGSVhFRCc6IFpsaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRklYRUQsXG4gICdEWU5BTUlDJzogWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5EWU5BTUlDXG59KTtcbiIsImdvb2cucmVxdWlyZSgnWmxpYi5HdW56aXBNZW1iZXInKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuR3VuemlwTWVtYmVyJywgWmxpYi5HdW56aXBNZW1iZXIpO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TmFtZScsXG4gIFpsaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXROYW1lXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0RGF0YScsXG4gIFpsaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXREYXRhXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TXRpbWUnLFxuICBabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TXRpbWVcbik7IiwiZ29vZy5yZXF1aXJlKCdabGliLkd1bnppcCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5HdW56aXAnLCBabGliLkd1bnppcCk7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvbXByZXNzJyxcbiAgWmxpYi5HdW56aXAucHJvdG90eXBlLmRlY29tcHJlc3Ncbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuR3VuemlwLnByb3RvdHlwZS5nZXRNZW1iZXJzJyxcbiAgWmxpYi5HdW56aXAucHJvdG90eXBlLmdldE1lbWJlcnNcbik7XG4iLCJnb29nLnJlcXVpcmUoJ1psaWIuR3ppcCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5HemlwJywgWmxpYi5HemlwKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5HemlwLnByb3RvdHlwZS5jb21wcmVzcycsXG4gIFpsaWIuR3ppcC5wcm90b3R5cGUuY29tcHJlc3Ncbik7IiwiZ29vZy5yZXF1aXJlKCdabGliLkluZmxhdGVTdHJlYW0nKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuSW5mbGF0ZVN0cmVhbScsIFpsaWIuSW5mbGF0ZVN0cmVhbSk7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb21wcmVzcycsXG4gIFpsaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb21wcmVzc1xuKTtcbiIsImdvb2cucmVxdWlyZSgnWmxpYi5JbmZsYXRlJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuZXhwb3J0T2JqZWN0Jyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkluZmxhdGUnLCBabGliLkluZmxhdGUpO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkluZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3MnLFxuICBabGliLkluZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3Ncbik7XG5abGliLmV4cG9ydE9iamVjdCgnWmxpYi5JbmZsYXRlLkJ1ZmZlclR5cGUnLCB7XG4gICdBREFQVElWRSc6IFpsaWIuSW5mbGF0ZS5CdWZmZXJUeXBlLkFEQVBUSVZFLFxuICAnQkxPQ0snOiBabGliLkluZmxhdGUuQnVmZmVyVHlwZS5CTE9DS1xufSk7XG4iLCJnb29nLnJlcXVpcmUoJ1psaWIuUmF3RGVmbGF0ZScpO1xuZ29vZy5yZXF1aXJlKCdabGliLmV4cG9ydE9iamVjdCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuUmF3RGVmbGF0ZScsXG4gIFpsaWIuUmF3RGVmbGF0ZVxuKTtcblxuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmNvbXByZXNzJyxcbiAgWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5jb21wcmVzc1xuKTtcblxuWmxpYi5leHBvcnRPYmplY3QoXG4gICdabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlJyxcbiAge1xuICAgICdOT05FJzogWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5OT05FLFxuICAgICdGSVhFRCc6IFpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRklYRUQsXG4gICAgJ0RZTkFNSUMnOiBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkRZTkFNSUNcbiAgfVxuKTtcbiIsImdvb2cucmVxdWlyZSgnWmxpYi5SYXdJbmZsYXRlU3RyZWFtJyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLlJhd0luZmxhdGVTdHJlYW0nLCBabGliLlJhd0luZmxhdGVTdHJlYW0pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3MnLFxuICBabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3Ncbik7XG4iLCJnb29nLnJlcXVpcmUoJ1psaWIuUmF3SW5mbGF0ZScpO1xuZ29vZy5yZXF1aXJlKCdabGliLmV4cG9ydE9iamVjdCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5SYXdJbmZsYXRlJywgWmxpYi5SYXdJbmZsYXRlKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5kZWNvbXByZXNzJyxcbiAgWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5kZWNvbXByZXNzXG4pO1xuWmxpYi5leHBvcnRPYmplY3QoJ1psaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlJywge1xuICAnQURBUFRJVkUnOiBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZS5BREFQVElWRSxcbiAgJ0JMT0NLJzogWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUuQkxPQ0tcbn0pO1xuIiwiZ29vZy5yZXF1aXJlKCdabGliLlVuemlwJyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLlVuemlwJywgWmxpYi5VbnppcCk7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuVW56aXAucHJvdG90eXBlLmRlY29tcHJlc3MnLFxuICBabGliLlVuemlwLnByb3RvdHlwZS5kZWNvbXByZXNzXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlVuemlwLnByb3RvdHlwZS5nZXRGaWxlbmFtZXMnLFxuICBabGliLlVuemlwLnByb3RvdHlwZS5nZXRGaWxlbmFtZXNcbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuVW56aXAucHJvdG90eXBlLnNldFBhc3N3b3JkJyxcbiAgWmxpYi5VbnppcC5wcm90b3R5cGUuc2V0UGFzc3dvcmRcbik7IiwiZ29vZy5yZXF1aXJlKCdabGliLlppcCcpO1xuZ29vZy5yZXF1aXJlKCdabGliLmV4cG9ydE9iamVjdCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuWmlwJyxcbiAgWmxpYi5aaXBcbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuWmlwLnByb3RvdHlwZS5hZGRGaWxlJyxcbiAgWmxpYi5aaXAucHJvdG90eXBlLmFkZEZpbGVcbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuWmlwLnByb3RvdHlwZS5jb21wcmVzcycsXG4gIFpsaWIuWmlwLnByb3RvdHlwZS5jb21wcmVzc1xuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5aaXAucHJvdG90eXBlLnNldFBhc3N3b3JkJyxcbiAgWmxpYi5aaXAucHJvdG90eXBlLnNldFBhc3N3b3JkXG4pO1xuWmxpYi5leHBvcnRPYmplY3QoXG4gJ1psaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kJywge1xuICAgICdTVE9SRSc6IFpsaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kLlNUT1JFLFxuICAgICdERUZMQVRFJzogWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURVxuICB9XG4pO1xuWmxpYi5leHBvcnRPYmplY3QoXG4gICdabGliLlppcC5PcGVyYXRpbmdTeXN0ZW0nLCB7XG4gICAgJ01TRE9TJzogWmxpYi5aaXAuT3BlcmF0aW5nU3lzdGVtLk1TRE9TLFxuICAgICdVTklYJzogWmxpYi5aaXAuT3BlcmF0aW5nU3lzdGVtLlVOSVgsXG4gICAgJ01BQ0lOVE9TSCc6IFpsaWIuWmlwLk9wZXJhdGluZ1N5c3RlbS5NQUNJTlRPU0hcbiAgfVxuKTtcbi8vIFRPRE86IERlZmxhdGUgT3B0aW9uIl19