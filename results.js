const resultsContainer = document.getElementById('results');
const searchTitle = document.getElementById('search-title');
const loadingIndicator = document.getElementById('results-loading');

// Get the search query from URL
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('search');

console.log('Search query:', query);

// Display the search term
if (query) {
  searchTitle.innerText = `Results for "${query}"`;

  // Send query to n8n webhook
  fetch('https://qmcaiprojects.app.n8n.cloud/webhook-test/e5b9c679-ce6e-4530-a7b4-5339a122e2ea', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ search: query })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Full n8n response:', data);  // log everything
    loadingIndicator.style.display = 'none';   // hide loading
    if (data.length === 0) {
      resultsContainer.innerHTML = `<p>No videos found for "${query}".</p>`;
    } else {
      displayVideos(data);
    }
  })
  .catch(error => {
    console.error('Error fetching videos:', error);
    loadingIndicator.style.display = 'none';
    resultsContainer.innerHTML = `<p>Error fetching videos. Please try again later.</p>`;
  });
}

// Function to display videos
function displayVideos(videos) {
videos.forEach(video => {
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.medium.url;
    const channel = video.snippet.channelTitle;

    const videoElement = document.createElement('div');
    videoElement.classList.add('video-item');
    videoElement.innerHTML = `
    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
        <img src="${thumbnail}" alt="${title}">
        <h3>${title}</h3>
        <p>${channel}</p>
    </a>
    `;
    resultsContainer.appendChild(videoElement);
});
}