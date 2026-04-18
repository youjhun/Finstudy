/**
 * FinStudy 학습 과학 기반 커리큘럼 데이터
 * 
 * 이론 적용:
 * - Ausubel 선행 조직자: 유닛 간 의존성 구조
 * - Gagné 9가지 사태: 각 화면의 학습 단계
 * - Mayer CTML: 텍스트 + 그래프 결합
 * - Sweller 인지 부하: 화면당 정보 최소화
 * - Testing Effect: 개념 직후 퀴즈
 * - Interleaving: 신규 40% + 복습 60%
 * - SDT 동기부여: XP, 스트릭, 배지
 */

export type ScreenType = 'intro' | 'concept' | 'quiz' | 'outro' | 'concept2';
export type QuizType = 'multiple-choice' | 'drag-drop' | 'fill-blank' | 'calculation' | 'essay';
export type DifficultyLevel = 1 | 2 | 3;

// ============= 단위 정의 =============

export interface Unit {
  id: string;
  title: string;
  description: string;
  order: number;
  prerequisiteUnitId?: string; // 선행 유닛 (Ausubel)
  estimatedTime: number; // 분 단위
  screens: Screen[];
  problems: Problem[];
  badges: Badge[];
}

export interface Screen {
  id: string;
  unitId: string;
  type: ScreenType;
  order: number;
  title: string;
  content: ScreenContent;
  learningTheory: string; // 적용된 학습 이론
}

export interface ScreenContent {
  // 공통
  mainText: string;
  subText?: string;
  
  // Intro 화면
  realWorldQuestion?: string;
  coreStatement?: string;
  choices?: string[];
  
  // Concept 화면
  definition?: string;
  characteristics?: string[];
  examples?: Array<{
    scenario: string;
    explanation: string;
    numericalExample: string;
  }>;
  graphDescription?: string;
  animationDetails?: string;
  
  // Quiz 화면
  question?: string;
  options?: Array<{
    id: number;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }>;
  correctAnswer?: number;
  explanation?: string;
  hint?: string;
  
  // Outro 화면
  transferQuestion?: string;
  reflectionPoints?: string[];
}

export interface Problem {
  id: string;
  unitId: string;
  type: QuizType;
  difficulty: DifficultyLevel;
  question: string;
  options?: Array<{
    id: number;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }>;
  explanation: string;
  hint: string;
  category: 'new' | 'review';
  easeFactorSM2: number;
  timesReviewed: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string; // 달성 조건
}

// ============= 커리큘럼 구조 =============

// Forward declarations for Unit 3-6 screens and problems
export const unit3Screens: Screen[] = [];
export const unit3Problems: Problem[] = [];
export const unit4Screens: Screen[] = [];
export const unit4Problems: Problem[] = [];
export const unit5Screens: Screen[] = [];
export const unit5Problems: Problem[] = [];
export const unit6Screens: Screen[] = [];
export const unit6Problems: Problem[] = [];

export const curriculum: Unit[] = [
  {
    id: 'unit-1',
    title: '기초: 희소성과 선택',
    description: '기회비용과 매몰비용의 개념을 이해합니다.',
    order: 1,
    estimatedTime: 15,
    screens: [],
    problems: [],
    badges: [
      {
        id: 'badge-1-1',
        name: '경제 기초 마스터',
        description: '기초 유닛 완료',
        icon: '🎓',
        condition: 'unit-1 완료 + 모든 문제 정답'
      }
    ]
  },
  {
    id: 'unit-2',
    title: '시장: 수요·공급의 법칙',
    description: '수요 곡선, 공급 곡선, 균형 가격의 개념을 배웁니다.',
    order: 2,
    prerequisiteUnitId: 'unit-1',
    estimatedTime: 15,
    screens: [],
    problems: [],
    badges: [
      {
        id: 'badge-2-1',
        name: '시장 분석가',
        description: '수요와 공급 유닛 완료',
        icon: '📈',
        condition: 'unit-2 완료 + 모든 문제 정답'
      }
    ]
  },
  {
    id: 'unit-3',
    title: '심화 미시: 탄력성',
    description: '가격 탄력성과 소비자·생산자 잉여를 이해합니다.',
    order: 3,
    prerequisiteUnitId: 'unit-2',
    estimatedTime: 15,
    screens: unit3Screens,
    problems: unit3Problems,
    badges: [
      {
        id: 'badge-3-1',
        name: '탄력성 전문가',
        description: '탄력성 유닛 완료',
        icon: '📊',
        condition: 'unit-3 완료 + 모든 문제 정답'
      }
    ]
  },
  {
    id: 'unit-4',
    title: '거시 지표: GDP와 물가',
    description: 'GDP와 인플레이션의 개념과 영향을 배웁니다.',
    order: 4,
    prerequisiteUnitId: 'unit-3',
    estimatedTime: 15,
    screens: unit4Screens,
    problems: unit4Problems,
    badges: [
      {
        id: 'badge-4-1',
        name: '거시 경제 분석가',
        description: 'GDP와 물가 유닛 완료',
        icon: '🌍',
        condition: 'unit-4 완료 + 모든 문제 정답'
      }
    ]
  },
  {
    id: 'unit-5',
    title: '정부 역할: 통화·재정 정책',
    description: '중앙은행의 통화정책과 정부의 재정정책을 이해합니다.',
    order: 5,
    prerequisiteUnitId: 'unit-4',
    estimatedTime: 15,
    screens: unit5Screens,
    problems: unit5Problems,
    badges: [
      {
        id: 'badge-5-1',
        name: '정책 전문가',
        description: '통화·재정 정책 유닛 완료',
        icon: '🏦',
        condition: 'unit-5 완료 + 모든 문제 정답'
      }
    ]
  },
  {
    id: 'unit-6',
    title: '글로벌: 환율과 국제 무역',
    description: '환율과 국제 무역의 원리를 이해합니다.',
    order: 6,
    prerequisiteUnitId: 'unit-5',
    estimatedTime: 15,
    screens: unit6Screens,
    problems: unit6Problems,
    badges: [
      {
        id: 'badge-6-1',
        name: '글로벌 경제 마스터',
        description: '환율과 무역 유닛 완료',
        icon: '🌐',
        condition: 'unit-6 완료 + 모든 문제 정답'
      }
    ]
  }
];

// ============= Unit 2: 수요와 공급 상세 화면 =============

