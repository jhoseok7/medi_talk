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
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        alert('데이터를 불러오는데 실패했습니다.');
    }
}

// 카테고리 라벨 생성 함수
function getCategoryLabel(boardType) {
    if (!boardType || boardType === 'all') {
        return '자유게시판';
    }
    
    // boardType이 이미 직종 이름 ('물리치료사' 등)이므로 그대로 반환
    return boardType;
}

// 게시글 렌더링
async function renderPost() {
    // 게시판 타입 판별 (자유게시판/직종별)
    let boardType = 'all';
    if (currentPost) {
        // required_job 필드 사용 (저장 시 required_job에 직종 이름 저장됨)
        if (currentPost.required_job) {
            boardType = currentPost.required_job; // '물리치료사' 등
        }
    }
    const categoryLabel = getCategoryLabel(boardType);
    const postDetail = document.getElementById('postDetail');
    
    postDetail.innerHTML = `
        <div class="post-detail-header">
            <div class="post-category">${categoryLabel}</div>
            <h1 class="post-detail-title">${currentPost.title}</h1>
            <div class="post-detail-meta" style="display: flex; align-items: center; gap: 16px; justify-content: space-between;">
                <div>
                    <span class="author-badge">
                        ${currentPost.profession || currentPost.author?.profession || '의료인'} · ${currentPost.experience || currentPost.author?.experience || '-'} · ${currentPost.location || currentPost.author?.location || '-'}
                    </span>
                    <span class="post-detail-time" style="margin-left: 4px; color: #64748b; font-size: 14px;">
                        ${getTimeAgo(currentPost.createdAt)}
                    </span>
                    <span class="post-detail-likes" style="margin-left: 4px; color: #9ca3af; font-size: 13px;">
                        ♡ ${currentPost.likes || 0}
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
                <span>${currentPost.likes || 0}</span>
            </button>
        </div>
        <div style="margin-top: 28px;">
            <div class="comment-title">
                댓글 <span class="comment-count">${comments.length}</span>
            </div>
            <div class="comment-list" id="commentList">
                ${comments.map(comment => `
                    <div class="comment-item" data-comment-id="${comment.id}">
                        <div class="comment-header">
                            <div>
                                <span class="comment-author">
                                    ${comment.author?.profession || '의료인'} · ${comment.author?.experience || '-'} · ${comment.author?.location || '-'}
                                </span>
                                <span class="comment-time">${getTimeAgo(comment.createdAt)}</span>
                            </div>
                            <div class="comment-actions">
                                ${comment.isMine ? (editingCommentId === comment.id ? `
                                    <button class="btn-comment-action" onclick="cancelEdit(${comment.id})">취소</button>
                                    <button class="btn-comment-action save" onclick="saveEdit(${comment.id})">저장</button>
                                ` : `
                                    <button class="btn-comment-action edit" onclick="editComment(${comment.id})">수정</button>
                                    <button class="btn-comment-action delete" onclick="deleteComment(${comment.id})">삭제</button>
                                `) : ''}
                            </div>
                        </div>
                        <div class="comment-content${editingCommentId === comment.id ? ' editing' : ''}"${editingCommentId === comment.id ? ' contenteditable="true"' : ''}>${comment.content}</div>
                    </div>
                `).join('')}
            </div>
            <div class="comment-write">
                <textarea class="comment-input" id="commentInput" placeholder="댓글을 작성하세요..." maxlength="500"></textarea>
                <button class="btn-comment-submit" id="btnCommentSubmit">댓글 달기</button>
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
    

    
    // 댓글 통계 클릭 시 댓글 섹션으로 스크롤 - 통합되어 제거
    // document.getElementById('commentStat').addEventListener('click', () => {
    //     document.querySelector('.comment-section').scrollIntoView({ 
    //         behavior: 'smooth',
    //         block: 'start'
    //     });
    // });
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

        // 댓글 입력창 이벤트 바인딩
        commentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCommentSubmit();
            }
        });
    }
}

// 토스트 메시지 표시 함수
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 게시글 좋아요 처리
function handleLike() {
    // 비로그인 체크
    if (!isLoggedIn()) {
        showToast('로그인 후 공감할 수 있어요');
        return;
    }

    const btnLike = document.getElementById('btnLike');
    if (btnLike.disabled) return; // 연타 방지

    btnLike.disabled = true; // 연타 방지

    const icon = btnLike.querySelector('i');
    const span = btnLike.querySelector('span');
    const isLiked = btnLike.classList.contains('liked');

    // 애니메이션
    btnLike.style.transform = 'scale(1.08)';
    setTimeout(() => {
        btnLike.style.transform = 'scale(1.0)';
    }, 150);

    if (isLiked) {
        currentPost.likes = Math.max(0, (currentPost.likes || 0) - 1);
        btnLike.classList.remove('liked');
        icon.classList.remove('fas');
        icon.classList.add('far');
    } else {
        currentPost.likes = (currentPost.likes || 0) + 1;
        btnLike.classList.add('liked');
        icon.classList.remove('far');
        icon.classList.add('fas');
    }

    span.textContent = currentPost.likes;

    // 메타 하트 업데이트
    const metaLikes = document.querySelector('.post-detail-likes');
    if (metaLikes) {
        metaLikes.textContent = `♡ ${currentPost.likes}`;
    }

    // TODO: 실제 DB 업데이트 (post_likes 테이블 등)
    // 현재는 프론트에서만 처리

    setTimeout(() => {
        btnLike.disabled = false; // 연타 방지 해제
    }, 300);
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
    renderPost();
}

// 댓글 작성 (Supabase 연동)
async function handleCommentSubmit() {
    if (!window.getCurrentUser()) {
        showToast('댓글을 작성하려면 로그인이 필요합니다.');
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

        comments.push(newComment);
        currentPost.comments = (currentPost.comments || 0) + 1;

        // UI 업데이트
        renderPost();

        // 입력창 초기화
        commentInput.value = '';

    } catch (error) {
        console.error('댓글 작성 실패:', error);
        alert('댓글 작성에 실패했습니다: ' + error.message);
    }
}

// 시간 표시 함수 (YY.MM.DD HH:MM 형식)
function getTimeAgo(dateString) {
    const past = new Date(dateString);
    
    // YY.MM.DD 형식
    const year = past.getFullYear().toString().slice(-2); // 마지막 2자리
    const month = (past.getMonth() + 1).toString().padStart(2, '0');
    const day = past.getDate().toString().padStart(2, '0');
    
    // HH:MM 형식
    const hours = past.getHours().toString().padStart(2, '0');
    const minutes = past.getMinutes().toString().padStart(2, '0');
    
    return `${year}.${month}.${day} ${hours}:${minutes}`;
}

// 댓글 수정
function editComment(commentId) {
    editingCommentId = commentId;
    renderPost();
}

// 수정 취소
function cancelEdit(commentId) {
    editingCommentId = null;
    renderPost();
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
            renderPost();
        });
}

// 댓글 삭제 (Supabase 연동)
function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) {
        return;
    }

    const currentUser = window.getCurrentUser();
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }

    // Supabase 삭제
    window.supabaseClient
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUser.id)
        .then(({ error }) => {
            if (error) {
                console.error('댓글 삭제 실패:', error);
                alert('댓글 삭제에 실패했습니다: ' + error.message);
                return;
            }

            // 로컬 상태 업데이트
            comments = comments.filter(c => c.id !== commentId);
            currentPost.comments = Math.max(0, (currentPost.comments || 0) - 1);

            renderPost();
        });
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    loadPostData();
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
