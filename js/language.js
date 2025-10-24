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
      this.currentLangSpan = document.getElementById('currentLang');
      this.languageOptions = document.querySelectorAll('.language-option');

      this.init();
    }

    init() {
      if (!this.languageBtn || !window.i18n) return;

      // Update UI to show current language
      this.updateCurrentLanguageDisplay();

      // Language button click handler
      this.languageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown();
      });

      // Language option click handlers
      this.languageOptions.forEach(option => {
        option.addEventListener('click', (e) => {
          e.preventDefault();
          const lang = option.getAttribute('data-lang');
          this.switchLanguage(lang);
        });
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.languageDropdown.contains(e.target) &&
            !this.languageBtn.contains(e.target)) {
          this.closeDropdown();
        }
      });

      // Listen for language changes from other sources
      window.addEventListener('languageChanged', () => {
        this.updateCurrentLanguageDisplay();
      });
    }

    toggleDropdown() {
      this.languageDropdown.classList.toggle('active');
    }

    closeDropdown() {
      this.languageDropdown.classList.remove('active');
    }

    switchLanguage(lang) {
      if (!window.i18n) return;

      // Set language
      window.i18n.setLanguage(lang);

      // Update UI
      this.updateCurrentLanguageDisplay();
      this.updateActiveOption(lang);
      this.closeDropdown();
    }

    updateCurrentLanguageDisplay() {
      if (!window.i18n) return;

      const currentLang = window.i18n.getCurrentLanguage();
      const langMap = {
        'en': 'EN',
        'zh': '中文',
        'ja': '日本',
        'ko': '한국'
      };

      this.currentLangSpan.textContent = langMap[currentLang] || 'EN';
      this.updateActiveOption(currentLang);
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
