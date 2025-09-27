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

// Get the filter button and popup
const filterButton = document.querySelector('.filter-button');
const filterPopup = document.querySelector('.filter-popup');
const closeButton = document.querySelector('.popup-close');

// Toggle popup visibility when button is clicked
filterButton.addEventListener('click', () => {
  filterPopup.classList.toggle('show');
});
// Close button click
closeButton.addEventListener('click', () => {
  filterPopup.classList.remove('show');
});





