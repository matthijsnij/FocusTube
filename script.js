// Script for redirecting search query to results page
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) {
      // Redirect to results page with the query in the URL
      window.location.href = `results.html?search=${encodeURIComponent(query)}`;
    }
  }
});


