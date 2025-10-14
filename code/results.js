// ====== DOM ELEMENTS AND GLOBAL STATE ======
// References to key HTML elements
const resultsContainer = document.getElementById('results');        // Container for video results
const videoModal = document.getElementById('videoModal');           // Modal overlay for video player
const closeModalBtn = document.getElementById('closeModal');        // Close button inside modal
const loadMoreButton = document.getElementById('loadMoreButton')

let nextPageToken = null;
let isLoading = false;
let query = '';
let filtersFromURL = {};
let apiKey = '';

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

// ====== FUNCTION TO DISPLAY VIDEO RESULTS ======
function displayVideos(videos, container = resultsContainer, append = false) {
  if (!append) {
    container.innerHTML = ''; // first page: clear previous results
  }

  videos.forEach(video => {
    const videoId = video.id.videoId;               
    const title = video.snippet.title;             
    const thumbnail = video.snippet.thumbnails.medium.url; 
    const channel = video.snippet.channelTitle;    

    const videoElement = document.createElement('div');
    videoElement.classList.add('video-item');

    videoElement.innerHTML = `
      <img src="${thumbnail}" alt="${title}" style="cursor:pointer;">
      <h3>${title}</h3>
      <p>${channel}</p>
    `;

    videoElement.addEventListener('click', () => openVideo(videoId));

    container.appendChild(videoElement); // always append
  });
}

// ============ FUNCTION FOR CREATING PAYLOAD FOR YOUTUBE API =================
function createPayload(query, filters, key) {

  // filters should be JSON object
  // key should be string

  // ===== Map Length filter to YouTube videoDuration =====
  let videoDuration = null;
  const length = filters["Length"]
  if (length) {
    if (filters["Length"] === "<4 minutes") {
      videoDuration = "short";
    } else if (filters["Length"] === "4-20 minutes") {
      videoDuration = "medium";
    } else if (filters["Length"] === ">20 minutes") {
      videoDuration = "long";
    }
  }

  // ===== Map Upload date to publishedAfter =====
  let publishedAfter = null;
  const uploadDate = filters["Upload date"];
  const now = new Date();

  if (uploadDate) {
    switch (uploadDate) {
      case "Today":
        publishedAfter = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case "This week":
        publishedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "This month":
        publishedAfter = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "This year":
        publishedAfter = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }

    // Format as ISO without milliseconds
    publishedAfter = publishedAfter.toISOString().split(".")[0] + "Z";
  }

  // ===== Map Sort on to YouTube order =====
  let order = "relevance";
  switch (filters["Sort on"]) {
    case "Upload date": order = "date"; break;
    case "View count": order = "viewCount"; break;
    case "Rating": order = "rating"; break;
    case "Relevance": order = "relevance"; break;
  }

  // ===== Return final payload =====
  return {
        q: query,
        type: filters["Type"].toLowerCase(),
        part: "snippet",
        maxResults: 20,
        order,
        ...(videoDuration && { videoDuration }),
        ...(publishedAfter && { publishedAfter }),
        key: key
      }
}

// ====== FETCH VIDEOS FUNCTION ======
async function fetchVideos(pageToken = null) { // 
  if (isLoading) return;
  isLoading = true;
  loadMoreButton.disabled = true;

  try {
    const payload = createPayload(query, filtersFromURL, apiKey);
    if (pageToken) payload.pageToken = pageToken;

    const queryString = new URLSearchParams(payload);
    const url = `https://www.googleapis.com/youtube/v3/search?${queryString}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      if (!pageToken) {
        resultsContainer.innerHTML = `<p>No results found for "${query}".</p>`;
      }
      loadMoreButton.style.display = 'none';
      return;
    }

    // ====== DISPLAY VIDEOS ======
    if (!pageToken) {
      displayVideos(data.items, resultsContainer, false); // first page: replace
    } else {
      displayVideos(data.items, resultsContainer, true);  // subsequent pages: append
    }

    // ====== UPDATE PAGINATION ======
    nextPageToken = data.nextPageToken || null;
    if (!nextPageToken) loadMoreButton.style.display = 'none';
    else loadMoreButton.style.display = '';

  } catch (error) {
    console.error('Error fetching videos:', error);
    if (!pageToken) resultsContainer.innerHTML = `<p>Error fetching videos. Please try again later.</p>`;
  } finally {
    isLoading = false;
    loadMoreButton.disabled = false;
  }
}

// LOGIC, AFTER LOADING ALL OF THE DOM
document.addEventListener('DOMContentLoaded', () => {

  // ====== GET SEARCH QUERY & FILTERS ======
  const urlParams = new URLSearchParams(window.location.search);
  query = urlParams.get('search');
  apiKey = urlParams.get('key')

  const filtersParam = urlParams.get('filters'); // string
  filtersFromURL = {};
  if (filtersParam) {
    try { filtersFromURL = JSON.parse(filtersParam); } 
    catch (e) { console.error('Failed to parse filters from URL', e); }
  }

  // SET SEARCH BAR QUERY
  const searchInputResults = document.getElementById('searchInput'); 
  if (searchInputResults && query) searchInputResults.value = query;


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
        btn.classList.add('selected'); // add selected class to match landing page selection
      } else {
        btn.classList.remove('selected');
      }
    });
  });

  // ====== MODAL EVENT LISTENERS ======
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

  // ====== LOAD MORE BUTTON CLICK ======
  loadMoreButton.addEventListener('click', () => {
    fetchVideos(nextPageToken);
  });

  // ====== INITIAL LOAD ======
  if (query && resultsContainer && apiKey) {
    fetchVideos(); // first page load
  }
});


