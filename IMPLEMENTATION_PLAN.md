# Implementation Plan: File Column Plugin for Smart Table

## Overview

This document outlines the implementation plan for adding a plugin system to Smart Table with a file upload/download plugin as the first implementation.

## Current Architecture Analysis

The Smart Table library currently supports these field types:
- `index`: Row index (read-only in edit mode)
- `int`: Integer input
- `float`: Floating point input
- `bool`: Checkbox
- `text`: Text input
- `select`: Dropdown select
- Default: Read-only span

Field behavior is defined through:
1. `data-type` attribute on `<th>` elements
2. Configuration passed to constructor (`config.fields`)
3. Methods like `#build_form_element()` that create appropriate input controls

## Implementation Strategy

### Phase 1: Plugin Architecture

#### 1.1 Create Base Plugin Class

**Goal**: Extend the library to support custom field type plugins through an object-oriented plugin system.

**Create new file: `js/plugin-base.js`**:

```javascript
/**
 * Base class for EditableTable plugins.
 * All plugins must extend this class and implement the abstract methods.
 */
class Plugin {
    #config;

    /**
     * @param {Object} config - Plugin-specific configuration
     */
    constructor(config = {}) {
        this.#config = config;

        // Validate that subclass implements required methods
        if (this.constructor === Plugin) {
            throw new Error("Plugin is an abstract class and cannot be instantiated directly");
        }

        const requiredMethods = ['createEditElement', 'decodeValue', 'saveValue', 'renderDisplay'];
        for (const method of requiredMethods) {
            if (this[method] === Plugin.prototype[method]) {
                throw new Error(`Plugin subclass must implement ${method}()`);
            }
        }
    }

    /**
     * Get plugin configuration
     * @returns {Object}
     */
    getConfig() {
        return this.#config;
    }

    /**
     * Create the form element for editing mode
     * @param {string} fieldName - The field name
     * @param {any} currentValue - The current value to display
     * @returns {HTMLElement} - The edit control element
     */
    createEditElement(fieldName, currentValue) {
        throw new Error("createEditElement() must be implemented by plugin subclass");
    }

    /**
     * Extract the data value from a display cell element
     * @param {HTMLElement} cellElement - The table cell in display mode
     * @returns {any} - The data value
     */
    decodeValue(cellElement) {
        throw new Error("decodeValue() must be implemented by plugin subclass");
    }

    /**
     * Save the edited value from edit mode back to display mode
     * @param {HTMLElement} editCellElement - The table cell in edit mode
     * @param {HTMLElement} displayCellElement - The table cell to update for display
     * @returns {Object} - { display: string (HTML), value: any (data) }
     */
    saveValue(editCellElement, displayCellElement) {
        throw new Error("saveValue() must be implemented by plugin subclass");
    }

    /**
     * Render the display mode HTML for a value
     * @param {any} value - The data value to display
     * @returns {string} - HTML string for display
     */
    renderDisplay(value) {
        throw new Error("renderDisplay() must be implemented by plugin subclass");
    }

    /**
     * Optional: Get the plugin's custom data type identifier
     * By default returns the class name in lowercase
     * @returns {string}
     */
    getTypeName() {
        return this.constructor.name.toLowerCase().replace('plugin', '');
    }

    /**
     * Optional: Cleanup method called when table is destroyed
     */
    destroy() {
        // Override if cleanup is needed
    }
}

export default Plugin;
```

#### 1.2 Modify EditableTable to Support Plugin Instances

**Changes to `js/ediable_table.js`**:

1. Import the Plugin base class:
   ```javascript
   import Plugin from './plugin-base.js';
   ```

2. Modify `#build_form_element()` to check for plugin instance in field config:
   ```javascript
   #build_form_element(idx, values) {
       const d_type = this.#els_table_headers[idx].dataset['type'];
       const d_name = this.#els_table_headers[idx].dataset['name'];
       let el_input = null;

       // Check if field has a plugin instance
       if (this.#fields[d_name] && this.#fields[d_name].plugin instanceof Plugin) {
           return this.#fields[d_name].plugin.createEditElement(d_name, values[idx]);
       }

       // Existing switch statement for built-in types...
       switch (d_type) {
           case 'int':
               // ... existing code
   ```

