/**
 * NCS/자격증 대비 학습 데이터
 * AFPK, 투자자산운용사, TESAT 등 금융 자격증 기출문제
 */

export interface CertificationQuiz {
  id: string;
  certification: 'AFPK' | 'IAMP' | 'TESAT';
  category: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  year?: number;
}

export const NCS_CERTIFICATION_QUIZZES: CertificationQuiz[] = [
  // AFPK (금융재정설계사) - 재무설계 기초
  {
    id: 'afpk_001',
    certification: 'AFPK',
    category: '재무설계 기초',
    question: '다음 중 재무설계의 목표로 가장 적절한 것은?',
    choices: [
      '단기 수익 극대화',
      '장기 자산 증식 및 생활 안정성 확보',
      '주식 투자 수익률 최대화',
      '부동산 투자 수익 극대화',
    ],
    answer: 1,
    explanation:
      '재무설계는 개인의 재무 목표를 달성하기 위해 자산, 부채, 소득을 종합적으로 관리하는 과정입니다. 단기 수익보다는 장기적인 자산 증식과 생활 안정성을 확보하는 것을 목표로 합니다.',
    difficulty: 'easy',
    year: 2024,
  },
  {
    id: 'afpk_002',
    certification: 'AFPK',
    category: '보험설계',
    question: '생명보험의 주요 기능으로 가장 적절하지 않은 것은?',
    choices: [
      '소득 보장',
      '자산 형성',
      '세금 절감',
      '주식 투자 수익 창출',
    ],
    answer: 3,
    explanation:
      '생명보험은 피보험자의 사망 시 유족의 생활을 보장하고, 저축 기능을 통해 자산을 형성하며, 보험료 납입액이 소득공제되어 세금을 절감할 수 있습니다. 하지만 주식 투자 수익을 창출하는 것이 주요 기능은 아닙니다.',
    difficulty: 'medium',
    year: 2024,
  },
  {
    id: 'afpk_003',
    certification: 'AFPK',
    category: '투자설계',
    question: '포트폴리오 이론에서 분산투자의 주요 목적은?',
    choices: [
      '투자 수익 극대화',
      '투자 위험 최소화',
      '투자 비용 절감',
      '투자 기간 단축',
    ],
    answer: 1,
    explanation:
      '분산투자는 여러 자산에 투자하여 개별 자산의 위험을 상쇄함으로써 전체 포트폴리오의 위험을 최소화하는 것을 목적으로 합니다. 이를 통해 같은 수익 수준에서 위험을 줄이거나, 같은 위험 수준에서 수익을 높일 수 있습니다.',
    difficulty: 'medium',
    year: 2023,
  },

  // 투자자산운용사 (IAMP) - 자산운용 기초
  {
    id: 'iamp_001',
    certification: 'IAMP',
    category: '자산운용 기초',
    question: '자산운용사의 주요 역할로 가장 적절한 것은?',
    choices: [
      '고객 자산을 위임받아 운용하고 수익을 창출',
      '고객에게 직접 투자 상품 판매',
      '고객 신용도 평가',
      '고객 세금 신고 대행',
    ],
    answer: 0,
    explanation:
      '자산운용사는 고객으로부터 자산을 위임받아 전문적으로 운용하여 수익을 창출하는 것이 주요 역할입니다. 투자 상품 판매는 증권사, 신용도 평가는 신용평가회사, 세금 신고는 회계사의 역할입니다.',
    difficulty: 'easy',
    year: 2024,
  },
  {
    id: 'iamp_002',
    certification: 'IAMP',
    category: '펀드 운용',
    question: '액티브 펀드와 패시브 펀드의 가장 큰 차이점은?',
    choices: [
      '펀드 규모',
      '운용 전략 및 수수료',
      '투자 기간',
      '투자 대상',
    ],
    answer: 1,
    explanation:
      '액티브 펀드는 펀드매니저가 적극적으로 포트폴리오를 구성하여 시장 수익률을 초과하는 수익을 목표로 하며 수수료가 높습니다. 패시브 펀드는 지수를 추종하여 시장 수익률과 동일한 수익을 목표로 하며 수수료가 낮습니다.',
    difficulty: 'medium',
    year: 2024,
  },
  {
    id: 'iamp_003',
    certification: 'IAMP',
    category: '위험관리',
    question: 'Value at Risk(VaR)의 정의로 가장 적절한 것은?',
    choices: [
      '포트폴리오의 최대 수익',
      '일정 신뢰도에서 일정 기간 동안 발생할 수 있는 최대 손실',
      '포트폴리오의 평균 수익률',
      '포트폴리오 구성 자산의 총 가치',
    ],
    answer: 1,
    explanation:
      'VaR는 일정한 신뢰도(예: 95%)에서 일정 기간(예: 1일) 동안 포트폴리오가 입을 수 있는 최대 손실액을 의미합니다. 예를 들어, "95% 신뢰도에서 1일 VaR가 100만원"이라는 것은 95% 확률로 1일 손실이 100만원 이하라는 의미입니다.',
    difficulty: 'hard',
    year: 2023,
  },

  // TESAT (경제이해력검증시험) - 경제 기초
  {
    id: 'tesat_001',
    certification: 'TESAT',
    category: '거시경제',
    question: '인플레이션이 발생할 때 나타나는 현상으로 가장 적절하지 않은 것은?',
    choices: [
      '화폐의 구매력 감소',
      '실질이자율 상승',
      '명목이자율 상승',
      '저축 유인 감소',
    ],
    answer: 1,
    explanation:
      '인플레이션이 발생하면 화폐의 구매력이 감소하고, 중앙은행은 통상 기준금리를 인상하여 명목이자율이 상승합니다. 하지만 실질이자율은 명목이자율에서 인플레이션율을 뺀 값이므로, 인플레이션이 명목이자율 상승보다 크면 실질이자율은 오히려 하락할 수 있습니다.',
    difficulty: 'medium',
    year: 2024,
  },
  {
    id: 'tesat_002',
    certification: 'TESAT',
    category: '미시경제',
    question: '완전경쟁시장의 특징으로 가장 적절한 것은?',
    choices: [
      '진입 장벽이 높음',
      '기업이 가격을 결정할 수 있음',
      '많은 수의 동질적 상품을 판매하는 기업들이 존재',
      '정보가 비대칭적임',
    ],
    answer: 2,
    explanation:
      '완전경쟁시장은 진입 장벽이 낮고, 많은 수의 기업이 동질적인 상품을 판매하며, 기업은 가격 수용자로서 시장가격을 받아들이고, 정보가 완벽하게 공개되어 있는 시장입니다.',
    difficulty: 'easy',
    year: 2024,
  },
  {
    id: 'tesat_003',
    certification: 'TESAT',
    category: '국제경제',
    question: '환율 상승(원화 약세)이 한국 경제에 미치는 영향으로 가장 적절한 것은?',
    choices: [
      '수출 경쟁력 강화',
      '수입품 가격 상승',
      '해외 여행 비용 증가',
      '모두 해당',
    ],
    answer: 3,
    explanation:
      '환율이 상승하면 한국 상품이 외국에서 더 싸지므로 수출 경쟁력이 강화되고, 외국 상품이 한국에서 더 비싸지므로 수입품 가격이 상승하며, 해외 여행에 필요한 외화 구입 비용이 증가하여 여행 비용이 올라갑니다.',
    difficulty: 'medium',
    year: 2023,
  },
];

