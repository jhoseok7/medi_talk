
// CDN 방식 window.supabase 사용
async function testSupabaseConnection() {
  if (!window.supabaseClient) {
    alert('supabase 클라이언트가 로드되지 않았습니다.');
    return;
  }
  const { data, error } = await window.supabaseClient.from('users').select('*');
  if (error) {
    console.error('Supabase 연결 오류:', error.message);
    alert('Supabase 연결 실패: ' + error.message);
  } else {
    console.log('Supabase 연결 성공! 데이터:', data);
    alert('Supabase 연결 성공! 콘솔을 확인하세요.');
  }
}

testSupabaseConnection();
