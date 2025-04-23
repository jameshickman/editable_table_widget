/**
 * Custom Nightwatch commands for Smart Table testing
 */

module.exports = {
  /**
   * Adds a new row to the table with the provided values
   * 
   * @param {Object} rowData - Object containing the data for the new row
   * @param {Function} callback - Optional callback function
   * @returns {Object} The Nightwatch browser instance for chaining
   */
  addTableRow: function(rowData, callback) {
    const browser = this;
    
    browser
      .click('#add')
      .waitForElementVisible('.table__inline-edit-form', 1000);
    
    if (rowData.field1 !== undefined) {
      browser
        .clearValue('input[name="field1"]')
        .setValue('input[name="field1"]', rowData.field1);
    }
    
    if (rowData.field2 !== undefined) {
      browser
        .clearValue('input[name="field2"]')
        .setValue('input[name="field2"]', rowData.field2);
    }
    
    if (rowData.field3 !== undefined) {
      const checkbox = browser.element('css selector', 'input[name="field3"]');
      browser.execute(function(checkbox, value) {
        document.querySelector('input[name="field3"]').checked = value;
      }, [checkbox, rowData.field3]);
    }
    
    if (rowData.field4 !== undefined) {
      browser
        .clearValue('input[name="field4"]')
        .setValue('input[name="field4"]', rowData.field4);
    }
    
    if (rowData.field5 !== undefined) {
      browser.click(`select[name="field5"] option[value="${rowData.field5}"]`);
    }
    
    browser
      .click('.table__inline-edit-form button:first-child') // Save
      .waitForElementNotPresent('.table__inline-edit-form', 1000);
    
    if (typeof callback === 'function') {
      callback.call(browser);
    }
    
    return browser;
  },
  
  /**
   * Edits a row at the specified index with the provided values
   * 
   * @param {Number} rowIndex - The 1-based index of the row to edit 
   * @param {Object} rowData - Object containing the data to edit
   * @param {Function} callback - Optional callback function
   * @returns {Object} The Nightwatch browser instance for chaining
   */
  editTableRow: function(rowIndex, rowData, callback) {
    const browser = this;
    
    browser
      .click(`#smart-table tbody tr:nth-child(${rowIndex}) td:last-child button:first-child`)
      .waitForElementVisible('.table__inline-edit-form', 1000);
    
    if (rowData.field1 !== undefined) {
      browser
        .clearValue('input[name="field1"]')
        .setValue('input[name="field1"]', rowData.field1);
    }
    
    if (rowData.field2 !== undefined) {
      browser
        .clearValue('input[name="field2"]')
        .setValue('input[name="field2"]', rowData.field2);
    }
    
    if (rowData.field3 !== undefined) {
      const checkbox = browser.element('css selector', 'input[name="field3"]');
      browser.execute(function(checkbox, value) {
        document.querySelector('input[name="field3"]').checked = value;
      }, [checkbox, rowData.field3]);
    }
    
    if (rowData.field4 !== undefined) {
      browser
        .clearValue('input[name="field4"]')
        .setValue('input[name="field4"]', rowData.field4);
    }
    
    if (rowData.field5 !== undefined) {
      browser.click(`select[name="field5"] option[value="${rowData.field5}"]`);
    }
    
    browser
      .click('.table__inline-edit-form button:first-child') // Save
      .waitForElementNotPresent('.table__inline-edit-form', 1000);
    
    if (typeof callback === 'function') {
      callback.call(browser);
    }
    
    return browser;
  },
  
  /**
   * Deletes a row at the specified index
   * 
   * @param {Number} rowIndex - The 1-based index of the row to delete
   * @param {Boolean} confirm - Whether to confirm or cancel the deletion
   * @param {Function} callback - Optional callback function
   * @returns {Object} The Nightwatch browser instance for chaining
   */
  deleteTableRow: function(rowIndex, confirm, callback) {
    const browser = this;
    
    browser
      .click(`#smart-table tbody tr:nth-child(${rowIndex}) td:last-child button:nth-child(2)`)
      .waitForElementVisible(confirm ? '.dialog__button-yes' : '.dialog__button-no', 1000)
      .click(confirm ? '.dialog__button-yes' : '.dialog__button-no')
      .waitForElementNotPresent('div[style*="position: fixed"]', 1000);
    
    if (typeof callback === 'function') {
      callback.call(browser);
    }
    
    return browser;
  },
  
  /**
   * Gets the current data from the table
   * 
   * @param {Function} callback - Callback function with table data
   * @returns {Object} The Nightwatch browser instance for chaining
   */
  getTableData: function(callback) {
    const browser = this;
    
    browser.execute(function() {
      return window.table.get_values();
    }, [], function(result) {
      callback.call(browser, result.value);
    });
    
    return browser;
  }
};