3. Modify `#decode_row()` to use plugin instance:
   ```javascript
   #decode_row(el_row) {
       let values = {};
       for (let i = 0; i < this.#els_table_headers.length; i++) {
           const d_type = this.#els_table_headers[i].dataset['type'];
           const d_name = this.#els_table_headers[i].dataset['name'];

           // Check if field has a plugin instance
           if (this.#fields[d_name] && this.#fields[d_name].plugin instanceof Plugin) {
               values[d_name] = this.#fields[d_name].plugin.decodeValue(el_row.children[i]);
               continue;
           }

           // Existing switch statement...
           switch (d_type) {
               // ... existing code
   ```

4. Modify `#save_row()` to use plugin instance:
   ```javascript
   #save_row() {
       let index = 0;
       let payload = {};
       const els_cells = this.#el_edit_form.querySelectorAll("td");
       for (let i = 0 ; i < this.#els_table_headers.length; i++) {
           const d_type = this.#els_table_headers[i].dataset['type'];
           const d_name = this.#els_table_headers[i].dataset['name'];

           // Check if field has a plugin instance
           if (this.#fields[d_name] && this.#fields[d_name].plugin instanceof Plugin) {
               const result = this.#fields[d_name].plugin.saveValue(
                   this.#el_edit_form.children[i],
                   this.#el_active_row.children[i]
               );
               this.#el_active_row.children[i].innerHTML = result.display;
               payload[d_name] = result.value;
               continue;
           }

           // Existing switch statement...
           switch(d_type) {
               // ... existing code
   ```

5. Modify `set_rows()` to use plugin instance for display:
   ```javascript
   set_rows(rows) {
       this.#empty();
       for (let i = 0; i < rows.length; i++) {
           const el_row = document.createElement('TR');
           for (let j = 0; j < this.#els_table_headers.length; j++) {
               const el_cell = document.createElement('TD');
               const d_type = this.#els_table_headers[j].dataset['type'];
               const d_name = this.#els_table_headers[j].dataset['name'];

               // Check if field has a plugin instance
               if (this.#fields[d_name] && this.#fields[d_name].plugin instanceof Plugin) {
                   el_cell.innerHTML = this.#fields[d_name].plugin.renderDisplay(rows[i][d_name]);
                   el_row.appendChild(el_cell);
                   continue;
               }

               // Existing switch statement...
               switch(d_type) {
                   // ... existing code
   ```

6. Add cleanup in destructor (if table has one, or add one):
   ```javascript
   destroy() {
       // Cleanup all plugins
       for (const fieldName in this.#fields) {
           if (this.#fields[fieldName].plugin instanceof Plugin) {
               this.#fields[fieldName].plugin.destroy();
           }
       }
   }
   ```

**Plugin Architecture Benefits**:

- **Encapsulation**: Each plugin instance has its own configuration and state
- **Flexibility**: Multiple fields can use different instances of the same plugin with different configs
- **Type Safety**: Plugin base class enforces implementation of required methods
- **Cleaner API**: Plugin instance is passed directly in field configuration
- **Testability**: Easy to mock and test plugin instances
- **Extensibility**: Plugins can add custom methods beyond the base interface

### Phase 2: File Plugin Implementation

**Goal**: Create a fully functional file upload/download plugin with modal UI and progress tracking.

#### 2.1 Create Plugin File Structure

Create new file: `js/plugins/file-plugin.js`

#### 2.2 File Plugin Core Implementation

**File structure**:
```
js/
  plugins/
    file-plugin.js          # Main plugin implementation
```

**Plugin Features**:

1. **Display Mode**:
   - Show filename as clickable download link
   - Show "(No file)" if empty
   - Format: `<a href="{downloadUrl}" download>{filename}</a>`

2. **Edit Mode**:
   - Show button: "Choose File..." or "Change File..."
   - Show current filename if exists
   - Button opens modal on click

3. **Upload Modal**:
   - File input element
   - Upload button
   - Progress bar (0-100%)
   - Cancel button
   - Close on successful upload
   - Error message display area