export const unit2Screens: Screen[] = [
  {
    id: 'screen-2-1',
    unitId: 'unit-2',
    type: 'intro',
    order: 1,
    title: '오프닝: 실생활 질문',
    content: {
      mainText: '수요와 공급',
      subText: '시장에서 가격이 결정되는 원리',
      realWorldQuestion: '왜 아이스크림은 여름에 비싸질까?',
      coreStatement: '가격은 사람들이 사고 싶은 양(수요)과 팔고 싶은 양(공급)이 만나는 점에서 결정됩니다.',
      choices: ['올린다', '내린다', '그대로 둔다']
    },
    learningTheory: 'Gagné 주의 환기: 실생활 질문으로 호기심 유발'
  },
  {
    id: 'screen-2-2',
    unitId: 'unit-2',
    type: 'concept',
    order: 2,
    title: '수요 곡선과 공급 곡선',
    content: {
      mainText: '📚 수요와 공급의 법칙',
      definition: '수요: 가격이 낮을수록 구매 의향 증가 / 공급: 가격이 높을수록 판매 의향 증가',
      characteristics: [
        '수요 곡선: 우하향 (가격 ↓ → 수량 ↑)',
        '공급 곡선: 우상향 (가격 ↑ → 수량 ↑)',
        '균형점: 두 곡선이 만나는 점에서 시장 가격 결정'
      ],
      examples: [
        {
          scenario: '아이스크림 시장',
          explanation: '여름에 수요가 증가하면 수요 곡선이 오른쪽으로 이동',
          numericalExample: '가격: 2,000원 → 3,000원, 판매량: 100개 → 150개'
        }
      ],
      graphDescription: '수요 곡선(우하향)과 공급 곡선(우상향)이 만나는 그래프',
      animationDetails: '균형점을 중심으로 수요/공급 변화의 영향 시각화'
    },
    learningTheory: 'Mayer CTML: 텍스트 + 비교 그래프로 개념 강화'
  },
  {
    id: 'screen-2-3',
    unitId: 'unit-2',
    type: 'quiz',
    order: 3,
    title: '퀴즈: 수요와 공급 이해도 확인',
    content: {
      mainText: '❓ 퀴즈 1/2',
      question: '가격이 올라가면 공급량은 어떻게 될까요?',
      options: [
        { id: 1, text: '증가한다', isCorrect: true, feedback: '✅ 정답입니다! 가격이 올라가면 판매자는 더 많이 팔려고 합니다.' },
        { id: 2, text: '감소한다', isCorrect: false, feedback: '공급 곡선은 우상향입니다.' },
        { id: 3, text: '변화가 없다', isCorrect: false, feedback: '가격 변화는 공급량에 영향을 미칩니다.' }
      ],
      correctAnswer: 1,
      explanation: '공급 곡선이 우상향이므로 가격이 올라가면 공급량이 증가합니다.',
      hint: '공급자의 이윤 동기를 생각해보세요.'
    },
    learningTheory: 'Testing Effect: 개념 학습 직후 즉시 퀴즈'
  },
  {
    id: 'screen-2-4',
    unitId: 'unit-2',
    type: 'concept2',
    order: 4,
    title: '균형점과 시장 가격',
    content: {
      mainText: '📚 시장 균형이란?',
      definition: '수요량과 공급량이 같아지는 지점에서의 가격',
      characteristics: [
        '균형점에서 가격이 결정됨',
        '균형점 위: 공급 과잉 (가격 하락 압력)',
        '균형점 아래: 수요 과잉 (가격 상승 압력)'
      ],
      examples: [
        {
          scenario: '버터 시장',
          explanation: '수요 곡선과 공급 곡선이 만나는 점이 균형점',
          numericalExample: '균형 가격: 5,000원, 균형 수량: 100kg'
        }
      ],
      graphDescription: '수요/공급 곡선의 교점을 강조한 그래프',
      animationDetails: '균형점 위/아래의 가격 조정 메커니즘 표시'
    },
    learningTheory: 'Interleaving: 수요, 공급, 균형의 통합 이해'
  },
  {
    id: 'screen-2-5',
    unitId: 'unit-2',
    type: 'outro',
    order: 5,
    title: '퀴즈 2 & 실생활 전이',
    content: {
      mainText: '🎓 오늘 배운 것을 적용해보기',
      question: '휴대폰 가격이 내려가면 판매량은?',
      graphDescription: '휴대폰 시장의 수요/공급 변화 시나리오',
      transferQuestion: '당신이 좋아하는 상품의 가격이 올라가는 이유는?',
      reflectionPoints: [
        '수요 증가 vs 공급 감소: 어느 것이 가격을 더 올릴까?',
        '정부가 가격을 강제로 내리면 어떻게 될까?',
        '새로운 기술이 공급 곡선에 미치는 영향은?',
        '계절 변화가 수요에 미치는 영향은?'
      ]
    },
    learningTheory: 'Gagné 전이: 경제 뉴스 해석 능력 개발'
  }
];

export const unit2Problems: Problem[] = [
  {
    id: 'problem-2-1',
    unitId: 'unit-2',
    type: 'multiple-choice',
    difficulty: 1,
    question: '수요 곡선의 특징으로 올바른 것은?',
    options: [
      { id: 1, text: '우상향 곡선', isCorrect: false, feedback: '공급 곡선이 우상향입니다.' },
      { id: 2, text: '우하향 곡선', isCorrect: true, feedback: '맞습니다! 수요 곡선은 우하향입니다.' },
      { id: 3, text: '수평선', isCorrect: false, feedback: '수요 곡선은 기울기가 있습니다.' }
    ],
    explanation: '수요 곡선은 가격이 내려갈수록 수량이 증가하므로 우하향입니다.',
    hint: '가격이 싸면 더 많이 사는 현상을 나타내는 곡선은?',
    category: 'new',
    easeFactorSM2: 2.5,
    timesReviewed: 0
  },
  {
    id: 'problem-2-2',
    unitId: 'unit-2',
    type: 'multiple-choice',
    difficulty: 1,
    question: '공급 곡선의 특징으로 올바른 것은?',
    options: [
      { id: 1, text: '우하향 곡선', isCorrect: false, feedback: '수요 곡선이 우하향입니다.' },
      { id: 2, text: '우상향 곡선', isCorrect: true, feedback: '맞습니다! 공급 곡선은 우상향입니다.' },
      { id: 3, text: '수직선', isCorrect: false, feedback: '공급 곡선은 기울기가 있습니다.' }
    ],
    explanation: '공급 곡선은 가격이 올라갈수록 수량이 증가하므로 우상향입니다.',
    hint: '생산자의 이윤 동기를 생각해보세요.',
    category: 'new',
    easeFactorSM2: 2.5,
    timesReviewed: 0
  },
  {
    id: 'problem-2-3',
    unitId: 'unit-2',
    type: 'fill-blank',
    difficulty: 2,
    question: '가격이 내려가면 소비자는 더 많이 사려고 하는데, 이를 _____ 곡선이라고 합니다.',
    explanation: '수요 곡선입니다. 가격과 수량의 역관계를 나타냅니다.',
    hint: '가격이 싸면 더 많이 사는 현상을 나타내는 곡선은?',
    category: 'review',
    easeFactorSM2: 2.0,
    timesReviewed: 1
  },
  {
    id: 'problem-2-4',
    unitId: 'unit-2',
    type: 'drag-drop',
    difficulty: 2,
    question: '수요 곡선(우하향)과 공급 곡선(우상향)이 만나는 점을 찾으세요. 이 점을 무엇이라고 부를까요?',
    explanation: '균형점 또는 시장 가격입니다. 이 점에서 수요량과 공급량이 같아집니다.',
    hint: '두 곡선의 교점을 찾아보세요.',
    category: 'review',
    easeFactorSM2: 2.3,
    timesReviewed: 0
  },
  {
    id: 'problem-2-5',
    unitId: 'unit-2',
    type: 'calculation',
    difficulty: 2,
    question: '버터 가격이 10,000원일 때 공급량이 100kg입니다. 가격이 15,000원으로 올라가면 공급량이 150kg으로 증가했습니다. 이는 공급 곡선의 어떤 특징을 보여주나요?',
    explanation: '공급 곡선의 우상향 특징을 보여줍니다. 가격이 올라가면 공급량이 증가합니다.',
    hint: '가격과 공급량의 관계를 보세요.',
    category: 'review',
    easeFactorSM2: 2.1,
    timesReviewed: 1
  },
  {
    id: 'problem-2-6',
    unitId: 'unit-2',
    type: 'essay',
    difficulty: 3,
    question: '여름에 아이스크림 수요가 증가하면, 수요 곡선이 어떻게 이동할까요? 이에 따라 균형점(시장 가격)은 어떻게 변할까요?',
    explanation: '수요 곡선이 오른쪽으로 이동하면, 균형점이 위로 올라가서 가격이 올라갑니다. 또한 판매량도 증가합니다.',
    hint: '수요 증가 → 수요 곡선 이동 → 새로운 균형점 찾기',
    category: 'review',
    easeFactorSM2: 1.8,
    timesReviewed: 0
  }
];

