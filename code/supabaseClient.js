import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://tdnjzgzyliugcxtkbhrk.supabase.co';
export const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbmp6Z3p5bGl1Z2N4dGtiaHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MjksImV4cCI6MjA4MTUyOTUyOX0.aU5X55DqWb6-SWrRmCCuNO4hnfJSyCbY-FnXSyfBARk';

// Routes session storage to localStorage (persistent) or sessionStorage (tab-only)
// depending on whether the user checked "stay signed in" at login.
const customStorage = {
  getItem: (key) => sessionStorage.getItem(key) ?? localStorage.getItem(key),
  setItem: (key, value) => {
    if (localStorage.getItem('ft_stay_signed_in') === 'true') {
      localStorage.setItem(key, value);
    } else {
      sessionStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

export const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { storage: customStorage }
});

