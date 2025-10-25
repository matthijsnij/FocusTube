// ====== DOM ELEMENTS AND GLOBAL STATE ======
const resultsContainer = document.getElementById('results');
const videoModal = document.getElementById('videoModal');
const closeModalBtn = document.getElementById('closeModal');
const loadMoreButton = document.getElementById('loadMoreButton');

let nextPageToken = null;
let isLoading = false;
let query = '';
let filtersFromURL = {};
let apiKey = '';

let player; // YouTube player instance

// ====== YouTube API ======
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: ''
  });
}

// ====== MODAL VIDEO FUNCTIONS ======
function openVideo(videoId) {
  videoModal.style.display = 'flex';
  player.loadVideoById(videoId);
}

function closeVideo() {
  videoModal.style.display = 'none';
  if (player) player.stopVideo();
}

// ====== FUNCTION TO DISPLAY VIDEO RESULTS ======
function displayVideos(videos, container = resultsContainer, append = false) {
  if (!append) container.innerHTML = '';

  videos.forEach(video => {
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.medium.url;
    const channel = video.snippet.channelTitle;

    // Extra details
    const viewCount = video.statistics?.viewCount
      ? Number(video.statistics.viewCount).toLocaleString()
      : 'N/A';
    const uploadDate = video.snippet?.publishedAt
      ? new Date(video.snippet.publishedAt).toLocaleDateString()
      : 'Unknown';

    const videoElement = document.createElement('div');
    videoElement.classList.add('video-item');

    videoElement.innerHTML = `
      <img src="${thumbnail}" alt="${title}" style="cursor:pointer;">
      <h3>${title}</h3>
      <p>${channel}</p>
      <p class="video-meta">${viewCount} views • ${uploadDate}</p>
    `;

    videoElement.addEventListener('click', () => openVideo(videoId));
    container.appendChild(videoElement);
  });
}

// ============ FUNCTION FOR CREATING PAYLOAD FOR YOUTUBE API =================
function createPayload(query, filters, key) {
  let videoDuration = filters['videoDuration'];
  let publishedAfter = null;
  const uploadDate = filters["uploadDate"];
  const now = new Date();

  if (uploadDate) {
    switch (uploadDate) {
      case "today":
        publishedAfter = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case "thisweek":
        publishedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "thismonth":
        publishedAfter = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "thisyear":
        publishedAfter = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }
    publishedAfter = publishedAfter.toISOString().split(".")[0] + "Z";
  }

  let order = filters["order"];

  return {
    q: query,
    type: filters["type"],
    part: "snippet",
    maxResults: 20,
    order,
    ...(videoDuration && { videoDuration }),
    ...(publishedAfter && { publishedAfter }),
    key: key
  };
}

// ====== FETCH VIDEOS FUNCTION ======
async function fetchVideos(pageToken = null) {
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

    // ====== FETCH VIDEO DETAILS (view count + upload date) ======
    const videoIds = data.items.map(item => item.id.videoId).filter(Boolean);
    let detailedItems = data.items;

    if (videoIds.length > 0) {
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${apiKey}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      const detailsMap = {};
      detailsData.items.forEach(v => {
        detailsMap[v.id] = v;
      });

      detailedItems = data.items.map(item => {
        const extra = detailsMap[item.id.videoId] || {};
        return {
          ...item,
          statistics: extra.statistics,
          snippet: extra.snippet || item.snippet
        };
      });
    }

    // ====== DISPLAY VIDEOS WITH DETAILS ======
    if (!pageToken) {
      displayVideos(detailedItems, resultsContainer, false);
    } else {
      displayVideos(detailedItems, resultsContainer, true);
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

// ====== PAGE INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  query = urlParams.get('search');
  apiKey = urlParams.get('key');

  const filtersParam = urlParams.get('filters');
  filtersFromURL = {};
  if (filtersParam) {
    try { filtersFromURL = JSON.parse(filtersParam); }
    catch (e) { console.error('Failed to parse filters from URL', e); }
  }

  const originalFilters = { ...filtersFromURL };
  const searchInputResults = document.getElementById('searchInput');
  if (searchInputResults && query) searchInputResults.value = query;

  // ======= INSERT FILTERS INTO POPUP =======
  Object.entries(filtersFromURL).forEach(([filterKey, filterValues]) => {
    const values = Array.isArray(filterValues) ? filterValues : [filterValues];
    const row = document.querySelector(`.filter-row[data-filterkey="${filterKey}"]`);
    if (!row) return;
    const buttons = row.querySelectorAll('.filter-option');
    buttons.forEach(btn => {
      if (values.includes(btn.dataset.filterkey)) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  });

  // ====== MODAL EVENT LISTENERS ======
  closeModalBtn.addEventListener('click', closeVideo);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideo();
  });
  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) closeVideo();
  });

  // ===== DETECT FILTER CHANGES =====
  document.querySelectorAll('.filter-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const currentFilters = getCurrentFilters();
      const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(originalFilters);

      const filterChangedText = languageManager.getTranslation('loadmore-filterchanged');
      const defaultText = languageManager.getTranslation('loadmore-button');

      if (filtersChanged) {
        loadMoreButton.classList.add('disabled');
        loadMoreButton.disabled = true;
        loadMoreButton.textContent = filterChangedText;
      } else {
        loadMoreButton.classList.remove('disabled');
        loadMoreButton.disabled = false;
        loadMoreButton.textContent = defaultText;
      }
    });
  });

  // ====== LOAD MORE BUTTON CLICK ======
  loadMoreButton.addEventListener('click', () => {
    fetchVideos(nextPageToken);
  });

  // ====== INITIAL LOAD ======
  if (query && resultsContainer && apiKey) {
    fetchVideos();
  }
});
