// 글쓰기 버튼 권한 처리
async function updateWriteButton() {
    console.log('updateWriteButton 호출됨');
    const btn = document.getElementById('btnWriteBoard');
    if (!btn) {
        console.log('btnWriteBoard 버튼을 찾을 수 없음');
        return;
    }

    // auth.js 함수들이 로드되었는지 확인
    if (typeof isLoggedIn !== 'function') {
        console.log('auth.js not loaded yet, skipping button update');
        return;
    }

    console.log('글쓰기 버튼 업데이트:', { currentTab, isLoggedIn: isLoggedIn() });

    // Reset button state
    btn.classList.remove('disabled');
    btn.style.opacity = '1';
    btn.disabled = false;
    btn.onclick = null; // 기존 onclick 제거

    // 자유게시판: 로그인만 하면 누구나 글쓰기 가능
    if (currentTab === 'all') {
        if (isLoggedIn()) {
            btn.onclick = function(e) {
                e.preventDefault();
                console.log('로그인 상태: 글쓰기 페이지로 이동');
                window.location.href = 'write.html?board=free';
            };
            console.log('자유게시판: 글쓰기 버튼 활성화');
        } else {
            btn.style.opacity = '0.7';
            btn.onclick = function(e) {
                e.preventDefault();
                console.log('비로그인 상태: 로그인 모달 표시');
                showLoginRequiredModal();
            };
            console.log('자유게시판: 로그인 필요, onclick 설정됨');
        }
    } else {
        // 직종별 게시판: 로그인하지 않은 경우 로그인 유도, 로그인한 경우 권한 체크
        if (!isLoggedIn()) {
            btn.style.opacity = '0.7';
            btn.onclick = function(e) {
                e.preventDefault();
                console.log('비로그인 상태: 로그인 모달 표시');
                showLoginRequiredModal();
            };
            console.log('직종별 게시판: 로그인 필요, onclick 설정됨');
        } else {
            const hasPermission = await hasBoardInteractionPermission(currentTab);
            console.log('직종별 게시판 권한 체크 결과:', hasPermission);

            if (hasPermission) {
                btn.onclick = function(e) {
                    e.preventDefault();
                    console.log('권한 있음: 글쓰기 페이지로 이동');
                    window.location.href = 'write.html?board=' + currentTab;
                };
                console.log('직종별 게시판: 글쓰기 버튼 활성화');
            } else {
                btn.style.opacity = '0.7';
                btn.onclick = function(e) {
                    e.preventDefault();
                    console.log('권한 없음: 권한 모달 표시');
                    showPermissionModal();
                };
                console.log('직종별 게시판: 권한 없음');
            }
        }
    }
}

// 로그인 필요 모달
function showLoginRequiredModal() {
    console.log('showLoginRequiredModal 호출됨');
    alert('로그인을 하세요.');
    // 로그인 페이지로 이동하지 않음
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

        console.log('Permission check data:', {
            boardType,
            targetProfession,
            userEmail: currentUser.email,
            data
        });

        // 사용자의 job이 해당 게시판의 profession과 일치하고, is_verified가 true인지 확인
        return data && data.job === targetProfession && data.is_verified === true;

    } catch (error) {
        console.error('Permission check failed:', error);
        return false;
    }
}

