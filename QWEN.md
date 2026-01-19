# Smart Table Project Documentation

## Overview
Smart Table is a lightweight JavaScript library for creating editable HTML tables with inline CRUD (Create, Read, Update, Delete) operations. It allows users to edit table data directly in the browser and provides callbacks for saving and deleting operations.

## Project Structure
```
/home/telendry/code/smart_table/
├── edit-table.png              # Screenshot for README
├── FEATURE_FILE_PLUGIN.md      # Feature file plugin documentation
├── IMPLEMENTATION_PLAN.md      # Implementation plan
├── index.html                  # Example implementation
├── LICENSE                     # License file
├── nightwatch.conf.js          # Nightwatch test configuration
├── package.json                # Package configuration
├── README.md                   # Main project documentation
├── css/
│   └── styles.css              # Table styling
├── js/
│   └── ediable_table.js        # Main library code
└── tests/
    ├── README.md               # Test documentation
    ├── run-tests.sh            # Test runner script
    ├── setup.js                # Test setup
    ├── test.html               # Test HTML file
    ├── nightwatch/             # Nightwatch test files
    └── screenshots/            # Test screenshots
```

## Key Features
- Create, read, update, and delete operations on table rows
- Support for various data types:
  - Integer
  - Float
  - Boolean (checkbox)
  - Text
  - Select (dropdown)
- Custom callbacks for save and delete operations
- Configurable labels and messages
- Row ID override capability (useful for integrating with backend systems)
- Ability to dynamically populate table data

## Main Components

### JavaScript Library (`js/ediable_table.js`)
The core functionality of the Smart Table is contained in this file. It exports an `EditableTable` class that handles all the CRUD operations and UI interactions.

### Styles (`css/styles.css`)
Contains the styling for the editable table, including edit modes, buttons, and form elements.

### Example Implementation (`index.html`)
Demonstrates how to use the Smart Table library with sample data and event handlers.

## API Reference

### Constructor
```javascript
new EditableTable(element, saveCallback, deleteCallback, config)
```
- `element`: HTML table element
- `saveCallback`: Function called when a row is saved `(is_new, index, data) => {}`
- `deleteCallback`: Function called when a row is deleted `(index) => {}`
- `config`: Configuration object for field definitions and labels

### Available Methods
- `build_edit_buttons()`: Creates edit and delete buttons for each row
- `reset()`: Resets and empties the table
- `override_id(old_id, new_id, updates)`: Replaces row ID and optionally updates other columns
- `set_labels(edit, delete, confirmation, save, cancel, yes, no)`: Sets button labels and confirmation message
- `set_yes_no(field, yes_label, no_label)`: Sets labels for a boolean field
- `set_select_options(field, options)`: Sets options for a select field
- `add_row(row)`: Adds a row to the end of the table
- `new_row()`: Adds a new row and opens it in edit mode
- `set_rows(rows)`: Populates the table with an array of row objects
- `get_values()`: Returns an array of objects with the table data
- `set_edit_callbacks(startCallback, endCallback)`: Sets callbacks for edit mode start and end

## Usage Example
```html
<table id="smart-table">
    <thead>
        <tr>
            <th data-type="index" data-name="index">Row index</th>
            <th data-type="" data-name="uid">UUID</th>
            <th data-type="int" data-name="field1">Integer</th>
            <th data-type="float" data-name="field2">Floating point</th>
            <th data-type="bool" data-name="field3">Boolean</th>
            <th data-type="text" data-name="field4">Text line</th>
            <th data-type="select" data-name="field5">Select</th>
        </tr>
    </thead>
    <tbody>
        <!-- Table rows will be added here -->
    </tbody>
</table>
```

```javascript
import EditableTable from './js/ediable_table.js'

const table = new EditableTable(
    document.getElementById('smart-table'),
    (is_new, index, data) => {
        // Callback when a row is saved
        console.log(index);
        console.log(data);
    },
    (index) => {
        // Callback when a row is deleted
        console.log(index);
    },
    {
        "fields": {
            "field3": {
                "labels": {
                    "true": "Yes",
                    "false": "No"
                }
            },
            "field5": {
                "options": {
                    "1": "First",
                    "2": "Second",
                    "3": "Third"
                }
            }
        }
    }
);
```

## Testing
The project uses Nightwatch for testing. Available test scripts:
- `npm run test`: Run all tests
- `npm run test:chrome`: Run tests in Chrome
- `npm run test:firefox`: Run tests in Firefox
- `npm run test:single`: Run a specific test
- `npm run test:visual`: Run visual tests
- `npm run test:unit`: Run unit tests
- `npm run test:basic`: Run basic smart table tests

## Development
- Use `npm run serve` to start a local server for development
- Tests can be run with the scripts mentioned above

## License
This project is licensed under the MIT License.