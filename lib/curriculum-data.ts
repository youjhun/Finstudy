/**
 * FinStudy 학습 과학 기반 커리큘럼 데이터
 * 
 * 6개 과목 체계:
 * 1. 거시경제 - GDP, 인플레이션, 통화정책, 재정정책, 환율
 * 2. 금융상품 - 예적금, 채권, 주식, 펀드, ETF
 * 3. 투자이론 - 포트폴리오, CAPM, 효율적 시장, 행동재무학
 * 4. 세금/법규 - 소득세, 양도세, 금융소비자보호법, 자본시장법
 * 5. 파생상품 - 선물, 옵션, 스왑, 헤지전략
 * 6. 보험설계 - 생명보험, 손해보험, 연금, 리스크관리
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

// ============= 과목(Subject) 정의 =============

export interface Subject {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  units: Unit[];
  totalEstimatedHours: number;
}

// ============= 단위 정의 =============

export interface Unit {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  order: number;
  prerequisiteUnitId?: string;
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
  learningTheory: string;
}

export interface ScreenContent {
  mainText: string;
  subText?: string;
  realWorldQuestion?: string;
  coreStatement?: string;
  choices?: string[];
  definition?: string;
  characteristics?: string[];
  examples?: Array<{
    scenario: string;
    explanation: string;
    numericalExample: string;
  }>;
  graphDescription?: string;
  animationDetails?: string;
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
  condition: string;
}

// ============= 6개 과목 커리큘럼 =============

export const subjects: Subject[] = [
  {
    id: 'macro-economics',
    title: '거시경제',
    description: 'GDP, 인플레이션, 통화정책, 재정정책, 환율의 원리를 이해합니다.',
    icon: '🌍',
    color: '#2563EB',
    order: 1,
    totalEstimatedHours: 8,
    units: [
      {
        id: 'macro-1',
        subjectId: 'macro-economics',
        title: 'GDP와 경제성장',
        description: '국내총생산의 개념과 경제성장률 측정 방법을 학습합니다.',
        order: 1,
        estimatedTime: 20,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-macro-1', name: 'GDP 분석가', description: 'GDP 유닛 완료', icon: '📊', condition: 'macro-1 완료' }]
      },
      {
        id: 'macro-2',
        subjectId: 'macro-economics',
        title: '인플레이션과 물가',
        description: '소비자물가지수, 인플레이션의 원인과 영향을 이해합니다.',
        order: 2,
        prerequisiteUnitId: 'macro-1',
        estimatedTime: 20,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-macro-2', name: '물가 전문가', description: '인플레이션 유닛 완료', icon: '📈', condition: 'macro-2 완료' }]
      },
      {
        id: 'macro-3',
        subjectId: 'macro-economics',
        title: '통화정책과 중앙은행',
        description: '기준금리, 공개시장조작, 지급준비율 등 통화정책 수단을 학습합니다.',
        order: 3,
        prerequisiteUnitId: 'macro-2',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-macro-3', name: '통화정책 마스터', description: '통화정책 유닛 완료', icon: '🏦', condition: 'macro-3 완료' }]
      },
      {
        id: 'macro-4',
        subjectId: 'macro-economics',
        title: '재정정책과 정부 역할',
        description: '정부 지출, 조세정책, 재정승수 효과를 이해합니다.',
        order: 4,
        prerequisiteUnitId: 'macro-3',
        estimatedTime: 20,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-macro-4', name: '재정 분석가', description: '재정정책 유닛 완료', icon: '🏛️', condition: 'macro-4 완료' }]
      },
      {
        id: 'macro-5',
        subjectId: 'macro-economics',
        title: '환율과 국제경제',
        description: '환율 결정 이론, 국제수지, 무역수지를 학습합니다.',
        order: 5,
        prerequisiteUnitId: 'macro-4',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-macro-5', name: '글로벌 이코노미스트', description: '환율 유닛 완료', icon: '🌐', condition: 'macro-5 완료' }]
      },
      {
        id: 'macro-6',
        subjectId: 'macro-economics',
        title: '경기변동과 경제위기',
        description: '경기순환, 경기선행지수, 금융위기의 메커니즘을 이해합니다.',
        order: 6,
        prerequisiteUnitId: 'macro-5',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-macro-6', name: '경기 예측가', description: '경기변동 유닛 완료', icon: '🔄', condition: 'macro-6 완료' }]
      }
    ]
  },
  {
    id: 'financial-products',
    title: '금융상품',
    description: '예적금, 채권, 주식, 펀드, ETF 등 주요 금융상품의 특성과 수익구조를 학습합니다.',
    icon: '💰',
    color: '#059669',
    order: 2,
    totalEstimatedHours: 10,
    units: [
      {
        id: 'fp-1',
        subjectId: 'financial-products',
        title: '예금과 적금',
        description: '단리·복리 계산, 예금자보호제도, 금리 비교 방법을 학습합니다.',
        order: 1,
        estimatedTime: 15,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-fp-1', name: '저축 전문가', description: '예적금 유닛 완료', icon: '🏧', condition: 'fp-1 완료' }]
      },
      {
        id: 'fp-2',
        subjectId: 'financial-products',
        title: '채권의 이해',
        description: '채권 가격과 수익률의 관계, 듀레이션, 신용등급을 이해합니다.',
        order: 2,
        prerequisiteUnitId: 'fp-1',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-fp-2', name: '채권 분석가', description: '채권 유닛 완료', icon: '📜', condition: 'fp-2 완료' }]
      },
      {
        id: 'fp-3',
        subjectId: 'financial-products',
        title: '주식 투자 기초',
        description: 'PER, PBR, ROE 등 주요 지표와 주식 분석 방법을 학습합니다.',
        order: 3,
        prerequisiteUnitId: 'fp-2',
        estimatedTime: 30,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-fp-3', name: '주식 분석가', description: '주식 유닛 완료', icon: '📈', condition: 'fp-3 완료' }]
      },
      {
        id: 'fp-4',
        subjectId: 'financial-products',
        title: '펀드와 집합투자',
        description: '펀드 유형, 보수체계, 벤치마크, 샤프비율을 이해합니다.',
        order: 4,
        prerequisiteUnitId: 'fp-3',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-fp-4', name: '펀드 매니저', description: '펀드 유닛 완료', icon: '📦', condition: 'fp-4 완료' }]
      },
      {
        id: 'fp-5',
        subjectId: 'financial-products',
        title: 'ETF와 인덱스 투자',
        description: 'ETF 구조, 추적오차, 패시브 vs 액티브 전략을 학습합니다.',
        order: 5,
        prerequisiteUnitId: 'fp-4',
        estimatedTime: 20,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-fp-5', name: 'ETF 전문가', description: 'ETF 유닛 완료', icon: '🎯', condition: 'fp-5 완료' }]
      },
      {
        id: 'fp-6',
        subjectId: 'financial-products',
        title: '대안투자와 구조화상품',
        description: 'ELS, DLS, 부동산 펀드, 인프라 펀드의 구조를 이해합니다.',
        order: 6,
        prerequisiteUnitId: 'fp-5',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-fp-6', name: '대안투자 전문가', description: '대안투자 유닛 완료', icon: '🏢', condition: 'fp-6 완료' }]
      }
    ]
  },
  {
    id: 'investment-theory',
    title: '투자이론',
    description: '포트폴리오 이론, CAPM, 효율적 시장 가설, 행동재무학을 학습합니다.',
    icon: '📐',
    color: '#7C3AED',
    order: 3,
    totalEstimatedHours: 12,
    units: [
      {
        id: 'inv-1',
        subjectId: 'investment-theory',
        title: '위험과 수익률',
        description: '표준편차, 분산, 기대수익률, 위험 프리미엄의 개념을 학습합니다.',
        order: 1,
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-inv-1', name: '리스크 분석가', description: '위험·수익률 유닛 완료', icon: '⚖️', condition: 'inv-1 완료' }]
      },
      {
        id: 'inv-2',
        subjectId: 'investment-theory',
        title: '포트폴리오 이론',
        description: '마코위츠 모형, 효율적 프론티어, 분산투자 효과를 이해합니다.',
        order: 2,
        prerequisiteUnitId: 'inv-1',
        estimatedTime: 30,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-inv-2', name: '포트폴리오 설계자', description: '포트폴리오 유닛 완료', icon: '🧩', condition: 'inv-2 완료' }]
      },
      {
        id: 'inv-3',
        subjectId: 'investment-theory',
        title: 'CAPM과 베타',
        description: '자본자산가격결정모형, 체계적 위험, SML을 학습합니다.',
        order: 3,
        prerequisiteUnitId: 'inv-2',
        estimatedTime: 30,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-inv-3', name: 'CAPM 마스터', description: 'CAPM 유닛 완료', icon: '📏', condition: 'inv-3 완료' }]
      },
      {
        id: 'inv-4',
        subjectId: 'investment-theory',
        title: '효율적 시장 가설',
        description: '약형·준강형·강형 효율성, 시장 이상현상을 이해합니다.',
        order: 4,
        prerequisiteUnitId: 'inv-3',
        estimatedTime: 20,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-inv-4', name: '시장 효율성 전문가', description: 'EMH 유닛 완료', icon: '🎲', condition: 'inv-4 완료' }]
      },
      {
        id: 'inv-5',
        subjectId: 'investment-theory',
        title: '행동재무학',
        description: '인지편향, 전망이론, 군집행동, 과잉확신을 학습합니다.',
        order: 5,
        prerequisiteUnitId: 'inv-4',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-inv-5', name: '행동재무 분석가', description: '행동재무학 유닛 완료', icon: '🧠', condition: 'inv-5 완료' }]
      }
    ]
  },
  {
    id: 'tax-regulation',
    title: '세금/법규',
    description: '소득세, 양도세, 금융소비자보호법, 자본시장법 등 금융 관련 법규를 학습합니다.',
    icon: '⚖️',
    color: '#DC2626',
    order: 4,
    totalEstimatedHours: 8,
    units: [
      {
        id: 'tax-1',
        subjectId: 'tax-regulation',
        title: '금융소득과 소득세',
        description: '이자소득, 배당소득, 금융소득종합과세를 이해합니다.',
        order: 1,
        estimatedTime: 20,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-tax-1', name: '세금 기초 마스터', description: '소득세 유닛 완료', icon: '💸', condition: 'tax-1 완료' }]
      },
      {
        id: 'tax-2',
        subjectId: 'tax-regulation',
        title: '양도소득세와 증여세',
        description: '주식·부동산 양도세, 증여세 계산법, 절세 전략을 학습합니다.',
        order: 2,
        prerequisiteUnitId: 'tax-1',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-tax-2', name: '양도세 전문가', description: '양도세 유닛 완료', icon: '🏠', condition: 'tax-2 완료' }]
      },
      {
        id: 'tax-3',
        subjectId: 'tax-regulation',
        title: '금융소비자보호법',
        description: '적합성 원칙, 적정성 원칙, 설명의무, 불공정영업행위를 이해합니다.',
        order: 3,
        prerequisiteUnitId: 'tax-2',
        estimatedTime: 20,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-tax-3', name: '소비자보호 전문가', description: '금소법 유닛 완료', icon: '🛡️', condition: 'tax-3 완료' }]
      },
      {
        id: 'tax-4',
        subjectId: 'tax-regulation',
        title: '자본시장법',
        description: '증권의 정의, 금융투자업 인가, 불공정거래 규제를 학습합니다.',
        order: 4,
        prerequisiteUnitId: 'tax-3',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-tax-4', name: '자본시장법 마스터', description: '자본시장법 유닛 완료', icon: '📋', condition: 'tax-4 완료' }]
      },
      {
        id: 'tax-5',
        subjectId: 'tax-regulation',
        title: '절세 전략과 세금 신고',
        description: 'ISA, 연금저축, IRP 등 절세 상품과 세금 신고 방법을 학습합니다.',
        order: 5,
        prerequisiteUnitId: 'tax-4',
        estimatedTime: 20,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-tax-5', name: '절세 플래너', description: '절세 유닛 완료', icon: '💎', condition: 'tax-5 완료' }]
      }
    ]
  },
  {
    id: 'derivatives',
    title: '파생상품',
    description: '선물, 옵션, 스왑의 구조와 가격결정, 헤지 전략을 학습합니다.',
    icon: '🔄',
    color: '#EA580C',
    order: 5,
    totalEstimatedHours: 10,
    units: [
      {
        id: 'der-1',
        subjectId: 'derivatives',
        title: '파생상품 기초',
        description: '파생상품의 정의, 종류, 기초자산, 레버리지 효과를 이해합니다.',
        order: 1,
        estimatedTime: 20,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-der-1', name: '파생상품 입문', description: '파생 기초 유닛 완료', icon: '🔰', condition: 'der-1 완료' }]
      },
      {
        id: 'der-2',
        subjectId: 'derivatives',
        title: '선물(Futures)',
        description: '선물 계약 구조, 증거금, 일일정산, 베이시스를 학습합니다.',
        order: 2,
        prerequisiteUnitId: 'der-1',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-der-2', name: '선물 트레이더', description: '선물 유닛 완료', icon: '📅', condition: 'der-2 완료' }]
      },
      {
        id: 'der-3',
        subjectId: 'derivatives',
        title: '옵션(Options)',
        description: '콜·풋 옵션, 내재가치·시간가치, 그릭스(Delta, Gamma)를 이해합니다.',
        order: 3,
        prerequisiteUnitId: 'der-2',
        estimatedTime: 30,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-der-3', name: '옵션 전문가', description: '옵션 유닛 완료', icon: '🎰', condition: 'der-3 완료' }]
      },
      {
        id: 'der-4',
        subjectId: 'derivatives',
        title: '스왑(Swaps)',
        description: '금리스왑, 통화스왑, CDS의 구조와 활용을 학습합니다.',
        order: 4,
        prerequisiteUnitId: 'der-3',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-der-4', name: '스왑 분석가', description: '스왑 유닛 완료', icon: '🔁', condition: 'der-4 완료' }]
      },
      {
        id: 'der-5',
        subjectId: 'derivatives',
        title: '헤지 전략',
        description: '델타 헤지, 포트폴리오 보험, 칼라 전략을 이해합니다.',
        order: 5,
        prerequisiteUnitId: 'der-4',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-der-5', name: '헤지 마스터', description: '헤지 유닛 완료', icon: '🛡️', condition: 'der-5 완료' }]
      }
    ]
  },
  {
    id: 'insurance-planning',
    title: '보험설계',
    description: '생명보험, 손해보험, 연금, 리스크 관리의 원리와 설계 방법을 학습합니다.',
    icon: '🏥',
    color: '#0891B2',
    order: 6,
    totalEstimatedHours: 8,
    units: [
      {
        id: 'ins-1',
        subjectId: 'insurance-planning',
        title: '보험의 기초 원리',
        description: '대수의 법칙, 수지상등 원칙, 보험료 구성을 이해합니다.',
        order: 1,
        estimatedTime: 20,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-ins-1', name: '보험 기초 마스터', description: '보험 기초 유닛 완료', icon: '📖', condition: 'ins-1 완료' }]
      },
      {
        id: 'ins-2',
        subjectId: 'insurance-planning',
        title: '생명보험',
        description: '종신보험, 정기보험, 변액보험, 유니버셜보험을 학습합니다.',
        order: 2,
        prerequisiteUnitId: 'ins-1',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-ins-2', name: '생명보험 설계사', description: '생명보험 유닛 완료', icon: '❤️', condition: 'ins-2 완료' }]
      },
      {
        id: 'ins-3',
        subjectId: 'insurance-planning',
        title: '손해보험',
        description: '자동차보험, 화재보험, 배상책임보험의 구조를 이해합니다.',
        order: 3,
        prerequisiteUnitId: 'ins-2',
        estimatedTime: 20,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-ins-3', name: '손해보험 전문가', description: '손해보험 유닛 완료', icon: '🚗', condition: 'ins-3 완료' }]
      },
      {
        id: 'ins-4',
        subjectId: 'insurance-planning',
        title: '연금과 퇴직설계',
        description: '국민연금, 퇴직연금(DB/DC/IRP), 개인연금을 학습합니다.',
        order: 4,
        prerequisiteUnitId: 'ins-3',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-ins-4', name: '연금 플래너', description: '연금 유닛 완료', icon: '🧓', condition: 'ins-4 완료' }]
      },
      {
        id: 'ins-5',
        subjectId: 'insurance-planning',
        title: '리스크 관리와 보험설계',
        description: '위험 분석, 보장 설계, 보험 포트폴리오 구성을 이해합니다.',
        order: 5,
        prerequisiteUnitId: 'ins-4',
        estimatedTime: 25,
        screens: [],
        problems: [],
        badges: [{ id: 'badge-ins-5', name: '리스크 매니저', description: '리스크 관리 유닛 완료', icon: '🎯', condition: 'ins-5 완료' }]
      }
    ]
  }
];

// ============= 과목별 문제 데이터 =============

export function getSubjectProblems(subjectId: string): Problem[] {
  const problemSets: Record<string, Problem[]> = {
    'macro-economics': macroProblems,
    'financial-products': financialProductProblems,
    'investment-theory': investmentTheoryProblems,
    'tax-regulation': taxRegulationProblems,
    'derivatives': derivativesProblems,
    'insurance-planning': insurancePlanningProblems,
  };
  return problemSets[subjectId] || [];
}

export function getUnitProblems(unitId: string): Problem[] {
  const allProblems = [
    ...macroProblems,
    ...financialProductProblems,
    ...investmentTheoryProblems,
    ...taxRegulationProblems,
    ...derivativesProblems,
    ...insurancePlanningProblems,
  ];
  return allProblems.filter(p => p.unitId === unitId);
}

// ============= 거시경제 문제 =============

const macroProblems: Problem[] = [
  // Unit: GDP와 경제성장
  { id: 'macro-p1', unitId: 'macro-1', type: 'multiple-choice', difficulty: 1, question: 'GDP(국내총생산)에 포함되지 않는 것은?', options: [{ id: 1, text: '자동차 공장의 신차 생산', isCorrect: false, feedback: '신차 생산은 최종재로 GDP에 포함됩니다.' }, { id: 2, text: '주부의 가사노동', isCorrect: true, feedback: '정답! 시장에서 거래되지 않는 가사노동은 GDP에 포함되지 않습니다.' }, { id: 3, text: '변호사의 법률 서비스', isCorrect: false, feedback: '서비스업도 GDP에 포함됩니다.' }, { id: 4, text: '정부의 국방비 지출', isCorrect: false, feedback: '정부 지출(G)은 GDP 구성요소입니다.' }], explanation: 'GDP는 시장에서 거래되는 최종 재화와 서비스의 가치만 포함합니다. 가사노동, 자원봉사 등은 시장 거래가 아니므로 제외됩니다.', hint: 'GDP = C + I + G + (X-M)에서 시장 거래만 포함', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'macro-p2', unitId: 'macro-1', type: 'multiple-choice', difficulty: 1, question: '명목 GDP와 실질 GDP의 차이점으로 올바른 것은?', options: [{ id: 1, text: '명목 GDP는 물가 변동을 반영하지 않는다', isCorrect: true, feedback: '정답! 명목 GDP는 당해년도 가격으로, 실질 GDP는 기준년도 가격으로 계산합니다.' }, { id: 2, text: '실질 GDP가 항상 명목 GDP보다 크다', isCorrect: false, feedback: '디플레이션 시에는 실질 GDP가 더 클 수 있지만, 항상 그런 것은 아닙니다.' }, { id: 3, text: '명목 GDP만 경제성장률 계산에 사용된다', isCorrect: false, feedback: '경제성장률은 실질 GDP 변화율로 계산합니다.' }, { id: 4, text: '두 지표는 항상 같은 값이다', isCorrect: false, feedback: '물가 변동이 있으면 두 값은 달라집니다.' }], explanation: '명목 GDP는 현재 시장 가격으로 계산하여 물가 상승분이 포함됩니다. 실질 GDP는 기준년도 가격으로 계산하여 순수한 생산량 변화만 반영합니다.', hint: '물가 변동의 영향을 제거한 것이 실질 GDP', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'macro-p3', unitId: 'macro-1', type: 'multiple-choice', difficulty: 2, question: 'GDP 디플레이터가 120이라면 이는 무엇을 의미하는가?', options: [{ id: 1, text: '기준년도 대비 물가가 20% 상승했다', isCorrect: true, feedback: '정답! GDP 디플레이터 = (명목GDP/실질GDP) × 100이므로, 120은 20% 물가 상승을 의미합니다.' }, { id: 2, text: '경제가 20% 성장했다', isCorrect: false, feedback: '경제성장률은 실질 GDP 변화율로 측정합니다.' }, { id: 3, text: '실업률이 20%이다', isCorrect: false, feedback: 'GDP 디플레이터는 물가 수준을 나타냅니다.' }, { id: 4, text: '수출이 20% 증가했다', isCorrect: false, feedback: 'GDP 디플레이터는 전반적 물가 수준 지표입니다.' }], explanation: 'GDP 디플레이터 = (명목GDP ÷ 실질GDP) × 100. 100을 초과하면 기준년도 대비 물가가 상승한 것입니다.', hint: 'GDP 디플레이터는 물가 수준을 나타내는 지표', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  // Unit: 인플레이션과 물가
  { id: 'macro-p4', unitId: 'macro-2', type: 'multiple-choice', difficulty: 1, question: '비용인상 인플레이션의 원인으로 적절한 것은?', options: [{ id: 1, text: '정부의 재정지출 확대', isCorrect: false, feedback: '이는 수요견인 인플레이션의 원인입니다.' }, { id: 2, text: '원유 가격의 급등', isCorrect: true, feedback: '정답! 원자재 가격 상승은 생산비용을 높여 비용인상 인플레이션을 유발합니다.' }, { id: 3, text: '소비자 신뢰지수 상승', isCorrect: false, feedback: '소비 증가는 수요 측면의 요인입니다.' }, { id: 4, text: '중앙은행의 금리 인하', isCorrect: false, feedback: '금리 인하는 수요를 자극하는 통화정책입니다.' }], explanation: '비용인상 인플레이션은 원자재 가격 상승, 임금 인상 등 공급 측 비용 증가로 발생합니다. 1970년대 오일쇼크가 대표적 사례입니다.', hint: '공급 측면에서 생산비용이 증가하는 경우', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'macro-p5', unitId: 'macro-2', type: 'multiple-choice', difficulty: 2, question: '필립스 곡선이 설명하는 관계는?', options: [{ id: 1, text: '인플레이션과 실업률의 역의 관계', isCorrect: true, feedback: '정답! 단기 필립스 곡선은 인플레이션율과 실업률이 반비례 관계임을 보여줍니다.' }, { id: 2, text: 'GDP와 실업률의 정의 관계', isCorrect: false, feedback: '이는 오쿤의 법칙에 해당합니다.' }, { id: 3, text: '금리와 투자의 역의 관계', isCorrect: false, feedback: '이는 IS 곡선이 설명하는 관계입니다.' }, { id: 4, text: '환율과 수출의 정의 관계', isCorrect: false, feedback: '이는 마셜-러너 조건과 관련됩니다.' }], explanation: '필립스 곡선은 단기적으로 인플레이션율이 높으면 실업률이 낮고, 인플레이션율이 낮으면 실업률이 높은 트레이드오프 관계를 보여줍니다.', hint: '물가와 고용 사이의 단기적 상충관계', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  // Unit: 통화정책과 중앙은행
  { id: 'macro-p6', unitId: 'macro-3', type: 'multiple-choice', difficulty: 1, question: '한국은행이 기준금리를 인상하면 일반적으로 나타나는 효과는?', options: [{ id: 1, text: '시중 유동성 감소와 물가 안정', isCorrect: true, feedback: '정답! 금리 인상은 대출 비용을 높여 유동성을 줄이고 물가를 안정시킵니다.' }, { id: 2, text: '기업 투자 증가', isCorrect: false, feedback: '금리 인상은 차입 비용을 높여 투자를 위축시킵니다.' }, { id: 3, text: '원화 가치 하락', isCorrect: false, feedback: '금리 인상은 외국 자본 유입을 촉진하여 원화 가치를 상승시킵니다.' }, { id: 4, text: '주택 가격 상승', isCorrect: false, feedback: '금리 인상은 대출 부담을 높여 주택 수요를 감소시킵니다.' }], explanation: '기준금리 인상 → 시중금리 상승 → 대출 감소 → 유동성 축소 → 총수요 감소 → 물가 안정의 경로로 작용합니다.', hint: '긴축적 통화정책의 효과를 생각해보세요', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'macro-p7', unitId: 'macro-3', type: 'multiple-choice', difficulty: 2, question: '공개시장조작에서 중앙은행이 국채를 매입하면?', options: [{ id: 1, text: '본원통화가 증가한다', isCorrect: true, feedback: '정답! 중앙은행이 국채를 사면 그 대금이 시중에 풀려 본원통화가 증가합니다.' }, { id: 2, text: '시중 금리가 상승한다', isCorrect: false, feedback: '국채 매입은 유동성을 공급하여 금리를 하락시킵니다.' }, { id: 3, text: '지급준비율이 높아진다', isCorrect: false, feedback: '지급준비율은 별도의 정책 수단입니다.' }, { id: 4, text: '은행의 대출 능력이 감소한다', isCorrect: false, feedback: '유동성 공급으로 은행의 대출 여력이 증가합니다.' }], explanation: '중앙은행 국채 매입 → 대금 지급(화폐 공급) → 본원통화 증가 → 통화승수 효과로 통화량 확대', hint: '중앙은행이 돈을 주고 국채를 사는 것', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  // Unit: 재정정책
  { id: 'macro-p8', unitId: 'macro-4', type: 'multiple-choice', difficulty: 1, question: '재정승수가 2일 때, 정부지출이 100조원 증가하면 GDP는 얼마나 증가하는가?', options: [{ id: 1, text: '100조원', isCorrect: false, feedback: '승수효과를 고려해야 합니다.' }, { id: 2, text: '200조원', isCorrect: true, feedback: '정답! 재정승수 × 정부지출 증가분 = 2 × 100 = 200조원' }, { id: 3, text: '50조원', isCorrect: false, feedback: '승수가 2이면 지출의 2배만큼 GDP가 증가합니다.' }, { id: 4, text: '150조원', isCorrect: false, feedback: '승수 × 지출 증가분으로 계산합니다.' }], explanation: 'GDP 증가분 = 재정승수 × 정부지출 증가분. 승수효과는 한 사람의 지출이 다른 사람의 소득이 되어 연쇄적으로 소비를 유발하기 때문에 발생합니다.', hint: '승수 = 1/(1-한계소비성향)', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  // Unit: 환율과 국제경제
  { id: 'macro-p9', unitId: 'macro-5', type: 'multiple-choice', difficulty: 1, question: '원/달러 환율이 1,200원에서 1,300원으로 상승했을 때의 효과는?', options: [{ id: 1, text: '수출 기업의 가격 경쟁력 향상', isCorrect: true, feedback: '정답! 원화 약세는 달러 표시 수출 가격을 낮춰 가격 경쟁력을 높입니다.' }, { id: 2, text: '수입 물가 하락', isCorrect: false, feedback: '원화 약세는 수입 물가를 상승시킵니다.' }, { id: 3, text: '해외여행 비용 감소', isCorrect: false, feedback: '원화 약세는 해외 지출 비용을 증가시킵니다.' }, { id: 4, text: '외채 상환 부담 감소', isCorrect: false, feedback: '원화 약세는 달러 표시 외채의 원화 환산 부담을 증가시킵니다.' }], explanation: '환율 상승(원화 약세) → 수출품의 달러 표시 가격 하락 → 수출 경쟁력 향상. 반면 수입 물가 상승, 외채 부담 증가 등의 부작용도 있습니다.', hint: '환율 상승 = 원화 가치 하락 = 수출에 유리', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  // Unit: 경기변동
  { id: 'macro-p10', unitId: 'macro-6', type: 'multiple-choice', difficulty: 2, question: '경기선행지수에 포함되는 지표는?', options: [{ id: 1, text: '건축허가 건수', isCorrect: true, feedback: '정답! 건축허가는 향후 건설 투자를 예고하는 선행지표입니다.' }, { id: 2, text: '실업률', isCorrect: false, feedback: '실업률은 경기후행지표입니다.' }, { id: 3, text: '소비자물가지수', isCorrect: false, feedback: 'CPI는 경기후행지표입니다.' }, { id: 4, text: '산업생산지수', isCorrect: false, feedback: '산업생산지수는 경기동행지표입니다.' }], explanation: '경기선행지수: 건축허가, 재고순환, 주가지수, 장단기 금리차 등. 경기동행지수: 산업생산, 소매판매. 경기후행지수: 실업률, CPI.', hint: '미래 경기를 예측하는 데 사용되는 지표', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
];

// ============= 금융상품 문제 =============

const financialProductProblems: Problem[] = [
  { id: 'fp-p1', unitId: 'fp-1', type: 'multiple-choice', difficulty: 1, question: '연 이자율 5%, 원금 1,000만원을 2년간 복리로 예치할 때 만기 수령액은? (세전)', options: [{ id: 1, text: '1,100만원', isCorrect: false, feedback: '이는 2년 단리 계산입니다.' }, { id: 2, text: '1,102.5만원', isCorrect: true, feedback: '정답! 1,000 × (1.05)² = 1,102.5만원' }, { id: 3, text: '1,050만원', isCorrect: false, feedback: '이는 1년 이자만 계산한 것입니다.' }, { id: 4, text: '1,200만원', isCorrect: false, feedback: '연 이자율 5%의 2년 복리는 10%보다 약간 큽니다.' }], explanation: '복리: 원금 × (1 + 이자율)^기간 = 1,000 × 1.05² = 1,102.5만원. 단리(1,100만원)보다 2.5만원 더 많습니다.', hint: '복리 공식: P × (1+r)^n', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'fp-p2', unitId: 'fp-1', type: 'multiple-choice', difficulty: 1, question: '예금자보호제도에 대한 설명으로 올바른 것은?', options: [{ id: 1, text: '1인당 5,000만원까지 보호된다', isCorrect: true, feedback: '정답! 예금보험공사가 금융기관별 1인당 원금+이자 합계 5,000만원까지 보호합니다.' }, { id: 2, text: '모든 금융상품이 보호 대상이다', isCorrect: false, feedback: '주식, 채권, 펀드 등은 예금자보호 대상이 아닙니다.' }, { id: 3, text: '한 은행에 여러 계좌가 있으면 각각 보호된다', isCorrect: false, feedback: '같은 금융기관의 모든 예금을 합산하여 5,000만원까지 보호합니다.' }, { id: 4, text: '외화예금은 보호되지 않는다', isCorrect: false, feedback: '외화예금도 원화 환산 5,000만원까지 보호됩니다.' }], explanation: '예금자보호제도: 금융기관 파산 시 예금보험공사가 1인당 금융기관별 원금+이자 합계 5,000만원까지 보장합니다.', hint: '예금보험공사의 보호 한도를 생각해보세요', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'fp-p3', unitId: 'fp-2', type: 'multiple-choice', difficulty: 2, question: '시장 금리가 상승하면 기존 채권 가격은 어떻게 변하는가?', options: [{ id: 1, text: '하락한다', isCorrect: true, feedback: '정답! 금리 상승 시 새 채권이 더 높은 이자를 제공하므로 기존 채권의 매력이 감소하여 가격이 하락합니다.' }, { id: 2, text: '상승한다', isCorrect: false, feedback: '금리와 채권 가격은 역의 관계입니다.' }, { id: 3, text: '변하지 않는다', isCorrect: false, feedback: '금리 변동은 채권 가격에 직접적 영향을 미칩니다.' }, { id: 4, text: '만기에 따라 다르다', isCorrect: false, feedback: '방향은 항상 역의 관계이며, 만기가 길수록 변동폭이 큽니다.' }], explanation: '금리↑ → 새 채권 수익률↑ → 기존 채권 상대적 매력↓ → 기존 채권 가격↓. 이를 "금리 리스크"라 합니다.', hint: '금리와 채권 가격은 시소 관계', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'fp-p4', unitId: 'fp-2', type: 'multiple-choice', difficulty: 2, question: '듀레이션이 5년인 채권의 금리가 1% 상승하면 채권 가격은 약 얼마나 변하는가?', options: [{ id: 1, text: '약 5% 하락', isCorrect: true, feedback: '정답! 수정 듀레이션 ≈ 듀레이션이므로, 가격 변동률 ≈ -듀레이션 × 금리변동 = -5 × 1% = -5%' }, { id: 2, text: '약 1% 하락', isCorrect: false, feedback: '듀레이션 효과를 고려해야 합니다.' }, { id: 3, text: '약 10% 하락', isCorrect: false, feedback: '듀레이션 5년 × 금리변동 1% = 5%입니다.' }, { id: 4, text: '약 5% 상승', isCorrect: false, feedback: '금리 상승 시 채권 가격은 하락합니다.' }], explanation: '채권 가격 변동률 ≈ -수정듀레이션 × 금리변동. 듀레이션이 길수록 금리 변동에 민감합니다.', hint: '듀레이션은 금리 민감도의 척도', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'fp-p5', unitId: 'fp-3', type: 'multiple-choice', difficulty: 1, question: 'PER(주가수익비율)이 10배인 기업의 의미는?', options: [{ id: 1, text: '현재 주가가 주당순이익의 10배이다', isCorrect: true, feedback: '정답! PER = 주가 ÷ EPS. PER 10배는 현재 이익 수준으로 투자금 회수에 10년 걸린다는 의미입니다.' }, { id: 2, text: '매출이 10배 성장했다', isCorrect: false, feedback: 'PER은 주가와 이익의 비율입니다.' }, { id: 3, text: '부채가 자본의 10배이다', isCorrect: false, feedback: '이는 부채비율에 해당합니다.' }, { id: 4, text: '배당수익률이 10%이다', isCorrect: false, feedback: '배당수익률은 배당금/주가입니다.' }], explanation: 'PER = 주가 ÷ 주당순이익(EPS). 동종업계 평균 대비 PER이 낮으면 저평가, 높으면 고평가 가능성이 있습니다.', hint: '주가를 이익으로 나눈 비율', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'fp-p6', unitId: 'fp-3', type: 'multiple-choice', difficulty: 2, question: 'ROE가 15%이고 배당성향이 40%일 때, 지속가능성장률은?', options: [{ id: 1, text: '9%', isCorrect: true, feedback: '정답! 지속가능성장률 = ROE × (1-배당성향) = 15% × 0.6 = 9%' }, { id: 2, text: '6%', isCorrect: false, feedback: '15% × 0.4 = 6%는 배당으로 지급되는 부분입니다.' }, { id: 3, text: '15%', isCorrect: false, feedback: '유보율(1-배당성향)을 곱해야 합니다.' }, { id: 4, text: '21%', isCorrect: false, feedback: 'ROE와 유보율을 곱합니다.' }], explanation: '지속가능성장률 = ROE × 유보율 = ROE × (1 - 배당성향). 이익 중 재투자되는 부분만 성장에 기여합니다.', hint: 'g = ROE × b (b = 유보율)', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'fp-p7', unitId: 'fp-4', type: 'multiple-choice', difficulty: 1, question: '펀드의 총보수율(TER)에 포함되지 않는 것은?', options: [{ id: 1, text: '운용보수', isCorrect: false, feedback: '운용보수는 TER에 포함됩니다.' }, { id: 2, text: '판매보수', isCorrect: false, feedback: '판매보수는 TER에 포함됩니다.' }, { id: 3, text: '매매수수료(거래비용)', isCorrect: true, feedback: '정답! 매매수수료는 TER에 포함되지 않는 별도 비용입니다.' }, { id: 4, text: '수탁보수', isCorrect: false, feedback: '수탁보수는 TER에 포함됩니다.' }], explanation: 'TER = 운용보수 + 판매보수 + 수탁보수 + 사무관리보수. 매매수수료, 환매수수료 등은 별도입니다.', hint: 'TER은 연간 고정 비용만 포함', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'fp-p8', unitId: 'fp-5', type: 'multiple-choice', difficulty: 1, question: 'ETF와 일반 인덱스 펀드의 가장 큰 차이점은?', options: [{ id: 1, text: 'ETF는 주식처럼 실시간 거래가 가능하다', isCorrect: true, feedback: '정답! ETF는 거래소에 상장되어 주식처럼 실시간 매매가 가능합니다.' }, { id: 2, text: 'ETF는 분산투자가 불가능하다', isCorrect: false, feedback: 'ETF도 여러 종목에 분산투자합니다.' }, { id: 3, text: '인덱스 펀드가 더 낮은 보수를 가진다', isCorrect: false, feedback: '일반적으로 ETF의 보수가 더 낮습니다.' }, { id: 4, text: 'ETF는 배당을 지급하지 않는다', isCorrect: false, feedback: 'ETF도 배당(분배금)을 지급합니다.' }], explanation: 'ETF: 거래소 상장, 실시간 매매, 낮은 보수, 투명한 포트폴리오. 인덱스 펀드: 하루 1회 기준가 산출, 판매사 통해 환매.', hint: '거래 방식의 차이를 생각해보세요', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'fp-p9', unitId: 'fp-6', type: 'multiple-choice', difficulty: 2, question: 'ELS(주가연계증권)의 녹인(Knock-In) 조건이란?', options: [{ id: 1, text: '기초자산이 일정 수준 이하로 하락하면 원금 손실이 발생하는 조건', isCorrect: true, feedback: '정답! 녹인 배리어를 터치하면 원금보장 구조가 해제되어 손실 가능성이 생깁니다.' }, { id: 2, text: '수익률이 확정되는 조건', isCorrect: false, feedback: '이는 조기상환 조건에 해당합니다.' }, { id: 3, text: '만기가 연장되는 조건', isCorrect: false, feedback: '녹인은 원금 손실 가능성과 관련됩니다.' }, { id: 4, text: '추가 수익이 발생하는 조건', isCorrect: false, feedback: '녹인은 손실 위험을 나타내는 조건입니다.' }], explanation: '녹인(Knock-In): 기초자산 가격이 녹인 배리어(예: 최초가격의 50%) 이하로 하락하면, 만기 시 기초자산 하락률만큼 원금 손실 가능.', hint: '원금 손실이 시작되는 트리거 조건', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'fp-p10', unitId: 'fp-6', type: 'multiple-choice', difficulty: 2, question: '부동산 펀드(REITs)의 장점이 아닌 것은?', options: [{ id: 1, text: '소액으로 부동산 투자 가능', isCorrect: false, feedback: '이는 REITs의 대표적 장점입니다.' }, { id: 2, text: '높은 유동성', isCorrect: false, feedback: '상장 REITs는 주식처럼 거래 가능합니다.' }, { id: 3, text: '원금 보장', isCorrect: true, feedback: '정답! REITs는 부동산 가격 변동에 따라 원금 손실이 발생할 수 있습니다.' }, { id: 4, text: '정기적 배당 수익', isCorrect: false, feedback: 'REITs는 임대 수익의 90% 이상을 배당합니다.' }], explanation: 'REITs 장점: 소액투자, 유동성, 정기배당, 분산투자. 단점: 원금 비보장, 부동산 시장 리스크, 금리 민감도.', hint: '투자 상품은 원금 보장이 되지 않는 것이 일반적', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
];

// ============= 투자이론 문제 =============

const investmentTheoryProblems: Problem[] = [
  { id: 'inv-p1', unitId: 'inv-1', type: 'multiple-choice', difficulty: 1, question: '투자에서 체계적 위험(Systematic Risk)에 해당하는 것은?', options: [{ id: 1, text: '금리 변동 위험', isCorrect: true, feedback: '정답! 금리 변동은 시장 전체에 영향을 미치는 체계적 위험입니다.' }, { id: 2, text: '특정 기업의 파업', isCorrect: false, feedback: '이는 비체계적(개별) 위험입니다.' }, { id: 3, text: '경영진 교체', isCorrect: false, feedback: '이는 비체계적 위험입니다.' }, { id: 4, text: '제품 리콜', isCorrect: false, feedback: '이는 비체계적 위험입니다.' }], explanation: '체계적 위험: 시장 전체에 영향(금리, 인플레이션, 경기변동). 분산투자로 제거 불가. 비체계적 위험: 개별 기업 요인. 분산투자로 제거 가능.', hint: '시장 전체에 영향을 미치는 위험 vs 개별 기업 위험', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'inv-p2', unitId: 'inv-1', type: 'multiple-choice', difficulty: 2, question: '포트폴리오의 표준편차가 개별 자산 표준편차의 가중평균보다 작아지는 이유는?', options: [{ id: 1, text: '자산 간 상관계수가 1보다 작기 때문', isCorrect: true, feedback: '정답! 상관계수가 완전 양(+1)이 아니면 분산투자 효과로 위험이 감소합니다.' }, { id: 2, text: '레버리지 효과 때문', isCorrect: false, feedback: '레버리지는 위험을 증가시킵니다.' }, { id: 3, text: '거래비용이 줄어서', isCorrect: false, feedback: '거래비용은 위험 감소와 무관합니다.' }, { id: 4, text: '세금 혜택 때문', isCorrect: false, feedback: '세금은 분산투자 효과와 무관합니다.' }], explanation: '포트폴리오 분산 = Σw²σ² + ΣΣwiwjσiσjρij. 상관계수(ρ)가 1 미만이면 교차항이 줄어 전체 위험이 감소합니다.', hint: '분산투자 효과의 수학적 원리', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'inv-p3', unitId: 'inv-2', type: 'multiple-choice', difficulty: 2, question: '효율적 프론티어(Efficient Frontier)에 대한 설명으로 올바른 것은?', options: [{ id: 1, text: '동일 위험 수준에서 최대 기대수익률을 제공하는 포트폴리오의 집합', isCorrect: true, feedback: '정답! 효율적 프론티어는 위험 대비 수익이 최적화된 포트폴리오들의 경계선입니다.' }, { id: 2, text: '위험이 0인 포트폴리오의 집합', isCorrect: false, feedback: '무위험 자산을 제외하면 위험 0은 불가능합니다.' }, { id: 3, text: '모든 투자자가 선택하는 동일한 포트폴리오', isCorrect: false, feedback: '투자자의 위험 선호도에 따라 프론티어 위의 다른 점을 선택합니다.' }, { id: 4, text: '수익률이 가장 높은 단일 자산', isCorrect: false, feedback: '효율적 프론티어는 포트폴리오(조합)의 개념입니다.' }], explanation: '마코위츠의 효율적 프론티어: 주어진 위험에서 최대 수익, 또는 주어진 수익에서 최소 위험을 달성하는 포트폴리오 조합의 경계선.', hint: '위험-수익 평면에서 최적 조합의 경계', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'inv-p4', unitId: 'inv-3', type: 'multiple-choice', difficulty: 2, question: 'CAPM에서 베타(β)가 1.5인 주식의 의미는?', options: [{ id: 1, text: '시장 수익률이 1% 변할 때 해당 주식은 1.5% 변한다', isCorrect: true, feedback: '정답! 베타는 시장 대비 민감도를 나타냅니다. β=1.5면 시장보다 50% 더 민감합니다.' }, { id: 2, text: '무위험 수익률의 1.5배 수익을 보장한다', isCorrect: false, feedback: '베타는 수익 보장이 아닌 민감도 지표입니다.' }, { id: 3, text: '해당 주식의 총위험이 시장의 1.5배이다', isCorrect: false, feedback: '베타는 체계적 위험만 측정합니다.' }, { id: 4, text: '배당수익률이 1.5%이다', isCorrect: false, feedback: '베타는 배당과 무관합니다.' }], explanation: 'E(Ri) = Rf + βi × (E(Rm) - Rf). β>1: 시장보다 공격적, β<1: 시장보다 방어적, β=1: 시장과 동일.', hint: '시장 수익률 변동에 대한 민감도', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'inv-p5', unitId: 'inv-4', type: 'multiple-choice', difficulty: 2, question: '준강형 효율적 시장에서 초과수익을 얻을 수 없는 분석 방법은?', options: [{ id: 1, text: '기본적 분석(재무제표 분석)', isCorrect: true, feedback: '정답! 준강형 효율성에서는 모든 공개 정보가 즉시 가격에 반영되므로 기본적 분석으로 초과수익 불가.' }, { id: 2, text: '내부자 정보 활용', isCorrect: false, feedback: '내부자 정보는 강형 효율성에서만 반영됩니다.' }, { id: 3, text: '사적 정보 활용', isCorrect: false, feedback: '비공개 정보는 준강형에서 여전히 유효할 수 있습니다.' }, { id: 4, text: '경영진과의 비공식 미팅', isCorrect: false, feedback: '비공개 정보 활용은 준강형에서 초과수익 가능(단, 불법).' }], explanation: '약형: 과거 가격 반영(기술적 분석 무효). 준강형: 모든 공개 정보 반영(기본적 분석 무효). 강형: 모든 정보 반영(내부자 정보도 무효).', hint: '공개 정보 vs 비공개 정보의 구분', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'inv-p6', unitId: 'inv-5', type: 'multiple-choice', difficulty: 1, question: '행동재무학에서 "손실회피(Loss Aversion)"란?', options: [{ id: 1, text: '같은 크기의 이익보다 손실을 더 크게 느끼는 경향', isCorrect: true, feedback: '정답! 카너먼과 트버스키의 전망이론에 따르면, 동일 금액의 손실이 이익보다 약 2배 더 고통스럽습니다.' }, { id: 2, text: '손실을 빨리 확정하는 행동', isCorrect: false, feedback: '오히려 손실을 회피하려 손절을 미루는 경향이 있습니다.' }, { id: 3, text: '위험 자산을 피하는 행동', isCorrect: false, feedback: '이는 위험회피와 다른 개념입니다.' }, { id: 4, text: '분산투자를 하는 행동', isCorrect: false, feedback: '분산투자는 합리적 행동입니다.' }], explanation: '손실회피: 10만원 이익의 기쁨 < 10만원 손실의 고통. 이로 인해 손절 지연, 이익 조기 실현 등의 비합리적 행동이 나타납니다.', hint: '전망이론(Prospect Theory)의 핵심 개념', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
];

// ============= 세금/법규 문제 =============

const taxRegulationProblems: Problem[] = [
  { id: 'tax-p1', unitId: 'tax-1', type: 'multiple-choice', difficulty: 1, question: '금융소득종합과세 기준금액은?', options: [{ id: 1, text: '연간 2,000만원 초과', isCorrect: true, feedback: '정답! 이자소득+배당소득 합계가 연 2,000만원을 초과하면 다른 소득과 합산하여 종합과세됩니다.' }, { id: 2, text: '연간 1,000만원 초과', isCorrect: false, feedback: '2013년 이후 기준금액은 2,000만원입니다.' }, { id: 3, text: '연간 5,000만원 초과', isCorrect: false, feedback: '5,000만원은 예금자보호 한도입니다.' }, { id: 4, text: '연간 3,000만원 초과', isCorrect: false, feedback: '현행 기준금액은 2,000만원입니다.' }], explanation: '금융소득(이자+배당) 합계 2,000만원 이하: 15.4% 원천징수로 분리과세. 초과분: 다른 소득과 합산하여 6~45% 종합소득세 적용.', hint: '분리과세와 종합과세의 경계', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'tax-p2', unitId: 'tax-1', type: 'multiple-choice', difficulty: 2, question: '배당소득에 적용되는 이중과세 조정 방법은?', options: [{ id: 1, text: 'Gross-up과 배당세액공제', isCorrect: true, feedback: '정답! 법인세 납부 후 배당 시 이중과세를 방지하기 위해 배당소득을 11% 가산(Gross-up)하고 세액공제합니다.' }, { id: 2, text: '비과세 처리', isCorrect: false, feedback: '배당소득은 과세 대상입니다.' }, { id: 3, text: '분리과세 적용', isCorrect: false, feedback: '2,000만원 초과 시 종합과세됩니다.' }, { id: 4, text: '필요경비 공제', isCorrect: false, feedback: '금융소득에는 필요경비 공제가 없습니다.' }], explanation: 'Gross-up: 배당소득 × 11% 가산 → 종합소득세 계산 → 가산액만큼 세액공제. 법인 단계 과세와 개인 단계 과세의 이중부담을 완화합니다.', hint: '법인세와 소득세의 이중과세 문제', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'tax-p3', unitId: 'tax-2', type: 'multiple-choice', difficulty: 1, question: '국내 상장주식 양도소득세 과세 대상은? (2025년 기준)', options: [{ id: 1, text: '대주주(10억원 이상 보유)의 양도차익', isCorrect: true, feedback: '정답! 소액주주의 상장주식 양도차익은 비과세이며, 대주주만 과세됩니다.' }, { id: 2, text: '모든 투자자의 양도차익', isCorrect: false, feedback: '소액주주는 상장주식 양도세가 비과세입니다.' }, { id: 3, text: '1년 이상 보유한 주식만', isCorrect: false, feedback: '보유 기간이 아닌 보유 금액이 기준입니다.' }, { id: 4, text: '해외주식만', isCorrect: false, feedback: '해외주식은 모든 투자자에게 양도세가 과세됩니다.' }], explanation: '국내 상장주식: 대주주(종목당 10억원 이상) → 양도세 과세. 소액주주 → 비과세. 해외주식: 모든 투자자 → 연 250만원 공제 후 22% 과세.', hint: '대주주 요건과 소액주주 비과세', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'tax-p4', unitId: 'tax-3', type: 'multiple-choice', difficulty: 1, question: '금융소비자보호법의 "적합성 원칙"이란?', options: [{ id: 1, text: '투자자의 투자 목적, 재산 상황에 적합한 상품을 권유해야 하는 원칙', isCorrect: true, feedback: '정답! 금융회사는 투자자 정보를 파악하고, 그에 맞는 상품만 권유해야 합니다.' }, { id: 2, text: '모든 상품을 동일하게 설명해야 하는 원칙', isCorrect: false, feedback: '이는 설명의무에 해당합니다.' }, { id: 3, text: '투자자가 원하면 어떤 상품이든 판매할 수 있는 원칙', isCorrect: false, feedback: '이는 적정성 원칙 위반입니다.' }, { id: 4, text: '수수료를 공개해야 하는 원칙', isCorrect: false, feedback: '이는 설명의무의 일부입니다.' }], explanation: '적합성 원칙: 투자자의 투자 목적, 재산 상황, 투자 경험, 위험 감수 능력을 파악하여 부적합한 상품 권유를 금지합니다.', hint: '투자자 보호를 위한 판매 규제', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'tax-p5', unitId: 'tax-4', type: 'multiple-choice', difficulty: 2, question: '자본시장법상 "불공정거래"에 해당하지 않는 것은?', options: [{ id: 1, text: '공개된 재무제표를 분석하여 투자하는 행위', isCorrect: true, feedback: '정답! 공개 정보를 활용한 투자는 합법적 행위입니다.' }, { id: 2, text: '미공개 중요정보를 이용한 매매', isCorrect: false, feedback: '내부자거래로 불공정거래에 해당합니다.' }, { id: 3, text: '허위 정보를 유포하여 주가를 조작하는 행위', isCorrect: false, feedback: '시세조종으로 불공정거래입니다.' }, { id: 4, text: '대량 매수 주문으로 주가를 인위적으로 올리는 행위', isCorrect: false, feedback: '시세조종에 해당합니다.' }], explanation: '불공정거래: 내부자거래, 시세조종, 부정거래. 공개 정보 분석은 정당한 투자 활동으로 규제 대상이 아닙니다.', hint: '합법적 투자 vs 불법 행위의 경계', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'tax-p6', unitId: 'tax-5', type: 'multiple-choice', difficulty: 1, question: 'ISA(개인종합자산관리계좌)의 세제 혜택은?', options: [{ id: 1, text: '순이익 200만원(서민형 400만원)까지 비과세, 초과분 9.9% 분리과세', isCorrect: true, feedback: '정답! ISA는 다양한 금융상품을 한 계좌에서 운용하며 세제 혜택을 받을 수 있습니다.' }, { id: 2, text: '모든 수익 비과세', isCorrect: false, feedback: '비과세 한도가 있습니다.' }, { id: 3, text: '원금 보장', isCorrect: false, feedback: 'ISA는 세제 혜택 계좌이지 원금보장 상품이 아닙니다.' }, { id: 4, text: '연간 납입한도 없음', isCorrect: false, feedback: '연간 2,000만원(총 1억원) 납입한도가 있습니다.' }], explanation: 'ISA: 3년 이상 유지 시 순이익 200만원(서민형 400만원) 비과세, 초과분 9.9% 분리과세. 연 2,000만원 납입한도.', hint: '절세 계좌의 대표적 상품', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
];

// ============= 파생상품 문제 =============

const derivativesProblems: Problem[] = [
  { id: 'der-p1', unitId: 'der-1', type: 'multiple-choice', difficulty: 1, question: '파생상품의 레버리지 효과란?', options: [{ id: 1, text: '소액의 증거금으로 큰 금액의 거래가 가능한 것', isCorrect: true, feedback: '정답! 선물은 계약금액의 10-15%만 증거금으로 납부하여 거래하므로 레버리지 효과가 있습니다.' }, { id: 2, text: '원금이 보장되는 것', isCorrect: false, feedback: '레버리지는 오히려 손실을 확대시킬 수 있습니다.' }, { id: 3, text: '만기가 없는 것', isCorrect: false, feedback: '파생상품은 만기가 있습니다.' }, { id: 4, text: '세금이 면제되는 것', isCorrect: false, feedback: '파생상품 거래에도 세금이 부과됩니다.' }], explanation: '레버리지: 증거금 1,500만원으로 1억원 규모 선물 거래 가능(약 6.7배). 수익도 확대되지만 손실도 확대됩니다.', hint: '적은 돈으로 큰 거래를 하는 효과', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'der-p2', unitId: 'der-2', type: 'multiple-choice', difficulty: 2, question: '선물 거래에서 "일일정산(Mark-to-Market)"의 의미는?', options: [{ id: 1, text: '매일 정산가격으로 손익을 계산하여 증거금에 반영하는 것', isCorrect: true, feedback: '정답! 일일정산으로 매일 손익이 실현되며, 유지증거금 이하로 떨어지면 추가 증거금(마진콜)을 납부해야 합니다.' }, { id: 2, text: '매일 계약을 갱신하는 것', isCorrect: false, feedback: '계약은 만기까지 유지됩니다.' }, { id: 3, text: '매일 거래를 종료하는 것', isCorrect: false, feedback: '포지션은 만기까지 유지 가능합니다.' }, { id: 4, text: '매일 이자를 지급하는 것', isCorrect: false, feedback: '선물은 이자 지급 상품이 아닙니다.' }], explanation: '일일정산: 매일 종가(정산가)로 미실현 손익 계산 → 증거금 계좌에 반영 → 유지증거금 미달 시 마진콜 발생.', hint: '선물 거래의 신용위험 관리 메커니즘', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'der-p3', unitId: 'der-3', type: 'multiple-choice', difficulty: 2, question: '콜옵션 매수자의 최대 손실은?', options: [{ id: 1, text: '지불한 프리미엄(옵션료)', isCorrect: true, feedback: '정답! 콜옵션 매수자는 행사가 이하로 하락해도 옵션을 포기하면 되므로, 최대 손실은 프리미엄에 한정됩니다.' }, { id: 2, text: '무한대', isCorrect: false, feedback: '무한 손실은 콜옵션 매도자에게 해당합니다.' }, { id: 3, text: '행사가격', isCorrect: false, feedback: '행사가격은 옵션 행사 시 지불하는 가격입니다.' }, { id: 4, text: '기초자산 가격', isCorrect: false, feedback: '콜옵션 매수자의 손실은 프리미엄으로 제한됩니다.' }], explanation: '콜옵션 매수: 최대손실 = 프리미엄, 최대이익 = 무한. 풋옵션 매수: 최대손실 = 프리미엄, 최대이익 = 행사가 - 프리미엄.', hint: '옵션 매수자는 권리만 있고 의무는 없다', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'der-p4', unitId: 'der-4', type: 'multiple-choice', difficulty: 2, question: '금리스왑(IRS)에서 고정금리를 지급하고 변동금리를 수취하는 포지션의 목적은?', options: [{ id: 1, text: '향후 금리 상승에 대비한 헤지', isCorrect: true, feedback: '정답! 변동금리 부채를 가진 기업이 금리 상승 위험을 헤지하기 위해 고정금리 지급 스왑을 체결합니다.' }, { id: 2, text: '금리 하락에 대비한 헤지', isCorrect: false, feedback: '금리 하락 헤지는 변동금리 지급/고정금리 수취입니다.' }, { id: 3, text: '환율 위험 헤지', isCorrect: false, feedback: '환율 헤지는 통화스왑을 사용합니다.' }, { id: 4, text: '신용위험 헤지', isCorrect: false, feedback: '신용위험 헤지는 CDS를 사용합니다.' }], explanation: '변동금리 차입자: 금리↑ → 이자부담↑. 고정금리 지급 스왑 체결 시: 변동금리 수취로 차입 이자 상쇄, 고정금리만 지급하여 금리 확정.', hint: '변동금리 부채의 금리 위험을 고정시키는 방법', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'der-p5', unitId: 'der-5', type: 'multiple-choice', difficulty: 3, question: '델타 헤지(Delta Hedging)에서 콜옵션 1계약(델타 0.6)을 매도한 경우, 헤지에 필요한 기초자산 수량은?', options: [{ id: 1, text: '0.6단위 매수', isCorrect: true, feedback: '정답! 콜옵션 매도 시 기초자산 가격 상승 위험을 헤지하기 위해 델타만큼 기초자산을 매수합니다.' }, { id: 2, text: '0.4단위 매수', isCorrect: false, feedback: '1-델타가 아닌 델타만큼 매수합니다.' }, { id: 3, text: '1단위 매수', isCorrect: false, feedback: '델타가 1이 아니므로 0.6단위만 필요합니다.' }, { id: 4, text: '0.6단위 매도', isCorrect: false, feedback: '콜옵션 매도 포지션을 헤지하려면 기초자산을 매수해야 합니다.' }], explanation: '델타 헤지: 옵션 포지션의 델타를 상쇄하도록 기초자산을 보유. 콜 매도(델타 -0.6) → 기초자산 0.6 매수 → 순 델타 = 0 (델타 중립).', hint: '포트폴리오의 델타를 0으로 만드는 것', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
];

// ============= 보험설계 문제 =============

const insurancePlanningProblems: Problem[] = [
  { id: 'ins-p1', unitId: 'ins-1', type: 'multiple-choice', difficulty: 1, question: '보험의 "대수의 법칙"이란?', options: [{ id: 1, text: '표본이 클수록 실제 발생률이 예상 발생률에 수렴하는 원리', isCorrect: true, feedback: '정답! 가입자가 많을수록 실제 사고 발생률이 통계적 예측치에 가까워져 보험 운영이 안정됩니다.' }, { id: 2, text: '보험료가 높을수록 보장이 좋은 원리', isCorrect: false, feedback: '이는 대수의 법칙과 무관합니다.' }, { id: 3, text: '보험 가입자가 많을수록 보험료가 비싸지는 원리', isCorrect: false, feedback: '오히려 가입자가 많을수록 위험 분산이 가능합니다.' }, { id: 4, text: '보험금 지급이 지연되는 원리', isCorrect: false, feedback: '대수의 법칙은 통계적 원리입니다.' }], explanation: '대수의 법칙: 동질적 위험 집단의 크기가 커질수록, 실제 손해율이 기대 손해율에 수렴합니다. 이것이 보험 사업의 수학적 기초입니다.', hint: '통계학의 기본 원리가 보험에 적용되는 방식', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'ins-p2', unitId: 'ins-1', type: 'multiple-choice', difficulty: 2, question: '보험료의 구성요소 중 "부가보험료"에 해당하는 것은?', options: [{ id: 1, text: '보험회사의 사업비(인건비, 광고비 등)', isCorrect: true, feedback: '정답! 부가보험료 = 사업비(신계약비 + 유지비 + 수금비). 순보험료는 보험금 지급 재원입니다.' }, { id: 2, text: '보험금 지급 재원', isCorrect: false, feedback: '이는 순보험료에 해당합니다.' }, { id: 3, text: '투자 수익', isCorrect: false, feedback: '투자 수익은 보험료 구성요소가 아닙니다.' }, { id: 4, text: '재보험료', isCorrect: false, feedback: '재보험료는 보험회사 간 거래입니다.' }], explanation: '보험료 = 순보험료(위험보험료 + 저축보험료) + 부가보험료(사업비). 순보험료는 보험금 재원, 부가보험료는 운영비입니다.', hint: '보험료 = 순보험료 + 부가보험료', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'ins-p3', unitId: 'ins-2', type: 'multiple-choice', difficulty: 1, question: '종신보험과 정기보험의 가장 큰 차이점은?', options: [{ id: 1, text: '종신보험은 사망 시기와 관계없이 보장하고, 정기보험은 일정 기간만 보장한다', isCorrect: true, feedback: '정답! 종신보험은 평생 보장(해약환급금 있음), 정기보험은 정해진 기간만 보장(만기 시 환급금 없음).' }, { id: 2, text: '정기보험이 더 비싸다', isCorrect: false, feedback: '종신보험이 평생 보장이므로 보험료가 더 비쌉니다.' }, { id: 3, text: '종신보험은 건강보험이다', isCorrect: false, feedback: '종신보험은 사망보험입니다.' }, { id: 4, text: '정기보험은 투자 기능이 있다', isCorrect: false, feedback: '투자 기능은 변액보험에 해당합니다.' }], explanation: '종신보험: 평생 보장, 높은 보험료, 해약환급금 있음, 저축 기능. 정기보험: 일정 기간 보장, 낮은 보험료, 순수 보장형.', hint: '보장 기간의 차이', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'ins-p4', unitId: 'ins-3', type: 'multiple-choice', difficulty: 1, question: '자동차보험에서 "대인배상Ⅱ"의 보장 범위는?', options: [{ id: 1, text: '사고로 타인에게 입힌 신체 손해 중 대인Ⅰ 초과분', isCorrect: true, feedback: '정답! 대인Ⅰ(의무보험) 한도 초과 시 대인Ⅱ(임의보험)가 추가 보장합니다.' }, { id: 2, text: '본인의 신체 손해', isCorrect: false, feedback: '본인 보장은 자기신체사고 담보입니다.' }, { id: 3, text: '차량 수리비', isCorrect: false, feedback: '차량 수리비는 자기차량손해 담보입니다.' }, { id: 4, text: '상대방 차량 손해', isCorrect: false, feedback: '상대 차량은 대물배상 담보입니다.' }], explanation: '대인Ⅰ: 의무보험(사망 1.5억, 부상 3천만원 한도). 대인Ⅱ: 임의보험(대인Ⅰ 초과분 무한 보장). 가입 필수 권장.', hint: '의무보험 한도를 초과하는 손해 보장', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'ins-p5', unitId: 'ins-4', type: 'multiple-choice', difficulty: 2, question: '확정급여형(DB) 퇴직연금과 확정기여형(DC) 퇴직연금의 차이점은?', options: [{ id: 1, text: 'DB는 회사가 운용 책임, DC는 근로자가 운용 책임', isCorrect: true, feedback: '정답! DB: 회사가 운용하고 퇴직 시 확정된 급여 지급. DC: 근로자가 직접 운용하고 운용 성과에 따라 수령액 변동.' }, { id: 2, text: 'DB가 근로자에게 더 유리하다', isCorrect: false, feedback: '상황에 따라 다릅니다. 임금 상승률이 높으면 DB, 투자 수익률이 높으면 DC가 유리합니다.' }, { id: 3, text: 'DC는 중도 인출이 불가능하다', isCorrect: false, feedback: 'DC도 법정 사유 시 중도 인출 가능합니다.' }, { id: 4, text: 'DB는 세제 혜택이 없다', isCorrect: false, feedback: 'DB도 퇴직소득세 적용 등 세제 혜택이 있습니다.' }], explanation: 'DB: 퇴직급여 = 퇴직 직전 3개월 평균임금 × 근속연수. DC: 매년 연봉의 1/12 이상 적립, 근로자가 운용하여 수령액 결정.', hint: '운용 책임과 수령액 확정 여부의 차이', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
  { id: 'ins-p6', unitId: 'ins-5', type: 'multiple-choice', difficulty: 2, question: '리스크 관리에서 "위험 전가(Risk Transfer)"의 대표적 방법은?', options: [{ id: 1, text: '보험 가입', isCorrect: true, feedback: '정답! 보험은 보험료를 지불하고 위험을 보험회사에 전가하는 대표적 위험 관리 방법입니다.' }, { id: 2, text: '위험 회피', isCorrect: false, feedback: '위험 회피는 위험 활동 자체를 하지 않는 것입니다.' }, { id: 3, text: '비상금 적립', isCorrect: false, feedback: '이는 위험 보유(자가보험)에 해당합니다.' }, { id: 4, text: '안전 교육', isCorrect: false, feedback: '이는 위험 감소(손실 통제)에 해당합니다.' }], explanation: '위험 관리 4가지: 회피(활동 중단), 감소(안전장치), 보유(자가부담), 전가(보험·계약). 보험은 가장 대표적인 위험 전가 수단입니다.', hint: '위험을 제3자에게 넘기는 방법', category: 'new', easeFactorSM2: 2.5, timesReviewed: 0 },
];

// ============= 하위 호환성을 위한 기존 exports =============

// 기존 learn.tsx에서 사용하는 curriculum 배열 (과목 내 첫 번째 과목의 유닛들로 매핑)
export const curriculum: Unit[] = subjects[0].units;

// 기존 unit2 관련 exports (하위 호환)
export const unit2Screens: Screen[] = [];
export const unit2Problems: Problem[] = macroProblems.filter(p => p.unitId === 'macro-2');

// Forward declarations (하위 호환)
export const unit3Screens: Screen[] = [];
export const unit3Problems: Problem[] = macroProblems.filter(p => p.unitId === 'macro-3');
export const unit4Screens: Screen[] = [];
export const unit4Problems: Problem[] = macroProblems.filter(p => p.unitId === 'macro-4');
export const unit5Screens: Screen[] = [];
export const unit5Problems: Problem[] = macroProblems.filter(p => p.unitId === 'macro-5');
export const unit6Screens: Screen[] = [];
export const unit6Problems: Problem[] = macroProblems.filter(p => p.unitId === 'macro-6');
