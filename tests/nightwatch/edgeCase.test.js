describe('Smart Table Edge Case Tests', function() {
  before(browser => {
    browser
      .url('http://localhost:8080/tests/test.html')
      .waitForElementVisible('body', 1000);
  });

  after(browser => {
    browser.end();
  });

  it('should handle empty initial table', browser => {
    browser.execute(function() {
      window.table.reset();
      return document.querySelectorAll('#smart-table tbody tr').length;
    }, [], function(result) {
      this.assert.strictEqual(result.value, 0, 'Table should be empty after reset');
      
      // Now add a new row to the empty table
      browser
        .click('#add')
        .waitForElementVisible('.table__inline-edit-form', 1000)
        .setValue('input[name="field1"]', '999')
        .setValue('input[name="field2"]', '9.999')
        .click('input[name="field3"]')
        .setValue('input[name="field4"]', 'First row in empty table')
        .click('select[name="field5"] option[value="1"]')
        .click('.table__inline-edit-form button:first-child') // Save button
        .waitForElementNotPresent('.table__inline-edit-form', 1000);
      
      browser.assert.elementPresent('#smart-table tbody tr:nth-child(1)');
      browser.assert.textEquals('#smart-table tbody tr:nth-child(1) td:nth-child(3)', '999');
    });
  });

  it('should handle large numbers and decimals correctly', browser => {
    browser.execute(function() {
      window.table.reset();
      window.table.set_rows([{
        'index': 1,
        'uid': 'test-uid',
        'field1': 9007199254740991, // Max safe integer in JavaScript
        'field2': 1.7976931348623157e+308, // Max Number in JavaScript
        'field3': true,
        'field4': 'Edge case values',
        'field5': '1'
      }]);
      
      return window.table.get_values()[0];
    }, [], function(result) {
      this.assert.strictEqual(result.value.field1, 9007199254740991, 'Should handle max safe integer');
      
      // Now edit this row and check values
      browser
        .click('#smart-table tbody tr:nth-child(1) td:last-child button:first-child') // Edit
        .waitForElementVisible('.table__inline-edit-form', 1000)
        .getAttribute('input[name="field1"]', 'value', function(result) {
          this.assert.strictEqual(result.value, '9007199254740991', 'Integer input should show correct value');
        })
        .click('.table__inline-edit-form button:nth-child(2)'); // Cancel
    });
  });

  it('should handle special characters in text fields', browser => {
    const specialText = 'Special chars: !@#$%^&*()_+<>?:"{}|~`';
    
    browser
      .click('#smart-table tbody tr:nth-child(1) td:last-child button:first-child') // Edit
      .waitForElementVisible('.table__inline-edit-form', 1000)
      .clearValue('input[name="field4"]')
      .setValue('input[name="field4"]', specialText)
      .click('.table__inline-edit-form button:first-child') // Save
      .waitForElementNotPresent('.table__inline-edit-form', 1000);
    
    browser.assert.textEquals('#smart-table tbody tr:nth-child(1) td:nth-child(6)', specialText);
  });

  it('should handle concurrent editing attempts', browser => {
    browser.execute(function() {
      // Add another row
      window.table.add_row({
        'index': 2,
        'uid': 'second-row',
        'field1': 222,
        'field2': 2.2,
        'field3': false,
        'field4': 'Second row',
        'field5': '2'
      });
      
      // Try to edit the first row
      document.querySelector('#smart-table tbody tr:nth-child(1) td:last-child button:first-child').click();
      
      // Now try to edit the second row while first row is in edit mode
      document.querySelector('#smart-table tbody tr:nth-child(2) td:last-child button:first-child').click();
      
      return {
        formCount: document.querySelectorAll('.table__inline-edit-form').length,
        buttonsDisabled: document.querySelector('#smart-table tbody tr:nth-child(2) td:last-child button:first-child').disabled
      };
    }, [], function(result) {
      this.assert.strictEqual(result.value.formCount, 1, 'Only one edit form should be active');
      this.assert.strictEqual(result.value.buttonsDisabled, true, 'Other edit buttons should be disabled');
      
      // Cancel the edit
      browser
        .click('.table__inline-edit-form button:nth-child(2)') // Cancel
        .waitForElementNotPresent('.table__inline-edit-form', 1000);
    });
  });

  it('should handle adding a blank row and canceling', browser => {
    const initialRowCount = browser.elements('css selector', '#smart-table tbody tr').length;
    
    browser
      .click('#add')
      .waitForElementVisible('.table__inline-edit-form', 1000)
      .click('.table__inline-edit-form button:nth-child(2)') // Cancel
      .waitForElementNotPresent('.table__inline-edit-form', 1000);
    
    browser.elements('css selector', '#smart-table tbody tr', function(result) {
      this.assert.equal(result.value.length, initialRowCount, 'No row should be added when canceled');
    });
  });

  it('should validate integer input', browser => {
    browser
      .click('#add')
      .waitForElementVisible('.table__inline-edit-form', 1000)
      .setValue('input[name="field1"]', 'not-a-number')
      .click('.table__inline-edit-form button:first-child') // Save
      .waitForElementNotPresent('.table__inline-edit-form', 1000);
    
    browser.execute(function() {
      // Get the last row's parsed data
      return window.table.get_values().pop().field1;
    }, [], function(result) {
      // HTML number inputs will convert invalid values to 0 or empty string
      this.assert.ok(typeof result.value === 'number', 'Non-numeric input should be converted to a number');
    });
  });

  it('should handle rapid multiple operations', browser => {
    browser.execute(function() {
      window.table.reset();
      
      // Add multiple rows in sequence
      window.table.add_row({
        'index': 1,
        'uid': 'rapid-1',
        'field1': 111,
        'field2': 1.1,
        'field3': true,
        'field4': 'Rapid row 1',
        'field5': '1'
      });
      
      window.table.add_row({
        'index': 2,
        'uid': 'rapid-2',
        'field1': 222,
        'field2': 2.2,
        'field3': false,
        'field4': 'Rapid row 2',
        'field5': '2'
      });
      
      window.table.add_row({
        'index': 3,
        'uid': 'rapid-3',
        'field1': 333,
        'field2': 3.3,
        'field3': true,
        'field4': 'Rapid row 3',
        'field5': '3'
      });
      
      return document.querySelectorAll('#smart-table tbody tr').length;
    }, [], function(result) {
      this.assert.strictEqual(result.value, 3, 'All rows should be added correctly');
    });
    
    // Now delete rows rapidly
    browser.execute(function() {
      // Delete first row
      document.querySelector('#smart-table tbody tr:nth-child(1) td:last-child button:nth-child(2)').click();
      document.querySelector('.dialog__button-yes').click();
      
      // Try to immediately delete another row before the first deletion completes
      setTimeout(() => {
        if (document.querySelector('#smart-table tbody tr:nth-child(1)')) {
          document.querySelector('#smart-table tbody tr:nth-child(1) td:last-child button:nth-child(2)').click();
          if (document.querySelector('.dialog__button-yes')) {
            document.querySelector('.dialog__button-yes').click();
          }
        }
      }, 50);
      
      return true;
    }, []);
    
    // Wait for operations to complete
    browser.pause(500);
    
    browser.elements('css selector', '#smart-table tbody tr', function(result) {
      this.assert.ok(result.value.length < 3, 'Rows should be deleted');
    });
  });
});