// ============= Unit 3: 심화 미시 - 탄력성 =============

const _unit3Screens: Screen[] = [
  {
    id: 'screen-3-1',
    unitId: 'unit-3',
    type: 'intro',
    order: 1,
    title: '오프닝: 실생활 질문',
    content: {
      mainText: '탄력성',
      subText: '가격 변화에 따른 수량 변화의 민감도',
      realWorldQuestion: '휘발유 가격이 올라가면 사람들은 얼마나 덜 사용할까?',
      coreStatement: '같은 가격 변화도 상품에 따라 수량 변화가 다릅니다. 이를 탄력성이라고 합니다.',
      choices: ['매우 많이 줄인다', '조금만 줄인다', '거의 줄이지 않는다']
    },
    learningTheory: 'Gagné 주의 환기: 실생활 질문으로 호기심 유발'
  },
  {
    id: 'screen-3-2',
    unitId: 'unit-3',
    type: 'concept',
    order: 2,
    title: '가격 탄력성 이해하기',
    content: {
      mainText: '📚 가격 탄력성이란?',
      definition: '가격 변화에 따른 수요량 변화의 정도를 나타내는 지표',
      characteristics: [
        '탄력적(elastic): 가격 변화 1% → 수량 변화 1% 이상',
        '비탄력적(inelastic): 가격 변화 1% → 수량 변화 1% 미만',
        '단위 탄력적(unit elastic): 가격 변화 1% → 수량 변화 1%'
      ],
      examples: [
        {
          scenario: '휘발유 (비탄력적)',
          explanation: '가격이 올라도 사람들은 필수적으로 사용하므로 수량이 크게 줄지 않음',
          numericalExample: '가격 10% 상승 → 수량 2% 감소'
        },
        {
          scenario: '사치품 (탄력적)',
          explanation: '가격이 올라가면 사람들은 쉽게 구매를 포기함',
          numericalExample: '가격 10% 상승 → 수량 20% 감소'
        }
      ],
      graphDescription: '가로축: 수량, 세로축: 가격. 가파른 곡선(비탄력적)과 완만한 곡선(탄력적) 비교',
      animationDetails: '두 곡선을 나란히 그려서 기울기 차이를 시각화'
    },
    learningTheory: 'Mayer CTML: 텍스트 + 비교 그래프로 개념 강화'
  },
  {
    id: 'screen-3-3',
    unitId: 'unit-3',
    type: 'quiz',
    order: 3,
    title: '퀴즈 1: 가격 탄력성 이해도 확인',
    content: {
      mainText: '❓ 퀴즈 1/2',
      question: '의약품 가격이 50% 올라갔는데, 판매량은 5% 감소했습니다. 의약품의 가격 탄력성은?',
      options: [
        { id: 1, text: '탄력적', isCorrect: false, feedback: '탄력적이면 가격 변화에 비해 수량이 더 크게 변해야 합니다.' },
        { id: 2, text: '비탄력적', isCorrect: true, feedback: '✅ 정답입니다! 가격 변화에 비해 수량 변화가 작으므로 비탄력적입니다.' },
        { id: 3, text: '단위 탄력적', isCorrect: false, feedback: '단위 탄력적이면 가격과 수량이 같은 비율로 변해야 합니다.' }
      ],
      correctAnswer: 2,
      explanation: '의약품은 필수재이므로 가격이 올라도 수량이 크게 줄지 않습니다. 이는 비탄력적입니다.',
      hint: '가격 변화 비율과 수량 변화 비율을 비교해보세요.'
    },
    learningTheory: 'Testing Effect: 개념 학습 직후 즉시 퀴즈'
  },
  {
    id: 'screen-3-4',
    unitId: 'unit-3',
    type: 'concept2',
    order: 4,
    title: '소비자 잉여와 생산자 잉여',
    content: {
      mainText: '📚 경제적 잉여란?',
      definition: '소비자가 기꺼이 지불하려는 가격과 실제 지불 가격의 차이',
      characteristics: [
        '소비자 잉여: 소비자의 이득 (지불 의사 가격 > 실제 가격)',
        '생산자 잉여: 생산자의 이득 (실제 가격 > 생산 의사 가격)',
        '총 잉여: 시장의 효율성을 나타내는 지표'
      ],
      examples: [
        {
          scenario: '커피 예시',
          explanation: '당신이 5,000원까지 낼 의사가 있는데 실제로 3,000원에 샀다면',
          numericalExample: '소비자 잉여 = 2,000원'
        }
      ],
      graphDescription: '수요 곡선 아래, 균형점 위의 삼각형 영역이 소비자 잉여',
      animationDetails: '수요/공급 곡선과 균형점을 그려서 잉여 영역 강조'
    },
    learningTheory: 'Interleaving: 탄력성과 잉여의 연관성 강화'
  },
  {
    id: 'screen-3-5',
    unitId: 'unit-3',
    type: 'outro',
    order: 5,
    title: '퀴즈 2 & 실생활 전이',
    content: {
      mainText: '🎓 오늘 배운 것을 적용해보기',
      question: '정부가 담배 세금을 50% 올리면 어떤 일이 일어날까요?',
      graphDescription: '담배의 비탄력성을 고려한 가격/수량 변화 예측',
      transferQuestion: '담배는 왜 가격 탄력성이 낮을까요?',
      reflectionPoints: [
        '담배는 필수재인가 사치재인가?',
        '중독성이 탄력성에 미치는 영향은?',
        '정부 세금 정책이 효과적일까?',
        '소비자와 생산자 잉여는 어떻게 변할까?'
      ]
    },
    learningTheory: 'Gagné 전이: 정책 분석 능력 개발'
  }
];