4. **Upload Process**:
   - Read file using FileReader API (for preview if needed)
   - Create FormData with file
   - Add JWT to Authorization header if provided
   - Use XMLHttpRequest for upload with progress events
   - Expect JSON response: `{ "url": "download-url", "filename": "original-name.ext" }`
   - Update cell with download link

#### 2.3 Modal UI Component

**Modal HTML Structure**:
```html
<div class="file-plugin-modal">
  <div class="file-plugin-modal__backdrop"></div>
  <div class="file-plugin-modal__content">
    <h3>Upload File</h3>
    <div class="file-plugin-modal__body">
      <input type="file" id="file-input" />
      <div class="file-plugin-modal__progress" style="display: none;">
        <div class="file-plugin-modal__progress-bar"></div>
        <div class="file-plugin-modal__progress-text">0%</div>
      </div>
      <div class="file-plugin-modal__error" style="display: none;"></div>
    </div>
    <div class="file-plugin-modal__actions">
      <button class="file-plugin-modal__upload">Upload</button>
      <button class="file-plugin-modal__cancel">Cancel</button>
    </div>
  </div>
</div>
```

#### 2.4 CSS Styling

Create: `css/file-plugin.css`

Styles needed:
- Modal backdrop (fixed, overlay, semi-transparent)
- Modal content (centered, white background, shadow)
- Progress bar container and fill
- Button styling consistent with Smart Table
- Error message styling (red background)

#### 2.5 Field Configuration

**Usage in table HTML**:
```html
<th data-type="file" data-name="attachment">File Attachment</th>
```

**Plugin Configuration**:

The FilePlugin constructor accepts a configuration object:

```javascript
const filePlugin = new FilePlugin({
    uploadUrl: "/api/upload",                    // Required: Upload endpoint URL
    jwt: "eyJhbGc...",                           // Optional: JWT token for authentication
    maxFileSize: 10485760,                       // Optional: Max file size in bytes (default 10MB)
    allowedTypes: ["image/*", "application/pdf"], // Optional: Allowed MIME types (default: all)
    downloadUrlField: "url",                     // Optional: JSON field for download URL (default: "url")
    filenameField: "filename"                    // Optional: JSON field for filename (default: "filename")
});
```

**Table Configuration**:

Pass the plugin instance in the fields configuration:

```javascript
const table = new EditableTable(
    document.getElementById('my-table'),
    saveCallback,
    deleteCallback,
    {
        "fields": {
            "attachment": {
                plugin: filePlugin  // Plugin instance
            }
        }
    }
);
```

**Note**: The `data-type` attribute in the HTML can be anything (like "file") or even empty - the presence of the `plugin` property in the field configuration takes precedence over the data-type attribute.

### Phase 3: Testing Harness

**Goal**: Provide a complete testing environment with backend services.

#### 3.1 Express Test Server

Create: `test-server/server.js`

**Features**:
1. Static file serving for the Smart Table library
2. File upload endpoint with progress support
3. File download endpoint
4. Optional JWT validation middleware
5. File storage in `test-server/uploads/` directory

**Endpoints**:

```
POST /api/upload
- Accepts: multipart/form-data
- Optional Header: Authorization: Bearer {jwt}
- Returns: { "url": "/api/download/{fileId}", "filename": "original.ext" }
- Saves file with unique ID

GET /api/download/:fileId
- Optional Header: Authorization: Bearer {jwt}
- Returns: File with appropriate content-type
- Supports download attribute
```

**Dependencies**:
- express
- multer (for file upload handling)
- uuid (for generating file IDs)
- jsonwebtoken (for JWT validation, optional)

**Directory structure**:
```
test-server/
  server.js
  uploads/          # Created automatically
  package.json
```

#### 3.2 Test HTML Page

Create: `test-file-plugin.html`

**Features**:
- Table with multiple columns including file column
- Demonstrates file upload/download
- Shows JWT configuration
- Test buttons for various operations
- Display of table data including file URLs

