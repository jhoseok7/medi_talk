// Mock 데이터 로드 및 렌더링
let postsData = [];
let currentFilter = 'all';
let currentSort = 'recent';
let currentBoard = null;
let currentCategory = 'all'; // 추가: 카테고리 필터

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

// 데이터 로드
async function loadData() {
    try {
        // board.js의 데이터를 사용
        const boardPosts = JSON.parse(localStorage.getItem('boardPosts') || '[]');
        
        if (boardPosts.length > 0) {
            postsData = boardPosts;
        } else {
            // boardPosts가 없으면 mock-data.json 로드
            const response = await fetch('./data/mock-data.json');
            const data = await response.json();
            const localPosts = loadLocalPosts();
            postsData = [...localPosts, ...data.posts];
        }
        
        renderPopularGrid();
        renderPosts();
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
}

// 인기 게시글 그리드 렌더링
function renderPopularGrid() {
    const popularGrid = document.getElementById('popularGrid');
    if (!popularGrid) return;
    
    const popularPosts = [...postsData]
        .sort((a, b) => (b.views + b.likes * 2) - (a.views + a.likes * 2))
        .slice(0, 4);
    
    popularGrid.innerHTML = popularPosts.map(post => {
        const truncatedContent = post.content.length > 50 
            ? post.content.substring(0, 50) + '...' 
            : post.content;
            
        return `
            <div class="popular-card" onclick="location.href='post-detail.html?id=${post.id}'">
                <div class="popular-card-header">
                    <span class="popular-badge">
                        ${post.profession || post.author?.profession || '의료인'} · ${post.experience || post.author?.experience || '경력'} · ${post.location || post.author?.location || '지역'}
                    </span>
                </div>
                <h3 class="popular-card-title">${post.title}</h3>
                <p class="popular-card-content">${truncatedContent}</p>
                <div class="popular-card-footer">
                    <span class="popular-card-stat">
                        <i class="fas fa-heart"></i>
                        ${post.likes}
                    </span>
                    <span class="popular-card-stat">
                        <i class="fas fa-comment"></i>
                        ${post.comments}
                    </span>
                    <span class="popular-card-stat">
                        <i class="fas fa-eye"></i>
                        ${post.views}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// 게시글 렌더링
function renderPosts() {
    const postList = document.getElementById('postList');
    if (!postList) return;
    
    // 카테고리 필터링
    let filteredPosts = postsData;
    if (currentCategory !== 'all') {
        filteredPosts = filteredPosts.filter(post => 
            (post.profession === currentCategory) || 
            (post.author?.profession === currentCategory)
        );
    }
    
    // 정렬
    if (currentSort === 'popular') {
        filteredPosts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
    } else {
        filteredPosts.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    }
    
    // 최대 10개만 표시
    filteredPosts = filteredPosts.slice(0, 10);
    
    // HTML 생성
    postList.innerHTML = filteredPosts.map(post => {
        const truncatedContent = post.content.length > 10 
            ? post.content.substring(0, 10) + '...' 
            : post.content;
            
        return `
            <div class="post-card" data-id="${post.id}" onclick="location.href='post-detail.html?id=${post.id}'">
                <div class="post-header">
                    <div class="author-info">
                        <span class="author-badge">
                            ${post.profession || post.author?.profession || '의료인'} · ${post.experience || post.author?.experience || '경력'} · ${post.location || post.author?.location || '지역'}
                        </span>
                    </div>
                    <span class="post-time">${post.date || getTimeAgo(post.createdAt)}</span>
                </div>
                
                <h3 class="post-title">${post.title}</h3>
                <p class="post-content">${truncatedContent}</p>
                
                <div class="post-footer">
                    <div class="post-stat likes">
                        <i class="fas fa-heart"></i>
                        <span>${post.likes}</span>
                    </div>
                    <div class="post-stat comments">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments}</span>
                    </div>
                    <div class="post-stat">
                        <i class="fas fa-eye"></i>
                        <span>${post.views}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 인기 게시글 렌더링 (사이드바)
function renderPopularPosts() {
    const popularPostsList = document.getElementById('popularPosts');
    
    // 인기순 정렬 (좋아요 + 댓글)
    const popularPosts = [...postsData]
        .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
        .slice(0, 5);
    
    popularPostsList.innerHTML = popularPosts.map((post, index) => `
        <li class="popular-post-item" data-id="${post.id}" onclick="location.href='post-detail.html?id=${post.id}'">
            <span class="popular-post-rank ${index < 3 ? 'top' : ''}">${index + 1}</span>
            <span class="popular-post-title">${post.title}</span>
            <div class="popular-post-stats">
                <span><i class="fas fa-heart"></i> ${post.likes}</span>
                <span><i class="fas fa-comment"></i> ${post.comments}</span>
            </div>
        </li>
    `).join('');
}

// 직업별 아이콘 매핑
function getProfessionIcon(profession) {
    const iconMap = {
        '의사': 'fa-user-md',
        '간호사': 'fa-user-nurse',
        '약사': 'fa-prescription-bottle',
    };
    return iconMap[profession] || 'fa-user';
}

// 시간 계산 (상대 시간)
function getTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
}

// 게시판 탭 이벤트 (토글 방식) - nav-btn 클래스 사용
document.querySelectorAll('.nav-btn[data-board]').forEach(tab => {
    tab.addEventListener('click', (e) => {
        const clickedTab = e.target.closest('.nav-btn');
        const boardType = clickedTab.dataset.board;
        
        // 같은 탭을 다시 클릭하면 비활성화 (토글)
        if (clickedTab.classList.contains('active')) {
            clickedTab.classList.remove('active');
            currentBoard = null;
        } else {
            // 다른 탭 클릭시 활성화
            document.querySelectorAll('.nav-btn[data-board]').forEach(t => t.classList.remove('active'));
            clickedTab.classList.add('active');
            currentBoard = boardType;
        }
        
        renderPosts();
    });
});

// 카테고리 탭 이벤트 (index.html)
document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.dataset.category;
        renderPosts();
    });
});

