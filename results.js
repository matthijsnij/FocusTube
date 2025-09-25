// ====== DOM ELEMENTS ======
// References to key HTML elements
const resultsContainer = document.getElementById('results');        // Container for video results
const searchTitle = document.getElementById('search-title');        // Heading showing search term
const loadingIndicator = document.getElementById('results-loading'); // "Loading..." text
const videoModal = document.getElementById('videoModal');           // Modal overlay for video player
const closeModalBtn = document.getElementById('closeModal');        // Close button inside modal

let player; // YouTube player instance, initialized later

// ====== YouTube API ======
// Called automatically by YouTube API when ready
function onYouTubeIframeAPIReady() {
  // Create a new YouTube player inside the #player div
  player = new YT.Player('player', {
    height: '390',       // player height in pixels
    width: '640',        // player width in pixels
    videoId: ''          // initially empty; video will be loaded on demand
  });
}

// ====== MODAL VIDEO FUNCTIONS ======

// Open the modal and play the selected video
function openVideo(videoId) {
  videoModal.style.display = 'flex';   // show the modal overlay, overrides CSS by making it visible
  player.loadVideoById(videoId);       // load and play video by ID
}

// Close the modal and stop video playback
function closeVideo() {
  videoModal.style.display = 'none';   // hide the modal
  if (player) player.stopVideo();      // stop video if player exists
}

// ====== EVENT LISTENERS ======

// Close modal when clicking the "X" button
closeModalBtn.addEventListener('click', closeVideo);

// Close modal when pressing the Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeVideo(); // Does not do anything if video player is closed already
});

// Close modal when clicking outside the video player (on overlay)
videoModal.addEventListener('click', (e) => {
  if (e.target === videoModal) closeVideo();  // NOTE: Do we want this?
});

// ====== GET SEARCH QUERY FROM URL ======
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('search');   // Get ?search=... parameter
console.log('Search query:', query); // NOTE: remove logging when moving to production

// ====== FETCH AND DISPLAY VIDEOS ======
if (query) {
  // Show search term in page heading
  searchTitle.innerText = `Results for "${query}"`; // NOTE: Maybe remove, instead just have the searchbar on top with the filled in search

  // Send search query to n8n webhook
  fetch('https://qmcaiprojects.app.n8n.cloud/webhook/e5b9c679-ce6e-4530-a7b4-5339a122e2ea', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // tells n8n that query is send as JSON
    body: JSON.stringify({ search: query }) // send query as JSON
  })
  .then(response => response.json()) // Parse response as JSON
  .then(data => {
    console.log('Full n8n response:', data);  // Log the full response for debugging, NOTE: remove logging when moving to production
    loadingIndicator.style.display = 'none';   // Hide loading... text

    if (data.length === 0) {
      // No videos found
      resultsContainer.innerHTML = `<p>No videos found for "${query}".</p>`; // NOTE: this can be extended by mentioning different query, filters
    } else {
      // Display the list of videos
      displayVideos(data);
    }
  })
  .catch(error => {
    // Handle network or fetch errors
    console.error('Error fetching videos:', error); // NOTE: remove logging when moving to production
    loadingIndicator.style.display = 'none'; // Hide loading... text
    resultsContainer.innerHTML = `<p>Error fetching videos. Please try again later.</p>`;
  });
}

// ====== FUNCTION TO DISPLAY VIDEO RESULTS ======
function displayVideos(videos) {
  resultsContainer.innerHTML = ''; // clear any previous results

  videos.forEach(video => {
    const videoId = video.id.videoId;               // YouTube video ID
    const title = video.snippet.title;             // Video title
    const thumbnail = video.snippet.thumbnails.medium.url; // Thumbnail image
    const channel = video.snippet.channelTitle;    // Channel name

    // Create a container div for each video
    const videoElement = document.createElement('div');
    videoElement.classList.add('video-item');

    // Add video thumbnail, title, and channel name
    videoElement.innerHTML = `
      <img src="${thumbnail}" alt="${title}" style="cursor:pointer;">
      <h3>${title}</h3>
      <p>${channel}</p>
    `;

    // Clicking the video opens the modal player
    videoElement.addEventListener('click', () => openVideo(videoId));

    // Append the video to the results container
    resultsContainer.appendChild(videoElement);
  });
}

