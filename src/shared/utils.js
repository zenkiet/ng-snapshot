/**
 * Angular Form Snapshot - Shared Utilities
 * Professional utility functions for Angular form state management
 *
 * @author Angular DevTools Team
 * @version 1.0.0
 * @description Core utilities for Angular detection, form inspection, and data manipulation
 */

'use strict';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const ANGULAR_GLOBALS = [
  'ng',
  'getAllAngularRootElements',
  'getAngularTestability',
  'ngDevMode'
];

const FORM_CONTROL_SELECTORS = [
  '[formcontrolname]',
  '[formControl]',
  '[ngModel]',
  'input[name]',
  'select[name]',
  'textarea[name]',
  'mat-form-field input',
  'mat-form-field select',
  'mat-form-field textarea'
];

const ENCODING_CONFIG = {
  VERSION: '1.0',
  SEPARATOR: '|',
  COMPRESSION_THRESHOLD: 1024,
  MAX_SNAPSHOT_SIZE: 5 * 1024 * 1024, // 5MB
  CHECKSUM_ALGORITHM: 'SHA-256'
};

// ============================================================================
// CORE UTILITY CLASSES
// ============================================================================

/**
 * Professional Angular Detection System
 */
class AngularDetector {
  /**
   * Detects Angular application in current page
   * @returns {Promise<{detected: boolean, version: string|null, rootElements: Element[]}>}
   */
  static async detectAngular() {
    try {
      const detection = {
        detected: false,
        version: null,
        rootElements: [],
        zones: [],
        injectors: [],
        changeDetectors: []
      };

      // Method 1: Check for global Angular objects
      const hasAngularGlobals = ANGULAR_GLOBALS.some(global => window[global]);
      if (hasAngularGlobals) {
        detection.detected = true;
        detection.version = await this.getAngularVersion();
      }

      // Method 2: Check for Angular root elements
      const rootElements = this.findAngularRootElements();
      if (rootElements.length > 0) {
        detection.detected = true;
        detection.rootElements = rootElements;
      }

      // Method 3: Check for Angular-specific attributes
      const angularAttributes = document.querySelectorAll('[ng-version], [ng-app], [data-ng-app]');
      if (angularAttributes.length > 0) {
        detection.detected = true;
        detection.version = angularAttributes[0].getAttribute('ng-version') || detection.version;
      }

      // Method 4: Check for Angular components in DOM
      const components = this.findAngularComponents();
      if (components.length > 0) {
        detection.detected = true;
      }

      // Method 5: Check for Zone.js
      if (window.Zone && window.Zone.current) {
        detection.detected = true;
        detection.zones.push(window.Zone.current.name);
      }

      return detection;
    } catch (error) {
      console.error('[AngularDetector] Detection failed:', error);
      return { detected: false, version: null, rootElements: [] };
    }
  }

  /**
   * Gets Angular version from various sources
   * @returns {Promise<string|null>}
   */
  static async getAngularVersion() {
    try {
      // Try ng global
      if (window.ng && window.ng.coreTokens) {
        return window.ng.coreTokens.VERSION?.full || null;
      }

      // Try getAllAngularRootElements
      if (window.getAllAngularRootElements) {
        const rootElements = window.getAllAngularRootElements();
        if (rootElements.length > 0) {
          const version = rootElements[0].getAttribute('ng-version');
          if (version) return version;
        }
      }

      // Try version from DOM
      const versionElements = document.querySelectorAll('[ng-version]');
      if (versionElements.length > 0) {
        return versionElements[0].getAttribute('ng-version');
      }

      return null;
    } catch (error) {
      console.error('[AngularDetector] Version detection failed:', error);
      return null;
    }
  }

  /**
   * Finds Angular root elements
   * @returns {Element[]}
   */
  static findAngularRootElements() {
    const rootElements = [];

    try {
      // Method 1: Use Angular's built-in function
      if (window.getAllAngularRootElements) {
        rootElements.push(...window.getAllAngularRootElements());
      }

      // Method 2: Find elements with ng-version
      const versionElements = document.querySelectorAll('[ng-version]');
      versionElements.forEach(el => {
        if (!rootElements.includes(el)) {
          rootElements.push(el);
        }
      });

      // Method 3: Find app-root or similar
      const appRoots = document.querySelectorAll('app-root, [ng-app], [data-ng-app]');
      appRoots.forEach(el => {
        if (!rootElements.includes(el)) {
          rootElements.push(el);
        }
      });

    } catch (error) {
      console.error('[AngularDetector] Root element detection failed:', error);
    }

    return rootElements;
  }

