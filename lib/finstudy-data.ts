export type QuizQuestion = {
  id: string;
  question: string;
  choices?: [string, string, string, string];
  answer?: number;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'multiple-choice' | 'essay';
  essayRubric?: string;
};

export type ArticleLesson = {
  id: string;
  category: string;
  source: string;
  readTime: string;
  title: string;
  summary: string;
  keyPoints: string[];
  terms: string[];
  quiz: QuizQuestion[];
};

export type LearningStage = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  terms: string[];
  locked?: boolean;
};

export const lessons: ArticleLesson[] = [
  {
    id: 'inflation-rates',
    category: '오늘의 경제 브리핑',
    source: 'FinStudy Digest',
    readTime: '3분 읽기',
    title: '금리와 물가가 동시에 움직일 때 시장은 무엇을 먼저 볼까?',
    summary:
      '중앙은행이 금리를 조정할 때 시장은 단순히 숫자 변화만 보지 않고, 물가가 얼마나 끈질기게 오르는지와 소비·투자가 얼마나 둔화되는지를 함께 살핀다. 금리 인상은 대출 비용을 높여 소비와 투자를 식히는 효과가 있지만, 이미 공급 충격이 큰 상황에서는 물가를 빠르게 낮추지 못할 수도 있다. 투자자는 향후 금리 경로, 기업 실적, 환율 변동을 함께 해석해야 한다.',
    keyPoints: [
      '기준금리는 소비와 투자 심리를 조절하는 대표 정책 수단이다.',
      '물가 상승이 공급 요인인지 수요 요인인지에 따라 정책 효과가 달라질 수 있다.',
      '주식시장은 금리 수준보다 향후 경로와 실적 영향에 더 민감하게 반응한다.',
    ],
    terms: ['기준금리', '인플레이션', '실적', '환율'],
    quiz: [
      {
        id: 'q1',
        question: '기준금리 인상이 일반적으로 가장 먼저 식히려는 대상은 무엇인가?',
        choices: ['소비와 투자 수요', '수출 물량 자체', '기업의 회계 기준', '정부 예산 집행'],
        answer: 0,
        explanation: '금리 인상은 차입 비용을 높여 소비와 투자 수요를 낮추는 방향으로 작동한다.',
      },
      {
        id: 'q2',
        question: '시장 참여자가 금리 결정 기사에서 함께 읽어야 할 정보로 가장 적절한 것은?',
        choices: ['향후 금리 경로와 물가 흐름', '연예 뉴스 반응', '기업 로고 색상', '날씨 예보만'],
        answer: 0,
        explanation: '실제 시장은 현재 금리 숫자보다 향후 정책 경로와 물가 흐름을 함께 반영한다.',
      },
      {
        id: 'q3',
        question: '금리 인상이 물가를 낮추는 데 한계가 있는 상황을 설명하고, 그 이유를 경제학적으로 분석하시오.',
        type: 'essay',
        difficulty: 'hard',
        explanation: '공급 측 원인이 크면 금리 조정만으로 물가를 빠르게 안정시키기 어렵다. 수요 측 인플레이션은 금리 인상으로 효과적으로 대응할 수 있지만, 공급 충격(예: 원유 가격 급등, 공급망 차질)으로 인한 물가 상승은 금리 인상이 수요를 줄이더라도 공급 제약이 남아있어 물가 안정이 지연될 수 있다.',
        essayRubric: '공급 충격의 개념 이해(30점), 금리 인상의 메커니즘 설명(30점), 한계 상황 분석(40점)'
      },
    ],
  },
  {
    id: 'export-fx',
    category: '시장 읽기',
    source: 'Macro Note',
    readTime: '4분 읽기',
    title: '환율 상승이 수출 기업에는 늘 호재일까?',
    summary:
      '원화 약세는 원화 기준 수출 매출을 키울 수 있어 전통적으로 수출 기업에 우호적으로 해석된다. 그러나 원재료를 수입하는 기업은 비용 부담이 커질 수 있고, 글로벌 수요가 동시에 둔화되는 국면이라면 환율 효과만으로 실적을 방어하기 어렵다. 결국 산업 구조와 원가 구성, 헤지 여부를 함께 봐야 한다.',
    keyPoints: [
      '환율 상승은 수출 단가와 원화 환산 매출에 영향을 준다.',
      '수입 원가 비중이 높은 기업은 비용 부담이 커질 수 있다.',
      '환율 효과는 글로벌 수요 둔화 여부와 함께 해석해야 한다.',
    ],
    terms: ['환율', '헤지', '원가', '수출'],
    quiz: [
      {
        id: 'q1',
        question: '환율 상승이 항상 수출 기업에 호재라고 단정하기 어려운 이유는?',
        choices: ['수입 원가와 글로벌 수요도 함께 변할 수 있어서', '주말이 있기 때문에', '환율이 숫자가 아니어서', '모든 기업이 내수 기업이어서'],
        answer: 0,
        explanation: '수출 기업도 원재료 수입 비중과 글로벌 수요 상황에 따라 효과가 달라진다.',
      },
      {
        id: 'q2',
        question: '기업이 환율 변동 위험을 줄이기 위해 사용하는 대표 개념은?',
        choices: ['헤지', '디자인', '배당락', '유동성 함정'],
        answer: 0,
        explanation: '헤지는 환율이나 금리 등의 변동 위험을 줄이기 위한 전략이다.',
      },
      {
        id: 'q3',
        question: '수출 기업이 환율 상승으로 이익을 얻지 못할 수 있는 경우를 구체적으로 설명하고, 이를 헤지하기 위한 전략을 제시하시오.',
        type: 'essay',
        difficulty: 'hard',
        explanation: '환율 상승이 항상 수출 기업에 호재가 되는 것은 아니다. 원재료를 많이 수입하는 기업은 환율 상승으로 인한 수입 원가 증가가 수출 수익 증대를 상쇄할 수 있다. 또한 글로벌 수요가 동시에 약해지면 환율 효과만으로는 실적을 방어하기 어렵다. 헤지 전략으로는 선물 계약, 옵션 거래, 통화 스왑 등을 통해 환율 변동 위험을 미리 줄일 수 있다.',
        essayRubric: '환율 상승의 이중 효과 이해(30점), 수입 원가 영향 분석(30점), 헤지 전략 제시(40점)'
      },
    ],
  },
  {
    id: 'employment-consumption',
    category: '거시 흐름',
    source: 'Weekly Economy',
    readTime: '3분 읽기',
    title: '고용이 강한데 소비가 약해 보일 때 읽어야 하는 신호',
    summary:
      '고용 지표가 견조해도 소비가 약하게 느껴질 때는 가계의 실질 구매력, 금리 부담, 저축 여력 변화를 함께 살펴야 한다. 일자리가 유지되더라도 물가가 높고 이자 부담이 크면 소비는 선택적으로 위축될 수 있다. 이때 시장은 소비 업종별 차별화와 정책 대응 가능성을 동시에 본다.',
    keyPoints: [
      '고용과 소비는 항상 같은 방향으로 움직이지 않는다.',
      '실질임금과 금리 부담이 소비 체감에 큰 영향을 준다.',
      '업종별 소비 차별화는 주가 반응의 차이로 이어질 수 있다.',
    ],
    terms: ['고용률', '실질임금', '소비세', '제품 차별화(Product Differentiation)'],
    quiz: [
      {
        id: 'q1',
        question: '고용이 안정적이어도 소비가 둔화될 수 있는 이유로 적절한 것은?',
        choices: ['물가와 이자 부담이 높을 수 있어서', '직장이 너무 많아서', '환율이 항상 0이어서', 'GDP가 개인 자산이어서'],
        answer: 0,
        explanation: '고용이 유지돼도 실질 구매력이 약하면 소비는 줄어들 수 있다.',
      },
      {
        id: 'q2',
        question: '소비 관련 기사에서 업종 차별화를 본다는 말의 의미는?',
        choices: ['모든 업종이 똑같이 움직인다는 뜻', '업종마다 실적 영향이 다를 수 있다는 뜻', '기사 길이가 달라진다는 뜻', '환율만 보면 된다는 뜻'],
        answer: 1,
        explanation: '소비 둔화의 영향은 업종별 가격 정책과 수요 특성에 따라 달라진다.',
      },
      {
        id: 'q3',
        question: '실질 구매력을 판단할 때 함께 볼 정보는?',
        choices: ['임금과 물가', '주차 공간', '앱 아이콘 색상', '광고 문구'],
        answer: 0,
        explanation: '실질 구매력은 명목임금뿐 아니라 물가 수준을 함께 봐야 판단할 수 있다.',
      },
    ],
  },
];

