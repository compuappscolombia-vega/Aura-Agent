import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function suppressExtensionErrorsPlugin(): Plugin {
  return {
    name: 'suppress-extension-errors',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler() {
        return [
          {
            tag: 'script',
            attrs: { type: 'text/javascript' },
            children: `
              (function() {
                if (typeof window === 'undefined') return;

                function isExtensionError(msg, src, stack) {
                  var str = ((msg || '') + ' ' + (src || '') + ' ' + (stack || '')).toLowerCase();
                  return str.indexOf('metamask') !== -1 ||
                         str.indexOf('ethereum') !== -1 ||
                         str.indexOf('chrome-extension://') !== -1 ||
                         str.indexOf('inpage.js') !== -1 ||
                         str.indexOf('failed to connect to') !== -1;
                }

                // 1. Stub dummy provider to prevent inpage.js connection failure
                try {
                  if (!window.ethereum) {
                    var noop = function() {};
                    window.ethereum = {
                      isMetaMask: true,
                      isConnected: function() { return false; },
                      request: function() { return Promise.reject(new Error('Extension offline')); },
                      connect: function() { return Promise.resolve(); },
                      on: noop,
                      removeListener: noop,
                      addListener: noop,
                      emit: noop,
                      enable: function() { return Promise.reject(new Error('Extension offline')); },
                      send: noop,
                      sendAsync: noop,
                      selectedAddress: null,
                      networkVersion: '1',
                      chainId: '0x1'
                    };
                  }
                } catch (e) {}

                // 2. Intercept addEventListener so no external or Vite listener captures extension errors
                if (window.addEventListener) {
                  var originalAddEventListener = window.addEventListener;
                  window.addEventListener = function(type, listener, options) {
                    if ((type === 'error' || type === 'unhandledrejection') && typeof listener === 'function') {
                      var safeListener = function(event) {
                        try {
                          var msg = (event && (event.message || (event.reason && (event.reason.message || event.reason)) || '')) + '';
                          var stack = (event && ((event.error && event.error.stack) || (event.reason && event.reason.stack) || '')) + '';
                          var filename = (event && event.filename) || '';
                          if (isExtensionError(msg, filename, stack)) {
                            if (event.preventDefault) event.preventDefault();
                            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                            return;
                          }
                        } catch (e) {}
                        return listener.apply(this, arguments);
                      };
                      return originalAddEventListener.call(this, type, safeListener, options);
                    }
                    return originalAddEventListener.apply(this, arguments);
                  };
                }

                // 3. Intercept window.onerror property
                try {
                  var currentOnError = null;
                  Object.defineProperty(window, 'onerror', {
                    get: function() { return currentOnError; },
                    set: function(fn) {
                      if (typeof fn === 'function') {
                        currentOnError = function(msg, url, line, col, err) {
                          if (isExtensionError(msg, url, err ? err.stack : '')) return true;
                          return fn.apply(this, arguments);
                        };
                      } else {
                        currentOnError = fn;
                      }
                    },
                    configurable: true
                  });
                } catch (e) {}

                // 4. Intercept window.onunhandledrejection property
                try {
                  var currentOnUnhandled = null;
                  Object.defineProperty(window, 'onunhandledrejection', {
                    get: function() { return currentOnUnhandled; },
                    set: function(fn) {
                      if (typeof fn === 'function') {
                        currentOnUnhandled = function(event) {
                          var reason = (event && event.reason) || {};
                          var msg = typeof reason === 'string' ? reason : (reason.message || '');
                          var stack = reason.stack || '';
                          if (isExtensionError(msg, '', stack)) {
                            if (event && event.preventDefault) event.preventDefault();
                            return true;
                          }
                          return fn.apply(this, arguments);
                        };
                      } else {
                        currentOnUnhandled = fn;
                      }
                    },
                    configurable: true
                  });
                } catch (e) {}

                // 5. Intercept console.error to filter out MetaMask noise
                try {
                  var origConsoleError = console.error;
                  console.error = function() {
                    var text = Array.prototype.slice.call(arguments).join(' ');
                    if (isExtensionError(text, '', '')) {
                      return;
                    }
                    origConsoleError.apply(console, arguments);
                  };
                } catch (e) {}
              })();
            `,
            injectTo: 'head-prepend',
          },
        ];
      },
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [suppressExtensionErrorsPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
