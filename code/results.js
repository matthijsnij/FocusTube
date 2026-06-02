// ====== DOM ELEMENTS AND GLOBAL STATE ======
// References to key HTML elements
const resultsContainer = document.getElementById('results');        // Container for video results
const videoModal = document.getElementById('videoModal');           // Modal overlay for video player
const closeModalBtn = document.getElementById('closeModal');        // Close button inside modal
const loadMoreButton = document.getElementById('loadMoreButton');   // Load more button

let isLoading = false;         // Loading state to prevent multiple fetches
let query = '';                // Current search query
let filtersFromURL = {};       // Filters parsed from URL
let apiKey = '';               // YouTube API key
let channelId = '';            // Channel ID for scoped video search
let channelName = '';          // Channel name for display in chip
let isChannelSearch = false;   // True when searching for channels (type=channel)

// Cached results to avoid repeated search.list calls
let cachedSearchItems = [];    // YouTube search.items[] for the current query/filters
let cachedStatsMap = {};       // videoId -> { views, duration }
let visibleCount = 0;
let nextPageToken = null;      // Token for fetching next batch of 50 from YouTube
const PAGE_SIZE = 20;          // How many results we reveal per "Load more"

let player; // YouTube player instance, initialized later

// ====== THEME HANDLING ======
const root = document.documentElement;
let tempTheme = localStorage.getItem('theme') || 'standard-light';
switch (tempTheme) {
  case 'standard-light':
    root.setAttribute('data-theme', 'light');
    break;
  case 'gradient-dark':
    root.setAttribute('data-theme', 'gradient-dark');
    break;
  case 'gradient-light':
    root.setAttribute('data-theme', 'gradient-light');
    break;
  default:
    // standard-dark (default)
    root.removeAttribute('data-theme');
    break;
}

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

// ====== HELPER FUNCTION: Relative Time ======
// Convert ISO date string into a relative time (e.g., "2 months ago")
function timeAgo(dateString) {
  const t = (key, vars = {}) => {
    let str = window.languageManager?.getTranslation(key);
    if (!str || str === key) str = null; // fall back if not loaded or key returned as-is
    const fallbacks = {
      'time-today': 'Today',
      'time-day-ago': '1 day ago',
      'time-days-ago': '{n} days ago',
      'time-month-ago': '1 month ago',
      'time-months-ago': '{n} months ago',
      'time-year-ago': '1 year ago',
      'time-years-ago': '{n} years ago',
    };
    str = str || fallbacks[key] || key;
    return str.replace('{n}', vars.n ?? '');
  };

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return t('time-today');
  if (diffDays === 1) return t('time-day-ago');
  if (diffDays < 30) return t('time-days-ago', { n: diffDays });
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? t('time-month-ago') : t('time-months-ago', { n: months });
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? t('time-year-ago') : t('time-years-ago', { n: years });
}

// ====== HELPER FUNCTION: Format View Count ======
// Format view count according to rules
// - <= 9999: exact digits
// - >= 10000 and < 1,000,000: in thousands with 1 decimal (e.g., 10.5K)
// - >= 1,000,000: in millions with 1 decimal (e.g., 1.2M)
function formatViews(views) {
  views = Number(views);
  if (views <= 9999) return views.toString();
  if (views < 1000000) return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}

// ====== HELPER FUNCTION: Format Duration ======
// Convert ISO 8601 duration (PT#H#M#S) to simplified format: 10min or 1h30min
function formatDuration(isoDuration) {
  if (!isoDuration || typeof isoDuration !== 'string') return '<1min'; // backup if stats request fails
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return '<1min'; // backup if stats request fails
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);

  if (hours === 0 && minutes === 0) return '<1min';  // edge case for very short videos
  if (hours > 0) {
    return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
  } else {
    return `${minutes}min`;
  }
}

