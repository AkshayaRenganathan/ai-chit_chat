module.exports = {
  // Use babel-jest to transform all JS and JSX files
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  // The key fix: tell Jest to transform the `axios` library
  // This is necessary because it uses modern JS syntax that Jest doesn't understand by default
  transformIgnorePatterns: [
    'node_modules/(?!axios)/',
  ],
  // Mocks CSS and other file imports to prevent errors
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  // Sets up a browser-like environment for testing components
  testEnvironment: 'jsdom',
  // Configures the setup file that adds custom matchers
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};