// 권한 안내 모달 제어
function showPermissionModal() {
    alert('해당 직종 인증이 필요합니다.');
    // 이동하지 않음 - 사용자가 이미 로그인한 상태
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
// === 게시글 상수 ===
// 상태 관리: currentTab, currentPage, postList
let currentTab = 'all';
let currentPage = 1;
const POSTS_PER_PAGE = 25;

// 초기화 플래그
let boardInitialized = false;
let currentRequestId = 0;
let inFlight = false;

// 필터 매핑: 탭 코드 -> DB required_job 값
const jobMapping = {
    pt: '물리치료사',
    ot: '작업치료사',
    rt: '방사선사',
    mt: '임상병리사',
    dt: '치과기공사',
    dh: '치과위생사'
};

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
    // 게시글이 없어도 최소 1페이지 표시
    const displayPages = Math.max(totalPages, 1);
    // 페이지 그룹 계산
    const groupSize = 10;
    const currentGroup = Math.floor((currentPage - 1) / groupSize);
    const startPage = currentGroup * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, displayPages);

    let html = '';
    // 맨 앞, 이전 그룹 버튼
    html += `<button class="page-btn nav-btn" data-page="1" ${currentPage === 1 ? 'disabled' : ''} title="맨 앞">«</button>`;
    html += `<button class="page-btn nav-btn" data-page="${startPage - 1}" ${startPage === 1 ? 'disabled' : ''} title="이전">‹</button>`;
    // 페이지 번호 버튼
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }
    // 다음 그룹, 맨 뒤 버튼
    html += `<button class="page-btn nav-btn" data-page="${endPage + 1}" ${endPage === displayPages ? 'disabled' : ''} title="다음">›</button>`;
    html += `<button class="page-btn nav-btn" data-page="${displayPages}" ${currentPage === displayPages ? 'disabled' : ''} title="맨 뒤">»</button>`;

    pagination.innerHTML = html;
    // 페이지 버튼 이벤트
    pagination.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (this.disabled) return;
            const page = parseInt(this.dataset.page);
            if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
                currentPage = page;
                renderBoardPosts();
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

    // 탭별 데이터 필터링 (Supabase 데이터 사용, 로컬 필터링 제거)
    let filteredPosts = posts;

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

    // 페이징 (25개씩)
    const startIdx = (currentPage - 1) * POSTS_PER_PAGE;
    const endIdx = startIdx + POSTS_PER_PAGE;
    const pagePosts = sortedPosts.slice(startIdx, endIdx);

    // 렌더링
    let rows = [];
    for (let i = 0; i < pagePosts.length; i++) {
        rows.push(createPostRow(pagePosts[i], startIdx + i, sortedPosts.length));
    }

    tbody.innerHTML = rows.join('');
    renderPagination(sortedPosts.length);
}
// 게시판 탭 전환 핸들러 (named handler로 분리)
function handleTabClick(event) {
    const tab = this.dataset.tab;
    if (currentTab === tab) {
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
    loadPostsFromSupabase().then((loadedPosts) => {
        posts = loadedPosts; // posts 업데이트
        renderBoardPosts();
        updateWriteButton();
        scrollBoardTop();
    });
}

// 게시판 초기화 (이벤트 리스너 바인딩, 중복 방지)
function initBoard() {
    if (boardInitialized) {
        console.log('Board already initialized, skipping...');
        return;
    }
    boardInitialized = true;

    // 탭 클릭 이벤트 바인딩
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleTabClick);
    });

    // 기타 이벤트 바인딩 (필요시 추가)
    console.log('Board initialized');
}

