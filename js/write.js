// 필터 매핑: 탭 코드 -> DB required_job 값
const jobMapping = {
    pt: '물리치료사',
    ot: '작업치료사',
    rt: '방사선사',
    mt: '임상병리사',
    dt: '치과기공사',
    dh: '치과위생사'
};

// 권한 체크 유틸리티 (직종별 게시판 상호작용)
async function hasBoardInteractionPermission(boardType) {
    // 자유게시판은 항상 허용
    if (boardType === 'all' || boardType === 'free') return true;

    // 로그인 상태 확인
    if (!isLoggedIn()) return false;

    // 사용자 직종 정보 가져오기 (auth.js 함수 사용)
    const userJob = getUserProfession();
    const isCertified = isProfessionCertified();

    // 인증되지 않은 사용자는 접근 불가
    if (!isCertified || !userJob) {
        return false;
    }

    // 직종별 게시판 권한 매핑
    const boardPermissionMap = {
        'pt': '물리치료사',
        'ot': '작업치료사',
        'rt': '방사선사',
        'mt': '임상병리사',
        'dt': '치과기공사',
        'dh': '치과위생사'
    };

    // 해당 게시판의 요구 직종 확인
    const requiredJob = boardPermissionMap[boardType];

    if (!requiredJob) {
        return false;
    }

    // 사용자의 직종과 게시판 요구 직종 비교
    const hasPermission = userJob === requiredJob;

    return hasPermission;
}

// 권한 안내 모달 제어
function showPermissionModal() {
    const modal = document.getElementById('permissionModal');
    if (modal) modal.style.display = 'flex';
}
function hidePermissionModal() {
    const modal = document.getElementById('permissionModal');
    if (modal) modal.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('closePermissionModal');
    if (closeBtn) closeBtn.onclick = hidePermissionModal;
    const goCertifyBtn = document.getElementById('goCertifyBtn');
    if (goCertifyBtn) goCertifyBtn.onclick = function() {
        hidePermissionModal();
        window.location.href = 'signup.html';
    };
});
// (모의) 로그인 사용자 데이터 - 실제 로그인 연동시 이 부분만 교체
const mockUser = {
    name: '홍길동',
    profession: '의사',
    experience: '5년차',
    location: '서울시'
};

// 내 정보 박스에 사용자 정보 표시
document.addEventListener('DOMContentLoaded', function() {
    const userInfoBox = document.getElementById('userInfoBox');
    if (userInfoBox) {
        userInfoBox.innerHTML = `<i class="fas fa-user-circle"></i> ${mockUser.profession}, ${mockUser.experience}, ${mockUser.location}`;
    }

    // URL 파라미터로 게시판 선택 pre-select
    const urlParams = new URLSearchParams(window.location.search);
    const boardParam = urlParams.get('board');

    // 로그인 상태에 따라 옵션 제한
    waitForAuthLoad().then(() => {
        const boardSelect = document.getElementById('boardSelect');
        if (!isLoggedIn()) {
            // 비로그인 시 자유게시판만
            boardSelect.innerHTML = '<option value="free">자유게시판</option>';
        } else {
            // 로그인 시 모든 옵션
            boardSelect.innerHTML = `
                <option value="free">자유게시판</option>
                <option value="pt">물리치료사 게시판</option>
                <option value="ot">작업치료사 게시판</option>
                <option value="rt">방사선사 게시판</option>
                <option value="mt">임상병리사 게시판</option>
                <option value="dt">치과기공사 게시판</option>
                <option value="dh">치과위생사 게시판</option>
            `;
            // URL 파라미터로 설정된 값 유지
            if (boardParam) {
                boardSelect.value = boardParam;
            }
        }
    });
});
// 로컬 스토리지에서 사용자 작성 게시글 로드
function loadLocalPosts() {
    const localPosts = localStorage.getItem('userPosts');
    return localPosts ? JSON.parse(localPosts) : [];
}

// 로컬 스토리지에 게시글 저장
function saveLocalPost(post) {
    const localPosts = loadLocalPosts();
    localPosts.unshift(post);
    localStorage.setItem('userPosts', JSON.stringify(localPosts));
}

// 게시글 작성
let eventListenerAdded = false; // 이벤트 리스너 중복 등록 방지 플래그

