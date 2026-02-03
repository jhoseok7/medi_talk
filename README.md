# MedTalk - 의료인 커뮤니티 플랫폼

의료 전문가들을 위한 종합 커뮤니티 플랫폼입니다.

## 🚀 주요 기능

- **직종별 게시판**: 물리치료사, 작업치료사, 방사선사 등 전문 분야별 커뮤니티
- **실시간 채팅**: 의료인들 간의 실시간 소통
- **급여 정보 공유**: 지역별/직종별 급여 정보 분석 및 공유
- **Google OAuth 인증**: 안전한 사용자 인증
- **반응형 디자인**: 모바일과 데스크톱 모두 지원

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Deployment**: Vercel
- **Styling**: Custom CSS with Font Awesome icons

## 📁 프로젝트 구조

```
medtalk/
├── index.html              # 메인 페이지
├── board.html              # 게시판 페이지
├── post-detail.html        # 게시글 상세 페이지
├── write.html              # 글쓰기 페이지
├── login.html              # 로그인 페이지
├── signup.html             # 회원가입 페이지
├── salary.html             # 급여 정보 페이지
├── css/                    # 스타일시트
│   ├── main.css
│   └── components/
├── js/                     # JavaScript 파일들
│   ├── app.js
│   ├── auth.js
│   └── ...
└── data/                   # 정적 데이터
```

## 🚀 로컬 개발 환경 설정

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```

3. **브라우저에서 접속**
   ```
   http://localhost:8080
   ```

## 🔧 환경 변수 설정

Supabase 연결을 위해 다음 환경 변수를 설정하세요:

```javascript
// js/supabaseClient.js
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
```

## 📦 배포

### Vercel 배포

1. **GitHub 저장소 연결**
2. **Vercel 프로젝트 생성**
3. **자동 배포 설정**

vercel.json 파일이 이미 설정되어 있어 자동으로 정적 사이트로 배포됩니다.

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 👥 팀

- **개발자**: MedTalk Team
- **디자인**: MedTalk Design Team

## 📞 연락처

문의사항이 있으시면 [이메일]로 연락주세요.