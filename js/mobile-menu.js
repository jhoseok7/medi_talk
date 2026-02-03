// 모바일 메뉴 기능
document.addEventListener('DOMContentLoaded', function() {
    // 모바일 메뉴가 없는 경우 자동으로 추가
    if (!document.getElementById('mobileMenuToggle')) {
        addMobileMenu();
    }

    // 모바일 메뉴 토글 기능
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('show');
        });

        // 메뉴 외부 클릭시 닫기
        document.addEventListener('click', function(event) {
            if (!mobileMenuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.remove('show');
            }
        });

        // 메뉴 아이템 클릭시 메뉴 닫기
        const menuItems = mobileMenu.querySelectorAll('.mobile-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                mobileMenu.classList.remove('show');
            });
        });
    }
});

// 모바일 메뉴 자동 추가 함수
function addMobileMenu() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;

    // 모바일 메뉴 토글 버튼 추가
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.id = 'mobileMenuToggle';
    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    headerRight.appendChild(mobileToggle);

    // 모바일 메뉴 추가
    const siteHeader = document.querySelector('.site-header');
    if (!siteHeader) return;

    const mobileMenu = document.createElement('nav');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.id = 'mobileMenu';
    mobileMenu.innerHTML = `
        <div class="mobile-menu-content">
            <a href="board.html" class="mobile-menu-item">
                <i class="fas fa-comments"></i>
                게시판
            </a>
            <a href="salary.html" class="mobile-menu-item">
                <i class="fas fa-coins"></i>
                연봉정보
            </a>
            <a href="login.html" class="mobile-menu-item">
                <i class="fas fa-sign-in-alt"></i>
                로그인
            </a>
        </div>
    `;
    siteHeader.appendChild(mobileMenu);
}