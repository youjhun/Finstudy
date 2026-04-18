# FinStudy 모바일 앱 아키텍처

## 개요

FinStudy는 경제학 학습을 위한 모바일 앱으로, **React Native + Expo** 기반의 프론트엔드와 **Node.js + Express + MySQL** 기반의 백엔드로 구성된 풀스택 애플리케이션입니다. **Gemini AI**를 활용한 지능형 피드백 시스템과 **UGC(User Generated Content)** 커뮤니티 기능을 제공합니다.

---

## 시스템 아키텍처

### 1️⃣ **모바일 앱 계층 (Mobile App Layer)**

#### UI 계층 (UI Layer)
- **Screens**: 홈, 학습, 진행도, 커뮤니티, 프로필, 관리자
- **Components**: ScreenContainer, QuizCard, UGCCard, CommentModal
- **기술**: React Native + NativeWind (Tailwind CSS)

#### 상태 관리 계층 (State & Hooks)
- **Custom Hooks**: `useColors()`, `useAuth()`, `AsyncStorage`
- **상태 관리**: React Context + `useState`/`useReducer`
- **로컬 저장소**: AsyncStorage를 통한 오프라인 데이터 캐싱

#### 비즈니스 로직 계층 (Business Logic)
- **Handlers**:
  - `QuizHandler`: 객관식/서술형 퀴즈 처리
  - `EssayFeedback`: Gemini AI 기반 서술형 답변 분석
  - `UGCHandler`: UGC 컨텐츠 CRUD 및 좋아요/댓글 관리
  - `SocialSystem`: 친구 관리, 랭킹, 활동 피드
- **Data**: 더미 데이터 및 FinStudy 커리큘럼 데이터

---

### 2️⃣ **백엔드 서비스 계층 (Backend Services)**

#### API 계층 (API Layer - tRPC)
- **Quiz API**: 퀴즈 조회, 답변 제출, 진행도 저장
- **User API**: 사용자 인증, 프로필 관리
- **Content API**: 뉴스 기사, 경제 개념 관리
- **Social API**: 친구, 랭킹, 활동 피드 조회

#### 핵심 서비스 계층 (Core Services)
- **Gemini Client**: 
  - 뉴스 기사 → 자동 퀴즈 생성 (객관식 9개 + 서술형 1개)
  - 서술형 답변 분석 및 피드백 생성
  - 동적 소크라테스식 질문 생성
  
- **Auth Service**: OAuth 2.0 기반 사용자 인증
- **Database Service**: Drizzle ORM을 통한 MySQL 데이터 접근
- **Storage Service**: S3 호환 스토리지를 통한 이미지/비디오 관리

#### 데이터 계층 (Data Layer - MySQL)
- **Users**: 사용자 정보, 인증 토큰
- **Quizzes**: 퀴즈 문제, 정답, 사용자 응답
- **Articles**: 뉴스 기사 원문
- **UGC Content**: 사용자 생성 컨텐츠 (학습자료, 팁, 질문, 토론)
- **Comments**: UGC 컨텐츠에 대한 댓글
- **Social Data**: 친구 관계, 랭킹, 활동 기록

---

### 3️⃣ **외부 서비스 (External Services)**

#### AI 서비스
- **Gemini API**: 
  - 자연어 처리를 통한 퀴즈 생성
  - 서술형 답변 평가 및 피드백
  - 경제 개념 설명 및 추가 질문 생성

#### 스토리지
- **S3 호환 스토리지**: UGC 이미지/비디오 저장

#### 인증
- **OAuth 2.0**: 소셜 로그인 (Google, Apple 등)

---

## 데이터 흐름

### 📚 학습 흐름
```
1. 사용자가 뉴스 기사 선택
   ↓
2. 백엔드에서 Gemini API 호출
   ↓
3. 자동으로 퀴즈 생성 (객관식 9개 + 서술형 1개)
   ↓
4. 모바일 앱에서 퀴즈 표시
   ↓
5. 사용자가 답변 제출
   ↓
6. 정오답 판정 및 점수 저장
```

### 🤖 서술형 답변 처리 흐름
```
1. 사용자가 서술형 답변 입력
   ↓
2. Gemini AI가 답변 분석
   ↓
3. 분석 결과 표시:
   - 위쪽: 논리 보완점, 강점, 개선점
   - 아래쪽: 세부 영역 심화 질문
   ↓
4. 사용자가 재답변 입력
   ↓
5. 최종 피드백 및 점수 부여
```

### 👥 UGC 커뮤니티 흐름
```
1. 사용자가 UGC 컨텐츠 업로드
   ↓
2. 이미지 + 제목 + 설명 + 카테고리 저장
   ↓
3. 다른 사용자가 좋아요/댓글 추가
   ↓
4. 댓글 모달에서 토론 진행
   ↓
5. 컨텐츠 삭제 (작성자만 가능)
```

