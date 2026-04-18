import { ScrollView, Text, View, Pressable, FlatList } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { sampleCommunityPosts, type CommunityPost } from '@/lib/community-data';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type CategoryFilter = 'all' | 'question' | 'discussion' | 'tip' | 'news';

export default function CommunityScreen() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [posts, setPosts] = useState(sampleCommunityPosts);

  const categories: { key: CategoryFilter; label: string; emoji: string }[] = [
    { key: 'all', label: '전체', emoji: '📋' },
    { key: 'question', label: '질문', emoji: '❓' },
    { key: 'discussion', label: '토론', emoji: '💬' },
    { key: 'tip', label: '팁', emoji: '💡' },
    { key: 'news', label: '뉴스', emoji: '📰' },
  ];

  const filteredPosts =
    selectedCategory === 'all' ? posts : posts.filter((p) => p.category === selectedCategory);

  const handleCategoryPress = (category: CategoryFilter) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCategory(category);
  };

  const handleLikePost = (postId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setPosts(
      posts.map((p) =>
        p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const getCategoryColor = (category: CategoryFilter) => {
    switch (category) {
      case 'question':
        return '#FF6B6B';
      case 'discussion':
        return '#4ECDC4';
      case 'tip':
        return '#FFD93D';
      case 'news':
        return '#6C5CE7';
      default:
        return colors.primary;
    }
  };

  const renderPostItem = ({ item }: { item: CommunityPost }) => (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor: getCategoryColor(item.category),
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2 flex-1">
          <Text className="text-2xl">{item.author.avatar}</Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">{item.author.name}</Text>
            <Text className="text-xs text-muted">
              Lv.{item.author.level} • {new Date(item.createdAt).toLocaleDateString('ko-KR')}
            </Text>
          </View>
        </View>
        <View className="bg-primary/10 px-2 py-1 rounded">
          <Text className="text-xs font-semibold text-primary">{item.category}</Text>
        </View>
      </View>

      <Text className="text-base font-bold text-foreground mb-2">{item.title}</Text>
      <Text className="text-sm text-muted leading-relaxed mb-4" numberOfLines={2}>
        {item.content}
      </Text>

      <View className="flex-row items-center justify-between pt-3 border-t border-border">
        <View className="flex-row gap-4">
          <Pressable
            onPress={() => handleLikePost(item.id)}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Text className="text-sm text-muted">
              {item.liked ? '❤️' : '🤍'} {item.likes}
            </Text>
          </Pressable>
          <Text className="text-sm text-muted">💬 {item.comments}</Text>
          <Text className="text-sm text-muted">👁️ {item.views}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-6 pb-4">
          <Text className="text-3xl font-bold text-foreground mb-1">🌍 커뮤니티</Text>
          <Text className="text-sm text-muted">경제 지식을 나누고 배워보세요</Text>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => handleCategoryPress(cat.key)}
              style={({ pressed }) => [
                {
                  backgroundColor:
                    selectedCategory === cat.key ? colors.primary : colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor:
                    selectedCategory === cat.key ? colors.primary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                  minWidth: 70,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Text
                numberOfLines={1}
                className={`font-semibold text-xs ${
                  selectedCategory === cat.key ? 'text-background' : 'text-foreground'
                }`}
              >
                {cat.emoji} {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Posts List */}
        <View className="px-4 pb-6">
          {filteredPosts.length > 0 ? (
            <FlatList
              data={filteredPosts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-4xl mb-2">📭</Text>
              <Text className="text-foreground font-semibold mb-1">게시물이 없습니다</Text>
              <Text className="text-sm text-muted">다른 카테고리를 확인해보세요</Text>
            </View>
          )}
        </View>

        {/* New Post Button */}
        <View className="px-4 pb-8">
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
                transform: pressed ? [{ scale: 0.97 }] : [{ scale: 1 }],
              },
            ]}
          >
            <Text className="text-background font-bold text-base">✏️ 새 게시물 작성</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
