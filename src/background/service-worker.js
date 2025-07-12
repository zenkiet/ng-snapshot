/**
 * Angular Form Snapshot - Background Service Worker
 * Professional Chrome Extension for Angular Developer Tools
 *
 * @author Angular DevTools Team
 * @version 1.0.0
 * @description Advanced background service worker managing Angular form state operations
 */

'use strict';

// Service Worker Constants
const SW_VERSION = '1.0.0';
const STORAGE_KEYS = {
  SNAPSHOTS: 'angular_form_snapshots',
  SETTINGS: 'extension_settings',
  ANGULAR_DETECTION: 'angular_detection_cache',
  FORM_HISTORY: 'form_history'
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
  DELETE_SNAPSHOT: 'DELETE_SNAPSHOT',
  LIST_SNAPSHOTS: 'LIST_SNAPSHOTS',

  // DevTools Communication
  DEVTOOLS_OPENED: 'DEVTOOLS_OPENED',
  DEVTOOLS_CLOSED: 'DEVTOOLS_CLOSED',

  // Error Handling
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  LOG_MESSAGE: 'LOG_MESSAGE'
};

// Global state management
class ExtensionState {
  constructor() {
    this.activeTabs = new Map();
    this.angularTabs = new Set();
    this.devToolsConnections = new Map();
    this.settings = {
      autoDetectAngular: true,
      enableFormHistory: true,
      maxSnapshots: 50,
      compressionLevel: 'medium',
      debugMode: false
    };
  }

  updateTabState(tabId, state) {
    this.activeTabs.set(tabId, { ...this.activeTabs.get(tabId), ...state });
  }

  getTabState(tabId) {
    return this.activeTabs.get(tabId) || {};
  }

  markAngularTab(tabId) {
    this.angularTabs.add(tabId);
    this.updateTabState(tabId, { hasAngular: true, detectedAt: Date.now() });
  }

  isAngularTab(tabId) {
    return this.angularTabs.has(tabId);
  }

  removeTab(tabId) {
    this.activeTabs.delete(tabId);
    this.angularTabs.delete(tabId);
    this.devToolsConnections.delete(tabId);
  }
}

const extensionState = new ExtensionState();

// Professional logging system
class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      version: SW_VERSION
    };

    if (extensionState.settings.debugMode) {
      console[level](`[Angular Form Snapshot] ${timestamp} - ${message}`, data);
    }

    // Store critical logs for debugging
    if (level === 'error' || level === 'warn') {
      chrome.storage.local.get(['debug_logs'], (result) => {
        const logs = result.debug_logs || [];
        logs.push(logEntry);

        // Keep only last 100 logs
        if (logs.length > 100) {
          logs.splice(0, logs.length - 100);
        }

        chrome.storage.local.set({ debug_logs: logs });
      });
    }
  }

  static info(message, data) { this.log('info', message, data); }
  static warn(message, data) { this.log('warn', message, data); }
  static error(message, data) { this.log('error', message, data); }
  static debug(message, data) { this.log('debug', message, data); }
}

// Advanced snapshot management
class SnapshotManager {
  static async saveSnapshot(tabId, snapshot) {
    try {
      const { url, title, timestamp, forms } = snapshot;
      const snapshotId = `snapshot_${tabId}_${timestamp}`;

      // Compress snapshot data
      const compressedData = await this.compressSnapshot(snapshot);

      const snapshotEntry = {
        id: snapshotId,
        tabId,
        url,
        title,
        timestamp,
        formCount: forms.length,
        compressed: compressedData,
        version: SW_VERSION
      };

      // Get existing snapshots
      const result = await chrome.storage.local.get([STORAGE_KEYS.SNAPSHOTS]);
      const snapshots = result[STORAGE_KEYS.SNAPSHOTS] || [];

      // Add new snapshot
      snapshots.push(snapshotEntry);

      // Maintain max snapshots limit
      if (snapshots.length > extensionState.settings.maxSnapshots) {
        snapshots.splice(0, snapshots.length - extensionState.settings.maxSnapshots);
      }

      await chrome.storage.local.set({ [STORAGE_KEYS.SNAPSHOTS]: snapshots });

      Logger.info('Snapshot saved successfully', { snapshotId, formCount: forms.length });
      return snapshotId;
    } catch (error) {
      Logger.error('Failed to save snapshot', { error: error.message, tabId });
      throw error;
    }
  }

