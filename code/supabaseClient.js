const SUPABASE_URL = "https://tdnjzgzyliugcxtkbhrk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbmp6Z3p5bGl1Z2N4dGtiaHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MjksImV4cCI6MjA4MTUyOTUyOX0.aU5X55DqWb6-SWrRmCCuNO4hnfJSyCbY-FnXSyfBARk";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);