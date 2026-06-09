module.exports = typeof WebAssembly === 'object'
  ? require('./tesseract-core')
  : require('./tesseract-core.asm');