document.addEventListener('DOMContentLoaded', function() {
    if (eventListenerAdded) return; // 이미 추가되었으면 스킵
    eventListenerAdded = true;

    document.getElementById('btnSubmitPost').addEventListener('click', async (event) => {
        event.preventDefault && event.preventDefault();

        const btn = document.getElementById('btnSubmitPost');
        if (btn.disabled) {
            return;
        }
        btn.disabled = true; // 버튼 비활성화

    const board = document.getElementById('boardSelect').value;
    // 권한 체크 (자유게시판은 항상 허용)
    const hasPermission = await hasBoardInteractionPermission(board);
    if (!hasPermission) {
        showPermissionModal();
        return;
    }
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    // const tagsInput = document.getElementById('postTags').value.trim(); // 태그 기능 제거
    if (!title) {
        alert('제목을 입력해주세요.');
        document.getElementById('postTitle').focus();
        return;
    }
    if (!content) {
        alert('내용을 입력해주세요.');
        document.getElementById('postContent').focus();
        return;
    }
    // === 로그인 여부는 이 시점에서만 검사 ===
    if (!window.isLoggedIn || !isLoggedIn()) {
        showLoginRequiredModal();
        return;
    }

    // 태그 기능 제거 - 빈 배열 사용
    const tags = [];

    // Supabase에 저장 (로그인된 경우)
    if (window.supabaseClient && window.getCurrentUser) {
        try {
            const currentUser = window.getCurrentUser();
            if (currentUser && currentUser.id) {
            if (currentUser && currentUser.id) {
                const supabasePost = {
                    user_id: currentUser.id,
                    title: title,
                    content: content,
                    required_job: board === 'free' ? null : (jobMapping[board] || board)
                    // like_count, view_count, comment_count는 DB default 사용 (생략)
                };

                const { data, error } = await window.supabaseClient
                    .from('posts')
                    .insert(supabasePost)
                    .select()
                    .single();

                if (error) {
                    console.error('Supabase 저장 오류:', error);
                    console.error('Error details:', JSON.stringify(error, null, 2));
                    // Supabase 저장 실패시 로컬 저장으로 fallback
                } else {
                    // Supabase 저장 성공시 로컬 저장 생략
                    window.location.href = 'board.html';
                    return;
                }
            }
        } catch (error) {
            console.error('Supabase 저장 중 오류:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            console.error('Error stack:', error.stack);
            // 오류 발생시 로컬 저장으로 fallback
            btn.disabled = false; // 버튼 재활성화
        }
    } else {
        btn.disabled = false; // 버튼 재활성화
    }

    // 로컬 저장 (fallback 또는 기본 동작)
    // const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : []; // 이미 위에서 선언됨
    const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
    const boardPosts = JSON.parse(localStorage.getItem('boardPosts') || '[]');
    const allPosts = [...userPosts, ...boardPosts];
    let maxId = 0;
    allPosts.forEach(post => {
        if (typeof post.id === 'number' && post.id > maxId) maxId = post.id;
    });
    let maxPostNo = 0;
    allPosts.forEach(post => {
        if (typeof post.postNo === 'number' && !isNaN(post.postNo) && post.postNo > maxPostNo) {
            maxPostNo = post.postNo;
        }
    });
    const newPost = {
        id: maxId + 1,
        postNo: maxPostNo + 1, // UI용 번호
        board: board,
        title: title,
        content: content,
        author: {
            profession: mockUser.profession,
            specialty: '',
            location: mockUser.location,
            experience: mockUser.experience
        },
        tags: tags,
        likes: 0,
        comments: 0,
        views: 0,
        createdAt: new Date().toISOString(),
        isLocal: true
    };

    saveLocalPost(newPost);

    // 메인 페이지로 이동
    window.location.href = 'board.html';
    btn.disabled = false; // 버튼 재활성화
});

// 로그인 필요 모달 (board.js와 동일한 스타일)
function showLoginRequiredModal() {
    let modal = document.getElementById('loginRequiredModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'loginRequiredModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-message">로그인 후 글쓰기가 가능합니다.</span>
                <button class="btn-login-modal" id="goLoginBtn">로그인하러 가기</button>
                <button class="btn-close-modal" id="closeLoginModal">취소</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('goLoginBtn').onclick = function() {
            window.location.href = 'login.html?next=' + encodeURIComponent(window.location.pathname);
        };
        document.getElementById('closeLoginModal').onclick = function() {
            modal.style.display = 'none';
        };
    } else {
        modal.style.display = 'flex';
    }
}
});
