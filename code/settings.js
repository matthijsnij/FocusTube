const settingsPopupHTML = `
<!-- Overlay for dimmed effect when opening settings -->
<div class="overlay" aria-hidden="true"></div>

<!-- Popup menu for settings (initially hidden) -->
<div id="settings-popup" class="filter-popup">

  <!-- Close button -->
  <button class="popup-close">&times;</button>
  
  <!-- Popup title -->
  <div class="popup-title-container">
    <img src="../images/setting-icon.png" alt="" class="popup-icon">
    <h2>Settings</h2>
  </div>

  <!-- Settings content -->
  <div class="settings-row">
    <span class="settings-label">Theme</span>
    <select class="settings-dropdown">
        <option value="standard-dark">Minimalist - Dark (default)</option>
        <option value="standard-light">Minimalist - Light</option>
    </select>
  </div>

  <!-- Add other settings rows here -->
  <div class="settings-row">
    <span class="settings-label">Language</span>
    <select class="settings-dropdown">
        <option value="english">English (default)</option>
        <option value="spanish">Español</option>
        <option value="french">Français</option>
        <option value="german">Deutsch</option>
        <option value="italian">Italiano</option>
        <option value="dutch">Nederlands</option>
    </select>
  </div>
</div>
`;

document.addEventListener('DOMContentLoaded', () => {
    // inject popup
    document.body.insertAdjacentHTML('beforeend', settingsPopupHTML);

    // opening/closing behaviour of popup
    const settingsButton = document.querySelector('.settings-button');
    const settingsPopup = document.getElementById('settings-popup');
    const closeButton = settingsPopup.querySelector('.popup-close');
    const overlay = settingsPopup.previousElementSibling
    const pageContent = document.querySelector('.landing-page-content');

    if(settingsButton && settingsPopup && closeButton && overlay){
        settingsButton.addEventListener('click', () => {
            settingsPopup.classList.add('show');
            overlay.classList.add('show');
            if (pageContent) pageContent.classList.add('hidden');
        });

        closeButton.addEventListener('click', () => {
            settingsPopup.classList.remove('show');
            overlay.classList.remove('show');
            if (pageContent) pageContent.classList.remove('hidden');
        });

        overlay.addEventListener('click', () => {
            settingsPopup.classList.remove('show');
            overlay.classList.remove('show');
            if (pageContent) pageContent.classList.remove('hidden');
        });
    }
});
