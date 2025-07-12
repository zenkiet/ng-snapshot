/**
 * Angular Form Snapshot - Popup JavaScript
 * Professional Chrome Extension popup functionality
 *
 * @author Angular DevTools Team
 * @version 1.0.0
 * @description Main popup script handling UI interactions and extension operations
 */

"use strict";

// ============================================================================
// POPUP CONSTANTS
// ============================================================================

const POPUP_CONFIG = {
  VERSION: "1.0.0",
  DETECTION_TIMEOUT: 30000,
  OPERATION_TIMEOUT: 15000,
  NOTIFICATION_DURATION: 5000,
  AUTO_REFRESH_INTERVAL: 10000,
  MAX_SNAPSHOTS_DISPLAY: 10,
};

const MESSAGE_TYPES = {
  // Angular Detection
  DETECT_ANGULAR: "DETECT_ANGULAR",
  ANGULAR_DETECTED: "ANGULAR_DETECTED",

  // Form Operations
  CAPTURE_FORMS: "CAPTURE_FORMS",
  RESTORE_FORMS: "RESTORE_FORMS",
  FORMS_CAPTURED: "FORMS_CAPTURED",
  FORMS_RESTORED: "FORMS_RESTORED",

  // Storage Operations
  SAVE_SNAPSHOT: "SAVE_SNAPSHOT",
  LOAD_SNAPSHOT: "LOAD_SNAPSHOT",
  DELETE_SNAPSHOT: "DELETE_SNAPSHOT",
  LIST_SNAPSHOTS: "LIST_SNAPSHOTS",

  // UI Operations
  SHOW_NOTIFICATION: "SHOW_NOTIFICATION",
  UPDATE_BADGE: "UPDATE_BADGE",

  // Error Handling
  ERROR_OCCURRED: "ERROR_OCCURRED",
  LOG_MESSAGE: "LOG_MESSAGE",
};

const UI_STATES = {
  DETECTING: "detecting",
  ANGULAR_DETECTED: "angular_detected",
  NO_ANGULAR: "no_angular",
  LOADING: "loading",
  ERROR: "error",
};

const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  INFO: "info",
};

// ============================================================================
// MAIN POPUP CLASS
// ============================================================================

class AngularFormSnapshotPopup {
  constructor() {
    this.currentTab = null;
    this.angularDetected = false;
    this.formStats = { forms: 0, controls: 0 };
    this.snapshots = [];
    this.settings = {
      autoSave: true,
      copyToClipboard: true,
      includeValidation: false,
      compressionLevel: "medium",
    };
    this.currentState = UI_STATES.DETECTING;
    this.detectionTimeout = null;
    this.refreshInterval = null;

    // UI element references
    this.elements = {};

    // Bind methods
    this.handleMessage = this.handleMessage.bind(this);
    this.detectAngular = this.detectAngular.bind(this);
    this.captureForms = this.captureForms.bind(this);
    this.restoreForms = this.restoreForms.bind(this);
    this.refreshSnapshots = this.refreshSnapshots.bind(this);
  }

  /**
   * Initializes the popup
   */
  async initialize() {
    try {
      this.log("info", "Initializing popup");

      // Cache DOM elements
      this.cacheElements();

      // Set up event listeners
      this.setupEventListeners();

      // Load settings
      await this.loadSettings();

      // Get current tab
      await this.getCurrentTab();

      // Start Angular detection
      await this.startAngularDetection();

      // Set up auto-refresh
      this.setupAutoRefresh();

      this.log("info", "Popup initialized successfully");
    } catch (error) {
      this.log("error", "Popup initialization failed", error);
      this.showError("Failed to initialize popup", error.message);
    }
  }