  static async loadSnapshot(snapshotId) {
    try {
      const result = await chrome.storage.local.get([STORAGE_KEYS.SNAPSHOTS]);
      const snapshots = result[STORAGE_KEYS.SNAPSHOTS] || [];

      const snapshot = snapshots.find(s => s.id === snapshotId);
      if (!snapshot) {
        throw new Error(`Snapshot not found: ${snapshotId}`);
      }

      // Decompress snapshot data
      const decompressedData = await this.decompressSnapshot(snapshot.compressed);

      Logger.info('Snapshot loaded successfully', { snapshotId });
      return decompressedData;
    } catch (error) {
      Logger.error('Failed to load snapshot', { error: error.message, snapshotId });
      throw error;
    }
  }

  static async compressSnapshot(snapshot) {
    // Advanced compression using multiple strategies
    const dataString = JSON.stringify(snapshot.forms);

    switch (extensionState.settings.compressionLevel) {
      case 'high':
        return this.compressHigh(dataString);
      case 'medium':
        return this.compressMedium(dataString);
      case 'low':
        return this.compressLow(dataString);
      default:
        return this.compressMedium(dataString);
    }
  }

  static async decompressSnapshot(compressedData) {
    // Decompress based on compression type
    if (compressedData.type === 'base64_gzip') {
      return this.decompressHigh(compressedData.data);
    } else if (compressedData.type === 'base64_deflate') {
      return this.decompressMedium(compressedData.data);
    } else {
      return this.decompressLow(compressedData.data);
    }
  }

  static compressHigh(data) {
    // Simulate gzip compression with base64 encoding
    const compressed = btoa(unescape(encodeURIComponent(data)));
    return { type: 'base64_gzip', data: compressed };
  }

  static compressMedium(data) {
    // Deflate simulation with base64
    const compressed = btoa(data);
    return { type: 'base64_deflate', data: compressed };
  }

  static compressLow(data) {
    // Simple base64 encoding
    const compressed = btoa(unescape(encodeURIComponent(data)));
    return { type: 'base64_simple', data: compressed };
  }

  static decompressHigh(data) {
    return JSON.parse(decodeURIComponent(escape(atob(data))));
  }

  static decompressMedium(data) {
    return JSON.parse(atob(data));
  }

  static decompressLow(data) {
    return JSON.parse(decodeURIComponent(escape(atob(data))));
  }
}

// Message handling system
class MessageHandler {
  static async handleMessage(message, sender, sendResponse) {
    const { type, data } = message;
    const tabId = sender.tab?.id;

    Logger.debug('Message received', { type, tabId, data });

    try {
      switch (type) {
        case MESSAGE_TYPES.DETECT_ANGULAR:
          await this.handleAngularDetection(tabId, data);
          break;

        case MESSAGE_TYPES.CAPTURE_FORMS:
          await this.handleCaptureRequest(tabId, data);
          break;

        case MESSAGE_TYPES.RESTORE_FORMS:
          await this.handleRestoreRequest(tabId, data);
          break;

        case MESSAGE_TYPES.SAVE_SNAPSHOT:
          const snapshotId = await SnapshotManager.saveSnapshot(tabId, data);
          sendResponse({ success: true, snapshotId });
          break;

        case MESSAGE_TYPES.LOAD_SNAPSHOT:
          const snapshot = await SnapshotManager.loadSnapshot(data.snapshotId);
          sendResponse({ success: true, snapshot });
          break;

        case MESSAGE_TYPES.LIST_SNAPSHOTS:
          const snapshots = await this.getSnapshotsList(tabId);
          sendResponse({ success: true, snapshots });
          break;

        case MESSAGE_TYPES.LOG_MESSAGE:
          Logger[data.level](data.message, data.data);
          break;

        default:
          Logger.warn('Unknown message type received', { type, tabId });
      }
    } catch (error) {
      Logger.error('Message handling failed', { type, error: error.message, tabId });
      sendResponse({ success: false, error: error.message });
    }
  }

  static async handleAngularDetection(tabId, data) {
    if (data.detected) {
      extensionState.markAngularTab(tabId);
      Logger.info('Angular application detected', { tabId, version: data.version });

      // Update badge
      chrome.action.setBadgeText({ text: 'NG', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#dd1b16', tabId });
    }
  }

  static async handleCaptureRequest(tabId, data) {
    // Send capture command to content script
    const response = await chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_TYPES.CAPTURE_FORMS,
      data
    });

    if (response.success) {
      Logger.info('Forms captured successfully', { tabId, formCount: response.forms.length });
    }
  }

