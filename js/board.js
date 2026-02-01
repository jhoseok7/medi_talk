// 글쓰기 버튼 권한 처리
async function updateWriteButton() {
    const btn = document.getElementById('btnWriteBoard');
    if (!btn) return;
    // 자유게시판만 로그인 여부로 제어
    if (currentTab === 'all') {
        btn.disabled = false;
        btn.onclick = function(e) {
            if (!isLoggedIn()) {
                e.preventDefault();
                showLoginRequiredModal();
                return;
            }
            window.location.href = 'write.html';
        };
    } else {
        btn.disabled = false;
        btn.onclick = async function(e) {
            const hasPermission = await hasBoardInteractionPermission(currentTab);
            if (!hasPermission) {
                e.preventDefault();
                showPermissionModal();
                return;
            }
            window.location.href = 'write.html';
        };
    }
}

// 로그인 필요 모달
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
                <button class="btn-login-modal" id="goLoginBtn">로그인 페이지로 이동</button>
                <button class="btn-close-modal" id="closeLoginModal">닫기</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('goLoginBtn').onclick = function() {
            window.location.href = 'login.html?next=write.html';
        };
        document.getElementById('closeLoginModal').onclick = function() {
            modal.style.display = 'none';
        };
    } else {
        modal.style.display = 'flex';
    }
}
// 권한 체크 유틸리티 (직종별 게시판 상호작용)
async function hasBoardInteractionPermission(boardType) {
    if (boardType === 'all' || boardType === 'free') return true; // 자유게시판은 항상 허용

    if (!window.isLoggedIn || !window.getCurrentUser) return false;
    if (!isLoggedIn()) return false;

    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    try {
        // Supabase에서 해당 사용자의 직종별 인증 상태 확인 (users 테이블 사용)
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
            .from('users')
            .select('job, is_verified')  // job 필드 사용
            .eq('email', currentUser.email)
            .single();

        if (error) {
            console.error('Permission check error:', error);
            return false;
        }

        // 사용자의 job이 해당 게시판의 profession과 일치하고, is_verified가 true인지 확인
        return data && data.job === targetProfession && data.is_verified === true;

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
        // 직종 인증 페이지로 이동 (임시: signup.html)
        window.location.href = 'signup.html';
    };
});
// 날짜 포맷 함수: 오늘이면 hh:mm, 하루 지나면 mm-dd
function formatPostDate(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const isToday = now.getFullYear() === date.getFullYear() &&
        now.getMonth() === date.getMonth() &&
        now.getDate() === date.getDate();
    if (isToday) {
        // hh:mm
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    } else {
        // mm-dd
        const mon = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${mon}-${day}`;
    }
}
// === 인기글 선정 가중치 (MVP용, 추후 조정 가능) ===
const POPULAR_DAYS = 7; // 최근 7일
const POPULAR_COMMENT_WEIGHT = 5;
const POPULAR_COUNT = 3;

// 인기글 선정 함수
function getPopularPosts(posts) {
    const now = new Date();
    // 최근 7일 이내만
    const recentPosts = posts.filter(post => {
        const postDate = new Date(post.createdAt || post.date);
        return (now - postDate) / (1000 * 60 * 60 * 24) <= POPULAR_DAYS;
    });
    // 점수 계산 및 정렬
    return [...recentPosts]
        .sort((a, b) => {
            const scoreA = (a.views || 0) + (a.comments || 0) * POPULAR_COMMENT_WEIGHT;
            const scoreB = (b.views || 0) + (b.comments || 0) * POPULAR_COMMENT_WEIGHT;
            if (scoreB !== scoreA) return scoreB - scoreA;
            // 동점이면 최신글 우선
            const dateA = new Date(a.createdAt || a.date);
            const dateB = new Date(b.createdAt || b.date);
            return dateB - dateA;
        })
        .slice(0, POPULAR_COUNT);
}

// 일반글(인기글 제외) 필터 함수
function getNormalPosts(posts, popularPosts) {
    const popularIds = new Set(popularPosts.map(p => p.id));
    return posts.filter(post => !popularIds.has(post.id));
}

// 일반글 페이징 함수
function getPagedNormalPosts(normalPosts, page, pageSize) {
    const startIdx = (page - 1) * pageSize;
    return normalPosts.slice(startIdx, startIdx + pageSize);
}
// 상태 관리: currentTab, currentPage, postList
let currentTab = 'all';
let currentPage = 1;
const POSTS_PER_PAGE = 25;

// URL에서 page 파라미터 읽기
function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page'));
    return (page && !isNaN(page) && page > 0) ? page : 1;
}

// 페이지네이션 UI 렌더링
function renderPagination(totalPosts) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    if (totalPages === 0) {
        pagination.innerHTML = '';
        return;
    }
    // 페이지 그룹 계산
    const groupSize = 10;
    const currentGroup = Math.floor((currentPage - 1) / groupSize);
    const startPage = currentGroup * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, totalPages);

    let html = '';
    // 맨 앞, 이전 그룹 버튼
    html += `<button class="page-btn nav-btn" data-page="1" ${currentPage === 1 ? 'disabled' : ''} title="맨 앞">«</button>`;
    html += `<button class="page-btn nav-btn" data-page="${startPage - 1}" ${startPage === 1 ? 'disabled' : ''} title="이전">‹</button>`;
    // 페이지 번호 버튼
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }
    // 다음 그룹, 맨 뒤 버튼
    html += `<button class="page-btn nav-btn" data-page="${endPage + 1}" ${endPage === totalPages ? 'disabled' : ''} title="다음">›</button>`;
    html += `<button class="page-btn nav-btn" data-page="${totalPages}" ${currentPage === totalPages ? 'disabled' : ''} title="맨 뒤">»</button>`;

    pagination.innerHTML = html;
    // 페이지 버튼 이벤트
    pagination.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (this.disabled) return;
            const page = parseInt(this.dataset.page);
            if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
                currentPage = page;
                renderAllPosts();
                // 스크롤 게시판 상단으로 이동
                const boardTop = document.querySelector('.board-header') || document.querySelector('.board-list-wrapper');
                if (boardTop) {
                    boardTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });
    });
}
// 게시글 렌더링 함수 (모든 탭 공통)
function renderBoardPosts() {
    const tbody = document.getElementById('postTableBody');
    if (!tbody) return;
    // 탭별 데이터 필터링
    let filteredPosts = [];
    if (currentTab === 'all') {
        filteredPosts = posts;
    } else {
        // 직종별 필터: post.profession 또는 post.author.profession
        const professionMap = {
            pt: '물리치료사',
            ot: '작업치료사',
            rt: '방사선사',
            mt: '임상병리사',
            dt: '치과기공사',
            dh: '치과위생사'
        };
        filteredPosts = posts.filter(post => {
            const prof = post.profession || post.author?.profession || '';
            return prof === professionMap[currentTab];
        });
    }
    if (!filteredPosts || filteredPosts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">게시글이 없습니다.</td></tr>';
        renderPagination(0);
        return;
    }
    // 최신순 정렬
    const sortedPosts = [...filteredPosts].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return dateB - dateA;
    });
    // 인기글 선정 (1페이지만)
    const popularPosts = currentPage === 1 ? getPopularPosts(sortedPosts) : [];
    // 일반글(인기글 제외)
    const normalPosts = getNormalPosts(sortedPosts, popularPosts);
    // 일반글 페이징
    let pageNormalPosts;
    if (currentPage === 1) {
        pageNormalPosts = getPagedNormalPosts(normalPosts, 1, POSTS_PER_PAGE);
    } else {
        pageNormalPosts = getPagedNormalPosts(normalPosts, currentPage, POSTS_PER_PAGE);
    }
    // 렌더링: 1페이지는 인기글 3개 + 일반글, 2페이지~는 일반글만
    let rows = [];
    if (currentPage === 1) {
        for (let i = 0; i < popularPosts.length; i++) {
            rows.push(createPostRow(popularPosts[i], i, null, null, currentPage));
        }
        for (let i = 0; i < pageNormalPosts.length; i++) {
            rows.push(createPostRow(pageNormalPosts[i], popularPosts.length + i, null, i, currentPage));
        }
    } else {
        for (let i = 0; i < pageNormalPosts.length; i++) {
            rows.push(createPostRow(pageNormalPosts[i], i, null, i, currentPage));
        }
    }
    tbody.innerHTML = rows.join('');
    renderPagination(normalPosts.length);
}
// 게시판 탭 전환 (공통 구조, 데이터만 변경)
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tab = this.dataset.tab;
        const isAlreadyActive = this.classList.contains('active');
        if (currentTab === tab && isAlreadyActive) {
            currentPage = 1;
            renderBoardPosts();
            updateWriteButton();
            scrollBoardTop();
            return;
        }
        currentTab = tab;
        currentPage = 1;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderBoardPosts();
        updateWriteButton();
        scrollBoardTop();
    });
});

function scrollBoardTop() {
    const boardTop = document.querySelector('.board-header') || document.querySelector('.board-list-wrapper');
    if (boardTop) {
        boardTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}



// userPosts(로컬 저장)와 boardPosts(로컬 저장) 합쳐서 posts로 사용
// Supabase에서 게시글 로딩
async function loadPostsFromSupabase() {
    try {
        const { data, error } = await window.supabaseClient
            .from('posts')
            .select(`
                *,
                users (
                    profession,
                    specialty,
                    location,
                    experience
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return [];
        }

        // 데이터 구조 변환 (Supabase 형식 -> 기존 코드 형식)
        return data.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            profession: post.users?.profession || '',
            specialty: post.users?.specialty || '',
            location: post.users?.location || '',
            experience: post.users?.experience || '',
            tags: post.tags || [],
            likes: post.likes || 0,
            comments: post.comments || 0, // comments 칼럼 사용
            views: post.views || 0,
            createdAt: post.created_at,
            date: post.created_at, // 호환성 위해
            // 새로 추가된 칼럼들은 post 객체에 자동으로 포함됨
            ...post // 추가된 칼럼들을 모두 포함
        }));
    } catch (error) {
        console.error('Failed to load posts from Supabase:', error);
        return [];
    }
}