export const learningStages: LearningStage[] = [
  {
    id: 'stage-1',
    title: '경제 뉴스 읽기 기초',
    subtitle: '현재 단계',
    description: '기사의 숫자와 용어를 분리해 읽고, 핵심 주체가 누구인지 파악하는 단계다.',
    terms: ['물가', '금리', '환율'],
  },
  {
    id: 'stage-2',
    title: '시장 반응 연결하기',
    subtitle: '다음 단계',
    description: '정책 변화가 주식·채권·환율에 어떻게 연결되는지 해석하는 단계다.',
    terms: ['밸류에이션(Valuation: 가치평가)', '실적', '명목 금리 / 실질 금리'],
  },
  {
    id: 'stage-3',
    title: '업종별 영향 해석',
    subtitle: '잠금 예정',
    description: '같은 거시 변수라도 업종마다 다른 영향을 주는 이유를 이해하는 단계다.',
    terms: ['원가', '수출', '구조조정'],
    locked: true,
  },
  {
    id: 'stage-4',
    title: '나만의 경제 노트 만들기',
    subtitle: '잠금 예정',
    description: '기사를 자기 언어로 요약하고 투자 관점을 정리하는 단계다.',
    terms: ['효율적 시장 가설', '시스템리스크', '고객행동 시나리오(Customer Behaviour Scenario)'],
    locked: true,
  },
];

export type ProgressState = {
  xp: number;
  streak: number;
  completedLessonIds: string[];
  correctAnswers: number;
  solvedAnswers: number;
  reviewQueue: string[];
};

export const defaultProgress: ProgressState = {
  xp: 120,
  streak: 4,
  completedLessonIds: [],
  correctAnswers: 0,
  solvedAnswers: 0,
  reviewQueue: ['환율 기사 해석 복습', '물가와 금리 관계 다시 보기'],
};
