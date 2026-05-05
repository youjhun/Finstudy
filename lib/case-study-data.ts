/**
 * 케이스 스터디 데이터 모델
 * 실제 경제 사태를 기반으로 경제 지표 흐름을 학습하는 데이터
 */

export type EconomicIndicator = 'interest_rate' | 'exchange_rate' | 'stock_index' | 'unemployment' | 'credit_spread' | 'housing_price';

export interface TimelineEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  emoji: string;
}

export interface IndicatorDataPoint {
  date: string; // YYYY-MM-DD
  value: number;
  change?: number; // 전월 대비 변화율 (%)
}

export interface ImpactedAsset {
  name: string;
  category: 'stock' | 'bond' | 'currency' | 'commodity' | 'real_estate';
  impact: 'positive' | 'negative';
  changePercent: number;
  explanation: string;
  emoji: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  period: {
    start: string; // YYYY-MM-DD
    end: string;
  };
  summary: string;
  cause: string;
  timeline: TimelineEvent[];
  indicators: Record<EconomicIndicator, IndicatorDataPoint[]>;
  impactedAssets: ImpactedAsset[];
  lessons: string[];
  quizzes: CaseStudyQuiz[];
}

export interface CaseStudyQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  timelineIndex?: number; // 타임라인의 어느 시점에서의 질문인지
}

// ============= 리먼브라더스 사태 (2008년) =============

