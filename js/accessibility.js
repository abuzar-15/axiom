/**
 * Axiom Scientific Calculator - Accessibility Manager
 * Copyright (c) 2026 Mohammad Abuzar Alam. All rights reserved.
 * Author: Mohammad Abuzar Alam (abuzaraalam34@gmail.com)
 *
 * Handles screen reader announcements (NVDA, JAWS, VoiceOver, TalkBack),
 * focus management, modal dialog traps, high contrast, text scaling,
 * and keyboard navigation according to WCAG 2.2 AA / AAA standards.
 */

class AccessibilityManager {
  constructor() {
    this.politeAnnouncer = null;
    this.assertiveAnnouncer = null;
    this.resultAnnouncer = null;

    this.spokenAnnouncementsEnabled = true;
    this.highContrastEnabled = false;
    this.largeButtonsEnabled = false;
    this.largeDisplayEnabled = false;
    this.reduceAnimations = false;
    this.theme = 'dark'; // 'dark' | 'high-contrast' | 'light'

    this.lastAnnouncement = '';
    this.politeSlotToggle = false;
    this.assertiveSlotToggle = false;
    this.resultSlotToggle = false;

    this.activeModal = null;
    this.lastFocusedElement = null;

    // Accessible names mapping for mathematical symbols and abbreviations
    this.accessibleNames = {
      '+': 'Addition',
      '-': 'Subtraction',
      '−': 'Subtraction',
      '*': 'Multiplication',
      '×': 'Multiplication',
      '/': 'Division',
      '÷': 'Division',
      '=': 'Equals, calculate result',
      '.': 'Decimal point',
      '%': 'Percent',
      '^': 'Power',
      '(': 'Open parenthesis',
      ')': 'Close parenthesis',
      ',': 'Comma, function argument separator',
      '±': 'Change sign',
      'AC': 'All clear',
      'CE': 'Clear entry',
      'DEL': 'Backspace, delete last character',
      'backspace': 'Backspace, delete last character',
      'ans': 'Previous answer',
      'Ans': 'Previous answer',
      'pi': "Pi constant",
      'π': "Pi constant",
      'e': "Euler's constant",
      'tau': "Tau constant",
      'τ': "Tau constant",
      'phi': "Golden ratio phi",
      'φ': "Golden ratio phi",
      'sin': 'Sine',
      'cos': 'Cosine',
      'tan': 'Tangent',
      'csc': 'Cosecant',
      'sec': 'Secant',
      'cot': 'Cotangent',
      'asin': 'Inverse sine',
      'sin⁻¹': 'Inverse sine',
      'acos': 'Inverse cosine',
      'cos⁻¹': 'Inverse cosine',
      'atan': 'Inverse tangent',
      'tan⁻¹': 'Inverse tangent',
      'acsc': 'Inverse cosecant',
      'csc⁻¹': 'Inverse cosecant',
      'asec': 'Inverse secant',
      'sec⁻¹': 'Inverse secant',
      'acot': 'Inverse cotangent',
      'cot⁻¹': 'Inverse cotangent',
      'sinh': 'Hyperbolic sine',
      'cosh': 'Hyperbolic cosine',
      'tanh': 'Hyperbolic tangent',
      'csch': 'Hyperbolic cosecant',
      'sech': 'Hyperbolic secant',
      'coth': 'Hyperbolic cotangent',
      'asinh': 'Inverse hyperbolic sine',
      'acosh': 'Inverse hyperbolic cosine',
      'atanh': 'Inverse hyperbolic tangent',
      'acsch': 'Inverse hyperbolic cosecant',
      'asech': 'Inverse hyperbolic secant',
      'acoth': 'Inverse hyperbolic cotangent',
      'sqrt': 'Square root',
      '√': 'Square root',
      '√x': 'Square root',
      'cbrt': 'Cube root',
      '∛': 'Cube root',
      '∛x': 'Cube root',
      'nthRoot': 'Nth root',
      'ʸ√x': 'Nth root',
      'sqr': 'Square, x squared',
      'x²': 'Square, x squared',
      'cube': 'Cube, x cubed',
      'x³': 'Cube, x cubed',
      'pow': 'Power, x to the power y',
      'xʸ': 'Power, x to the power y',
      'recip': 'Reciprocal, 1 divided by x',
      '1/x': 'Reciprocal, 1 divided by x',
      'ln': 'Natural logarithm',
      'log': 'Common logarithm base 10',
      'log10': 'Common logarithm base 10',
      'log2': 'Binary logarithm base 2',
      'exp': 'Exponential e to the power x',
      'eˣ': 'Exponential e to the power x',
      'pow10': '10 to the power x',
      '10ˣ': '10 to the power x',
      'pow2': '2 to the power x',
      '2ˣ': '2 to the power x',
      'fact': 'Factorial',
      'n!': 'Factorial',
      '!': 'Factorial',
      'nPr': 'Permutations n P r',
      'nCr': 'Combinations n C r',
      'abs': 'Absolute value',
      '|x|': 'Absolute value',
      'gcd': 'Greatest common divisor',
      'lcm': 'Least common multiple',
      'rand': 'Random number',
      'round': 'Round to nearest integer',
      'floor': 'Floor, round down',
      'ceil': 'Ceiling, round up',
      'sign': 'Sign function',
      'mod': 'Modulo remainder',
      'MC': 'Memory clear',
      'MR': 'Memory recall',
      'M+': 'Memory add',
      'M-': 'Memory subtract',
      'M−': 'Memory subtract',
      'MS': 'Memory store',
      'F<=>D': 'Toggle fraction and decimal representation',
      'frac': 'Toggle fraction and decimal representation',
      'ENG': 'Engineering notation',
      'eng': 'Engineering notation',
      'BASE': 'Number base conversion',
      'CONST': 'Scientific physical constants library',
      'STATS': 'Statistical calculations tool',
      'READ': 'Read current display aloud'
    };

    // Numbers verbal names
    for (let i = 0; i <= 9; i++) {
      this.accessibleNames[String(i)] = `${i}`;
    }
  }

