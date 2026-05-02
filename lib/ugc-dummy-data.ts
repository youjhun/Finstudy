/**
 * UGC 컨텐츠 더미 데이터
 */

export interface UGCContent {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  description: string;
  imageUri?: string;
  videoUri?: string;
  likes: number;
  liked: boolean;
  timestamp: string;
  category: 'study' | 'tip' | 'question' | 'discussion';
}

export const DUMMY_UGC_CONTENTS: UGCContent[] = [
  {
    id: '1',
    userId: 'user-001',
    userName: '경제학 마스터',
    userAvatar: '👨‍🎓',
    title: '수요와 공급 곡선 쉽게 이해하기',
    description: '수요와 공급 곡선의 교점이 균형점이라는 개념을 실생활 예시로 설명했습니다. 커피 가격 변화를 통해 이해하기 쉽게 정리했어요!',
    likes: 234,
    liked: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'study',
  },
  {
    id: '2',
    userId: 'user-002',
    userName: '금융 전문가',
    userAvatar: '💼',
    title: 'GDP와 GNP의 차이점 팁',
    description: 'GDP는 국내총생산, GNP는 국민총생산이라는 것을 기억하세요! 국내에서 생산된 것 vs 국민이 생산한 것의 차이입니다.',
    likes: 156,
    liked: false,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    category: 'tip',
  },
  {
    id: '3',
    userId: 'user-003',
    userName: '학생 A',
    userAvatar: '👧',
    title: '인플레이션과 디플레이션의 차이가 뭔가요?',
    description: '경제학 수업에서 인플레이션과 디플레이션을 배웠는데 실생활에서 어떤 영향을 미치는지 궁금합니다. 누가 설명해주실 수 있을까요?',
    likes: 89,
    liked: false,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    category: 'question',
  },
  {
    id: '4',
    userId: 'user-004',
    userName: '토론 좋아하는 사람',
    userAvatar: '🗣️',
    title: '암호화폐가 미래의 화폐가 될까요?',
    description: '최근 비트코인과 이더리움의 가격 변동이 심합니다. 암호화폐가 정말 미래의 화폐가 될 수 있을까요? 여러분의 의견을 들어보고 싶습니다!',
    likes: 412,
    liked: false,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: 'discussion',
  },
  {
    id: '5',
    userId: 'user-005',
    userName: '경제 뉴스 팬',
    userAvatar: '📰',
    title: '최근 금리 인상의 영향',
    description: '중앙은행이 금리를 인상했을 때 주식시장, 부동산, 일반인의 생활에 미치는 영향을 정리했습니다. 매우 실용적인 정보입니다!',
    likes: 298,
    liked: false,
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    category: 'study',
  },
  {
    id: '6',
    userId: 'user-006',
    userName: '투자자',
    userAvatar: '💰',
    title: '포트폴리오 다각화 전략',
    description: '주식, 채권, 부동산, 현금 등 다양한 자산에 투자하는 방법을 설명합니다. 위험을 줄이면서 수익을 극대화하는 팁!',
    likes: 567,
    liked: false,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    category: 'tip',
  },
  {
    id: '7',
    userId: 'user-007',
    userName: '학생 B',
    userAvatar: '👦',
    title: '탄력성(Elasticity)이 뭐예요?',
    description: '경제학에서 탄력성이라는 개념이 나왔는데, 가격 탄력성, 소득 탄력성 등이 있다고 하네요. 누가 쉽게 설명해줄 수 있을까요?',
    likes: 145,
    liked: false,
    timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    category: 'question',
  },
  {
    id: '8',
    userId: 'user-008',
    userName: '경제학 교수',
    userAvatar: '🎓',
    title: '거시경제학 vs 미시경제학',
    description: '경제학을 공부할 때 거시경제학과 미시경제학의 차이를 이해하는 것이 중요합니다. 두 분야의 관계와 차이점을 설명합니다.',
    likes: 389,
    liked: false,
    timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    category: 'study',
  },
  {
    id: '9',
    userId: 'user-009',
    userName: '토론 참여자',
    userAvatar: '💬',
    title: '기본소득제도가 경제에 미치는 영향',
    description: '최근 기본소득제도에 대한 논의가 많습니다. 이것이 경제에 긍정적일까요? 부정적일까요? 여러분의 생각을 나눠주세요!',
    likes: 523,
    liked: false,
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    category: 'discussion',
  },
  {
    id: '10',
    userId: 'user-010',
    userName: '실전 경제',
    userAvatar: '🏪',
    title: '소비자 물가지수(CPI) 이해하기',
    description: '뉴스에서 자주 나오는 CPI(소비자 물가지수)가 무엇인지, 왜 중요한지 실생활 예시로 설명합니다. 인플레이션을 측정하는 중요한 지표입니다!',
    likes: 276,
    liked: false,
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    category: 'study',
  },
  {
    id: '11',
    userId: 'user-011',
    userName: '초보 투자자',
    userAvatar: '📈',
    title: '주식 투자 시작하기',
    description: '주식 투자를 처음 시작하려고 합니다. 어떤 종목을 선택해야 하고, 어떻게 분석해야 할까요? 초보자를 위한 팁을 알려주세요!',
    likes: 334,
    liked: false,
    timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    category: 'question',
  },
  {
    id: '12',
    userId: 'user-012',
    userName: '경제 분석가',
    userAvatar: '📊',
    title: '환율 변동이 수출입에 미치는 영향',
    description: '원화가 약세일 때 수출이 증가하고 수입이 감소한다는 것을 알고 계신가요? 환율 변동의 경제적 영향을 상세히 분석합니다.',
    likes: 445,
    liked: false,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    category: 'study',
  },
];