  /**
   * Caches DOM element references
   */
  cacheElements() {
    // Status elements
    this.elements.statusDot = document.getElementById("statusDot");
    this.elements.statusText = document.getElementById("statusText");

    // Detection elements
    this.elements.detectionSection =
      document.getElementById("detectionSection");
    this.elements.detectionIcon = document.getElementById("detectionIcon");
    this.elements.detectionTitle = document.getElementById("detectionTitle");
    this.elements.detectionDescription = document.getElementById(
      "detectionDescription",
    );

    // Angular content elements
    this.elements.angularContent = document.getElementById("angularContent");
    this.elements.angularVersionText =
      document.getElementById("angularVersionText");
    this.elements.formCount = document.getElementById("formCount");
    this.elements.controlCount = document.getElementById("controlCount");

    // No Angular content
    this.elements.noAngularContent =
      document.getElementById("noAngularContent");

    // Action buttons
    this.elements.captureBtn = document.getElementById("captureBtn");
    this.elements.restoreBtn = document.getElementById("restoreBtn");
    this.elements.retryDetectionBtn =
      document.getElementById("retryDetectionBtn");

    // Snapshot elements
    this.elements.snapshotList = document.getElementById("snapshotList");
    this.elements.emptyState = document.getElementById("emptyState");
    this.elements.refreshSnapshotsBtn = document.getElementById(
      "refreshSnapshotsBtn",
    );

    // Advanced options
    this.elements.advancedToggle = document.getElementById("advancedToggle");
    this.elements.advancedContent = document.getElementById("advancedContent");
    this.elements.autoSaveOption = document.getElementById("autoSaveOption");
    this.elements.copyToClipboardOption = document.getElementById(
      "copyToClipboardOption",
    );
    this.elements.includeValidationOption = document.getElementById(
      "includeValidationOption",
    );
    this.elements.compressionLevel =
      document.getElementById("compressionLevel");

    // Footer buttons
    this.elements.settingsBtn = document.getElementById("settingsBtn");
    this.elements.helpBtn = document.getElementById("helpBtn");
    this.elements.devtoolsBtn = document.getElementById("devtoolsBtn");

    // Loading and notification elements
    this.elements.loadingOverlay = document.getElementById("loadingOverlay");
    this.elements.loadingText = document.getElementById("loadingText");
    this.elements.notificationToast =
      document.getElementById("notificationToast");
    this.elements.toastIcon = document.getElementById("toastIcon");
    this.elements.toastMessage = document.getElementById("toastMessage");
    this.elements.toastClose = document.getElementById("toastClose");

    // Modal elements
    this.elements.snapshotModalOverlay = document.getElementById(
      "snapshotModalOverlay",
    );
    this.elements.settingsModalOverlay = document.getElementById(
      "settingsModalOverlay",
    );
    this.elements.helpModalOverlay =
      document.getElementById("helpModalOverlay");
  }

  /**
   * Sets up event listeners
   */
  setupEventListeners() {
    // Action buttons
    this.elements.captureBtn?.addEventListener("click", this.captureForms);
    this.elements.restoreBtn?.addEventListener("click", this.restoreForms);
    this.elements.retryDetectionBtn?.addEventListener(
      "click",
      this.detectAngular,
    );

    // Snapshot management
    this.elements.refreshSnapshotsBtn?.addEventListener(
      "click",
      this.refreshSnapshots,
    );

    // Advanced options
    this.elements.advancedToggle?.addEventListener(
      "click",
      this.toggleAdvancedOptions.bind(this),
    );

    // Settings change handlers
    this.elements.autoSaveOption?.addEventListener(
      "change",
      this.updateSettings.bind(this),
    );
    this.elements.copyToClipboardOption?.addEventListener(
      "change",
      this.updateSettings.bind(this),
    );
    this.elements.includeValidationOption?.addEventListener(
      "change",
      this.updateSettings.bind(this),
    );
    this.elements.compressionLevel?.addEventListener(
      "change",
      this.updateSettings.bind(this),
    );

    // Footer buttons
    this.elements.settingsBtn?.addEventListener(
      "click",
      this.showSettingsModal.bind(this),
    );
    this.elements.helpBtn?.addEventListener(
      "click",
      this.showHelpModal.bind(this),
    );
    this.elements.devtoolsBtn?.addEventListener(
      "click",
      this.openDevTools.bind(this),
    );

    // Modal close handlers
    this.elements.toastClose?.addEventListener(
      "click",
      this.hideNotification.bind(this),
    );

    // Modal overlay click handlers
    this.elements.snapshotModalOverlay?.addEventListener("click", (e) => {
      if (e.target === this.elements.snapshotModalOverlay) {
        this.hideSnapshotModal();
      }
    });

    this.elements.settingsModalOverlay?.addEventListener("click", (e) => {
      if (e.target === this.elements.settingsModalOverlay) {
        this.hideSettingsModal();
      }
    });

    this.elements.helpModalOverlay?.addEventListener("click", (e) => {
      if (e.target === this.elements.helpModalOverlay) {
        this.hideHelpModal();
      }
    });

    // Keyboard shortcuts
    document.addEventListener(
      "keydown",
      this.handleKeyboardShortcuts.bind(this),
    );

    // Runtime message listener
    chrome.runtime.onMessage.addListener(this.handleMessage);
  }

