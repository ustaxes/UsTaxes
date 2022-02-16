/* eslint-disable */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'
import '@testing-library/jest-dom'

const localStorageMock: Storage = {
  ...localStorage,
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}

global.localStorage = localStorageMock

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),

  // Keep native behaviour for other methods, use those to print out things in your own tests
  warn: console.warn,
  info: console.info,
  debug: console.debug
}
