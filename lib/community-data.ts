/**
 * 커뮤니티 기능 데이터 타입 및 샘플 데이터
 */

export interface CommunityUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
}

export interface CommunityPost {
  id: string;
  author: CommunityUser;
  title: string;
  content: string;
  category: 'question' | 'discussion' | 'tip' | 'news';
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  liked?: boolean;
}

export interface CommunityComment {
  id: string;
  author: CommunityUser;
  content: string;
  likes: number;
  createdAt: string;
  liked?: boolean;
}

export const sampleCommunityUsers: CommunityUser[] = [
  {
    id: 'user1',
    name: '경제박사',
    avatar: '👨‍🎓',
    level: 15,
    xp: 4500,
  },
  {
    id: 'user2',
    name: '투자초보',
    avatar: '👩‍💼',
    level: 8,
    xp: 2100,
  },
  {
    id: 'user3',
    name: '금융전문가',
    avatar: '👨‍💻',
    level: 22,
    xp: 6800,
  },
  {
    id: 'user4',
    name: '경제학생',
    avatar: '👩‍🎓',
    level: 5,
    xp: 1200,
  },
];

export const sampleCommunityPosts: CommunityPost[] = [
  {
    id: 'post1',
    author: sampleCommunityUsers[0],
    title: '금리 인상이 주식시장에 미치는 영향',
    content:
      '최근 중앙은행의 금리 인상 결정이 나왔습니다. 이것이 주식시장에 어떤 영향을 미칠까요? 전문가들의 의견을 나누고 싶습니다.',
    category: 'discussion',
    likes: 234,
    comments: 45,
    views: 1200,
    createdAt: '2026-04-16T10:30:00Z',
    liked: false,
  },
  {
    id: 'post2',
    author: sampleCommunityUsers[1],
    title: '초보자를 위한 주식 투자 팁',
    content:
      '저는 최근 주식 투자를 시작했습니다. 초보자가 알아야 할 중요한 팁들을 공유하고 싶습니다. 분산 투자, 장기 투자, 감정 조절 등이 중요합니다.',
    category: 'tip',
    likes: 456,
    comments: 78,
    views: 2100,
    createdAt: '2026-04-16T09:15:00Z',
    liked: false,
  },
  {
    id: 'post3',
    author: sampleCommunityUsers[2],
    title: '인플레이션이란 무엇인가요?',
    content:
      '많은 분들이 인플레이션에 대해 궁금해하십니다. 인플레이션의 정의, 원인, 그리고 우리의 생활에 미치는 영향을 상세히 설명하겠습니다.',
    category: 'question',
    likes: 189,
    comments: 32,
    views: 890,
    createdAt: '2026-04-16T08:45:00Z',
    liked: false,
  },
  {
    id: 'post4',
    author: sampleCommunityUsers[3],
    title: '오늘 경제 뉴스 요약',
    content:
      '오늘 발표된 주요 경제 지표들을 정리했습니다. 실업률, GDP, 소비자물가지수 등 주요 경제 지표들의 최신 동향을 확인해보세요.',
    category: 'news',
    likes: 312,
    comments: 56,
    views: 1450,
    createdAt: '2026-04-16T07:30:00Z',
    liked: false,
  },
  {
    id: 'post5',
    author: sampleCommunityUsers[0],
    title: 'ESG 투자의 미래',
    content:
      'ESG(환경, 사회, 지배구조) 투자가 점점 중요해지고 있습니다. 지속 가능한 투자 방식에 대해 함께 논의해봅시다.',
    category: 'discussion',
    likes: 267,
    comments: 41,
    views: 1100,
    createdAt: '2026-04-15T14:20:00Z',
    liked: false,
  },
];

export const sampleComments: CommunityComment[] = [
  {
    id: 'comment1',
    author: sampleCommunityUsers[1],
    content: '정말 유용한 정보입니다! 감사합니다.',
    likes: 45,
    createdAt: '2026-04-16T10:45:00Z',
    liked: false,
  },
  {
    id: 'comment2',
    author: sampleCommunityUsers[3],
    content: '이 부분이 잘 이해가 안 가는데, 더 자세히 설명해주실 수 있나요?',
    likes: 23,
    createdAt: '2026-04-16T11:00:00Z',
    liked: false,
  },
  {
    id: 'comment3',
    author: sampleCommunityUsers[2],
    content: '좋은 질문입니다. 이렇게 생각해보세요...',
    likes: 67,
    createdAt: '2026-04-16T11:15:00Z',
    liked: false,
  },
];
