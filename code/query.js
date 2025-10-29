// Function for getting the current selected filters
function getCurrentFilters() {
  const filters = {};

  document.querySelectorAll('.filter-row').forEach(row => {
    const filterKey = row.dataset.filterkey; // internal name
    const selectedButtons = [...row.querySelectorAll('.filter-option.selected')].map(btn => btn.dataset.filterkey);

    filters[filterKey] = selectedButtons.length > 0 ? selectedButtons[0] : null; // NOTE assumes only single-select
  });

  return filters;
}

// Script for redirecting search query to results page
const searchInput = document.getElementById('searchInput'); // Get the input field

// Search function, either via Enter of clicking the search icon
function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
        const filters = getCurrentFilters();
        const API_KEY = "AIzaSyDPxNfirzwZqgXCXza_jsRCL2G3nKn00VU" // add API key
        const filterParams = encodeURIComponent(JSON.stringify(filters));
        window.location.href = `results.html?search=${encodeURIComponent(query)}&filters=${filterParams}&key=${encodeURIComponent(API_KEY)}`;
    }
}

// Existing Enter key listener
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});

// New: click on magnifying glass button
document.getElementById('searchButton').addEventListener('click', performSearch);










