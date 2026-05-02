/**
 * FinStudy 사회 기능 시스템
 * 
 * 기능:
 * - 친구 추가/관리
 * - 사용자 랭킹 (XP 기반)
 * - 스트릭 공유
 * - 친구 진행도 비교
 * - 배지 공유
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============= 타입 정의 =============

export interface User {
  id: string;
  name: string;
  avatar?: string;
  totalXP: number;
  streak: number;
  level: number;
  badges: string[];
  completedUnits: string[];
  lastActivityDate: string;
  joinedDate: string;
}

export interface Friend {
  userId: string;
  name: string;
  avatar?: string;
  totalXP: number;
  streak: number;
  level: number;
  status: 'pending' | 'accepted' | 'blocked';
  addedDate: string;
}

export interface RankingEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  totalXP: number;
  streak: number;
  level: number;
  completedUnits: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  earnedDate: string;
}

export interface StreakShare {
  userId: string;
  name: string;
  streak: number;
  message: string;
  sharedDate: string;
  likes: number;
}

// ============= 레벨 계산 =============

/**
 * XP 기반 레벨 계산
 * Level 1: 0-99 XP (필요 XP: 100)
 * Level 2: 100-399 XP (필요 XP: 300)
 * Level 3: 400-899 XP (필요 XP: 500)
 * ...
 * 각 레벨마다 필요한 XP = 100 + 200 * (level - 1)
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP < 0) return 1;
  
  let level = 1;
  let cumulativeXP = 0;
  
  while (true) {
    const xpForNextLevel = 100 + 200 * (level - 1);
    if (cumulativeXP + xpForNextLevel > totalXP) {
      break;
    }
    cumulativeXP += xpForNextLevel;
    level++;
  }
  
  return level;
}

/**
 * 다음 레벨까지 필요한 XP 계산
 */
export function getXPToNextLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  
  let cumulativeXP = 0;
  for (let i = 1; i < currentLevel; i++) {
    cumulativeXP += 100 + 200 * (i - 1);
  }
  
  const xpForCurrentLevel = 100 + 200 * (currentLevel - 1);
  const currentLevelXP = totalXP - cumulativeXP;
  
  return xpForCurrentLevel - currentLevelXP;
}

/**
 * 현재 레벨의 진행도 (0-100%)
 */
export function getLevelProgress(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  
  let cumulativeXP = 0;
  for (let i = 1; i < currentLevel; i++) {
    cumulativeXP += 100 + 200 * (i - 1);
  }
  
  const xpForCurrentLevel = 100 + 200 * (currentLevel - 1);
  const currentLevelXP = totalXP - cumulativeXP;
  
  return Math.round((currentLevelXP / xpForCurrentLevel) * 100);
}

// ============= 친구 관리 =============

const FRIENDS_KEY = '@finstudy_friends';
const FRIEND_REQUESTS_KEY = '@finstudy_friend_requests';
const BLOCKED_USERS_KEY = '@finstudy_blocked_users';

/**
 * 친구 요청 보내기
 */
export async function sendFriendRequest(
  currentUserId: string,
  targetUserId: string,
  targetName: string
): Promise<void> {
  const requests = await AsyncStorage.getItem(FRIEND_REQUESTS_KEY);
  const requestList: Array<{
    from: string;
    to: string;
    date: string;
  }> = requests ? JSON.parse(requests) : [];

  requestList.push({
    from: currentUserId,
    to: targetUserId,
    date: new Date().toISOString(),
  });

  await AsyncStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(requestList));
}

/**
 * 친구 요청 수락
 */
