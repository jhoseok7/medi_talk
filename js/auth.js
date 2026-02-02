// auth.js - Supabase Auth 통합
(function() {
    // 중복 로드 방지
    if (window.authLoaded) {
        console.log('auth.js already loaded, skipping...');
        return;
    }
    window.authLoaded = true;

    // Supabase Auth 통합
    let currentUser = null;
    let userProfession = null;
    let professionCertified = false;

// Supabase 세션 초기화 (클라이언트 준비 대기)
async function initAuth() {
    // 로컬 스토리지에서 프로필 정보 불러오기
    userProfession = localStorage.getItem('userProfession');
    professionCertified = localStorage.getItem('professionCertified') === 'true';

    // Supabase 클라이언트가 준비될 때까지 대기
    const waitForSupabase = () => {
        return new Promise((resolve) => {
            const checkSupabase = () => {
                if (window.supabaseClient) {
                    resolve();
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };
            checkSupabase();
        });
    };

    try {
        await waitForSupabase();

        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        if (error) {
            console.error('Auth session error:', error);
            return;
        }

        currentUser = session?.user || null;
        updateAuthState();

        // 인증 상태 변경 리스너 설정 (클라이언트 준비 후)
        window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
            currentUser = session?.user || null;
            updateAuthState();

            // OAuth 로그인 시 프로필 처리
            if (event === 'SIGNED_IN' && session?.user) {
                await handleOAuthSignIn(session.user);
            }
        });

    } catch (error) {
        console.error('Auth initialization error:', error);
    }
}

// OAuth 로그인 후 프로필 처리
async function handleOAuthSignIn(user) {
    try {
        // Supabase 클라이언트 확인
        if (!window.supabaseClient) {
            console.error('Supabase client not ready in handleOAuthSignIn');
            return;
        }

        // users 테이블에 프로필이 있는지 확인
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            console.error('Profile check error:', error);
            return;
        }

        // 프로필이 없으면 온보딩 페이지로 리다이렉트 (첫 로그인)
        if (!data) {
            // OAuth 사용자 정보를 세션 스토리지에 임시 저장
            sessionStorage.setItem('oauth_user', JSON.stringify({
                email: user.email,
                name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                provider: 'google',
                isFirstLogin: true
            }));

            // 온보딩 페이지로 리다이렉트
            window.location.href = '/onboarding.html';
            return;
        }

        // 프로필이 있으면 기존 로직 실행
        await loadUserProfile();
    } catch (error) {
        console.error('OAuth profile handling error:', error);
    }
}

// 인증 상태 업데이트
function updateAuthState() {
    const isLoggedIn = !!currentUser;
    setLoggedIn(isLoggedIn);

    if (currentUser) {
        // 사용자 프로필 정보 가져오기 (users 테이블에서)
        loadUserProfile();
    }

    updateLoginButton();
}

// 사용자 프로필 로드
async function loadUserProfile() {
    if (!currentUser) return;

    try {
        // Supabase 클라이언트 확인
        if (!window.supabaseClient) {
            console.error('Supabase client not ready in loadUserProfile');
            return;
        }

        const { data, error } = await window.supabaseClient
            .from('users')
            .select('*')
            .eq('id', currentUser.id)  // id로 조회
            .single();

        console.log('Profile query:', {
            id: currentUser.id,
            error: error,
            data: data
        });

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            console.error('Profile load error:', error);
            return;
        }

        if (data) {
            setUserProfession(data.job); // job 필드에서 profession 정보 가져옴
            setProfessionCertified(true);
            // 지역과 경력 정보도 저장
            if (data.region) setUserRegion(data.region);
            if (data.experience) setUserExperience(data.experience);

            // 프로필 로드 완료 후 board.js 버튼 업데이트
            if (window.updateBoardWriteButton) {
                window.updateBoardWriteButton();
            }
        }
    } catch (error) {
        console.error('Profile load error:', error);
    }
}

// 현재 사용자 정보 반환
function getCurrentUser() {
    return currentUser;
}

