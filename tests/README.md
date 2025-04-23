# Smart Table Test Suite

This directory contains comprehensive tests for the Smart Table library using Nightwatch.js.

## Test Structure

The test suite is organized as follows:

- `smartTable.test.js`: Basic functionality tests covering all core features
- `editableTable.unit.test.js`: Unit tests for the EditableTable class
- `edgeCase.test.js`: Tests for edge cases and unusual input scenarios
- `customCommands.test.js`: Tests using custom commands for Smart Table testing
- `visual.test.js`: Visual regression tests for styling and layout

Additionally, there are supporting files:

- `commands/smartTableCommands.js`: Custom Nightwatch commands for Smart Table testing
- `setup.js`: Global test hooks and configuration
- `run-tests.sh`: Script to run tests with a local HTTP server
- `screenshots/`: Directory for test failure screenshots

## Running Tests

To run the tests, you need to have Node.js and npm installed. Then:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run all tests:
   ```bash
   npm test
   ```

3. Run specific test groups:
   ```bash
   npm run test:basic     # Run basic functionality tests
   npm run test:unit      # Run unit tests
   npm run test:edge      # Run edge case tests
   npm run test:custom    # Run tests with custom commands
   npm run test:visual    # Run visual regression tests
   ```

4. Run tests in specific browsers:
   ```bash
   npm run test:chrome    # Run tests in Chrome
   npm run test:firefox   # Run tests in Firefox
   ```

5. Run a single test file:
   ```bash
   npm run test:single tests/nightwatch/smartTable.test.js
   ```

## Test Coverage

These tests cover:

- Table initialization and configuration
- CRUD operations (Create, Read, Update, Delete)
- Data type handling (integer, float, boolean, text, select)
- Event handling and callbacks
- UI interactions and form behaviors
- Edge cases and error handling
- Visual styling and layout

## Continuous Integration

The test suite is configured to run automatically in GitHub Actions. See `.github/workflows/test.yml` for the configuration.

## Extending Tests

To add new tests:

1. Create a new test file in the `tests/nightwatch/` directory
2. Use existing custom commands or create new ones in `commands/`
3. Update the `package.json` scripts if you want to add a specific run command

## Troubleshooting

If tests fail:

1. Check the screenshots in the `screenshots/` directory
2. Verify that the HTTP server is running (`npm run serve`)
3. Ensure you have the latest WebDriver for your browser version