/**
 * Test setup script for Smart Table
 * This file is run before tests are executed in Nightwatch
 */

console.log('Starting test environment setup...');

// Global test hooks can be defined here
module.exports = {
  before: function(done) {
    console.log('Running global before hook for all tests');
    done();
  },
  
  after: function(done) {
    console.log('Running global after hook for all tests');
    done();
  },

  beforeEach: function(browser, done) {
    console.log('Running before hook for test:', browser.currentTest.module);
    done();
  },
  
  afterEach: function(browser, done) {
    // Perform cleanup after each test if necessary
    console.log('Test complete:', browser.currentTest.module);
    
    // Clean up any dialogs that might be open
    browser.execute(function() {
      const dialog = document.querySelector('div[style*="position: fixed"]');
      if (dialog) {
        dialog.remove();
      }
      return true;
    }, [], function() {
      done();
    });
  },
  
  reporter: function(results, done) {
    console.log('Test Results Summary:');
    console.log('- Passed tests:', results.passed);
    console.log('- Failed tests:', results.failed);
    console.log('- Skipped tests:', results.skipped);
    console.log('- Total assertions:', results.assertions);
    
    if (results.failed > 0) {
      console.log('Tests failed!');
    } else {
      console.log('All tests passed!');
    }
    
    done();
  }
};