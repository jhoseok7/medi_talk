# MedTalk - 의료 커뮤니티

의료 종사자들을 위한 커뮤니티 플랫폼입니다.

## 자동 배포 설정

### GitHub Actions 설정
1. GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿을 추가하세요:
   - `VERCEL_TOKEN`: Vercel 계정 토큰
   - `VERCEL_ORG_ID`: Vercel 조직 ID
   - `VERCEL_PROJECT_ID`: Vercel 프로젝트 ID

### 로컬 개발
```bash
npm run dev
```

### 자동 배포
코드를 변경한 후 다음 명령어로 자동으로 GitHub와 Vercel에 배포됩니다:
```bash
npm run deploy
```

이 명령어는 다음 작업을 자동으로 수행합니다:
1. 모든 변경사항을 Git에 추가 (`git add .`)
2. 커밋 생성 (`git commit -m "Auto deploy"`)
3. GitHub에 푸시 (`git push origin main`)
4. GitHub Actions가 자동으로 Vercel에 배포

## 수동 배포 (기존 방식)
```bash
git add .
git commit -m "커밋 메시지"
git push origin main
```