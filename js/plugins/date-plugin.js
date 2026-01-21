import Plugin from '../plugin-base.js';

/**
 * Date plugin for EditableTable
 * Provides a date input field using HTML5 date picker
 */
class DatePlugin extends Plugin {
    /**
     * @param {Object} config - Plugin configuration
     * @param {string} [config.dateFormat='YYYY-MM-DD'] - Expected date format (deprecated, use displayFormat)
     * @param {string} [config.displayFormat] - Custom display format string (e.g., 'MM/DD/YYYY', 'DD-MM-YYYY', etc.)
     * @param {string} [config.minDate] - Minimum allowed date (YYYY-MM-DD)
     * @param {string} [config.maxDate] - Maximum allowed date (YYYY-MM-DD)
     * @param {boolean} [config.includeTime=false] - Whether to include time picker
     */
    constructor(config = {}) {
        super(config);
        this.config = {
            dateFormat: config.dateFormat || 'YYYY-MM-DD',
            displayFormat: config.displayFormat || null, // Custom display format
            minDate: config.minDate || '',
            maxDate: config.maxDate || '',
            includeTime: config.includeTime || false
        };
    }

    /**
     * Create the form element for editing mode
     * @param {string} fieldName - The field name
     * @param {any} currentValue - The current value to display
     * @returns {HTMLElement} - The edit control element
     */
    createEditElement(fieldName, currentValue) {
        const input = document.createElement('input');
        
        if (this.config.includeTime) {
            input.type = 'datetime-local';
        } else {
            input.type = 'date';
        }
        
        input.id = fieldName;
        input.name = fieldName;
        
        // Set min and max dates if provided
        if (this.config.minDate) {
            input.min = this.config.minDate;
        }
        if (this.config.maxDate) {
            input.max = this.config.maxDate;
        }
        
        // Set the current value if it exists
        if (currentValue) {
            // Convert the value to the expected format for the input
            const dateValue = this.formatForInput(currentValue);
            if (dateValue) {
                input.value = dateValue;
            }
        }
        
        return input;
    }

    /**
     * Extract the data value from a display cell element
     * @param {HTMLElement} cellElement - The table cell in display mode
     * @returns {any} - The data value
     */
    decodeValue(cellElement) {
        // Try to get the value from data attribute first
        const dataValue = cellElement.getAttribute('data-date-value');
        if (dataValue) {
            try {
                return new Date(dataValue).toISOString().split('T')[0]; // Return in YYYY-MM-DD format
            } catch (e) {
                return null;
            }
        }
        
        // Fallback: get from text content
        const textValue = cellElement.textContent.trim();
        if (textValue && textValue !== '(No date)' && textValue !== '') {
            // Parse the date string and return in standard format
            const date = new Date(textValue);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
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
        const input = editCellElement.querySelector('input[type="date"], input[type="datetime-local"]');
        let value = null;
        let display = '<span class="date-plugin-no-date">(No date)</span>';
        
        if (input && input.value) {
            const dateValue = new Date(input.value);
            
            if (!isNaN(dateValue.getTime())) {
                // Format the date for storage (ISO format without time if not including time)
                if (this.config.includeTime) {
                    value = dateValue.toISOString(); // Full ISO string with time
                    display = this.formatForDisplay(dateValue, true);
                } else {
                    value = dateValue.toISOString().split('T')[0]; // Just the date part
                    display = this.formatForDisplay(dateValue, false);
                }
                
                // Store the raw date value in a data attribute for easy retrieval
                display = `<span class="date-plugin-value" data-date-value="${value}">${display}</span>`;
            }
        }
        
        return {
            display: display,
            value: value
        };
    }

    /**
     * Render the display mode HTML for a value
     * @param {any} value - The data value to display
     * @returns {string} - HTML string for display
     */
    renderDisplay(value) {
        if (!value) {
            return '<span class="date-plugin-no-date">(No date)</span>';
        }
        
        try {
            const date = new Date(value);
            
            if (isNaN(date.getTime())) {
                return '<span class="date-plugin-invalid">(Invalid date)</span>';
            }
            
            let displayValue;
            if (this.config.includeTime) {
                displayValue = this.formatForDisplay(date, true);
            } else {
                displayValue = this.formatForDisplay(date, false);
            }
            
            // Store the raw date value in a data attribute for easy retrieval
            return `<span class="date-plugin-value" data-date-value="${value}">${displayValue}</span>`;
        } catch (e) {
            return '<span class="date-plugin-invalid">(Invalid date)</span>';
        }
    }
    
    /**
     * Format a date for display
     * @param {Date} date - The date to format
     * @param {boolean} includeTime - Whether to include time
     * @returns {string} - Formatted date string
     */
    formatForDisplay(date, includeTime = false) {
        if (this.config.displayFormat) {
            // Use custom display format if provided
            return this.formatWithPattern(date, this.config.displayFormat, includeTime);
        }

        if (includeTime) {
            return date.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    /**
     * Format a date using a custom pattern
     * @param {Date} date - The date to format
     * @param {string} pattern - The format pattern (e.g., 'MM/DD/YYYY', 'DD-MM-YYYY', etc.)
     * @param {boolean} includeTime - Whether to include time
     * @returns {string} - Formatted date string
     */
    formatWithPattern(date, pattern, includeTime = false) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth() returns 0-11
        const day = date.getDate();

        let hours = 0;
        let minutes = 0;

        if (includeTime) {
            hours = date.getHours();
            minutes = date.getMinutes();
        }

        // Replace pattern placeholders with actual values
        let formatted = pattern
            .replace(/YYYY/g, year.toString())
            .replace(/YY/g, year.toString().slice(-2))
            .replace(/MM/g, month.toString().padStart(2, '0'))
            .replace(/M/g, month.toString())
            .replace(/DD/g, day.toString().padStart(2, '0'))
            .replace(/D/g, day.toString());

        if (includeTime) {
            formatted += ` ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        return formatted;
    }
    
    /**
     * Format a date value for HTML input element
     * @param {string|Date} value - The date value
     * @returns {string|null} - Formatted date string for input or null
     */
    formatForInput(value) {
        if (!value) {
            return null;
        }
        
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return null;
        }
        
        if (this.config.includeTime) {
            // Format for datetime-local input: YYYY-MM-DDTHH:mm
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            // Format for date input: YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            return `${year}-${month}-${day}`;
        }
    }
}

export default DatePlugin;