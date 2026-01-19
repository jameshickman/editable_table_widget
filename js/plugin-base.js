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