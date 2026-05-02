import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { defaultProgress, type ProgressState } from '@/lib/finstudy-data';

const STORAGE_KEY = 'finstudy-progress-v1';

export default function ProgressScreen() {
  const [progress, setProgress] = useState<ProgressState>(defaultProgress);

  useFocusEffect(
    useCallback(() => {
      void loadProgress();
    }, []),
  );

  async function loadProgress() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setProgress(defaultProgress);
      return;
    }

    setProgress(JSON.parse(raw) as ProgressState);
  }

  const accuracy = progress.solvedAnswers
    ? Math.round((progress.correctAnswers / progress.solvedAnswers) * 100)
    : 0;

  return (
    <ScreenContainer className="px-5 pt-6" containerClassName="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32, gap: 20 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="rounded-[28px] bg-surface p-6 border border-border">
          <Text className="text-[32px] font-bold text-foreground">📈 성장</Text>
          <Text className="mt-3 text-[15px] leading-7 text-muted">
            퀴즈 결과와 연속 학습 흐름을 차분한 카드 구성으로 요약합니다.
          </Text>
        </View>

        {/* Main Stats */}
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-[22px] bg-gradient-to-br from-orange-50 to-orange-100 p-5 border border-orange-200">
            <Text className="text-3xl mb-2">⭐</Text>
            <Text className="text-xs font-semibold text-orange-700">누적 XP</Text>
            <Text className="mt-3 text-[32px] font-bold text-orange-900">{progress.xp}</Text>
            <Text className="mt-2 text-xs text-orange-700">경험치 포인트</Text>
          </View>
          <View className="flex-1 rounded-[22px] bg-gradient-to-br from-red-50 to-red-100 p-5 border border-red-200">
            <Text className="text-3xl mb-2">🔥</Text>
            <Text className="text-xs font-semibold text-red-700">연속 학습</Text>
            <Text className="mt-3 text-[32px] font-bold text-red-900">{progress.streak}일</Text>
            <Text className="mt-2 text-xs text-red-700">연속 학습 중</Text>
          </View>
        </View>

        {/* Quiz Performance */}
        <View className="rounded-[24px] bg-surface p-6 border border-border">
          <Text className="text-lg font-bold text-foreground mb-1">📊 퀴즈 성과</Text>
          <Text className="text-sm text-muted mb-4">지금까지의 학습 성과를 확인하세요</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-[18px] bg-gradient-to-br from-blue-50 to-blue-100 p-5 border border-blue-200">
              <Text className="text-2xl mb-2">✅</Text>
              <Text className="text-xs font-semibold text-blue-700">정답률</Text>
              <Text className="mt-3 text-[28px] font-bold text-blue-900">{accuracy}%</Text>
              <Text className="mt-2 text-xs text-blue-700">정확도</Text>
            </View>
            <View className="flex-1 rounded-[18px] bg-gradient-to-br from-green-50 to-green-100 p-5 border border-green-200">
              <Text className="text-2xl mb-2">✏️</Text>
              <Text className="text-xs font-semibold text-green-700">푼 문항</Text>
              <Text className="mt-3 text-[28px] font-bold text-green-900">{progress.solvedAnswers}</Text>
              <Text className="mt-2 text-xs text-green-700">총 문제</Text>
            </View>
          </View>
        </View>

        {/* Review Queue */}
        <View className="rounded-[24px] bg-surface p-6 border border-border">
          <Text className="text-lg font-bold text-foreground mb-1">🔄 복습 큐</Text>
          <Text className="text-sm text-muted mb-4">
            오답이 발생한 기사나 다시 읽을 주제를 상단에 유지합니다.
          </Text>
          {progress.reviewQueue.length > 0 ? (
            <View className="gap-3">
              {progress.reviewQueue.map((item, index) => (
                <View
                  key={`${item}-${index}`}
                  className="rounded-[18px] bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4 border border-purple-200"
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-lg">
                      {index === 0 ? '🔴' : index === 1 ? '🟠' : index === 2 ? '🟡' : '⚪'}
                    </Text>
                    <Text className="text-[15px] leading-7 text-[#30443A] flex-1">{item}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="rounded-[18px] bg-green-50 px-5 py-6 border border-green-200 items-center">
              <Text className="text-3xl mb-2">🎉</Text>
              <Text className="text-base font-semibold text-green-900">완벽해요!</Text>
              <Text className="text-sm text-green-700 mt-1">복습할 항목이 없습니다.</Text>
            </View>
          )}
        </View>

        {/* Learning Insights */}
        <View className="rounded-[24px] bg-gradient-to-br from-indigo-50 to-blue-50 p-6 border border-indigo-200">
          <Text className="text-lg font-bold text-indigo-900 mb-3">💡 학습 인사이트</Text>
          <View className="gap-3">
            <View className="flex-row items-start gap-3">
              <Text className="text-lg">📚</Text>
              <View className="flex-1">
                <Text className="font-semibold text-indigo-900">꾸준한 학습</Text>
                <Text className="text-sm text-indigo-700 mt-1">
                  {progress.streak}일 연속으로 학습하고 있어요. 계속 유지해보세요!
                </Text>
              </View>
            </View>
            <View className="flex-row items-start gap-3">
              <Text className="text-lg">🎯</Text>
              <View className="flex-1">
                <Text className="font-semibold text-indigo-900">목표 달성</Text>
                <Text className="text-sm text-indigo-700 mt-1">
                  {progress.solvedAnswers}개 문제를 풀었어요. 더 많은 경제 지식을 쌓아보세요!
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View className="rounded-[24px] bg-surface p-6 border border-border">
          <Text className="text-lg font-bold text-foreground mb-4">🏆 배지</Text>
          <View className="flex-row flex-wrap gap-3">
            {progress.streak >= 7 && (
              <View className="flex-1 min-w-[45%] rounded-[16px] bg-yellow-50 p-4 border border-yellow-200 items-center">
                <Text className="text-3xl mb-2">🔥</Text>
                <Text className="text-xs font-bold text-yellow-900 text-center">일주일 연속</Text>
              </View>
            )}
            {progress.xp >= 100 && (
              <View className="flex-1 min-w-[45%] rounded-[16px] bg-blue-50 p-4 border border-blue-200 items-center">
                <Text className="text-3xl mb-2">⭐</Text>
                <Text className="text-xs font-bold text-blue-900 text-center">100 XP 달성</Text>
              </View>
            )}
            {accuracy >= 80 && (
              <View className="flex-1 min-w-[45%] rounded-[16px] bg-green-50 p-4 border border-green-200 items-center">
                <Text className="text-3xl mb-2">✅</Text>
                <Text className="text-xs font-bold text-green-900 text-center">80% 정답률</Text>
              </View>
            )}
            {progress.solvedAnswers >= 20 && (
              <View className="flex-1 min-w-[45%] rounded-[16px] bg-purple-50 p-4 border border-purple-200 items-center">
                <Text className="text-3xl mb-2">📚</Text>
                <Text className="text-xs font-bold text-purple-900 text-center">20문제 완료</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
