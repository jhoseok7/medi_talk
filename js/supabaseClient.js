import { createClient } from '@supabase/supabase-js';

// 아래 두 값을 본인 Supabase 대시보드에서 복사해 입력하세요.
const supabaseUrl = 'https://ukefhgquffdkrfjyepqu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZWZoZ3F1ZmZka3JmanllcHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NTQ2NDQsImV4cCI6MjA4NTQzMDY0NH0.EKOssrWEe-knVH0KeTdfNoOIYPSNorWU6MKvPFSwWV4';

export const supabase = createClient(supabaseUrl, supabaseKey);
