const settingsPopupHTML = `
<!-- Overlay for dimmed effect when opening settings -->
<div class="overlay" aria-hidden="true"></div>

<!-- Popup menu for settings (initially hidden) -->
<div id="settings-popup" class="filter-popup">
  
  <!-- Popup title -->
  <div class="popup-title-container">
    <img src="../images/setting-icon.png" alt="" class="popup-icon">
    <h2 data-i18n="settings-title">Settings</h2>
  </div>

  <!-- Theme settings -->
  <div class="settings-row">
    <span class="settings-label" data-i18n="theme-word">Theme</span>
    <select id="themeSelect" class="settings-dropdown">
        <option value="standard-dark" data-i18n="theme-standard-dark">Minimalist - Dark (default)</option>
        <option value="standard-light" data-i18n="theme-standard-light">Minimalist - Light</option>
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

  // Current language
  let tempLang;
  const langSelect = document.getElementById('languageSelect')

  // Helper function for closing popup
  function closePopup() {
    settingsPopup.classList.remove('show');
    overlay.classList.remove('show');
    if (pageContent) pageContent.classList.remove('hidden');
  }

  // Open / close behavior
  if (settingsButton && settingsPopup && overlay) {
    settingsButton.addEventListener('click', () => {

      // save current language
      tempLang = localStorage.getItem('language') || 'en'; 
      langSelect.value = tempLang; // set dropdown to saved language

      settingsPopup.classList.add('show');
      overlay.classList.add('show');
      if (pageContent) pageContent.classList.add('hidden');
    });
  }

  // Apply button behaviour
  applyBtn.addEventListener('click', () => {
  const selectedLang = document.getElementById('languageSelect').value;
  languageManager.loadLanguage(selectedLang); // call the manager
  closePopup(); // hide popup
  });

  // Cancel button behaviour
  cancelBtn.addEventListener('click', () => {
    langSelect.value = tempLang; // revert dropdown
    closePopup();
  });
});
