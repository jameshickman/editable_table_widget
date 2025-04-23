describe('Smart Table Tests', function() {
  before(browser => {
    browser
      .url('http://localhost:8080')
      .waitForElementVisible('body', 1000);
  });

  after(browser => {
    browser.end();
  });

  it('should have the correct title', browser => {
    browser
      .assert.title('Smart Table Widget')
      .assert.visible('h1')
      .assert.textContains('h1', 'Test of Simple table inline CRUD operations');
  });

  it('should display the initial table with correct headers and data', browser => {
    browser
      .assert.visible('#smart-table')
      .assert.elementPresent('#smart-table thead tr')
      .assert.elementPresent('#smart-table tbody tr:nth-child(1)')
      .assert.elementPresent('#smart-table tbody tr:nth-child(2)')
      .assert.textEquals('#smart-table tbody tr:nth-child(1) td:nth-child(3)', '123')
      .assert.textEquals('#smart-table tbody tr:nth-child(1) td:nth-child(6)', 'Some demonstration text');
  });

  it('should add a new row when Add a row button is clicked', browser => {
    const initialRowCount = browser.elements('css selector', '#smart-table tbody tr').length;
    
    browser
      .click('#add')
      .waitForElementVisible('.table__inline-edit-form', 1000)
      .setValue('input[name="field1"]', '789')
      .setValue('input[name="field2"]', '2.7182')
      .click('input[name="field3"]')
      .setValue('input[name="field4"]', 'New test row')
      .click('select[name="field5"] option[value="1"]')
      .click('.table__inline-edit-form button:first-child') // Save button
      .waitForElementNotPresent('.table__inline-edit-form', 1000);
    
    browser.elements('css selector', '#smart-table tbody tr', function(result) {
      this.assert.equal(result.value.length, initialRowCount + 1, 'A new row should be added');
    });
    
    browser.assert.textContains('#smart-table tbody tr:nth-child(3) td:nth-child(6)', 'New test row');
  });

  it('should edit an existing row', browser => {
    browser
      .click('#smart-table tbody tr:nth-child(1) td:last-child button:first-child') // Edit first row
      .waitForElementVisible('.table__inline-edit-form', 1000)
      .clearValue('input[name="field4"]')
      .setValue('input[name="field4"]', 'Edited text value')
      .click('.table__inline-edit-form button:first-child') // Save button
      .waitForElementNotPresent('.table__inline-edit-form', 1000);
    
    browser.assert.textEquals('#smart-table tbody tr:nth-child(1) td:nth-child(6)', 'Edited text value');
  });

  it('should cancel editing a row', browser => {
    const originalText = browser.getText('#smart-table tbody tr:nth-child(2) td:nth-child(6)');
    
    browser
      .click('#smart-table tbody tr:nth-child(2) td:last-child button:first-child') // Edit second row
      .waitForElementVisible('.table__inline-edit-form', 1000)
      .clearValue('input[name="field4"]')
      .setValue('input[name="field4"]', 'This text should not be saved')
      .click('.table__inline-edit-form button:nth-child(2)') // Cancel button
      .waitForElementNotPresent('.table__inline-edit-form', 1000);
    
    browser.assert.textEquals('#smart-table tbody tr:nth-child(2) td:nth-child(6)', originalText);
  });

  it('should delete a row after confirmation', browser => {
    const initialRowCount = browser.elements('css selector', '#smart-table tbody tr').length;
    
    browser
      .click('#smart-table tbody tr:nth-child(2) td:last-child button:nth-child(2)') // Delete second row
      .waitForElementVisible('.dialog__button-yes', 1000)
      .assert.visible('div[style*="position: fixed"]') // Dialog overlay
      .click('.dialog__button-yes')
      .waitForElementNotPresent('div[style*="position: fixed"]', 1000);
    
    browser.elements('css selector', '#smart-table tbody tr', function(result) {
      this.assert.equal(result.value.length, initialRowCount - 1, 'A row should be deleted');
    });
  });

  it('should cancel row deletion', browser => {
    const initialRowCount = browser.elements('css selector', '#smart-table tbody tr').length;
    
    browser
      .click('#smart-table tbody tr:nth-child(1) td:last-child button:nth-child(2)') // Delete first row
      .waitForElementVisible('.dialog__button-no', 1000)
      .click('.dialog__button-no')
      .waitForElementNotPresent('div[style*="position: fixed"]', 1000);
    
    browser.elements('css selector', '#smart-table tbody tr', function(result) {
      this.assert.equal(result.value.length, initialRowCount, 'No row should be deleted when canceled');
    });
  });

  it('should get table data when button is clicked', browser => {
    browser
      .click('#get_data')
      .execute(function() {
        return window.table && window.table.get_values ? window.table.get_values() : null;
      }, [], function(result) {
        // Check console log for data output, since the demo doesn't display it on the page
        this.assert.ok(result.value !== null, 'Table data should be retrieved');
      });
  });

  it('should populate table with new data', browser => {
    browser
      .click('#populate')
      .waitForElementPresent('#smart-table tbody tr', 1000)
      .assert.textEquals('#smart-table tbody tr:nth-child(1) td:nth-child(3)', '987')
      .assert.textEquals('#smart-table tbody tr:nth-child(1) td:nth-child(6)', 'Some text dynamically set')
      .assert.textEquals('#smart-table tbody tr:nth-child(2) td:nth-child(3)', '654')
      .assert.textEquals('#smart-table tbody tr:nth-child(2) td:nth-child(6)', 'Other text');
  });

  it('should handle boolean values correctly', browser => {
    browser
      .click('#smart-table tbody tr:nth-child(1) td:last-child button:first-child') // Edit first row
      .waitForElementVisible('.table__inline-edit-form', 1000)
      .execute(function() {
        // Check if the checkbox is checked
        return document.querySelector('input[name="field3"]').checked;
      }, [], function(result) {
        this.assert.strictEqual(result.value, true, 'Boolean checkbox should be checked');
      })
      .click('input[name="field3"]') // Toggle the checkbox
      .click('.table__inline-edit-form button:first-child') // Save button
      .waitForElementNotPresent('.table__inline-edit-form', 1000);
    
    browser.assert.textEquals('#smart-table tbody tr:nth-child(1) td:nth-child(5)', 'No');
  });

  it('should handle select values correctly', browser => {
    browser
      .click('#smart-table tbody tr:nth-child(1) td:last-child button:first-child') // Edit first row
      .waitForElementVisible('.table__inline-edit-form', 1000)
      .click('select[name="field5"] option[value="3"]') // Select the Third option
      .click('.table__inline-edit-form button:first-child') // Save button
      .waitForElementNotPresent('.table__inline-edit-form', 1000);
    
    browser.assert.textEquals('#smart-table tbody tr:nth-child(1) td:nth-child(7)', 'Third');
  });

  it('should disable action buttons during editing', browser => {
    browser
      .click('#smart-table tbody tr:nth-child(1) td:last-child button:first-child') // Edit first row
      .waitForElementVisible('.table__inline-edit-form', 1000)
      .execute(function() {
        return document.querySelector('#add').disabled;
      }, [], function(result) {
        this.assert.strictEqual(result.value, true, 'Add button should be disabled during editing');
      })
      .execute(function() {
        return document.querySelector('#get_data').disabled;
      }, [], function(result) {
        this.assert.strictEqual(result.value, true, 'Get data button should be disabled during editing');
      })
      .execute(function() {
        return document.querySelector('#populate').disabled;
      }, [], function(result) {
        this.assert.strictEqual(result.value, true, 'Populate button should be disabled during editing');
      })
      .click('.table__inline-edit-form button:nth-child(2)') // Cancel button
      .waitForElementNotPresent('.table__inline-edit-form', 1000);
  });
});