const _unit3Problems: Problem[] = [
  {
    id: 'problem-3-1',
    unitId: 'unit-3',
    type: 'multiple-choice',
    difficulty: 1,
    question: '다음 중 가격 탄력성이 가장 높은 상품은?',
    options: [
      { id: 1, text: '쌀', isCorrect: false, feedback: '쌀은 필수재로 비탄력적입니다.' },
      { id: 2, text: '전자제품', isCorrect: true, feedback: '✅ 정답입니다! 전자제품은 사치품으로 탄력적입니다.' },
      { id: 3, text: '전기', isCorrect: false, feedback: '전기는 필수재로 비탄력적입니다.' }
    ],
    explanation: '전자제품은 가격이 올라가면 구매를 미루거나 포기할 수 있으므로 탄력적입니다.',
    hint: '필수재와 사치재의 차이를 생각해보세요.',
    category: 'new',
    easeFactorSM2: 2.5,
    timesReviewed: 0
  },
  {
    id: 'problem-3-2',
    unitId: 'unit-3',
    type: 'multiple-choice',
    difficulty: 1,
    question: '소비자 잉여는 언제 증가할까요?',
    options: [
      { id: 1, text: '상품 가격이 올라갈 때', isCorrect: false, feedback: '가격이 올라가면 소비자 잉여가 감소합니다.' },
      { id: 2, text: '상품 가격이 내려갈 때', isCorrect: true, feedback: '✅ 정답입니다! 가격이 내려가면 소비자 잉여가 증가합니다.' },
      { id: 3, text: '상품 품질이 낮아질 때', isCorrect: false, feedback: '품질 저하는 소비자 잉여와 직접 관련이 없습니다.' }
    ],
    explanation: '가격이 내려가면 지불 의사 가격과 실제 가격의 차이가 커져 소비자 잉여가 증가합니다.',
    hint: '소비자 잉여의 정의를 다시 생각해보세요.',
    category: 'new',
    easeFactorSM2: 2.5,
    timesReviewed: 0
  },
  {
    id: 'problem-3-3',
    unitId: 'unit-3',
    type: 'calculation',
    difficulty: 2,
    question: '당신이 책에 최대 20,000원까지 낼 의사가 있는데, 실제로 12,000원에 샀습니다. 소비자 잉여는?',
    explanation: '소비자 잉여 = 지불 의사 가격 - 실제 가격 = 20,000 - 12,000 = 8,000원',
    hint: '소비자 잉여 = 지불 의사 가격 - 실제 가격',
    category: 'review',
    easeFactorSM2: 2.2,
    timesReviewed: 0
  },
  {
    id: 'problem-3-4',
    unitId: 'unit-3',
    type: 'fill-blank',
    difficulty: 2,
    question: '가격 변화에 민감하게 반응하는 상품을 _____ 탄력적이라고 합니다.',
    explanation: '가격이 조금만 올라도 수량이 크게 줄어드는 상품을 탄력적이라고 합니다.',
    hint: '가격 변화에 수량이 크게 변하는 상품은?',
    category: 'review',
    easeFactorSM2: 2.0,
    timesReviewed: 0
  },
  {
    id: 'problem-3-5',
    unitId: 'unit-3',
    type: 'essay',
    difficulty: 3,
    question: '정부가 가솔린 세금을 인상하면, 소비자 잉여와 생산자 잉여는 어떻게 변할까요?',
    explanation: '가솔린은 비탄력적이므로 가격 상승에도 수량이 크게 줄지 않습니다. 소비자 잉여는 감소하고, 생산자 잉여는 증가할 가능성이 높습니다.',
    hint: '가솔린의 탄력성을 고려해서 가격과 수량 변화를 예측해보세요.',
    category: 'review',
    easeFactorSM2: 1.8,
    timesReviewed: 0
  },
  {
    id: 'problem-3-6',
    unitId: 'unit-3',
    type: 'drag-drop',
    difficulty: 2,
    question: '수요 곡선 그래프에서 소비자 잉여 영역을 찾으세요.',
    explanation: '소비자 잉여는 수요 곡선 아래, 균형점 가격 위의 삼각형 영역입니다.',
    hint: '수요 곡선과 균형점 가격 선 사이의 영역을 찾아보세요.',
    category: 'review',
    easeFactorSM2: 2.1,
    timesReviewed: 0
  }
];

// Assign to exports
Object.assign(unit3Screens, _unit3Screens);
Object.assign(unit3Problems, _unit3Problems);

// ============= Unit 4: 거시 지표 - GDP와 물가 =============