// ====== HELPER FUNCTION: Escape HTML ======
// Prevents XSS by escaping special characters before inserting into innerHTML
function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ====== FUNCTION TO DISPLAY VIDEO RESULTS ======
async function displayVideos(videos, container = resultsContainer, append = false, precomputedStatsMap = null) {
  if (!append) {
    container.innerHTML = ''; // first page: clear previous results
  }

  // ====== FETCH VIEW COUNTS AND DURATIONS ======
  // If stats are provided, reuse them to avoid extra API calls on "Load more"
  let statsMap = precomputedStatsMap;
  if (!statsMap) {
    const videoIds = videos.map(v => v.id.videoId).join(',');
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();
    statsMap = {};
    (statsData.items || []).forEach(item => {
      statsMap[item.id] = {
        views: item.statistics.viewCount,
        duration: formatDuration(item.contentDetails.duration)
      };
    });
  }

  // ====== CREATE VIDEO ELEMENTS ======
  videos.forEach(video => {
    const videoId = video.id.videoId;                
    const title = video.snippet.title;              
    const thumbnail = video.snippet.thumbnails.medium.url; 
    const channel = video.snippet.channelTitle;     
    const publishedAt = video.snippet.publishedAt;  
    const stats = statsMap[videoId] || { views: '0', duration: '<1min' };

    const videoElement = document.createElement('div');
    videoElement.classList.add('video-item');

    const viewsLabel = (() => {
      const raw = window.languageManager?.getTranslation('views-word');
      return (!raw || raw === 'views-word') ? 'views' : raw;
    })();

    // Inner HTML mimicking YouTube style:
    videoElement.innerHTML = `
      <div class="thumbnail-container" style="position: relative; display: inline-block; cursor:pointer;">
        <img src="${escapeHTML(thumbnail)}" alt="${escapeHTML(title)}">
        <span class="duration" style="
          position: absolute;
          bottom: 4px;
          right: 4px;
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          font-size: 11.5px;
          padding: 2px 4px;
          border-radius: 5px; 
          font-weight: bold;
        ">${stats.duration}</span>
      </div>
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(channel)}</p>
      <p>${formatViews(stats.views)} ${viewsLabel} • ${timeAgo(publishedAt)}</p>
    `;

    // Open video modal on click
    videoElement.addEventListener('click', () => openVideo(videoId));

    container.appendChild(videoElement);
  });
}