  /**
   * Initializes DOM references and loads saved accessibility preferences
   */
  init() {
    this.politeAnnouncer = document.getElementById('screen-reader-announcer');
    this.assertiveAnnouncer = document.getElementById('screen-reader-assertive');
    this.resultAnnouncer = document.getElementById('screen-reader-result');

    this.loadSettings();
    this.applySettings();
    this.setupModalTraps();
  }

  /**
   * Loads accessibility preferences from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('calc_a11y_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.spokenAnnouncementsEnabled === 'boolean') {
          this.spokenAnnouncementsEnabled = parsed.spokenAnnouncementsEnabled;
        }
        if (typeof parsed.highContrastEnabled === 'boolean') {
          this.highContrastEnabled = parsed.highContrastEnabled;
        }
        if (typeof parsed.largeButtonsEnabled === 'boolean') {
          this.largeButtonsEnabled = parsed.largeButtonsEnabled;
        }
        if (typeof parsed.largeDisplayEnabled === 'boolean') {
          this.largeDisplayEnabled = parsed.largeDisplayEnabled;
        }
        if (typeof parsed.reduceAnimations === 'boolean') {
          this.reduceAnimations = parsed.reduceAnimations;
        }
        if (parsed.theme && ['dark', 'high-contrast', 'light'].includes(parsed.theme)) {
          this.theme = parsed.theme;
        }
      }
    } catch (e) {
      console.warn('Unable to load accessibility settings from localStorage:', e);
    }
  }

  /**
   * Saves accessibility preferences to localStorage
   */
  saveSettings() {
    try {
      const settings = {
        spokenAnnouncementsEnabled: this.spokenAnnouncementsEnabled,
        highContrastEnabled: this.highContrastEnabled,
        largeButtonsEnabled: this.largeButtonsEnabled,
        largeDisplayEnabled: this.largeDisplayEnabled,
        reduceAnimations: this.reduceAnimations,
        theme: this.theme
      };
      localStorage.setItem('calc_a11y_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Unable to save accessibility settings to localStorage:', e);
    }
  }