const _unit4Screens: Screen[] = [
  {
    id: 'screen-4-1',
    unitId: 'unit-4',
    type: 'intro',
    order: 1,
    title: '오프닝: 실생활 질문',
    content: {
      mainText: 'GDP와 물가',
      subText: '국가 경제 규모와 물가 수준 이해하기',
      realWorldQuestion: '뉴스에서 "GDP 성장률이 3%"라고 하는데, 이게 좋은 건가요?',
      coreStatement: 'GDP는 국가 경제 규모를 나타내고, 물가는 상품 가격 수준을 나타냅니다.',
      choices: ['매우 좋은 신호', '보통 수준', '나쁜 신호']
    },
    learningTheory: 'Gagné 주의 환기: 경제 뉴스와 연결'
  },
  {
    id: 'screen-4-2',
    unitId: 'unit-4',
    type: 'concept',
    order: 2,
    title: 'GDP 이해하기',
    content: {
      mainText: '📚 GDP(국내총생산)란?',
      definition: '일정 기간 동안 국내에서 생산된 모든 최종 상품과 서비스의 가치',
      characteristics: [
        '국가 경제 규모를 나타내는 가장 중요한 지표',
        '명목 GDP: 현재 가격으로 계산',
        '실질 GDP: 기준년도 가격으로 계산 (물가 변화 제거)'
      ],
      examples: [
        {
          scenario: '한국 GDP',
          explanation: '2023년 한국 GDP는 약 2조 1천억 달러',
          numericalExample: '세계 10위 수준의 경제 규모'
        }
      ],
      graphDescription: '연도별 GDP 추이를 보여주는 막대 그래프',
      animationDetails: '명목 GDP와 실질 GDP의 차이를 색상으로 구분'
    },
    learningTheory: 'Mayer CTML: 개념 정의 + 실제 사례'
  },
  {
    id: 'screen-4-3',
    unitId: 'unit-4',
    type: 'quiz',
    order: 3,
    title: '퀴즈 1: GDP 이해도 확인',
    content: {
      mainText: '❓ 퀴즈 1/2',
      question: '명목 GDP와 실질 GDP의 차이는?',
      options: [
        { id: 1, text: '명목 GDP는 현재 가격, 실질 GDP는 기준년도 가격으로 계산', isCorrect: true, feedback: '✅ 정답입니다!' },
        { id: 2, text: '명목 GDP는 더 크고 실질 GDP는 더 작다', isCorrect: false, feedback: '항상 그런 것은 아닙니다. 물가 변화에 따라 다릅니다.' },
        { id: 3, text: '둘은 같은 의미이다', isCorrect: false, feedback: '물가 변화를 고려하는지 여부에 따라 다릅니다.' }
      ],
      correctAnswer: 1,
      explanation: '명목 GDP는 현재 가격으로, 실질 GDP는 물가 변화를 제거한 기준년도 가격으로 계산합니다.',
      hint: '물가 변화를 고려하는지 여부를 생각해보세요.'
    },
    learningTheory: 'Testing Effect: 개념 구분 능력 평가'
  },
  {
    id: 'screen-4-4',
    unitId: 'unit-4',
    type: 'concept2',
    order: 4,
    title: '물가와 인플레이션',
    content: {
      mainText: '📚 인플레이션이란?',
      definition: '시간이 지남에 따라 상품과 서비스의 평균 가격 수준이 지속적으로 상승하는 현상',
      characteristics: [
        '온건한 인플레이션(2-3%): 경제 성장을 촉진',
        '높은 인플레이션(10% 이상): 경제 불안정 야기',
        '디플레이션(음의 인플레이션): 경제 침체 신호'
      ],
      examples: [
        {
          scenario: '2022년 고인플레이션',
          explanation: '전 세계적으로 물가가 크게 올라 생활비 부담 증가',
          numericalExample: '한국 인플레이션율: 약 5-6%'
        }
      ],
      graphDescription: '연도별 인플레이션율 추이를 보여주는 꺾은선 그래프',
      animationDetails: '온건한 인플레이션과 높은 인플레이션 구간 강조'
    },
    learningTheory: 'Interleaving: GDP와 물가의 관계 이해'
  },
  {
    id: 'screen-4-5',
    unitId: 'unit-4',
    type: 'outro',
    order: 5,
    title: '퀴즈 2 & 실생활 전이',
    content: {
      mainText: '🎓 오늘 배운 것을 적용해보기',
      question: 'GDP는 증가했는데 인플레이션도 높다면?',
      graphDescription: 'GDP 성장과 인플레이션이 동시에 발생하는 시나리오',
      transferQuestion: '당신의 월급이 5% 올랐는데 물가가 8% 올랐다면 실제 구매력은?',
      reflectionPoints: [
        'GDP 성장이 항상 좋은 신호일까?',
        '인플레이션이 높으면 어떤 문제가 생길까?',
        '실질 임금과 명목 임금의 차이는?',
        '저축과 투자에 미치는 영향은?'
      ]
    },
    learningTheory: 'Gagné 전이: 경제 뉴스 해석 능력'
  }
];

const _unit4Problems: Problem[] = [
  {
    id: 'problem-4-1',
    unitId: 'unit-4',
    type: 'multiple-choice',
    difficulty: 1,
    question: 'GDP에 포함되지 않는 것은?',
    options: [
      { id: 1, text: '새 자동차 판매', isCorrect: false, feedback: '새 자동차 판매는 GDP에 포함됩니다.' },
      { id: 2, text: '중고 자동차 판매', isCorrect: true, feedback: '✅ 정답입니다! GDP는 새로 생산된 것만 포함합니다.' },
      { id: 3, text: '자동차 수리 서비스', isCorrect: false, feedback: '서비스도 GDP에 포함됩니다.' }
    ],
    explanation: 'GDP는 새로 생산된 최종 상품과 서비스만 포함하므로, 중고 상품은 제외됩니다.',
    hint: '"새로 생산된" 상품이 무엇인지 생각해보세요.',
    category: 'new',
    easeFactorSM2: 2.5,
    timesReviewed: 0
  },
  {
    id: 'problem-4-2',
    unitId: 'unit-4',
    type: 'multiple-choice',
    difficulty: 1,
    question: '인플레이션이 높을 때 가장 피해를 입는 사람은?',
    options: [
      { id: 1, text: '빚이 많은 사람', isCorrect: true, feedback: '✅ 정답입니다! 인플레이션은 빚의 실질 가치를 감소시킵니다.' },
      { id: 2, text: '저축이 많은 사람', isCorrect: false, feedback: '저축이 많은 사람은 인플레이션으로 피해를 입습니다.' },
      { id: 3, text: '임금이 고정된 사람', isCorrect: false, feedback: '임금이 고정된 사람도 인플레이션으로 피해를 입습니다.' }
    ],
    explanation: '인플레이션 시 빚의 실질 가치가 감소하므로 빚이 많은 사람은 이득을 봅니다.',
    hint: '인플레이션이 돈의 가치에 미치는 영향을 생각해보세요.',
    category: 'new',
    easeFactorSM2: 2.5,
    timesReviewed: 0
  },
  {
    id: 'problem-4-3',
    unitId: 'unit-4',
    type: 'calculation',
    difficulty: 2,
    question: '명목 GDP가 1,000조원에서 1,100조원으로 증가했고, 물가가 5% 올랐다면 실질 GDP 성장률은?',
    explanation: '실질 GDP 성장률 = (명목 성장률 - 물가상승률) ≈ 10% - 5% = 5%',
    hint: '물가 상승분을 제외해야 실질 성장률을 구할 수 있습니다.',
    category: 'review',
    easeFactorSM2: 2.1,
    timesReviewed: 0
  },
  {
    id: 'problem-4-4',
    unitId: 'unit-4',
    type: 'fill-blank',
    difficulty: 2,
    question: '물가가 지속적으로 상승하는 현상을 _____ 이라고 합니다.',
    explanation: '인플레이션입니다. 시간이 지남에 따라 상품 가격이 계속 올라가는 현상입니다.',
    hint: '물가 상승을 나타내는 경제 용어는?',
    category: 'review',
    easeFactorSM2: 2.0,
    timesReviewed: 0
  },
  {
    id: 'problem-4-5',
    unitId: 'unit-4',
    type: 'essay',
    difficulty: 3,
    question: 'GDP는 증가했지만 실질 임금은 감소한 경우, 일반인의 생활 수준은 어떻게 변했을까요?',
    explanation: 'GDP 증가는 경제 규모 확대를 의미하지만, 실질 임금 감소는 개인의 구매력 감소를 의미합니다. 따라서 일반인의 생활 수준은 악화되었을 가능성이 높습니다.',
    hint: 'GDP와 개인의 생활 수준이 항상 일치하는지 생각해보세요.',
    category: 'review',
    easeFactorSM2: 1.8,
    timesReviewed: 0
  },
  {
    id: 'problem-4-6',
    unitId: 'unit-4',
    type: 'drag-drop',
    difficulty: 2,
    question: '명목 GDP와 실질 GDP 그래프에서 물가 상승 구간을 찾으세요.',
    explanation: '명목 GDP가 실질 GDP보다 더 빠르게 증가하는 구간이 물가 상승 구간입니다.',
    hint: '두 그래프 사이의 간격이 커지는 부분을 찾아보세요.',
    category: 'review',
    easeFactorSM2: 2.1,
    timesReviewed: 0
  }
];