---

## 기술 스택

### 프론트엔드
| 계층 | 기술 |
|------|------|
| 런타임 | React Native 0.81 + Expo 54 |
| 언어 | TypeScript 5.9 |
| 스타일링 | NativeWind 4 (Tailwind CSS) |
| 라우팅 | Expo Router 6 |
| 상태 관리 | React Context + Hooks |
| API 클라이언트 | tRPC Client |
| 로컬 저장소 | AsyncStorage |
| 애니메이션 | react-native-reanimated 4 |

### 백엔드
| 계층 | 기술 |
|------|------|
| 런타임 | Node.js |
| 프레임워크 | Express.js |
| API | tRPC |
| 언어 | TypeScript |
| ORM | Drizzle ORM |
| 데이터베이스 | MySQL |
| AI | Gemini API |

### 배포
| 항목 | 기술 |
|------|------|
| 모바일 | Expo (iOS/Android) |
| 백엔드 | AWS/Docker |
| 데이터베이스 | AWS RDS (MySQL) |
| 스토리지 | AWS S3 |

---

## 주요 기능

### 🎓 학습 기능
- ✅ 경제학 커리큘럼 기반 학습 (6개 카테고리, 50+ 개념)
- ✅ 자동 퀴즈 생성 (Gemini AI)
- ✅ 객관식 문제 (4개 선택지)
- ✅ 서술형 문제 (Gemini 분석 + 재질문)
- ✅ 스페이스드 리피티션 복습

### 🤖 AI 피드백
- ✅ 서술형 답변 자동 분석
- ✅ 논리 보완점 및 개선사항 제시
- ✅ 세부 영역 심화 질문 생성
- ✅ 경제 용어 설명 및 맥락 제공

### 👥 커뮤니티 기능
- ✅ UGC 컨텐츠 업로드 (이미지 + 텍스트)
- ✅ 4가지 카테고리 (학습자료, 팁, 질문, 토론)
- ✅ 좋아요 기능
- ✅ 댓글 및 토론
- ✅ 컨텐츠 삭제

### 📊 사용자 프로필
- ✅ 학습 진행도 추적
- ✅ 친구 관리
- ✅ 리그 순위 (경쟁 기반 학습)
- ✅ 활동 피드 (친구 활동 조회)

### ⚙️ 관리자 기능
- ✅ 뉴스 기사 추가/관리
- ✅ 자동 퀴즈 생성 및 검증
- ✅ 사용자 관리
- ✅ 통계 및 분석

---

## 확장 가능성

### 단기 (1-3개월)
- 🔊 음성 입력 기능 (서술형 답변 음성 입력)
- 📈 학습 통계 시각화 (차트, 진행도)
- 🔔 푸시 알림 시스템

### 중기 (3-6개월)
- 🌍 다국어 지원 (영어, 중국어 등)
- 💬 실시간 채팅 (친구와 토론)
- 🏆 배지/업적 시스템

### 장기 (6개월+)
- 📱 웹 버전 출시
- 🎮 게이미피케이션 (레벨, 경험치)
- 🤝 튜터링 매칭 시스템

---

## 성능 최적화

### 모바일 앱
- ✅ FlatList 기반 가상 스크롤 (대량 데이터 처리)
- ✅ 이미지 캐싱 (expo-image)
- ✅ 번들 크기 최적화 (Tree-shaking)
- ✅ 오프라인 모드 (AsyncStorage 캐싱)

### 백엔드
- ✅ 데이터베이스 인덱싱
- ✅ API 응답 캐싱 (Redis)
- ✅ 비동기 작업 큐 (Job Queue)
- ✅ CDN을 통한 정적 자산 배포

---

## 보안

### 인증 & 인가
- ✅ OAuth 2.0 기반 사용자 인증
- ✅ JWT 토큰 기반 세션 관리
- ✅ 역할 기반 접근 제어 (RBAC)

### 데이터 보호
- ✅ HTTPS/TLS 암호화
- ✅ 민감 정보 암호화 (SecureStore)
- ✅ SQL Injection 방지 (Drizzle ORM)
- ✅ CORS 정책 적용

---

## 모니터링 & 로깅

- 📊 에러 추적 (Sentry)
- 📈 성능 모니터링 (New Relic)
- 📝 로그 수집 (CloudWatch)
- 🚨 알림 시스템 (Slack 통합)

---

## 결론

FinStudy는 **Gemini AI**를 활용한 지능형 학습 플랫폼으로, 사용자 맞춤형 피드백과 커뮤니티 기반 학습을 제공합니다. 확장 가능한 아키텍처를 통해 향후 다양한 기능 추가와 글로벌 확장이 가능합니다.