  static async handleRestoreRequest(tabId, data) {
    // Send restore command to content script
    const response = await chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_TYPES.RESTORE_FORMS,
      data
    });

    if (response.success) {
      Logger.info('Forms restored successfully', { tabId, formCount: response.restoredCount });
    }
  }

  static async getSnapshotsList(tabId) {
    const result = await chrome.storage.local.get([STORAGE_KEYS.SNAPSHOTS]);
    const snapshots = result[STORAGE_KEYS.SNAPSHOTS] || [];

    return snapshots
      .filter(s => !tabId || s.tabId === tabId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
}

// Command handling for keyboard shortcuts
class CommandHandler {
  static async handleCommand(command, tab) {
    const tabId = tab.id;

    Logger.debug('Command received', { command, tabId });

    try {
      switch (command) {
        case 'capture-forms':
          await this.captureFormsCommand(tabId);
          break;

        case 'restore-forms':
          await this.restoreFormsCommand(tabId);
          break;

        case 'toggle-devtools':
          await this.toggleDevToolsCommand(tabId);
          break;

        default:
          Logger.warn('Unknown command received', { command, tabId });
      }
    } catch (error) {
      Logger.error('Command handling failed', { command, error: error.message, tabId });
    }
  }

  static async captureFormsCommand(tabId) {
    if (!extensionState.isAngularTab(tabId)) {
      Logger.warn('Capture attempted on non-Angular tab', { tabId });
      return;
    }

    await chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_TYPES.CAPTURE_FORMS,
      data: { source: 'keyboard_shortcut' }
    });
  }

  static async restoreFormsCommand(tabId) {
    if (!extensionState.isAngularTab(tabId)) {
      Logger.warn('Restore attempted on non-Angular tab', { tabId });
      return;
    }

    // Get latest snapshot for this tab
    const snapshots = await MessageHandler.getSnapshotsList(tabId);
    if (snapshots.length === 0) {
      Logger.warn('No snapshots available for restore', { tabId });
      return;
    }

    const latestSnapshot = snapshots[0];
    const snapshotData = await SnapshotManager.loadSnapshot(latestSnapshot.id);

    await chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_TYPES.RESTORE_FORMS,
      data: { snapshot: snapshotData, source: 'keyboard_shortcut' }
    });
  }

  static async toggleDevToolsCommand(tabId) {
    // This would typically open DevTools panel
    // For now, we'll just log the action
    Logger.info('DevTools toggle requested', { tabId });
  }
}

// Service Worker Event Listeners
chrome.runtime.onInstalled.addListener(async (details) => {
  Logger.info('Extension installed/updated', { reason: details.reason, version: SW_VERSION });

  // Initialize default settings
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: extensionState.settings });

  // Clear old data if major version update
  if (details.reason === 'update') {
    // Migrate data if needed
    Logger.info('Extension updated, checking for data migration');
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  MessageHandler.handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async responses
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  await CommandHandler.handleCommand(command, tab);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  extensionState.removeTab(tabId);
  Logger.debug('Tab removed from state', { tabId });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Reset Angular detection for new page loads
    if (changeInfo.url) {
      extensionState.angularTabs.delete(tabId);
      chrome.action.setBadgeText({ text: '', tabId });
    }
  }
});

// DevTools connection handling
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'angular-devtools') {
    const tabId = port.sender.tab.id;
    extensionState.devToolsConnections.set(tabId, port);

    Logger.info('DevTools connected', { tabId });

    port.onDisconnect.addListener(() => {
      extensionState.devToolsConnections.delete(tabId);
      Logger.info('DevTools disconnected', { tabId });
    });
  }
});

// Error handling
chrome.runtime.onStartup.addListener(() => {
  Logger.info('Service worker started', { version: SW_VERSION });
});

self.addEventListener('error', (event) => {
  Logger.error('Service worker error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno
  });
});

self.addEventListener('unhandledrejection', (event) => {
  Logger.error('Unhandled promise rejection', { reason: event.reason });
});

Logger.info('Angular Form Snapshot Service Worker initialized', { version: SW_VERSION });
