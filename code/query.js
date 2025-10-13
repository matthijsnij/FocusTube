// Function for getting the current selected filters
function getCurrentFilters() {
  const filters = {};

  // Loop over all filter rows
  document.querySelectorAll('.filter-row').forEach(row => {
    const filterName = row.querySelector('.filter-name').textContent.trim();
    const selectedButtons = [...row.querySelectorAll('.filter-option.selected')].map(btn => btn.textContent.trim());

    if (selectedButtons.length > 0) {
      filters[filterName] = selectedButtons[0]; // NOTE: assumes all are single select
    }
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
        const filterParams = encodeURIComponent(JSON.stringify(filters));
        window.location.href = `results.html?search=${encodeURIComponent(query)}&filters=${filterParams}`;
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










