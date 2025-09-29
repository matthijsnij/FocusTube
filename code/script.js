// Script for redirecting search query to results page
const searchInput = document.getElementById('searchInput'); // Get the input field

// Listen for key presses inside the input
searchInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') { // Check if the Enter key was pressed
    const query = searchInput.value.trim(); // Get and trim the input value
    if (query) { // Only proceed if input is not empty
      // Redirect to results page with the query as a URL parameter
      window.location.href = `results.html?search=${encodeURIComponent(query)}`;
    }
  }
});

// ------------- OPENING AND CLOSING FILTER SELECTION POPUP ----------------
const filterButton = document.querySelector('.filter-button');
const filterPopup = document.querySelector('.filter-popup');
const closeButton = document.querySelector('.popup-close');
const overlay   = document.querySelector('.overlay');
const pageContent = document.querySelector('.page-content'); // for removing page content when filter is open

// Toggle popup visibility when button is clicked
filterButton.addEventListener('click', () => {
  filterPopup.classList.toggle('show');
  overlay.classList.toggle('show');
  pageContent.classList.add('hidden'); // hide page content
});
// Close button click
closeButton.addEventListener('click', () => {
  filterPopup.classList.remove('show');
  overlay.classList.remove('show');
  pageContent.classList.remove('hidden'); // show page content
});
// Clicking on overlay also closes
overlay.addEventListener('click', () => {
  filterPopup.classList.remove('show');
  overlay.classList.remove('show');
  pageContent.classList.remove('hidden'); // show page content
});

// ------------- FILTERING ------------
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
const sortButtons = singleSelectFilters[1].querySelectorAll('.filter-option')
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

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // remove 'selected' from all buttons in this row
      buttons.forEach(b => b.classList.remove('selected'));
      // add 'selected' to clicked button
      btn.classList.add('selected');
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
  const selectedTypeFilter = document.querySelector('.filter-row.type-filter .filter-option.selected'); // get selected type filter
  const otherFilters = document.querySelectorAll('.filter-row:not(.type-filter)'); // get all other filters

  // CASE: select Channel
  if (selectedTypeFilter && selectedTypeFilter.textContent.trim() === "Channel") {
    otherFilters.forEach(row => {
      row.querySelectorAll('.filter-option').forEach(btn => {
        btn.classList.remove('selected'); // remove selected
        btn.classList.add('disabled'); // faded + unclickable styling
      });
    });
  } 
  // CASE: select Video
  else {
    otherFilters.forEach(row => {
      row.querySelectorAll('.filter-option').forEach(btn => {
        btn.classList.remove('disabled');
      });
    });
  }
}







