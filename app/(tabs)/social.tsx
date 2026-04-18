/**
 * FinStudy 사회 탭
 * 친구, 랭킹, 활동 피드 관리
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
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
  calculateLevel,
  getLevelProgress,
  Friend,
  RankingEntry,
  StreakShare,
  ActivityFeed,
  SocialStats,
} from '@/lib/social-system';

type TabType = 'friends' | 'ranking' | 'activity';

export default function SocialScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [activity, setActivity] = useState<ActivityFeed[]>([]);
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'friends') {
        const friendsData = await getFriends();
        setFriends(friendsData);
      } else if (activeTab === 'ranking') {
        const rankingData = await getGlobalRanking();
        setRanking(rankingData);
      } else if (activeTab === 'activity') {
        const activityData = await getActivityFeed();
        setActivity(activityData);
      }

      // 통계 항상 로드
      const statsData = await getSocialStats('current-user-id', 2500); // 샘플 XP
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load social data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============= 친구 탭 =============

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View
      className={cn(
        'flex-row items-center justify-between p-4 mb-2 rounded-lg',
        'bg-surface border border-border'
      )}
    >
      {/* 프로필 */}
      <View className="flex-row items-center flex-1">
        <View
          className={cn(
            'w-12 h-12 rounded-full items-center justify-center mr-3',
            'bg-primary'
          )}
        >
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} className="w-12 h-12 rounded-full" />
          ) : (
            <Text className="text-white font-bold">{item.name.charAt(0)}</Text>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-foreground font-semibold">{item.name}</Text>
          <View className="flex-row gap-2 mt-1">
            <Text className="text-muted text-xs">Lv.{item.level}</Text>
            <Text className="text-muted text-xs">🔥 {item.streak}일</Text>
            <Text className="text-muted text-xs">{item.totalXP} XP</Text>
          </View>
        </View>
      </View>

      {/* 액션 버튼 */}
      <TouchableOpacity
        className="px-3 py-2 rounded-lg bg-primary"
        onPress={() => removeFriend(item.userId)}
      >
        <Text className="text-white text-xs font-semibold">삭제</Text>
      </TouchableOpacity>
    </View>
  );

  const FriendsTab = () => (
    <View className="flex-1">
      {/* 내 프로필 카드 */}
      <View className="p-6 rounded-lg bg-primary/10 border border-primary/30 mb-6">
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-foreground">경제 학습자</Text>
          <Text className="text-muted mt-1">Lv. 5</Text>
          <Text className="text-sm text-muted mt-2">2,500 XP • 🔥 15일 연속</Text>
        </View>
      </View>

      {/* 친구 추가 버튼 */}
      <TouchableOpacity
        className="flex-row items-center justify-center gap-2 p-3 mb-4 rounded-lg bg-primary"
        onPress={() => setShowAddFriendModal(true)}
      >
        <Text className="text-white font-semibold">+ 친구 추가</Text>
      </TouchableOpacity>

      {/* 친구 목록 */}
      {friends.length > 0 ? (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={item => item.userId}
          scrollEnabled={false}
        />
      ) : (
        <View className="items-center justify-center py-8">
          <Text className="text-muted text-center">아직 친구가 없습니다</Text>
          <Text className="text-muted text-xs text-center mt-2">
            친구를 추가하고 함께 학습해보세요!
          </Text>
        </View>
      )}

      {/* 통계 */}
      {stats && (
        <View className="mt-6 p-4 rounded-lg bg-surface border border-border">
          <Text className="text-foreground font-semibold mb-3">사회 통계</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-muted">친구 수</Text>
              <Text className="text-foreground font-semibold">{stats.totalFriends}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted">활동 중인 친구</Text>
              <Text className="text-foreground font-semibold">{stats.friendsWithActiveStreak}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted">평균 친구 XP</Text>
              <Text className="text-foreground font-semibold">{stats.averageFriendXP}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  // ============= 랭킹 탭 =============

  const renderRankingItem = ({ item, index }: { item: RankingEntry; index: number }) => {
    const isTopThree = index < 3;
    const medals = ['🥇', '🥈', '🥉'];

    return (
      <View
        className={cn(
          'flex-row items-center justify-between p-4 mb-2 rounded-lg',
          isTopThree ? 'bg-primary/10 border border-primary' : 'bg-surface border border-border'
        )}
      >
        {/* 순위 */}
        <View className="w-8 items-center">
          {isTopThree ? (
            <Text className="text-2xl">{medals[index]}</Text>
          ) : (
            <Text className="text-foreground font-bold">#{item.rank}</Text>
          )}
        </View>

        {/* 프로필 */}
        <View className="flex-1 ml-3">
          <Text className="text-foreground font-semibold">{item.name}</Text>
          <View className="flex-row gap-2 mt-1">
            <Text className="text-muted text-xs">Lv.{item.level}</Text>
            <Text className="text-muted text-xs">{item.totalXP} XP</Text>
          </View>
        </View>

        {/* 스트릭 */}
        <View className="items-center">
          <Text className="text-lg">🔥</Text>
          <Text className="text-foreground font-semibold text-xs">{item.streak}</Text>
        </View>
      </View>
    );
  };

  const RankingTab = () => (
    <View className="flex-1">
      {/* 탭 전환 버튼 */}
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          className={cn(
            'flex-1 py-2 rounded-lg items-center justify-center',
            'bg-primary'
          )}
        >
          <Text className="text-white font-semibold text-sm">전체 랭킹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={cn(
            'flex-1 py-2 rounded-lg items-center justify-center',
            'bg-surface border border-border'
          )}
        >
          <Text className="text-foreground font-semibold text-sm">친구 랭킹</Text>
        </TouchableOpacity>
      </View>

      {/* 랭킹 목록 */}
      {ranking.length > 0 ? (
        <FlatList
          data={ranking}
          renderItem={renderRankingItem}
          keyExtractor={item => item.userId}
          scrollEnabled={false}
        />
      ) : (
        <View className="items-center justify-center py-8">
          <Text className="text-muted">랭킹 데이터를 불러오는 중...</Text>
        </View>
      )}
    </View>
  );

  // ============= 활동 탭 =============

  const renderActivityItem = ({ item }: { item: ActivityFeed }) => (
    <View className="flex-row gap-3 p-4 mb-2 rounded-lg bg-surface border border-border">
      {/* 아이콘 */}
      <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
        <Text className="text-lg">
          {item.action === 'unit_completed'
            ? '✅'
            : item.action === 'badge_earned'
            ? '🏆'
            : item.action === 'level_up'
            ? '⬆️'
            : '🔥'}
        </Text>
      </View>

      {/* 내용 */}
      <View className="flex-1">
        <Text className="text-foreground font-semibold">{item.name}</Text>
        <Text className="text-muted text-sm mt-1">{item.description}</Text>
        <Text className="text-muted text-xs mt-2">
          {new Date(item.timestamp).toLocaleDateString('ko-KR')}
        </Text>
      </View>

      {/* 좋아요 */}
      <TouchableOpacity
        className="items-center justify-center"
        onPress={() => likeActivity(item.id)}
      >
        <Text className="text-lg">❤️</Text>
        <Text className="text-muted text-xs">{item.likes}</Text>
      </TouchableOpacity>
    </View>
  );

  const ActivityTab = () => (
    <View className="flex-1">
      {activity.length > 0 ? (
        <FlatList
          data={activity}
          renderItem={renderActivityItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      ) : (
        <View className="items-center justify-center py-8">
          <Text className="text-muted">활동이 없습니다</Text>
        </View>
      )}
    </View>
  );

  // ============= 프로필 탭 =============

  const ProfileTab = () => (
    <View className="flex-1">
      {/* 프로필 카드 */}
      <View className="p-6 rounded-lg bg-primary/10 border border-primary/30 mb-6">
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-foreground">경제 학습자</Text>
          <Text className="text-muted mt-1">Lv. 5</Text>
        </View>
      </View>

      {/* 통계 */}
      {stats && (
        <View className="gap-3 mb-6">
          {/* XP 진행도 */}
          <View className="p-4 rounded-lg bg-surface border border-border">
            <View className="flex-row justify-between mb-2">
              <Text className="text-foreground font-semibold">경험치</Text>
              <Text className="text-muted">2,500 / 3,000 XP</Text>
            </View>
            <View className="w-full h-2 bg-border rounded-full overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{ width: '83%' }}
              />
            </View>
          </View>

          {/* 랭킹 */}
          <View className="p-4 rounded-lg bg-surface border border-border">
            <View className="flex-row justify-between">
              <Text className="text-foreground font-semibold">전체 랭킹</Text>
              <Text className="text-primary font-bold">
                #{stats.userRankingPosition} (상위 {stats.userPercentile}%)
              </Text>
            </View>
          </View>

          {/* 스트릭 */}
          <View className="p-4 rounded-lg bg-surface border border-border">
            <View className="flex-row justify-between">
              <Text className="text-foreground font-semibold">연속 학습</Text>
              <Text className="text-lg">🔥 15일</Text>
            </View>
          </View>
        </View>
      )}

      {/* 배지 */}
      <View className="p-4 rounded-lg bg-surface border border-border">
        <Text className="text-foreground font-semibold mb-3">획득한 배지</Text>
        <View className="flex-row flex-wrap gap-2">
          {['🎓', '📈', '🏆', '🔥', '⭐'].map((badge, index) => (
            <View
              key={index}
              className="w-12 h-12 rounded-lg bg-primary/20 items-center justify-center"
            >
              <Text className="text-xl">{badge}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // ============= 친구 추가 모달 =============

  const AddFriendModal = () => (
    <Modal
      visible={showAddFriendModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAddFriendModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className="bg-background rounded-t-2xl p-6"
          style={{ maxHeight: '80%' }}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-foreground">친구 추가</Text>
            <TouchableOpacity onPress={() => setShowAddFriendModal(false)}>
              <Text className="text-2xl text-muted">✕</Text>
            </TouchableOpacity>
          </View>

          {/* 검색 */}
          <TextInput
            className={cn(
              'w-full p-3 rounded-lg mb-4',
              'bg-surface border border-border',
              'text-foreground'
            )}
            placeholder="사용자 검색..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* 검색 결과 (샘플) */}
          <ScrollView className="flex-1">
            {['김경제', '이금융', '박투자'].map((name, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between p-3 mb-2 rounded-lg bg-surface border border-border"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                    <Text className="text-white font-bold">{name.charAt(0)}</Text>
                  </View>
                  <Text className="text-foreground font-semibold">{name}</Text>
                </View>
                <TouchableOpacity
                  className="px-3 py-2 rounded-lg bg-primary"
                  onPress={() => {
                    sendFriendRequest('current-user-id', `user-${index}`, name);
                    setShowAddFriendModal(false);
                  }}
                >
                  <Text className="text-white text-xs font-semibold">추가</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ============= 메인 렌더링 =============

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">사회</Text>
          <Text className="text-muted mt-1">친구와 함께 성장하세요</Text>
        </View>

        {/* 탭 버튼 */}
        <View className="flex-row gap-2 mb-6">
          {(['friends', 'ranking', 'activity'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              className={cn(
                'flex-1 py-2 rounded-lg items-center justify-center',
                activeTab === tab ? 'bg-primary' : 'bg-surface border border-border'
              )}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={cn(
                  'font-semibold text-sm',
                  activeTab === tab ? 'text-white' : 'text-foreground'
                )}
              >
                {tab === 'friends'
                  ? '👥 친구'
                  : tab === 'ranking'
                  ? '🏆 랭킹'
                  : '📢 활동'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 콘테남 */}
        {loading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : activeTab === 'friends' ? (
          <FriendsTab />
        ) : activeTab === 'ranking' ? (
          <RankingTab />
        ) : (
          <ActivityTab />
        )}
      </ScrollView>

      {/* 친구 추가 모달 */}
      <AddFriendModal />
    </ScreenContainer>
  );
}