**Table structure**:
```html
<table id="test-table">
    <thead>
        <tr>
            <th data-type="index" data-name="id">ID</th>
            <th data-type="text" data-name="name">Name</th>
            <th data-type="file" data-name="document">Document</th>
            <th data-type="text" data-name="notes">Notes</th>
        </tr>
    </thead>
    <tbody>
        <!-- Test data rows -->
    </tbody>
</table>
```

#### 3.3 Update package.json Scripts

Add test server scripts:
```json
{
    "scripts": {
        "serve": "http-server -p 8080",
        "test-server": "node test-server/server.js",
        "test-full": "npm run test-server"
    }
}
```

### Phase 4: Documentation and Examples

#### 4.1 Update README.md

Add sections:
1. Plugin System overview
2. How to create custom plugins
3. File plugin usage and configuration
4. Testing harness instructions

#### 4.2 Create Plugin Documentation

Create: `docs/PLUGIN_DEVELOPMENT.md`

**Content**:
- Plugin interface specification
- Step-by-step plugin creation guide
- Best practices
- Example plugin implementations

#### 4.3 Create File Plugin Documentation

Create: `docs/FILE_PLUGIN.md`

**Content**:
- Configuration options
- JWT authentication setup
- Server-side implementation requirements
- Troubleshooting guide

### Phase 5: Testing Strategy

#### 5.1 Manual Testing Checklist

- [ ] File upload with valid file
- [ ] File upload with large file (progress bar)
- [ ] File upload with invalid type (if configured)
- [ ] File upload with oversized file (if configured)
- [ ] File download via link
- [ ] Edit existing file (replace)
- [ ] Delete row with file
- [ ] Cancel upload mid-progress
- [ ] Upload with JWT authentication
- [ ] Upload without JWT (if optional)
- [ ] Network error handling
- [ ] Server error handling
- [ ] Multiple file columns in same table
- [ ] get_values() includes file data
- [ ] set_rows() displays file links correctly

#### 5.2 Nightwatch.js Test Suite

Create: `tests/nightwatch/filePlugin.test.js`

**Test cases**:
1. Plugin registration
2. File column rendering
3. Modal opening on button click
4. File selection
5. Upload button state
6. Cancel button functionality
7. Download link functionality
8. Integration with table CRUD operations

### Phase 6: Security Considerations

#### 6.1 Server-Side Validation

The test server should implement:
- File type validation (MIME type checking)
- File size limits
- Filename sanitization
- Path traversal prevention
- JWT signature verification (if used)

#### 6.2 Client-Side Validation

