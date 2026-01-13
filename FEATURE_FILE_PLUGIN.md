# Implement a plug-in to manage a file column

In the POJO of field definitions, there needs to be support for custom
plug-ins.

Implement the plugins in vanilla JavaScript.

## File plug-in

Implement a file field column type. Field type for one file. When editing a row,
the file field becomes a button that opens a modal to select and upload a file.
Modal should implement an upload progress bar.

The file field should be the link to download the file.

Upload and download operations need to pass a session JWT, so an optional JWT
needs to be accepted to the plug-in.

### Upload endpoint

The end-point for uploads needs to return a JSON payload with the link
to download the file from.

## Testing harness

Write a simple Express service to provide file uploads and downloads for testing
the plugin.