function scrollBoardTop() {
    const boardTop = document.querySelector('.board-header') || document.querySelector('.board-list-wrapper');
    if (boardTop) {
        boardTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}



// Supabase에서 게시글 로딩 (재시도 로직 포함, requestId로 마지막 요청만 반영)
async function loadPostsFromSupabase(retryCount = 0) {
    const requestId = ++currentRequestId;
    if (inFlight) {
        console.log('Previous request in flight, skipping...');
        return;
    }
    inFlight = true;

    try {
        console.log('Loading posts from Supabase...');
        let query = window.supabaseClient
            .from('posts')
            .select(`
                id, title, content, created_at, user_id, required_job
            `)
            .order('created_at', { ascending: false });

        // currentTab에 따라 필터 적용
        if (currentTab === 'all') {
            // 자유게시판: required_job이 null이거나 'free'인 글만
            query = query.or('required_job.is.null,required_job.eq.free');
        } else {
            // 직종별 필터: jobMapping 사용
            const requiredJob = jobMapping[currentTab];
            if (requiredJob) {
                query = query.eq('required_job', requiredJob);
            } else {
                console.log('Unknown tab:', currentTab);
                return [];
            }
        }

        const { data, error } = await query;

        // 요청 ID 체크: 마지막 요청만 반영
        if (requestId !== currentRequestId) {
            console.log('Stale request, ignoring...');
            return;
        }

        console.log('Supabase query result:', { data, error });

        if (error) {
            // AbortError 시 재시도 (최대 3회)
            if (error.name === 'AbortError' && retryCount < 3) {
                console.log(`Query AbortError, retrying in ${500 * (retryCount + 1)}ms... (attempt ${retryCount + 1}/3)`);
                await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
                return loadPostsFromSupabase(retryCount + 1);
            }
            console.error('Supabase error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return [];
        }

        if (!data || data.length === 0) {
            console.log('No posts data from Supabase');
            return [];
        }

        console.log(`Loaded ${data.length} posts from Supabase`);

        // user_id 목록 추출 및 users 데이터 로드
        const userIds = [...new Set(data.map(post => post.user_id).filter(id => id))];
        console.log('User IDs found:', userIds);
        let usersMap = {};
        if (userIds.length > 0) {
            const { data: usersData, error: usersError } = await window.supabaseClient
                .from('users')
                .select('id, job, region, license_date, is_verified')
                .in('id', userIds);

            if (usersError) {
                console.error('Users query error:', usersError);
                console.error('User IDs that failed:', userIds);
            } else if (usersData) {
                usersMap = usersData.reduce((map, user) => {
                    map[user.id] = user;
                    return map;
                }, {});
                console.log('Users map created:', usersMap);
                console.log('Users data length:', usersData.length);
            } else {
                console.log('No users data returned');
            }
        }

        // posts에 users 데이터 추가
        data.forEach(post => {
            post.users = usersMap[post.user_id] || null;
        });

        // 데이터 구조 변환 (Supabase 형식 -> 기존 코드 형식)
        // 각 게시글의 댓글 수를 실시간으로 계산
        const postsWithComments = await Promise.all(data.map(async (post) => {
            console.log('Post data:', post);
            console.log('Users data:', post.users);

            // 해당 게시글의 댓글 수 계산
            let commentCount = 0;
            const { count: count1, error: commentError } = await window.supabaseClient
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('postId', post.id);  // postId 시도

            if (commentError) {
                console.error('Comment count error for post', post.id, ':', commentError);
                // post_id로 다시 시도
                const { count: count2, error: commentError2 } = await window.supabaseClient
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_id', post.id);
                if (commentError2) {
                    console.error('Comment count error2 for post', post.id, ':', commentError2);
                    // 다른 필드명 시도
                    const { count: count3, error: commentError3 } = await window.supabaseClient
                        .from('comments')
                        .select('*', { count: 'exact', head: true })
                        .eq('postid', post.id);
                    if (commentError3) {
                        console.error('Comment count error3 for post', post.id, ':', commentError3);
                    } else {
                        commentCount = count3 || 0;
                        console.log('Comment count3 for post', post.id, ':', commentCount);
                    }
                } else {
                    commentCount = count2 || 0;
                    console.log('Comment count2 for post', post.id, ':', commentCount);
                }
            } else {
                commentCount = count1 || 0;
                console.log('Comment count for post', post.id, ':', commentCount);
            }

            // license_date를 기준으로 연차 계산 (라이센스 취득 연도 기준)
            let experience = '';
            if (post.users?.license_date) {
                const licenseDate = new Date(post.users.license_date);
                const now = new Date();
                const licenseYear = licenseDate.getFullYear();
                const currentYear = now.getFullYear();
                const yearsOfExperience = currentYear - licenseYear + 1;
                experience = `${yearsOfExperience}년차`;
            }

            return {
                id: post.id,
                title: post.title,
                content: post.content,
                profession: post.users?.job || '', // users 테이블의 job 필드
                location: post.users?.region || '', // users 테이블의 region 필드만 사용
                experience: experience, // license_date로부터 계산된 연차
                tags: post.tags || [],
                likes: 0,
                comments: commentCount || 0, // 실시간 계산된 댓글 수
                views: 0,
                createdAt: post.created_at,
                date: post.created_at,
                author: {
                    profession: post.users?.job || '',
                    location: post.users?.region || '',
                    experience: experience
                },
                ...post
            };
        }));

        return postsWithComments;
    } catch (error) {
        // AbortError 시 재시도 (최대 3회)
        if (error.name === 'AbortError' && retryCount < 3) {
            console.log(`Query AbortError, retrying in ${500 * (retryCount + 1)}ms... (attempt ${retryCount + 1}/3)`);
            await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
            return loadPostsFromSupabase(retryCount + 1);
        }
        console.error('Failed to load posts from Supabase:', error);
        return [];
    } finally {
        inFlight = false;
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

    // 작성자 정보 구성 (users 테이블 데이터만 사용)
    const profession = post.users?.job || '';
    const licenseDate = post.users?.license_date;
    const location = post.users?.region || '';

    // 연차 계산: 라이센스 연도를 기준으로 현재 연도에서 뺌
    let experienceText = '';
    if (licenseDate) {
        const licenseYear = new Date(licenseDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const years = currentYear - licenseYear;
        experienceText = years >= 0 ? `${years}년차` : '';
    }

    // 지역명을 간단하게 표시 (예: "서울시" → "서울")
    const locationText = location.replace(/시$|도$|특별시$|광역시$/, '');

    // 디버깅 로그 추가
    console.log('createPostRow - profession:', profession, 'experienceText:', experienceText, 'locationText:', locationText, 'comments:', post.comments, 'post.users:', post.users);

    // 클릭 이벤트: 자유게시판 또는 로그인 시 이동, 아니면 로그인 모달
    let onclickAttr = '';
    let linkHref = '';
    if (currentTab === 'all' || (typeof isLoggedIn === 'function' && isLoggedIn())) {
        onclickAttr = `onclick="location.href='post-detail.html?id=${post.id}'"`;
        linkHref = `href="post-detail.html?id=${post.id}"`;
    } else {
        onclickAttr = `onclick="showLoginRequiredModal()"`;
        linkHref = '';
    }

    return `
        <div class="board-row" ${onclickAttr}>
            <div class="board-content">
                <a ${linkHref} class="board-title-link">
                    ${post.title}
                    ${post.comments > 0 ? `<span class="comment-count">(${post.comments})</span>` : ''}
                </a>
            </div>
            <div class="board-meta">
                <div class="board-likes">
                    <i class="far fa-heart"></i>
                    <span>0</span>
                </div>
                <div class="board-author">
                    ${profession} · ${experienceText} · ${locationText}
                </div>
                <div class="board-views">
                    ${0}
                </div>
                <div class="board-date">
                    ${formatPostDate(dateVal)}
                </div>
            </div>
        </div>
    `;
}

// 게시글 렌더링 함수
function renderBoardPosts() {
    const postList = document.getElementById('postList');
    if (!postList) {
        console.error('postList element not found');
        return;
    }

    if (!posts || posts.length === 0) {
        postList.innerHTML = '<div style="text-align: center; padding: 40px; color: #64748b;">게시글이 없습니다.</div>';
        return;
    }

    // 페이지네이션 적용
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const postsToShow = posts.slice(startIndex, endIndex);

    // 게시글 HTML 생성
    const postsHTML = postsToShow.map((post, idx) => createPostRow(post, startIndex + idx + 1, posts.length)).join('');

    postList.innerHTML = postsHTML;

    // 페이지네이션 렌더링
    renderPagination();
}

// 페이지네이션 렌더링 함수
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // 이전 버튼
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage - 1})">‹</button>`;
    }

    // 페이지 번호들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="page-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? ' active' : '';
        paginationHTML += `<button class="page-btn${activeClass}" onclick="changePage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="page-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // 다음 버튼
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage + 1})">›</button>`;
    }

    pagination.innerHTML = paginationHTML;
}

