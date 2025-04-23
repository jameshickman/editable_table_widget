describe('EditableTable Unit Tests', function() {
  before(browser => {
    browser
      .url('http://localhost:8080/tests/test.html')
      .waitForElementVisible('body', 1000);
  });

  after(browser => {
    browser.end();
  });

  it('should correctly initialize with configuration', browser => {
    browser.execute(function() {
      return typeof window.table;
    }, [], function(result) {
      this.assert.strictEqual(result.value, 'object', 'Table instance should be created');
    });
  });

  it('should create edit buttons for existing rows', browser => {
    browser
      .assert.elementPresent('#smart-table tbody tr:nth-child(1) td:last-child button:first-child')
      .assert.elementPresent('#smart-table tbody tr:nth-child(1) td:last-child button:nth-child(2)')
      .assert.textEquals('#smart-table tbody tr:nth-child(1) td:last-child button:first-child', 'Edit')
      .assert.textEquals('#smart-table tbody tr:nth-child(1) td:last-child button:nth-child(2)', 'Delete');
  });

  it('should reset the table', browser => {
    browser.execute(function() {
      window.table.reset();
      return document.querySelectorAll('#smart-table tbody tr').length;
    }, [], function(result) {
      this.assert.strictEqual(result.value, 0, 'Table should be empty after reset');
    });
  });

  it('should set and retrieve rows with different data types', browser => {
    browser.execute(function() {
      const tableData = [
        {
          'index': 1,
          'uid': '123e4567-e89b-12d3-a456-426614174000',
          'field1': 111,
          'field2': 1.111,
          'field3': true,
          'field4': 'Unit test text',
          'field5': '1'
        },
        {
          'index': 2,
          'uid': '123e4567-e89b-12d3-a456-426614174001',
          'field1': 222,
          'field2': 2.222,
          'field3': false,
          'field4': 'Another test text',
          'field5': '3'
        }
      ];
      
      window.table.set_rows(tableData);
      return window.table.get_values();
    }, [], function(result) {
      const rows = result.value;
      this.assert.strictEqual(rows.length, 2, 'Table should have two rows');
      this.assert.strictEqual(rows[0].field1, 111, 'Integer value should be correctly parsed');
      this.assert.strictEqual(rows[0].field3, true, 'Boolean value should be correctly parsed');
      this.assert.strictEqual(rows[1].field4, 'Another test text', 'Text value should be correctly stored');
      this.assert.strictEqual(rows[1].field5, '3', 'Select value should be correctly stored');
    });
  });

  it('should test the override_id method', browser => {
    browser.execute(function() {
      window.table.override_id(1, 100, {
        'uid': 'test-uuid-override',
        'field4': 'Overridden text'
      });
      return window.table.get_values();
    }, [], function(result) {
      const rows = result.value;
      this.assert.strictEqual(rows[0].index, 100, 'Row index should be overridden');
      this.assert.strictEqual(rows[0].uid, 'test-uuid-override', 'UUID should be overridden');
      this.assert.strictEqual(rows[0].field4, 'Overridden text', 'Text field should be overridden');
    });
  });

  it('should test setting custom labels', browser => {
    browser.execute(function() {
      window.table.set_labels(
        'Custom Edit', 
        'Custom Delete', 
        'Custom confirm message',
        'Custom Save',
        'Custom Cancel',
        'Custom Yes',
        'Custom No'
      );
      
      // Click delete to see the confirmation dialog
      document.querySelector('#smart-table tbody tr:nth-child(1) td:last-child button:nth-child(2)').click();
      
      return {
        editText: document.querySelector('#smart-table tbody tr:nth-child(1) td:last-child button:first-child').innerText,
        deleteText: document.querySelector('#smart-table tbody tr:nth-child(1) td:last-child button:nth-child(2)').innerText,
        confirmText: document.querySelector('div[style*="position: fixed"] p').innerText,
        yesText: document.querySelector('.dialog__button-yes').innerText,
        noText: document.querySelector('.dialog__button-no').innerText
      };
    }, [], function(result) {
      this.assert.strictEqual(result.value.editText, 'Custom Edit', 'Edit button text should be customized');
      this.assert.strictEqual(result.value.deleteText, 'Custom Delete', 'Delete button text should be customized');
      this.assert.strictEqual(result.value.confirmText, 'Custom confirm message', 'Confirmation message should be customized');
      this.assert.strictEqual(result.value.yesText, 'Custom Yes', 'Yes button text should be customized');
      this.assert.strictEqual(result.value.noText, 'Custom No', 'No button text should be customized');
      
      // Close the dialog
      browser.click('.dialog__button-no');
    });
  });

  it('should test set_yes_no method for boolean labels', browser => {
    browser.execute(function() {
      window.table.set_yes_no('field3', 'Custom Yes', 'Custom No');
      
      // Edit the first row and toggle the boolean field
      document.querySelector('#smart-table tbody tr:nth-child(1) td:last-child button:first-child').click();
      const checkbox = document.querySelector('input[name="field3"]');
      checkbox.checked = true;
      document.querySelector('.table__inline-edit-form button:first-child').click(); // Save
      
      return document.querySelector('#smart-table tbody tr:nth-child(1) td:nth-child(5)').innerText;
    }, [], function(result) {
      this.assert.strictEqual(result.value, 'Custom Yes', 'Boolean label should be customized');
    });
  });

  it('should test set_select_options method', browser => {
    browser.execute(function() {
      window.table.set_select_options('field5', {
        'A': 'Option A',
        'B': 'Option B',
        'C': 'Option C'
      });
      
      // Edit the first row and select a new option
      document.querySelector('#smart-table tbody tr:nth-child(1) td:last-child button:first-child').click();
      
      // Check if select options have been updated
      const select = document.querySelector('select[name="field5"]');
      const options = Array.from(select.options).map(opt => ({ 
        value: opt.value, 
        text: opt.innerText 
      }));
      
      // Cancel the edit
      document.querySelector('.table__inline-edit-form button:nth-child(2)').click();
      
      return options;
    }, [], function(result) {
      const options = result.value;
      this.assert.strictEqual(options.length, 3, 'Should have 3 select options');
      this.assert.strictEqual(options[0].value, 'A', 'First option value should be A');
      this.assert.strictEqual(options[0].text, 'Option A', 'First option text should be Option A');
      this.assert.strictEqual(options[2].value, 'C', 'Last option value should be C');
    });
  });

  it('should test add_row method', browser => {
    browser.execute(function() {
      const initialRowCount = document.querySelectorAll('#smart-table tbody tr').length;
      
      window.table.add_row({
        'index': 3,
        'uid': 'added-row-uuid',
        'field1': 333,
        'field2': 3.333,
        'field3': true,
        'field4': 'Added row text',
        'field5': 'B'
      });
      
      const newRowCount = document.querySelectorAll('#smart-table tbody tr').length;
      const newRowData = window.table.get_values().pop();
      
      return {
        initialRowCount,
        newRowCount,
        newRowData
      };
    }, [], function(result) {
      this.assert.strictEqual(result.value.newRowCount, result.value.initialRowCount + 1, 'A row should be added');
      this.assert.strictEqual(result.value.newRowData.field1, 333, 'New row data should be correctly added');
      this.assert.strictEqual(result.value.newRowData.field4, 'Added row text', 'Text field should be correct');
    });
  });
});