export const lehmanBrothersCaseStudy: CaseStudy = {
  id: 'lehman-brothers-2008',
  title: '리먼브라더스 사태',
  subtitle: '2008년 글로벌 금융 위기',
  emoji: '📉',
  period: {
    start: '2007-01-01',
    end: '2009-12-31',
  },
  summary:
    '2008년 9월 미국의 대형 투자은행 리먼브라더스가 158년 역사 끝에 파산하면서 촉발된 글로벌 금융 위기. 서브프라임 모기지 부실로 시작된 위기가 금융 시스템 전체로 확산되어 전 세계 경제에 심각한 영향을 미쳤습니다.',
  cause:
    '2000년대 초반 미국의 저금리 정책으로 주택 구매 열풍이 일어났고, 신용도 낮은 사람들도 대출을 받을 수 있게 되었습니다(서브프라임 모기지). 이러한 고위험 모기지를 복잡한 금융상품으로 포장하여 전 세계에 판매했는데, 주택 가격이 하락하면서 이 금융상품들의 가치가 급락했습니다.',
  timeline: [
    {
      id: 'event-1',
      date: '2006-06-01',
      title: '미국 주택 가격 정점',
      description: '미국 주택 가격이 역사상 최고조에 도달합니다.',
      impact: 'high',
      emoji: '🏠',
    },
    {
      id: 'event-2',
      date: '2007-08-01',
      title: '서브프라임 모기지 부실 본격화',
      description: '주택 가격이 하락하면서 서브프라임 모기지 연체가 급증합니다.',
      impact: 'high',
      emoji: '⚠️',
    },
    {
      id: 'event-3',
      date: '2008-03-16',
      title: 'Bear Stearns 붕괴',
      description: '투자은행 Bear Stearns가 JP모건에 인수됩니다.',
      impact: 'high',
      emoji: '📊',
    },
    {
      id: 'event-4',
      date: '2008-09-15',
      title: '리먼브라더스 파산',
      description: '158년 역사의 리먼브라더스가 파산 신청합니다. 금융 위기가 본격화됩니다.',
      impact: 'critical',
      emoji: '💥',
    },
    {
      id: 'event-5',
      date: '2008-10-03',
      title: 'TARP 승인 (7,000억 달러)',
      description: '미국 정부가 금융 시스템 구제 프로그램을 승인합니다.',
      impact: 'high',
      emoji: '🏦',
    },
    {
      id: 'event-6',
      date: '2009-03-09',
      title: 'S&P 500 최저점',
      description: '미국 주가지수가 최저점을 기록합니다.',
      impact: 'critical',
      emoji: '📉',
    },
    {
      id: 'event-7',
      date: '2009-06-01',
      title: '회복 신호 시작',
      description: '경제 회복 신호가 나타나기 시작합니다.',
      impact: 'medium',
      emoji: '📈',
    },
  ],
  indicators: {
    interest_rate: [
      { date: '2007-01-01', value: 5.25 },
      { date: '2007-06-01', value: 5.25 },
      { date: '2008-01-01', value: 3.50, change: -33 },
      { date: '2008-09-01', value: 2.00, change: -43 },
      { date: '2008-12-01', value: 0.25, change: -88 },
      { date: '2009-06-01', value: 0.25 },
      { date: '2009-12-01', value: 0.25 },
    ],
    exchange_rate: [
      { date: '2007-01-01', value: 1200, change: 0 }, // USD/KRW
      { date: '2007-06-01', value: 950, change: -21 },
      { date: '2008-01-01', value: 1000, change: 5 },
      { date: '2008-09-01', value: 1300, change: 30 },
      { date: '2008-12-01', value: 1450, change: 12 },
      { date: '2009-06-01', value: 1250, change: -14 },
      { date: '2009-12-01', value: 1150, change: -8 },
    ],
    stock_index: [
      { date: '2007-01-01', value: 13600, change: 0 }, // S&P 500
      { date: '2007-10-01', value: 15000, change: 10 },
      { date: '2008-01-01', value: 13600, change: -9 },
      { date: '2008-09-01', value: 11600, change: -15 },
      { date: '2008-11-01', value: 8600, change: -26 },
      { date: '2009-03-09', value: 6600, change: -23 },
      { date: '2009-06-01', value: 9100, change: 38 },
      { date: '2009-12-01', value: 11400, change: 25 },
    ],
    unemployment: [
      { date: '2007-01-01', value: 4.6 },
      { date: '2007-06-01', value: 4.5 },
      { date: '2008-01-01', value: 5.0, change: 11 },
      { date: '2008-09-01', value: 6.1, change: 22 },
      { date: '2008-12-01', value: 7.3, change: 20 },
      { date: '2009-06-01', value: 9.5, change: 30 },
      { date: '2009-12-01', value: 10.0, change: 5 },
    ],
    credit_spread: [
      { date: '2007-01-01', value: 50, change: 0 }, // bps
      { date: '2007-06-01', value: 60, change: 20 },
      { date: '2008-01-01', value: 100, change: 67 },
      { date: '2008-09-01', value: 600, change: 500 },
      { date: '2008-12-01', value: 800, change: 33 },
      { date: '2009-06-01', value: 400, change: -50 },
      { date: '2009-12-01', value: 200, change: -50 },
    ],
    housing_price: [
      { date: '2006-01-01', value: 100, change: 0 }, // 지수
      { date: '2007-01-01', value: 100, change: 0 },
      { date: '2008-01-01', value: 90, change: -10 },
      { date: '2008-09-01', value: 70, change: -22 },
      { date: '2009-03-01', value: 60, change: -14 },
      { date: '2009-06-01', value: 62, change: 3 },
      { date: '2009-12-01', value: 65, change: 5 },
    ],
  },
  impactedAssets: [
    {
      name: '은행주',
      category: 'stock',
      impact: 'negative',
      changePercent: -75,
      explanation:
        '리먼브라더스 파산 이후 금융기관에 대한 신뢰가 붕괴되면서 은행주는 급락했습니다. 많은 은행이 부실채권으로 인한 손실을 입었습니다.',
      emoji: '🏦',
    },
    {
      name: '자동차 산업',
      category: 'stock',
      impact: 'negative',
      changePercent: -80,
      explanation:
        '신용 경색으로 인한 자동차 구매 감소와 경기 침체로 자동차 업체들이 큰 타격을 입었습니다.',
      emoji: '🚗',
    },
    {
      name: '미국 국채',
      category: 'bond',
      impact: 'positive',
      changePercent: 15,
      explanation:
        '안전자산 선호 현상으로 미국 국채 수익률이 급락하고 가격이 상승했습니다.',
      emoji: '📄',
    },
    {
      name: '달러화',
      category: 'currency',
      impact: 'positive',
      changePercent: 25,
      explanation:
        '글로벌 금융 위기 속에서 기축통화인 달러화로의 자금 이동이 일어났습니다.',
      emoji: '💵',
    },
    {
      name: '금(Gold)',
      category: 'commodity',
      impact: 'positive',
      changePercent: 5,
      explanation:
        '안전자산으로서의 금에 대한 수요가 증가했습니다.',
      emoji: '🏆',
    },
    {
      name: '부동산',
      category: 'real_estate',
      impact: 'negative',
      changePercent: -40,
      explanation:
        '서브프라임 모기지 부실로 촉발된 위기이므로 주택 가격이 급락했습니다.',
      emoji: '🏠',
    },
  ],
  lessons: [
    '금융 시스템의 상호 연결성: 한 부분의 부실이 전체 시스템으로 확산될 수 있습니다.',
    '지표 읽기의 중요성: 금리, 신용스프레드, 주가의 급락은 위기의 신호였습니다.',
    '안전자산 선호: 위기 시에는 국채, 달러, 금 같은 안전자산으로 자금이 몰립니다.',
    '정부 개입의 필요성: TARP 같은 대규모 정부 개입이 금융 시스템 붕괴를 막았습니다.',
    '경기 선행지표: 주가와 신용스프레드는 실물 경제 악화를 미리 알려줍니다.',
  ],
  quizzes: [
    {
      id: 'quiz-1',
      question: '리먼브라더스 사태의 직접적인 원인은 무엇인가요?',
      options: [
        '금리 인상으로 인한 경기 침체',
        '서브프라임 모기지 부실과 금융상품의 가치 급락',
        '석유 가격 폭등',
        '환율 급변',
      ],
      correctAnswer: 1,
      explanation:
        '리먼브라더스 사태는 신용도 낮은 사람들에게 제공한 서브프라임 모기지가 부실화되면서 촉발되었습니다. 이를 기반으로 한 복잡한 금융상품들의 가치가 급락하면서 금융 시스템 전체가 흔들렸습니다.',
    },
    {
      id: 'quiz-2',
      question: '2008년 9월 이후 미국 금리가 급락한 이유는?',
      options: [
        '인플레이션 때문에',
        '경기 침체를 완화하기 위한 연준의 긴급 금리 인하',
        '달러 약세 때문에',
        '국채 수익률 상승 때문에',
      ],
      correctAnswer: 1,
      explanation:
        '금융 위기로 인한 경기 침체를 완화하기 위해 미국 연준은 금리를 급격히 인하했습니다. 2008년 말에는 금리를 거의 0%까지 낮췄습니다.',
      timelineIndex: 4,
    },
    {
      id: 'quiz-3',
      question: '위기 시 다음 중 어떤 자산이 가장 먼저 상승했을까요?',
      options: [
        '은행주',
        '자동차 업체 주식',
        '미국 국채',
        '부동산',
      ],
      correctAnswer: 2,
      explanation:
        '금융 위기 시 투자자들은 안전자산으로 몰려듭니다. 미국 국채는 안전자산의 대표주자이므로 가격이 상승하고 수익률이 급락했습니다.',
    },
    {
      id: 'quiz-4',
      question: '신용스프레드(credit spread)가 급상승한 것은 무엇을 의미하나요?',
      options: [
        '기업의 실적이 좋아졌다는 신호',
        '금융기관에 대한 신뢰 붕괴로 기업 신용 위험이 급증했다는 신호',
        '금리가 인상되었다는 신호',
        '달러화가 약해졌다는 신호',
      ],
      correctAnswer: 1,
      explanation:
        '신용스프레드는 안전한 국채와 위험한 기업채의 수익률 차이입니다. 스프레드가 급상승한다는 것은 기업채 위험이 커졌다는 뜻이며, 이는 금융기관 신뢰 붕괴를 의미합니다.',
    },
  ],
};

