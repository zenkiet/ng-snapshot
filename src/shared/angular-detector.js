/**
 * Angular Form Snapshot - Specialized Angular Detector
 * Advanced Angular application and component detection system
 *
 * @author Angular DevTools Team
 * @version 1.0.0
 * @description Professional Angular detection with comprehensive form analysis capabilities
 */

'use strict';

// ============================================================================
// ANGULAR DETECTION CONSTANTS
// ============================================================================

const ANGULAR_SIGNATURES = {
  GLOBAL_OBJECTS: [
    'ng',
    'getAllAngularRootElements',
    'getAngularTestability',
    'ngDevMode',
    'ngI18nClosureMode'
  ],

  WINDOW_PROPERTIES: [
    'Zone',
    'ngZone',
    'ApplicationRef',
    'ComponentFactory',
    'NgModuleFactory'
  ],

  DOM_ATTRIBUTES: [
    'ng-version',
    'ng-app',
    'data-ng-app',
    'ng-controller',
    'ng-bind',
    'ng-model',
    'ng-repeat',
    'ng-if',
    'ng-show',
    'ng-hide',
    'ng-class',
    'ng-style',
    'ng-src',
    'ng-href',
    'ng-click',
    'ng-submit',
    'ng-form',
    'ng-dirty',
    'ng-pristine',
    'ng-valid',
    'ng-invalid',
    'ng-pending',
    'ng-touched',
    'ng-untouched'
  ],

  ANGULAR_DIRECTIVES: [
    'formGroup',
    'formControl',
    'formControlName',
    'formArray',
    'formGroupName',
    'formArrayName',
    'ngModel',
    'ngModelGroup',
    'ngForm',
    'ngSubmit',
    'ngNonBindable'
  ],

  COMPONENT_SELECTORS: [
    'app-root',
    'app-component',
    'ng-component',
    'angular-component',
    '[ng-app]',
    '[data-ng-app]',
    '[ng-controller]',
    '[ng-view]',
    '[ui-view]',
    'router-outlet',
    'ng-container',
    'ng-template',
    'ng-content'
  ],

  ANGULAR_CLASSES: [
    '_ngcontent-',
    '_nghost-',
    'ng-scope',
    'ng-isolate-scope',
    'ng-binding',
    'ng-dirty',
    'ng-pristine',
    'ng-valid',
    'ng-invalid',
    'ng-pending',
    'ng-touched',
    'ng-untouched',
    'ng-submitted',
    'ng-animate',
    'ng-enter',
    'ng-leave',
    'ng-move'
  ],

  MATERIAL_SELECTORS: [
    'mat-form-field',
    'mat-input',
    'mat-select',
    'mat-option',
    'mat-checkbox',
    'mat-radio-button',
    'mat-radio-group',
    'mat-slide-toggle',
    'mat-slider',
    'mat-datepicker',
    'mat-autocomplete',
    'mat-chip-list',
    'mat-button-toggle',
    'mat-stepper',
    'mat-tab-group',
    'mat-expansion-panel'
  ],

  CDK_SELECTORS: [
    'cdk-overlay-container',
    'cdk-global-overlay-wrapper',
    'cdk-overlay-pane',
    'cdk-overlay-backdrop',
    'cdk-visually-hidden',
    'cdk-live-announcer-element',
    'cdk-describedby-message-container'
  ]
};

const ANGULAR_VERSIONS = {
  ANGULARJS: 'AngularJS',
  ANGULAR_2: 'Angular 2',
  ANGULAR_4: 'Angular 4',
  ANGULAR_5: 'Angular 5',
  ANGULAR_6: 'Angular 6',
  ANGULAR_7: 'Angular 7',
  ANGULAR_8: 'Angular 8',
  ANGULAR_9: 'Angular 9',
  ANGULAR_10: 'Angular 10',
  ANGULAR_11: 'Angular 11',
  ANGULAR_12: 'Angular 12',
  ANGULAR_13: 'Angular 13',
  ANGULAR_14: 'Angular 14',
  ANGULAR_15: 'Angular 15',
  ANGULAR_16: 'Angular 16',
  ANGULAR_17: 'Angular 17',
  ANGULAR_18: 'Angular 18',
  UNKNOWN: 'Unknown'
};

// ============================================================================
// MAIN ANGULAR DETECTOR CLASS
// ============================================================================

class AngularDetector {
  constructor() {
    this.detectionCache = new Map();
    this.detectionTimeout = 30000; // 30 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Comprehensive Angular detection with caching
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise<AngularDetectionResult>}
   */
  async detectAngular(forceRefresh = false) {
    const cacheKey = window.location.href;

    if (!forceRefresh && this.detectionCache.has(cacheKey)) {
      const cached = this.detectionCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.detectionTimeout) {
        return cached.result;
      }
    }

