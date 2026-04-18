import { Pressable, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import type { WrongAnswer } from '@/lib/spaced-repetition';
import { selectPriorityReviewQuestions, calculateReviewStats } from '@/lib/spaced-repetition';

export interface ReviewTabProps {
  wrongAnswers: WrongAnswer[];
  isAllArticlesCompleted: boolean;
  onStartReview: (questions: WrongAnswer[]) => void;
}

export function ReviewTab({ wrongAnswers, isAllArticlesCompleted, onStartReview }: ReviewTabProps) {
  const [priorityQuestions, setPriorityQuestions] = useState<WrongAnswer[]>([]);
  const [stats, setStats] = useState(calculateReviewStats(wrongAnswers));

  useEffect(() => {
    if (isAllArticlesCompleted && wrongAnswers.length > 0) {
      const priority = selectPriorityReviewQuestions(wrongAnswers, 5);
      setPriorityQuestions(priority);
      setStats(calculateReviewStats(wrongAnswers));
    }
  }, [wrongAnswers, isAllArticlesCompleted]);

  if (!isAllArticlesCompleted) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-6xl mb-4">🔒</Text>
        <Text className="text-2xl font-bold text-foreground mb-2">오늘의 기사 리뷰</Text>
        <Text className="text-sm text-muted text-center leading-relaxed">
          모든 기사의 퀴즈를 완료하면 오답 복습 기능이 활성화됩니다.
        </Text>
        <View className="mt-6 rounded-[16px] bg-blue-50 border border-blue-200 px-4 py-3 w-full">
          <Text className="text-xs font-semibold text-blue-900 mb-2">📊 진행 상황</Text>
          <Text className="text-sm text-blue-900">
            모든 기사를 완료하면 틀린 문제들을 망각곡선에 따라 복습할 수 있습니다.
          </Text>
        </View>
      </View>
    );
  }

  if (wrongAnswers.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-6xl mb-4">🎉</Text>
        <Text className="text-2xl font-bold text-foreground mb-2">완벽해요!</Text>
        <Text className="text-sm text-muted text-center leading-relaxed">
          오늘 풀은 모든 문제를 맞혔습니다. 계속 좋은 성적을 유지해주세요!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}>
      {/* Stats */}
      <View className="gap-3 mb-6">
        <View className="rounded-[20px] bg-surface border border-border p-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-muted">📝 오답 통계</Text>
            <Text className="text-2xl font-bold text-foreground">{stats.totalWrongAnswers}</Text>
          </View>
          <Text className="text-xs text-muted">총 오답 문제 수</Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-[20px] bg-surface border border-border p-4">
            <Text className="text-2xl font-bold text-foreground mb-1">{stats.dueForReview.length}</Text>
            <Text className="text-xs text-muted">복습 대기 중</Text>
          </View>
          <View className="flex-1 rounded-[20px] bg-surface border border-border p-4">
            <Text className="text-2xl font-bold text-primary mb-1">{stats.accuracy}%</Text>
            <Text className="text-xs text-muted">복습 정답률</Text>
          </View>
        </View>
      </View>

      {/* Priority Review */}
      {priorityQuestions.length > 0 && (
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">⭐ 우선 복습 문제</Text>
          <View className="gap-3">
            {priorityQuestions.map((question, idx) => (
              <View key={question.id} className="rounded-[16px] bg-surface border border-border p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs font-semibold text-primary">
                      {idx + 1}. {question.difficulty === 'hard' ? '🔴' : question.difficulty === 'medium' ? '🟡' : '🟢'}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted">{question.articleTitle}</Text>
                </View>
                <Text className="text-sm font-semibold text-foreground mb-2">{question.question}</Text>
                <Text className="text-xs text-muted mb-3">
                  복습: {question.reviewCount}회 · 정답률: {question.correctOnReview ? '100%' : '0%'}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => onStartReview(priorityQuestions)}
            style={({ pressed }) => [
              {
                backgroundColor: '#2F7B56',
                paddingVertical: 14,
                borderRadius: 12,
                marginTop: 16,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text className="text-center font-bold text-white">🎯 우선 복습 시작</Text>
          </Pressable>
        </View>
      )}

      {/* All Wrong Answers */}
      <View>
        <Text className="text-lg font-bold text-foreground mb-4">📚 전체 오답 목록</Text>
        <View className="gap-2">
          {wrongAnswers.map((question) => (
            <View key={question.id} className="rounded-[12px] bg-red-50 border border-red-200 p-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-semibold text-red-700">{question.articleTitle}</Text>
                <Text className="text-xs text-red-600">복습: {question.reviewCount}회</Text>
              </View>
              <Text className="text-xs text-red-700 leading-relaxed">{question.question}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
