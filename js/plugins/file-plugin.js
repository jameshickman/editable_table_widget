import Plugin from '../plugin-base.js';

/**
 * File upload/download plugin for EditableTable
 * Allows users to upload files and display them as downloadable links
 */
class FilePlugin extends Plugin {
    /**
     * @param {Object} config - Plugin configuration
     * @param {string} config.uploadUrl - Required: Upload endpoint URL
     * @param {string} [config.jwt] - Optional: JWT token for authentication
     * @param {number} [config.maxFileSize=10485760] - Optional: Max file size in bytes (default 10MB)
     * @param {Array<string>} [config.allowedTypes] - Optional: Allowed MIME types (default: all)
     * @param {string} [config.downloadUrlField="url"] - Optional: JSON field for download URL (default: "url")
     * @param {string} [config.filenameField="filename"] - Optional: JSON field for filename (default: "filename")
     */
    constructor(config = {}) {
        super(config);
        this.config = {
            uploadUrl: config.uploadUrl,
            jwt: config.jwt || null,
            maxFileSize: config.maxFileSize || 10485760, // 10MB default
            allowedTypes: config.allowedTypes || null, // Allow all types by default
            downloadUrlField: config.downloadUrlField || 'url',
            filenameField: config.filenameField || 'filename'
        };

        if (!this.config.uploadUrl) {
            throw new Error('FilePlugin requires uploadUrl configuration');
        }
    }

