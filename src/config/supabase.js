// Supabase yapılandırma dosyası
// Bu bilgileri Supabase Console > Project Settings > API bölümünden alın

import { createClient } from '@supabase/supabase-js'

// Supabase yapılandırma bilgileriniz
// Bu bilgileri Supabase Console'dan alın
const supabaseUrl = 'https://pxnqxovswnbuovsiekkm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4bnF4b3Zzd25idW92c2lla2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTM1ODcsImV4cCI6MjA3OTMyOTU4N30.qV1nchVCPEHfc5vyfUjfNwV7kL2hjM_B2FZ3XZ07iTs'

// Supabase client oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase

