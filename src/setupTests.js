/* eslint-disable */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'

jest.mock('react-helmet-async', () => {
  const React = require('react')

  return {
    HelmetProvider: ({ children }) =>
      React.createElement(React.Fragment, null, children),
    Helmet: ({ children }) =>
      React.createElement(React.Fragment, null, children)
  }
})

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock

global.console = {
  log: jest.fn(),
  error: jest.fn(),
  // Keep native behaviour for other methods. Silence warn logs in tests.
  warn: jest.fn(),
  info: console.info,
  debug: console.debug
}