export async function acceptFriendRequest(
  currentUserId: string,
  requesterId: string,
  requesterName: string,
  requesterAvatar?: string
): Promise<void> {
  // 친구 목록에 추가
  const friends = await AsyncStorage.getItem(FRIENDS_KEY);
  const friendList: Friend[] = friends ? JSON.parse(friends) : [];

  const newFriend: Friend = {
    userId: requesterId,
    name: requesterName,
    avatar: requesterAvatar,
    totalXP: 0,
    streak: 0,
    level: 1,
    status: 'accepted',
    addedDate: new Date().toISOString(),
  };

  friendList.push(newFriend);
  await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(friendList));

  // 친구 요청 제거
  const requests = await AsyncStorage.getItem(FRIEND_REQUESTS_KEY);
  const requestList = requests ? JSON.parse(requests) : [];
  const updatedRequests = requestList.filter(
    (req: any) => !(req.from === requesterId && req.to === currentUserId)
  );
  await AsyncStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(updatedRequests));
}

/**
 * 친구 목록 조회
 */
export async function getFriends(): Promise<Friend[]> {
  const friends = await AsyncStorage.getItem(FRIENDS_KEY);
  return friends ? JSON.parse(friends) : [];
}

/**
 * 친구 삭제
 */
export async function removeFriend(friendUserId: string): Promise<void> {
  const friends = await AsyncStorage.getItem(FRIENDS_KEY);
  const friendList: Friend[] = friends ? JSON.parse(friends) : [];

  const updatedFriends = friendList.filter(f => f.userId !== friendUserId);
  await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(updatedFriends));
}

/**
 * 사용자 차단
 */
export async function blockUser(userId: string): Promise<void> {
  const blocked = await AsyncStorage.getItem(BLOCKED_USERS_KEY);
  const blockedList: string[] = blocked ? JSON.parse(blocked) : [];

  if (!blockedList.includes(userId)) {
    blockedList.push(userId);
    await AsyncStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(blockedList));
  }

  // 친구 목록에서도 제거
  await removeFriend(userId);
}

/**
 * 차단 해제
 */
export async function unblockUser(userId: string): Promise<void> {
  const blocked = await AsyncStorage.getItem(BLOCKED_USERS_KEY);
  const blockedList: string[] = blocked ? JSON.parse(blocked) : [];

  const updatedBlocked = blockedList.filter(id => id !== userId);
  await AsyncStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(updatedBlocked));
}

/**
 * 차단된 사용자 목록
 */
export async function getBlockedUsers(): Promise<string[]> {
  const blocked = await AsyncStorage.getItem(BLOCKED_USERS_KEY);
  return blocked ? JSON.parse(blocked) : [];
}

// ============= 랭킹 시스템 =============

const RANKING_CACHE_KEY = '@finstudy_ranking_cache';
const RANKING_CACHE_EXPIRY = 3600000; // 1시간

/**
 * 전체 랭킹 조회 (캐시됨)
 * 실제 구현에서는 서버에서 조회
 */
export async function getGlobalRanking(): Promise<RankingEntry[]> {
  // 캐시 확인
  const cached = await AsyncStorage.getItem(RANKING_CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < RANKING_CACHE_EXPIRY) {
      return data;
    }
  }

  // 실제 구현에서는 서버 API 호출
  // const response = await fetch('/api/ranking/global');
  // const data = await response.json();

  // 샘플 데이터 (실제로는 서버에서 조회)
  const mockRanking: RankingEntry[] = [
    {
      rank: 1,
      userId: 'user-001',
      name: '경제 마스터',
      totalXP: 5000,
      streak: 30,
      level: 15,
      completedUnits: 6,
    },
    {
      rank: 2,
      userId: 'user-002',
      name: '금융 전문가',
      totalXP: 4500,
      streak: 25,
      level: 14,
      completedUnits: 5,
    },
    {
      rank: 3,
      userId: 'user-003',
      name: '학습 열심이',
      totalXP: 4000,
      streak: 20,
      level: 13,
      completedUnits: 5,
    },
  ];

  // 캐시 저장
  await AsyncStorage.setItem(
    RANKING_CACHE_KEY,
    JSON.stringify({
      data: mockRanking,
      timestamp: Date.now(),
    })
  );

  return mockRanking;
}

/**
 * 친구 랭킹 조회
 */