async function fetchVideoStatsMap(videoIds) {
  if (!videoIds || videoIds.length === 0) return {};
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`;
  const statsRes = await fetch(statsUrl);
  const statsData = await statsRes.json();
  if (statsData?.error) {
    console.error('YouTube videos.list error:', statsData.error);
    // Don't break rendering if stats fail; just omit stats.
    return {};
  }
  const statsMap = {};
  (statsData.items || []).forEach(item => {
    statsMap[item.id] = {
      views: item.statistics.viewCount,
      duration: formatDuration(item.contentDetails.duration)
    };
  });
  return statsMap;
}

async function renderNextPageFromCache() {
  // If cache is exhausted but more pages exist, fetch next batch first
  if (visibleCount >= cachedSearchItems.length) {
    if (nextPageToken) {
      await fetchVideos(nextPageToken);
    }
    return;
  }

  const startIdx = visibleCount;
  const endIdx = Math.min(visibleCount + PAGE_SIZE, cachedSearchItems.length);
  const slice = cachedSearchItems.slice(startIdx, endIdx);
  if (slice.length === 0) return;

  visibleCount = endIdx;
  await displayVideos(slice, resultsContainer, startIdx > 0, cachedStatsMap);

  if (visibleCount >= cachedSearchItems.length && !nextPageToken) {
    loadMoreButton.style.display = 'none';
  } else {
    loadMoreButton.style.display = '';
  }
}

// ============ FUNCTION FOR CREATING PAYLOAD FOR YOUTUBE API =================
function createPayload(query, filters, key) {

  // filters should be JSON object
  // key should be string

  // ===== Map Length filter to YouTube videoDuration =====
  let videoDuration = filters['videoDuration'];

  // ===== Map Upload date to publishedAfter =====
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

    // Format as ISO without milliseconds
    publishedAfter = publishedAfter.toISOString().split(".")[0] + "Z";
  }

  // ===== Map Sort on to YouTube order =====
  // If unset, don't send "order=null" (invalid). Default to relevance.
  let order = filters["order"] || "relevance";

  // ===== Return final payload =====
  const type = filters["type"] || "video";
  return {
    q: query,
    type,
    part: "snippet",
    // search.list maxResults is capped (50). We fetch once, then paginate locally.
    maxResults: 50,
    order,
    ...(videoDuration && { videoDuration }),
    ...(publishedAfter && { publishedAfter }),
    ...(channelId && { channelId }),
    key: key
  };
}

// ====== DISPLAY CHANNEL RESULTS ======
function displayChannels(channels, append = false) {
  if (!append) resultsContainer.innerHTML = '';

  channels.forEach(channel => {
    const chId = channel.id.channelId;
    const title = channel.snippet.title;
    const description = channel.snippet.description;
    const thumbnail = channel.snippet.thumbnails?.medium?.url || '';
    const stats = cachedStatsMap[chId] || {};
    const subs = stats.subscribers !== undefined ? formatViews(stats.subscribers) + ' subscribers' : '';
    const videos = stats.videoCount !== undefined ? stats.videoCount + ' videos' : '';
    const meta = [subs, videos].filter(Boolean).join(' • ');

    const el = document.createElement('div');
    el.classList.add('channel-item');
    el.innerHTML = `
      <img src="${escapeHTML(thumbnail)}" alt="${escapeHTML(title)}" class="channel-avatar">
      <div class="channel-info">
        <h3>${escapeHTML(title)}</h3>
        ${meta ? `<p class="channel-meta">${escapeHTML(meta)}</p>` : ''}
        ${description ? `<p class="channel-description">${escapeHTML(description)}</p>` : ''}
      </div>
    `;

    el.addEventListener('click', () => {
      NProgress.start();
      window.location.href = `index.html?channelId=${encodeURIComponent(chId)}&channelName=${encodeURIComponent(title)}`;
    });

    resultsContainer.appendChild(el);
  });
}

// ====== RENDER CHANNELS FROM CACHE ======
async function renderChannelsFromCache() {
  if (visibleCount >= cachedSearchItems.length) {
    if (nextPageToken) await fetchChannels(nextPageToken);
    return;
  }
  const startIdx = visibleCount;
  const endIdx = Math.min(visibleCount + PAGE_SIZE, cachedSearchItems.length);
  const slice = cachedSearchItems.slice(startIdx, endIdx);
  if (slice.length === 0) return;

  visibleCount = endIdx;
  displayChannels(slice, startIdx > 0);

  loadMoreButton.style.display = (visibleCount >= cachedSearchItems.length && !nextPageToken) ? 'none' : '';
}

// ====== FETCH CHANNELS FUNCTION ======
async function fetchChannels(pageToken = null) {
  if (isLoading) return;
  isLoading = true;
  loadMoreButton.disabled = true;

  try {
    const payload = { q: query, type: 'channel', part: 'snippet', maxResults: 50, key: apiKey };
    if (pageToken) payload.pageToken = pageToken;

    const url = `https://www.googleapis.com/youtube/v3/search?${new URLSearchParams(payload)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data?.error) {
      console.error('YouTube API error (403 = quota limit reached):', data.error);
      // Error code 403 typically means the daily API quota has been reached
      resultsContainer.innerHTML = `<p class="error-message">YouTube API error: ${escapeHTML(data.error.message)}</p>`;
      loadMoreButton.style.display = 'none';
      return;
    }

    const items = (data.items || []).filter(i => i?.id?.channelId);
    if (items.length === 0 && !pageToken) {
      resultsContainer.innerHTML = `<p>No channels found for "${escapeHTML(query)}".</p>`;
      loadMoreButton.style.display = 'none';
      return;
    }

    nextPageToken = data.nextPageToken || null;

    if (pageToken) {
      cachedSearchItems = [...cachedSearchItems, ...items];
    } else {
      cachedSearchItems = items;
      visibleCount = 0;
    }

    // Fetch subscriber + video counts
    const ids = items.map(i => i.id.channelId).join(',');
    const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${ids}&key=${apiKey}`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();
    (statsData.items || []).forEach(item => {
      cachedStatsMap[item.id] = {
        subscribers: item.statistics.subscriberCount,
        videoCount: item.statistics.videoCount
      };
    });

    await renderChannelsFromCache();
  } catch (error) {
    console.error('Error fetching channels:', error);
    resultsContainer.innerHTML = `<p class="error-message">Error fetching channels.</p>`;
  } finally {
    isLoading = false;
    loadMoreButton.disabled = false;
  }
}

// ====== FETCH VIDEOS FUNCTION ======
async function fetchVideos(pageToken = null) {
  if (isLoading) return;                   // Prevent multiple simultaneous requests
  isLoading = true;
  loadMoreButton.disabled = true;          // Disable load more button during fetch

  try {
    const payload = createPayload(query, filtersFromURL, apiKey);
    if (pageToken) payload.pageToken = pageToken;

    const queryString = new URLSearchParams(payload);
    const url = `https://www.googleapis.com/youtube/v3/search?${queryString}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data?.error) {
      console.error('YouTube API error (403 = quota limit reached):', data.error);
      const msg =
        data.error?.errors?.[0]?.message ||
        data.error?.message ||
        'Unknown YouTube API error.';
      resultsContainer.innerHTML = `<p class="error-message">YouTube API error: ${escapeHTML(msg)}</p>`;
      loadMoreButton.style.display = 'none';
      return;
    }

    if (!data.items || data.items.length === 0) {
      resultsContainer.innerHTML = `<p>No results found for "${escapeHTML(query)}".</p>`;
      loadMoreButton.style.display = 'none';
      return;
    }

    // Cache results for local pagination (no repeated search.list on "Load more")
    const newItems = data.items.filter(v => v?.id?.videoId);
    if (newItems.length === 0 && !pageToken) {
      resultsContainer.innerHTML = `<p>No video results found for "${escapeHTML(query)}".</p>`;
      loadMoreButton.style.display = 'none';
      return;
    }

    // Store next page token for when current cache is exhausted
    nextPageToken = data.nextPageToken || null;

    if (pageToken) {
      // Append to existing cache
      cachedSearchItems = [...cachedSearchItems, ...newItems];
    } else {
      // Fresh search — reset everything
      cachedSearchItems = newItems;
      cachedStatsMap = {};
      visibleCount = 0;
    }

    // Pre-fetch stats for new items, merge into cachedStatsMap
    const ids = newItems.map(v => v.id.videoId);
    try {
      const newStats = await fetchVideoStatsMap(ids);
      cachedStatsMap = { ...cachedStatsMap, ...newStats };
    } catch (e) {
      console.error('Failed to fetch video stats:', e);
    }

    // Render first page from cache
    await renderNextPageFromCache();

  } catch (error) {
    console.error('Error fetching videos:', error);
    resultsContainer.innerHTML = `<p class="error-message">Error fetching videos. Please try again.</p>`;
  } finally {
    isLoading = false;
    loadMoreButton.disabled = false;
  }

}