// 사용자 프로필 관련 함수들
function setUserProfession(profession) {
    userProfession = profession;
    localStorage.setItem('userProfession', profession);
}

function setUserRegion(region) {
    localStorage.setItem('userRegion', region);
}

function setUserExperience(experience) {
    localStorage.setItem('userExperience', experience);
}

function setProfessionCertified(certified) {
    professionCertified = certified;
    localStorage.setItem('professionCertified', certified ? 'true' : 'false');
}

function getUserProfession() {
    return userProfession || localStorage.getItem('userProfession');
}

function isProfessionCertified() {
    return professionCertified || localStorage.getItem('professionCertified') === 'true';
}

// 로그인 함수
async function signIn(email, password) {
    try {
        // Supabase 클라이언트 확인
        if (!window.supabaseClient) {
            throw new Error('Supabase client not ready');
        }

        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
}

// 회원가입 함수
async function signUp(email, password, userData = {}) {
    try {
        // Supabase 클라이언트 확인
        if (!window.supabaseClient) {
            throw new Error('Supabase client not ready');
        }

        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password
        });

        if (error) {
            throw error;
        }

        // users 테이블에 프로필 정보 저장
        if (data.user) {
            const { error: profileError } = await window.supabaseClient
                .from('users')
                .insert([{
                    email: data.user.email,
                    profession: userData.profession || '',
                    specialty: userData.specialty || '',
                    location: userData.location || '',
                    experience: userData.experience || '',
                    created_at: new Date().toISOString()
                }]);

            if (profileError) {
                console.error('Profile creation error:', profileError);
            }
        }

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

// 로그아웃 함수
async function signOut() {
    try {
        // Supabase 클라이언트 확인
        if (!window.supabaseClient) {
            throw new Error('Supabase client not ready');
        }

        const { error } = await window.supabaseClient.auth.signOut();
        if (error) {
            throw error;
        }

        currentUser = null;
        setLoggedIn(false);
        setUserProfession(null);
        setProfessionCertified(false);
        window.location.reload();
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

// Google 로그인 함수
async function signInWithGoogle() {
    try {
        // Supabase 클라이언트 확인
        if (!window.supabaseClient) {
            throw new Error('Supabase client not ready');
        }

        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/index.html'
            }
        });

        if (error) {
            throw error;
        }

        // OAuth는 리다이렉트되므로 여기까지 오지 않음
        return { success: true };
    } catch (error) {
        console.error('Google sign in error:', error);
        return { success: false, error: error.message };
    }
}

// 기존 함수들 유지 (하위 호환성)
function isLoggedIn() {
    return !!currentUser || localStorage.getItem('isLoggedIn') === 'true';
}

function setLoggedIn(val) {
    localStorage.setItem('isLoggedIn', val ? 'true' : 'false');
}

function logout() {
    signOut();
}


function updateLoginButton() {
    var btn = document.querySelector('.btn-login, .btn-logout');
    if (!btn) return;
    if (isLoggedIn()) {
        btn.textContent = '로그아웃';
        btn.classList.add('btn-logout');
        btn.classList.remove('btn-login');
        btn.onclick = signOut;
    } else {
        btn.textContent = '로그인';
        btn.classList.add('btn-login');
        btn.classList.remove('btn-logout');
        btn.onclick = function() {
            location.href = 'login.html?next=' + encodeURIComponent(window.location.pathname);
        };
    }
}

// window 객체에 함수들 노출
window.signIn = signIn;
window.signUp = signUp;
window.signOut = signOut;
window.signInWithGoogle = signInWithGoogle;
window.getCurrentUser = getCurrentUser;
window.setUserProfession = setUserProfession;
window.setProfessionCertified = setProfessionCertified;
window.getUserProfession = getUserProfession;
window.isProfessionCertified = isProfessionCertified;

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    updateLoginButton();
});

// window 객체에 함수 노출
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.getUserProfession = getUserProfession;
window.isProfessionCertified = isProfessionCertified;
window.logout = logout;
window.updateAuthState = updateAuthState;

})(); // IIFE 종료