Object.assign(unit4Screens, _unit4Screens);
Object.assign(unit4Problems, _unit4Problems);

// ============= Unit 5: 정부 역할 - 통화·재정 정책 =============

const _unit5Screens: Screen[] = [
  {
    id: 'screen-5-1',
    unitId: 'unit-5',
    type: 'intro',
    order: 1,
    title: '오프닝: 실생활 질문',
    content: {
      mainText: '통화·재정 정책',
      subText: '정부가 경제를 조절하는 방법',
      realWorldQuestion: '금리가 올라가면 당신의 대출금 이자는 어떻게 될까요?',
      coreStatement: '정부는 금리(통화정책)와 세금(재정정책)으로 경제를 조절합니다.',
      choices: ['이자가 올라간다', '이자가 내려간다', '변화가 없다']
    },
    learningTheory: 'Gagné 주의 환기: 금리와 개인 생활의 연결'
  },
  {
    id: 'screen-5-2',
    unitId: 'unit-5',
    type: 'concept',
    order: 2,
    title: '통화정책 이해하기',
    content: {
      mainText: '📚 통화정책이란?',
      definition: '중앙은행이 금리와 통화량을 조절하여 경제를 안정시키는 정책',
      characteristics: [
        '금리 인상: 인플레이션 억제, 경기 둔화',
        '금리 인하: 경기 부양, 인플레이션 위험',
        '통화량 증가: 경기 부양, 인플레이션 위험',
        '통화량 감소: 인플레이션 억제, 경기 둔화'
      ],
      examples: [
        {
          scenario: '2022년 금리 인상',
          explanation: '고인플레이션을 억제하기 위해 전 세계 중앙은행이 금리를 올림',
          numericalExample: '한국 기준금리: 0.5% → 3.5%'
        }
      ],
      graphDescription: '금리 변화와 경제 지표의 관계를 보여주는 그래프',
      animationDetails: '금리 인상/인하의 파급 효과를 시각화'
    },
    learningTheory: 'Mayer CTML: 정책 효과 시각화'
  },
  {
    id: 'screen-5-3',
    unitId: 'unit-5',
    type: 'quiz',
    order: 3,
    title: '퀴즈 1: 통화정책 이해도 확인',
    content: {
      mainText: '❓ 퀴즈 1/2',
      question: '인플레이션이 높을 때 중앙은행은 어떤 정책을 펼칠까요?',
      options: [
        { id: 1, text: '금리를 인상한다', isCorrect: true, feedback: '✅ 정답입니다! 금리 인상으로 인플레이션을 억제합니다.' },
        { id: 2, text: '금리를 인하한다', isCorrect: false, feedback: '금리 인하는 인플레이션을 악화시킵니다.' },
        { id: 3, text: '금리를 유지한다', isCorrect: false, feedback: '인플레이션 억제를 위해 금리를 올려야 합니다.' }
      ],
      correctAnswer: 1,
      explanation: '금리 인상은 대출을 어렵게 하여 통화량을 줄이고, 이는 인플레이션을 억제합니다.',
      hint: '인플레이션을 억제하려면 통화량을 줄여야 합니다.'
    },
    learningTheory: 'Testing Effect: 정책 선택 능력 평가'
  },
  {
    id: 'screen-5-4',
    unitId: 'unit-5',
    type: 'concept2',
    order: 4,
    title: '재정정책 이해하기',
    content: {
      mainText: '📚 재정정책이란?',
      definition: '정부가 세금과 지출을 조절하여 경제를 안정시키는 정책',
      characteristics: [
        '확장적 재정정책: 정부 지출 증가, 세금 감소 (경기 부양)',
        '긴축적 재정정책: 정부 지출 감소, 세금 증가 (인플레이션 억제)',
        '자동 안정화 장치: 경기 변화에 자동으로 반응'
      ],
      examples: [
        {
          scenario: '2020년 코로나 재정 지원',
          explanation: '경기 침체 극복을 위해 정부가 대규모 지출 증가',
          numericalExample: '한국 추가경정예산: 약 35조원'
        }
      ],
      graphDescription: '정부 지출 변화와 GDP의 관계',
      animationDetails: '승수 효과를 통한 경제 파급 효과 시각화'
    },
    learningTheory: 'Interleaving: 통화정책과 재정정책의 차이'
  },
  {
    id: 'screen-5-5',
    unitId: 'unit-5',
    type: 'outro',
    order: 5,
    title: '퀴즈 2 & 실생활 전이',
    content: {
      mainText: '🎓 오늘 배운 것을 적용해보기',
      question: '경기 침체 시 정부는 금리를 내리고 지출을 늘린다면?',
      graphDescription: '통화정책과 재정정책의 동시 시행 효과',
      transferQuestion: '이런 정책들이 당신의 생활에 어떤 영향을 미칠까요?',
      reflectionPoints: [
        '금리 인하로 대출이 쉬워지면?',
        '정부 지출 증가로 일자리가 늘어나면?',
        '이런 정책의 부작용은 무엇일까?',
        '장기적 영향과 단기적 영향의 차이는?'
      ]
    },
    learningTheory: 'Gagné 전이: 정책 효과 예측 능력'
  }
];