/**
 * 자격증별 퀴즈 필터링
 */
export function getQuizzesByCertification(
  certification: 'AFPK' | 'IAMP' | 'TESAT'
): CertificationQuiz[] {
  return NCS_CERTIFICATION_QUIZZES.filter((q) => q.certification === certification);
}

/**
 * 난이도별 퀴즈 필터링
 */
export function getQuizzesByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard'
): CertificationQuiz[] {
  return NCS_CERTIFICATION_QUIZZES.filter((q) => q.difficulty === difficulty);
}

/**
 * 자격증 및 난이도별 퀴즈 필터링
 */
export function getQuizzesByCertificationAndDifficulty(
  certification: 'AFPK' | 'IAMP' | 'TESAT',
  difficulty: 'easy' | 'medium' | 'hard'
): CertificationQuiz[] {
  return NCS_CERTIFICATION_QUIZZES.filter(
    (q) => q.certification === certification && q.difficulty === difficulty
  );
}

/**
 * 자격증 정보
 */
export const CERTIFICATIONS = [
  {
    id: 'AFPK',
    name: 'AFPK (금융재정설계사)',
    description: '재무설계, 보험, 투자 등 종합적인 금융 설계 능력을 검증',
    icon: '💼',
    color: '#FF6B6B',
  },
  {
    id: 'IAMP',
    name: '투자자산운용사 (IAMP)',
    description: '자산운용, 펀드 운용, 위험관리 등 투자 전문 능력을 검증',
    icon: '📈',
    color: '#4ECDC4',
  },
  {
    id: 'TESAT',
    name: 'TESAT (경제이해력검증시험)',
    description: '거시경제, 미시경제, 국제경제 등 경제 기초 이해도를 검증',
    icon: '🌍',
    color: '#45B7D1',
  },
];
