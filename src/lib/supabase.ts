import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://kdqwlorfgffupppcbmcn.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImE3MzVlZGM0LTkzNjctNGM0Zi05MWU2LWU4MjJjM2QzNjc5MSJ9.eyJwcm9qZWN0SWQiOiJrZHF3bG9yZmdmZnVwcHBjYm1jbiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc3NjEyOTk1LCJleHAiOjIwOTI5NzI5OTUsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.8BC-swzpcefazsZsnBeUasNbIfDJ0crH4tgI8veimI0';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };
