/**
 * NCS/자격증 대비 학습 데이터
 * 투자운용기능사, AFPK 금융 자격증 기출문제 (디테일 버전)
 */

export interface CertificationQuiz {
  id: string;
  certification: 'AFPK' | 'IAMP';
  category: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  year?: number;
}

export const NCS_CERTIFICATION_QUIZZES: CertificationQuiz[] = [
  // ========================================
  // AFPK (재무설계사) - 6개 과목
  // ========================================

  // --- AFPK: 재무설계 개론 ---
  {
    id: 'afpk_101',
    certification: 'AFPK',
    category: '재무설계 개론',
    question: '재무설계 6단계 프로세스의 올바른 순서는?',
    choices: [
      '고객관계 설정 → 정보수집 → 분석·평가 → 제안서 작성 → 실행 → 모니터링',
      '정보수집 → 고객관계 설정 → 분석·평가 → 실행 → 제안서 작성 → 모니터링',
      '고객관계 설정 → 분석·평가 → 정보수집 → 제안서 작성 → 모니터링 → 실행',
      '정보수집 → 분석·평가 → 고객관계 설정 → 제안서 작성 → 실행 → 모니터링',
    ],
    answer: 0,
    explanation:
      'FPSB(Financial Planning Standards Board)가 정한 재무설계 6단계는 ①고객관계 설정 ②재무정보 수집 ③재무상태 분석·평가 ④재무설계 제안서 작성 ⑤제안서 실행 ⑥모니터링 순서입니다. 이 프로세스는 고객의 재무 목표를 체계적으로 달성하기 위한 표준화된 절차입니다.',
    difficulty: 'easy',
    year: 2024,
  },
  {
    id: 'afpk_102',
    certification: 'AFPK',
    category: '재무설계 개론',
    question: '재무설계사의 윤리원칙 중 "고객 우선의 원칙"에 해당하지 않는 것은?',
    choices: [
      '고객의 이익을 재무설계사 자신의 이익보다 우선시한다',
      '이해상충이 발생할 경우 고객에게 사전 고지한다',
      '고객의 투자 성향에 관계없이 고수익 상품을 권유한다',
      '고객의 비밀정보를 정당한 사유 없이 제3자에게 공개하지 않는다',
    ],
    answer: 2,
    explanation:
      '고객 우선의 원칙은 재무설계사가 고객의 이익을 최우선으로 고려해야 한다는 것입니다. 고객의 투자 성향을 무시하고 고수익 상품을 권유하는 것은 적합성 원칙에 위배되며, 고객 우선의 원칙에도 반합니다.',
    difficulty: 'medium',
    year: 2024,
  },
  {
    id: 'afpk_103',
    certification: 'AFPK',
    category: '재무설계 개론',
    question: '화폐의 시간가치에서 현재가치(PV) 계산 시, 할인율이 높아지면 현재가치는 어떻게 변하는가?',
    choices: [
      '현재가치가 증가한다',
      '현재가치가 감소한다',
      '현재가치에 변화가 없다',
      '미래가치에만 영향을 미친다',
    ],
    answer: 1,
    explanation:
      'PV = FV / (1+r)^n 공식에서 할인율(r)이 높아지면 분모가 커지므로 현재가치(PV)는 감소합니다. 이는 미래에 받을 금액의 현재 가치가 할인율이 높을수록 더 적어진다는 의미입니다. 예를 들어, 1년 후 100만원의 현재가치는 할인율 5%일 때 약 95.2만원이지만, 할인율 10%일 때는 약 90.9만원입니다.',
    difficulty: 'easy',
    year: 2023,
  },
  {
    id: 'afpk_104',
    certification: 'AFPK',
    category: '재무설계 개론',
    question: '다음 중 재무비율 분석에서 "부채비율"의 올바른 계산식은?',
    choices: [
      '총부채 ÷ 총자산 × 100',
      '총부채 ÷ 순자산 × 100',
      '순자산 ÷ 총부채 × 100',
      '총자산 ÷ 총부채 × 100',
    ],
    answer: 1,
    explanation:
      '부채비율 = 총부채 ÷ 순자산(자기자본) × 100으로 계산합니다. 이는 자기자본 대비 타인자본의 비율을 나타내며, 일반적으로 200% 이하가 건전한 수준으로 평가됩니다. 참고로 총부채÷총자산×100은 "부채-자산 비율(Debt-to-Asset Ratio)"입니다.',
    difficulty: 'medium',
    year: 2024,
  },

  // --- AFPK: 투자설계 ---
  {
    id: 'afpk_201',
    certification: 'AFPK',
    category: '투자설계',
    question: '마코위츠(Markowitz)의 포트폴리오 이론에서 효율적 프론티어(Efficient Frontier)란?',
    choices: [
      '동일 위험 수준에서 최대 수익률을 제공하는 포트폴리오의 집합',
      '무위험 수익률과 시장 포트폴리오를 연결하는 직선',
      '모든 개별 자산의 기대수익률을 연결한 곡선',
      '위험이 0인 포트폴리오들의 집합',
    ],
    answer: 0,
    explanation:
      '효율적 프론티어는 동일한 위험(표준편차) 수준에서 최대 기대수익률을 제공하거나, 동일한 기대수익률 수준에서 최소 위험을 제공하는 포트폴리오들의 집합입니다. 투자자는 효율적 프론티어 위의 포트폴리오 중 자신의 위험 선호도에 맞는 것을 선택해야 합니다.',
    difficulty: 'medium',
    year: 2024,
  },
  {
    id: 'afpk_202',
    certification: 'AFPK',
    category: '투자설계',
    question: 'CAPM(자본자산가격결정모형)에서 베타(β)가 1.5인 주식의 의미는?',
    choices: [
      '시장 수익률이 1% 변할 때 해당 주식은 1.5% 변동한다',
      '해당 주식의 기대수익률이 시장의 1.5배이다',
      '해당 주식의 총위험이 시장의 1.5배이다',
      '해당 주식의 비체계적 위험이 1.5배이다',
    ],
    answer: 0,
    explanation:
      'CAPM에서 베타(β)는 체계적 위험(시장위험)에 대한 민감도를 나타냅니다. β=1.5는 시장 수익률이 1% 상승(하락)할 때 해당 주식은 평균적으로 1.5% 상승(하락)한다는 의미입니다. E(Ri) = Rf + βi × [E(Rm) - Rf] 공식에서 베타가 클수록 위험 프리미엄이 커집니다.',
    difficulty: 'hard',
    year: 2023,
  },
  {
    id: 'afpk_203',
    certification: 'AFPK',
    category: '투자설계',
    question: '샤프 비율(Sharpe Ratio)의 올바른 해석은?',
    choices: [
      '총위험 1단위당 초과수익률의 크기',
      '체계적 위험 1단위당 초과수익률의 크기',
      '비체계적 위험 1단위당 총수익률의 크기',
      '무위험 수익률 대비 총수익률의 비율',
    ],
    answer: 0,
    explanation:
      '샤프 비율 = (포트폴리오 수익률 - 무위험 수익률) ÷ 포트폴리오 표준편차입니다. 이는 총위험(표준편차) 1단위당 무위험 수익률을 초과하는 수익률(초과수익률)의 크기를 의미합니다. 샤프 비율이 높을수록 위험 대비 수익이 우수합니다. 참고로 체계적 위험 1단위당 초과수익률은 트레이너 비율입니다.',
    difficulty: 'hard',
    year: 2024,
  },
  {
    id: 'afpk_204',
    certification: 'AFPK',
    category: '투자설계',
    question: '채권의 듀레이션(Duration)에 대한 설명으로 옳은 것은?',
    choices: [
      '채권 만기까지의 남은 기간을 의미한다',
      '금리 변동에 대한 채권 가격의 민감도를 나타낸다',
      '채권의 신용위험을 측정하는 지표이다',
      '채권의 유동성을 나타내는 지표이다',
    ],
    answer: 1,
    explanation:
      '듀레이션은 채권의 현금흐름을 현재가치로 가중평균한 기간으로, 금리 변동에 대한 채권 가격의 민감도를 나타냅니다. 듀레이션이 5년인 채권은 금리가 1% 상승하면 가격이 약 5% 하락합니다. 만기와는 다른 개념으로, 이표채의 듀레이션은 항상 만기보다 짧습니다.',
    difficulty: 'hard',
    year: 2024,
  },

  // --- AFPK: 보험설계 ---
  {
    id: 'afpk_301',
    certification: 'AFPK',
    category: '보험설계',
    question: '보험의 대수의 법칙(Law of Large Numbers)에 대한 설명으로 옳은 것은?',
    choices: [
      '보험 가입자가 많을수록 보험료가 비싸진다',
      '관찰 대상이 많을수록 실제 손실률이 예상 손실률에 수렴한다',
      '보험금 지급 건수가 많을수록 보험사의 수익이 증가한다',
      '보험 계약 기간이 길수록 위험이 감소한다',
    ],
    answer: 1,
    explanation:
      '대수의 법칙은 관찰 대상(보험 가입자)의 수가 충분히 많으면 실제 발생하는 손실률이 통계적으로 예상한 손실률에 수렴한다는 원리입니다. 이를 통해 보험회사는 적정 보험료를 산출할 수 있으며, 이는 보험 사업의 수학적 기초가 됩니다.',
    difficulty: 'medium',
    year: 2024,
  },
  {
    id: 'afpk_302',
    certification: 'AFPK',
    category: '보험설계',
    question: '종신보험과 정기보험의 가장 큰 차이점은?',
    choices: [
      '보험료 납입 기간의 차이',
      '보장 기간의 유한성 여부',
      '보험금 지급 사유의 차이',
      '가입 연령 제한의 차이',
    ],
    answer: 1,
    explanation:
      '종신보험은 피보험자가 사망할 때까지 보장이 계속되는 반면(종신 보장), 정기보험은 일정 기간(10년, 20년 등)만 보장합니다. 정기보험은 보장 기간이 유한하므로 종신보험보다 보험료가 저렴하지만, 만기 시 보장이 종료됩니다.',
    difficulty: 'easy',
    year: 2024,
  },
  {
    id: 'afpk_303',
    certification: 'AFPK',
    category: '보험설계',
    question: '변액보험의 특징으로 옳지 않은 것은?',
    choices: [
      '보험료 일부가 특별계정에서 펀드로 운용된다',
      '투자 실적에 따라 보험금이 변동될 수 있다',
      '원금이 보장되므로 안전한 투자 수단이다',
      '사망보험금은 최저보증이 있는 경우가 많다',
    ],
    answer: 2,
    explanation:
      '변액보험은 보험료의 일부를 주식·채권 등 펀드에 투자하여 그 실적에 따라 보험금이 변동되는 상품입니다. 투자 실적이 좋으면 보험금이 증가하지만, 나쁘면 감소할 수도 있어 원금이 보장되지 않습니다. 다만, 사망보험금에 대해서는 최저보증(기본보험금)이 있는 경우가 일반적입니다.',
    difficulty: 'medium',
    year: 2023,
  },

  // --- AFPK: 세금설계 ---
  {
    id: 'afpk_401',
    certification: 'AFPK',
    category: '세금설계',
    question: '종합소득세 과세 대상에 해당하지 않는 소득은?',
    choices: [
      '이자소득',
      '배당소득',
      '양도소득',
      '사업소득',
    ],
    answer: 2,
    explanation:
      '종합소득세는 이자·배당·사업·근로·연금·기타소득을 합산하여 과세합니다. 양도소득은 종합소득에 합산되지 않고 별도로 분류과세됩니다. 퇴직소득도 마찬가지로 분류과세 대상입니다.',
    difficulty: 'easy',
    year: 2024,
  },
  {
    id: 'afpk_402',
    certification: 'AFPK',
    category: '세금설계',
    question: '금융소득종합과세 기준금액은 연간 얼마인가?',
    choices: [
      '1,000만원',
      '2,000만원',
      '3,000만원',
      '4,000만원',
    ],
    answer: 1,
    explanation:
      '금융소득(이자소득 + 배당소득)이 연간 2,000만원을 초과하면 종합소득에 합산하여 누진세율(6~45%)로 과세됩니다. 2,000만원 이하인 경우에는 원천징수세율(15.4%)로 분리과세됩니다.',
    difficulty: 'easy',
    year: 2024,
  },
  {
    id: 'afpk_403',
    certification: 'AFPK',
    category: '세금설계',
    question: '증여세 면제 한도(직계존비속 간)는 성인 자녀 기준 10년간 얼마인가?',
    choices: [
      '3,000만원',
      '5,000만원',
      '1억원',
      '2억원',
    ],
    answer: 1,
    explanation:
      '직계존속(부모, 조부모)이 성인 자녀에게 증여할 경우 10년간 5,000만원까지 증여세가 면제됩니다. 미성년 자녀의 경우 2,000만원, 배우자 간에는 6억원까지 면제됩니다. 이 한도를 초과하는 금액에 대해 10~50%의 증여세율이 적용됩니다.',
    difficulty: 'medium',
    year: 2024,
  },

  // --- AFPK: 부동산설계 ---
  {
    id: 'afpk_501',
    certification: 'AFPK',
    category: '부동산설계',
    question: 'DTI(총부채상환비율)의 계산식으로 올바른 것은?',
    choices: [
      '(주택담보대출 원리금 상환액 + 기타 대출 이자) ÷ 연소득 × 100',
      '총부채 ÷ 주택가격 × 100',
      '주택담보대출 ÷ 연소득 × 100',
      '총자산 ÷ 총부채 × 100',
    ],
    answer: 0,
    explanation:
      'DTI = (주택담보대출 연간 원리금 상환액 + 기타 대출 연간 이자 상환액) ÷ 연소득 × 100입니다. DTI 규제는 차주의 소득 대비 부채 상환 능력을 평가하여 과도한 대출을 방지하는 제도입니다. 참고로 LTV는 주택담보대출÷주택가격×100입니다.',
    difficulty: 'medium',
    year: 2024,
  },
  {
    id: 'afpk_502',
    certification: 'AFPK',
    category: '부동산설계',
    question: '부동산 투자의 레버리지 효과에 대한 설명으로 옳은 것은?',
    choices: [
      '자기자본만으로 투자할 때 수익률이 극대화된다',
      '차입금을 활용하면 자기자본수익률이 항상 높아진다',
      '총투자수익률이 차입금 이자율보다 높으면 레버리지 효과가 양(+)이다',
      '레버리지 비율이 높을수록 투자 위험은 감소한다',
    ],
    answer: 2,
    explanation:
      '양(+)의 레버리지 효과는 총투자수익률 > 차입금 이자율일 때 발생합니다. 이 경우 차입금을 활용할수록 자기자본수익률(ROE)이 높아집니다. 반대로 총투자수익률 < 이자율이면 음(-)의 레버리지 효과가 발생하여 ROE가 오히려 낮아집니다.',
    difficulty: 'hard',
    year: 2023,
  },

  // --- AFPK: 은퇴설계 ---
  {
    id: 'afpk_601',
    certification: 'AFPK',
    category: '은퇴설계',
    question: '국민연금의 노령연금 수급 개시 연령(1969년 이후 출생자)은?',
    choices: [
      '60세',
      '62세',
      '65세',
      '67세',
    ],
    answer: 2,
    explanation:
      '국민연금 노령연금의 수급 개시 연령은 출생연도에 따라 단계적으로 상향됩니다. 1969년 이후 출생자는 65세부터 수급이 가능합니다. 조기노령연금은 5년 일찍(60세) 수급 가능하나 감액됩니다.',
    difficulty: 'easy',
    year: 2024,
  },
  {
    id: 'afpk_602',
    certification: 'AFPK',
    category: '은퇴설계',
    question: '퇴직연금 DC형(확정기여형)의 특징으로 옳은 것은?',
    choices: [
      '사용자가 퇴직급여 수준을 사전에 확정한다',
      '근로자가 적립금 운용 방법을 결정한다',
      '운용 결과에 관계없이 퇴직급여가 보장된다',
      '중도인출이 불가능하다',
    ],
    answer: 1,
    explanation:
      'DC형(확정기여형)은 사용자가 매년 연간 임금총액의 1/12 이상을 부담금으로 납입하고, 근로자가 직접 적립금의 운용 방법을 결정합니다. 운용 실적에 따라 퇴직급여가 변동되므로 투자 위험은 근로자가 부담합니다. DB형(확정급여형)은 반대로 퇴직급여가 사전 확정됩니다.',
    difficulty: 'medium',
    year: 2024,
  },

  // ========================================
  // 투자운용기능사 (IAMP) - 5개 과목
  // ========================================

  // --- 투자운용기능사: 금융상품 및 세제 ---
  {
    id: 'iamp_101',
    certification: 'IAMP',
    category: '금융상품 및 세제',
    question: 'ETF(상장지수펀드)의 특징으로 옳지 않은 것은?',
    choices: [
      '증권거래소에 상장되어 주식처럼 실시간 매매 가능',
      '일반 펀드보다 운용보수가 낮은 편',
      '설정·환매가 불가능하여 유통시장에서만 거래',
      '지수를 추종하는 패시브 운용이 기본',
    ],
    answer: 2,
    explanation:
      'ETF는 증권거래소에서 주식처럼 매매할 수 있을 뿐만 아니라, 지정참가회사(AP)를 통해 설정·환매도 가능합니다. 이 이중 거래 구조 덕분에 ETF의 시장가격이 순자산가치(NAV)에 수렴하게 됩니다. 일반 투자자는 주로 유통시장에서 거래합니다.',
    difficulty: 'medium',
    year: 2024,
  },
  {
    id: 'iamp_102',
    certification: 'IAMP',
    category: '금융상품 및 세제',
    question: '다음 중 파생결합증권(ELS)의 원금비보장형에 해당하는 구조는?',
    choices: [
      '녹인(Knock-In) 배리어가 있는 스텝다운형',
      '원금보장형 DLS',
      '만기 시 원금 100% 보장 + 추가 수익형',
      '예금자보호 대상 ELB',
    ],
    answer: 0,
    explanation:
      '녹인(Knock-In) 배리어가 있는 스텝다운형 ELS는 기초자산 가격이 배리어 이하로 하락하면 원금 손실이 발생할 수 있는 원금비보장형 구조입니다. 스텝다운형은 조기상환 조건이 단계적으로 낮아지는 구조로, 국내에서 가장 많이 발행되는 ELS 유형입니다.',
    difficulty: 'hard',
    year: 2024,
  },
  {
    id: 'iamp_103',
    certification: 'IAMP',
    category: '금융상품 및 세제',
    question: '국내 주식형 공모펀드의 매매차익에 대한 과세 방식은?',
    choices: [
      '배당소득세 15.4% 과세',
      '양도소득세 22% 과세',
      '비과세',
      '종합소득세에 합산 과세',
    ],
    answer: 2,
    explanation:
      '국내 주식형 공모펀드의 주식 매매차익(국내 상장주식)은 비과세입니다. 다만, 채권 이자·할인액, 해외주식 매매차익, 파생상품 거래 이익 등은 배당소득으로 과세(15.4%)됩니다. 2025년 금융투자소득세 도입이 유예된 상태입니다.',
    difficulty: 'medium',
    year: 2024,
  },

  // --- 투자운용기능사: 투자운용 및 전략 ---
  {
    id: 'iamp_201',
    certification: 'IAMP',
    category: '투자운용 및 전략',
    question: '전략적 자산배분(SAA)과 전술적 자산배분(TAA)의 차이점으로 옳은 것은?',
    choices: [
      'SAA는 단기 시장 전망에 기반하고, TAA는 장기 목표에 기반한다',
      'SAA는 장기 투자 목표에 기반하고, TAA는 단기 시장 전망에 따라 비중을 조절한다',
      'SAA와 TAA는 동일한 개념이다',
      'SAA는 개별 종목 선택이고, TAA는 자산군 배분이다',
    ],
    answer: 1,
    explanation:
      '전략적 자산배분(SAA)은 투자자의 장기 투자 목표, 위험 허용도에 기반하여 자산군별 기본 비중을 결정하는 것입니다. 전술적 자산배분(TAA)은 단기적 시장 전망에 따라 SAA에서 정한 기본 비중을 일시적으로 조절하여 초과수익을 추구하는 전략입니다.',
    difficulty: 'medium',
    year: 2024,
  },
  {
    id: 'iamp_202',
    certification: 'IAMP',
    category: '투자운용 및 전략',
    question: '인핸스드 인덱스(Enhanced Index) 전략에 대한 설명으로 옳은 것은?',
    choices: [
      '벤치마크 지수를 정확히 복제하는 전략',
      '벤치마크 대비 소폭의 초과수익을 추구하면서 추적오차를 제한하는 전략',
      '벤치마크와 무관하게 절대수익을 추구하는 전략',
      '공매도를 활용한 시장중립 전략',
    ],
    answer: 1,
    explanation:
      '인핸스드 인덱스 전략은 순수 인덱스 전략과 액티브 전략의 중간 형태로, 벤치마크 지수 대비 소폭(연 0.5~2%)의 초과수익을 목표로 하면서 추적오차(Tracking Error)를 일정 수준 이하로 관리합니다. 종목 비중 미세 조정, 파생상품 활용 등의 방법을 사용합니다.',
    difficulty: 'hard',
    year: 2023,
  },
  {
    id: 'iamp_203',
    certification: 'IAMP',
    category: '투자운용 및 전략',
    question: '모멘텀(Momentum) 투자 전략에 대한 설명으로 옳은 것은?',
    choices: [
      '저평가된 주식을 매수하여 장기 보유하는 전략',
      '최근 수익률이 높은 자산을 매수하고 낮은 자산을 매도하는 전략',
      '배당수익률이 높은 주식에 집중 투자하는 전략',
      '시가총액이 작은 소형주에 투자하는 전략',
    ],
    answer: 1,
    explanation:
      '모멘텀 전략은 최근 일정 기간(3~12개월) 수익률이 높은 자산(승자)을 매수하고, 수익률이 낮은 자산(패자)을 매도하는 전략입니다. "추세는 지속된다"는 가정에 기반하며, Jegadeesh & Titman(1993) 연구에서 유효성이 입증되었습니다.',
    difficulty: 'medium',
    year: 2024,
  },

  // --- 투자운용기능사: 해외증권투자 ---
  {
    id: 'iamp_301',
    certification: 'IAMP',
    category: '해외증권투자',
    question: '해외 주식 투자 시 환헤지(Currency Hedging)를 하는 주된 이유는?',
    choices: [
      '해외 주식의 배당금을 극대화하기 위해',
      '환율 변동에 따른 투자 수익의 불확실성을 줄이기 위해',
      '해외 주식의 거래 수수료를 절감하기 위해',
      '해외 주식의 유동성을 높이기 위해',
    ],
    answer: 1,
    explanation:
      '환헤지는 환율 변동이 해외 투자 수익에 미치는 영향을 제거하거나 줄이기 위한 것입니다. 예를 들어, 미국 주식이 10% 상승해도 원/달러 환율이 10% 하락하면 원화 기준 수익이 0%에 가까워질 수 있습니다. 선물환, 통화스왑 등을 활용하여 환위험을 관리합니다.',
    difficulty: 'easy',
    year: 2024,
  },
  {
    id: 'iamp_302',
    certification: 'IAMP',
    category: '해외증권투자',
    question: 'ADR(American Depositary Receipt)에 대한 설명으로 옳은 것은?',
    choices: [
      '미국 기업이 해외에서 발행하는 채권',
      '외국 기업의 주식을 기초로 미국에서 발행되는 예탁증서',
      '미국 정부가 발행하는 국채의 일종',
      '미국 증권거래소에서만 거래되는 ETF',
    ],
    answer: 1,
    explanation:
      'ADR은 외국 기업의 주식을 미국 예탁은행이 보관하고, 이를 기초로 미국에서 발행하는 예탁증서입니다. 미국 투자자가 외국 주식에 간접적으로 투자할 수 있게 해주며, 달러로 거래되고 미국 증권법의 적용을 받습니다. 삼성전자, 소니 등 많은 외국 기업이 ADR을 발행합니다.',
    difficulty: 'medium',
    year: 2024,
  },

  // --- 투자운용기능사: 파생상품 ---
  {
    id: 'iamp_401',
    certification: 'IAMP',
    category: '파생상품',
    question: '콜옵션 매수자의 손익 구조에 대한 설명으로 옳은 것은?',
    choices: [
      '기초자산 가격이 하락할수록 이익이 증가한다',
      '최대 손실은 프리미엄으로 한정되고, 이익은 무한대이다',
      '최대 이익은 프리미엄으로 한정되고, 손실은 무한대이다',
      '기초자산 가격과 관계없이 일정한 수익을 얻는다',
    ],
    answer: 1,
    explanation:
      '콜옵션 매수자는 기초자산을 행사가격에 매수할 수 있는 권리를 가집니다. 기초자산 가격이 상승하면 이익이 무한대로 증가할 수 있으며, 하락하면 옵션을 행사하지 않으므로 최대 손실은 지불한 프리미엄(옵션 매수 비용)으로 한정됩니다.',
    difficulty: 'medium',
    year: 2024,
  },
  {
    id: 'iamp_402',
    certification: 'IAMP',
    category: '파생상품',
    question: '블랙-숄즈(Black-Scholes) 옵션가격결정모형의 가정에 해당하지 않는 것은?',
    choices: [
      '기초자산 가격은 기하브라운운동을 따른다',
      '무위험이자율은 일정하다',
      '기초자산의 변동성은 시간에 따라 변한다',
      '거래비용과 세금이 없다',
    ],
    answer: 2,
    explanation:
      '블랙-숄즈 모형은 ①기초자산 가격이 기하브라운운동(로그정규분포) ②무위험이자율 일정 ③변동성(σ) 일정 ④거래비용·세금 없음 ⑤배당 없음 ⑥연속거래 가능 등을 가정합니다. 변동성이 시간에 따라 변한다는 것은 이 모형의 가정에 해당하지 않습니다.',
    difficulty: 'hard',
    year: 2023,
  },
  {
    id: 'iamp_403',
    certification: 'IAMP',
    category: '파생상품',
    question: '선물(Futures)과 선도(Forward)의 차이점으로 옳은 것은?',
    choices: [
      '선물은 장외시장, 선도는 거래소에서 거래된다',
      '선물은 표준화된 계약이고 일일정산이 이루어진다',
      '선도는 증거금이 필요하고 선물은 필요하지 않다',
      '선물과 선도는 동일한 상품이다',
    ],
    answer: 1,
    explanation:
      '선물(Futures)은 거래소에서 거래되는 표준화된 계약으로, 일일정산(Mark-to-Market)이 이루어지고 증거금이 필요합니다. 선도(Forward)는 장외시장(OTC)에서 당사자 간 맞춤형으로 체결되며, 만기까지 정산이 이루어지지 않아 신용위험이 존재합니다.',
    difficulty: 'easy',
    year: 2024,
  },

  // --- 투자운용기능사: 리스크관리 ---
  {
    id: 'iamp_501',
    certification: 'IAMP',
    category: '리스크관리',
    question: 'VaR(Value at Risk) 측정 방법 중 역사적 시뮬레이션법의 장점은?',
    choices: [
      '정규분포 가정이 필요하지 않다',
      '미래 시장 상황을 정확히 예측할 수 있다',
      '데이터가 적어도 정확한 결과를 산출한다',
      '비선형 위험을 측정할 수 없다',
    ],
    answer: 0,
    explanation:
      '역사적 시뮬레이션법은 과거 실제 수익률 데이터를 사용하여 VaR를 산출하므로, 수익률 분포에 대한 특정 가정(정규분포 등)이 필요하지 않습니다. 팻테일(Fat Tail), 비대칭 분포 등 실제 시장의 특성을 반영할 수 있다는 장점이 있습니다.',
    difficulty: 'hard',
    year: 2024,
  },
  {
    id: 'iamp_502',
    certification: 'IAMP',
    category: '리스크관리',
    question: '스트레스 테스트(Stress Test)의 목적으로 가장 적절한 것은?',
    choices: [
      '일상적인 시장 변동에 대한 손실을 측정',
      '극단적 시장 상황에서의 잠재적 손실을 평가',
      '포트폴리오의 평균 수익률을 계산',
      '개별 종목의 신용등급을 평가',
    ],
    answer: 1,
    explanation:
      '스트레스 테스트는 금융위기, 급격한 금리 변동 등 극단적이지만 발생 가능한 시나리오 하에서 포트폴리오가 입을 수 있는 잠재적 손실을 평가하는 방법입니다. VaR가 일상적 시장 상황에서의 위험을 측정한다면, 스트레스 테스트는 VaR의 한계를 보완하여 꼬리위험(Tail Risk)을 평가합니다.',
    difficulty: 'medium',
    year: 2024,
  },
  {
    id: 'iamp_503',
    certification: 'IAMP',
    category: '리스크관리',
    question: '트래킹 에러(Tracking Error)에 대한 설명으로 옳은 것은?',
    choices: [
      '펀드 수익률과 벤치마크 수익률 차이의 표준편차',
      '펀드의 총위험을 나타내는 지표',
      '펀드의 유동성 위험을 측정하는 지표',
      '펀드의 신용위험을 나타내는 지표',
    ],
    answer: 0,
    explanation:
      '트래킹 에러(추적오차)는 펀드 수익률과 벤치마크 수익률의 차이(초과수익률)의 표준편차입니다. 인덱스 펀드는 트래킹 에러를 최소화하는 것이 목표이며, 액티브 펀드는 일정 수준의 트래킹 에러를 허용하면서 초과수익을 추구합니다.',
    difficulty: 'medium',
    year: 2023,
  },

  // --- 투자운용기능사: 직무윤리 및 법규 ---
  {
    id: 'iamp_601',
    certification: 'IAMP',
    category: '직무윤리 및 법규',
    question: '자본시장법상 집합투자업자의 선관주의 의무에 해당하는 것은?',
    choices: [
      '투자자의 이익을 위해 최선을 다해 운용해야 한다',
      '자신의 이익을 우선시하여 운용할 수 있다',
      '특정 투자자에게 유리한 거래를 할 수 있다',
      '운용 결과에 대해 책임을 지지 않는다',
    ],
    answer: 0,
    explanation:
      '자본시장법 제79조에 따라 집합투자업자는 투자자의 이익을 보호하기 위해 선량한 관리자의 주의로써 집합투자재산을 운용해야 합니다. 이는 신인의무(Fiduciary Duty)의 핵심으로, 자기거래 금지, 이해상충 방지 등의 의무를 포함합니다.',
    difficulty: 'easy',
    year: 2024,
  },
  {
    id: 'iamp_602',
    certification: 'IAMP',
    category: '직무윤리 및 법규',
    question: '미공개중요정보 이용행위(내부자거래)에 해당하는 것은?',
    choices: [
      '공시된 실적 정보를 바탕으로 투자 결정',
      '상장법인의 합병 정보를 사전에 입수하여 주식 매수',
      '증권사 리서치 보고서를 참고하여 투자',
      '기술적 분석을 통한 매매 타이밍 결정',
    ],
    answer: 1,
    explanation:
      '미공개중요정보 이용행위는 상장법인의 업무 등과 관련된 미공개 중요정보를 이용하여 해당 법인의 증권을 매매하는 행위입니다. 합병, 대규모 계약 체결 등의 정보를 공시 전에 입수하여 거래하는 것은 자본시장법 제174조에 의해 금지됩니다.',
    difficulty: 'medium',
    year: 2024,
  },
];

/**
 * 자격증별 퀴즈 필터링
 */
export function getQuizzesByCertification(
  certification: 'AFPK' | 'IAMP'
): CertificationQuiz[] {
  return NCS_CERTIFICATION_QUIZZES.filter((q) => q.certification === certification);
}

/**
 * 카테고리별 퀴즈 필터링
 */
export function getQuizzesByCategory(
  certification: 'AFPK' | 'IAMP',
  category: string
): CertificationQuiz[] {
  return NCS_CERTIFICATION_QUIZZES.filter(
    (q) => q.certification === certification && q.category === category
  );
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
  certification: 'AFPK' | 'IAMP',
  difficulty: 'easy' | 'medium' | 'hard'
): CertificationQuiz[] {
  return NCS_CERTIFICATION_QUIZZES.filter(
    (q) => q.certification === certification && q.difficulty === difficulty
  );
}

/**
 * 자격증별 카테고리 목록 가져오기
 */
export function getCategoriesByCertification(
  certification: 'AFPK' | 'IAMP'
): string[] {
  const quizzes = getQuizzesByCertification(certification);
  return [...new Set(quizzes.map((q) => q.category))];
}

/**
 * 자격증 정보
 */
export const CERTIFICATIONS = [
  {
    id: 'IAMP',
    name: '투자운용기능사',
    description: '금융투자협회 주관. 집합투자재산 운용 업무를 수행하기 위한 필수 자격증. 펀드매니저의 등용문.',
    icon: '📈',
    color: '#4ECDC4',
    subjects: ['금융상품 및 세제', '투자운용 및 전략', '해외증권투자', '파생상품', '리스크관리', '직무윤리 및 법규'],
    totalQuestions: 80,
    passingScore: 70,
    examTime: 120,
  },
  {
    id: 'AFPK',
    name: 'AFPK (재무설계사)',
    description: '한국FPSB 주관. 종합 재무설계 능력을 인증하는 자격증. CFP의 전 단계로 금융권 취업에 유리.',
    icon: '💼',
    color: '#FF6B6B',
    subjects: ['재무설계 개론', '투자설계', '보험설계', '세금설계', '부동산설계', '은퇴설계'],
    totalQuestions: 100,
    passingScore: 70,
    examTime: 150,
  },
];