    /**
     * Create the form element for editing mode
     * @param {string} fieldName - The field name
     * @param {any} currentValue - The current value to display
     * @returns {HTMLElement} - The edit control element
     */
    createEditElement(fieldName, currentValue) {
        const container = document.createElement('div');
        container.className = 'file-plugin-edit-container';
        
        // Create button to trigger file selection
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'file-plugin-button';
        button.textContent = currentValue ? 'Change File...' : 'Choose File...';
        
        // Store current value for later use
        this.currentValue = currentValue;
        
        // Add click handler to open modal
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.openUploadModal(fieldName, currentValue, container);
        });
        
        container.appendChild(button);
        
        // Show current filename if exists
        if (currentValue && typeof currentValue === 'object' && currentValue[this.config.filenameField]) {
            const filenameSpan = document.createElement('span');
            filenameSpan.className = 'file-plugin-filename';
            filenameSpan.textContent = ` ${currentValue[this.config.filenameField]}`;
            container.appendChild(filenameSpan);
        }
        
        return container;
    }

    /**
     * Extract the data value from a display cell element
     * @param {HTMLElement} cellElement - The table cell in display mode
     * @returns {any} - The data value
     */
    decodeValue(cellElement) {
        // Look for data stored in the cell
        const dataValue = cellElement.getAttribute('data-file-value');
        if (dataValue) {
            try {
                return JSON.parse(dataValue);
            } catch (e) {
                return null;
            }
        }
        
        // Fallback: parse from HTML content
        const linkElement = cellElement.querySelector('a');
        if (linkElement) {
            const filename = linkElement.textContent.trim();
            const downloadUrl = linkElement.getAttribute('href');
            
            if (filename && downloadUrl) {
                return {
                    [this.config.downloadUrlField]: downloadUrl,
                    [this.config.filenameField]: filename
                };
            }
        }
        
        return null;
    }

    /**
     * Save the edited value from edit mode back to display mode
     * @param {HTMLElement} editCellElement - The table cell in edit mode
     * @param {HTMLElement} displayCellElement - The table cell to update for display
     * @returns {Object} - { display: string (HTML), value: any (data) }
     */
    saveValue(editCellElement, displayCellElement) {
        try {
            // Get the stored value from the edit container
            const container = editCellElement.querySelector('.file-plugin-edit-container');
            const fileData = container ? container.dataset.fileData : null;

            if (fileData) {
                try {
                    const parsedData = JSON.parse(fileData);

                    // Update the display cell with the new file data
                    const displayHtml = this.renderDisplay(parsedData);

                    return {
                        display: displayHtml,
                        value: parsedData
                    };
                } catch (parseError) {
                    console.error('Error parsing file data:', parseError);
                }
            }

            // If no new file was uploaded, return the original value
            return {
                display: displayCellElement.innerHTML,
                value: this.decodeValue(displayCellElement)
            };
        } catch (error) {
            console.error('Error in file plugin saveValue:', error);
            // Return safe defaults
            return {
                display: '<span class="file-plugin-no-file">(No file)</span>',
                value: null
            };
        }
    }

    /**
     * Render the display mode HTML for a value
     * @param {any} value - The data value to display
     * @returns {string} - HTML string for display
     */
    renderDisplay(value) {
        if (!value) {
            return '<span class="file-plugin-no-file">(No file)</span>';
        }

        if (typeof value === 'object') {
            const downloadUrl = value[this.config.downloadUrlField];
            const filename = value[this.config.filenameField];

            if (downloadUrl && filename) {
                // Store the value as JSON in a data attribute for easy retrieval
                const valueJson = JSON.stringify(value);

                // If JWT is configured, we need to handle the download with authentication
                if (this.config.jwt) {
                    // Create a link that triggers authenticated download
                    return `<a href="#" data-download-url="${downloadUrl}" data-filename="${filename}" data-jwt="${this.config.jwt}" class="file-plugin-download-link authenticated-download">${filename}</a>`;
                } else {
                    // Standard download link
                    return `<a href="${downloadUrl}" download="${filename}" class="file-plugin-download-link">${filename}</a>`;
                }
            }
        }

        // Handle string values (fallback)
        if (typeof value === 'string' && value) {
            if (this.config.jwt) {
                // For string URLs with JWT, also use authenticated download
                return `<a href="#" data-download-url="${value}" data-filename="${value.split('/').pop()}" data-jwt="${this.config.jwt}" class="file-plugin-download-link authenticated-download">${value}</a>`;
            } else {
                return `<a href="${value}" download class="file-plugin-download-link">${value}</a>`;
            }
        }

        return '<span class="file-plugin-no-file">(No file)</span>';
    }

    /**
     * Open the file upload modal
     * @param {string} fieldName - The field name
     * @param {any} currentValue - The current value
     * @param {HTMLElement} container - The container element
     */
    openUploadModal(fieldName, currentValue, container) {
        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'file-plugin-modal-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'file-plugin-modal';
        modal.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            min-width: 400px;
            max-width: 600px;
        `;

        // Create title
        const title = document.createElement('h3');
        title.textContent = 'Upload File';
        title.style.marginTop = '0';
        modal.appendChild(title);

        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = `file-input-${fieldName}`;
        fileInput.style.cssText = `
            width: 100%;
            margin-bottom: 15px;
            padding: 8px;
        `;
        modal.appendChild(fileInput);

        // Create progress container (initially hidden)
        const progressContainer = document.createElement('div');
        progressContainer.className = 'file-plugin-progress';
        progressContainer.style.cssText = `
            display: none;
            margin: 15px 0;
        `;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'file-plugin-progress-bar';
        progressBar.style.cssText = `
            height: 20px;
            background-color: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 5px;
        `;
        
        const progressBarFill = document.createElement('div');
        progressBarFill.className = 'file-plugin-progress-fill';
        progressBarFill.style.cssText = `
            height: 100%;
            background-color: #4CAF50;
            width: 0%;
            transition: width 0.3s ease;
        `;
        
        const progressText = document.createElement('div');
        progressText.className = 'file-plugin-progress-text';
        progressText.style.cssText = `
            text-align: center;
            font-size: 14px;
            color: #666;
        `;
        progressText.textContent = '0%';
        
        progressBar.appendChild(progressBarFill);
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);
        modal.appendChild(progressContainer);

        // Create error message container (initially hidden)
        const errorContainer = document.createElement('div');
        errorContainer.className = 'file-plugin-error';
        errorContainer.style.cssText = `
            display: none;
            margin: 15px 0;
            padding: 10px;
            background-color: #ffebee;
            color: #c62828;
            border-radius: 4px;
            border: 1px solid #ffcdd2;
        `;
        modal.appendChild(errorContainer);

        // Create action buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 15px;
        `;

        const uploadButton = document.createElement('button');
        uploadButton.type = 'button';
        uploadButton.className = 'file-plugin-upload-btn';
        uploadButton.textContent = 'Upload';
        uploadButton.style.cssText = `
            padding: 8px 16px;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        buttonContainer.appendChild(uploadButton);

        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'file-plugin-cancel-btn';
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = `
            padding: 8px 16px;
            background-color: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
        `;
        buttonContainer.appendChild(cancelButton);

        modal.appendChild(buttonContainer);
        backdrop.appendChild(modal);

        // Add event listeners
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(backdrop);
        });

        uploadButton.addEventListener('click', () => {
            const selectedFile = fileInput.files[0];
            if (!selectedFile) {
                this.showError(errorContainer, 'Please select a file to upload.');
                return;
            }

            // Validate file size
            if (selectedFile.size > this.config.maxFileSize) {
                this.showError(errorContainer, `File size exceeds maximum allowed size of ${(this.config.maxFileSize / 1024 / 1024).toFixed(2)} MB.`);
                return;
            }

            // Validate file type if allowedTypes is specified
            if (this.config.allowedTypes && this.config.allowedTypes.length > 0) {
                const fileTypeValid = this.config.allowedTypes.some(allowedType => {
                    if (allowedType.endsWith('/*')) {
                        // Wildcard type like 'image/*'
                        const baseType = allowedType.slice(0, -1); // Remove the '*'
                        return selectedFile.type.startsWith(baseType);
                    } else {
                        // Specific type like 'image/jpeg'
                        return selectedFile.type === allowedType;
                    }
                });

                if (!fileTypeValid) {
                    this.showError(errorContainer, `File type '${selectedFile.type}' is not allowed. Allowed types: ${this.config.allowedTypes.join(', ')}.`);
                    return;
                }
            }

            // Perform upload
            this.performUpload(selectedFile, progressContainer, progressBarFill, progressText, errorContainer, container, backdrop);
        });

        // Add to document
        document.body.appendChild(backdrop);
    }

    /**
     * Show error message
     * @param {HTMLElement} errorContainer - The error container element
     * @param {string} message - The error message
     */
    showError(errorContainer, message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }

    /**
     * Hide error message
     * @param {HTMLElement} errorContainer - The error container element
     */
    hideError(errorContainer) {
        errorContainer.style.display = 'none';
        errorContainer.textContent = '';
    }

    /**
     * Perform the file upload
     * @param {File} file - The file to upload
     * @param {HTMLElement} progressContainer - The progress container
     * @param {HTMLElement} progressBarFill - The progress bar fill element
     * @param {HTMLElement} progressText - The progress text element
     * @param {HTMLElement} errorContainer - The error container
     * @param {HTMLElement} container - The container element
     * @param {HTMLElement} backdrop - The modal backdrop
     */
    performUpload(file, progressContainer, progressBarFill, progressText, errorContainer, container, backdrop) {
        // Show progress container
        progressContainer.style.display = 'block';
        this.hideError(errorContainer);

        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                progressBarFill.style.width = percentComplete + '%';
                progressText.textContent = percentComplete + '%';
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);

                    // Extract the download URL and filename from response
                    const downloadUrl = response[this.config.downloadUrlField];
                    const filename = response[this.config.filenameField] || file.name;

                    if (!downloadUrl) {
                        throw new Error(`Response missing required field: ${this.config.downloadUrlField}`);
                    }

                    // Create the file data object
                    const fileData = {
                        [this.config.downloadUrlField]: downloadUrl,
                        [this.config.filenameField]: filename
                    };

                    // Update the container with the new file data
                    container.dataset.fileData = JSON.stringify(fileData);

                    // Update the button text and add filename display
                    const button = container.querySelector('.file-plugin-button');
                    button.textContent = 'Change File...';

                    // Remove existing filename span if present
                    const existingFilename = container.querySelector('.file-plugin-filename');
                    if (existingFilename) {
                        existingFilename.remove();
                    }

                    // Add new filename span
                    const filenameSpan = document.createElement('span');
                    filenameSpan.className = 'file-plugin-filename';
                    filenameSpan.textContent = ` ${filename}`;
                    container.appendChild(filenameSpan);

                    // Close the modal
                    document.body.removeChild(backdrop);
                } catch (e) {
                    console.error('Error processing upload response:', e);
                    this.showError(errorContainer, 'Invalid response from server.');
                }
            } else {
                // Server returned an error
                try {
                    const response = JSON.parse(xhr.responseText);
                    this.showError(errorContainer, response.message || `Upload failed with status ${xhr.status}`);
                } catch (e) {
                    this.showError(errorContainer, `Upload failed with status ${xhr.status}`);
                }
            }
        });

        xhr.addEventListener('error', () => {
            this.showError(errorContainer, 'Network error occurred during upload.');
        });

        xhr.addEventListener('abort', () => {
            this.showError(errorContainer, 'Upload was cancelled.');
        });

        // Set up request
        xhr.open('POST', this.config.uploadUrl);

        // Add JWT header if provided
        if (this.config.jwt) {
            xhr.setRequestHeader('Authorization', `Bearer ${this.config.jwt}`);
        }

        // Send the request
        xhr.send(formData);
    }
}

export default FilePlugin;