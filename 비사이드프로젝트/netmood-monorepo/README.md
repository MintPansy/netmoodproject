# NetMood Analyzer

실시간 네트워크 트래픽 감정 분석 시스템

## 프로젝트 구조

```
netmood-monorepo/
├── frontend/         # React + Vite 프론트엔드
├── backend/         # Node.js + Express 백엔드
├── ml-service/      # Python FastAPI ML 서비스
└── infra/          # Docker 설정
```

## 시작하기

### 개발 환경 설정

1. 필수 요구사항:
   - Node.js 18+
   - Python 3.10+
   - Docker Desktop
   
2. 환경 구성:

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev

# ML Service
cd ml-service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

3. Docker Compose로 전체 서비스 실행:

```bash
docker-compose up --build
```

## API 문서

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- ML Service: http://localhost:8000/docs

## 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다