  /**
   * Applies current settings as CSS classes on body and syncs UI inputs
   */
  applySettings() {
    const body = document.body;

    body.classList.toggle('high-contrast', this.theme === 'high-contrast' || this.highContrastEnabled);
    body.classList.toggle('light-theme', this.theme === 'light');
    body.classList.toggle('large-buttons', this.largeButtonsEnabled);
    body.classList.toggle('large-display', this.largeDisplayEnabled);
    body.classList.toggle('reduce-animations', this.reduceAnimations);

    // Sync form inputs in settings dialog if they exist
    const spokenToggle = document.getElementById('setting-spoken-announcements');
    const contrastToggle = document.getElementById('setting-high-contrast');
    const themeSelect = document.getElementById('setting-theme-select');
    const largeBtnToggle = document.getElementById('setting-large-buttons');
    const largeDispToggle = document.getElementById('setting-large-display');
    const reduceAnimToggle = document.getElementById('setting-reduce-animations');

    if (spokenToggle) spokenToggle.checked = this.spokenAnnouncementsEnabled;
    if (contrastToggle) contrastToggle.checked = this.theme === 'high-contrast' || this.highContrastEnabled;
    if (themeSelect) themeSelect.value = this.theme;
    if (largeBtnToggle) largeBtnToggle.checked = this.largeButtonsEnabled;
    if (largeDispToggle) largeDispToggle.checked = this.largeDisplayEnabled;
    if (reduceAnimToggle) reduceAnimToggle.checked = this.reduceAnimations;
  }

  /**
   * Resets all accessibility and audio settings to factory defaults
   */
  resetToDefaults() {
    this.spokenAnnouncementsEnabled = true;
    this.highContrastEnabled = false;
    this.largeButtonsEnabled = false;
    this.largeDisplayEnabled = false;
    this.reduceAnimations = false;
    this.theme = 'dark'; // 'dark' | 'high-contrast' | 'light'

    if (window.audioFeedback) {
      window.audioFeedback.setEnabled(true);
      window.audioFeedback.setButtonFeedback(true);
      window.audioFeedback.setVolume(0.4);
    }

    this.saveSettings();
    this.applySettings();
    this.announce('All settings have been reset to default values.');
  }

  /**
   * Announces standard calculator interaction feedback via polite live region
   * Uses dual alternating slots so NVDA never drops repeated identical keystrokes.
   * @param {string} message 
   */
  announce(message) {
    if (!this.spokenAnnouncementsEnabled || !message) return;
    const finalMsg = String(message).trim();
    this.lastAnnouncement = finalMsg;

    const slot1 = document.getElementById('sr-polite-1');
    const slot2 = document.getElementById('sr-polite-2');

    if (slot1 && slot2) {
      this.politeSlotToggle = !this.politeSlotToggle;
      if (this.politeSlotToggle) {
        slot2.textContent = '';
        slot1.textContent = finalMsg;
      } else {
        slot1.textContent = '';
        slot2.textContent = finalMsg;
      }
    } else {
      if (!this.politeAnnouncer) {
        this.politeAnnouncer = document.getElementById('screen-reader-announcer');
      }
      if (this.politeAnnouncer) {
        this.politeAnnouncer.textContent = finalMsg;
      }
    }

    // Auto-clear live region slot after announcement has been dispatched
    // Proportional duration ensures longer announcements are never truncated before screen reader finishes speaking
    const clearDuration = Math.max(3500, finalMsg.length * 80);
    window.setTimeout(() => {
      const s1 = document.getElementById('sr-polite-1');
      const s2 = document.getElementById('sr-polite-2');
      if (s1 && s1.textContent === finalMsg) s1.textContent = '';
      if (s2 && s2.textContent === finalMsg) s2.textContent = '';
      const fallback = document.getElementById('screen-reader-announcer');
      if (fallback && fallback.textContent === finalMsg) fallback.textContent = '';
    }, clearDuration);
  }

  /**
   * Dedicated calculation result announcer with high priority (assertive / role="alert")
   * Specifically ensures NVDA speaks "Result is [value]" when Enter or = is clicked,
   * without being drowned out by button focus speech or polite queue collisions.
   * @param {string} resultStr 
   */
  announceResult(resultStr) {
    if (!this.spokenAnnouncementsEnabled || resultStr === undefined || resultStr === null) return;
    const message = `Result is ${resultStr}.`;
    this.lastAnnouncement = message;

    const speak = () => {
      const slot1 = document.getElementById('sr-result-1');
      const slot2 = document.getElementById('sr-result-2');

      if (slot1 && slot2) {
        this.resultSlotToggle = !this.resultSlotToggle;
        if (this.resultSlotToggle) {
          slot2.textContent = '';
          slot1.textContent = message;
        } else {
          slot1.textContent = '';
          slot2.textContent = message;
        }
      } else {
        this.announceAssertive(message);
      }
    };

    // 70ms timeout prevents Android TalkBack button touch event from swallowing the result
    window.setTimeout(speak, 70);

    // Auto-clear live region slot after announcement has been spoken
    window.setTimeout(() => {
      const s1 = document.getElementById('sr-result-1');
      const s2 = document.getElementById('sr-result-2');
      if (s1 && s1.textContent === message) s1.textContent = '';
      if (s2 && s2.textContent === message) s2.textContent = '';
    }, 2500);
  }