    const result = await this.performDetection();

    this.detectionCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Performs comprehensive Angular detection
   * @returns {Promise<AngularDetectionResult>}
   */
  async performDetection() {
    const startTime = Date.now();

    const result = {
      detected: false,
      version: ANGULAR_VERSIONS.UNKNOWN,
      versionNumber: null,
      framework: null,
      confidence: 0,
      rootElements: [],
      components: [],
      services: [],
      modules: [],
      forms: {
        reactive: [],
        template: [],
        material: []
      },
      features: {
        routing: false,
        http: false,
        animations: false,
        material: false,
        cdk: false,
        ivy: false,
        standalone: false,
        signals: false
      },
      diagnostics: {
        detectionTime: 0,
        methods: [],
        errors: []
      },
      metadata: {
        buildMode: null,
        bundler: null,
        typescript: false,
        sourceMap: false
      }
    };

    try {
      // Method 1: Global object detection
      await this.detectGlobalObjects(result);

      // Method 2: DOM analysis
      await this.detectDOMSignatures(result);

      // Method 3: Component analysis
      await this.detectComponents(result);

      // Method 4: Service and dependency injection
      await this.detectServices(result);

      // Method 5: Module detection
      await this.detectModules(result);

      // Method 6: Form system analysis
      await this.detectFormSystems(result);

      // Method 7: Feature detection
      await this.detectFeatures(result);

      // Method 8: Version analysis
      await this.detectVersion(result);

      // Method 9: Build and environment analysis
      await this.detectBuildEnvironment(result);

      // Calculate confidence score
      result.confidence = this.calculateConfidence(result);

      // Determine if Angular is detected
      result.detected = result.confidence > 0.3;

    } catch (error) {
      result.diagnostics.errors.push({
        method: 'performDetection',
        error: error.message,
        stack: error.stack
      });
    }

    result.diagnostics.detectionTime = Date.now() - startTime;
    return result;
  }

  /**
   * Detects Angular global objects
   * @param {AngularDetectionResult} result
   */
  async detectGlobalObjects(result) {
    const method = 'detectGlobalObjects';
    result.diagnostics.methods.push(method);

    try {
      // Check for ng global
      if (window.ng) {
        result.detected = true;
        result.framework = 'Angular';
        result.confidence += 0.4;

        // Check for ng.coreTokens (Angular 9+)
        if (window.ng.coreTokens) {
          result.features.ivy = true;
          if (window.ng.coreTokens.VERSION) {
            result.versionNumber = window.ng.coreTokens.VERSION.full;
          }
        }

        // Check for ng.probe (Angular 2-8)
        if (window.ng.probe) {
          result.services.push('ng.probe');
        }

        // Check for ng.platformBrowser
        if (window.ng.platformBrowser) {
          result.services.push('ng.platformBrowser');
        }
      }

      // Check for getAllAngularRootElements
      if (window.getAllAngularRootElements) {
        result.detected = true;
        result.confidence += 0.3;

        const rootElements = window.getAllAngularRootElements();
        result.rootElements = rootElements.map(el => ({
          tagName: el.tagName.toLowerCase(),
          id: el.id,
          className: el.className,
          ngVersion: el.getAttribute('ng-version')
        }));
      }

      // Check for getAngularTestability
      if (window.getAngularTestability) {
        result.detected = true;
        result.confidence += 0.2;
        result.services.push('getAngularTestability');
      }

      // Check for Zone.js
      if (window.Zone) {
        result.confidence += 0.2;
        result.services.push('Zone.js');

        if (window.Zone.current) {
          result.services.push(`Zone.current: ${window.Zone.current.name}`);
        }
      }

      // Check for ngDevMode
      if (window.ngDevMode !== undefined) {
        result.confidence += 0.1;
        result.metadata.buildMode = window.ngDevMode ? 'development' : 'production';
      }

      // Check for AngularJS
      if (window.angular) {
        result.detected = true;
        result.framework = 'AngularJS';
        result.version = ANGULAR_VERSIONS.ANGULARJS;
        result.confidence += 0.4;

        if (window.angular.version) {
          result.versionNumber = window.angular.version.full;
        }
      }

    } catch (error) {
      result.diagnostics.errors.push({
        method,
        error: error.message
      });
    }
  }

