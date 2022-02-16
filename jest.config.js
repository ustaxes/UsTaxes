/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^ustaxes/(.*)': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: ['/node_modules/(?!@tauri-apps)'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
}
