const settingsPopupHTML = `
<!-- Overlay for dimmed effect when opening settings -->
<div class="overlay" aria-hidden="true"></div>

<!-- Popup menu for settings (initially hidden) -->
<div id="settings-popup" class="filter-popup">
  
  <!-- Popup title -->
  <div class="popup-title-container">
    <img src="../images/setting-icon.png" alt="" class="popup-icon">
    <h2>Settings</h2>
  </div>

  <!-- Theme settings -->
  <div class="settings-row">
    <span class="settings-label">Theme</span>
    <select id="themeSelect" class="settings-dropdown">
        <option value="standard-dark">Minimalist - Dark (default)</option>
        <option value="standard-light">Minimalist - Light</option>
    </select>
  </div>

  <!-- Language settings -->
  <div class="settings-row">
    <span class="settings-label">Language</span>
    <select id="languageSelect" class="settings-dropdown">
        <option value="english">English (default)</option>
        <option value="spanish">Español</option>
        <option value="french">Français</option>
        <option value="german">Deutsch</option>
        <option value="italian">Italiano</option>
        <option value="dutch">Nederlands</option>
    </select>
  </div>

  <div class="settings-actions">
    <button id="applySettings" class="apply-btn">Apply</button>
    <button id="cancelSettings" class="cancel-btn">Cancel</button>
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

  // Helper function for closing popup
  function closePopup() {
    settingsPopup.classList.remove('show');
    overlay.classList.remove('show');
    if (pageContent) pageContent.classList.remove('hidden');
  }

  // Open / close behavior
  if (settingsButton && settingsPopup && overlay) {
    settingsButton.addEventListener('click', () => {
      settingsPopup.classList.add('show');
      overlay.classList.add('show');
      if (pageContent) pageContent.classList.add('hidden');
    });
  }

  // Temporary behavior for Apply / Cancel (just close popup)
  if (applyBtn) applyBtn.addEventListener('click', closePopup);
  if (cancelBtn) cancelBtn.addEventListener('click', closePopup);
});