  /**
   * Finds Angular components in DOM
   * @returns {Element[]}
   */
  static findAngularComponents() {
    const components = [];

    try {
      // Look for elements with Angular-specific attributes
      const selectors = [
        '[ng-reflect-name]',
        '[ng-reflect-model]',
        '[_ngcontent-]',
        '[_nghost-]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (!components.includes(el)) {
            components.push(el);
          }
        });
      });

    } catch (error) {
      console.error('[AngularDetector] Component detection failed:', error);
    }

    return components;
  }
}

/**
 * Advanced Form Control Inspector
 */
class FormControlInspector {
  /**
   * Inspects all form controls in the current page
   * @returns {Promise<FormControlData[]>}
   */
  static async inspectAllFormControls() {
    try {
      const formControls = [];
      const processedElements = new Set();

      // Method 1: Angular-specific selectors
      const angularControls = await this.findAngularFormControls();
      angularControls.forEach(control => {
        if (!processedElements.has(control.element)) {
          formControls.push(control);
          processedElements.add(control.element);
        }
      });

      // Method 2: Generic form controls
      const genericControls = await this.findGenericFormControls();
      genericControls.forEach(control => {
        if (!processedElements.has(control.element)) {
          formControls.push(control);
          processedElements.add(control.element);
        }
      });

      // Method 3: Material Design controls
      const materialControls = await this.findMaterialFormControls();
      materialControls.forEach(control => {
        if (!processedElements.has(control.element)) {
          formControls.push(control);
          processedElements.add(control.element);
        }
      });

      return formControls;
    } catch (error) {
      console.error('[FormControlInspector] Inspection failed:', error);
      return [];
    }
  }

  /**
   * Finds Angular-specific form controls
   * @returns {Promise<FormControlData[]>}
   */
  static async findAngularFormControls() {
    const controls = [];

    try {
      // FormControl directive
      const formControlElements = document.querySelectorAll('[formControl]');
      formControlElements.forEach(element => {
        const controlData = this.extractAngularFormControlData(element);
        if (controlData) controls.push(controlData);
      });

      // FormControlName directive
      const formControlNameElements = document.querySelectorAll('[formControlName]');
      formControlNameElements.forEach(element => {
        const controlData = this.extractAngularFormControlNameData(element);
        if (controlData) controls.push(controlData);
      });

      // NgModel directive
      const ngModelElements = document.querySelectorAll('[ngModel]');
      ngModelElements.forEach(element => {
        const controlData = this.extractNgModelData(element);
        if (controlData) controls.push(controlData);
      });

    } catch (error) {
      console.error('[FormControlInspector] Angular form control detection failed:', error);
    }

    return controls;
  }

  /**
   * Extracts Angular FormControl data
   * @param {Element} element
   * @returns {FormControlData|null}
   */
  static extractAngularFormControlData(element) {
    try {
      const controlData = {
        id: this.generateControlId(element),
        type: 'angular_form_control',
        element: element,
        tagName: element.tagName.toLowerCase(),
        name: element.getAttribute('formControl'),
        value: this.extractElementValue(element),
        attributes: this.extractElementAttributes(element),
        validators: this.extractValidators(element),
        path: this.generateElementPath(element),
        parentForm: this.findParentForm(element),
        metadata: {
          isDisabled: element.disabled || false,
          isReadonly: element.readOnly || false,
          isRequired: element.required || false,
          placeholder: element.placeholder || '',
          className: element.className || ''
        }
      };

      return controlData;
    } catch (error) {
      console.error('[FormControlInspector] FormControl data extraction failed:', error);
      return null;
    }
  }

  /**
   * Extracts Angular FormControlName data
   * @param {Element} element
   * @returns {FormControlData|null}
   */
  static extractAngularFormControlNameData(element) {
    try {
      const controlData = {
        id: this.generateControlId(element),
        type: 'angular_form_control_name',
        element: element,
        tagName: element.tagName.toLowerCase(),
        name: element.getAttribute('formControlName'),
        value: this.extractElementValue(element),
        attributes: this.extractElementAttributes(element),
        validators: this.extractValidators(element),
        path: this.generateElementPath(element),
        parentForm: this.findParentForm(element),
        formGroupName: this.findFormGroupName(element),
        metadata: {
          isDisabled: element.disabled || false,
          isReadonly: element.readOnly || false,
          isRequired: element.required || false,
          placeholder: element.placeholder || '',
          className: element.className || ''
        }
      };

      return controlData;
    } catch (error) {
      console.error('[FormControlInspector] FormControlName data extraction failed:', error);
      return null;
    }
  }

