/**
 * Angular Form Snapshot - Form Inspector
 * Specialized Angular form inspection and manipulation system
 *
 * @author Angular DevTools Team
 * @version 1.0.0
 * @description Advanced form inspector for comprehensive Angular form analysis and manipulation
 */

"use strict";

// ============================================================================
// FORM INSPECTOR CONSTANTS
// ============================================================================

const FORM_INSPECTOR_CONFIG = {
  MAX_DEPTH: 10,
  MAX_CONTROLS_PER_FORM: 500,
  INSPECTION_TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  DEBOUNCE_DELAY: 100,
  VALIDATION_TIMEOUT: 2000,
};

const FORM_CONTROL_TYPES = {
  REACTIVE_FORM_CONTROL: "reactive_form_control",
  REACTIVE_FORM_GROUP: "reactive_form_group",
  REACTIVE_FORM_ARRAY: "reactive_form_array",
  TEMPLATE_DRIVEN_CONTROL: "template_driven_control",
  TEMPLATE_DRIVEN_FORM: "template_driven_form",
  MATERIAL_FORM_FIELD: "material_form_field",
  CUSTOM_CONTROL: "custom_control",
  NATIVE_CONTROL: "native_control",
};

const INPUT_TYPES = {
  TEXT: "text",
  EMAIL: "email",
  PASSWORD: "password",
  NUMBER: "number",
  TEL: "tel",
  URL: "url",
  SEARCH: "search",
  DATE: "date",
  TIME: "time",
  DATETIME_LOCAL: "datetime-local",
  MONTH: "month",
  WEEK: "week",
  COLOR: "color",
  RANGE: "range",
  CHECKBOX: "checkbox",
  RADIO: "radio",
  FILE: "file",
  HIDDEN: "hidden",
  SELECT: "select",
  TEXTAREA: "textarea",
  BUTTON: "button",
  SUBMIT: "submit",
  RESET: "reset",
};

const VALIDATION_STATES = {
  VALID: "VALID",
  INVALID: "INVALID",
  PENDING: "PENDING",
  DISABLED: "DISABLED",
};

const ANGULAR_FORM_SELECTORS = {
  REACTIVE_FORMS: [
    "[formGroup]",
    "[formControl]",
    "[formControlName]",
    "[formArray]",
    "[formGroupName]",
    "[formArrayName]",
  ],
  TEMPLATE_DRIVEN: ["[ngModel]", "[ngForm]", "[ngModelGroup]", "form[name]"],
  MATERIAL_COMPONENTS: [
    "mat-form-field",
    "mat-input",
    "mat-select",
    "mat-checkbox",
    "mat-radio-group",
    "mat-radio-button",
    "mat-slide-toggle",
    "mat-slider",
    "mat-datepicker-input",
    "mat-autocomplete",
    "mat-chip-list",
    "mat-button-toggle-group",
  ],
};

// ============================================================================
// MAIN FORM INSPECTOR CLASS
// ============================================================================

class AngularFormInspector {
  constructor() {
    this.inspectionCache = new Map();
    this.controlRegistry = new Map();
    this.validationCache = new Map();
    this.formHierarchy = new Map();
    this.customValidators = new Map();
  }