// 필터 버튼 이벤트
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderPosts();
    });
});

// 정렬 버튼 이벤트
document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentSort = e.target.dataset.sort;
        renderPosts();
    });
});


// 글쓰기 버튼 - 페이지 이동
const btnWrite = document.querySelector('.btn-write');
if (btnWrite) {
    btnWrite.addEventListener('click', () => {
        window.location.href = 'write.html';
    });
}

// 검색 기능
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm === '') {
            renderPosts();
            return;
        }
        
        const filtered = postsData.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm)
        );
        
        const postList = document.getElementById('postList');
        postList.innerHTML = filtered.map(post => {
            const truncatedContent = post.content.length > 10 
                ? post.content.substring(0, 10) + '...' 
                : post.content;
                
            return `
                <div class="post-card" data-id="${post.id}" onclick="location.href='post-detail.html?id=${post.id}'">
                    <div class="post-header">
                        <div class="author-info">
                            <span class="author-badge">
                                ${post.profession || post.author?.profession || '의료인'} · ${post.experience || post.author?.experience || '경력'} · ${post.location || post.author?.location || '지역'}
                            </span>
                        </div>
                        <span class="post-time">${post.date || getTimeAgo(post.createdAt)}</span>
                    </div>
                    
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-content">${truncatedContent}</p>
                    
                    <div class="post-footer">
                        <div class="post-stat likes">
                            <i class="fas fa-heart"></i>
                            <span>${post.likes}</span>
                        </div>
                        <div class="post-stat comments">
                            <i class="fas fa-comment"></i>
                            <span>${post.comments}</span>
                        </div>
                        <div class="post-stat">
                            <i class="fas fa-eye"></i>
                            <span>${post.views}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    });
}

// 초기 로드
loadData();
