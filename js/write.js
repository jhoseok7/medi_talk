// 권한 체크 유틸리티 (직종별 게시판 상호작용)
async function hasBoardInteractionPermission(boardType) {
    if (boardType === 'all' || boardType === 'free') return true; // 자유게시판은 항상 허용

    if (!window.isLoggedIn || !window.getCurrentUser) return false;
    if (!isLoggedIn()) return false;

    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    try {
        // Supabase에서 해당 사용자의 직종별 인증 상태 확인
        const professionMap = {
            pt: '물리치료사',
            ot: '작업치료사',
            rt: '방사선사',
            mt: '임상병리사',
            dt: '치과기공사',
            dh: '치과위생사'
        };

        const targetProfession = professionMap[boardType];
        if (!targetProfession) return false;

        const { data, error } = await window.supabaseClient
            .from('job')
            .select('is_verified')
            .eq('email', currentUser.email)
            .eq('profession', targetProfession)
            .single();

        if (error) {
            console.error('Permission check error:', error);
            return false;
        }

        return data && data.is_verified === true;

    } catch (error) {
        console.error('Permission check failed:', error);
        return false;
    }
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

document.getElementById('btnSubmitPost').addEventListener('click', async (event) => {
    event.preventDefault && event.preventDefault();
    const board = document.getElementById('boardSelect').value;
    // 권한 체크 (자유게시판은 항상 허용)
    const hasPermission = await hasBoardInteractionPermission(board);
    if (!hasPermission) {
        showPermissionModal();
        return;
    }
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const tagsInput = document.getElementById('postTags').value.trim();
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
    // 실제 등록 로직(로컬)
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
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
    alert('게시글이 작성되었습니다!');
    window.location.href = '/board.html';
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

// ...existing code...

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

    // 로컬 스토리지에 저장
    saveLocalPost(newPost);

    // 메인 페이지로 이동
    alert('게시글이 작성되었습니다!');
    window.location.href = 'board.html';