  /**
   * Inspects all Angular forms on the page
   * @param {Object} options - Inspection options
   * @returns {Promise<FormInspectionResult>}
   */
  async inspectAllForms(options = {}) {
    const startTime = Date.now();

    const result = {
      timestamp: startTime,
      totalForms: 0,
      totalControls: 0,
      forms: [],
      controls: [],
      hierarchy: {},
      validation: {},
      errors: [],
      metadata: {
        inspectionTime: 0,
        angularVersion: null,
        formModules: [],
        customComponents: [],
      },
    };

    try {
      // Clear caches if requested
      if (options.clearCache) {
        this.clearCaches();
      }

      // Detect Angular version and form modules
      await this.detectAngularFormCapabilities(result);

      // Inspect reactive forms
      await this.inspectReactiveForms(result, options);

      // Inspect template-driven forms
      await this.inspectTemplateDrivenForms(result, options);

      // Inspect Material Design forms
      await this.inspectMaterialForms(result, options);

      // Inspect native HTML forms
      await this.inspectNativeForms(result, options);

      // Build form hierarchy
      this.buildFormHierarchy(result);

      // Validate form states
      await this.validateFormStates(result);

      // Extract custom components
      await this.extractCustomComponents(result);

      result.metadata.inspectionTime = Date.now() - startTime;
    } catch (error) {
      result.errors.push({
        type: "inspection_error",
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  /**
   * Detects Angular form capabilities
   * @param {FormInspectionResult} result
   */
  async detectAngularFormCapabilities(result) {
    try {
      // Detect Angular version
      if (window.ng && window.ng.coreTokens && window.ng.coreTokens.VERSION) {
        result.metadata.angularVersion = window.ng.coreTokens.VERSION.full;
      }

      // Check for Forms module
      const formsModuleElements = document.querySelectorAll(
        "[ng-reflect-form], [formGroup], [ngForm]",
      );
      if (formsModuleElements.length > 0) {
        result.metadata.formModules.push("FormsModule");
      }

      // Check for Reactive Forms module
      const reactiveFormsElements = document.querySelectorAll(
        "[formGroup], [formControl], [formArray]",
      );
      if (reactiveFormsElements.length > 0) {
        result.metadata.formModules.push("ReactiveFormsModule");
      }

      // Check for Material Forms
      const materialElements = document.querySelectorAll(
        "mat-form-field, mat-input, mat-select",
      );
      if (materialElements.length > 0) {
        result.metadata.formModules.push("MatFormFieldModule");
      }
    } catch (error) {
      result.errors.push({
        type: "capability_detection_error",
        message: error.message,
      });
    }
  }

  /**
   * Inspects reactive forms
   * @param {FormInspectionResult} result
   * @param {Object} options
   */
  async inspectReactiveForms(result, options) {
    try {
      // Find FormGroup elements
      const formGroupElements = document.querySelectorAll("[formGroup]");

      for (const formElement of formGroupElements) {
        const formData = await this.inspectReactiveForm(formElement, options);
        if (formData) {
          result.forms.push(formData);
          result.totalForms++;
          result.controls.push(...formData.controls);
          result.totalControls += formData.controls.length;
        }
      }

      // Find standalone FormControl elements
      const standaloneControls = document.querySelectorAll(
        "[formControl]:not([formGroup] [formControl])",
      );

      for (const controlElement of standaloneControls) {
        const controlData = await this.inspectReactiveFormControl(
          controlElement,
          null,
          options,
        );
        if (controlData) {
          result.controls.push(controlData);
          result.totalControls++;
        }
      }
    } catch (error) {
      result.errors.push({
        type: "reactive_forms_inspection_error",
        message: error.message,
      });
    }
  }

  /**
   * Inspects a single reactive form
   * @param {Element} formElement
   * @param {Object} options
   * @returns {Promise<FormData>}
   */
  async inspectReactiveForm(formElement, options) {
    try {
      const formId = this.generateFormId(formElement);

      const formData = {
        id: formId,
        type: FORM_CONTROL_TYPES.REACTIVE_FORM_GROUP,
        element: formElement,
        name: formElement.getAttribute("formGroup") || "unnamed",
        tagName: formElement.tagName.toLowerCase(),
        path: this.generateElementPath(formElement),
        controls: [],
        validation: {
          state: VALIDATION_STATES.VALID,
          errors: {},
          touched: false,
          dirty: false,
        },
        metadata: {
          created: Date.now(),
          controlCount: 0,
          nestedGroups: 0,
          nestedArrays: 0,
        },
      };

      // Inspect form controls within this form
      const controlElements = formElement.querySelectorAll(
        "[formControlName], [formControl], [formGroupName], [formArrayName]",
      );

      for (const controlElement of controlElements) {
        const controlData = await this.inspectReactiveFormControl(
          controlElement,
          formData,
          options,
        );
        if (controlData) {
          formData.controls.push(controlData);
          formData.metadata.controlCount++;

          if (controlData.type === FORM_CONTROL_TYPES.REACTIVE_FORM_GROUP) {
            formData.metadata.nestedGroups++;
          } else if (
            controlData.type === FORM_CONTROL_TYPES.REACTIVE_FORM_ARRAY
          ) {
            formData.metadata.nestedArrays++;
          }
        }
      }

      // Extract form validation state
      await this.extractFormValidationState(formElement, formData);

      return formData;
    } catch (error) {
      throw new Error(`Failed to inspect reactive form: ${error.message}`);
    }
  }

  /**
   * Inspects a reactive form control
   * @param {Element} controlElement
   * @param {FormData|null} parentForm
   * @param {Object} options
   * @returns {Promise<ControlData>}
   */
  async inspectReactiveFormControl(controlElement, parentForm, options) {
    try {
      const controlId = this.generateControlId(controlElement);

      // Determine control type
      let controlType = FORM_CONTROL_TYPES.REACTIVE_FORM_CONTROL;
      if (controlElement.hasAttribute("formGroupName")) {
        controlType = FORM_CONTROL_TYPES.REACTIVE_FORM_GROUP;
      } else if (controlElement.hasAttribute("formArrayName")) {
        controlType = FORM_CONTROL_TYPES.REACTIVE_FORM_ARRAY;
      }

      const controlData = {
        id: controlId,
        type: controlType,
        element: controlElement,
        name: this.extractControlName(controlElement),
        tagName: controlElement.tagName.toLowerCase(),
        inputType: this.detectInputType(controlElement),
        value: this.extractControlValue(controlElement),
        path: this.generateElementPath(controlElement),
        parentForm: parentForm ? parentForm.id : null,
        attributes: this.extractElementAttributes(controlElement),
        validation: {
          state: VALIDATION_STATES.VALID,
          errors: {},
          validators: [],
          touched: false,
          dirty: false,
          pending: false,
        },
        metadata: {
          created: Date.now(),
          isDisabled: controlElement.disabled || false,
          isReadonly: controlElement.readOnly || false,
          isRequired: this.isControlRequired(controlElement),
          placeholder: controlElement.placeholder || "",
          className: controlElement.className || "",
          tabIndex: controlElement.tabIndex || 0,
          autocomplete: controlElement.getAttribute("autocomplete") || "",
        },
      };

      // Extract validation information
      await this.extractControlValidation(controlElement, controlData);

      // Handle nested controls for FormGroup and FormArray
      if (
        controlType === FORM_CONTROL_TYPES.REACTIVE_FORM_GROUP ||
        controlType === FORM_CONTROL_TYPES.REACTIVE_FORM_ARRAY
      ) {
        controlData.nestedControls = await this.inspectNestedControls(
          controlElement,
          controlData,
          options,
        );
      }

      // Extract Material Design specific data
      if (this.isMaterialComponent(controlElement)) {
        await this.extractMaterialComponentData(controlElement, controlData);
      }

      return controlData;
    } catch (error) {
      throw new Error(
        `Failed to inspect reactive form control: ${error.message}`,
      );
    }
  }

  /**
   * Inspects template-driven forms
   * @param {FormInspectionResult} result
   * @param {Object} options
   */
  async inspectTemplateDrivenForms(result, options) {
    try {
      // Find NgForm elements
      const ngFormElements = document.querySelectorAll("[ngForm], form[name]");

      for (const formElement of ngFormElements) {
        const formData = await this.inspectTemplateDrivenForm(
          formElement,
          options,
        );
        if (formData) {
          result.forms.push(formData);
          result.totalForms++;
          result.controls.push(...formData.controls);
          result.totalControls += formData.controls.length;
        }
      }

      // Find standalone NgModel elements
      const standaloneModels = document.querySelectorAll(
        "[ngModel]:not([ngForm] [ngModel])",
      );

      for (const modelElement of standaloneModels) {
        const controlData = await this.inspectTemplateDrivenControl(
          modelElement,
          null,
          options,
        );
        if (controlData) {
          result.controls.push(controlData);
          result.totalControls++;
        }
      }
    } catch (error) {
      result.errors.push({
        type: "template_driven_forms_inspection_error",
        message: error.message,
      });
    }
  }

  /**
   * Inspects a template-driven form
   * @param {Element} formElement
   * @param {Object} options
   * @returns {Promise<FormData>}
   */
  async inspectTemplateDrivenForm(formElement, options) {
    try {
      const formId = this.generateFormId(formElement);

      const formData = {
        id: formId,
        type: FORM_CONTROL_TYPES.TEMPLATE_DRIVEN_FORM,
        element: formElement,
        name:
          formElement.getAttribute("name") ||
          formElement.getAttribute("ngForm") ||
          "unnamed",
        tagName: formElement.tagName.toLowerCase(),
        path: this.generateElementPath(formElement),
        controls: [],
        validation: {
          state: VALIDATION_STATES.VALID,
          errors: {},
          touched: false,
          dirty: false,
        },
        metadata: {
          created: Date.now(),
          controlCount: 0,
          action: formElement.action || "",
          method: formElement.method || "GET",
          enctype: formElement.enctype || "application/x-www-form-urlencoded",
        },
      };

      // Inspect NgModel controls within this form
      const modelElements = formElement.querySelectorAll("[ngModel]");

      for (const modelElement of modelElements) {
        const controlData = await this.inspectTemplateDrivenControl(
          modelElement,
          formData,
          options,
        );
        if (controlData) {
          formData.controls.push(controlData);
          formData.metadata.controlCount++;
        }
      }

      return formData;
    } catch (error) {
      throw new Error(
        `Failed to inspect template-driven form: ${error.message}`,
      );
    }
  }

  /**
   * Inspects a template-driven control
   * @param {Element} controlElement
   * @param {FormData|null} parentForm
   * @param {Object} options
   * @returns {Promise<ControlData>}
   */
  async inspectTemplateDrivenControl(controlElement, parentForm, options) {
    try {
      const controlId = this.generateControlId(controlElement);

      const controlData = {
        id: controlId,
        type: FORM_CONTROL_TYPES.TEMPLATE_DRIVEN_CONTROL,
        element: controlElement,
        name:
          controlElement.getAttribute("name") ||
          controlElement.getAttribute("ngModel") ||
          "unnamed",
        tagName: controlElement.tagName.toLowerCase(),
        inputType: this.detectInputType(controlElement),
        value: this.extractControlValue(controlElement),
        path: this.generateElementPath(controlElement),
        parentForm: parentForm ? parentForm.id : null,
        ngModel: controlElement.getAttribute("ngModel") || "",
        attributes: this.extractElementAttributes(controlElement),
        validation: {
          state: VALIDATION_STATES.VALID,
          errors: {},
          validators: [],
          touched: false,
          dirty: false,
          pending: false,
        },
        metadata: {
          created: Date.now(),
          isDisabled: controlElement.disabled || false,
          isReadonly: controlElement.readOnly || false,
          isRequired: this.isControlRequired(controlElement),
          placeholder: controlElement.placeholder || "",
          className: controlElement.className || "",
        },
      };

      // Extract validation information
      await this.extractControlValidation(controlElement, controlData);

      return controlData;
    } catch (error) {
      throw new Error(
        `Failed to inspect template-driven control: ${error.message}`,
      );
    }
  }

  /**
   * Inspects Material Design forms
   * @param {FormInspectionResult} result
   * @param {Object} options
   */
  async inspectMaterialForms(result, options) {
    try {
      const materialFormFields = document.querySelectorAll("mat-form-field");

      for (const formField of materialFormFields) {
        const controlData = await this.inspectMaterialFormField(
          formField,
          options,
        );
        if (controlData) {
          result.controls.push(controlData);
          result.totalControls++;
        }
      }

      // Inspect other Material components
      const materialComponents = document.querySelectorAll(
        "mat-checkbox, mat-radio-group, mat-slide-toggle, mat-slider, mat-button-toggle-group",
      );

      for (const component of materialComponents) {
        const controlData = await this.inspectMaterialComponent(
          component,
          options,
        );
        if (controlData) {
          result.controls.push(controlData);
          result.totalControls++;
        }
      }
    } catch (error) {
      result.errors.push({
        type: "material_forms_inspection_error",
        message: error.message,
      });
    }
  }

  /**
   * Inspects a Material form field
   * @param {Element} formFieldElement
   * @param {Object} options
   * @returns {Promise<ControlData>}
   */
  async inspectMaterialFormField(formFieldElement, options) {
    try {
      const input = formFieldElement.querySelector(
        "input, select, textarea, mat-select",
      );
      if (!input) return null;

      const controlId = this.generateControlId(input);

      const controlData = {
        id: controlId,
        type: FORM_CONTROL_TYPES.MATERIAL_FORM_FIELD,
        element: input,
        formField: formFieldElement,
        name: this.extractControlName(input),
        tagName: input.tagName.toLowerCase(),
        inputType: this.detectInputType(input),
        value: this.extractControlValue(input),
        path: this.generateElementPath(input),
        attributes: this.extractElementAttributes(input),
        validation: {
          state: VALIDATION_STATES.VALID,
          errors: {},
          validators: [],
          touched: false,
          dirty: false,
          pending: false,
        },
        material: {
          label: this.extractMaterialLabel(formFieldElement),
          hint: this.extractMaterialHint(formFieldElement),
          error: this.extractMaterialError(formFieldElement),
          prefix: this.extractMaterialPrefix(formFieldElement),
          suffix: this.extractMaterialSuffix(formFieldElement),
          appearance: formFieldElement.getAttribute("appearance") || "legacy",
          floatLabel: formFieldElement.getAttribute("floatLabel") || "auto",
        },
        metadata: {
          created: Date.now(),
          isDisabled: input.disabled || false,
          isReadonly: input.readOnly || false,
          isRequired: this.isControlRequired(input),
          placeholder: input.placeholder || "",
        },
      };

      // Extract validation information
      await this.extractControlValidation(input, controlData);

      return controlData;
    } catch (error) {
      throw new Error(
        `Failed to inspect Material form field: ${error.message}`,
      );
    }
  }

  /**
   * Inspects a Material component
   * @param {Element} componentElement
   * @param {Object} options
   * @returns {Promise<ControlData>}
   */
  async inspectMaterialComponent(componentElement, options) {
    try {
      const controlId = this.generateControlId(componentElement);

      const controlData = {
        id: controlId,
        type: FORM_CONTROL_TYPES.MATERIAL_FORM_FIELD,
        element: componentElement,
        name: this.extractControlName(componentElement),
        tagName: componentElement.tagName.toLowerCase(),
        inputType: this.detectMaterialComponentType(componentElement),
        value: this.extractMaterialComponentValue(componentElement),
        path: this.generateElementPath(componentElement),
        attributes: this.extractElementAttributes(componentElement),
        validation: {
          state: VALIDATION_STATES.VALID,
          errors: {},
          validators: [],
          touched: false,
          dirty: false,
          pending: false,
        },
        metadata: {
          created: Date.now(),
          isDisabled: componentElement.hasAttribute("disabled"),
          isReadonly: componentElement.hasAttribute("readonly"),
          isRequired: componentElement.hasAttribute("required"),
        },
      };

      return controlData;
    } catch (error) {
      throw new Error(`Failed to inspect Material component: ${error.message}`);
    }
  }

  /**
   * Inspects native HTML forms
   * @param {FormInspectionResult} result
   * @param {Object} options
   */
  async inspectNativeForms(result, options) {
    try {
      const nativeForms = document.querySelectorAll(
        "form:not([formGroup]):not([ngForm])",
      );

      for (const formElement of nativeForms) {
        const formData = await this.inspectNativeForm(formElement, options);
        if (formData) {
          result.forms.push(formData);
          result.totalForms++;
          result.controls.push(...formData.controls);
          result.totalControls += formData.controls.length;
        }
      }
    } catch (error) {
      result.errors.push({
        type: "native_forms_inspection_error",
        message: error.message,
      });
    }
  }

  /**
   * Inspects a native HTML form
   * @param {Element} formElement
   * @param {Object} options
   * @returns {Promise<FormData>}
   */
  async inspectNativeForm(formElement, options) {
    try {
      const formId = this.generateFormId(formElement);

      const formData = {
        id: formId,
        type: "native_form",
        element: formElement,
        name: formElement.name || formElement.id || "unnamed",
        tagName: formElement.tagName.toLowerCase(),
        path: this.generateElementPath(formElement),
        controls: [],
        metadata: {
          created: Date.now(),
          controlCount: 0,
          action: formElement.action || "",
          method: formElement.method || "GET",
          enctype: formElement.enctype || "application/x-www-form-urlencoded",
        },
      };

      // Inspect form controls
      const controlElements = formElement.querySelectorAll(
        "input, select, textarea, button",
      );

      for (const controlElement of controlElements) {
        // Skip Angular-managed controls
        if (this.isAngularManagedControl(controlElement)) continue;

        const controlData = await this.inspectNativeControl(
          controlElement,
          formData,
          options,
        );
        if (controlData) {
          formData.controls.push(controlData);
          formData.metadata.controlCount++;
        }
      }

      return formData;
    } catch (error) {
      throw new Error(`Failed to inspect native form: ${error.message}`);
    }
  }

  /**
   * Inspects a native control
   * @param {Element} controlElement
   * @param {FormData} parentForm
   * @param {Object} options
   * @returns {Promise<ControlData>}
   */
  async inspectNativeControl(controlElement, parentForm, options) {
    try {
      const controlId = this.generateControlId(controlElement);

      const controlData = {
        id: controlId,
        type: FORM_CONTROL_TYPES.NATIVE_CONTROL,
        element: controlElement,
        name: controlElement.name || controlElement.id || "unnamed",
        tagName: controlElement.tagName.toLowerCase(),
        inputType: this.detectInputType(controlElement),
        value: this.extractControlValue(controlElement),
        path: this.generateElementPath(controlElement),
        parentForm: parentForm.id,
        attributes: this.extractElementAttributes(controlElement),
        validation: {
          state:
            controlElement.validity && controlElement.validity.valid
              ? VALIDATION_STATES.VALID
              : VALIDATION_STATES.INVALID,
          errors: this.extractNativeValidationErrors(controlElement),
          validators: this.extractNativeValidators(controlElement),
        },
        metadata: {
          created: Date.now(),
          isDisabled: controlElement.disabled || false,
          isReadonly: controlElement.readOnly || false,
          isRequired: controlElement.required || false,
          placeholder: controlElement.placeholder || "",
        },
      };

      return controlData;
    } catch (error) {
      throw new Error(`Failed to inspect native control: ${error.message}`);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generates a unique form ID
   * @param {Element} formElement
   * @returns {string}
   */
  generateFormId(formElement) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const name = formElement.name || formElement.id || "form";
    return `${name}_${timestamp}_${random}`;
  }

  /**
   * Generates a unique control ID
   * @param {Element} controlElement
   * @returns {string}
   */
  generateControlId(controlElement) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const name = controlElement.name || controlElement.id || "control";
    return `${name}_${timestamp}_${random}`;
  }

  /**
   * Extracts control name from element
   * @param {Element} element
   * @returns {string}
   */
  extractControlName(element) {
    return (
      element.getAttribute("formControlName") ||
      element.getAttribute("formControl") ||
      element.getAttribute("ngModel") ||
      element.name ||
      element.id ||
      "unnamed"
    );
  }

  /**
   * Detects input type
   * @param {Element} element
   * @returns {string}
   */
  detectInputType(element) {
    if (element.tagName.toLowerCase() === "select") {
      return INPUT_TYPES.SELECT;
    } else if (element.tagName.toLowerCase() === "textarea") {
      return INPUT_TYPES.TEXTAREA;
    } else if (element.type) {
      return element.type.toLowerCase();
    }
    return INPUT_TYPES.TEXT;
  }

  /**
   * Extracts control value
   * @param {Element} element
   * @returns {any}
   */
  extractControlValue(element) {
    if (element.type === "checkbox" || element.type === "radio") {
      return element.checked;
    } else if (element.type === "file") {
      return element.files ? Array.from(element.files).map((f) => f.name) : [];
    } else if (element.multiple && element.selectedOptions) {
      return Array.from(element.selectedOptions).map((option) => option.value);
    }
    return element.value || "";
  }

  /**
   * Extracts element attributes
   * @param {Element} element
   * @returns {Object}
   */
  extractElementAttributes(element) {
    const attributes = {};
    for (const attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }

  /**
   * Generates element path
   * @param {Element} element
   * @returns {string}
   */
  generateElementPath(element) {
    const path = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className) {
        const classes = current.className
          .split(" ")
          .filter((cls) => cls.trim());
        if (classes.length > 0) {
          selector += `.${classes.join(".")}`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;

      if (path.length > FORM_INSPECTOR_CONFIG.MAX_DEPTH) break;
    }

    return path.join(" > ");
  }

  /**
   * Checks if control is required
   * @param {Element} element
   * @returns {boolean}
   */
  isControlRequired(element) {
    return (
      element.required ||
      element.hasAttribute("required") ||
      element.getAttribute("ng-required") === "true"
    );
  }

  /**
   * Checks if element is Material component
   * @param {Element} element
   * @returns {boolean}
   */
  isMaterialComponent(element) {
    return (
      element.tagName.toLowerCase().startsWith("mat-") ||
      element.closest("mat-form-field") !== null
    );
  }

  /**
   * Checks if control is Angular-managed
   * @param {Element} element
   * @returns {boolean}
   */
  isAngularManagedControl(element) {
    return (
      element.hasAttribute("formControl") ||
      element.hasAttribute("formControlName") ||
      element.hasAttribute("ngModel") ||
      element.closest("[formGroup]") !== null ||
      element.closest("[ngForm]") !== null
    );
  }

  /**
   * Extracts Material label
   * @param {Element} formField
   * @returns {string}
   */
  extractMaterialLabel(formField) {
    const label = formField.querySelector("mat-label");
    return label ? label.textContent.trim() : "";
  }

  /**
   * Extracts Material hint
   * @param {Element} formField
   * @returns {string}
   */
  extractMaterialHint(formField) {
    const hint = formField.querySelector("mat-hint");
    return hint ? hint.textContent.trim() : "";
  }

  /**
   * Extracts Material error
   * @param {Element} formField
   * @returns {string}
   */
  extractMaterialError(formField) {
    const error = formField.querySelector("mat-error");
    return error ? error.textContent.trim() : "";
  }

  /**
   * Extracts Material prefix
   * @param {Element} formField
   * @returns {string}
   */
  extractMaterialPrefix(formField) {
    const prefix = formField.querySelector("mat-prefix, [matPrefix]");
    return prefix ? prefix.textContent.trim() : "";
  }

  /**
   * Extracts Material suffix
   * @param {Element} formField
   * @returns {string}
   */
  extractMaterialSuffix(formField) {
    const suffix = formField.querySelector("mat-suffix, [matSuffix]");
    return suffix ? suffix.textContent.trim() : "";
  }

  /**
   * Detects Material component type
   * @param {Element} componentElement
   * @returns {string}
   */
  detectMaterialComponentType(componentElement) {
    const tagName = componentElement.tagName.toLowerCase();

    switch (tagName) {
      case "mat-checkbox":
        return "checkbox";
      case "mat-radio-group":
        return "radio-group";
      case "mat-radio-button":
        return "radio";
      case "mat-slide-toggle":
        return "slide-toggle";
      case "mat-slider":
        return "slider";
      case "mat-button-toggle-group":
        return "button-toggle-group";
      case "mat-select":
        return "select";
      case "mat-datepicker-input":
        return "datepicker";
      case "mat-autocomplete":
        return "autocomplete";
      case "mat-chip-list":
        return "chip-list";
      default:
        return "unknown";
    }
  }

  /**
   * Extracts Material component value
   * @param {Element} componentElement
   * @returns {any}
   */
  extractMaterialComponentValue(componentElement) {
    const tagName = componentElement.tagName.toLowerCase();

    switch (tagName) {
      case "mat-checkbox":
      case "mat-slide-toggle":
        return (
          componentElement.hasAttribute("checked") ||
          componentElement.getAttribute("ng-reflect-checked") === "true"
        );

      case "mat-radio-group":
        const selectedRadio = componentElement.querySelector(
          "mat-radio-button[checked]",
        );
        return selectedRadio ? selectedRadio.getAttribute("value") : null;

      case "mat-slider":
        return (
          componentElement.getAttribute("value") ||
          componentElement.getAttribute("ng-reflect-value") ||
          0
        );

      case "mat-select":
        return componentElement.getAttribute("ng-reflect-value") || "";

      case "mat-button-toggle-group":
        const selected = componentElement.querySelector(
          "mat-button-toggle[pressed]",
        );
        return selected ? selected.getAttribute("value") : null;

      default:
        return componentElement.value || "";
    }
  }

  /**
   * Extracts form validation state
   * @param {Element} formElement
   * @param {FormData} formData
   */
  async extractFormValidationState(formElement, formData) {
    try {
      // Check for Angular form validation classes
      if (formElement.classList.contains("ng-invalid")) {
        formData.validation.state = VALIDATION_STATES.INVALID;
      } else if (formElement.classList.contains("ng-valid")) {
        formData.validation.state = VALIDATION_STATES.VALID;
      } else if (formElement.classList.contains("ng-pending")) {
        formData.validation.state = VALIDATION_STATES.PENDING;
      }

      // Check for touched and dirty states
      formData.validation.touched =
        formElement.classList.contains("ng-touched");
      formData.validation.dirty = formElement.classList.contains("ng-dirty");

      // Extract validation errors from child controls
      const invalidControls = formElement.querySelectorAll(".ng-invalid");
      invalidControls.forEach((control) => {
        const name = this.extractControlName(control);
        const errors = this.extractAngularValidationErrors(control);
        if (Object.keys(errors).length > 0) {
          formData.validation.errors[name] = errors;
        }
      });
    } catch (error) {
      console.warn("Failed to extract form validation state:", error);
    }
  }

  /**
   * Extracts control validation information
   * @param {Element} controlElement
   * @param {ControlData} controlData
   */
  async extractControlValidation(controlElement, controlData) {
    try {
      // Angular validation states
      if (controlElement.classList.contains("ng-invalid")) {
        controlData.validation.state = VALIDATION_STATES.INVALID;
      } else if (controlElement.classList.contains("ng-valid")) {
        controlData.validation.state = VALIDATION_STATES.VALID;
      } else if (controlElement.classList.contains("ng-pending")) {
        controlData.validation.state = VALIDATION_STATES.PENDING;
      } else if (controlElement.disabled) {
        controlData.validation.state = VALIDATION_STATES.DISABLED;
      }

      // Touch and dirty states
      controlData.validation.touched =
        controlElement.classList.contains("ng-touched");
      controlData.validation.dirty =
        controlElement.classList.contains("ng-dirty");
      controlData.validation.pending =
        controlElement.classList.contains("ng-pending");

      // Extract validation errors
      controlData.validation.errors =
        this.extractAngularValidationErrors(controlElement);

      // Extract validators
      controlData.validation.validators =
        this.extractValidators(controlElement);
    } catch (error) {
      console.warn("Failed to extract control validation:", error);
    }
  }

  /**
   * Extracts Angular validation errors
   * @param {Element} element
   * @returns {Object}
   */
  extractAngularValidationErrors(element) {
    const errors = {};

    // Check for common validation error classes
    if (element.classList.contains("ng-invalid")) {
      // Extract error information from ng-reflect attributes
      const attributes = element.attributes;
      for (const attr of attributes) {
        if (
          attr.name.startsWith("ng-reflect-") &&
          attr.name.includes("error")
        ) {
          const errorType = attr.name
            .replace("ng-reflect-", "")
            .replace("-error", "");
          errors[errorType] = attr.value;
        }
      }

      // Check for common validation states
      if (element.validity) {
        if (element.validity.valueMissing) errors.required = true;
        if (element.validity.patternMismatch) errors.pattern = true;
        if (element.validity.tooShort) errors.minlength = true;
        if (element.validity.tooLong) errors.maxlength = true;
        if (element.validity.rangeUnderflow) errors.min = true;
        if (element.validity.rangeOverflow) errors.max = true;
        if (element.validity.typeMismatch) errors.email = true;
      }
    }

    return errors;
  }

  /**
   * Extracts validators from element
   * @param {Element} element
   * @returns {Array}
   */
  extractValidators(element) {
    const validators = [];

    if (element.required) validators.push("required");
    if (element.pattern) validators.push(`pattern:${element.pattern}`);
    if (element.minLength) validators.push(`minLength:${element.minLength}`);
    if (element.maxLength) validators.push(`maxLength:${element.maxLength}`);
    if (element.min) validators.push(`min:${element.min}`);
    if (element.max) validators.push(`max:${element.max}`);
    if (element.type === "email") validators.push("email");
    if (element.type === "url") validators.push("url");
    if (element.type === "number") validators.push("number");

    // Check for Angular-specific validators
    const attributes = element.attributes;
    for (const attr of attributes) {
      if (attr.name.startsWith("ng-") && attr.name.includes("valid")) {
        validators.push(attr.name);
      }
    }

    return validators;
  }

  /**
   * Inspects nested controls
   * @param {Element} controlElement
   * @param {ControlData} controlData
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async inspectNestedControls(controlElement, controlData, options) {
    const nestedControls = [];

    try {
      // Find nested form controls
      const nestedElements = controlElement.querySelectorAll(
        "[formControlName], [formControl], [formGroupName], [formArrayName]",
      );

      for (const nestedElement of nestedElements) {
        // Skip if it's not a direct child of this control
        if (
          nestedElement.closest("[formGroupName], [formArrayName]") !==
          controlElement
        ) {
          continue;
        }

        const nestedControlData = await this.inspectReactiveFormControl(
          nestedElement,
          { id: controlData.id },
          options,
        );

        if (nestedControlData) {
          nestedControls.push(nestedControlData);
        }
      }
    } catch (error) {
      console.warn("Failed to inspect nested controls:", error);
    }

    return nestedControls;
  }

  /**
   * Extracts Material component data
   * @param {Element} controlElement
   * @param {ControlData} controlData
   */
  async extractMaterialComponentData(controlElement, controlData) {
    try {
      const matFormField = controlElement.closest("mat-form-field");

      if (matFormField) {
        controlData.material = {
          label: this.extractMaterialLabel(matFormField),
          hint: this.extractMaterialHint(matFormField),
          error: this.extractMaterialError(matFormField),
          prefix: this.extractMaterialPrefix(matFormField),
          suffix: this.extractMaterialSuffix(matFormField),
          appearance: matFormField.getAttribute("appearance") || "legacy",
          floatLabel: matFormField.getAttribute("floatLabel") || "auto",
        };
      }

      // Extract Material-specific attributes
      const matAttributes = {};
      const attributes = controlElement.attributes;
      for (const attr of attributes) {
        if (
          attr.name.startsWith("mat-") ||
          attr.name.startsWith("ng-reflect-")
        ) {
          matAttributes[attr.name] = attr.value;
        }
      }

      if (Object.keys(matAttributes).length > 0) {
        controlData.material = controlData.material || {};
        controlData.material.attributes = matAttributes;
      }
    } catch (error) {
      console.warn("Failed to extract Material component data:", error);
    }
  }

  /**
   * Extracts native validation errors
   * @param {Element} controlElement
   * @returns {Object}
   */
  extractNativeValidationErrors(controlElement) {
    const errors = {};

    if (controlElement.validity) {
      if (controlElement.validity.valueMissing)
        errors.required = "This field is required";
      if (controlElement.validity.patternMismatch)
        errors.pattern = "Pattern does not match";
      if (controlElement.validity.tooShort)
        errors.minlength = `Minimum length is ${controlElement.minLength}`;
      if (controlElement.validity.tooLong)
        errors.maxlength = `Maximum length is ${controlElement.maxLength}`;
      if (controlElement.validity.rangeUnderflow)
        errors.min = `Minimum value is ${controlElement.min}`;
      if (controlElement.validity.rangeOverflow)
        errors.max = `Maximum value is ${controlElement.max}`;
      if (controlElement.validity.typeMismatch) errors.type = "Invalid format";
      if (controlElement.validity.stepMismatch)
        errors.step = "Value does not match step";
    }

    return errors;
  }

  /**
   * Extracts native validators
   * @param {Element} controlElement
   * @returns {Array}
   */
  extractNativeValidators(controlElement) {
    const validators = [];

    if (controlElement.required) validators.push("required");
    if (controlElement.pattern) validators.push("pattern");
    if (controlElement.minLength) validators.push("minlength");
    if (controlElement.maxLength) validators.push("maxlength");
    if (controlElement.min !== null && controlElement.min !== "")
      validators.push("min");
    if (controlElement.max !== null && controlElement.max !== "")
      validators.push("max");
    if (controlElement.step) validators.push("step");

    return validators;
  }

  /**
   * Builds form hierarchy
   * @param {FormInspectionResult} result
   */
  buildFormHierarchy(result) {
    try {
      const hierarchy = {};

      // Group controls by their parent forms
      result.controls.forEach((control) => {
        if (control.parentForm) {
          if (!hierarchy[control.parentForm]) {
            hierarchy[control.parentForm] = {
              form: result.forms.find((f) => f.id === control.parentForm),
              controls: [],
            };
          }
          hierarchy[control.parentForm].controls.push(control);
        } else {
          // Standalone controls
          if (!hierarchy.standalone) {
            hierarchy.standalone = { controls: [] };
          }
          hierarchy.standalone.controls.push(control);
        }
      });

      // Build nested structure for reactive forms
      Object.values(hierarchy).forEach((formGroup) => {
        if (
          formGroup.form &&
          formGroup.form.type === FORM_CONTROL_TYPES.REACTIVE_FORM_GROUP
        ) {
          this.buildNestedHierarchy(formGroup);
        }
      });

      result.hierarchy = hierarchy;
    } catch (error) {
      result.errors.push({
        type: "hierarchy_build_error",
        message: error.message,
      });
    }
  }

  /**
   * Builds nested hierarchy for reactive forms
   * @param {Object} formGroup
   */
  buildNestedHierarchy(formGroup) {
    const nestedStructure = {};

    formGroup.controls.forEach((control) => {
      if (
        control.type === FORM_CONTROL_TYPES.REACTIVE_FORM_GROUP ||
        control.type === FORM_CONTROL_TYPES.REACTIVE_FORM_ARRAY
      ) {
        nestedStructure[control.name] = {
          control: control,
          children: control.nestedControls || [],
        };
      } else {
        if (!nestedStructure.controls) {
          nestedStructure.controls = [];
        }
        nestedStructure.controls.push(control);
      }
    });

    formGroup.hierarchy = nestedStructure;
  }

  /**
   * Validates form states
   * @param {FormInspectionResult} result
   */
  async validateFormStates(result) {
    try {
      const validation = {
        totalValid: 0,
        totalInvalid: 0,
        totalPending: 0,
        totalDisabled: 0,
        formValidation: {},
        controlValidation: {},
      };

      // Validate forms
      result.forms.forEach((form) => {
        const formValidation = {
          state: form.validation.state,
          controlCount: form.controls.length,
          validControls: 0,
          invalidControls: 0,
          pendingControls: 0,
          disabledControls: 0,
        };

        form.controls.forEach((control) => {
          switch (control.validation.state) {
            case VALIDATION_STATES.VALID:
              formValidation.validControls++;
              break;
            case VALIDATION_STATES.INVALID:
              formValidation.invalidControls++;
              break;
            case VALIDATION_STATES.PENDING:
              formValidation.pendingControls++;
              break;
            case VALIDATION_STATES.DISABLED:
              formValidation.disabledControls++;
              break;
          }
        });

        validation.formValidation[form.id] = formValidation;
      });

      // Validate controls
      result.controls.forEach((control) => {
        switch (control.validation.state) {
          case VALIDATION_STATES.VALID:
            validation.totalValid++;
            break;
          case VALIDATION_STATES.INVALID:
            validation.totalInvalid++;
            break;
          case VALIDATION_STATES.PENDING:
            validation.totalPending++;
            break;
          case VALIDATION_STATES.DISABLED:
            validation.totalDisabled++;
            break;
        }

        validation.controlValidation[control.id] = {
          state: control.validation.state,
          errors: control.validation.errors,
          validators: control.validation.validators,
          touched: control.validation.touched,
          dirty: control.validation.dirty,
        };
      });

      result.validation = validation;
    } catch (error) {
      result.errors.push({
        type: "validation_error",
        message: error.message,
      });
    }
  }

  /**
   * Extracts custom components
   * @param {FormInspectionResult} result
   */
  async extractCustomComponents(result) {
    try {
      const customComponents = [];

      // Find elements with custom Angular components
      const customElements = document.querySelectorAll("*");

      customElements.forEach((element) => {
        const tagName = element.tagName.toLowerCase();

        // Check if it's a custom component (contains hyphen and not a standard HTML element)
        if (
          tagName.includes("-") &&
          !tagName.startsWith("mat-") &&
          !tagName.startsWith("cdk-") &&
          this.isFormRelatedComponent(element)
        ) {
          customComponents.push({
            tagName: tagName,
            selector: tagName,
            path: this.generateElementPath(element),
            attributes: this.extractElementAttributes(element),
            hasFormControls: this.hasFormControls(element),
            isFormComponent: this.isFormComponent(element),
          });
        }
      });

      // Remove duplicates
      const uniqueComponents = customComponents.filter(
        (component, index, self) =>
          index === self.findIndex((c) => c.tagName === component.tagName),
      );

      result.metadata.customComponents = uniqueComponents;
    } catch (error) {
      result.errors.push({
        type: "custom_component_extraction_error",
        message: error.message,
      });
    }
  }

  /**
   * Checks if element is form-related component
   * @param {Element} element
   * @returns {boolean}
   */
  isFormRelatedComponent(element) {
    return (
      element.querySelector(
        "input, select, textarea, [formControl], [formControlName], [ngModel]",
      ) !== null ||
      element.hasAttribute("formControl") ||
      element.hasAttribute("formControlName") ||
      element.hasAttribute("ngModel") ||
      element.classList.contains("form-control") ||
      element.classList.contains("form-field")
    );
  }

  /**
   * Checks if element has form controls
   * @param {Element} element
   * @returns {boolean}
   */
  hasFormControls(element) {
    return (
      element.querySelectorAll(
        "input, select, textarea, [formControl], [formControlName], [ngModel]",
      ).length > 0
    );
  }

  /**
   * Checks if element is a form component
   * @param {Element} element
   * @returns {boolean}
   */
  isFormComponent(element) {
    return (
      element.hasAttribute("formGroup") ||
      element.hasAttribute("ngForm") ||
      element.tagName.toLowerCase() === "form"
    );
  }

  /**
   * Clears all caches
   */
  clearCaches() {
    this.inspectionCache.clear();
    this.controlRegistry.clear();
    this.validationCache.clear();
    this.formHierarchy.clear();
    this.customValidators.clear();
  }
}

// ============================================================================
// GLOBAL EXPORT
// ============================================================================

// Create global instance
window.AngularFormSnapshotFormInspector = new AngularFormInspector();

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = AngularFormInspector;
}
