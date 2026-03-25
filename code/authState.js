import { supabase } from './supabaseClient.js';

const authButton = document.getElementById('authButton');
const userGreeting = document.getElementById('user-greeting');
const userGreetingSub = document.getElementById('user-greeting-sub');
const searchSubtitle = document.getElementById('search-subtitle');
const searchTitle = document.getElementById('search-title');

function getGreetingKey() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'greeting-morning';
  if (hour >= 12 && hour < 18) return 'greeting-afternoon';
  if (hour >= 18 && hour < 22) return 'greeting-evening';
  return 'greeting-night';
}

const fallbacks = {
  'greeting-morning': 'Morning, {name}',
  'greeting-afternoon': 'Afternoon, {name}',
  'greeting-evening': 'Evening, {name}',
  'greeting-night': 'Night, {name}'
};

function updateGreeting(session) {
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