export async function getFriendRanking(): Promise<RankingEntry[]> {
  const friends = await getFriends();
  
  // 실제 구현에서는 각 친구의 데이터를 서버에서 조회
  // 여기서는 샘플 데이터 반환
  return friends
    .map((friend, index) => ({
      rank: index + 1,
      userId: friend.userId,
      name: friend.name,
      totalXP: friend.totalXP,
      streak: friend.streak,
      level: friend.level,
      completedUnits: 0, // 실제로는 서버에서 조회
    }))
    .sort((a, b) => b.totalXP - a.totalXP);
}

/**
 * 사용자의 랭킹 위치 조회
 */
export async function getUserRankingPosition(userId: string): Promise<number> {
  const ranking = await getGlobalRanking();
  const position = ranking.findIndex(entry => entry.userId === userId);
  return position >= 0 ? position + 1 : -1;
}

// ============= 스트릭 공유 =============

const STREAK_SHARES_KEY = '@finstudy_streak_shares';

/**
 * 스트릭 공유
 */
export async function shareStreak(
  userId: string,
  name: string,
  streak: number,
  message: string
): Promise<void> {
  const shares = await AsyncStorage.getItem(STREAK_SHARES_KEY);
  const shareList: StreakShare[] = shares ? JSON.parse(shares) : [];

  const newShare: StreakShare = {
    userId,
    name,
    streak,
    message,
    sharedDate: new Date().toISOString(),
    likes: 0,
  };

  shareList.unshift(newShare); // 최신순으로 정렬
  await AsyncStorage.setItem(STREAK_SHARES_KEY, JSON.stringify(shareList));
}

/**
 * 스트릭 공유 목록 조회
 */
export async function getStreakShares(limit: number = 20): Promise<StreakShare[]> {
  const shares = await AsyncStorage.getItem(STREAK_SHARES_KEY);
  const shareList: StreakShare[] = shares ? JSON.parse(shares) : [];

  return shareList.slice(0, limit);
}

/**
 * 스트릭 공유에 좋아요
 */
export async function likeStreakShare(
  userId: string,
  shareIndex: number
): Promise<void> {
  const shares = await AsyncStorage.getItem(STREAK_SHARES_KEY);
  const shareList: StreakShare[] = shares ? JSON.parse(shares) : [];

  if (shareList[shareIndex]) {
    shareList[shareIndex].likes++;
    await AsyncStorage.setItem(STREAK_SHARES_KEY, JSON.stringify(shareList));
  }
}

// ============= 배지 시스템 =============

const BADGES_KEY = '@finstudy_badges';

/**
 * 배지 획득
 */
export async function earnBadge(badge: Badge): Promise<void> {
  const badges = await AsyncStorage.getItem(BADGES_KEY);
  const badgeList: Badge[] = badges ? JSON.parse(badges) : [];

  // 중복 확인
  if (!badgeList.find(b => b.id === badge.id)) {
    badgeList.push(badge);
    await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(badgeList));
  }
}

/**
 * 배지 목록 조회
 */
export async function getBadges(): Promise<Badge[]> {
  const badges = await AsyncStorage.getItem(BADGES_KEY);
  return badges ? JSON.parse(badges) : [];
}

/**
 * 배지 공유 (소셜 미디어)
 */
export async function shareBadge(badge: Badge): Promise<string> {
  // 실제 구현에서는 소셜 미디어 공유 API 호출
  return `🏆 ${badge.name}\n${badge.description}\n#FinStudy #경제학습`;
}

// ============= 친구 진행도 비교 =============

export interface ProgressComparison {
  userId: string;
  name: string;
  avatar?: string;
  completedUnits: string[];
  totalXP: number;
  streak: number;
  level: number;
  lastActivityDate: string;
}

/**
 * 친구와의 진행도 비교
 */