The plugin should implement:
- File size checking before upload
- File type checking before upload
- User-friendly error messages
- Secure handling of JWT tokens (don't log)

#### 6.3 XSS Prevention

- Sanitize filename before displaying in HTML
- Use `textContent` for filenames, not `innerHTML`
- Validate server responses before rendering

## Implementation Order

1. **Day 1**: Phase 1 - Plugin Architecture
   - Modify core library to support plugins
   - Test with simple mock plugin
   - Update existing tests to ensure no regression

2. **Day 2**: Phase 2.1-2.3 - File Plugin Core & Modal
   - Implement file plugin structure
   - Create modal UI component
   - Implement upload logic (no server yet)

3. **Day 3**: Phase 2.4-2.5 & Phase 3.1 - Styling & Test Server
   - Add CSS styling
   - Create Express test server
   - Test upload/download flow end-to-end

4. **Day 4**: Phase 3.2-3.3 & Testing
   - Create test HTML page
   - Manual testing and bug fixes
   - JWT authentication testing

5. **Day 5**: Phase 4 & 5 - Documentation & Automated Tests
   - Write documentation
   - Create Nightwatch.js tests
   - Final integration testing

## File Changes Summary

### New Files
- `js/plugins/file-plugin.js` - File plugin implementation
- `css/file-plugin.css` - Plugin styling
- `test-server/server.js` - Express test server
- `test-server/package.json` - Server dependencies
- `test-file-plugin.html` - Test/demo page
- `docs/PLUGIN_DEVELOPMENT.md` - Plugin developer guide
- `docs/FILE_PLUGIN.md` - File plugin documentation
- `tests/nightwatch/filePlugin.test.js` - Automated tests

### Modified Files
- `js/ediable_table.js` - Add plugin support
- `README.md` - Add plugin documentation
- `package.json` - Add test-server script

### New Directories
- `js/plugins/` - Plugin modules
- `test-server/` - Test server
- `test-server/uploads/` - Uploaded files (created at runtime)
- `docs/` - Extended documentation

## Success Criteria

1. ✓ Plugin system allows registration of custom field types
2. ✓ File plugin handles upload with progress indication
3. ✓ File plugin displays download links
4. ✓ JWT authentication works for upload/download
5. ✓ Test server provides complete testing environment
6. ✓ No breaking changes to existing Smart Table functionality
7. ✓ Comprehensive documentation for plugin developers
8. ✓ All manual tests pass
9. ✓ Automated tests cover core plugin functionality
10. ✓ Code follows existing project patterns and style

## API Example

**Complete usage example**:

```javascript
import EditableTable from './js/ediable_table.js';
import FilePlugin from './js/plugins/file-plugin.js';

// Create and configure a file plugin instance
const documentPlugin = new FilePlugin({
    uploadUrl: "http://localhost:3000/api/upload",
    jwt: "optional-jwt-token",
    maxFileSize: 5242880, // 5MB
    allowedTypes: ["application/pdf", "image/*"]
});

// Create table with file column
const table = new EditableTable(
    document.getElementById('my-table'),
    (is_new, index, data) => {
        console.log('Saved:', data);
        // data.document will contain: { url: "...", filename: "..." }
    },
    (index) => {
        console.log('Deleted:', index);
    },
    {
        "fields": {
            "document": {
                plugin: documentPlugin  // Pass the plugin instance
            }
        }
    }
);
```

**Multiple file columns with different configurations**:

```javascript
import EditableTable from './js/ediable_table.js';
import FilePlugin from './js/plugins/file-plugin.js';

// Create separate plugin instances with different configurations
const imagePlugin = new FilePlugin({
    uploadUrl: "http://localhost:3000/api/upload/images",
    maxFileSize: 2097152, // 2MB
    allowedTypes: ["image/*"]
});

const documentPlugin = new FilePlugin({
    uploadUrl: "http://localhost:3000/api/upload/documents",
    maxFileSize: 10485760, // 10MB
    allowedTypes: ["application/pdf", "application/msword"]
});

const table = new EditableTable(
    document.getElementById('my-table'),
    (is_new, index, data) => {
        console.log('Saved:', data);
    },
    (index) => {
        console.log('Deleted:', index);
    },
    {
        "fields": {
            "photo": {
                plugin: imagePlugin  // Images only
            },
            "resume": {
                plugin: documentPlugin  // Documents only
            }
        }
    }
);
```

## Risk Mitigation

### Risk: Large file uploads may timeout
**Mitigation**: Implement configurable timeout, show clear error messages, allow retry

### Risk: Browser compatibility issues with File API
**Mitigation**: Test on Chrome, Firefox, Safari; document minimum browser versions

### Risk: Plugin breaks existing functionality
**Mitigation**: Comprehensive testing suite, fallback to default behavior on errors

### Risk: Security vulnerabilities in file handling
**Mitigation**: Server-side validation, file type restrictions, size limits, sanitization

### Risk: Complex plugin API may confuse developers
**Mitigation**: Clear documentation, multiple examples, simple default configurations

## Future Enhancements

After initial implementation, consider:
1. Multiple file upload support (array of files)
2. Image preview thumbnail in table cell
3. Drag-and-drop file upload
4. Resume interrupted uploads
5. Client-side file compression before upload
6. Plugin marketplace/registry
7. Additional plugins (date picker, rich text editor, etc.)

---

## Questions for Clarification

Before beginning implementation, please confirm:

1. **JWT handling**: Should the JWT be refreshable, or always use the initially provided token?
2. **File storage**: In production use, will files be stored on same server or cloud storage (S3, etc.)?
3. **Browser support**: What minimum browser versions should be supported?
4. **File deletion**: Should deleting a table row also delete the file from the server?
5. **Concurrent uploads**: Should multiple rows be editable with file uploads simultaneously?
6. **Plugin distribution**: Should plugins be separate npm packages or part of main library?