const _unit5Problems: Problem[] = [
  {
    id: 'problem-5-1',
    unitId: 'unit-5',
    type: 'multiple-choice',
    difficulty: 1,
    question: '통화정책을 담당하는 기관은?',
    options: [
      { id: 1, text: '정부', isCorrect: false, feedback: '정부는 재정정책을 담당합니다.' },
      { id: 2, text: '중앙은행', isCorrect: true, feedback: '✅ 정답입니다! 중앙은행이 금리와 통화량을 조절합니다.' },
      { id: 3, text: '국회', isCorrect: false, feedback: '국회는 법안을 입법합니다.' }
    ],
    explanation: '중앙은행(한국은행)이 금리 결정과 통화량 조절을 통해 통화정책을 펼칩니다.',
    hint: '금리를 결정하는 기관은 어디일까요?',
    category: 'new',
    easeFactorSM2: 2.5,
    timesReviewed: 0
  },
  {
    id: 'problem-5-2',
    unitId: 'unit-5',
    type: 'multiple-choice',
    difficulty: 1,
    question: '재정정책의 예로 가장 적절한 것은?',
    options: [
      { id: 1, text: '금리 인상', isCorrect: false, feedback: '금리 인상은 통화정책입니다.' },
      { id: 2, text: '정부 지출 증가', isCorrect: true, feedback: '✅ 정답입니다! 정부 지출 변화는 재정정책입니다.' },
      { id: 3, text: '통화량 감소', isCorrect: false, feedback: '통화량 조절은 통화정책입니다.' }
    ],
    explanation: '재정정책은 정부의 세금과 지출 조절을 통한 정책입니다.',
    hint: '정부가 직접 조절하는 정책은?',
    category: 'new',
    easeFactorSM2: 2.5,
    timesReviewed: 0
  },
  {
    id: 'problem-5-3',
    unitId: 'unit-5',
    type: 'calculation',
    difficulty: 2,
    question: '기준금리가 2%에서 3%로 올라갔습니다. 은행 대출 금리도 같은 비율로 올라간다면, 연 1,000만원 대출의 이자는 얼마나 증가할까요?',
    explanation: '금리 인상분 = 3% - 2% = 1%. 추가 이자 = 1,000만원 × 1% = 100만원',
    hint: '금리 인상분을 계산한 후 대출금에 곱하세요.',
    category: 'review',
    easeFactorSM2: 2.1,
    timesReviewed: 0
  },
  {
    id: 'problem-5-4',
    unitId: 'unit-5',
    type: 'fill-blank',
    difficulty: 2,
    question: '정부가 세금을 감소하고 지출을 증가시키는 정책을 _____ 재정정책이라고 합니다.',
    explanation: '확장적 재정정책입니다. 경기를 부양하기 위한 정책입니다.',
    hint: '경기를 살리는 정책은?',
    category: 'review',
    easeFactorSM2: 2.0,
    timesReviewed: 0
  },
  {
    id: 'problem-5-5',
    unitId: 'unit-5',
    type: 'essay',
    difficulty: 3,
    question: '금리 인상과 세금 인상을 동시에 시행하면 경제에 어떤 영향을 미칠까요?',
    explanation: '통화정책과 재정정책이 모두 긴축적이므로 경기 침체 위험이 높습니다. 소비와 투자가 모두 감소할 가능성이 높습니다.',
    hint: '두 정책 모두 경제를 어렵게 하는 방향이라는 것을 생각해보세요.',
    category: 'review',
    easeFactorSM2: 1.8,
    timesReviewed: 0
  },
  {
    id: 'problem-5-6',
    unitId: 'unit-5',
    type: 'drag-drop',
    difficulty: 2,
    question: '금리 인상, 세금 감소, 정부 지출 증가 중에서 경기 부양 정책을 모두 선택하세요.',
    explanation: '세금 감소와 정부 지출 증가가 경기 부양 정책입니다. 금리 인상은 경기 둔화 정책입니다.',
    hint: '경기를 살리는 정책은 어떤 특징이 있을까요?',
    category: 'review',
    easeFactorSM2: 2.1,
    timesReviewed: 0
  }
];

Object.assign(unit5Screens, _unit5Screens);
Object.assign(unit5Problems, _unit5Problems);

// ============= Unit 6: 글로벌 - 환율과 국제 무역 =============

const _unit6Screens: Screen[] = [
  {
    id: 'screen-6-1',
    unitId: 'unit-6',
    type: 'intro',
    order: 1,
    title: '오프닝: 실생활 질문',
    content: {
      mainText: '환율과 국제 무역',
      subText: '글로벌 경제 이해하기',
      realWorldQuestion: '달러 환율이 올라가면 한국 수출품은 더 잘 팔릴까요?',
      coreStatement: '환율은 국가 간 무역에 큰 영향을 미치며, 국제 무역은 각국의 경제를 연결합니다.',
      choices: ['더 잘 팔린다', '덜 팔린다', '변화가 없다']
    },
    learningTheory: 'Gagné 주의 환기: 환율과 수출의 연결'
  },
  {
    id: 'screen-6-2',
    unitId: 'unit-6',
    type: 'concept',
    order: 2,
    title: '환율 이해하기',
    content: {
      mainText: '📚 환율이란?',
      definition: '한 국가의 통화를 다른 국가의 통화로 환전할 때의 교환 비율',
      characteristics: [
        '원화 강세(환율 하락): 1달러 = 1,000원 → 900원',
        '원화 약세(환율 상승): 1달러 = 1,000원 → 1,100원',
        '환율 변화는 수출입에 영향을 미침'
      ],
      examples: [
        {
          scenario: '원화 약세의 영향',
          explanation: '한국 상품이 외국인 입장에서 더 싸져서 수출 증가',
          numericalExample: '1달러 = 1,000원 → 1,200원이면 미국인에게 20% 더 싸짐'
        }
      ],
      graphDescription: '시간에 따른 환율 변화를 보여주는 꺾은선 그래프',
      animationDetails: '원화 강세/약세 구간을 색상으로 구분'
    },
    learningTheory: 'Mayer CTML: 환율 개념과 영향 시각화'
  },
  {
    id: 'screen-6-3',
    unitId: 'unit-6',
    type: 'quiz',
    order: 3,
    title: '퀴즈 1: 환율 이해도 확인',
    content: {
      mainText: '❓ 퀴즈 1/2',
      question: '원화 약세(환율 상승)는 한국 수출에 어떤 영향을 미칠까요?',
      options: [
        { id: 1, text: '수출이 증가한다', isCorrect: true, feedback: '✅ 정답입니다! 원화 약세로 한국 상품이 더 싸져서 수출이 증가합니다.' },
        { id: 2, text: '수출이 감소한다', isCorrect: false, feedback: '원화 약세는 수출에 유리합니다.' },
        { id: 3, text: '변화가 없다', isCorrect: false, feedback: '환율 변화는 수출입에 큰 영향을 미칩니다.' }
      ],
      correctAnswer: 1,
      explanation: '원화 약세로 한국 상품의 가격이 외국인 입장에서 내려가므로 수출이 증가합니다.',
      hint: '외국인 입장에서 한국 상품의 가격이 어떻게 변할까요?'
    },
    learningTheory: 'Testing Effect: 환율 효과 이해도 평가'
  },
  {
    id: 'screen-6-4',
    unitId: 'unit-6',
    type: 'concept2',
    order: 4,
    title: '국제 무역과 비교 우위',
    content: {
      mainText: '📚 비교 우위란?',
      definition: '한 국가가 다른 국가보다 상대적으로 더 효율적으로 생산할 수 있는 상품',
      characteristics: [
        '절대 우위: 더 적은 비용으로 생산',
        '비교 우위: 상대적으로 더 낮은 기회비용으로 생산',
        '국제 무역은 비교 우위에 따라 이루어짐'
      ],
      examples: [
        {
          scenario: '한국과 미국의 무역',
          explanation: '한국은 반도체, 미국은 곡물에 비교 우위를 가짐',
          numericalExample: '한국이 반도체를 미국에 수출, 미국이 곡물을 한국에 수출'
        }
      ],
      graphDescription: '국가별 생산 가능 곡선을 비교하는 그래프',
      animationDetails: '비교 우위 상품 교환의 이득을 시각화'
    },
    learningTheory: 'Interleaving: 환율과 무역의 연관성'
  },
  {
    id: 'screen-6-5',
    unitId: 'unit-6',
    type: 'outro',
    order: 5,
    title: '퀴즈 2 & 실생활 전이',
    content: {
      mainText: '🎓 오늘 배운 것을 적용해보기',
      question: '한국이 반도체 수출을 늘리려면 어떤 환율이 유리할까요?',
      graphDescription: '환율 변화에 따른 수출량 변화',
      transferQuestion: '글로벌 경제 위기가 한국 경제에 미치는 영향은?',
      reflectionPoints: [
        '환율이 오르면 수입품 가격은?',
        '국제 무역이 없다면 어떻게 될까?',
        '보호무역주의의 문제점은?',
        '글로벌 공급망의 중요성은?'
      ]
    },
    learningTheory: 'Gagné 전이: 글로벌 경제 이해'
  }
];

