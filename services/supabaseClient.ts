import { createClient, SupabaseClient } from '@supabase/supabase-js';

// In a real production app, use environment variables.
// For this demo, we are using the credentials provided by the user.
const supabaseUrl = 'https://biwtpcqanowznbgeohkn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpd3RwY3Fhbm93em5iZ2VvaGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5Njg4NjksImV4cCI6MjA3MjU0NDg2OX0.RupJhZcWA4pN44JVWhaaCH5kE9y77hLRgMO6zQYt018';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    supabase = null;
  }
} else {
  console.warn("Supabase URL and/or Anon Key not provided. Database functionality will be disabled.");
}

export { supabase };