// 페이지 변경 함수
function changePage(page) {
    if (page < 1 || page > Math.ceil(posts.length / POSTS_PER_PAGE)) return;

    currentPage = page;
    renderBoardPosts();

    // 페이지 상단으로 스크롤
    scrollBoardTop();
}

// auth.js 로드 대기 함수
function waitForAuthLoad() {
    return new Promise((resolve) => {
        const checkAuth = () => {
            if (typeof isLoggedIn === 'function' &&
                typeof getUserProfession === 'function' &&
                typeof isProfessionCertified === 'function') {
                console.log('auth.js functions loaded');
                resolve();
            } else {
                setTimeout(checkAuth, 100);
            }
        };
        checkAuth();
    });
}

// window 객체에 함수 노출 (auth.js에서 호출용)
window.updateBoardWriteButton = updateWriteButton;

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

// 앱 부트스트랩 함수 (중복 실행 방지)
let booted = false;
async function boot() {
    if (booted) {
        console.log('App already booted, skipping...');
        return;
    }
    booted = true;

    console.log('Booting app...');

    try {
        // 1. Auth 초기화 대기
        await window.initAuth();
        console.log('Auth initialized');

        // 2. 게시판 초기화
        initBoard();
        currentTab = 'all';
        currentPage = 1;

        // 3. 게시글 로드 (auth 완료 후)
        posts = await loadPostsFromSupabase();
        renderBoardPosts();

        // 4. UI 업데이트
        updateWriteButton();

        console.log('App booted successfully');
    } catch (error) {
        console.error('Boot error:', error);
        // fallback
        posts = [];
        renderBoardPosts();
    }
}

// DOM 로드 후 부트
document.addEventListener('DOMContentLoaded', function() {
    boot();

    // robust 이벤트 위임
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-write-board');
        if (btn) {
            e.preventDefault();
            console.log('글쓰기 버튼 클릭됨');
            // 실제 동작은 onclick에서 처리
        }
    });

    window.addEventListener('error', function(event) {
        console.error('JS Error:', event.message, event.filename, event.lineno);
    });
});

