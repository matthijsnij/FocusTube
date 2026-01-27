import { supabase } from './supabaseClient.js';

const settingsPopupHTML = `
<!-- Overlay for dimmed effect when opening settings -->
<div class="overlay" aria-hidden="true"></div>

<!-- Popup menu for settings (initially hidden) -->
<div id="settings-popup" class="filter-popup">
  
  <!-- Popup title -->
  <div class="popup-title-container">
    <div class="settings-popup-icon" aria-hidden="true"></div>
    <h2 data-i18n="settings-title">Settings</h2>
  </div>

  <!-- Theme settings -->
  <div class="settings-row">
    <span class="settings-label" data-i18n="theme-word">Theme</span>
    <select id="themeSelect" class="settings-dropdown">
        <option value="standard-light" data-i18n="theme-standard-light">Minimalist - Light (default)</option>
        <option value="standard-dark" data-i18n="theme-standard-dark">Minimalist - Dark</option>
        <option value="gradient-light" data-i18n="theme-gradient-light">Gradient - Light</option>
        <option value="gradient-dark" data-i18n="theme-gradient-dark">Gradient - Dark</option>
    </select>
  </div>

  <!-- Language settings -->
  <div class="settings-row">
    <span class="settings-label" data-i18n="language-word">Language</span>
    <select id="languageSelect" class="settings-dropdown">
        <option value="en" data-i18n="language-default">English (default)</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="it">Italiano</option>
        <option value="nl">Nederlands</option>
        <option value="pt">Português</option>
    </select>
  </div>

  <div class="settings-actions">
    <button id="applySettings" class="apply-btn" data-i18n="apply-word">Apply</button>
    <button id="cancelSettings" class="cancel-btn" data-i18n="cancel-word">Cancel</button>
  </div>

  <!-- Log out link -->
  <div class="logout-link-container">
    <span id="logoutLink" data-i18n="logout-word">Log out</span>
  </div>
</div>
`;

 // Helper function for closing popup
  function closePopup() {
    settingsPopup.classList.remove('show');
    overlay.classList.remove('show');
    if (pageContent) pageContent.classList.remove('hidden');
  }

document.addEventListener('DOMContentLoaded', () => {

  // Inject popup
  document.body.insertAdjacentHTML('beforeend', settingsPopupHTML);

  // Core popup elements
  const settingsButton = document.querySelector('.settings-button');
  const settingsPopup = document.getElementById('settings-popup');
  const overlay = settingsPopup.previousElementSibling;
  const pageContent = document.querySelector('.landing-page-content');
  const applyBtn = document.getElementById('applySettings');
  const cancelBtn = document.getElementById('cancelSettings');

  // Language & theme selects
  const langSelect = document.getElementById('languageSelect');
  const themeSelect = document.getElementById('themeSelect');

  // Logout link
  const logoutLink = document.getElementById('logoutLink');
  // Auth button
  const authButton = document.getElementById('authButton');

  // Store temp values for cancel
  let tempLang = localStorage.getItem('language') || 'en';
  let tempTheme = localStorage.getItem('theme') || 'standard-light';

  // Set initial dropdown values
  langSelect.value = tempLang;
  themeSelect.value = tempTheme;

  // Apply theme from localStorage on page load
  const root = document.documentElement;
  switch (tempTheme) {
    case 'standard-light':
      root.setAttribute('data-theme', 'light');
      break;
    case 'gradient-dark':
      root.setAttribute('data-theme', 'gradient-dark');
      break;
    case 'gradient-light':
      root.setAttribute('data-theme', 'gradient-light');
      break;
    default:
      root.removeAttribute('data-theme'); // standard-dark (default)
  }

  // Helper function for closing popup
  function closePopup() {
    settingsPopup.classList.remove('show');
    overlay.classList.remove('show');
    if (pageContent) pageContent.classList.remove('hidden');
  }

  // Open / close popup
  if (settingsButton && settingsPopup && overlay) {
    settingsButton.addEventListener('click', () => {
      tempLang = localStorage.getItem('language') || 'en';
      tempTheme = localStorage.getItem('theme') || 'standard-light';
      langSelect.value = tempLang;
      themeSelect.value = tempTheme;

      settingsPopup.classList.add('show');
      overlay.classList.add('show');
      if (pageContent) pageContent.classList.add('hidden');
    });
  }

  // Apply button
  applyBtn.addEventListener('click', () => {
    // Language
    const selectedLang = langSelect.value;
    localStorage.setItem('language', selectedLang);
    languageManager.loadLanguage(selectedLang);

    // Theme
    const selectedTheme = themeSelect.value;
    localStorage.setItem('theme', selectedTheme);
    
    switch (selectedTheme) {
      case 'standard-light':
        root.setAttribute('data-theme', 'light');
        break;
      case 'gradient-dark':
        root.setAttribute('data-theme', 'gradient-dark');
        break;
      case 'gradient-light':
        root.setAttribute('data-theme', 'gradient-light');
        break;
      default:
        root.removeAttribute('data-theme'); // default dark
    }

    closePopup();
  });

  // Cancel button
  cancelBtn.addEventListener('click', () => {
    langSelect.value = tempLang;
    themeSelect.value = tempTheme;
    closePopup();
  });

  // Logout link
  logoutLink.addEventListener('click', async () => {
    await supabase.auth.signOut();
  
    // Hide logout link
    logoutLink.style.display = 'none';
  
    // Show login/signup button
    if (authButton) authButton.style.display = 'block';
  
    // Close settings popup
    closePopup();
  });
});