  /**
   * Extracts NgModel data
   * @param {Element} element
   * @returns {FormControlData|null}
   */
  static extractNgModelData(element) {
    try {
      const controlData = {
        id: this.generateControlId(element),
        type: 'angular_ng_model',
        element: element,
        tagName: element.tagName.toLowerCase(),
        name: element.getAttribute('ngModel') || element.name,
        value: this.extractElementValue(element),
        attributes: this.extractElementAttributes(element),
        validators: this.extractValidators(element),
        path: this.generateElementPath(element),
        parentForm: this.findParentForm(element),
        metadata: {
          isDisabled: element.disabled || false,
          isReadonly: element.readOnly || false,
          isRequired: element.required || false,
          placeholder: element.placeholder || '',
          className: element.className || ''
        }
      };

      return controlData;
    } catch (error) {
      console.error('[FormControlInspector] NgModel data extraction failed:', error);
      return null;
    }
  }

  /**
   * Finds generic form controls
   * @returns {Promise<FormControlData[]>}
   */
  static async findGenericFormControls() {
    const controls = [];

    try {
      const formElements = document.querySelectorAll('input, select, textarea');
      formElements.forEach(element => {
        // Skip if already processed by Angular-specific methods
        if (element.hasAttribute('formControl') ||
            element.hasAttribute('formControlName') ||
            element.hasAttribute('ngModel')) {
          return;
        }

        const controlData = this.extractGenericFormControlData(element);
        if (controlData) controls.push(controlData);
      });

    } catch (error) {
      console.error('[FormControlInspector] Generic form control detection failed:', error);
    }

    return controls;
  }

  /**
   * Extracts generic form control data
   * @param {Element} element
   * @returns {FormControlData|null}
   */
  static extractGenericFormControlData(element) {
    try {
      const controlData = {
        id: this.generateControlId(element),
        type: 'generic_form_control',
        element: element,
        tagName: element.tagName.toLowerCase(),
        name: element.name || element.id || '',
        value: this.extractElementValue(element),
        attributes: this.extractElementAttributes(element),
        validators: this.extractValidators(element),
        path: this.generateElementPath(element),
        parentForm: this.findParentForm(element),
        metadata: {
          isDisabled: element.disabled || false,
          isReadonly: element.readOnly || false,
          isRequired: element.required || false,
          placeholder: element.placeholder || '',
          className: element.className || ''
        }
      };

      return controlData;
    } catch (error) {
      console.error('[FormControlInspector] Generic form control data extraction failed:', error);
      return null;
    }
  }

  /**
   * Finds Material Design form controls
   * @returns {Promise<FormControlData[]>}
   */
  static async findMaterialFormControls() {
    const controls = [];

    try {
      const matFormFields = document.querySelectorAll('mat-form-field');
      matFormFields.forEach(formField => {
        const input = formField.querySelector('input, select, textarea, mat-select');
        if (input) {
          const controlData = this.extractMaterialFormControlData(input, formField);
          if (controlData) controls.push(controlData);
        }
      });

    } catch (error) {
      console.error('[FormControlInspector] Material form control detection failed:', error);
    }

    return controls;
  }

  /**
   * Extracts Material Design form control data
   * @param {Element} input
   * @param {Element} formField
   * @returns {FormControlData|null}
   */
  static extractMaterialFormControlData(input, formField) {
    try {
      const controlData = {
        id: this.generateControlId(input),
        type: 'material_form_control',
        element: input,
        tagName: input.tagName.toLowerCase(),
        name: input.getAttribute('formControlName') || input.name || '',
        value: this.extractElementValue(input),
        attributes: this.extractElementAttributes(input),
        validators: this.extractValidators(input),
        path: this.generateElementPath(input),
        parentForm: this.findParentForm(input),
        materialFormField: formField,
        metadata: {
          isDisabled: input.disabled || false,
          isReadonly: input.readOnly || false,
          isRequired: input.required || false,
          placeholder: input.placeholder || '',
          className: input.className || '',
          matLabel: formField.querySelector('mat-label')?.textContent || '',
          matHint: formField.querySelector('mat-hint')?.textContent || '',
          matError: formField.querySelector('mat-error')?.textContent || ''
        }
      };

      return controlData;
    } catch (error) {
      console.error('[FormControlInspector] Material form control data extraction failed:', error);
      return null;
    }
  }

