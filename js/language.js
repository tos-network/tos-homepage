/**
 * TOS Network - Language Switcher
 * Handles language selection and UI updates
 */

(function() {
  'use strict';

  class LanguageSwitcher {
    constructor() {
      this.languageBtn = document.getElementById('languageBtn');
      this.languageDropdown = document.getElementById('languageDropdown');
      this.languageBackdrop = document.getElementById('languageBackdrop');
      this.languageSelector = document.getElementById('languageSelector');
      this.languageOptions = document.querySelectorAll('.language-option');
      this.isOpen = false;

      this.init();
    }

    init() {
      if (!this.languageBtn || !window.i18n) return;

      // Update active language option
      this.updateActiveOption(window.i18n.getCurrentLanguage());

      // Language button click handler
      this.languageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown();
      });

      // Backdrop click handler
      if (this.languageBackdrop) {
        this.languageBackdrop.addEventListener('click', () => {
          this.closeDropdown();
        });
      }

      // Language option click handlers
      this.languageOptions.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const lang = option.getAttribute('data-lang');
          this.switchLanguage(lang);
        });
      });

      // ESC key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeDropdown();
        }
      });

      // Listen for language changes from other sources
      window.addEventListener('languageChanged', (e) => {
        this.updateActiveOption(e.detail.lang);
      });
    }

    toggleDropdown() {
      if (this.isOpen) {
        this.closeDropdown();
      } else {
        this.openDropdown();
      }
    }

    openDropdown() {
      this.isOpen = true;
      this.languageDropdown.classList.add('active');
      this.languageBackdrop.classList.add('active');
      this.languageBtn.setAttribute('aria-expanded', 'true');
    }

    closeDropdown() {
      this.isOpen = false;
      this.languageDropdown.classList.remove('active');
      this.languageBackdrop.classList.remove('active');
      this.languageBtn.setAttribute('aria-expanded', 'false');
    }

    switchLanguage(lang) {
      if (!window.i18n) return;

      // Set language
      window.i18n.setLanguage(lang);

      // Update active option
      this.updateActiveOption(lang);

      // Close dropdown
      this.closeDropdown();
    }

    updateActiveOption(lang) {
      this.languageOptions.forEach(option => {
        if (option.getAttribute('data-lang') === lang) {
          option.classList.add('active');
        } else {
          option.classList.remove('active');
        }
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new LanguageSwitcher();
    });
  } else {
    new LanguageSwitcher();
  }

})();