// ============= IMF 외환 위기 (1997년) =============

export const imfCrisisCaseStudy: CaseStudy = {
  id: 'imf-crisis-1997',
  title: 'IMF 외환 위기',
  subtitle: '1997년 한국 경제 위기',
  emoji: '💱',
  period: {
    start: '1996-01-01',
    end: '1998-12-31',
  },
  summary:
    '1997년 7월 태국의 바트화 폭락으로 시작된 아시아 금융 위기가 한국으로 확산되어, 11월 한국이 IMF에 구제금융을 신청하게 된 사건. 한국 경제는 극심한 수축을 겪었고, 대량의 실업과 기업 부도가 발생했습니다.',
  cause:
    '1990년대 중반 한국의 과도한 차입과 기업의 부실 경영, 그리고 동남아시아 금융 위기의 확산이 복합적으로 작용했습니다. 외환 보유액이 급감하면서 환율이 급등했고, 기업들의 외채 상환 능력이 급격히 악화되었습니다.',
  timeline: [
    {
      id: 'event-1',
      date: '1997-07-02',
      title: '태국 바트화 폭락',
      description: '태국이 바트화 고정환율제를 포기하면서 아시아 금융 위기 시작',
      impact: 'high',
      emoji: '🌏',
    },
    {
      id: 'event-2',
      date: '1997-10-23',
      title: '원화 1,000원 돌파',
      description: '원화가 1달러=1,000원을 돌파하면서 환율 급등',
      impact: 'high',
      emoji: '📈',
    },
    {
      id: 'event-3',
      date: '1997-11-21',
      title: 'IMF 구제금융 신청',
      description: '한국이 IMF에 구제금융을 신청합니다. 국가 신용도 급락',
      impact: 'critical',
      emoji: '🆘',
    },
    {
      id: 'event-4',
      date: '1997-12-03',
      title: 'IMF 양해각서 체결',
      description: 'IMF와 구제금융 조건을 담은 양해각서를 체결합니다.',
      impact: 'high',
      emoji: '📋',
    },
    {
      id: 'event-5',
      date: '1998-01-15',
      title: '원화 1,500원 돌파',
      description: '원화가 1달러=1,500원을 돌파하면서 최악의 환율 기록',
      impact: 'critical',
      emoji: '💥',
    },
    {
      id: 'event-6',
      date: '1998-03-01',
      title: '대량 실업 사태',
      description: '기업 구조조정으로 대량의 실업이 발생합니다.',
      impact: 'critical',
      emoji: '😢',
    },
    {
      id: 'event-7',
      date: '1998-08-23',
      title: 'IMF 차입금 상환 시작',
      description: '한국이 IMF 차입금을 조기 상환하기 시작합니다.',
      impact: 'medium',
      emoji: '📈',
    },
  ],
  indicators: {
    interest_rate: [
      { date: '1996-01-01', value: 12.0 },
      { date: '1997-01-01', value: 12.5 },
      { date: '1997-11-01', value: 30.0, change: 140 }, // 긴급 인상
      { date: '1997-12-01', value: 25.0, change: -17 },
      { date: '1998-01-01', value: 20.0, change: -20 },
      { date: '1998-06-01', value: 15.0, change: -25 },
      { date: '1998-12-01', value: 12.0, change: -20 },
    ],
    exchange_rate: [
      { date: '1996-01-01', value: 800, change: 0 }, // USD/KRW
      { date: '1997-01-01', value: 850, change: 6 },
      { date: '1997-10-01', value: 1000, change: 18 },
      { date: '1997-11-01', value: 1400, change: 40 },
      { date: '1998-01-15', value: 1500, change: 7 },
      { date: '1998-06-01', value: 1300, change: -13 },
      { date: '1998-12-01', value: 1200, change: -8 },
    ],
    stock_index: [
      { date: '1996-01-01', value: 1000, change: 0 }, // KOSPI
      { date: '1997-01-01', value: 1100, change: 10 },
      { date: '1997-10-01', value: 900, change: -18 },
      { date: '1997-11-01', value: 600, change: -33 },
      { date: '1998-01-01', value: 400, change: -33 },
      { date: '1998-03-01', value: 300, change: -25 },
      { date: '1998-06-01', value: 500, change: 67 },
      { date: '1998-12-01', value: 700, change: 40 },
    ],
    unemployment: [
      { date: '1996-01-01', value: 2.0 },
      { date: '1997-01-01', value: 2.1 },
      { date: '1997-11-01', value: 2.9, change: 38 },
      { date: '1998-01-01', value: 4.4, change: 52 },
      { date: '1998-03-01', value: 7.8, change: 77 },
      { date: '1998-06-01', value: 8.5, change: 9 },
      { date: '1998-12-01', value: 7.4, change: -13 },
    ],
    credit_spread: [
      { date: '1996-01-01', value: 100, change: 0 }, // bps
      { date: '1997-01-01', value: 120, change: 20 },
      { date: '1997-10-01', value: 300, change: 150 },
      { date: '1997-11-01', value: 800, change: 167 },
      { date: '1998-01-01', value: 1200, change: 50 },
      { date: '1998-06-01', value: 600, change: -50 },
      { date: '1998-12-01', value: 300, change: -50 },
    ],
    housing_price: [
      { date: '1996-01-01', value: 100, change: 0 }, // 지수
      { date: '1997-01-01', value: 105, change: 5 },
      { date: '1997-11-01', value: 90, change: -14 },
      { date: '1998-01-01', value: 70, change: -22 },
      { date: '1998-03-01', value: 60, change: -14 },
      { date: '1998-06-01', value: 65, change: 8 },
      { date: '1998-12-01', value: 75, change: 15 },
    ],
  },
  impactedAssets: [
    {
      name: '한국 은행주',
      category: 'stock',
      impact: 'negative',
      changePercent: -70,
      explanation:
        '금융 위기로 인한 신용 경색으로 은행들이 큰 타격을 입었습니다.',
      emoji: '🏦',
    },
    {
      name: '자동차 및 조선사',
      category: 'stock',
      impact: 'negative',
      changePercent: -80,
      explanation:
        '수출 기업들이 환율 급등으로 인한 수출 경쟁력 악화와 구조조정으로 큰 손실을 입었습니다.',
      emoji: '🚢',
    },
    {
      name: '미국 달러',
      category: 'currency',
      impact: 'positive',
      changePercent: 87,
      explanation:
        '원화 급락으로 달러화 가치가 대폭 상승했습니다.',
      emoji: '💵',
    },
    {
      name: '한국 국채',
      category: 'bond',
      impact: 'negative',
      changePercent: -40,
      explanation:
        '국가 신용도 급락으로 국채 수익률이 급등했습니다.',
      emoji: '📄',
    },
    {
      name: '부동산',
      category: 'real_estate',
      impact: 'negative',
      changePercent: -35,
      explanation:
        '경기 침체와 금리 급등으로 부동산 가격이 급락했습니다.',
      emoji: '🏠',
    },
    {
      name: '수출 기업 달러 매출',
      category: 'stock',
      impact: 'positive',
      changePercent: 30,
      explanation:
        '환율 급등으로 수출 기업들의 달러 매출이 원화 기준으로 증가했습니다. (단, 수출량 감소로 전체 실적은 악화)',
      emoji: '📦',
    },
  ],
  lessons: [
    '외환 보유액의 중요성: 외환이 부족하면 환율 급등으로 경제 위기가 발생합니다.',
    '환율의 영향: 환율 급등은 수입 기업의 비용 증가, 부동산 가격 급락으로 이어집니다.',
    '금리의 이중성: 환율을 안정시키기 위해 금리를 올리면 경기 침체가 심화됩니다.',
    '구조적 개혁의 필요성: IMF 위기 이후 기업 구조조정과 금융 시스템 개혁이 필요했습니다.',
    '선행지표의 중요성: 환율, 금리, 신용스프레드의 급변은 위기의 신호였습니다.',
  ],
  quizzes: [
    {
      id: 'quiz-1',
      question: 'IMF 외환 위기의 직접적인 원인은?',
      options: [
        '미국의 금리 인상',
        '아시아 금융 위기 확산과 한국의 과도한 외채',
        '석유 가격 폭등',
        '북한의 경제 도발',
      ],
      correctAnswer: 1,
      explanation:
        '태국의 바트화 폭락으로 시작된 아시아 금융 위기가 한국으로 확산되었고, 한국의 과도한 차입과 기업 부실 경영이 복합적으로 작용했습니다.',
    },
    {
      id: 'quiz-2',
      question: '원화가 1,000원에서 1,500원으로 급등한 것의 의미는?',
      options: [
        '원화가 강해졌다는 뜻',
        '원화가 약해졌다는 뜻 (달러 대비)',
        '한국 경제가 좋아졌다는 뜻',
        '금리가 인상되었다는 뜻',
      ],
      correctAnswer: 1,
      explanation:
        '환율이 상승한다는 것은 원화의 가치가 떨어진다는 뜻입니다. 즉, 원화가 약해졌다는 의미입니다.',
      timelineIndex: 4,
    },
    {
      id: 'quiz-3',
      question: '금리를 30%까지 인상한 이유는?',
      options: [
        '인플레이션을 잡기 위해',
        '환율을 안정시키기 위해 (고금리로 외자 유입 유도)',
        '경기를 부양하기 위해',
        '은행 수익을 늘리기 위해',
      ],
      correctAnswer: 1,
      explanation:
        '환율 급등을 막기 위해 고금리로 외국 자본을 유입시키려 했습니다. 하지만 이는 기업의 차입 비용을 급증시켜 경기 침체를 심화시켰습니다.',
    },
    {
      id: 'quiz-4',
      question: '다음 중 IMF 위기 때 가장 큰 타격을 입은 산업은?',
      options: [
        '농업',
        '관광업',
        '자동차, 조선, 전자 등 수출 기업',
        '의료 서비스',
      ],
      correctAnswer: 2,
      explanation:
        '환율 급등으로 인한 수출 경쟁력 악화와 구조조정으로 수출 기업들이 가장 큰 타격을 입었습니다.',
    },
  ],
};

// ============= 케이스 스터디 목록 =============

export const caseStudies: CaseStudy[] = [lehmanBrothersCaseStudy, imfCrisisCaseStudy];

export function getCaseStudyById(id: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.id === id);
}

export function getAllCaseStudies(): CaseStudy[] {
  return caseStudies;
}
