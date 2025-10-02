// Function for getting the current selected filters
function getCurrentFilters() {
  const filters = {};

  // Loop over all filter rows
  document.querySelectorAll('.filter-row').forEach(row => {
    const filterName = row.querySelector('.filter-name').textContent.trim();
    const selectedButtons = [...row.querySelectorAll('.filter-option.selected')].map(btn => btn.textContent.trim());

    if (selectedButtons.length > 0) {
      filters[filterName] = selectedButtons;
    }
  });

  return filters;
}

// Script for redirecting search query to results page
const searchInput = document.getElementById('searchInput'); // Get the input field

// Listen for key presses inside the input
searchInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') { // Check if the Enter key was pressed
    const query = searchInput.value.trim(); // Get and trim the input value
    if (query) { // Only proceed if input is not empty
      const filters = getCurrentFilters()
      const filterParams = encodeURIComponent(JSON.stringify(filters));
      // Redirect to results page with the query as a URL parameter and the filters
      window.location.href = `results.html?search=${encodeURIComponent(query)}&filters=${filterParams}`;
    }
  }
});









