# File Plugin for Smart Table

## Overview

The File Plugin enables file upload and download functionality in Smart Table. Users can upload files to a server and store references to them in table cells, which are displayed as downloadable links.

## Features

- File upload with progress indication
- Download links for stored files
- Modal UI for file selection
- File type and size validation
- JWT authentication support
- Responsive design

## Installation

1. Include the plugin script in your HTML:
```html
<script src="./js/plugins/file-plugin.js" type="module"></script>
```

2. Include the plugin CSS:
```html
<link rel="stylesheet" href="css/file-plugin.css" />
```

## Configuration

The File Plugin accepts the following configuration options:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `uploadUrl` | String | Yes | - | URL endpoint for file uploads |
| `jwt` | String | No | null | JWT token for authentication |
| `maxFileSize` | Number | No | 10485760 | Maximum file size in bytes (10MB default) |
| `allowedTypes` | Array | No | null | Allowed MIME types (null allows all) |
| `downloadUrlField` | String | No | "url" | Response field containing download URL |
| `filenameField` | String | No | "filename" | Response field containing filename |

## Usage

### Basic Setup

```javascript
import EditableTable from './js/ediable_table.js';
import FilePlugin from './js/plugins/file-plugin.js';

// Create a file plugin instance
const filePlugin = new FilePlugin({
    uploadUrl: "https://your-server.com/api/upload",
    maxFileSize: 5242880, // 5MB
    allowedTypes: ["application/pdf", "image/*"]
});

// Initialize table with file plugin
const table = new EditableTable(
    document.getElementById('my-table'),
    saveCallback,
    deleteCallback,
    {
        "fields": {
            "document": {
                plugin: filePlugin  // Register the plugin instance
            }
        }
    }
);
```

### HTML Table Structure

Mark columns that should use the file plugin with `data-type="file"`:

```html
<table id="my-table">
    <thead>
        <tr>
            <th data-type="index" data-name="id">ID</th>
            <th data-type="text" data-name="name">Name</th>
            <th data-type="file" data-name="document">Document</th>
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
const advancedFilePlugin = new FilePlugin({
    uploadUrl: "https://api.example.com/upload",
    jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    maxFileSize: 20971520, // 20MB
    allowedTypes: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "text/plain"
    ],
    downloadUrlField: "download_url",  // Custom field name in response
    filenameField: "original_name"     // Custom field name in response
});
```

## Server-Side Implementation

Your upload endpoint should:

1. Accept multipart/form-data POST requests
2. Handle the uploaded file appropriately
3. Return a JSON response with download URL and filename

Example response format:
```json
{
    "url": "/api/download/filename.pdf",
    "filename": "original_filename.pdf"
}
```

### Required Response Fields

- `url`: The download URL for the uploaded file
- `filename`: The original filename (optional, defaults to original name)

Custom field names can be specified using the `downloadUrlField` and `filenameField` configuration options.

## Authentication

The plugin supports JWT authentication. When a JWT is provided in the configuration:

1. The JWT is sent in the `Authorization: Bearer {token}` header for upload requests
2. The JWT is sent in the same header for download requests (if your server supports it)

## File Types and Size Limits

### Allowed Types

The `allowedTypes` option accepts an array of MIME type patterns:

- Specific types: `"image/jpeg"`, `"application/pdf"`
- Wildcard types: `"image/*"` (all image types)

### Size Limit

The `maxFileSize` option specifies the maximum allowed file size in bytes. Files exceeding this size will be rejected before upload begins.

## Display Behavior

### Edit Mode
- Shows "Choose File..." button for empty cells
- Shows "Change File..." button for cells with existing files
- Displays current filename next to the button
- Opens modal dialog when button is clicked

### Display Mode
- Shows download link with filename for cells with files
- Shows "(No file)" for empty cells
- Links have the `download` attribute for direct download

## Data Format

The plugin stores file information as objects with the following structure:

```javascript
{
    "url": "/api/download/filename.pdf",  // Download URL
    "filename": "original_filename.pdf"   // Original filename
}
```

This object is returned by `get_values()` and can be used to populate the table with `set_rows()`.

## Error Handling

The plugin provides user-friendly error messages for:

- No file selected
- File size exceeded
- Invalid file type
- Upload failures
- Network errors

Errors are displayed in the modal dialog.

## Security Considerations

1. Validate file types on the server side, not just the client
2. Implement proper file size limits on the server
3. Sanitize filenames to prevent path traversal attacks
4. Use secure authentication for upload/download endpoints
5. Store uploaded files outside the web root when possible

## Troubleshooting

### Upload fails with CORS error
- Ensure your server has proper CORS headers for the upload endpoint
- Check that the upload URL is accessible from the client

### Files don't appear after upload
- Verify that your server returns the correct response format
- Check that the download URL in the response is accessible

### File validation not working
- Ensure MIME types are correctly detected by the browser
- Server-side validation is recommended for security