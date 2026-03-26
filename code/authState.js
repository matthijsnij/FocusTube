import { supabase } from './supabaseClient.js';

const authButton = document.getElementById('authButton');
const userGreeting = document.getElementById('user-greeting');
const userGreetingSub = document.getElementById('user-greeting-sub');
const searchSubtitle = document.getElementById('search-subtitle');
const searchTitle = document.getElementById('search-title');

// ====== CHANNEL MODE ======
const _urlParams = new URLSearchParams(window.location.search);
const _channelId = _urlParams.get('channelId');
const _channelName = _urlParams.get('channelName');
const isChannelMode = !!_channelId;

function setupChannelModeUI() {
  if (!isChannelMode) return;

  document.body.classList.add('channel-mode');

  const title = window.languageManager?.getTranslation('channel-mode-title') || 'You are in channel mode.';
  if (userGreeting) {
    userGreeting.textContent = title;
    userGreeting.style.display = 'block';
  }
  if (userGreetingSub) userGreetingSub.style.display = 'none';
  if (searchTitle) searchTitle.style.display = 'none';
  if (searchSubtitle) searchSubtitle.style.display = 'none';

  // Set search bar placeholder to "Searching in: [ChannelName]"
  const searchInput = document.getElementById('searchInput');
  if (searchInput && _channelName) {
    const searchingInLabel = window.languageManager?.getTranslation('searching-in') || 'Searching in:';
    searchInput.placeholder = `${searchingInLabel} ${_channelName}`;
  }

  // Render exit channel mode button
  const scopeChip = document.getElementById('channel-scope-chip');
  if (scopeChip) {
    const exitLabel = window.languageManager?.getTranslation('exit-channel-mode') || 'Exit channel mode';
    scopeChip.innerHTML = `<button id="clearChannelScope" aria-label="Exit channel mode">${exitLabel}</button>`;
    scopeChip.style.display = 'flex';
    document.getElementById('clearChannelScope').addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

setupChannelModeUI();
// Re-render channel mode UI when language changes (to translate the title/chip label)
document.addEventListener('languageChanged', () => {
  if (isChannelMode) setupChannelModeUI();
});

function getGreetingKey() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'greeting-morning';
  if (hour >= 12 && hour < 18) return 'greeting-afternoon';
  if (hour >= 18 && hour < 22) return 'greeting-evening';
  return 'greeting-night';
}

const fallbacks = {
  'greeting-morning': 'Morning, {name}.',
  'greeting-afternoon': 'Afternoon, {name}.',
  'greeting-evening': 'Evening, {name}.',
  'greeting-night': 'Night, {name}.'
};

function updateGreeting(session) {
  if (isChannelMode) return; // channel mode overrides all greeting logic
  if (session) {
    const firstName = session.user?.user_metadata?.firstName || '';
    const key = getGreetingKey();
    const greetingTemplate = window.languageManager?.getTranslation(key) || fallbacks[key];
    const greetingSub = window.languageManager?.getTranslation('greeting-sub') || 'Welcome back to FocusTube';
    if (userGreeting) {
      userGreeting.textContent = greetingTemplate.replace('{name}', firstName);
      userGreeting.style.display = 'block';
    }
    if (userGreetingSub) {
      userGreetingSub.textContent = greetingSub;
      userGreetingSub.style.display = 'block';
    }
    if (searchTitle) searchTitle.style.display = 'none';
    if (searchSubtitle) searchSubtitle.style.display = 'none';
  } else {
    if (userGreeting) userGreeting.style.display = 'none';
    if (userGreetingSub) userGreetingSub.style.display = 'none';
    if (searchTitle) searchTitle.style.display = '';
    if (searchSubtitle) searchSubtitle.style.display = '';
  }
}

// Initial check
const {
  data: { session }
} = await supabase.auth.getSession();

if (!session) {
  authButton.style.display = 'block';
}
updateGreeting(session);

// React to future auth changes (login / logout)
supabase.auth.onAuthStateChange((_event, session) => {
  authButton.style.display = session ? 'none' : 'block';
  updateGreeting(session);
});

// Navigate to login page
authButton.addEventListener('click', () => {
  window.location.href = 'login.html';
});

// Re-render greeting when language changes
document.addEventListener('languageChanged', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  updateGreeting(session);
});
