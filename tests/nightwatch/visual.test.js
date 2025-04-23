describe('Smart Table Visual Tests', function() {
  before(browser => {
    browser
      .url('http://localhost:8080')
      .waitForElementVisible('body', 1000);
  });

  after(browser => {
    browser.end();
  });

  it('should verify table styling in normal state', browser => {
    if (browser.options.desiredCapabilities.browserName !== 'chrome') {
      return; // Skip visual tests on non-Chrome browsers
    }
    
    browser.assert.cssProperty('#smart-table th', 'color', 'rgba(255, 255, 255, 1)');
    browser.assert.cssProperty('#smart-table th', 'background-color', 'rgba(0, 0, 0, 1)');
    browser.assert.cssProperty('#smart-table td', 'border-bottom', '1px solid rgb(204, 204, 204)');
  });

  it('should verify edit form styling', browser => {
    if (browser.options.desiredCapabilities.browserName !== 'chrome') {
      return; // Skip visual tests on non-Chrome browsers
    }
    
    browser
      .click('#smart-table tbody tr:nth-child(1) td:last-child button:first-child') // Edit first row
      .waitForElementVisible('.table__inline-edit-form', 1000)
      .assert.cssProperty('.table__inline-edit-form', 'background-color', 'rgba(255, 165, 0, 1)') // orange
      .click('.table__inline-edit-form button:nth-child(2)'); // Cancel
  });

  it('should verify delete confirmation styling', browser => {
    if (browser.options.desiredCapabilities.browserName !== 'chrome') {
      return; // Skip visual tests on non-Chrome browsers
    }
    
    browser
      .click('#smart-table tbody tr:nth-child(1) td:last-child button:nth-child(2)') // Delete first row
      .waitForElementVisible('div[style*="position: fixed"]', 1000)
      .assert.cssProperty('.table__row-to-delete', 'background-color', 'rgba(255, 0, 0, 1)') // red
      .click('.dialog__button-no'); // Cancel
  });

  it('should verify table layout and visibility', browser => {
    if (browser.options.desiredCapabilities.browserName !== 'chrome') {
      return; // Skip visual tests on non-Chrome browsers
    }
    
    browser
      .assert.cssProperty('#smart-table', 'border-collapse', 'collapse')
      .assert.cssProperty('#smart-table th:nth-child(1)', 'display', 'none')
      .assert.cssProperty('#smart-table th:nth-child(2)', 'display', 'none')
      .assert.cssProperty('#smart-table td:nth-child(1)', 'display', 'none')
      .assert.cssProperty('#smart-table td:nth-child(2)', 'display', 'none');
  });

  it('should verify form controls styling', browser => {
    if (browser.options.desiredCapabilities.browserName !== 'chrome') {
      return; // Skip visual tests on non-Chrome browsers
    }
    
    browser
      .click('#add') // Add a new row
      .waitForElementVisible('.table__inline-edit-form', 1000)
      .assert.cssProperty('#smart-table input[type=text]', 'width', '100%')
      .assert.cssProperty('#smart-table input[type=number]', 'width', '100%')
      .assert.cssProperty('#smart-table select', 'width', '100%')
      .assert.cssProperty('#smart-table input[type=text]', 'box-sizing', 'border-box')
      .click('.table__inline-edit-form button:nth-child(2)'); // Cancel
  });

  it('should verify action buttons container styling', browser => {
    if (browser.options.desiredCapabilities.browserName !== 'chrome') {
      return; // Skip visual tests on non-Chrome browsers
    }
    
    browser
      .assert.cssProperty('#smart-table td:nth-child(8)', 'width', '1px')
      .assert.cssProperty('#smart-table td:nth-child(8)', 'white-space', 'nowrap')
      .assert.cssProperty('#smart-table td:nth-child(8)', 'text-align', 'center');
  });
});