export async function compareFriendProgress(
  friendUserId: string
): Promise<ProgressComparison | null> {
  const friends = await getFriends();
  const friend = friends.find(f => f.userId === friendUserId);

  if (!friend) return null;

  return {
    userId: friend.userId,
    name: friend.name,
    avatar: friend.avatar,
    completedUnits: [], // 실제로는 서버에서 조회
    totalXP: friend.totalXP,
    streak: friend.streak,
    level: friend.level,
    lastActivityDate: friend.addedDate,
  };
}

/**
 * 친구 진행도 업데이트 (주기적으로 호출)
 */
export async function updateFriendProgress(
  friendUserId: string,
  totalXP: number,
  streak: number,
  completedUnits: string[]
): Promise<void> {
  const friends = await getFriends();
  const friendIndex = friends.findIndex(f => f.userId === friendUserId);

  if (friendIndex >= 0) {
    friends[friendIndex].totalXP = totalXP;
    friends[friendIndex].streak = streak;
    friends[friendIndex].level = calculateLevel(totalXP);
    await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
  }
}

// ============= 활동 피드 =============

export interface ActivityFeed {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  action: 'unit_completed' | 'badge_earned' | 'level_up' | 'streak_milestone';
  description: string;
  timestamp: string;
  likes: number;
}

const ACTIVITY_FEED_KEY = '@finstudy_activity_feed';

/**
 * 활동 기록
 */
export async function recordActivity(
  userId: string,
  name: string,
  action: ActivityFeed['action'],
  description: string,
  avatar?: string
): Promise<void> {
  const feed = await AsyncStorage.getItem(ACTIVITY_FEED_KEY);
  const feedList: ActivityFeed[] = feed ? JSON.parse(feed) : [];

  const newActivity: ActivityFeed = {
    id: `activity-${Date.now()}`,
    userId,
    name,
    avatar,
    action,
    description,
    timestamp: new Date().toISOString(),
    likes: 0,
  };

  feedList.unshift(newActivity); // 최신순
  await AsyncStorage.setItem(ACTIVITY_FEED_KEY, JSON.stringify(feedList.slice(0, 100))); // 최근 100개만 저장
}

/**
 * 활동 피드 조회
 */
export async function getActivityFeed(limit: number = 20): Promise<ActivityFeed[]> {
  const feed = await AsyncStorage.getItem(ACTIVITY_FEED_KEY);
  const feedList: ActivityFeed[] = feed ? JSON.parse(feed) : [];

  return feedList.slice(0, limit);
}

/**
 * 활동에 좋아요
 */
export async function likeActivity(activityId: string): Promise<void> {
  const feed = await AsyncStorage.getItem(ACTIVITY_FEED_KEY);
  const feedList: ActivityFeed[] = feed ? JSON.parse(feed) : [];

  const activity = feedList.find(a => a.id === activityId);
  if (activity) {
    activity.likes++;
    await AsyncStorage.setItem(ACTIVITY_FEED_KEY, JSON.stringify(feedList));
  }
}

// ============= 통계 =============

export interface SocialStats {
  totalFriends: number;
  friendsWithActiveStreak: number;
  averageFriendXP: number;
  userRankingPosition: number;
  userPercentile: number; // 상위 몇 %인지
}

/**
 * 사회 통계 조회
 */
export async function getSocialStats(userId: string, userXP: number): Promise<SocialStats> {
  const friends = await getFriends();
  const ranking = await getGlobalRanking();

  const friendsWithStreak = friends.filter(f => f.streak > 0).length;
  const averageXP = friends.length > 0
    ? Math.round(friends.reduce((sum, f) => sum + f.totalXP, 0) / friends.length)
    : 0;

  const userRank = await getUserRankingPosition(userId);
  const percentile = ranking.length > 0
    ? Math.round(((ranking.length - userRank + 1) / ranking.length) * 100)
    : 0;

  return {
    totalFriends: friends.length,
    friendsWithActiveStreak: friendsWithStreak,
    averageFriendXP: averageXP,
    userRankingPosition: userRank,
    userPercentile: percentile,
  };
}
