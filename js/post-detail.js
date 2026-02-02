// 권한 체크 유틸리티 (직종별 게시판 상호작용)
async function hasBoardInteractionPermission(boardType) {
    // 자유게시판은 항상 허용
    if (boardType === 'all' || boardType === 'free') return true;

    // 로그인 상태 확인
    if (!isLoggedIn()) return false;

    // 사용자 직종 정보 가져오기 (auth.js 함수 사용)
    const userJob = getUserProfession();
    const isCertified = isProfessionCertified();

    console.log('댓글 권한 체크:', { boardType, userJob, isCertified });

    // 인증되지 않은 사용자는 접근 불가
    if (!isCertified || !userJob) {
        console.log('댓글: 인증되지 않은 사용자');
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
        console.log('댓글: 알 수 없는 게시판 타입:', boardType);
        return false;
    }

    // 사용자의 직종과 게시판 요구 직종 비교
    const hasPermission = userJob === requiredJob;

    console.log('댓글 권한 결과:', {
        userJob,
        requiredJob,
        hasPermission
    });

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
// 전역 변수
let currentPost = null;
let comments = [];
let editingCommentId = null;

// URL에서 게시글 ID 가져오기
function getPostIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
}

// Supabase에서 게시글과 댓글 데이터 로드
async function loadPostData() {
    try {
        const postId = getPostIdFromURL();

        // Supabase에서 게시글과 작성자 정보 가져오기
        const { data: postData, error: postError } = await window.supabaseClient
            .from('posts')
            .select(`
                *,
                users (
                    job,
                    region,
                    license_date,
                    is_verified
                )
            `)
            .eq('id', postId)
            .single();

        if (postError || !postData) {
            console.error('Post not found:', postError);
            alert('게시글을 찾을 수 없습니다.');
            window.location.href = 'board.html';
            return;
        }

        // 데이터 구조 변환
        // 연차 계산 (라이센스 취득 연도 기준)
        let experience = '';
        if (postData.users?.license_date) {
            const licenseDate = new Date(postData.users.license_date);
            const now = new Date();
            const licenseYear = licenseDate.getFullYear();
            const currentYear = now.getFullYear();
            const yearsOfExperience = currentYear - licenseYear + 1;
            experience = `${yearsOfExperience}년차`;
        }

        currentPost = {
            id: postData.id,
            title: postData.title,
            content: postData.content,
            profession: postData.users?.job || '', // job 필드에서 profession으로 매핑
            specialty: postData.users?.specialty || '',
            location: postData.users?.region || '', // region 필드
            experience: experience, // 계산된 연차
            tags: postData.tags || [],
            likes: postData.likes || 0,
            views: postData.views || 0,
            createdAt: postData.created_at,
            date: postData.created_at,
            // 새로 추가된 칼럼들은 자동으로 포함
            ...postData
        };

        // Supabase에서 댓글 가져오기
        const { data: commentsData, error: commentsError } = await window.supabaseClient
            .from('comments')
            .select(`
                *,
                users (
                    job,
                    region,
                    license_date,
                    is_verified
                )
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (commentsError) {
            console.error('Comments error:', commentsError);
            comments = [];
        } else {
            // 댓글 데이터 구조 변환
            comments = commentsData.map(comment => {
                // 연차 계산 (라이센스 취득 연도 기준)
                let experience = '';
                if (comment.users?.license_date) {
                    const licenseDate = new Date(comment.users.license_date);
                    const now = new Date();
                    const licenseYear = licenseDate.getFullYear();
                    const currentYear = now.getFullYear();
                    const yearsOfExperience = currentYear - licenseYear + 1;
                    experience = `${yearsOfExperience}년차`;
                }

                return {
                    id: comment.id,
                    content: comment.content,
                    createdAt: comment.created_at,
                    author: {
                        profession: comment.users?.job || '', // job 필드에서 profession으로 매핑
                        specialty: '', // specialty 필드 없음
                        location: comment.users?.region || '', // region 필드에서 location으로 매핑
                        experience: experience // 계산된 연차
                    },
                    isMine: window.getCurrentUser() && comment.user_id === window.getCurrentUser().id
                };
            });
        }

        await renderPost();
        renderComments();
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        alert('데이터를 불러오는데 실패했습니다.');
    }
}

// 게시글 렌더링
async function renderPost() {
    // 게시판 타입 판별 (자유게시판/직종별)
    let boardType = 'all';
    if (currentPost) {
        // 자유게시판: board/free, 그 외: 직종별
        if (currentPost.board && currentPost.board !== 'free' && currentPost.board !== 'all') {
            // board 값이 pt/ot/rt/mt/dt/dh 등
            boardType = currentPost.board;
        } else if (currentPost.profession) {
            // mock 데이터 등에서 profession 값으로 추정
            const profMap = {
                '물리치료사': 'pt', '작업치료사': 'ot', '방사선사': 'rt', '임상병리사': 'mt', '치과기공사': 'dt', '치과위생사': 'dh'
            };
            boardType = profMap[currentPost.profession] || 'all';
        }
    }
    const postDetail = document.getElementById('postDetail');
    
    postDetail.innerHTML = `
        <div class="post-detail-header">
            <h1 class="post-detail-title">${currentPost.title}</h1>
            <div class="post-detail-meta" style="display: flex; align-items: center; gap: 16px; justify-content: space-between;">
                <div>
                    <span class="author-badge">
                        ${currentPost.profession || currentPost.author?.profession || '의료인'} · ${currentPost.experience || currentPost.author?.experience || '-'} · ${currentPost.location || currentPost.author?.location || '-'}
                    </span>
                    <span class="post-detail-time" style="margin-left: 12px; color: #64748b; font-size: 14px;">
                        ${currentPost.date || getTimeAgo(currentPost.createdAt)}
                    </span>
                </div>
                <div class="post-detail-views" style="color: #64748b; font-size: 14px;">
                    <span>${currentPost.views}</span>
                </div>
            </div>
        </div>
        <div class="post-detail-content">
            ${currentPost.content}
        </div>
        <div class="post-detail-footer">
            <button class="post-action-btn" id="btnLike"> 
                <i class="far fa-heart"></i>
                <span>${currentPost.likes}</span>
            </button>
            <div class="post-stat clickable" id="commentStat">
                <i class="far fa-comment"></i>
                <span>${currentPost.comments}</span>
            </div>
        </div>
    `;
    // 좋아요 버튼 권한 처리
    const btnLike = document.getElementById('btnLike');
    if (btnLike) {
        const hasPermission = await hasBoardInteractionPermission(boardType);
        if (hasPermission) {
            btnLike.disabled = false;
            btnLike.onclick = handleLike;
        } else {
            btnLike.disabled = true;
            btnLike.onclick = function(e) { e.preventDefault(); showPermissionModal(); };
        }
    }
    

    
    // 댓글 통계 클릭 시 댓글 섹션으로 스크롤
    document.getElementById('commentStat').addEventListener('click', () => {
        document.querySelector('.comment-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    });
    // 댓글 입력/작성 권한 처리
    const commentInput = document.getElementById('commentInput');
    const btnCommentSubmit = document.getElementById('btnCommentSubmit');
    if (commentInput && btnCommentSubmit) {
        const hasPermission = await hasBoardInteractionPermission(boardType);
        if (hasPermission) {
            commentInput.disabled = false;
            btnCommentSubmit.disabled = false;
            btnCommentSubmit.onclick = handleCommentSubmit;
        } else {
            commentInput.disabled = true;
            btnCommentSubmit.disabled = true;
            btnCommentSubmit.onclick = function(e) { e.preventDefault(); showPermissionModal(); };
        }
    }
}

// 댓글 렌더링
function renderComments() {
    const commentList = document.getElementById('commentList');
    const commentCount = document.getElementById('commentCount');
    
    commentCount.textContent = comments.length;
    
    if (comments.length === 0) {
        commentList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">첫 댓글을 작성해보세요!</p>';
        return;
    }
    
    commentList.innerHTML = comments.map(comment => `
        <div class="comment-item" data-comment-id="${comment.id}">
            <div class="comment-header">
                <div>
                    <span class="comment-author">
                        ${comment.author.profession} · ${comment.author.experience} · ${comment.author.location}
                    </span>
                    <span class="comment-time">${getTimeAgo(comment.createdAt)}</span>
                </div>
                <div class="comment-actions">
                    <button class="btn-comment-like${comment.liked ? ' liked' : ''}" onclick="toggleCommentLike(${comment.id})">
                        <i class="fa${comment.liked ? 's' : 'r'} fa-heart"></i>
                        <span>${comment.likes || 0}</span>
                    </button>
                    ${comment.isMine ? `
                        <button class="btn-comment-action edit" onclick="editComment(${comment.id})">수정</button>
                        <button class="btn-comment-action delete" onclick="deleteComment(${comment.id})">삭제</button>
                    ` : ''}
                </div>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
    
    // 편집 중인 댓글이 있으면 복원
    if (editingCommentId) {
        showEditForm(editingCommentId);
    }
}

// 게시글 좋아요 처리
function handleLike() {
    const btnLike = document.getElementById('btnLike');
    const icon = btnLike.querySelector('i');
    const isLiked = btnLike.classList.contains('liked');
    if (isLiked) {
        currentPost.likes--;
        btnLike.classList.remove('liked');
        icon.classList.remove('fas');
        icon.classList.add('far');
    } else {
        currentPost.likes++;
        btnLike.classList.add('liked');
        icon.classList.remove('far');
        icon.classList.add('fas');
    }
    btnLike.querySelector('span').textContent = currentPost.likes;
}

// 댓글 좋아요 토글
function toggleCommentLike(commentId) {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    if (!comment.likes) comment.likes = 0;
    comment.liked = !comment.liked;
    if (comment.liked) {
        comment.likes++;
    } else {
        comment.likes--;
    }
    renderComments();
}

// 댓글 작성 (Supabase 연동)
async function handleCommentSubmit() {
    if (!window.getCurrentUser()) {
        alert('댓글을 작성하려면 로그인이 필요합니다.');
        window.location.href = 'login.html?next=' + encodeURIComponent(window.location.pathname + window.location.search);
        return;
    }

    const commentInput = document.getElementById('commentInput');
    const content = commentInput.value.trim();

    if (!content) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('comments')
            .insert([{
                post_id: getPostIdFromURL(),
                user_id: window.getCurrentUser().id,
                content: content
            }])
            .select(`
                *,
                users (
                    job,
                    region,
                    license_date,
                    is_verified
                )
            `)
            .single();

        if (error) {
            throw error;
        }

        // 새 댓글을 comments 배열에 추가
        // 연차 계산 (라이센스 취득 연도 기준)
        let experience = '';
        if (data.users?.license_date) {
            const licenseDate = new Date(data.users.license_date);
            const now = new Date();
            const licenseYear = licenseDate.getFullYear();
            const currentYear = now.getFullYear();
            const yearsOfExperience = currentYear - licenseYear + 1;
            experience = `${yearsOfExperience}년차`;
        }

        const newComment = {
            id: data.id,
            content: data.content,
            createdAt: data.created_at,
            author: {
                profession: data.users?.job || '',
                specialty: '',
                location: data.users?.region || '',
                experience: experience
            },
            isMine: true
        };

        comments.unshift(newComment);
        currentPost.comments = (currentPost.comments || 0) + 1;

        // UI 업데이트
        renderComments();
        updateCommentStats();

        // 입력창 초기화
        commentInput.value = '';

    } catch (error) {
        console.error('댓글 작성 실패:', error);
        alert('댓글 작성에 실패했습니다: ' + error.message);
    }
}

// 시간 표시 함수
function getTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    
    return past.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// 댓글 수정
function editComment(commentId) {
    editingCommentId = commentId;
    showEditForm(commentId);
}

// 수정 폼 표시
function showEditForm(commentId) {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    const contentDiv = commentItem.querySelector('.comment-content');
    const actionsDiv = commentItem.querySelector('.comment-actions');
    
    // contenteditable로 변경
    contentDiv.contentEditable = true;
    contentDiv.focus();
    contentDiv.classList.add('editing');
    
    // 수정/삭제 버튼을 저장/취소로 변경
    actionsDiv.innerHTML = `
        <button class="btn-comment-action" onclick="cancelEdit(${commentId})">취소</button>
        <button class="btn-comment-action save" onclick="saveEdit(${commentId})">저장</button>
    `;
}

// 수정 취소
function cancelEdit(commentId) {
    editingCommentId = null;
    renderComments();
}

// 수정 저장
// 댓글 수정 저장 (Supabase 연동)
function saveEdit(commentId) {
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    const contentDiv = commentItem.querySelector('.comment-content');
    const newContent = contentDiv.innerText.trim();

    if (!newContent) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    // Supabase 업데이트
    window.supabaseClient
        .from('comments')
        .update({ content: newContent })
        .eq('id', commentId)
        .eq('user_id', window.getCurrentUser().id)
        .then(({ error }) => {
            if (error) {
                console.error('댓글 수정 실패:', error);
                alert('댓글 수정에 실패했습니다: ' + error.message);
                return;
            }

            // 로컬 상태 업데이트
            const comment = comments.find(c => c.id === commentId);
            if (comment) {
                comment.content = newContent;
            }

            editingCommentId = null;
            renderComments();
        });
}

// 댓글 삭제 (Supabase 연동)
function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) {
        return;
    }

    // Supabase 삭제
    window.supabaseClient
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', window.getCurrentUser().id)
        .then(({ error }) => {
            if (error) {
                console.error('댓글 삭제 실패:', error);
                alert('댓글 삭제에 실패했습니다: ' + error.message);
                return;
            }

            // 로컬 상태 업데이트
            comments = comments.filter(c => c.id !== commentId);
            currentPost.comments = Math.max(0, (currentPost.comments || 0) - 1);

            renderComments();
            updateCommentStats();
        });
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    loadPostData();

    // 댓글 작성 버튼
    document.getElementById('btnCommentSubmit').addEventListener('click', handleCommentSubmit);

    // Enter 키로 댓글 작성 (Shift+Enter는 줄바꿈)
    document.getElementById('commentInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCommentSubmit();
        }
    });
});

// 댓글 수 통계 업데이트
function updateCommentStats() {
    const commentCount = document.getElementById('commentCount');
    if (commentCount) {
        commentCount.textContent = comments.length;
    }

    // 게시글의 댓글 수도 업데이트 (필요시)
    if (currentPost) {
        currentPost.comments = comments.length;
    }
}