  /**
   * Detects Angular DOM signatures
   * @param {AngularDetectionResult} result
   */
  async detectDOMSignatures(result) {
    const method = 'detectDOMSignatures';
    result.diagnostics.methods.push(method);

    try {
      // Check for Angular version attribute
      const versionElements = document.querySelectorAll('[ng-version]');
      if (versionElements.length > 0) {
        result.detected = true;
        result.confidence += 0.3;

        versionElements.forEach(el => {
          const version = el.getAttribute('ng-version');
          if (version) {
            result.versionNumber = version;
            result.rootElements.push({
              tagName: el.tagName.toLowerCase(),
              id: el.id,
              className: el.className,
              ngVersion: version
            });
          }
        });
      }

      // Check for Angular-specific attributes
      let attributeCount = 0;
      ANGULAR_SIGNATURES.DOM_ATTRIBUTES.forEach(attr => {
        const elements = document.querySelectorAll(`[${attr}]`);
        if (elements.length > 0) {
          attributeCount++;
          result.confidence += 0.05;
        }
      });

      if (attributeCount > 5) {
        result.detected = true;
        result.confidence += 0.2;
      }

      // Check for Angular-specific CSS classes
      let classCount = 0;
      ANGULAR_SIGNATURES.ANGULAR_CLASSES.forEach(className => {
        const elements = document.querySelectorAll(`[class*="${className}"]`);
        if (elements.length > 0) {
          classCount++;
          result.confidence += 0.02;
        }
      });

      if (classCount > 3) {
        result.detected = true;
        result.confidence += 0.1;
      }

      // Check for Angular component selectors
      ANGULAR_SIGNATURES.COMPONENT_SELECTORS.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          result.detected = true;
          result.confidence += 0.1;

          elements.forEach(el => {
            result.components.push({
              selector,
              tagName: el.tagName.toLowerCase(),
              id: el.id,
              className: el.className
            });
          });
        }
      });

    } catch (error) {
      result.diagnostics.errors.push({
        method,
        error: error.message
      });
    }
  }

  /**
   * Detects Angular components
   * @param {AngularDetectionResult} result
   */
  async detectComponents(result) {
    const method = 'detectComponents';
    result.diagnostics.methods.push(method);

    try {
      // Look for elements with Angular-specific content attributes
      const ngContentElements = document.querySelectorAll('[_ngcontent-*], [_nghost-*]');
      if (ngContentElements.length > 0) {
        result.detected = true;
        result.confidence += 0.3;

        ngContentElements.forEach(el => {
          result.components.push({
            type: 'ng-component',
            tagName: el.tagName.toLowerCase(),
            id: el.id,
            className: el.className,
            isHost: el.hasAttribute('_nghost-*')
          });
        });
      }

      // Look for router-outlet
      const routerOutlets = document.querySelectorAll('router-outlet');
      if (routerOutlets.length > 0) {
        result.detected = true;
        result.features.routing = true;
        result.confidence += 0.2;
      }

      // Look for ng-container and ng-template
      const ngContainers = document.querySelectorAll('ng-container, ng-template');
      if (ngContainers.length > 0) {
        result.detected = true;
        result.confidence += 0.1;
      }

    } catch (error) {
      result.diagnostics.errors.push({
        method,
        error: error.message
      });
    }
  }

  /**
   * Detects Angular services and dependency injection
   * @param {AngularDetectionResult} result
   */
  async detectServices(result) {
    const method = 'detectServices';
    result.diagnostics.methods.push(method);

    try {
      // Check for HttpClient usage
      const httpElements = document.querySelectorAll('[ng-reflect-url], [ng-reflect-http-*]');
      if (httpElements.length > 0) {
        result.features.http = true;
        result.confidence += 0.1;
      }

      // Check for common Angular services in script tags
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.textContent) {
          const content = script.textContent;

          // Check for HttpClient
          if (content.includes('HttpClient') || content.includes('HttpClientModule')) {
            result.features.http = true;
            result.services.push('HttpClient');
          }

          // Check for Router
          if (content.includes('Router') || content.includes('RouterModule')) {
            result.features.routing = true;
            result.services.push('Router');
          }

          // Check for Animations
          if (content.includes('BrowserAnimationsModule') || content.includes('@angular/animations')) {
            result.features.animations = true;
            result.services.push('Animations');
          }
        }
      });

    } catch (error) {
      result.diagnostics.errors.push({
        method,
        error: error.message
      });
    }
  }

  /**
   * Detects Angular modules
   * @param {AngularDetectionResult} result
   */
  async detectModules(result) {
    const method = 'detectModules';
    result.diagnostics.methods.push(method);

    try {
      // Check for standalone components (Angular 14+)
      const standaloneElements = document.querySelectorAll('[ng-reflect-standalone]');
      if (standaloneElements.length > 0) {
        result.features.standalone = true;
        result.confidence += 0.1;
      }

      // Analyze script content for module patterns
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.textContent) {
          const content = script.textContent;

          // Check for NgModule
          if (content.includes('NgModule') || content.includes('@NgModule')) {
            result.modules.push('NgModule');
            result.confidence += 0.1;
          }

          // Check for CommonModule
          if (content.includes('CommonModule')) {
            result.modules.push('CommonModule');
          }

          // Check for FormsModule
          if (content.includes('FormsModule') || content.includes('ReactiveFormsModule')) {
            result.modules.push('FormsModule');
          }
        }
      });

    } catch (error) {
      result.diagnostics.errors.push({
        method,
        error: error.message
      });
    }
  }

  /**
   * Detects Angular form systems
   * @param {AngularDetectionResult} result
   */
  async detectFormSystems(result) {
    const method = 'detectFormSystems';
    result.diagnostics.methods.push(method);

    try {
      // Reactive Forms
      const reactiveFormElements = document.querySelectorAll(
        '[formGroup], [formControl], [formControlName], [formArray], [formGroupName], [formArrayName]'
      );

      if (reactiveFormElements.length > 0) {
        result.detected = true;
        result.confidence += 0.2;

        reactiveFormElements.forEach(el => {
          result.forms.reactive.push({
            tagName: el.tagName.toLowerCase(),
            directive: this.getFormDirective(el),
            name: this.getFormControlName(el),
            id: el.id,
            className: el.className
          });
        });
      }

      // Template-driven Forms
      const templateFormElements = document.querySelectorAll(
        '[ngModel], [ngForm], [ngModelGroup]'
      );

      if (templateFormElements.length > 0) {
        result.detected = true;
        result.confidence += 0.1;

        templateFormElements.forEach(el => {
          result.forms.template.push({
            tagName: el.tagName.toLowerCase(),
            directive: this.getFormDirective(el),
            name: el.getAttribute('ngModel') || el.name,
            id: el.id,
            className: el.className
          });
        });
      }

      // Material Forms
      const materialFormElements = document.querySelectorAll(
        ANGULAR_SIGNATURES.MATERIAL_SELECTORS.join(', ')
      );

      if (materialFormElements.length > 0) {
        result.features.material = true;
        result.confidence += 0.1;

        materialFormElements.forEach(el => {
          result.forms.material.push({
            tagName: el.tagName.toLowerCase(),
            component: el.tagName.toLowerCase(),
            id: el.id,
            className: el.className
          });
        });
      }

      // CDK Detection
      const cdkElements = document.querySelectorAll(
        ANGULAR_SIGNATURES.CDK_SELECTORS.join(', ')
      );

      if (cdkElements.length > 0) {
        result.features.cdk = true;
        result.confidence += 0.1;
      }

    } catch (error) {
      result.diagnostics.errors.push({
        method,
        error: error.message
      });
    }
  }

  /**
   * Detects Angular features
   * @param {AngularDetectionResult} result
   */
  async detectFeatures(result) {
    const method = 'detectFeatures';
    result.diagnostics.methods.push(method);

    try {
      // Check for Ivy renderer
      if (window.ng && window.ng.coreTokens) {
        result.features.ivy = true;
      }

      // Check for Signals (Angular 16+)
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.textContent) {
          const content = script.textContent;

          if (content.includes('signal(') || content.includes('computed(') || content.includes('effect(')) {
            result.features.signals = true;
          }
        }
      });

      // Check for TypeScript
      const tsElements = document.querySelectorAll('script[type="text/typescript"]');
      if (tsElements.length > 0) {
        result.metadata.typescript = true;
      }

      // Check for source maps
      const sourceMapElements = document.querySelectorAll('script[src*=".map"]');
      if (sourceMapElements.length > 0) {
        result.metadata.sourceMap = true;
      }

    } catch (error) {
      result.diagnostics.errors.push({
        method,
        error: error.message
      });
    }
  }

  /**
   * Detects Angular version
   * @param {AngularDetectionResult} result
   */
  async detectVersion(result) {
    const method = 'detectVersion';
    result.diagnostics.methods.push(method);

    try {
      if (result.versionNumber) {
        const version = result.versionNumber;

        if (version.startsWith('1.')) {
          result.version = ANGULAR_VERSIONS.ANGULARJS;
        } else if (version.startsWith('2.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_2;
        } else if (version.startsWith('4.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_4;
        } else if (version.startsWith('5.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_5;
        } else if (version.startsWith('6.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_6;
        } else if (version.startsWith('7.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_7;
        } else if (version.startsWith('8.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_8;
        } else if (version.startsWith('9.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_9;
        } else if (version.startsWith('10.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_10;
        } else if (version.startsWith('11.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_11;
        } else if (version.startsWith('12.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_12;
        } else if (version.startsWith('13.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_13;
        } else if (version.startsWith('14.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_14;
        } else if (version.startsWith('15.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_15;
        } else if (version.startsWith('16.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_16;
        } else if (version.startsWith('17.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_17;
        } else if (version.startsWith('18.')) {
          result.version = ANGULAR_VERSIONS.ANGULAR_18;
        }
      }

      // Fallback version detection based on features
      if (result.version === ANGULAR_VERSIONS.UNKNOWN) {
        if (result.features.signals) {
          result.version = ANGULAR_VERSIONS.ANGULAR_16;
        } else if (result.features.standalone) {
          result.version = ANGULAR_VERSIONS.ANGULAR_14;
        } else if (result.features.ivy) {
          result.version = ANGULAR_VERSIONS.ANGULAR_9;
        } else if (result.framework === 'AngularJS') {
          result.version = ANGULAR_VERSIONS.ANGULARJS;
        } else if (result.detected) {
          result.version = 'Angular 2+';
        }
      }

    } catch (error) {
      result.diagnostics.errors.push({
        method,
        error: error.message
      });
    }
  }

  /**
   * Detects build environment
   * @param {AngularDetectionResult} result
   */
  async detectBuildEnvironment(result) {
    const method = 'detectBuildEnvironment';
    result.diagnostics.methods.push(method);

    try {
      // Check for webpack
      if (window.webpackJsonp || window.__webpack_require__) {
        result.metadata.bundler = 'webpack';
      }

      // Check for SystemJS
      if (window.System && window.System.import) {
        result.metadata.bundler = 'SystemJS';
      }

      // Check for Rollup
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.src && script.src.includes('rollup')) {
          result.metadata.bundler = 'Rollup';
        }
      });

    } catch (error) {
      result.diagnostics.errors.push({
        method,
        error: error.message
      });
    }
  }

  /**
   * Calculates confidence score
   * @param {AngularDetectionResult} result
   * @returns {number}
   */
  calculateConfidence(result) {
    let confidence = result.confidence;

    // Boost confidence based on multiple indicators
    if (result.rootElements.length > 0) confidence += 0.1;
    if (result.components.length > 0) confidence += 0.1;
    if (result.forms.reactive.length > 0) confidence += 0.1;
    if (result.forms.template.length > 0) confidence += 0.05;
    if (result.forms.material.length > 0) confidence += 0.05;
    if (result.services.length > 0) confidence += 0.05;
    if (result.modules.length > 0) confidence += 0.05;

    // Cap confidence at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Gets form directive from element
   * @param {Element} element
   * @returns {string}
   */
  getFormDirective(element) {
    const directives = ANGULAR_SIGNATURES.ANGULAR_DIRECTIVES;
    for (const directive of directives) {
      if (element.hasAttribute(directive)) {
        return directive;
      }
    }
    return 'unknown';
  }

  /**
   * Gets form control name from element
   * @param {Element} element
   * @returns {string}
   */
  getFormControlName(element) {
    return element.getAttribute('formControlName') ||
           element.getAttribute('formControl') ||
           element.getAttribute('ngModel') ||
           element.name ||
           element.id ||
           'unnamed';
  }

  /**
   * Clears detection cache
   */
  clearCache() {
    this.detectionCache.clear();
  }
}

// ============================================================================
// ANGULAR DETECTION RESULT TYPE DEFINITIONS
// ============================================================================

/**
 * @typedef {Object} AngularDetectionResult
 * @property {boolean} detected - Whether Angular is detected
 * @property {string} version - Angular version
 * @property {string|null} versionNumber - Specific version number
 * @property {string|null} framework - Framework name (Angular/AngularJS)
 * @property {number} confidence - Confidence score (0-1)
 * @property {Array} rootElements - Angular root elements
 * @property {Array} components - Detected components
 * @property {Array} services - Detected services
 * @property {Array} modules - Detected modules
 * @property {Object} forms - Form system detection
 * @property {Object} features - Feature detection
 * @property {Object} diagnostics - Detection diagnostics
 * @property {Object} metadata - Build and environment metadata
 */

// ============================================================================
// GLOBAL EXPORT
// ============================================================================

// Create global instance
window.AngularFormSnapshotDetector = new AngularDetector();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AngularDetector;
}