  /**
   * Announces an urgent mathematical error immediately (assertive / alert)
   * @param {string} errorMessage 
   */
  announceError(errorMessage) {
    if (!this.spokenAnnouncementsEnabled || !errorMessage) return;
    const finalMsg = String(errorMessage).trim();

    const slot1 = document.getElementById('sr-assertive-1');
    const slot2 = document.getElementById('sr-assertive-2');

    if (slot1 && slot2) {
      this.assertiveSlotToggle = !this.assertiveSlotToggle;
      if (this.assertiveSlotToggle) {
        slot2.textContent = '';
        slot1.textContent = finalMsg;
      } else {
        slot1.textContent = '';
        slot2.textContent = finalMsg;
      }
    } else {
      this.announceAssertive(finalMsg);
    }

    // Auto-clear error announcement
    window.setTimeout(() => {
      const s1 = document.getElementById('sr-assertive-1');
      const s2 = document.getElementById('sr-assertive-2');
      if (s1 && s1.textContent === finalMsg) s1.textContent = '';
      if (s2 && s2.textContent === finalMsg) s2.textContent = '';
    }, 3000);
  }

  /**
   * Fallback assertive announcer
   * @param {string} message 
   */
  announceAssertive(message) {
    if (!this.spokenAnnouncementsEnabled || !message) return;
    if (!this.assertiveAnnouncer) {
      this.assertiveAnnouncer = document.getElementById('screen-reader-assertive');
    }
    if (!this.assertiveAnnouncer) return;

    this.assertiveAnnouncer.textContent = String(message).trim();
  }

  /**
   * Returns human-friendly accessible name for a button or symbol
   * @param {string} key 
   * @returns {string}
   */
  getAccessibleName(key) {
    if (this.accessibleNames[key]) {
      return this.accessibleNames[key];
    }
    return key;
  }

  /**
   * Traps keyboard focus within an active modal dialog (Settings, History, Help)
   * Handles Tab, Shift+Tab, and Escape key
   */
  setupModalTraps() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }
        this.closeModal(this.activeModal);
        return;
      }

      if (e.key === 'Tab' && this.activeModal) {
        const focusableElements = this.activeModal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }, { capture: true });
  }

  /**
   * Opens an accessible dialog or drawer and manages focus
   * @param {HTMLElement|string} modalElement 
   * @param {HTMLElement} triggerElement 
   */
  openModal(modalElement, triggerElement = null) {
    const modal = typeof modalElement === 'string' ? document.getElementById(modalElement) : modalElement;
    if (!modal) return;

    this.lastFocusedElement = triggerElement || document.activeElement;
    this.activeModal = modal;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    if (triggerElement) {
      triggerElement.setAttribute('aria-expanded', 'true');
    }

    // Isolate background from TalkBack & screen readers
    const app = document.querySelector('.calculator-app');
    if (app) {
      app.setAttribute('aria-hidden', 'true');
      app.setAttribute('inert', '');
    }

    // Announce dialog opened
    const title = modal.querySelector('h2, .modal-title')?.textContent || 'Dialog';
    this.announce(`${title} opened. Press Escape to close.`);

    // Focus the first interactive element or the close button
    window.setTimeout(() => {
      const closeBtn = modal.querySelector('.modal-close, button');
      if (closeBtn) {
        closeBtn.focus();
      }
    }, 50);
  }

  /**
   * Closes an accessible dialog or drawer and restores focus
   * @param {HTMLElement|string} modalElement 
   */
  closeModal(modalElement) {
    const modal = typeof modalElement === 'string' ? document.getElementById(modalElement) : modalElement;
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');

    // Restore background for TalkBack & screen readers
    const app = document.querySelector('.calculator-app');
    if (app) {
      app.removeAttribute('aria-hidden');
      app.removeAttribute('inert');
    }

    const rawTitle = modal.querySelector('h2, .modal-title')?.textContent || 'Tool';
    const cleanTitle = rawTitle.replace(/\s+/g, ' ').trim();
    this.announce(`${cleanTitle} closed.`);

    // Restore focus to original trigger element
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.setAttribute('aria-expanded', 'false');
      this.lastFocusedElement.focus();
    }

    this.activeModal = null;
  }
}

// Global instance
window.accessibilityManager = new AccessibilityManager();
