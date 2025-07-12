/**
 * Angular Form Snapshot - Content Script
 * Professional content script for Angular form state management
 *
 * @author Angular DevTools Team
 * @version 1.0.0
 * @description Main content script handling form inspection, capture, and restoration
 */

'use strict';

// ============================================================================
// CONTENT SCRIPT CONSTANTS
// ============================================================================

const CONTENT_SCRIPT_CONFIG = {
  VERSION: '1.0.0',
  DETECTION_INTERVAL: 2000,
  MAX_DETECTION_ATTEMPTS: 10,
  FORM_SCAN_INTERVAL: 1000,
  RESTORATION_TIMEOUT: 5000,
  DEBOUNCE_DELAY: 300,
  MAX_FORM_CONTROLS: 1000
};

const MESSAGE_TYPES = {
  // Angular Detection
  DETECT_ANGULAR: 'DETECT_ANGULAR',
  ANGULAR_DETECTED: 'ANGULAR_DETECTED',

  // Form Operations
  CAPTURE_FORMS: 'CAPTURE_FORMS',
  RESTORE_FORMS: 'RESTORE_FORMS',
  FORMS_CAPTURED: 'FORMS_CAPTURED',
  FORMS_RESTORED: 'FORMS_RESTORED',

  // Storage Operations
  SAVE_SNAPSHOT: 'SAVE_SNAPSHOT',
  LOAD_SNAPSHOT: 'LOAD_SNAPSHOT',

  // UI Operations
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
  UPDATE_BADGE: 'UPDATE_BADGE',

  // Error Handling
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  LOG_MESSAGE: 'LOG_MESSAGE'
};

const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
};

// ============================================================================
// MAIN CONTENT SCRIPT CLASS
// ============================================================================

class AngularFormSnapshotContent {
  constructor() {
    this.isInitialized = false;
    this.angularDetected = false;
    this.detectionAttempts = 0;
    this.formControls = new Map();
    this.lastSnapshot = null;
    this.observers = new Map();
    this.eventListeners = new Map();
    this.debounceTimers = new Map();

    // Bind methods
    this.handleMessage = this.handleMessage.bind(this);
    this.detectAngular = this.detectAngular.bind(this);
    this.scanForms = this.scanForms.bind(this);
    this.captureForms = this.captureForms.bind(this);
    this.restoreForms = this.restoreForms.bind(this);
  }

  /**
   * Initializes the content script
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.log('info', 'Initializing Angular Form Snapshot content script');

      // Set up message listener
      chrome.runtime.onMessage.addListener(this.handleMessage);

      // Start Angular detection
      await this.startAngularDetection();

      // Set up DOM observers
      this.setupDOMObservers();

      // Set up keyboard shortcuts
      this.setupKeyboardShortcuts();

      // Initialize UI components
      this.initializeUI();

      this.isInitialized = true;
      this.log('info', 'Content script initialized successfully');

    } catch (error) {
      this.log('error', 'Content script initialization failed', error);
    }
  }

  /**
   * Handles messages from background script
   * @param {Object} message
   * @param {Object} sender
   * @param {Function} sendResponse
   */
  async handleMessage(message, sender, sendResponse) {
    const { type, data } = message;

    this.log('debug', `Message received: ${type}`, data);

    try {
      switch (type) {
        case MESSAGE_TYPES.CAPTURE_FORMS:
          const captureResult = await this.captureForms(data);
          sendResponse({ success: true, ...captureResult });
          break;

        case MESSAGE_TYPES.RESTORE_FORMS:
          const restoreResult = await this.restoreForms(data);
          sendResponse({ success: true, ...restoreResult });
          break;

        case MESSAGE_TYPES.DETECT_ANGULAR:
          const detectionResult = await this.detectAngular();
          sendResponse({ success: true, ...detectionResult });
          break;

        default:
          this.log('warn', `Unknown message type: ${type}`);
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      this.log('error', `Message handling failed for type: ${type}`, error);
      sendResponse({ success: false, error: error.message });
    }

    return true; // Keep message channel open
  }

  /**
   * Starts Angular detection process
   */
  async startAngularDetection() {
    const detect = async () => {
      if (this.angularDetected || this.detectionAttempts >= CONTENT_SCRIPT_CONFIG.MAX_DETECTION_ATTEMPTS) {
        return;
      }

      this.detectionAttempts++;
      const result = await this.detectAngular();

      if (result.detected) {
        this.angularDetected = true;
        await this.onAngularDetected(result);
      } else if (this.detectionAttempts < CONTENT_SCRIPT_CONFIG.MAX_DETECTION_ATTEMPTS) {
        setTimeout(detect, CONTENT_SCRIPT_CONFIG.DETECTION_INTERVAL);
      }
    };

    await detect();
  }

  /**
   * Detects Angular application
   * @returns {Promise<Object>}
   */
  async detectAngular() {
    try {
      if (!window.AngularFormSnapshotDetector) {
        this.log('warn', 'Angular detector not available');
        return { detected: false, error: 'Detector not available' };
      }

      const result = await window.AngularFormSnapshotDetector.detectAngular();
      this.log('debug', 'Angular detection result', result);

      return result;
    } catch (error) {
      this.log('error', 'Angular detection failed', error);
      return { detected: false, error: error.message };
    }
  }

  /**
   * Handles Angular detection success
   * @param {Object} detectionResult
   */
  async onAngularDetected(detectionResult) {
    this.log('info', 'Angular application detected', detectionResult);

    // Notify background script
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.ANGULAR_DETECTED,
      data: detectionResult
    });

