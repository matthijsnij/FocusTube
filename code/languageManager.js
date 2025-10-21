const languageManager = (() => {
  let currentLang = 'en';
  let translations = {};

  // Load a language JSON and apply translations
  async function loadLanguage(lang) {
    try {
      const response = await fetch(`../lang/${lang}.json`);
      if (!response.ok) throw new Error('Failed to load language file');
      translations = await response.json();
      currentLang = lang;
      applyTranslations();
      localStorage.setItem('language', lang); // remember user preference
    } catch (error) {
      console.error('Language load error:', error);
    }
  }

  // Update all elements with data-i18n
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');

      // skip if no key found or no translations found
      if (!key || !translations[key]) return;

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') { // case: placeholders
        el.placeholder = translations[key];
      } else if (el.tagName === 'OPTION') { // case: dropdowns
        el.textContent = translations[key];
      } else {
        el.textContent = translations[key]; // case: everything else
      }
    });
  }

  // Initialize on page load
  function init() {
    const savedLang = localStorage.getItem('language') || 'en';
    loadLanguage(savedLang);

    // Set dropdowns to the current language
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) langSelect.value = savedLang;
  }

  return { loadLanguage, init, getTranslation: (key) => translations[key] || key };
})();

// initialize after DOM is ready
document.addEventListener('DOMContentLoaded', languageManager.init);
