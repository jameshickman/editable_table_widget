describe('Smart Table Custom Commands Tests', function() {
  before(browser => {
    browser
      .url('http://localhost:8080/tests/test.html')
      .waitForElementVisible('body', 1000);
  });

  after(browser => {
    browser.end();
  });

  it('should reset the table for testing', browser => {
    browser.execute(function() {
      window.table.reset();
      return true;
    }, [], function() {
      // Continue with tests
    });
  });

  it('should add rows using custom command', browser => {
    browser
      .addTableRow({
        field1: 101,
        field2: 1.01,
        field3: true,
        field4: 'First custom row',
        field5: '1'
      })
      .addTableRow({
        field1: 202,
        field2: 2.02,
        field3: false,
        field4: 'Second custom row',
        field5: '2'
      })
      .getTableData(function(data) {
        this.assert.strictEqual(data.length, 2, 'Table should have 2 rows');
        this.assert.strictEqual(data[0].field1, 101, 'First row should have correct integer value');
        this.assert.strictEqual(data[1].field4, 'Second custom row', 'Second row should have correct text value');
      });
  });

  it('should edit rows using custom command', browser => {
    browser
      .editTableRow(1, {
        field1: 555,
        field4: 'Edited row text'
      })
      .getTableData(function(data) {
        this.assert.strictEqual(data[0].field1, 555, 'Row should be edited with new integer value');
        this.assert.strictEqual(data[0].field4, 'Edited row text', 'Row should be edited with new text value');
      });
  });

  it('should delete rows using custom command', browser => {
    browser
      .deleteTableRow(2, true) // Delete second row with confirmation
      .getTableData(function(data) {
        this.assert.strictEqual(data.length, 1, 'Table should have 1 row after deletion');
      });
  });

  it('should cancel deletion using custom command', browser => {
    browser
      .deleteTableRow(1, false) // Cancel deletion of first row
      .getTableData(function(data) {
        this.assert.strictEqual(data.length, 1, 'Table should still have 1 row after canceled deletion');
      });
  });

  it('should perform multiple operations in sequence', browser => {
    browser
      .addTableRow({
        field1: 777,
        field2: 7.77,
        field3: true,
        field4: 'New row for sequence test',
        field5: '3'
      })
      .editTableRow(2, {
        field4: 'Edited sequence test'
      })
      .getTableData(function(data) {
        this.assert.strictEqual(data.length, 2, 'Table should have 2 rows');
        this.assert.strictEqual(data[1].field4, 'Edited sequence test', 'Row should be edited correctly');
      });
  });
});