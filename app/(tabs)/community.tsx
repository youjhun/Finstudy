/**
 * FinStudy 커뮤니티 탭
 * UGC 컨텐츠 업로드 및 공유
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
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UGCContent {
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

const UGC_STORAGE_KEY = 'finstudy-ugc-content-v1';

export default function CommunityScreen() {
  const colors = useColors();
  const [contents, setContents] = useState<UGCContent[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [category, setCategory] = useState<'study' | 'tip' | 'question' | 'discussion'>('study');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      const stored = await AsyncStorage.getItem(UGC_STORAGE_KEY);
      if (stored) {
        setContents(JSON.parse(stored));
      }
    } catch (error) {
      console.error('UGC 컨텐츠 로드 실패:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadContent = async () => {
    if (!title.trim() || !description.trim()) {
      alert('제목과 설명을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const newContent: UGCContent = {
        id: Date.now().toString(),
        userId: 'user-' + Math.random().toString(36).substr(2, 9),
        userName: '사용자',
        userAvatar: '👤',
        title,
        description,
        imageUri: selectedImage || undefined,
        likes: 0,
        liked: false,
        timestamp: new Date().toISOString(),
        category,
      };

      const updated = [newContent, ...contents];
      await AsyncStorage.setItem(UGC_STORAGE_KEY, JSON.stringify(updated));
      setContents(updated);

      // 초기화
      setTitle('');
      setDescription('');
      setSelectedImage(null);
      setCategory('study');
      setShowUploadModal(false);
    } catch (error) {
      console.error('컨텐츠 업로드 실패:', error);
      alert('업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (contentId: string) => {
    const updated = contents.map((item) => {
      if (item.id === contentId) {
        return {
          ...item,
          liked: !item.liked,
          likes: item.liked ? item.likes - 1 : item.likes + 1,
        };
      }
      return item;
    });
    setContents(updated);
    await AsyncStorage.setItem(UGC_STORAGE_KEY, JSON.stringify(updated));
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      study: '📚 학습 자료',
      tip: '💡 팁',
      question: '❓ 질문',
      discussion: '💬 토론',
    };
    return labels[cat] || cat;
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* 헤더 */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">커뮤니티</Text>
          <Text className="text-sm text-muted">경제 학습 경험을 공유하세요</Text>
        </View>

        {/* 업로드 버튼 */}
        <Pressable
          onPress={() => setShowUploadModal(true)}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="bg-primary rounded-lg p-4 mb-6 flex-row items-center justify-center gap-2"
        >
          <Text className="text-2xl">➕</Text>
          <Text className="text-white font-semibold">컨텐츠 업로드</Text>
        </Pressable>

        {/* 컨텐츠 목록 */}
        {contents.length > 0 ? (
          <FlatList
            data={contents}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="rounded-lg bg-surface p-4 mb-4 border border-border">
                {/* 헤더 */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2 flex-1">
                    <Text className="text-2xl">{item.userAvatar}</Text>
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{item.userName}</Text>
                      <Text className="text-xs text-muted">
                        {new Date(item.timestamp).toLocaleDateString('ko-KR')}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    {getCategoryLabel(item.category)}
                  </Text>
                </View>

                {/* 제목 및 설명 */}
                <Text className="text-lg font-bold text-foreground mb-2">{item.title}</Text>
                <Text className="text-sm text-muted mb-3 leading-relaxed">{item.description}</Text>

                {/* 이미지 */}
                {item.imageUri && (
                  <Image
                    source={{ uri: item.imageUri }}
                    className="w-full h-40 rounded-lg mb-3 bg-muted"
                  />
                )}

                {/* 좋아요 버튼 */}
                <Pressable
                  onPress={() => toggleLike(item.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-row items-center gap-2"
                >
                  <Text className="text-xl">{item.liked ? '❤️' : '🤍'}</Text>
                  <Text className="text-sm font-semibold text-foreground">{item.likes}</Text>
                </Pressable>
              </View>
            )}
          />
        ) : (
          <View className="items-center justify-center py-12">
            <Text className="text-4xl mb-3">📝</Text>
            <Text className="text-foreground font-semibold mb-1">아직 컨텐츠가 없습니다</Text>
            <Text className="text-sm text-muted">첫 번째 경험을 공유해보세요!</Text>
          </View>
        )}
      </ScrollView>

      {/* 업로드 모달 */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View className="flex-1 bg-background">
          <ScreenContainer className="p-4">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              {/* 헤더 */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-2xl font-bold text-foreground">컨텐츠 업로드</Text>
                <Pressable
                  onPress={() => setShowUploadModal(false)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text className="text-2xl">✕</Text>
                </Pressable>
              </View>

              {/* 카테고리 선택 */}
              <Text className="text-sm font-semibold text-foreground mb-2">카테고리</Text>
              <View className="flex-row gap-2 mb-6">
                {(['study', 'tip', 'question', 'discussion'] as const).map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className={cn(
                      'px-3 py-2 rounded-full border',
                      category === cat
                        ? 'bg-primary border-primary'
                        : 'bg-surface border-border'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs font-semibold',
                        category === cat ? 'text-background' : 'text-foreground'
                      )}
                    >
                      {getCategoryLabel(cat)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* 제목 입력 */}
              <Text className="text-sm font-semibold text-foreground mb-2">제목</Text>
              <TextInput
                placeholder="제목을 입력하세요"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-lg p-3 text-foreground mb-4"
                maxLength={100}
              />

              {/* 설명 입력 */}
              <Text className="text-sm font-semibold text-foreground mb-2">설명</Text>
              <TextInput
                placeholder="자세한 설명을 입력하세요"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-lg p-3 text-foreground mb-4"
                multiline
                numberOfLines={5}
                maxLength={500}
              />

              {/* 이미지 선택 */}
              <Text className="text-sm font-semibold text-foreground mb-2">이미지 (선택)</Text>
              {selectedImage ? (
                <View className="mb-4">
                  <Image
                    source={{ uri: selectedImage }}
                    className="w-full h-40 rounded-lg bg-muted mb-2"
                  />
                  <Pressable
                    onPress={() => setSelectedImage(null)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="bg-error/20 rounded-lg p-2"
                  >
                    <Text className="text-error font-semibold text-center">이미지 제거</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={pickImage}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="bg-surface border-2 border-dashed border-border rounded-lg p-6 mb-4 items-center"
                >
                  <Text className="text-3xl mb-2">🖼️</Text>
                  <Text className="text-sm text-foreground font-semibold">이미지 선택</Text>
                  <Text className="text-xs text-muted">탭하여 갤러리에서 선택</Text>
                </Pressable>
              )}

              {/* 업로드 버튼 */}
              <Pressable
                onPress={uploadContent}
                disabled={loading}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="bg-primary rounded-lg p-4 items-center mb-4"
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-white font-bold text-lg">업로드</Text>
                )}
              </Pressable>

              {/* 취소 버튼 */}
              <Pressable
                onPress={() => setShowUploadModal(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="bg-surface border border-border rounded-lg p-4 items-center"
              >
                <Text className="text-foreground font-semibold">취소</Text>
              </Pressable>
            </ScrollView>
          </ScreenContainer>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