  // Helper methods
  static generateControlId(element) {
    return `ctrl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static extractElementValue(element) {
    if (element.type === 'checkbox' || element.type === 'radio') {
      return element.checked;
    }
    return element.value || '';
  }

  static extractElementAttributes(element) {
    const attributes = {};
    for (const attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }

  static extractValidators(element) {
    const validators = [];

    if (element.required) validators.push('required');
    if (element.pattern) validators.push(`pattern:${element.pattern}`);
    if (element.minLength) validators.push(`minLength:${element.minLength}`);
    if (element.maxLength) validators.push(`maxLength:${element.maxLength}`);
    if (element.min) validators.push(`min:${element.min}`);
    if (element.max) validators.push(`max:${element.max}`);
    if (element.type === 'email') validators.push('email');
    if (element.type === 'url') validators.push('url');
    if (element.type === 'number') validators.push('number');

    return validators;
  }

  static generateElementPath(element) {
    const path = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className) {
        selector += `.${current.className.split(' ').join('.')}`;
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  static findParentForm(element) {
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName.toLowerCase() === 'form' || parent.hasAttribute('formGroup')) {
        return {
          element: parent,
          name: parent.getAttribute('formGroup') || parent.name || '',
          action: parent.action || '',
          method: parent.method || 'GET'
        };
      }
      parent = parent.parentElement;
    }
    return null;
  }

  static findFormGroupName(element) {
    let parent = element.parentElement;
    while (parent) {
      if (parent.hasAttribute('formGroupName')) {
        return parent.getAttribute('formGroupName');
      }
      parent = parent.parentElement;
    }
    return null;
  }
}

/**
 * Advanced Data Encoder/Decoder
 */
class DataEncoder {
  /**
   * Encodes form data into a compressed string
   * @param {FormControlData[]} formControls
   * @returns {Promise<string>}
   */
  static async encodeFormData(formControls) {
    try {
      const snapshot = {
        version: ENCODING_CONFIG.VERSION,
        timestamp: Date.now(),
        url: window.location.href,
        title: document.title,
        userAgent: navigator.userAgent,
        formControls: formControls.map(ctrl => ({
          id: ctrl.id,
          type: ctrl.type,
          name: ctrl.name,
          value: ctrl.value,
          path: ctrl.path,
          tagName: ctrl.tagName,
          attributes: ctrl.attributes,
          validators: ctrl.validators,
          metadata: ctrl.metadata
        }))
      };

      const jsonString = JSON.stringify(snapshot);
      const compressed = await this.compressData(jsonString);
      const encoded = await this.encodeData(compressed);
      const checksum = await this.calculateChecksum(encoded);

      return `${ENCODING_CONFIG.VERSION}${ENCODING_CONFIG.SEPARATOR}${checksum}${ENCODING_CONFIG.SEPARATOR}${encoded}`;
    } catch (error) {
      console.error('[DataEncoder] Encoding failed:', error);
      throw new Error(`Data encoding failed: ${error.message}`);
    }
  }

  /**
   * Decodes form data from compressed string
   * @param {string} encodedData
   * @returns {Promise<Object>}
   */
  static async decodeFormData(encodedData) {
    try {
      const parts = encodedData.split(ENCODING_CONFIG.SEPARATOR);
      if (parts.length !== 3) {
        throw new Error('Invalid encoded data format');
      }

      const [version, checksum, data] = parts;

      if (version !== ENCODING_CONFIG.VERSION) {
        throw new Error(`Unsupported version: ${version}`);
      }

      // Verify checksum
      const calculatedChecksum = await this.calculateChecksum(data);
      if (checksum !== calculatedChecksum) {
        throw new Error('Data integrity check failed');
      }

      const decoded = await this.decodeData(data);
      const decompressed = await this.decompressData(decoded);
      const snapshot = JSON.parse(decompressed);

      return snapshot;
    } catch (error) {
      console.error('[DataEncoder] Decoding failed:', error);
      throw new Error(`Data decoding failed: ${error.message}`);
    }
  }

  static async compressData(data) {
    // Simple compression using deflate-like algorithm
    if (data.length < ENCODING_CONFIG.COMPRESSION_THRESHOLD) {
      return data;
    }

    // Use browser's compression if available
    if ('CompressionStream' in window) {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(new TextEncoder().encode(data));
      writer.close();

      const chunks = [];
      let result = await reader.read();
      while (!result.done) {
        chunks.push(result.value);
        result = await reader.read();
      }

      return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
    }

    // Fallback: simple dictionary compression
    return this.dictionaryCompress(data);
  }

  static async decompressData(data) {
    if (typeof data === 'string') {
      return data; // Not compressed
    }

    // Use browser's decompression if available
    if ('DecompressionStream' in window && data instanceof Uint8Array) {
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(data);
      writer.close();

      const chunks = [];
      let result = await reader.read();
      while (!result.done) {
        chunks.push(result.value);
        result = await reader.read();
      }

      return new TextDecoder().decode(new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], [])));
    }

    // Fallback: dictionary decompression
    return this.dictionaryDecompress(data);
  }

  static dictionaryCompress(data) {
    const dictionary = {};
    const compressed = [];
    let dictIndex = 0;

    // Build dictionary of common strings
    const words = data.match(/\b\w+\b/g) || [];
    const wordCounts = {};

    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Add frequently used words to dictionary
    Object.entries(wordCounts)
      .filter(([word, count]) => count > 2 && word.length > 3)
      .forEach(([word]) => {
        dictionary[word] = `§${dictIndex++}§`;
      });

    let result = data;
    Object.entries(dictionary).forEach(([word, token]) => {
      result = result.replace(new RegExp(`\\b${word}\\b`, 'g'), token);
    });

    return { dictionary, data: result };
  }

  static dictionaryDecompress(compressed) {
    if (typeof compressed === 'string') {
      return compressed;
    }

    const { dictionary, data } = compressed;
    let result = data;

    Object.entries(dictionary).forEach(([word, token]) => {
      result = result.replace(new RegExp(token, 'g'), word);
    });

    return result;
  }

  static async encodeData(data) {
    // Convert to base64 with URL-safe characters
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  static async decodeData(encodedData) {
    // Decode from URL-safe base64
    const base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    return decodeURIComponent(escape(atob(padded)));
  }

  static async calculateChecksum(data) {
    if (crypto.subtle) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    }

    // Fallback: simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}

/**
 * DOM Utilities
 */
class DOMUtils {
  /**
   * Safely executes a function in the page context
   * @param {Function} fn
   * @param {...any} args
   * @returns {Promise<any>}
   */
  static async executeInPageContext(fn, ...args) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const functionId = `_angularSnapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      script.textContent = `
        (function() {
          try {
            const result = (${fn.toString()}).apply(null, ${JSON.stringify(args)});
            window['${functionId}'] = result;
            document.dispatchEvent(new CustomEvent('${functionId}', { detail: result }));
          } catch (error) {
            document.dispatchEvent(new CustomEvent('${functionId}', { detail: { error: error.message } }));
          }
        })();
      `;

      const cleanup = () => {
        document.head.removeChild(script);
        delete window[functionId];
      };

      document.addEventListener(functionId, (event) => {
        const result = event.detail;
        cleanup();

        if (result && result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      }, { once: true });

      document.head.appendChild(script);

      // Cleanup after timeout
      setTimeout(() => {
        cleanup();
        reject(new Error('Function execution timeout'));
      }, 10000);
    });
  }

  /**
   * Waits for element to be available
   * @param {string} selector
   * @param {number} timeout
   * @returns {Promise<Element>}
   */
  static async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations) => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element not found: ${selector}`));
      }, timeout);
    });
  }

  /**
   * Triggers change events on form elements
   * @param {Element} element
   * @param {any} value
   */
  static triggerChangeEvent(element, value) {
    // Set the value
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = value;
    } else {
      element.value = value;
    }

    // Trigger events
    const events = ['input', 'change', 'blur'];
    events.forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      element.dispatchEvent(event);
    });

    // Trigger Angular-specific events
    if (element.hasAttribute('formControlName') || element.hasAttribute('ngModel')) {
      const ngEvent = new CustomEvent('ng-change', { bubbles: true, detail: { value } });
      element.dispatchEvent(ngEvent);
    }
  }
}

/**
 * Error Handling Utilities
 */
class ErrorHandler {
  /**
   * Wraps async functions with error handling
   * @param {Function} fn
   * @returns {Function}
   */
  static wrap(fn) {
    return async (...args) => {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        console.error(`[${fn.name}] Error:`, error);
        throw error;
      }
    };
  }

  /**
   * Creates error with context
   * @param {string} message
   * @param {Object} context
   * @returns {Error}
   */
  static createError(message, context = {}) {
    const error = new Error(message);
    error.context = context;
    error.timestamp = new Date().toISOString();
    return error;
  }
}

// Export utilities to global scope
window.AngularFormSnapshotUtils = {
  AngularDetector,
  FormControlInspector,
  DataEncoder,
  DOMUtils,
  ErrorHandler,
  ENCODING_CONFIG,
  FORM_CONTROL_SELECTORS
};