  /**
   * Handles runtime messages
   * @param {Object} message
   * @param {Object} sender
   * @param {Function} sendResponse
   */
  async handleMessage(message, sender, sendResponse) {
    const { type, data } = message;

    this.log("debug", `Message received: ${type}`, data);

    try {
      switch (type) {
        case MESSAGE_TYPES.ANGULAR_DETECTED:
          await this.onAngularDetected(data);
          break;

        case MESSAGE_TYPES.FORMS_CAPTURED:
          await this.onFormsCaptured(data);
          break;

        case MESSAGE_TYPES.FORMS_RESTORED:
          await this.onFormsRestored(data);
          break;

        case MESSAGE_TYPES.ERROR_OCCURRED:
          this.showError(data.title || "Error", data.message);
          break;

        default:
          this.log("debug", `Unhandled message type: ${type}`);
      }
    } catch (error) {
      this.log("error", `Message handling failed for type: ${type}`, error);
    }

    return true;
  }

  /**
   * Gets the current active tab
   */
  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      this.currentTab = tab;
      this.log("debug", "Current tab retrieved", {
        tabId: tab.id,
        url: tab.url,
      });
    } catch (error) {
      this.log("error", "Failed to get current tab", error);
      throw new Error("Failed to get current tab");
    }
  }

  /**
   * Loads settings from storage
   */
  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(["extension_settings"]);
      if (result.extension_settings) {
        this.settings = { ...this.settings, ...result.extension_settings };
      }

      // Update UI with loaded settings
      this.updateSettingsUI();

      this.log("debug", "Settings loaded", this.settings);
    } catch (error) {
      this.log("error", "Failed to load settings", error);
    }
  }

  /**
   * Updates settings UI with current values
   */
  updateSettingsUI() {
    if (this.elements.autoSaveOption) {
      this.elements.autoSaveOption.checked = this.settings.autoSave;
    }
    if (this.elements.copyToClipboardOption) {
      this.elements.copyToClipboardOption.checked =
        this.settings.copyToClipboard;
    }
    if (this.elements.includeValidationOption) {
      this.elements.includeValidationOption.checked =
        this.settings.includeValidation;
    }
    if (this.elements.compressionLevel) {
      this.elements.compressionLevel.value = this.settings.compressionLevel;
    }
  }

  /**
   * Starts Angular detection process
   */
  async startAngularDetection() {
    try {
      this.updateUIState(UI_STATES.DETECTING);

      // Set detection timeout
      this.detectionTimeout = setTimeout(() => {
        this.onDetectionTimeout();
      }, POPUP_CONFIG.DETECTION_TIMEOUT);

      // Request Angular detection from content script
      await this.detectAngular();
    } catch (error) {
      this.log("error", "Failed to start Angular detection", error);
      this.updateUIState(UI_STATES.ERROR);
    }
  }

  /**
   * Detects Angular application
   */
  async detectAngular() {
    try {
      if (!this.currentTab) {
        await this.getCurrentTab();
      }

      this.log("info", "Detecting Angular application");

      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: MESSAGE_TYPES.DETECT_ANGULAR,
      });

      if (response && response.success) {
        if (response.detected) {
          await this.onAngularDetected(response);
        } else {
          this.updateUIState(UI_STATES.NO_ANGULAR);
        }
      } else {
        throw new Error(response?.error || "Detection failed");
      }
    } catch (error) {
      this.log("error", "Angular detection failed", error);
      this.updateUIState(UI_STATES.NO_ANGULAR);
    }
  }

  /**
   * Handles Angular detection success
   * @param {Object} detectionData
   */
  async onAngularDetected(detectionData) {
    try {
      this.log("info", "Angular application detected", detectionData);

      // Clear detection timeout
      if (this.detectionTimeout) {
        clearTimeout(this.detectionTimeout);
        this.detectionTimeout = null;
      }

      this.angularDetected = true;

      // Update form statistics
      await this.updateFormStats();

      // Load snapshots
      await this.loadSnapshots();

      // Update UI
      this.updateUIState(UI_STATES.ANGULAR_DETECTED);
      this.updateAngularInfo(detectionData);

      // Show success notification
      this.showNotification(
        "Angular Detected",
        `Angular ${detectionData.version || "application"} detected successfully`,
        NOTIFICATION_TYPES.SUCCESS,
      );
    } catch (error) {
      this.log("error", "Failed to handle Angular detection", error);
    }
  }

  /**
   * Handles detection timeout
   */
  onDetectionTimeout() {
    this.log("warn", "Angular detection timed out");
    this.updateUIState(UI_STATES.NO_ANGULAR);
  }

  /**
   * Updates form statistics
   */
  async updateFormStats() {
    try {
      // Request form statistics from content script
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: "GET_FORM_STATS",
      });

      if (response && response.success) {
        this.formStats = {
          forms: response.formCount || 0,
          controls: response.controlCount || 0,
        };

        // Update UI
        if (this.elements.formCount) {
          this.elements.formCount.textContent = this.formStats.forms;
        }
        if (this.elements.controlCount) {
          this.elements.controlCount.textContent = this.formStats.controls;
        }
      }
    } catch (error) {
      this.log("debug", "Failed to update form stats (might be normal)", error);
      // Set default values
      this.formStats = { forms: 0, controls: 0 };
    }
  }

  /**
   * Captures forms
   */
  async captureForms() {
    try {
      if (!this.angularDetected) {
        this.showNotification(
          "No Angular Application",
          "Please navigate to an Angular application first",
          NOTIFICATION_TYPES.WARNING,
        );
        return;
      }

      this.showLoading("Capturing forms...");

      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: MESSAGE_TYPES.CAPTURE_FORMS,
        data: {
          saveToStorage: this.settings.autoSave,
          copyToClipboard: this.settings.copyToClipboard,
          includeValidation: this.settings.includeValidation,
        },
      });

      this.hideLoading();

      if (response && response.success) {
        await this.onFormsCaptured(response);
      } else {
        throw new Error(response?.error || "Capture failed");
      }
    } catch (error) {
      this.hideLoading();
      this.log("error", "Form capture failed", error);
      this.showError("Capture Failed", error.message);
    }
  }

  /**
   * Handles forms captured success
   * @param {Object} captureData
   */
  async onFormsCaptured(captureData) {
    try {
      this.log("info", "Forms captured successfully", captureData);

      // Refresh snapshots if auto-save is enabled
      if (this.settings.autoSave) {
        await this.loadSnapshots();
      }

      // Show success notification
      this.showNotification(
        "Forms Captured",
        `Successfully captured ${captureData.formCount || 0} form controls`,
        NOTIFICATION_TYPES.SUCCESS,
      );
    } catch (error) {
      this.log("error", "Failed to handle forms captured", error);
    }
  }

  /**
   * Restores forms
   */
  async restoreForms() {
    try {
      if (!this.angularDetected) {
        this.showNotification(
          "No Angular Application",
          "Please navigate to an Angular application first",
          NOTIFICATION_TYPES.WARNING,
        );
        return;
      }

      this.showLoading("Restoring forms...");

      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: MESSAGE_TYPES.RESTORE_FORMS,
        data: {
          fromClipboard: true,
        },
      });

      this.hideLoading();

      if (response && response.success) {
        await this.onFormsRestored(response);
      } else {
        throw new Error(response?.error || "Restore failed");
      }
    } catch (error) {
      this.hideLoading();
      this.log("error", "Form restore failed", error);
      this.showError("Restore Failed", error.message);
    }
  }

  /**
   * Handles forms restored success
   * @param {Object} restoreData
   */
  async onFormsRestored(restoreData) {
    try {
      this.log("info", "Forms restored successfully", restoreData);

      // Show success notification
      this.showNotification(
        "Forms Restored",
        `Successfully restored ${restoreData.restoredCount || 0} form controls`,
        NOTIFICATION_TYPES.SUCCESS,
      );
    } catch (error) {
      this.log("error", "Failed to handle forms restored", error);
    }
  }

  /**
   * Loads snapshots from storage
   */
  async loadSnapshots() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.LIST_SNAPSHOTS,
        data: { tabId: this.currentTab?.id },
      });

      if (response && response.success) {
        this.snapshots = response.snapshots || [];
        this.updateSnapshotsList();
      }
    } catch (error) {
      this.log("error", "Failed to load snapshots", error);
    }
  }

  /**
   * Refreshes snapshots list
   */
  async refreshSnapshots() {
    try {
      this.showLoading("Refreshing snapshots...");
      await this.loadSnapshots();
      this.hideLoading();

      this.showNotification(
        "Snapshots Refreshed",
        "Snapshot list has been updated",
        NOTIFICATION_TYPES.INFO,
      );
    } catch (error) {
      this.hideLoading();
      this.log("error", "Failed to refresh snapshots", error);
    }
  }

  /**
   * Updates snapshots list UI
   */
  updateSnapshotsList() {
    if (!this.elements.snapshotList) return;

    const listContainer = this.elements.snapshotList;
    const emptyState = this.elements.emptyState;

    if (this.snapshots.length === 0) {
      emptyState?.classList.remove("hidden");
      return;
    }

    emptyState?.classList.add("hidden");

    // Clear existing items
    listContainer.innerHTML = "";

    // Add snapshot items
    this.snapshots
      .slice(0, POPUP_CONFIG.MAX_SNAPSHOTS_DISPLAY)
      .forEach((snapshot) => {
        const item = this.createSnapshotItem(snapshot);
        listContainer.appendChild(item);
      });
  }

  /**
   * Creates a snapshot item element
   * @param {Object} snapshot
   * @returns {HTMLElement}
   */
  createSnapshotItem(snapshot) {
    const item = document.createElement("div");
    item.className = "snapshot-item";
    item.dataset.snapshotId = snapshot.id;

    const date = new Date(snapshot.timestamp);
    const timeString = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const urlPath = new URL(snapshot.url).pathname;

    item.innerHTML = `
      <div class="snapshot-header">
        <div class="snapshot-title">${snapshot.title || "Untitled Page"}</div>
        <div class="snapshot-time">${timeString}</div>
      </div>
      <div class="snapshot-info">
        <div class="snapshot-url">${urlPath}</div>
        <div>${snapshot.formCount || 0} controls</div>
      </div>
    `;

    item.addEventListener("click", () => {
      this.restoreSnapshot(snapshot);
    });

    return item;
  }

  /**
   * Restores a specific snapshot
   * @param {Object} snapshot
   */
  async restoreSnapshot(snapshot) {
    try {
      if (!this.angularDetected) {
        this.showNotification(
          "No Angular Application",
          "Please navigate to an Angular application first",
          NOTIFICATION_TYPES.WARNING,
        );
        return;
      }

      this.showLoading("Restoring snapshot...");

      // Load snapshot data
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.LOAD_SNAPSHOT,
        data: { snapshotId: snapshot.id },
      });

      if (response && response.success) {
        // Send to content script for restoration
        const restoreResponse = await chrome.tabs.sendMessage(
          this.currentTab.id,
          {
            type: MESSAGE_TYPES.RESTORE_FORMS,
            data: { snapshot: response.snapshot },
          },
        );

        this.hideLoading();

        if (restoreResponse && restoreResponse.success) {
          await this.onFormsRestored(restoreResponse);
        } else {
          throw new Error(restoreResponse?.error || "Snapshot restore failed");
        }
      } else {
        throw new Error(response?.error || "Failed to load snapshot");
      }
    } catch (error) {
      this.hideLoading();
      this.log("error", "Snapshot restore failed", error);
      this.showError("Restore Failed", error.message);
    }
  }

  /**
   * Updates UI state
   * @param {string} state
   */
  updateUIState(state) {
    this.currentState = state;

    // Hide all sections first
    this.elements.detectionSection?.classList.add("hidden");
    this.elements.angularContent?.classList.add("hidden");
    this.elements.noAngularContent?.classList.add("hidden");

    switch (state) {
      case UI_STATES.DETECTING:
        this.elements.detectionSection?.classList.remove("hidden");
        this.updateStatusIndicator("detecting", "Detecting...");
        this.updateDetectionUI(
          "search",
          "Detecting Angular",
          "Scanning the page for Angular applications...",
        );
        break;

      case UI_STATES.ANGULAR_DETECTED:
        this.elements.angularContent?.classList.remove("hidden");
        this.updateStatusIndicator("detected", "Detected");
        break;

      case UI_STATES.NO_ANGULAR:
        this.elements.noAngularContent?.classList.remove("hidden");
        this.updateStatusIndicator("not-detected", "Not detected");
        this.updateDetectionUI(
          "warning",
          "No Angular Application",
          "No Angular application found on this page.",
        );
        break;

      case UI_STATES.ERROR:
        this.elements.noAngularContent?.classList.remove("hidden");
        this.updateStatusIndicator("not-detected", "Error");
        this.updateDetectionUI(
          "error",
          "Detection Error",
          "An error occurred while detecting Angular.",
        );
        break;
    }
  }

  /**
   * Updates status indicator
   * @param {string} status
   * @param {string} text
   */
  updateStatusIndicator(status, text) {
    if (this.elements.statusDot) {
      this.elements.statusDot.className = `status-dot ${status}`;
    }
    if (this.elements.statusText) {
      this.elements.statusText.textContent = text;
    }
  }

  /**
   * Updates detection UI
   * @param {string} icon
   * @param {string} title
   * @param {string} description
   */
  updateDetectionUI(icon, title, description) {
    if (this.elements.detectionIcon) {
      this.elements.detectionIcon.textContent = icon;
    }
    if (this.elements.detectionTitle) {
      this.elements.detectionTitle.textContent = title;
    }
    if (this.elements.detectionDescription) {
      this.elements.detectionDescription.textContent = description;
    }
  }

  /**
   * Updates Angular info display
   * @param {Object} detectionData
   */
  updateAngularInfo(detectionData) {
    if (this.elements.angularVersionText) {
      const versionText = detectionData.version
        ? `Angular ${detectionData.version}`
        : "Angular Application";
      this.elements.angularVersionText.textContent = versionText;
    }
  }

  /**
   * Toggles advanced options
   */
  toggleAdvancedOptions() {
    const header = this.elements.advancedToggle;
    const content = this.elements.advancedContent;

    if (!header || !content) return;

    const isExpanded = header.classList.contains("expanded");

    if (isExpanded) {
      header.classList.remove("expanded");
      content.classList.remove("expanded");
    } else {
      header.classList.add("expanded");
      content.classList.add("expanded");
    }
  }

  /**
   * Updates settings
   */
  async updateSettings() {
    try {
      // Get current values from UI
      this.settings = {
        autoSave: this.elements.autoSaveOption?.checked || false,
        copyToClipboard: this.elements.copyToClipboardOption?.checked || false,
        includeValidation:
          this.elements.includeValidationOption?.checked || false,
        compressionLevel: this.elements.compressionLevel?.value || "medium",
      };

      // Save to storage
      await chrome.storage.local.set({ extension_settings: this.settings });

      this.log("debug", "Settings updated", this.settings);
    } catch (error) {
      this.log("error", "Failed to update settings", error);
    }
  }

  /**
   * Handles keyboard shortcuts
   * @param {KeyboardEvent} event
   */
  handleKeyboardShortcuts(event) {
    // Escape key - close modals/notifications
    if (event.key === "Escape") {
      this.hideAllModals();
      this.hideNotification();
      return;
    }

    // Don't handle shortcuts if modals are open
    if (this.isModalOpen()) return;

    // Ctrl/Cmd + Shift + F - Capture forms
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key === "F"
    ) {
      event.preventDefault();
      this.captureForms();
      return;
    }

    // Ctrl/Cmd + Shift + R - Restore forms
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key === "R"
    ) {
      event.preventDefault();
      this.restoreForms();
      return;
    }
  }

  /**
   * Shows loading overlay
   * @param {string} message
   */
  showLoading(message = "Loading...") {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = "flex";
    }
    if (this.elements.loadingText) {
      this.elements.loadingText.textContent = message;
    }
  }

  /**
   * Hides loading overlay
   */
  hideLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = "none";
    }
  }

  /**
   * Shows notification
   * @param {string} title
   * @param {string} message
   * @param {string} type
   */
  showNotification(title, message, type = NOTIFICATION_TYPES.INFO) {
    if (!this.elements.notificationToast) return;

    // Update content
    if (this.elements.toastIcon) {
      this.elements.toastIcon.className = `material-icons toast-icon ${type}`;
      this.elements.toastIcon.textContent = this.getNotificationIcon(type);
    }
    if (this.elements.toastMessage) {
      this.elements.toastMessage.textContent = `${title}: ${message}`;
    }

    // Show notification
    this.elements.notificationToast.style.display = "block";
    this.elements.notificationToast.classList.add("fade-in");

    // Auto-hide after duration
    setTimeout(() => {
      this.hideNotification();
    }, POPUP_CONFIG.NOTIFICATION_DURATION);
  }

  /**
   * Gets notification icon for type
   * @param {string} type
   * @returns {string}
   */
  getNotificationIcon(type) {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return "check_circle";
      case NOTIFICATION_TYPES.WARNING:
        return "warning";
      case NOTIFICATION_TYPES.ERROR:
        return "error";
      default:
        return "info";
    }
  }

  /**
   * Hides notification
   */
  hideNotification() {
    if (this.elements.notificationToast) {
      this.elements.notificationToast.style.display = "none";
      this.elements.notificationToast.classList.remove("fade-in");
    }
  }

  /**
   * Shows error notification
   * @param {string} title
   * @param {string} message
   */
  showError(title, message) {
    this.showNotification(title, message, NOTIFICATION_TYPES.ERROR);
  }

  /**
   * Shows settings modal
   */
  showSettingsModal() {
    if (this.elements.settingsModalOverlay) {
      this.elements.settingsModalOverlay.style.display = "flex";
    }
  }

  /**
   * Hides settings modal
   */
  hideSettingsModal() {
    if (this.elements.settingsModalOverlay) {
      this.elements.settingsModalOverlay.style.display = "none";
    }
  }

  /**
   * Shows help modal
   */
  showHelpModal() {
    if (this.elements.helpModalOverlay) {
      this.elements.helpModalOverlay.style.display = "flex";
    }
  }

  /**
   * Hides help modal
   */
  hideHelpModal() {
    if (this.elements.helpModalOverlay) {
      this.elements.helpModalOverlay.style.display = "none";
    }
  }

  /**
   * Shows snapshot modal
   */
  showSnapshotModal() {
    if (this.elements.snapshotModalOverlay) {
      this.elements.snapshotModalOverlay.style.display = "flex";
    }
  }

  /**
   * Hides snapshot modal
   */
  hideSnapshotModal() {
    if (this.elements.snapshotModalOverlay) {
      this.elements.snapshotModalOverlay.style.display = "none";
    }
  }

  /**
   * Hides all modals
   */
  hideAllModals() {
    this.hideSettingsModal();
    this.hideHelpModal();
    this.hideSnapshotModal();
  }

  /**
   * Checks if any modal is open
   * @returns {boolean}
   */
  isModalOpen() {
    return (
      this.elements.settingsModalOverlay?.style.display === "flex" ||
      this.elements.helpModalOverlay?.style.display === "flex" ||
      this.elements.snapshotModalOverlay?.style.display === "flex"
    );
  }

  /**
   * Opens DevTools
   */
  async openDevTools() {
    try {
      if (this.currentTab) {
        await chrome.tabs.sendMessage(this.currentTab.id, {
          type: "OPEN_DEVTOOLS",
        });
      }
    } catch (error) {
      this.log("error", "Failed to open DevTools", error);
      this.showNotification(
        "DevTools Error",
        "Failed to open DevTools panel",
        NOTIFICATION_TYPES.ERROR,
      );
    }
  }

  /**
   * Sets up auto-refresh for snapshots
   */
  setupAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(async () => {
      if (this.angularDetected) {
        await this.updateFormStats();
        await this.loadSnapshots();
      }
    }, POPUP_CONFIG.AUTO_REFRESH_INTERVAL);
  }

  /**
   * Cleans up resources
   */
  cleanup() {
    if (this.detectionTimeout) {
      clearTimeout(this.detectionTimeout);
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    chrome.runtime.onMessage.removeListener(this.handleMessage);
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
      source: "popup",
    };

    console[level](`[Angular Form Snapshot Popup] ${message}`, data);

    // Send critical logs to background
    if (level === "error" || level === "warn") {
      chrome.runtime
        .sendMessage({
          type: MESSAGE_TYPES.LOG_MESSAGE,
          data: logEntry,
        })
        .catch(() => {
          // Ignore errors when sending logs
        });
    }
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize popup when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const popup = new AngularFormSnapshotPopup();
    await popup.initialize();

    // Store global reference for debugging
    window.angularFormSnapshotPopup = popup;

    // Cleanup on window unload
    window.addEventListener("beforeunload", () => {
      popup.cleanup();
    });
  } catch (error) {
    console.error(
      "[Angular Form Snapshot] Popup initialization failed:",
      error,
    );
  }
});

// Handle extension updates
chrome.runtime.onInstalled?.addListener((details) => {
  if (details.reason === "update") {
    console.log("[Angular Form Snapshot] Extension updated");
  }
});
