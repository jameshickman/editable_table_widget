module.exports = {
  beforeEach: function(browser) {
    browser.resizeWindow(1200, 800);
  },

  'Test File Plugin Registration': function(browser) {
    browser
      .url('http://localhost:8080/test-file-plugin.html')
      .waitForElementVisible('#smart-table', 5000)
      .assert.visible('#smart-table')
      .perform(function(done) {
        // Test that the file plugin is properly registered
        browser.execute(function() {
          // Check that the plugin is loaded
          return typeof window.FilePlugin !== 'undefined';
        }, [], function(result) {
          this.assert.ok(result.value, 'FilePlugin should be defined');
          done();
        }.bind(this));
      })
      .pause(1000);
  },

  'Test File Column Rendering': function(browser) {
    browser
      .url('http://localhost:8080/test-file-plugin.html')
      .waitForElementVisible('#smart-table', 5000)
      .assert.elementPresent('th[data-type="file"][data-name="document"]')
      .assert.containsText('th[data-type="file"][data-name="document"]', 'Document')
      .pause(1000);
  },

  'Test File Upload Button Appears': function(browser) {
    browser
      .url('http://localhost:8080/test-file-plugin.html')
      .waitForElementVisible('#smart-table', 5000)
      .click('#add-row')
      .waitForElementVisible('button.file-plugin-button', 5000)
      .assert.visible('button.file-plugin-button')
      .assert.containsText('button.file-plugin-button', 'Choose File...')
      .end();
  }
};