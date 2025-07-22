import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ieoxlrubqqaeiobeemhi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllb3hscnVicXFhZWlvYmVlbWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTMyOTMsImV4cCI6MjA2ODUyOTI5M30.Vono42FD2vV20FaGsAcj4IZ1rsTakETOHUMFgPTT9D0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 