# Testing the Smart Table File Plugin

This document provides step-by-step instructions to test the Smart Table file plugin implementation.

## Prerequisites

- Node.js installed on your system
- npm (Node Package Manager)

## Setup Instructions

### 1. Install Dependencies

First, install the dependencies for the test server:

```bash
cd /home/telendry/code/smart_table/test-server && npm install
```

### 2. Start the Services

From the project root directory, you need to start both servers:

**Terminal 1 - Start the test server (for file uploads/downloads):**
```bash
cd /home/telendry/code/smart_table && npm run test-server
```

**Terminal 2 - Start the main application server:**
```bash
cd /home/telendry/code/smart_table && npm run serve
```

Alternatively, you can start the test server directly:
```bash
cd /home/telendry/code/smart_table/test-server && node server.js
```

The services will run on:
- Test server (file handling): `http://localhost:3000`
- Main application: `http://localhost:3000`

The test server will create an `uploads/` directory to store uploaded files.

## Testing Steps

### 1. Open the Test Page

Navigate to the test page in your browser:

`http://localhost:3000/test-file-plugin.html`

### 2. Verify Plugin Initialization

- Check that the table loads properly with columns: ID, Name, Document, Notes
- Verify that the "Document" column has the `data-type="file"` attribute
- Confirm that the file plugin is properly registered

### 3. Test Adding Rows

- Click the "Add Row" button
- Verify that a new row appears in edit mode
- Check that the "Document" column shows a "Choose File..." button

### 4. Test File Upload

- Click the "Choose File..." button in the Document column
- A modal dialog should appear
- Select a file to upload (ensure it meets the size/type restrictions)
- Verify the progress bar appears and updates during upload
- Check that the file name appears after upload completes
- Close the modal by clicking "Cancel" or the close button

### 5. Test File Change

- Click "Change File..." on an existing file
- Verify the modal appears again
- Select a different file
- Confirm the filename updates

### 6. Test Saving Data

- Fill in other fields in the row
- Click "Save" to save the row
- Verify the file appears as a download link in the table
- Check that the data is properly stored by clicking "Get Table Data"

### 7. Test Download Functionality

- Click on the file link in the table
- Verify the file downloads properly
- If using JWT authentication, ensure the download works with proper authorization

### 8. Test Validation

- Try uploading a file that exceeds the size limit (5MB in the test)
- Verify an error message appears
- Try uploading a file with an invalid type
- Confirm the appropriate error message is shown

### 9. Test Data Persistence

- Click "Get Table Data" to view the stored data
- Verify that file information is stored as an object with `url` and `filename` properties
- Click "Populate with Sample Data" to load predefined data
- Confirm the table updates correctly with the sample data

## Alternative Test Page

You can also test the basic plugin functionality using:

`http://localhost:8080/test-plugin-system.html`

This page provides a simpler test of the plugin system integration.

## Testing the Server-Side Functionality

### 1. Manual API Testing

You can test the upload endpoint directly:

```bash
curl -X POST -F "file=@/path/to/your/testfile.pdf" http://localhost:3000/api/upload
```

Expected response:
```json
{
  "url": "/api/download/filename.pdf",
  "filename": "original_filename.pdf",
  "size": 12345,
  "mimetype": "application/pdf"
}
```

### 2. Upload Directory Verification

After uploading files, check the `test-server/uploads/` directory to confirm files are stored properly.

## Troubleshooting

### Common Issues

1. **CORS Errors**: If you see CORS errors, ensure the test server is running on `localhost:3000`
2. **File Upload Fails**: Check that the file size and type meet the configured limits
3. **Download Doesn't Work**: Verify the file exists in the `uploads/` directory
4. **Plugin Not Working**: Check browser console for JavaScript errors

### Debugging Tips

- Open browser developer tools to check for JavaScript errors
- Look at the test server console for upload/download logs
- Verify that all required files are loaded (check Network tab)
- Ensure the plugin is properly registered in the table configuration

## Stopping the Servers

To stop the servers, press `Ctrl+C` in each terminal where they are running.