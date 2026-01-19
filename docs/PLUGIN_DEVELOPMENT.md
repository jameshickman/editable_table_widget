# Plugin Development Guide for Smart Table

## Overview

Smart Table supports custom field types through a plugin system. Plugins allow you to extend the functionality of table fields beyond the built-in types (int, float, bool, text, select, etc.).

## Plugin Interface

All plugins must extend the `Plugin` base class and implement four required methods:

1. `createEditElement(fieldName, currentValue)` - Create the form element for editing mode
2. `decodeValue(cellElement)` - Extract the data value from a display cell
3. `saveValue(editCellElement, displayCellElement)` - Save the edited value back to display mode
4. `renderDisplay(value)` - Render the display mode HTML for a value

## Creating a Custom Plugin

### Basic Plugin Structure

```javascript
import Plugin from './plugin-base.js';

class MyCustomPlugin extends Plugin {
    constructor(config = {}) {
        super(config);
        // Store configuration
        this.config = {
            // Default values
            ...config
        };
    }

    createEditElement(fieldName, currentValue) {
        // Create and return the edit control element
        const container = document.createElement('div');
        // Add your custom UI elements here
        return container;
    }

    decodeValue(cellElement) {
        // Extract and return the data value from the cell
        return cellElement.textContent;
    }

    saveValue(editCellElement, displayCellElement) {
        // Process the edited value and return display/value pair
        const newValue = /* extract from editElement */;
        return {
            display: this.renderDisplay(newValue),
            value: newValue
        };
    }

    renderDisplay(value) {
        // Return HTML string for display mode
        return `<span>${value}</span>`;
    }
}

export default MyCustomPlugin;
```

### Using Your Plugin

To use your custom plugin in a Smart Table:

```javascript
import EditableTable from './js/ediable_table.js';
import MyCustomPlugin from './js/plugins/my-custom-plugin.js';

// Create plugin instance
const myPlugin = new MyCustomPlugin({
    // Configuration options
});

// Initialize table with plugin
const table = new EditableTable(
    document.getElementById('my-table'),
    saveCallback,
    deleteCallback,
    {
        "fields": {
            "myColumn": {
                plugin: myPlugin  // Register the plugin instance
            }
        }
    }
);
```

## Plugin Configuration

Plugins can accept configuration options through their constructor:

```javascript
const myPlugin = new MyCustomPlugin({
    option1: 'value1',
    option2: 'value2'
});
```

Store configuration in the constructor and use it in your plugin methods.

## Best Practices

1. **Validate Required Methods**: The base class will ensure you implement all required methods
2. **Handle Edge Cases**: Account for null/undefined values in your methods
3. **Clean Up Resources**: Override the `destroy()` method if your plugin needs cleanup
4. **Follow Naming Conventions**: Use PascalCase for plugin class names (e.g., `DatePickerPlugin`)
5. **Provide Defaults**: Always provide sensible defaults for configuration options
6. **Error Handling**: Implement proper error handling, especially for async operations
7. **Security**: Sanitize user input and validate file types when handling uploads/downloads

## Built-in Plugin Examples

Check out the `FilePlugin` implementation in `js/plugins/file-plugin.js` for a complete example of a complex plugin with modal UI and file upload functionality.