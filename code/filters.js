const filtersPopupHTML = `
<!-- Overlay for dimmed effect when opening filters -->
<div class="overlay" aria-hidden="true"></div>

<!-- Popup menu for filters (initially hidden) -->
<div id="filter-popup" class="filter-popup">

  <!-- Close button -->
  <button class="popup-close">&times;</button>
  
  <!-- Popup title -->
  <div class="popup-title-container">
    <img src="../images/filter-icon-dik-transparent.png" alt="" class="popup-icon">
    <h2 data-i18n="searchfilters-title">Search filters</h2>
  </div>

  <!-- Filter options -->
  <div class="filter-row type-filter" data-filterkey="type">
    <span class="filter-name" data-i18n="typefilter-title">Type</span>
    <div class="filter-options">
      <button type="button" class="filter-option" data-i18n="typefilter-video" data-filterkey="video">Video</button>
      <button type="button" class="filter-option" data-i18n="typefilter-channel" data-filterkey="channel">Channel</button>
    </div>
  </div>

  <div class="filter-row single-select" data-optional="true" data-filterkey="videoDuration">
    <span class="filter-name" data-i18n="lengthfilter-title">Length</span>
    <div class="filter-options">
      <button type="button" class="filter-option" data-i18n="lengthfilter-4" data-filterkey="short">&lt;4 minutes</button>
      <button type="button" class="filter-option" data-i18n="lengthfilter-4-20" data-filterkey="medium">4-20 minutes</button>
      <button type="button" class="filter-option" data-i18n="lengthfilter-20" data-filterkey="long">&gt;20 minutes</button>
    </div>
  </div>

  <div class="filter-row single-select" data-optional="true" data-filterkey="uploadDate">
    <span class="filter-name" data-i18n="datefilter-title">Upload date</span>
    <div class="filter-options">
      <button type="button" class="filter-option" data-i18n="datefilter-today" data-filterkey="today">Today</button>
      <button type="button" class="filter-option" data-i18n="datefilter-week" data-filterkey="thisweek">This week</button>
      <button type="button" class="filter-option" data-i18n="datefilter-month" data-filterkey="thismonth">This month</button>
      <button type="button" class="filter-option" data-i18n="datefilter-year" data-filterkey="thisyear">This year</button>
    </div>
  </div>

  <div class="filter-row single-select" data-filterkey="order">
    <span class="filter-name" data-i18n="sortfilter-title">Sort on</span>
    <div class="filter-options">
      <button type="button" class="filter-option" data-i18n="sortfilter-relevance" data-filterkey="relevance">Relevance</button>
      <button type="button" class="filter-option" data-i18n="sortfilter-date" data-filterkey="date">Upload date</button>
      <button type="button" class="filter-option" data-i18n="sortfilter-viewcount" data-filterkey="viewCount">View count</button>
      <button type="button" class="filter-option" data-i18n="sortfilter-rating" data-filterkey="rating">Rating</button>
    </div>
  </div>
</div>
`;
document.addEventListener('DOMContentLoaded', () => {
    // inject popup
    document.body.insertAdjacentHTML('beforeend', filtersPopupHTML);

    // opening/closing behaviour of popup
    const filterButton = document.querySelector('.filter-button');
    const filterPopup = document.getElementById('filter-popup');
    const closeButton = filterPopup.querySelector('.popup-close');
    const overlay = document.querySelector('.overlay');
    const pageContent = document.querySelector('.landing-page-content');

    if(filterButton && filterPopup && closeButton && overlay){
    filterButton.addEventListener('click', () => {
        filterPopup.classList.add('show');
        overlay.classList.add('show');
        if (pageContent) pageContent.classList.add('hidden');
    });

    closeButton.addEventListener('click', () => {
        filterPopup.classList.remove('show');
        overlay.classList.remove('show');
        if (pageContent) pageContent.classList.remove('hidden');
    });

    overlay.addEventListener('click', () => {
        filterPopup.classList.remove('show');
        overlay.classList.remove('show');
        if (pageContent) pageContent.classList.remove('hidden');
    });
    }

    // filter buttons clicking behaviour
    const typeFilter = document.querySelector('.filter-row.type-filter')
    const singleSelectFilters = document.querySelectorAll('.filter-row.single-select');
    const multiSelectFilters = document.querySelectorAll('.filter-row.multi-select');

    // ------ Default filter selections
    // TYPE
    const typeButtons = typeFilter.querySelectorAll('.filter-option');
    typeButtons[0].classList.add('selected'); // Video by default
    // LENGTH; no selection by default
    // UPLOAD DATE; no selection by default
    // SORT
    const sortButtons = singleSelectFilters[2].querySelectorAll('.filter-option')
    sortButtons[0].classList.add('selected') // Relevance by default

    // ------ Type filter functionality
    // All other filters depend on this filter, as Channel blocks other filters
    typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // reset selection in type row
        typeButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        // update global filter state
        updateFiltersState();
    });
    });

    // ------ Single-selection filters functionality
    singleSelectFilters.forEach(row => {
    const buttons = row.querySelectorAll('.filter-option');
    const isOptional = row.dataset.optional === "true"; // check data-optional

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
        if (isOptional && btn.classList.contains('selected')) {
            // optional filter: deselect if already selected
            btn.classList.remove('selected');
        } else {
            // normal behavior: deselect all, then select clicked
            buttons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        }
        });
    });
    });

    // ------ Multi-selection filters functionality
    multiSelectFilters.forEach(row => {
    const buttons = row.querySelectorAll('.filter-option');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
        // toggle 'selected' class on clicked button
        btn.classList.toggle('selected'); // toggle alters between add and remove
        });
    });
    });

    // Function to disable/enable all filters except type filter if that is chosen as "Channel"
    function updateFiltersState() {
        const isChannel = document.querySelector('.type-filter .filter-option.selected')?.textContent.trim() === "Channel";
        const otherFilters = document.querySelectorAll('.filter-row:not(.type-filter)');

        otherFilters.forEach(row => {
            row.querySelectorAll('.filter-option').forEach(btn => {
            btn.classList.toggle('disabled', isChannel);
            if (isChannel) btn.classList.remove('selected');
            });
        });

        // restore Sort on default when switching back to Video
        if (!isChannel) {
            const sortRow = document.querySelector('.filter-row.single-select:last-of-type');
            const firstBtn = sortRow?.querySelector('.filter-option');
            if (sortRow && !sortRow.querySelector('.selected') && firstBtn) {
            firstBtn.classList.add('selected'); // Relevance
            }
        }
    }
});


