const CracoAlias = require('craco-alias')

module.exports = {
  eslint: null,
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: '.',
        // tsConfigPath should point to the file where "baseUrl" and "paths" are specified
        tsConfigPath: './tsconfig.path.json'
      }
    }
  ]
}