// 기존 로컬 저장소 함수들 (fallback용)
function loadUserPosts() {
    const local = localStorage.getItem('userPosts');
    return local ? JSON.parse(local) : [];
}

function loadBoardPosts() {
    const local = localStorage.getItem('boardPosts');
    return local ? JSON.parse(local) : [];
}

let posts = [];

// 리스트형 게시판 row 생성
function createPostRow(post, idx, totalCount) {
    // ...번호 및 인기글 관련 코드 제거...
    const dateVal = post.date || (post.createdAt ? post.createdAt : '');
    // 인기글 여부: 1페이지 상단 3개만
    const isPopular = currentPage === 1 && idx < 3;
    return `
        <tr class="board-row" onclick="location.href='post-detail.html?id=${post.id}'">
            <td class="board-title-cell">
                <a href="post-detail.html?id=${post.id}" class="board-title-link">
                    ${post.title}
                    <span class="comment-count">
                        ${post.comments && post.comments > 0 ? ` (${post.comments})` : ''}
                        ${isPopular ? '<span class="fire-icon" style="color:#ff9800;margin-left:4px;">🔥</span>' : ''}
                    </span>
                </a>
            </td>
            <td>${post.profession ? post.profession : (post.author?.profession || '')} · ${post.experience ? post.experience : (post.author?.experience || '')} · ${post.location ? post.location : (post.author?.location || '')}</td>
            <td>${formatPostDate(dateVal)}</td>
            <td>${post.views || 0}</td>
        </tr>
    `;
}