const _unit6Problems: Problem[] = [
  {
    id: 'problem-6-1',
    unitId: 'unit-6',
    type: 'multiple-choice',
    difficulty: 1,
    question: '원화 강세(환율 하락)는 한국 수입에 어떤 영향을 미칠까요?',
    options: [
      { id: 1, text: '수입이 증가한다', isCorrect: true, feedback: '✅ 정답입니다! 원화 강세로 외국 상품이 더 싸져서 수입이 증가합니다.' },
      { id: 2, text: '수입이 감소한다', isCorrect: false, feedback: '원화 강세는 수입에 유리합니다.' },
      { id: 3, text: '변화가 없다', isCorrect: false, feedback: '환율 변화는 수입에 영향을 미칩니다.' }
    ],
    explanation: '원화 강세로 외국 상품의 가격이 내려가므로 수입이 증가합니다.',
    hint: '한국인 입장에서 외국 상품의 가격이 어떻게 변할까요?',
    category: 'new',
    easeFactorSM2: 2.5,
    timesReviewed: 0
  },
  {
    id: 'problem-6-2',
    unitId: 'unit-6',
    type: 'multiple-choice',
    difficulty: 1,
    question: '국제 무역이 이루어지는 기본 원리는?',
    options: [
      { id: 1, text: '절대 우위', isCorrect: false, feedback: '절대 우위도 중요하지만 비교 우위가 더 중요합니다.' },
      { id: 2, text: '비교 우위', isCorrect: true, feedback: '✅ 정답입니다! 비교 우위에 따라 무역이 이루어집니다.' },
      { id: 3, text: '정부 정책', isCorrect: false, feedback: '정부 정책도 영향을 미치지만 기본 원리는 비교 우위입니다.' }
    ],
    explanation: '국가는 비교 우위가 있는 상품을 생산하고 수출합니다.',
    hint: '리카르도의 비교 우위 이론을 생각해보세요.',
    category: 'new',
    easeFactorSM2: 2.5,
    timesReviewed: 0
  },
  {
    id: 'problem-6-3',
    unitId: 'unit-6',
    type: 'calculation',
    difficulty: 2,
    question: '1달러 = 1,000원일 때 미국 상품 가격이 100달러입니다. 환율이 1,200원으로 올라가면 한국인 입장에서 가격은?',
    explanation: '환율 상승 후 가격 = 100달러 × 1,200원 = 120,000원. 기존 가격 100,000원에서 20% 상승',
    hint: '환율 변화에 따른 상품 가격 변화를 계산해보세요.',
    category: 'review',
    easeFactorSM2: 2.1,
    timesReviewed: 0
  },
  {
    id: 'problem-6-4',
    unitId: 'unit-6',
    type: 'fill-blank',
    difficulty: 2,
    question: '한 국가의 통화를 다른 국가의 통화로 환전할 때의 교환 비율을 _____ 이라고 합니다.',
    explanation: '환율입니다. 국제 무역과 투자에 중요한 역할을 합니다.',
    hint: '달러와 원화의 교환 비율은?',
    category: 'review',
    easeFactorSM2: 2.0,
    timesReviewed: 0
  },
  {
    id: 'problem-6-5',
    unitId: 'unit-6',
    type: 'essay',
    difficulty: 3,
    question: '한국이 반도체에 비교 우위를 가지고 미국이 곡물에 비교 우위를 가진다면, 국제 무역을 통해 어떤 이득을 얻을까요?',
    explanation: '한국은 반도체 생산에 집중하고 미국은 곡물 생산에 집중하여 전체 생산량을 증가시킬 수 있습니다. 이를 통해 양국 모두 더 많은 상품을 소비할 수 있습니다.',
    hint: '비교 우위에 따른 특화와 무역의 이득을 생각해보세요.',
    category: 'review',
    easeFactorSM2: 1.8,
    timesReviewed: 0
  },
  {
    id: 'problem-6-6',
    unitId: 'unit-6',
    type: 'drag-drop',
    difficulty: 2,
    question: '환율 상승, 환율 하락 중에서 한국 수출에 유리한 것을 선택하세요.',
    explanation: '환율 상승(원화 약세)이 한국 수출에 유리합니다. 한국 상품이 외국인 입장에서 더 싸지기 때문입니다.',
    hint: '한국 상품의 가격이 외국인 입장에서 내려가는 경우는?',
    category: 'review',
    easeFactorSM2: 2.1,
    timesReviewed: 0
  }
];

Object.assign(unit6Screens, _unit6Screens);
Object.assign(unit6Problems, _unit6Problems);

// Update curriculum with Unit 2 data
curriculum[1].screens = unit2Screens;
curriculum[1].problems = unit2Problems;

// ============= 학습 세션 구성 (SM-2 + Interleaving) =============

export interface LearningSession {
  sessionId: string;
  unitId: string;
  problems: Problem[];
  duration: number; // 분 단위
  order: number;
}

/**
 * SM-2 알고리즘 + Interleaving 규칙
 * 신규 개념 40% + 복습 개념 60%
 * 세션 내 문제 순서: 신규 → 복습 → 신규 → 복습 → 복습
 */
export const unit2Sessions: LearningSession[] = [
  {
    sessionId: 'session-2-1',
    unitId: 'unit-2',
    problems: [
      unit2Problems[0], // 신규: 수요 곡선 특징
      unit2Problems[2], // 복습: 수요 곡선 빈칸
      unit2Problems[1]  // 신규: 공급 곡선 특징
    ],
    duration: 5,
    order: 1
  },
  {
    sessionId: 'session-2-2',
    unitId: 'unit-2',
    problems: [
      unit2Problems[3], // 복습: 균형점 드래그
      unit2Problems[4], // 복습: 계산형
      unit2Problems[5]  // 복습: 서술형
    ],
    duration: 5,
    order: 2
  }
];

// ============= 동기부여 시스템 =============

export interface RewardSystem {
  xpPerProblem: {
    new: number;
    review: number;
  };
  xpBonus: {
    sessionComplete: number;
    unitComplete: number;
    streakBonus: number; // 연속 학습일 × 10
  };
  streakThresholds: {
    [key: number]: string; // 일수별 배지
  };
}

export const rewardSystem: RewardSystem = {
  xpPerProblem: {
    new: 10,
    review: 5
  },
  xpBonus: {
    sessionComplete: 20,
    unitComplete: 100,
    streakBonus: 10
  },
  streakThresholds: {
    1: '🔥 시작',
    3: '🔥🔥 3일 연속',
    7: '🔥🔥🔥 1주일',
    30: '🏆 1개월 마스터',
    100: '👑 경제 전문가'
  }
};
