/**
 * FinStudy 커뮤니티 탭
 * UGC 컨텐츠 업로드, 댓글, 좋아요, 삭제 기능
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import { DUMMY_UGC_CONTENTS } from '@/lib/ugc-dummy-data';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
}

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
  comments?: Comment[];
}

export type { UGCContent };

const UGC_STORAGE_KEY = 'finstudy-ugc-content-v1';

export default function CommunityScreen() {
  const colors = useColors();
  const [contents, setContents] = useState<UGCContent[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [category, setCategory] = useState<'study' | 'tip' | 'question' | 'discussion'>('study');
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      const stored = await AsyncStorage.getItem(UGC_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 저장된 값이 빈 배열이면 더미 데이터로 초기화
        if (Array.isArray(parsed) && parsed.length === 0) {
          await AsyncStorage.setItem(UGC_STORAGE_KEY, JSON.stringify(DUMMY_UGC_CONTENTS));
          setContents(DUMMY_UGC_CONTENTS);
        } else {
          setContents(parsed);
        }
      } else {
        // 첫 실행 시 더미 데이터 초기화
        await AsyncStorage.setItem(UGC_STORAGE_KEY, JSON.stringify(DUMMY_UGC_CONTENTS));
        setContents(DUMMY_UGC_CONTENTS);
      }
    } catch (error) {
      console.error('UGC 컨텐츠 로드 실패:', error);
      // 오류 발생 시에도 더미 데이터 표시
      setContents(DUMMY_UGC_CONTENTS);
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
        userName: '내 프로필',
        userAvatar: '👤',
        title,
        description,
        imageUri: selectedImage || undefined,
        likes: 0,
        liked: false,
        timestamp: new Date().toISOString(),
        category,
        comments: [],
      };

      const updated = [newContent, ...contents];
      await AsyncStorage.setItem(UGC_STORAGE_KEY, JSON.stringify(updated));
      setContents(updated);

      // 입력 필드 초기화
      setTitle('');
      setDescription('');
      setSelectedImage(null);
      setCategory('study');
      setShowUploadModal(false);
      alert('컨텐츠가 업로드되었습니다!');
    } catch (error) {
      console.error('컨텐츠 업로드 실패:', error);
      alert('업로드 실패. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (contentId: string) => {
    const updated = contents.map((content) =>
      content.id === contentId
        ? {
            ...content,
            liked: !content.liked,
            likes: content.liked ? content.likes - 1 : content.likes + 1,
          }
        : content
    );
    setContents(updated);
    await AsyncStorage.setItem(UGC_STORAGE_KEY, JSON.stringify(updated));
  };

  const addComment = async () => {
    if (!commentText.trim() || !selectedContentId) {
      alert('댓글을 입력해주세요.');
      return;
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      userName: '내 프로필',
      userAvatar: '👤',
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    const updated = contents.map((content) =>
      content.id === selectedContentId
        ? {
            ...content,
            comments: [...(content.comments || []), newComment],
          }
        : content
    );

    setContents(updated);
    await AsyncStorage.setItem(UGC_STORAGE_KEY, JSON.stringify(updated));
    setCommentText('');
  };

  const deleteComment = async (contentId: string, commentId: string) => {
    const updated = contents.map((content) =>
      content.id === contentId
        ? {
            ...content,
            comments: (content.comments || []).filter((c) => c.id !== commentId),
          }
        : content
    );

    setContents(updated);
    await AsyncStorage.setItem(UGC_STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteContent = async (contentId: string) => {
    const confirmed = confirm('정말 삭제하시겠습니까?');
    if (confirmed) {
      const updated = contents.filter((c) => c.id !== contentId);
      setContents(updated);
      await AsyncStorage.setItem(UGC_STORAGE_KEY, JSON.stringify(updated));
    }
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

  const renderContent = ({ item }: { item: UGCContent }) => (
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
        <View className="flex-row items-center gap-2">
          <Text className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
            {getCategoryLabel(item.category)}
          </Text>
          <Pressable
            onPress={() => deleteContent(item.id)}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Text className="text-lg">🗑️</Text>
          </Pressable>
        </View>
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

      {/* 액션 버튼 */}
      <View className="flex-row items-center gap-4 mb-3">
        <Pressable
          onPress={() => toggleLike(item.id)}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="flex-row items-center gap-2"
        >
          <Text className="text-xl">{item.liked ? '❤️' : '🤍'}</Text>
          <Text className="text-sm font-semibold text-foreground">{item.likes}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setSelectedContentId(item.id);
            setShowCommentModal(true);
          }}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="flex-row items-center gap-2"
        >
          <Text className="text-xl">💬</Text>
          <Text className="text-sm font-semibold text-foreground">
            {(item.comments || []).length}
          </Text>
        </Pressable>
      </View>

      {/* 댓글 미리보기 */}
      {(item.comments || []).length > 0 && (
        <View className="border-t border-border pt-3">
          {(item.comments || []).slice(0, 2).map((comment) => (
            <View key={comment.id} className="mb-2 pb-2 border-b border-border/50">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 flex-1">
                  <Text className="text-lg">{comment.userAvatar}</Text>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-foreground">{comment.userName}</Text>
                    <Text className="text-xs text-muted">{comment.text}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => deleteComment(item.id, comment.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text className="text-sm">✕</Text>
                </Pressable>
              </View>
            </View>
          ))}
          {(item.comments || []).length > 2 && (
            <Text className="text-xs text-primary font-semibold">
              +{(item.comments || []).length - 2}개 더보기
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderHeader = () => (
    <View className="mb-6">
      <Text className="text-3xl font-bold text-foreground mb-2">커뮤니티</Text>
      <Text className="text-sm text-muted">경제 학습 경험을 공유하세요</Text>

      {/* 업로드 버튼 */}
      <Pressable
        onPress={() => setShowUploadModal(true)}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        className="bg-primary rounded-lg p-4 mt-4 flex-row items-center justify-center gap-2"
      >
        <Text className="text-2xl">➕</Text>
        <Text className="text-white font-semibold">컨텐츠 업로드</Text>
      </Pressable>
    </View>
  );

  const renderEmpty = () => (
    <View className="items-center justify-center py-12">
      <Text className="text-4xl mb-3">📝</Text>
      <Text className="text-foreground font-semibold mb-1">아직 컨텐츠가 없습니다</Text>
      <Text className="text-sm text-muted">첫 번째 경험을 공유해보세요!</Text>
    </View>
  );

  return (
    <ScreenContainer className="p-0">
      <FlatList
        data={contents}
        keyExtractor={(item) => item.id}
        renderItem={renderContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />

      {/* 업로드 모달 */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View className="flex-1 bg-background">
          <ScreenContainer className="p-4">
            <FlatList
              data={[]}
              renderItem={() => null}
              ListHeaderComponent={
                <>
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

                  {/* 제목 입력 */}
                  <Text className="text-sm font-semibold text-foreground mb-2">제목</Text>
                  <TextInput
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor={colors.muted}
                    className="bg-surface border border-border rounded-lg p-3 text-foreground mb-4"
                  />

                  {/* 설명 입력 */}
                  <Text className="text-sm font-semibold text-foreground mb-2">설명</Text>
                  <TextInput
                    placeholder="상세한 설명을 입력하세요"
                    value={description}
                    onChangeText={setDescription}
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={4}
                    className="bg-surface border border-border rounded-lg p-3 text-foreground mb-4"
                  />

                  {/* 카테고리 선택 */}
                  <Text className="text-sm font-semibold text-foreground mb-2">카테고리</Text>
                  <View className="flex-row gap-2 mb-4">
                    {(['study', 'tip', 'question', 'discussion'] as const).map((cat) => (
                      <Pressable
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                        className={`px-3 py-2 rounded-lg ${
                          category === cat
                            ? 'bg-primary'
                            : 'bg-surface border border-border'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            category === cat ? 'text-white' : 'text-foreground'
                          }`}
                        >
                          {getCategoryLabel(cat)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* 이미지 선택 */}
                  <Pressable
                    onPress={pickImage}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="bg-surface border border-border rounded-lg p-4 mb-4 items-center"
                  >
                    <Text className="text-2xl mb-2">🖼️</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {selectedImage ? '이미지 선택됨' : '이미지 선택'}
                    </Text>
                  </Pressable>

                  {/* 업로드 버튼 */}
                  <Pressable
                    onPress={uploadContent}
                    disabled={loading}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="bg-primary rounded-lg p-4 items-center"
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-semibold">업로드</Text>
                    )}
                  </Pressable>
                </>
              }
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </ScreenContainer>
        </View>
      </Modal>

      {/* 댓글 모달 */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View className="flex-1 bg-background">
          <ScreenContainer className="p-4">
            <FlatList
              data={
                selectedContentId
                  ? contents.find((c) => c.id === selectedContentId)?.comments || []
                  : []
              }
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="bg-surface rounded-lg p-3 mb-3 flex-row items-start gap-2">
                  <Text className="text-lg">{item.userAvatar}</Text>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-foreground">{item.userName}</Text>
                    <Text className="text-sm text-muted">{item.text}</Text>
                    <Text className="text-xs text-muted mt-1">
                      {new Date(item.timestamp).toLocaleDateString('ko-KR')}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => deleteComment(selectedContentId!, item.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Text className="text-sm">✕</Text>
                  </Pressable>
                </View>
              )}
              ListHeaderComponent={
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-2xl font-bold text-foreground">댓글</Text>
                  <Pressable
                    onPress={() => setShowCommentModal(false)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Text className="text-2xl">✕</Text>
                  </Pressable>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 20 }}
            />

            {/* 댓글 입력 */}
            <View className="flex-row gap-2 mt-4 border-t border-border pt-4">
              <TextInput
                placeholder="댓글을 입력하세요"
                value={commentText}
                onChangeText={setCommentText}
                placeholderTextColor={colors.muted}
                className="flex-1 bg-surface border border-border rounded-lg p-3 text-foreground"
              />
              <Pressable
                onPress={addComment}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="bg-primary rounded-lg px-4 items-center justify-center"
              >
                <Text className="text-white font-semibold">전송</Text>
              </Pressable>
            </View>
          </ScreenContainer>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