// 실시간 키워드 렌더링
function renderTrendingKeywords() {
    const keywords = ['야간근무', '연봉협상', '이직', '국시준비', '환자응대', '개원', '체력관리', '스트레스'];
    const container = document.getElementById('trendingKeywords');
    
    container.innerHTML = keywords.map((keyword, index) => `
        <div class="keyword-item">
            <span class="keyword-rank">${index + 1}</span>
            <span class="keyword-text">${keyword}</span>
        </div>
    `).join('');
}

// 초기화

document.addEventListener('DOMContentLoaded', async function() {
    // Supabase에서 게시글 로딩
    posts = await loadPostsFromSupabase();

    // Supabase 로딩 실패시 로컬 데이터 fallback
    if (posts.length === 0) {
        let userPosts = loadUserPosts();
        let boardPosts = loadBoardPosts();
        posts = [...userPosts, ...boardPosts];
        console.log('Using local data as fallback');
    }

    // postNo 마이그레이션: postNo 없는 게시글에만 생성순으로 부여(최초 1회)
    let nextNo = 1;
    posts.forEach(post => {
        if (typeof post.postNo !== 'number' || isNaN(post.postNo)) {
            post.postNo = nextNo++;
        } else {
            if (post.postNo >= nextNo) nextNo = post.postNo + 1;
        }
    });

    currentTab = 'all';
    currentPage = 1;
    renderBoardPosts();
    updateWriteButton();
    renderTrendingKeywords();

    // robust 이벤트 위임
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-write');
        if (btn) {
            if (btn.closest('form')) e.preventDefault();
            window.location.href = 'write.html';
        }
    });

    window.addEventListener('error', function(event) {
        console.error('JS Error:', event.message, event.filename, event.lineno);
    });
});

// 게시판 접근 권한 체크 함수
async function hasBoardInteractionPermission(boardType) {
    // 로그인 상태 확인
    if (!isLoggedIn()) {
        return false;
    }

    // 자유게시판은 모든 로그인 사용자 접근 가능
    if (boardType === 'all') {
        return true;
    }

    // 사용자 직종 정보 가져오기
    const userJob = getUserProfession();
    const isCertified = isProfessionCertified();

    console.log('권한 체크:', { boardType, userJob, isCertified });

    // 인증되지 않은 사용자는 접근 불가
    if (!isCertified || !userJob) {
        console.log('인증되지 않은 사용자');
        return false;
    }

    // 직종별 게시판 권한 매핑
    const boardPermissionMap = {
        'pt': '물리치료사',
        'ot': '작업치료사',
        'rt': '방사선사',
        'mt': '임상병리사'
    };

    // 해당 게시판의 요구 직종 확인
    const requiredJob = boardPermissionMap[boardType];

    if (!requiredJob) {
        console.log('알 수 없는 게시판 타입:', boardType);
        return false;
    }

    // 사용자의 직종과 게시판 요구 직종 비교
    const hasPermission = userJob === requiredJob;

    console.log('권한 결과:', {
        userJob,
        requiredJob,
        hasPermission
    });

    return hasPermission;
}

// 불필요한 함수 제거 (공통 구조로 통합)