// ====== DOM CONTENT LOADED LOGIC ======
document.addEventListener('DOMContentLoaded', () => {

  // ====== GET SEARCH QUERY & FILTERS ======
  const urlParams = new URLSearchParams(window.location.search);
  query = urlParams.get('search');        // Get search query from URL
  apiKey = 'AIzaSyDPxNfirzwZqgXCXza_jsRCL2G3nKn00VU'; // YouTube API key
  channelId = urlParams.get('channelId') || '';
  channelName = urlParams.get('channelName') || '';

  const filtersParam = urlParams.get('filters'); // string
  filtersFromURL = {};
  if (filtersParam) {
    try { filtersFromURL = JSON.parse(filtersParam); }
    catch (e) { console.error('Failed to parse filters from URL', e); }
  }

  isChannelSearch = filtersFromURL.type === 'channel';

  // ====== CHANNEL SCOPE CHIP ======
  const scopeChip = document.getElementById('channel-scope-chip');
  if (channelId && channelName && scopeChip) {
    // Set search bar placeholder
    const searchInputEl = document.getElementById('searchInput');
    if (searchInputEl) {
      const searchingInLabel = window.languageManager?.getTranslation('searching-in') || 'Searching in:';
      searchInputEl.placeholder = `${searchingInLabel} ${channelName}`;
    }

    function renderExitButton() {
      const exitLabel = window.languageManager?.getTranslation('exit-channel-mode') || 'Exit channel mode';
      scopeChip.innerHTML = `<button id="clearChannelScope" aria-label="Exit channel mode">${exitLabel}</button>`;
      scopeChip.style.display = 'flex';
      document.getElementById('clearChannelScope').addEventListener('click', () => {
        NProgress.start();
        window.location.href = 'index.html';
      });
    }

    renderExitButton();
    document.addEventListener('languageChanged', renderExitButton);
  }

  // STORE ORIGINAL FILTERS
  const originalFilters = { ...filtersFromURL }; // shallow copy

  // SET SEARCH BAR QUERY
  const searchInputResults = document.getElementById('searchInput'); 
  if (searchInputResults && query) searchInputResults.value = query;

  // ======= INSERT FILTERS INTO POPUP =======
  Object.entries(filtersFromURL).forEach(([filterKey, filterValues]) => {
    const values = Array.isArray(filterValues) ? filterValues : [filterValues];

    // Find row by its internal key
    const row = document.querySelector(`.filter-row[data-filterkey="${filterKey}"]`);
    if (!row) return;

    // Loop over all buttons in the row
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
  closeModalBtn.addEventListener('click', closeVideo);          // Close modal on "X" click
  window.addEventListener('keydown', (e) => {                   // Close modal on Escape key
    if (e.key === 'Escape') closeVideo();
  });
  videoModal.addEventListener('click', (e) => {                 // Close modal when clicking outside player
    if (e.target === videoModal) closeVideo();
  });

  // ===== DETECT FILTER CHANGES =====
  document.querySelectorAll('.filter-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const currentFilters = {};
      document.querySelectorAll('.filter-row').forEach(row => {
        const key = row.dataset.filterkey;
        const selected = [...row.querySelectorAll('.filter-option.selected')].map(b => b.dataset.filterkey);
        currentFilters[key] = selected.length > 0 ? selected[0] : null;
      });
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
    if (isChannelSearch) renderChannelsFromCache();
    else renderNextPageFromCache();
  });

  // ====== RE-RENDER ON LANGUAGE CHANGE (no API call needed) ======
  document.addEventListener('languageChanged', () => {
    if (!isChannelSearch && cachedSearchItems.length > 0) {
      const visible = cachedSearchItems.slice(0, visibleCount);
      displayVideos(visible, resultsContainer, false, cachedStatsMap);
    }
  });

  // ====== INITIAL LOAD ======
  if (resultsContainer && apiKey) {
    if (isChannelSearch && query) {
      fetchChannels();
    } else if (!isChannelSearch && query) {
      fetchVideos();
    }
  }
});


