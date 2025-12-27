import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fnwnahnhtqmxgrywswdy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZud25haG5odHFteGdyeXdzd2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDYzNzgsImV4cCI6MjA4MjQyMjM3OH0.CULzNVqj6aADcZyX6-CHNyhlpHv16c1O8HlwxLVZpU4'

export const supabase = createClient(supabaseUrl, supabaseKey)
