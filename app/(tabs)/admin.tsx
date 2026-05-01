import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Modal,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';
import { crawlArticle } from '@/lib/news-crawler';
import { processArticleWithGemini, processArticlesBatch } from '@/lib/gemini-client';
import { logoutAdmin } from '@/lib/admin-auth';
import { activatePremium, cancelPremium, getPremiumStatus } from '@/lib/premium-system';
import type { CrawledArticle } from '@/lib/news-crawler';
import * as Haptics from 'expo-haptics';

export default function AdminScreen() {
  const router = useRouter();
  const [articleUrl, setArticleUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedArticles, setGeneratedArticles] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [articleText, setArticleText] = useState('');
  const [previewIndex, setPreviewIndex] = useState(0);
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [showSavedArticles, setShowSavedArticles] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingSummary, setEditingSummary] = useState('');

  useEffect(() => {
    loadSavedArticles();
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace('/');
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요.');
      return;
    }
    await AsyncStorage.setItem('gemini-api-key', apiKey);
    setShowApiKeyInput(false);
    setError('');
  };

  const handleLoadApiKey = async () => {
    const savedKey = await AsyncStorage.getItem('gemini-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  };

  const loadSavedArticles = async () => {
    try {
      const customArticles = await AsyncStorage.getItem('custom-articles');
      if (customArticles) {
        setSavedArticles(JSON.parse(customArticles));
      }
    } catch (err) {
      console.error('Failed to load saved articles:', err);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      const updated = savedArticles.filter((article) => article.id !== articleId);
      await AsyncStorage.setItem('custom-articles', JSON.stringify(updated));
      setSavedArticles(updated);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      setError('기사 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleStartEdit = (article: any) => {
    setEditingArticle(article);
    setEditingTitle(article.title);
    setEditingSummary(article.summary);
  };

  const handleSaveEdit = async () => {
    if (!editingArticle) return;

    try {
      const updated = savedArticles.map((article) =>
        article.id === editingArticle.id
          ? { ...article, title: editingTitle, summary: editingSummary }
          : article
      );
      await AsyncStorage.setItem('custom-articles', JSON.stringify(updated));
      setSavedArticles(updated);
      setEditingArticle(null);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      setError('기사 편집 중 오류가 발생했습니다.');
    }
  };

  const parseArticleText = (text: string): CrawledArticle[] => {
    // "제목: ... 내용: ..." 형식으로 파싱
    const articles: CrawledArticle[] = [];
    
    // 여러 기사 구분: 빈 줄 2개 이상 또는 "---" 로 구분
    const articleBlocks = text.split(/\n\s*---\s*\n|\n\n\n+/).filter(block => block.trim());

    for (const block of articleBlocks) {
      // 제목과 내용 추출
      const titleMatch = block.match(/제목\s*[:：]\s*(.+?)(?:\n|내용\s*[:：])/);
      const contentMatch = block.match(/내용\s*[:：]\s*(.+)$/s);

      if (titleMatch && contentMatch) {
        const title = titleMatch[1].trim();
        const content = contentMatch[1].trim();
        
        if (title && content) {
          articles.push({
            title,
            content,
            source: '관리자 입력',
            url: `manual-${Date.now()}-${articles.length}`,
          });
        }
      }
    }

    return articles;
  };

  const handleGenerateQuiz = async () => {
    if (inputMode === 'url') {
      if (!articleUrl.trim()) {
        setError('기사 링크를 입력해주세요.');
        return;
      }
    } else {
      if (!articleText.trim()) {
        setError('기사 내용을 입력해주세요.');
        return;
      }
    }

    if (!apiKey.trim()) {
      setError('Gemini API 키를 설정해주세요.');
      setShowApiKeyInput(true);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      let processedArticles: any[] = [];

      if (inputMode === 'url') {
        // URL 모드: 크롤링
        const crawledArticle = await crawlArticle(articleUrl);
        const result = await processArticleWithGemini(crawledArticle, apiKey);
        processedArticles = [result];
      } else {
        // 텍스트 모드: 직접 입력한 텍스트 파싱
        const articles = parseArticleText(articleText);
        if (articles.length === 0) {
          setError('올바른 형식으로 기사를 입력해주세요.\n\n형식: 제목: ... 내용: ...\n\n여러 기사는 빈 줄 2개로 구분하세요.');
          setIsLoading(false);
          return;
        }
        processedArticles = await processArticlesBatch(articles, apiKey);
      }

      setGeneratedArticles(processedArticles);
      setPreviewIndex(0);
      setShowPreview(true);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveArticles = async () => {
    if (generatedArticles.length === 0) return;

    try {
      const existingArticles = await AsyncStorage.getItem('custom-articles');
      const articles = existingArticles ? JSON.parse(existingArticles) : [];
      articles.push(...generatedArticles);
      await AsyncStorage.setItem('custom-articles', JSON.stringify(articles));

      setShowPreview(false);
      setArticleUrl('');
      setArticleText('');
      setGeneratedArticles([]);
      await loadSavedArticles();

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      setError('기사 저장 중 오류가 발생했습니다.');
    }
  };

  const currentArticle = generatedArticles[previewIndex];

  const [premiumStatus, setPremiumStatus] = useState<{ isPremium: boolean; expiryDate: string | null } | null>(null);

  useEffect(() => {
    getPremiumStatus().then(setPremiumStatus);
  }, []);

  const handleActivatePremium = async () => {
    try {
      const result = await activatePremium(30);
      setPremiumStatus(result);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      alert('🎉 프리미엄 30일 활성화 완료!');
    } catch (e) {
      alert('프리미엄 활성화 실패');
    }
  };

  const handleCancelPremium = async () => {
    try {
      const result = await cancelPremium();
      setPremiumStatus(result);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      alert('프리미엄 구독이 취소되었습니다.');
    } catch (e) {
      alert('프리미엄 취소 실패');
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold text-foreground mb-2">⚙️ 관리자 패널</Text>
            <Text className="text-sm text-muted">뉴스 기사를 추가하고 자동으로 퀴즈를 생성하세요</Text>
          </View>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              {
                backgroundColor: '#f0f0f0',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text className="text-sm font-bold text-foreground">로그아웃</Text>
          </Pressable>
        </View>

        {/* Saved Articles Section */}
        <View className="rounded-[24px] bg-green-50 border border-green-200 p-6 mb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-semibold text-green-900">📚 저장된 기사</Text>
              <Text className="text-2xl font-bold text-green-700 mt-2">{savedArticles.length}개</Text>
            </View>
            <Pressable
              onPress={() => setShowSavedArticles(true)}
              style={({ pressed }) => [
                {
                  backgroundColor: '#2F7B56',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text className="text-sm font-bold text-white">관리</Text>
            </Pressable>
          </View>
        </View>

        {/* API Key Section */}
        <View className="rounded-[24px] bg-blue-50 border border-blue-200 p-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-blue-900">🔑 Gemini API 키</Text>
            <Pressable
              onPress={() => {
                setShowApiKeyInput(!showApiKeyInput);
                if (!showApiKeyInput) {
                  handleLoadApiKey();
                }
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text className="text-xs font-bold text-blue-600">
                {apiKey ? '변경' : '설정'}
              </Text>
            </Pressable>
          </View>
          <Text className="text-xs text-blue-800">
            {apiKey ? '✅ API 키가 설정되었습니다' : '❌ API 키를 설정해주세요'}
          </Text>
        </View>

        {/* Input Mode Tabs */}
        <View className="flex-row gap-3 mb-6">
          <Pressable
            onPress={() => setInputMode('url')}
            style={({ pressed }) => [
              {
                flex: 1,
                backgroundColor: inputMode === 'url' ? '#2F7B56' : '#f0f0f0',
                paddingVertical: 12,
                borderRadius: 12,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text className={`text-center font-bold ${inputMode === 'url' ? 'text-white' : 'text-foreground'}`}>
              🔗 링크 입력
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setInputMode('text')}
            style={({ pressed }) => [
              {
                flex: 1,
                backgroundColor: inputMode === 'text' ? '#2F7B56' : '#f0f0f0',
                paddingVertical: 12,
                borderRadius: 12,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text className={`text-center font-bold ${inputMode === 'text' ? 'text-white' : 'text-foreground'}`}>
              📝 텍스트 입력
            </Text>
          </Pressable>
        </View>

        {/* Input Section */}
        <View className="rounded-[24px] bg-surface border border-border p-6 mb-6">
          {inputMode === 'url' ? (
            <>
              <Text className="text-sm font-semibold text-foreground mb-3">📰 기사 링크 입력</Text>
              <TextInput
                placeholder="https://example.com/article"
                placeholderTextColor="#999"
                value={articleUrl}
                onChangeText={setArticleUrl}
                editable={!isLoading}
                className="border border-border rounded-[12px] px-4 py-3 text-foreground mb-4"
                style={{ color: '#11181C' }}
              />
            </>
          ) : (
            <>
              <Text className="text-sm font-semibold text-foreground mb-2">📝 기사 내용 입력</Text>
              <Text className="text-xs text-muted mb-3">
                형식: 제목: ... 내용: ... (여러 기사는 빈 줄 2개로 구분)
              </Text>
              <TextInput
                placeholder={`제목: 한국 경제 성장률 발표\n내용: 중앙은행이 기준금리를 인하했습니다...\n\n---\n\n제목: 다음 기사\n내용: 내용...`}
                placeholderTextColor="#999"
                value={articleText}
                onChangeText={setArticleText}
                editable={!isLoading}
                multiline
                numberOfLines={8}
                className="border border-border rounded-[12px] px-4 py-3 text-foreground mb-4"
                style={{ color: '#11181C', textAlignVertical: 'top' }}
              />
            </>
          )}

          {error && (
            <View className="rounded-[12px] bg-red-50 border border-red-300 p-4 mb-4">
              <Text className="text-xs font-bold text-red-900 mb-2">❌ 오류 발생</Text>
              <Text className="text-sm text-red-700 leading-relaxed">{error}</Text>
            </View>
          )}

          <Pressable
            onPress={handleGenerateQuiz}
            disabled={isLoading || !apiKey}
            style={({ pressed }) => [
              {
                backgroundColor: isLoading || !apiKey ? '#ccc' : '#2F7B56',
                paddingVertical: 14,
                borderRadius: 12,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View className="flex-row items-center justify-center gap-2">
              {isLoading && <ActivityIndicator color="white" size="small" />}
              <Text className="text-base font-bold text-white">
                {isLoading ? '생성 중...' : '✨ 퀴즈 생성'}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Premium Test Section */}
        <View className="rounded-[24px] bg-purple-50 border border-purple-200 p-6 mb-6">
          <Text className="text-sm font-semibold text-purple-900 mb-3">👑 프리미엄 테스트</Text>
          <Text className="text-xs text-purple-700 mb-4">
            현재 상태: {premiumStatus?.isPremium ? `✅ 활성 (만료: ${premiumStatus.expiryDate ? new Date(premiumStatus.expiryDate).toLocaleDateString('ko-KR') : '-'})` : '❌ 비활성'}
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleActivatePremium}
              style={({ pressed }) => [{
                flex: 1,
                backgroundColor: '#7C3AED',
                paddingVertical: 12,
                borderRadius: 12,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Text className="text-center text-sm font-bold text-white">👑 30일 활성화</Text>
            </Pressable>
            <Pressable
              onPress={handleCancelPremium}
              style={({ pressed }) => [{
                flex: 1,
                backgroundColor: '#f0f0f0',
                paddingVertical: 12,
                borderRadius: 12,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Text className="text-center text-sm font-bold text-foreground">❌ 구독 취소</Text>
            </Pressable>
          </View>
        </View>

        {/* Info Section */}
        <View className="rounded-[24px] bg-blue-50 border border-blue-200 p-6">
          <Text className="text-sm font-semibold text-blue-900 mb-3">💡 사용 방법</Text>
          <View className="gap-2">
            <Text className="text-sm text-blue-800">1️⃣ Gemini API 키를 설정합니다</Text>
            <Text className="text-sm text-blue-800">2️⃣ 링크 또는 텍스트로 기사를 입력합니다</Text>
            <Text className="text-sm text-blue-800">3️⃣ Gemini API가 자동으로 요약 및 10문제를 생성합니다</Text>
            <Text className="text-sm text-blue-800">4️⃣ 미리보기에서 내용을 확인한 후 저장합니다</Text>
            <Text className="text-sm text-blue-800">5️⃣ 저장된 기사는 사용자의 "오늘" 탭에 추가됩니다</Text>
          </View>
        </View>
      </ScrollView>

      {/* API Key Input Modal */}
      <Modal visible={showApiKeyInput} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 24,
              padding: 24,
              width: '85%',
              maxWidth: 320,
            }}
          >
            <Text className="text-2xl font-bold text-foreground mb-2">🔑 API 키 설정</Text>
            <Text className="text-sm text-muted mb-4">Gemini API 키를 입력하세요</Text>

            <TextInput
              placeholder="your-api-key-here"
              placeholderTextColor="#999"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
              className="border border-border rounded-[12px] px-4 py-3 text-foreground mb-4"
              style={{ color: '#11181C' }}
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowApiKeyInput(false)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    backgroundColor: '#f0f0f0',
                    paddingVertical: 12,
                    borderRadius: 12,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center font-bold text-foreground">취소</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveApiKey}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    backgroundColor: '#2F7B56',
                    paddingVertical: 12,
                    borderRadius: 12,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center font-bold text-white">저장</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={showPreview} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ flex: 1, backgroundColor: 'white', marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-2xl font-bold text-foreground">✅ 미리보기</Text>
                <Pressable onPress={() => setShowPreview(false)}>
                  <Text className="text-2xl">✕</Text>
                </Pressable>
              </View>

              {/* 페이지 네비게이션 */}
              {generatedArticles.length > 1 && (
                <View className="flex-row items-center justify-between mb-6 bg-blue-50 rounded-[12px] p-4">
                  <Pressable
                    onPress={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
                    disabled={previewIndex === 0}
                    style={({ pressed }) => [{ opacity: previewIndex === 0 ? 0.5 : pressed ? 0.7 : 1 }]}
                  >
                    <Text className="text-lg font-bold text-blue-600">◀ 이전</Text>
                  </Pressable>

                  <Text className="text-sm font-semibold text-blue-900">
                    {previewIndex + 1} / {generatedArticles.length}
                  </Text>

                  <Pressable
                    onPress={() => setPreviewIndex(Math.min(generatedArticles.length - 1, previewIndex + 1))}
                    disabled={previewIndex === generatedArticles.length - 1}
                    style={({ pressed }) => [{ opacity: previewIndex === generatedArticles.length - 1 ? 0.5 : pressed ? 0.7 : 1 }]}
                  >
                    <Text className="text-lg font-bold text-blue-600">다음 ▶</Text>
                  </Pressable>
                </View>
              )}

              {currentArticle && (
                <View className="gap-4">
                  <View>
                    <Text className="text-xs font-semibold text-muted mb-2">📰 제목</Text>
                    <Text className="text-xl font-bold text-foreground">{currentArticle.title}</Text>
                  </View>

                  <View>
                    <Text className="text-xs font-semibold text-muted mb-2">📝 요약</Text>
                    <Text className="text-sm text-foreground leading-relaxed">{currentArticle.summary}</Text>
                  </View>

                  <View>
                    <Text className="text-xs font-semibold text-muted mb-2">🎯 주요 포인트</Text>
                    <View className="gap-2">
                      {currentArticle.keyPoints?.map((point: string, idx: number) => (
                        <Text key={idx} className="text-sm text-foreground">
                          • {point}
                        </Text>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text className="text-xs font-semibold text-muted mb-2">💡 경제 용어</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {currentArticle.terms?.map((term: string, idx: number) => (
                        <View key={idx} className="bg-blue-100 rounded-full px-3 py-1">
                          <Text className="text-xs font-semibold text-blue-900">{term}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text className="text-xs font-semibold text-muted mb-2">🎯 생성된 문제 수</Text>
                    <Text className="text-lg font-bold text-primary">{currentArticle.quiz?.length || 0}개</Text>
                  </View>

                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => setShowPreview(false)}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          backgroundColor: '#f0f0f0',
                          paddingVertical: 12,
                          borderRadius: 12,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Text className="text-center font-bold text-foreground">취소</Text>
                    </Pressable>

                    <Pressable
                      onPress={handleSaveArticles}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          backgroundColor: '#2F7B56',
                          paddingVertical: 12,
                          borderRadius: 12,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Text className="text-center font-bold text-white">
                        💾 {generatedArticles.length > 1 ? `모두 저장 (${generatedArticles.length}개)` : '저장'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Saved Articles Management Modal */}
      <Modal visible={showSavedArticles} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ flex: 1, backgroundColor: 'white', marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-2xl font-bold text-foreground">📚 저장된 기사 관리</Text>
                <Pressable onPress={() => setShowSavedArticles(false)}>
                  <Text className="text-2xl">✕</Text>
                </Pressable>
              </View>

              {savedArticles.length === 0 ? (
                <View className="items-center justify-center py-12">
                  <Text className="text-lg text-muted">저장된 기사가 없습니다</Text>
                </View>
              ) : (
                <View className="gap-4">
                  {savedArticles.map((article, idx) => (
                    <View key={article.id} className="rounded-[16px] bg-surface border border-border p-4">
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className="text-xs font-semibold text-muted mb-1">기사 {idx + 1}</Text>
                          <Text className="text-base font-bold text-foreground">{article.title}</Text>
                        </View>
                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={() => handleStartEdit(article)}
                            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                          >
                            <Text className="text-lg">✏️</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleDeleteArticle(article.id)}
                            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                          >
                            <Text className="text-lg">🗑️</Text>
                          </Pressable>
                        </View>
                      </View>
                      <Text className="text-sm text-foreground leading-relaxed">{article.summary}</Text>
                      <View className="flex-row gap-2 mt-3">
                        <Text className="text-xs bg-blue-100 text-blue-900 rounded-full px-2 py-1">
                          {article.quiz?.length || 0}문제
                        </Text>
                        <Text className="text-xs bg-green-100 text-green-900 rounded-full px-2 py-1">
                          {article.category}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Article Modal */}
      <Modal visible={!!editingArticle} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 24,
              padding: 24,
              width: '90%',
              maxWidth: 400,
            }}
          >
            <Text className="text-2xl font-bold text-foreground mb-4">✏️ 기사 편집</Text>

            <Text className="text-sm font-semibold text-foreground mb-2">제목</Text>
            <TextInput
              value={editingTitle}
              onChangeText={setEditingTitle}
              className="border border-border rounded-[12px] px-4 py-3 text-foreground mb-4"
              style={{ color: '#11181C' }}
            />

            <Text className="text-sm font-semibold text-foreground mb-2">요약</Text>
            <TextInput
              value={editingSummary}
              onChangeText={setEditingSummary}
              multiline
              numberOfLines={4}
              className="border border-border rounded-[12px] px-4 py-3 text-foreground mb-4"
              style={{ color: '#11181C', textAlignVertical: 'top' }}
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setEditingArticle(null)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    backgroundColor: '#f0f0f0',
                    paddingVertical: 12,
                    borderRadius: 12,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center font-bold text-foreground">취소</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveEdit}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    backgroundColor: '#2F7B56',
                    paddingVertical: 12,
                    borderRadius: 12,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center font-bold text-white">저장</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
