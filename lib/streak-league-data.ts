/**
 * Daily Streak 및 League 시스템 데이터
 */

export type LeagueType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface StreakData {
  currentStreak: number; // 현재 연속 학습일
  longestStreak: number; // 최장 연속 학습일
  lastLearningDate: string; // 마지막 학습 날짜 (YYYY-MM-DD)
  totalLearningDays: number; // 총 학습일
}

export interface LeagueData {
  currentLeague: LeagueType;
  leaguePoints: number; // 리그 내 포인트
  leagueRank: number; // 리그 내 순위
  nextLeagueThreshold: number; // 다음 리그 진급 필요 포인트
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  totalXP: number;
  level: number;
  streak: StreakData;
  league: LeagueData;
  badges: string[];
  joinedDate: string;
}

// League 진급 기준
export const LEAGUE_THRESHOLDS: Record<LeagueType, number> = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000,
  diamond: 5000,
};

// League 색상
export const LEAGUE_COLORS: Record<LeagueType, { bg: string; text: string; emoji: string }> = {
  bronze: { bg: '#CD7F32', text: '#8B4513', emoji: '🥉' },
  silver: { bg: '#C0C0C0', text: '#696969', emoji: '🥈' },
  gold: { bg: '#FFD700', text: '#B8860B', emoji: '🥇' },
  platinum: { bg: '#E5E4E2', text: '#71797E', emoji: '💎' },
  diamond: { bg: '#B9F2FF', text: '#0047AB', emoji: '👑' },
};

/**
 * 포인트로부터 리그를 결정합니다.
 */
export function getLeagueFromPoints(points: number): LeagueType {
  if (points >= LEAGUE_THRESHOLDS.diamond) return 'diamond';
  if (points >= LEAGUE_THRESHOLDS.platinum) return 'platinum';
  if (points >= LEAGUE_THRESHOLDS.gold) return 'gold';
  if (points >= LEAGUE_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

/**
 * 현재 리그에서 다음 리그로 진급하기 위한 필요 포인트를 계산합니다.
 */
export function getNextLeagueThreshold(currentLeague: LeagueType): number {
  const leagues: LeagueType[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const currentIndex = leagues.indexOf(currentLeague);
  if (currentIndex === leagues.length - 1) {
    return LEAGUE_THRESHOLDS.diamond; // 최고 리그
  }
  return LEAGUE_THRESHOLDS[leagues[currentIndex + 1]];
}

/**
 * 레벨을 계산합니다 (XP 기반).
 */
export function calculateLevel(xp: number): number {
  // 레벨 = floor(XP / 100) + 1
  return Math.floor(xp / 100) + 1;
}

/**
 * 오늘 학습했는지 확인합니다.
 */
export function hasLearnedToday(lastLearningDate: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return lastLearningDate === today;
}

/**
 * Streak을 업데이트합니다.
 */
export function updateStreak(currentStreak: StreakData): StreakData {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = new Date(currentStreak.lastLearningDate);
  const todayDate = new Date(today);
  
  // 어제와 오늘의 차이를 계산
  const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // 오늘 이미 학습함
    return currentStreak;
  } else if (daysDiff === 1) {
    // 어제 학습했으므로 streak 유지
    return {
      ...currentStreak,
      currentStreak: currentStreak.currentStreak + 1,
      longestStreak: Math.max(currentStreak.currentStreak + 1, currentStreak.longestStreak),
      lastLearningDate: today,
      totalLearningDays: currentStreak.totalLearningDays + 1,
    };
  } else {
    // 1일 이상 끊겼으므로 streak 초기화
    return {
      ...currentStreak,
      currentStreak: 1,
      lastLearningDate: today,
      totalLearningDays: currentStreak.totalLearningDays + 1,
    };
  }
}

/**
 * 기본 사용자 프로필을 생성합니다.
 */
export function createDefaultProfile(userId: string = 'user1'): UserProfile {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: userId,
    name: '경제 학습자',
    avatar: '👨‍🎓',
    totalXP: 0,
    level: 1,
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastLearningDate: today,
      totalLearningDays: 0,
    },
    league: {
      currentLeague: 'bronze',
      leaguePoints: 0,
      leagueRank: 1000,
      nextLeagueThreshold: LEAGUE_THRESHOLDS.silver,
    },
    badges: [],
    joinedDate: today,
  };
}

/**
 * 샘플 사용자 프로필 (리그 시스템 테스트용)
 */
export const sampleLeagueUsers: UserProfile[] = [
  {
    id: 'user1',
    name: '경제박사',
    avatar: '👨‍🎓',
    totalXP: 5200,
    level: 53,
    streak: {
      currentStreak: 15,
      longestStreak: 45,
      lastLearningDate: '2026-04-16',
      totalLearningDays: 120,
    },
    league: {
      currentLeague: 'diamond',
      leaguePoints: 5200,
      leagueRank: 1,
      nextLeagueThreshold: 5000,
    },
    badges: ['🔥', '⭐', '📚', '👑'],
    joinedDate: '2025-12-01',
  },
  {
    id: 'user2',
    name: '투자초보',
    avatar: '👩‍💼',
    totalXP: 3100,
    level: 32,
    streak: {
      currentStreak: 8,
      longestStreak: 20,
      lastLearningDate: '2026-04-16',
      totalLearningDays: 85,
    },
    league: {
      currentLeague: 'platinum',
      leaguePoints: 3100,
      leagueRank: 3,
      nextLeagueThreshold: 5000,
    },
    badges: ['🔥', '⭐'],
    joinedDate: '2026-01-15',
  },
  {
    id: 'user3',
    name: '금융전문가',
    avatar: '👨‍💻',
    totalXP: 4800,
    level: 49,
    streak: {
      currentStreak: 22,
      longestStreak: 50,
      lastLearningDate: '2026-04-16',
      totalLearningDays: 135,
    },
    league: {
      currentLeague: 'diamond',
      leaguePoints: 4800,
      leagueRank: 2,
      nextLeagueThreshold: 5000,
    },
    badges: ['🔥', '⭐', '📚'],
    joinedDate: '2025-11-20',
  },
  {
    id: 'user4',
    name: '경제학생',
    avatar: '👩‍🎓',
    totalXP: 1800,
    level: 19,
    streak: {
      currentStreak: 5,
      longestStreak: 12,
      lastLearningDate: '2026-04-16',
      totalLearningDays: 45,
    },
    league: {
      currentLeague: 'gold',
      leaguePoints: 1800,
      leagueRank: 8,
      nextLeagueThreshold: 3000,
    },
    badges: ['⭐'],
    joinedDate: '2026-02-10',
  },
  {
    id: 'user5',
    name: '주식투자자',
    avatar: '📈',
    totalXP: 2500,
    level: 26,
    streak: {
      currentStreak: 3,
      longestStreak: 18,
      lastLearningDate: '2026-04-16',
      totalLearningDays: 65,
    },
    league: {
      currentLeague: 'gold',
      leaguePoints: 2500,
      leagueRank: 5,
      nextLeagueThreshold: 3000,
    },
    badges: [],
    joinedDate: '2026-01-25',
  },
];
