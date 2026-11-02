// Supabase project settings. The publishable/anon key is designed for browser use.
// Never put a service_role or secret key in this file.
window.AEROMED_SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
window.AEROMED_SUPABASE_ANON_KEY = "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";

if (window.supabase &&
    !window.AEROMED_SUPABASE_URL.startsWith("YOUR_") &&
    !window.AEROMED_SUPABASE_ANON_KEY.startsWith("YOUR_")) {
  window.aeromedSupabase = window.supabase.createClient(
    window.AEROMED_SUPABASE_URL,
    window.AEROMED_SUPABASE_ANON_KEY
  );
}