    // Start form scanning
    this.startFormScanning();

    // Show notification
    this.showNotification(
      'Angular Detected',
      `Angular ${detectionResult.version} application detected. Form snapshot tools are now active.`,
      NOTIFICATION_TYPES.SUCCESS
    );
  }

  /**
   * Starts continuous form scanning
   */
  startFormScanning() {
    const scanInterval = setInterval(async () => {
      if (!this.angularDetected) {
        clearInterval(scanInterval);
        return;
      }

      await this.scanForms();
    }, CONTENT_SCRIPT_CONFIG.FORM_SCAN_INTERVAL);
  }

  /**
   * Scans for form controls in the page
   */
  async scanForms() {
    try {
      if (!window.AngularFormSnapshotUtils) {
        return;
      }

      const formControls = await window.AngularFormSnapshotUtils.FormControlInspector.inspectAllFormControls();

      // Update form controls cache
      this.updateFormControlsCache(formControls);

      // Check for changes
      this.detectFormChanges(formControls);

    } catch (error) {
      this.log('error', 'Form scanning failed', error);
    }
  }

  /**
   * Updates form controls cache
   * @param {Array} formControls
   */
  updateFormControlsCache(formControls) {
    const newFormControls = new Map();

    formControls.forEach(control => {
      newFormControls.set(control.id, {
        ...control,
        lastScanned: Date.now()
      });
    });

    this.formControls = newFormControls;
  }

  /**
   * Detects form changes
   * @param {Array} formControls
   */
  detectFormChanges(formControls) {
    // This could be used for real-time change detection
    // For now, we'll just log the count
    this.log('debug', `Detected ${formControls.length} form controls`);
  }

  /**
   * Captures all form control values
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async captureForms(options = {}) {
    try {
      this.log('info', 'Starting form capture', options);

      if (!window.AngularFormSnapshotUtils) {
        throw new Error('Angular snapshot utilities not available');
      }

      // Get all form controls
      const formControls = await window.AngularFormSnapshotUtils.FormControlInspector.inspectAllFormControls();

      if (formControls.length === 0) {
        throw new Error('No form controls found on the page');
      }

      if (formControls.length > CONTENT_SCRIPT_CONFIG.MAX_FORM_CONTROLS) {
        throw new Error(`Too many form controls detected (${formControls.length}). Maximum allowed: ${CONTENT_SCRIPT_CONFIG.MAX_FORM_CONTROLS}`);
      }

      // Create snapshot
      const snapshot = {
        timestamp: Date.now(),
        url: window.location.href,
        title: document.title,
        userAgent: navigator.userAgent,
        forms: formControls.map(control => ({
          id: control.id,
          type: control.type,
          name: control.name,
          value: control.value,
          path: control.path,
          tagName: control.tagName,
          attributes: control.attributes,
          validators: control.validators,
          metadata: control.metadata
        })),
        options: options
      };

      // Encode snapshot
      const encodedSnapshot = await window.AngularFormSnapshotUtils.DataEncoder.encodeFormData(snapshot.forms);

      // Save to clipboard if requested
      if (options.copyToClipboard !== false) {
        await this.copyToClipboard(encodedSnapshot);
      }

      // Save to storage if requested
      if (options.saveToStorage !== false) {
        await chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.SAVE_SNAPSHOT,
          data: snapshot
        });
      }

      this.lastSnapshot = snapshot;

      this.log('info', 'Form capture completed successfully', {
        formCount: formControls.length,
        snapshotSize: encodedSnapshot.length
      });

      // Show success notification
      this.showNotification(
        'Forms Captured',
        `Successfully captured ${formControls.length} form controls. Snapshot copied to clipboard.`,
        NOTIFICATION_TYPES.SUCCESS
      );

      return {
        formCount: formControls.length,
        snapshot: snapshot,
        encodedSnapshot: encodedSnapshot,
        message: 'Forms captured successfully'
      };

    } catch (error) {
      this.log('error', 'Form capture failed', error);

      this.showNotification(
        'Capture Failed',
        `Failed to capture forms: ${error.message}`,
        NOTIFICATION_TYPES.ERROR
      );

      throw error;
    }
  }

  /**
   * Restores form control values
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async restoreForms(options = {}) {
    try {
      this.log('info', 'Starting form restoration', options);

      let snapshot;

      // Get snapshot data
      if (options.snapshot) {
        snapshot = options.snapshot;
      } else if (options.encodedSnapshot) {
        snapshot = await window.AngularFormSnapshotUtils.DataEncoder.decodeFormData(options.encodedSnapshot);
      } else if (options.fromClipboard !== false) {
        const clipboardData = await this.readFromClipboard();
        snapshot = await window.AngularFormSnapshotUtils.DataEncoder.decodeFormData(clipboardData);
      } else {
        throw new Error('No snapshot data provided');
      }

      if (!snapshot || !snapshot.formControls) {
        throw new Error('Invalid snapshot data');
      }

      // Get current form controls
      const currentFormControls = await window.AngularFormSnapshotUtils.FormControlInspector.inspectAllFormControls();
      const currentControlsMap = new Map();

      currentFormControls.forEach(control => {
        const key = this.generateControlKey(control);
        currentControlsMap.set(key, control);
      });

      let restoredCount = 0;
      let skippedCount = 0;
      const errors = [];

      // Restore each form control
      for (const snapshotControl of snapshot.formControls) {
        try {
          const key = this.generateControlKey(snapshotControl);
          const currentControl = currentControlsMap.get(key);

          if (!currentControl) {
            skippedCount++;
            this.log('debug', `Control not found for restoration: ${key}`);
            continue;
          }

          // Restore the value
          await this.restoreControlValue(currentControl, snapshotControl);
          restoredCount++;

        } catch (error) {
          errors.push({
            control: snapshotControl.name || snapshotControl.path,
            error: error.message
          });
          this.log('warn', `Failed to restore control: ${snapshotControl.name}`, error);
        }
      }

      this.log('info', 'Form restoration completed', {
        restoredCount,
        skippedCount,
        errorCount: errors.length
      });

      // Show notification
      if (restoredCount > 0) {
        this.showNotification(
          'Forms Restored',
          `Successfully restored ${restoredCount} form controls${skippedCount > 0 ? ` (${skippedCount} skipped)` : ''}.`,
          errors.length > 0 ? NOTIFICATION_TYPES.WARNING : NOTIFICATION_TYPES.SUCCESS
        );
      } else {
        this.showNotification(
          'No Forms Restored',
          'No matching form controls found for restoration.',
          NOTIFICATION_TYPES.WARNING
        );
      }

      return {
        restoredCount,
        skippedCount,
        errorCount: errors.length,
        errors,
        message: 'Form restoration completed'
      };

    } catch (error) {
      this.log('error', 'Form restoration failed', error);

      this.showNotification(
        'Restore Failed',
        `Failed to restore forms: ${error.message}`,
        NOTIFICATION_TYPES.ERROR
      );

      throw error;
    }
  }

  /**
   * Restores a single control value
   * @param {Object} currentControl
   * @param {Object} snapshotControl
   */
  async restoreControlValue(currentControl, snapshotControl) {
    const element = currentControl.element;
    const value = snapshotControl.value;

    if (!element) {
      throw new Error('Control element not found');
    }

    // Skip if readonly or disabled
    if (element.readOnly || element.disabled) {
      throw new Error('Control is readonly or disabled');
    }

    // Restore based on control type
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = Boolean(value);
    } else if (element.tagName.toLowerCase() === 'select') {
      await this.restoreSelectValue(element, value);
    } else {
      element.value = value || '';
    }

    // Trigger change events
    window.AngularFormSnapshotUtils.DOMUtils.triggerChangeEvent(element, value);

    // Special handling for Angular Material components
    if (currentControl.type === 'material_form_control') {
      await this.restoreMaterialValue(element, value);
    }
  }

  /**
   * Restores select element value
   * @param {HTMLSelectElement} element
   * @param {any} value
   */
  async restoreSelectValue(element, value) {
    // Find matching option
    const options = Array.from(element.options);
    const matchingOption = options.find(option =>
      option.value === value || option.textContent === value
    );

    if (matchingOption) {
      element.selectedIndex = matchingOption.index;
    } else {
      throw new Error(`Option not found: ${value}`);
    }
  }

  /**
   * Restores Angular Material component value
   * @param {Element} element
   * @param {any} value
   */
  async restoreMaterialValue(element, value) {
    // For mat-select and other Material components,
    // we might need to use Angular's programmatic API
    if (element.tagName.toLowerCase() === 'mat-select') {
      // Try to trigger click and select option
      const matOptions = document.querySelectorAll('mat-option');
      const matchingOption = Array.from(matOptions).find(option =>
        option.getAttribute('value') === value || option.textContent.trim() === value
      );

      if (matchingOption) {
        matchingOption.click();
      }
    }
  }

  /**
   * Generates a unique key for form control matching
   * @param {Object} control
   * @returns {string}
   */
  generateControlKey(control) {
    // Create a composite key for matching controls
    const parts = [
      control.name || '',
      control.tagName || '',
      control.path || '',
      JSON.stringify(control.attributes || {})
    ];

    return parts.filter(part => part).join('|');
  }

  /**
   * Copies text to clipboard
   * @param {string} text
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch (error) {
      this.log('error', 'Failed to copy to clipboard', error);
      throw new Error('Failed to copy to clipboard');
    }
  }

  /**
   * Reads text from clipboard
   * @returns {Promise<string>}
   */
  async readFromClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        return await navigator.clipboard.readText();
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (error) {
      this.log('error', 'Failed to read from clipboard', error);
      throw new Error('Failed to read from clipboard');
    }
  }

  /**
   * Shows notification to user
   * @param {string} title
   * @param {string} message
   * @param {string} type
   */
  showNotification(title, message, type = NOTIFICATION_TYPES.INFO) {
    // Create notification element
    const notification = this.createNotificationElement(title, message, type);

    // Show notification
    document.body.appendChild(notification);

    // Auto-remove after delay
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Creates notification DOM element
   * @param {string} title
   * @param {string} message
   * @param {string} type
   * @returns {Element}
   */
  createNotificationElement(title, message, type) {
    const notification = document.createElement('div');
    notification.className = `angular-snapshot-notification angular-snapshot-${type}`;

    notification.innerHTML = `
      <div class="angular-snapshot-notification-content">
        <div class="angular-snapshot-notification-title">${title}</div>
        <div class="angular-snapshot-notification-message">${message}</div>
        <button class="angular-snapshot-notification-close">&times;</button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = this.getNotificationStyles();
    if (!document.querySelector('#angular-snapshot-notification-styles')) {
      style.id = 'angular-snapshot-notification-styles';
      document.head.appendChild(style);
    }

    // Add close functionality
    const closeButton = notification.querySelector('.angular-snapshot-notification-close');
    closeButton.addEventListener('click', () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });

    return notification;
  }

  /**
   * Gets notification CSS styles
   * @returns {string}
   */
  getNotificationStyles() {
    return `
      .angular-snapshot-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        border-left: 4px solid #007acc;
      }

      .angular-snapshot-notification.angular-snapshot-success {
        border-left-color: #28a745;
      }

      .angular-snapshot-notification.angular-snapshot-warning {
        border-left-color: #ffc107;
      }

      .angular-snapshot-notification.angular-snapshot-error {
        border-left-color: #dc3545;
      }

      .angular-snapshot-notification-content {
        padding: 16px;
        position: relative;
      }

      .angular-snapshot-notification-title {
        font-weight: 600;
        font-size: 14px;
        color: #333;
        margin-bottom: 4px;
      }

      .angular-snapshot-notification-message {
        font-size: 13px;
        color: #666;
        line-height: 1.4;
      }

      .angular-snapshot-notification-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        font-size: 18px;
        color: #999;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
      }

      .angular-snapshot-notification-close:hover {
        color: #333;
      }
    `;
  }

  /**
   * Sets up DOM observers
   */
  setupDOMObservers() {
    // Observe DOM changes for dynamic forms
    const observer = new MutationObserver((mutations) => {
      const hasFormChanges = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
          return node.nodeType === Node.ELEMENT_NODE && (
            node.matches && node.matches('form, input, select, textarea, [formControl], [formControlName], [ngModel]') ||
            node.querySelector && node.querySelector('form, input, select, textarea, [formControl], [formControlName], [ngModel]')
          );
        });
      });

      if (hasFormChanges) {
        this.debounce('formScan', () => {
          this.scanForms();
        }, CONTENT_SCRIPT_CONFIG.DEBOUNCE_DELAY);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.set('domMutation', observer);
  }

  /**
   * Sets up keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    const handleKeyDown = (event) => {
      // Ctrl+Shift+F or Cmd+Shift+F - Capture forms
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        this.captureForms({ source: 'keyboard_shortcut' });
      }

      // Ctrl+Shift+R or Cmd+Shift+R - Restore forms
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        this.restoreForms({ source: 'keyboard_shortcut' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    this.eventListeners.set('keydown', handleKeyDown);
  }

  /**
   * Initializes UI components
   */
  initializeUI() {
    // Could add floating action buttons or other UI elements here
    this.log('debug', 'UI components initialized');
  }

  /**
   * Debounce utility
   * @param {string} key
   * @param {Function} func
   * @param {number} delay
   */
  debounce(key, func, delay) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    const timer = setTimeout(() => {
      func();
      this.debounceTimers.delete(key);
    }, delay);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Logging utility
   * @param {string} level
   * @param {string} message
   * @param {any} data
   */
  log(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      source: 'content-script'
    };

    console[level](`[Angular Form Snapshot] ${message}`, data);

    // Send log to background script for storage
    if (level === 'error' || level === 'warn') {
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.LOG_MESSAGE,
        data: logEntry
      }).catch(() => {
        // Ignore errors when sending logs
      });
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Remove event listeners
    this.eventListeners.forEach((listener, event) => {
      document.removeEventListener(event, listener);
    });
    this.eventListeners.clear();

    // Disconnect observers
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();

    // Clear timers
    this.debounceTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.debounceTimers.clear();

    // Remove message listener
    if (chrome.runtime.onMessage.hasListener(this.handleMessage)) {
      chrome.runtime.onMessage.removeListener(this.handleMessage);
    }

    this.log('info', 'Content script cleanup completed');
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.angularFormSnapshotContent = new AngularFormSnapshotContent();
    window.angularFormSnapshotContent.initialize();
  });
} else {
  window.angularFormSnapshotContent = new AngularFormSnapshotContent();
  window.angularFormSnapshotContent.initialize();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.angularFormSnapshotContent) {
    window.angularFormSnapshotContent.cleanup();
  }
});

// Export for testing and debugging
window.AngularFormSnapshotContent = AngularFormSnapshotContent;
