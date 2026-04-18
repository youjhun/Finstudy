import { ScrollView, Text, View, Pressable, FlatList, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import {
  sampleLeagueUsers,
  type UserProfile,
  LEAGUE_COLORS,
  calculateLevel,
  createDefaultProfile,
} from '@/lib/streak-league-data';
import {
  getFriends,
  getGlobalRanking,
  getFriendRanking,
  getStreakShares,
  getActivityFeed,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  likeStreakShare,
  likeActivity,
  getSocialStats,
  getLevelProgress,
  type Friend,
  type RankingEntry,
  type StreakShare,
  type ActivityFeed,
  type SocialStats,
} from '@/lib/social-system';
import { AdminLoginModal } from '@/components/admin-login-modal';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type MainTab = 'profile' | 'league' | 'community';
type CommunityTab = 'friends' | 'ranking' | 'activity';

export default function ProfileScreen() {
  const colors = useColors();
  const [currentUser, setCurrentUser] = useState<UserProfile>(createDefaultProfile());
  const [leagueRanking, setLeagueRanking] = useState<UserProfile[]>([]);
  const [selectedTab, setSelectedTab] = useState<MainTab>('profile');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // 커뮤니티 탭 상태
  const [communityTab, setCommunityTab] = useState<CommunityTab>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [activity, setActivity] = useState<ActivityFeed[]>([]);
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);

  useEffect(() => {
    // 현재 사용자 설정 (첫 번째 샘플 사용자)
    setCurrentUser(sampleLeagueUsers[0]);
    // 리그 순위 정렬
    const sorted = [...sampleLeagueUsers].sort((a, b) => a.league.leagueRank - b.league.leagueRank);
    setLeagueRanking(sorted);
  }, []);
  
  // 커뮤니티 데이터 로드
  useEffect(() => {
    if (selectedTab === 'community') {
      loadCommunityData();
    }
  }, [selectedTab, communityTab]);
  
  const loadCommunityData = async () => {
    setLoading(true);
    try {
      const friendsData = await getFriends();
      const rankingData = communityTab === 'ranking' ? await getGlobalRanking() : [];
      const activityData = communityTab === 'activity' ? await getActivityFeed(20) : [];
      const statsData = await getSocialStats(currentUser.id, currentUser.totalXP);
      if (friendsData) setFriends(friendsData);
      if (rankingData) setRanking(rankingData);
      if (activityData) setActivity(activityData);
      if (statsData) setStats(statsData);
    } catch (error) {
      console.error('커뮤니티 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (tab: MainTab) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTab(tab);
  };
  
  const handleCommunityTabPress = (tab: CommunityTab) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCommunityTab(tab);
  };

  const leagueColor = LEAGUE_COLORS[currentUser.league.currentLeague];
  const level = calculateLevel(currentUser.totalXP);

  const handleAdminLoginSuccess = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-6 pb-4">
          <Text className="text-3xl font-bold text-foreground mb-1">👤 프로필</Text>
          <Text className="text-sm text-muted">당신의 학습 성과를 확인하세요</Text>
        </View>

        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}>
          <Pressable
            onPress={() => handleTabPress('profile')}
            style={({ pressed }) => [
              {
                paddingVertical: 10,
                paddingHorizontal: 16,
                backgroundColor: selectedTab === 'profile' ? colors.primary : colors.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: selectedTab === 'profile' ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              className={`font-bold text-sm ${
                selectedTab === 'profile' ? 'text-background' : 'text-foreground'
              }`}
            >
              📊 내 프로필
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleTabPress('league')}
            style={({ pressed }) => [
              {
                paddingVertical: 10,
                paddingHorizontal: 16,
                backgroundColor: selectedTab === 'league' ? colors.primary : colors.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: selectedTab === 'league' ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              className={`font-bold text-sm ${
                selectedTab === 'league' ? 'text-background' : 'text-foreground'
              }`}
            >
              🏆 리그
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleTabPress('community')}
            style={({ pressed }) => [
              {
                paddingVertical: 10,
                paddingHorizontal: 16,
                backgroundColor: selectedTab === 'community' ? colors.primary : colors.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: selectedTab === 'community' ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              className={`font-bold text-sm ${
                selectedTab === 'community' ? 'text-background' : 'text-foreground'
              }`}
            >
              🌍 커뮤니티
            </Text>
          </Pressable>
        </ScrollView>

        {selectedTab === 'profile' && (
          <View className="px-4 pb-8">
            {/* User Card */}
            <View className="rounded-[24px] bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border border-blue-200 mb-6">
              <View className="flex-row items-center gap-4 mb-6">
                <Text className="text-5xl">{currentUser.avatar}</Text>
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-foreground">{currentUser.name}</Text>
                  <Text className="text-sm text-muted mt-1">
                    가입일: {new Date(currentUser.joinedDate).toLocaleDateString('ko-KR')}
                  </Text>
                </View>
              </View>

              {/* Level and XP */}
              <View className="flex-row gap-3">
                <View className="flex-1 rounded-[16px] bg-white p-4 border border-blue-200">
                  <Text className="text-xs font-semibold text-muted mb-2">📈 레벨</Text>
                  <Text className="text-3xl font-bold text-foreground">{level}</Text>
                </View>
                <View className="flex-1 rounded-[16px] bg-white p-4 border border-blue-200">
                  <Text className="text-xs font-semibold text-muted mb-2">⭐ 총 XP</Text>
                  <Text className="text-3xl font-bold text-foreground">{currentUser.totalXP}</Text>
                </View>
              </View>
            </View>

            {/* League Info */}
            <View
              className="rounded-[24px] p-6 border-2 mb-6"
              style={{
                backgroundColor: `${leagueColor.bg}20`,
                borderColor: leagueColor.bg,
              }}
            >
              <View className="flex-row items-center gap-3 mb-4">
                <Text className="text-4xl">{leagueColor.emoji}</Text>
                <View>
                  <Text className="text-lg font-bold text-foreground capitalize">
                    {currentUser.league.currentLeague} 리그
                  </Text>
                  <Text className="text-sm text-muted">순위: #{currentUser.league.leagueRank}</Text>
                </View>
              </View>

              {/* League Progress */}
              <View className="bg-white rounded-[12px] p-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-xs font-semibold text-muted">리그 포인트</Text>
                  <Text className="text-xs font-bold text-foreground">
                    {currentUser.league.leaguePoints} / {currentUser.league.nextLeagueThreshold}
                  </Text>
                </View>
                <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    style={{
                      width: `${(currentUser.league.leaguePoints / currentUser.league.nextLeagueThreshold) * 100}%`,
                    }}
                    className="h-full rounded-full bg-primary"
                  />
                </View>
              </View>
            </View>

            {/* Streak Section */}
            <View className="rounded-[24px] bg-surface p-6 border border-border mb-6">
              <Text className="text-lg font-bold text-foreground mb-4">🔥 연속 학습</Text>
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1 rounded-[16px] bg-orange-50 p-4 border border-orange-200">
                  <Text className="text-xs font-semibold text-orange-700 mb-2">현재 Streak</Text>
                  <Text className="text-3xl font-bold text-orange-900">{currentUser.streak.currentStreak}</Text>
                  <Text className="text-xs text-orange-700 mt-1">일 연속</Text>
                </View>
                <View className="flex-1 rounded-[16px] bg-red-50 p-4 border border-red-200">
                  <Text className="text-xs font-semibold text-red-700 mb-2">최장 Streak</Text>
                  <Text className="text-3xl font-bold text-red-900">{currentUser.streak.longestStreak}</Text>
                  <Text className="text-xs text-red-700 mt-1">일 연속</Text>
                </View>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1 rounded-[16px] bg-green-50 p-4 border border-green-200">
                  <Text className="text-xs font-semibold text-green-700 mb-2">총 학습일</Text>
                  <Text className="text-2xl font-bold text-green-900">{currentUser.streak.totalLearningDays}</Text>
                </View>
              </View>
            </View>

            {/* Badges */}
            {currentUser.badges.length > 0 && (
              <View className="rounded-[24px] bg-surface p-6 border border-border">
                <Text className="text-lg font-bold text-foreground mb-4">🏅 배지</Text>
                <View className="flex-row flex-wrap gap-3">
                  {currentUser.badges.map((badge, idx) => (
                    <View key={idx} className="rounded-[12px] bg-yellow-50 p-4 border border-yellow-200">
                      <Text className="text-3xl">{badge}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {selectedTab === 'league' && (
          <View className="px-4 pb-8">
            {/* Current User Highlight */}
            <View className="rounded-[24px] bg-gradient-to-r from-primary/20 to-primary/10 p-6 border-2 border-primary mb-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-4xl">🎯</Text>
                  <View>
                    <Text className="text-sm font-semibold text-muted">당신의 순위</Text>
                    <Text className="text-2xl font-bold text-foreground">#{currentUser.league.leagueRank}</Text>
                  </View>
                </View>
                <View className="items-center">
                  <Text className="text-3xl">{leagueColor.emoji}</Text>
                  <Text className="text-xs font-bold text-foreground mt-1 capitalize">
                    {currentUser.league.currentLeague}
                  </Text>
                </View>
              </View>
            </View>

            {/* League Rankings */}
            <Text className="text-lg font-bold text-foreground mb-4">📊 리그 순위</Text>
            <View className="gap-3">
              {leagueRanking.map((user, idx) => {
                const userLeagueColor = LEAGUE_COLORS[user.league.currentLeague];
                const isCurrentUser = user.id === currentUser.id;
                return (
                  <View
                    key={user.id}
                    className={`rounded-[16px] p-4 border flex-row items-center gap-3 ${
                      isCurrentUser ? 'bg-primary/10 border-primary' : 'bg-surface border-border'
                    }`}
                  >
                    {/* Rank */}
                    <View className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center">
                      <Text className="font-bold text-foreground">#{idx + 1}</Text>
                    </View>

                    {/* User Info */}
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-lg">{user.avatar}</Text>
                        <Text className="font-bold text-foreground">{user.name}</Text>
                        {isCurrentUser && (
                          <View className="bg-primary px-2 py-1 rounded-full">
                            <Text className="text-xs font-bold text-background">나</Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-row gap-2">
                        <Text className="text-xs text-muted">
                          {userLeagueColor.emoji} {user.league.currentLeague}
                        </Text>
                        <Text className="text-xs text-muted">Lv.{calculateLevel(user.totalXP)}</Text>
                        <Text className="text-xs text-muted">🔥 {user.streak.currentStreak}일</Text>
                      </View>
                    </View>

                    {/* Points */}
                    <View className="items-center">
                      <Text className="font-bold text-foreground">{user.league.leaguePoints}</Text>
                      <Text className="text-xs text-muted">포인트</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* League Info */}
            <View className="rounded-[24px] bg-blue-50 border border-blue-200 p-6 mt-6">
              <Text className="text-sm font-semibold text-blue-900 mb-3">💡 리그 시스템</Text>
              <View className="gap-2">
                <Text className="text-xs text-blue-800">
                  • 🥉 <Text className="font-semibold">Bronze</Text>: 0 포인트
                </Text>
                <Text className="text-xs text-blue-800">
                  • 🥈 <Text className="font-semibold">Silver</Text>: 500 포인트
                </Text>
                <Text className="text-xs text-blue-800">
                  • 🥇 <Text className="font-semibold">Gold</Text>: 1,500 포인트
                </Text>
                <Text className="text-xs text-blue-800">
                  • 💎 <Text className="font-semibold">Platinum</Text>: 3,000 포인트
                </Text>
                <Text className="text-xs text-blue-800">
                  • 👑 <Text className="font-semibold">Diamond</Text>: 5,000 포인트
                </Text>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'community' && (
          <View className="px-4 pb-8">
            {/* Community Tab Navigation */}
            <View className="flex-row gap-2 mb-6">
              <Pressable
                onPress={() => handleCommunityTabPress('friends')}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    backgroundColor: communityTab === 'friends' ? colors.primary : colors.surface,
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  className={`font-semibold text-sm ${
                    communityTab === 'friends' ? 'text-background' : 'text-foreground'
                  }`}
                >
                  👥 친구
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleCommunityTabPress('ranking')}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    backgroundColor: communityTab === 'ranking' ? colors.primary : colors.surface,
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  className={`font-semibold text-sm ${
                    communityTab === 'ranking' ? 'text-background' : 'text-foreground'
                  }`}
                >
                  🏅 순위
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleCommunityTabPress('activity')}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    backgroundColor: communityTab === 'activity' ? colors.primary : colors.surface,
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  className={`font-semibold text-sm ${
                    communityTab === 'activity' ? 'text-background' : 'text-foreground'
                  }`}
                >
                  📝 활동
                </Text>
              </Pressable>
            </View>

            {/* Community Content */}
            {loading ? (
              <View className="flex-1 items-center justify-center py-12">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                {communityTab === 'friends' && (
                  <View>
                    <Text className="text-lg font-bold text-foreground mb-4">👥 나의 친구</Text>
                    {friends.length > 0 ? (
                      <FlatList
                        data={friends}
                        keyExtractor={(item) => item.userId}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                          <View className="rounded-lg bg-surface p-4 mb-3 flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3 flex-1">
                              <Text className="text-2xl">{item.avatar}</Text>
                              <View className="flex-1">
                                <Text className="font-semibold text-foreground">{item.name}</Text>
                                <Text className="text-xs text-muted">Lv.{item.level}</Text>
                              </View>
                            </View>
                            <Pressable
                              onPress={() => removeFriend(item.userId)}
                              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                            >
                              <Text className="text-sm font-semibold text-error">제거</Text>
                            </Pressable>
                          </View>
                        )}
                      />
                    ) : (
                      <View className="items-center justify-center py-8">
                        <Text className="text-2xl mb-2">👥</Text>
                        <Text className="text-foreground font-semibold">친구가 없습니다</Text>
                      </View>
                    )}
                  </View>
                )}

                {communityTab === 'ranking' && (
                  <View>
                    <Text className="text-lg font-bold text-foreground mb-4">🏅 전역 순위</Text>
                    {ranking.length > 0 ? (
                      <FlatList
                        data={ranking}
                        keyExtractor={(item) => item.userId}
                        scrollEnabled={false}
                        renderItem={({ item, index }) => (
                          <View className="rounded-lg bg-surface p-4 mb-3 flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                              <Text className="font-bold text-background text-sm">#{index + 1}</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="font-semibold text-foreground">{item.name}</Text>
                              <Text className="text-xs text-muted">{item.totalXP} XP</Text>
                            </View>
                            <Text className="font-bold text-primary">Lv.{item.level}</Text>
                          </View>
                        )}
                      />
                    ) : (
                      <View className="items-center justify-center py-8">
                        <Text className="text-2xl mb-2">📊</Text>
                        <Text className="text-foreground font-semibold">순위 데이터 없음</Text>
                      </View>
                    )}
                  </View>
                )}

                {communityTab === 'activity' && (
                  <View>
                    <Text className="text-lg font-bold text-foreground mb-4">📝 최근 활동</Text>
                    {activity.length > 0 ? (
                      <FlatList
                        data={activity}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                          <View className="rounded-lg bg-surface p-4 mb-3">
                            <View className="flex-row items-center gap-2 mb-2">
                              <Text className="text-lg">{item.avatar}</Text>
                              <Text className="font-semibold text-foreground flex-1">{item.name}</Text>
                              <Text className="text-xs text-muted">{new Date(item.timestamp).toLocaleDateString('ko-KR')}</Text>
                            </View>
                            <Text className="text-sm text-muted">{item.description}</Text>
                          </View>
                        )}
                      />
                    ) : (
                      <View className="items-center justify-center py-8">
                        <Text className="text-2xl mb-2">📝</Text>
                        <Text className="text-foreground font-semibold">활동이 없습니다</Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Admin Login Button */}
        <View className="px-4 py-4 border-t border-border">
          <Pressable
            onPress={() => setShowAdminLogin(true)}
            style={({ pressed }) => [{
              backgroundColor: '#f0f0f0',
              paddingVertical: 12,
              borderRadius: 12,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Text className="text-center text-sm font-semibold text-muted">⚙️ 관리자 로그인</Text>
          </Pressable>
        </View>
      </ScrollView>

      <AdminLoginModal
        visible={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </ScreenContainer>
  );
}
