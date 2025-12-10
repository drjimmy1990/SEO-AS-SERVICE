import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Retrieve the Supabase URL and Service Key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// --- Validation ---
// It's crucial to ensure that the environment variables are loaded correctly.
// If they are missing, the application should fail immediately with a clear error message.
if (!supabaseUrl) {
    throw new Error("Supabase URL is not defined. Please check your .env file.");
}
if (!supabaseServiceKey) {
    throw new Error("Supabase Service Key is not defined. Please check your .env file.");
}

// --- Create and Export the Supabase Client ---
// We create a single instance of the Supabase client using our credentials.
// Using the `service_role` key gives this client admin-level access to our database,
// allowing it to bypass any Row Level Security (RLS) policies. This is necessary
// for a trusted backend server that performs administrative tasks.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Export the client instance so other parts of our application can use it
export default supabase;
