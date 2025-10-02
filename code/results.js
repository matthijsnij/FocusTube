// ====== DOM ELEMENTS ======
// References to key HTML elements
const resultsContainer = document.getElementById('results');        // Container for video results
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

// GETTING RESULTS
document.addEventListener('DOMContentLoaded', () => {
  // ====== GET SEARCH QUERY FROM URL ======
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('search');

  const searchInput = document.getElementById('searchInput');
  if (searchInput && query) {
      searchInput.value = query;
  }

  // ====== GET FILTERS FROM URL ======
  const filtersParam = urlParams.get('filters');
  let filtersFromURL = {};
  if (filtersParam) {
    try {
      filtersFromURL = JSON.parse(filtersParam);
      console.log('Filters from URL:', filtersFromURL);
    } catch (e) {
      console.error('Failed to parse filters from URL', e);
    }
  }

  // ======= INSERT FILTERS INTO POPUP =======
  Object.entries(filtersFromURL).forEach(([filterKey, filterValues]) => {
    // Make filterValues always an array for consistency
    const values = Array.isArray(filterValues) ? filterValues : [filterValues];

    // Find the row by its name
    const row = Array.from(document.querySelectorAll('.filter-row')).find(r => {
      return r.querySelector('.filter-name').textContent === filterKey;
    });

    if (!row) return; // skip if no row found

    // Loop over all buttons in the row
    const buttons = row.querySelectorAll('.filter-option');
    buttons.forEach(btn => {
      if (values.includes(btn.textContent)) {
        btn.classList.add('selected'); // add active class to match landing page selection
      } else {
        btn.classList.remove('selected');
      }
    });
  });

  // ====== FETCH AND DISPLAY VIDEOS ======
  const resultsContainer = document.getElementById('results');
  if (query && resultsContainer) {
    fetch('https://qmcaiprojects.app.n8n.cloud/webhook/e5b9c679-ce6e-4530-a7b4-5339a122e2ea', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search: query })
    })
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        resultsContainer.innerHTML = `<p>No videos found for "${query}".</p>`;
      } else {
        displayVideos(data);
      }
    })
    .catch(error => {
      console.error('Error fetching videos:', error);
      resultsContainer.innerHTML = `<p>Error fetching videos. Please try again later.</p>`;
    });
  }
});
