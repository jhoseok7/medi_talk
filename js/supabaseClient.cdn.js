// CDN 방식으로 Supabase 클라이언트를 불러오는 코드 (import 문 없이 window.supabase 사용)
// 이 파일은 type="module"이 아닌 일반 script로도 동작합니다.

const supabaseUrl = 'https://ukefhgquffdkrfjyepqu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZWZoZ3F1ZmZka3JmanllcHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NTQ2NDQsImV4cCI6MjA4NTQzMDY0NH0.EKOssrWEe-knVH0KeTdfNoOIYPSNorWU6MKvPFSwWV4';
if (window.supabase && window.supabase.createClient) {
	window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
}
