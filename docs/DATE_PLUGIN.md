# Date Plugin for Smart Table

## Overview

The Date Plugin provides a date input field using the HTML5 date picker in Smart Table. Users can select dates using the native calendar interface, and the plugin handles date formatting and validation.

## Features

- HTML5 date picker with native calendar interface
- Optional time selection (datetime-local)
- Configurable date range limits
- Proper date formatting for display and storage
- Validation for invalid dates

## Installation

1. Include the plugin script in your HTML:
```html
<script src="./js/plugins/date-plugin.js" type="module"></script>
```

2. Include the plugin CSS:
```html
<link rel="stylesheet" href="css/date-plugin.css" />
```

## Configuration

The Date Plugin accepts the following configuration options:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `dateFormat` | String | No | 'YYYY-MM-DD' | Expected date format (currently only YYYY-MM-DD is used internally) |
| `minDate` | String | No | '' | Minimum allowed date (YYYY-MM-DD format) |
| `maxDate` | String | No | '' | Maximum allowed date (YYYY-MM-DD format) |
| `includeTime` | Boolean | No | false | Whether to include time picker (uses datetime-local instead of date) |

## Usage

### Basic Setup

```javascript
import EditableTable from './js/ediable_table.js';
import DatePlugin from './js/plugins/date-plugin.js';

// Create a date plugin instance
const datePlugin = new DatePlugin({
    minDate: '2020-01-01',
    maxDate: '2030-12-31'
});

// Initialize table with date plugin
const table = new EditableTable(
    document.getElementById('my-table'),
    saveCallback,
    deleteCallback,
    {
        "fields": {
            "birthDate": {
                plugin: datePlugin  // Register the plugin instance
            }
        }
    }
);
```

### HTML Table Structure

Mark columns that should use the date plugin with `data-type="date"`:

```html
<table id="my-table">
    <thead>
        <tr>
            <th data-type="index" data-name="id">ID</th>
            <th data-type="text" data-name="name">Name</th>
            <th data-type="date" data-name="birthDate">Birth Date</th>
            <th data-type="text" data-name="notes">Notes</th>
        </tr>
    </thead>
    <tbody>
        <!-- Rows will be populated by Smart Table -->
    </tbody>
</table>
```

### Advanced Configuration

```javascript
const advancedDatePlugin = new DatePlugin({
    minDate: '2023-01-01',
    maxDate: '2025-12-31',
    includeTime: true  // Use datetime-local for date and time
});
```

## Data Format

The plugin stores dates in standard ISO format:
- Without time: `YYYY-MM-DD` (e.g., "2023-12-25")
- With time: Full ISO string (e.g., "2023-12-25T14:30:00.000Z")

When using `get_values()`, dates are returned in the appropriate format based on the `includeTime` configuration.

## Display Behavior

### Edit Mode
- Shows HTML5 date/time picker input
- Respects min/max date constraints
- Shows current date value if exists

### Display Mode
- Shows formatted date (e.g., "Dec 25, 2023")
- Shows formatted date and time if `includeTime` is true (e.g., "Dec 25, 2023, 2:30 PM")
- Shows "(No date)" for empty cells
- Shows "(Invalid date)" for malformed date values

## Browser Compatibility

The plugin relies on HTML5 date input types:
- Modern browsers (Chrome, Firefox, Edge, Safari) support date pickers
- On unsupported browsers, falls back to text input
- Always validates and stores dates in standard format regardless of UI

## Integration with Smart Table

The date plugin integrates seamlessly with Smart Table's existing functionality:
- Works with all CRUD operations
- Compatible with `get_values()` and `set_rows()` methods
- Supports row editing and creation
- Maintains data integrity during save operations