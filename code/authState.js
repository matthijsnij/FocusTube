import { supabase } from './supabaseClient.js';

const authButton = document.getElementById('authButton');

// Initial check
const {
  data: { session }
} = await supabase.auth.getSession();
console.log('SESSION:', session);
if (!session) {
  authButton.style.display = 'block';
}

// React to future auth changes (login / logout)
supabase.auth.onAuthStateChange((_event, session) => {
  authButton.style.display = session ? 'none' : 'block';
});

// Navigate to login page
authButton.addEventListener('click', () => {
  window.location.href = 'login.html';
});
