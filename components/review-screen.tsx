import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { ScreenContainer } from './screen-container';
import type { WrongAnswer } from '@/lib/spaced-repetition';
import { getReviewDue, updateWrongAnswerReview } from '@/lib/spaced-repetition';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const WRONG_ANSWERS_KEY = 'finstudy-wrong-answers-v1';

export interface ReviewScreenProps {
  onBack: () => void;
  onReviewQuestion: (wrongAnswer: WrongAnswer) => void;
}

export function ReviewScreen({ onBack, onReviewQuestion }: ReviewScreenProps) {
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [dueForReview, setDueForReview] = useState<WrongAnswer[]>([]);
  const [reviewedToday, setReviewedToday] = useState(0);

  useEffect(() => {
    loadWrongAnswers();
  }, []);

  async function loadWrongAnswers() {
    try {
      const raw = await AsyncStorage.getItem(WRONG_ANSWERS_KEY);
      if (raw) {
        const answers = JSON.parse(raw) as WrongAnswer[];
        setWrongAnswers(answers);
        const due = getReviewDue(answers);
        setDueForReview(due);
        const reviewed = answers.filter((a) => {
          const today = new Date().toDateString();
          const reviewDate = new Date(a.lastReviewDate).toDateString();
          return today === reviewDate;
        }).length;
        setReviewedToday(reviewed);
      }
    } catch (err) {
      console.error('Failed to load wrong answers:', err);
    }
  }

  async function handleReviewAnswer(wrongAnswer: WrongAnswer, isCorrect: boolean) {
    try {
      const updated = updateWrongAnswerReview(wrongAnswer, isCorrect);
      const newAnswers = wrongAnswers.map((a) => (a.id === updated.id ? updated : a));
      setWrongAnswers(newAnswers);
      await AsyncStorage.setItem(WRONG_ANSWERS_KEY, JSON.stringify(newAnswers));
      const due = getReviewDue(newAnswers);
      setDueForReview(due);
      setReviewedToday(reviewedToday + 1);
    } catch (err) {
      console.error('Failed to mark review complete:', err);
    }
  }

  const totalWrong = wrongAnswers.length;
  const reviewAccuracy = totalWrong > 0 ? Math.round((wrongAnswers.filter((a) => a.correctOnReview).length / totalWrong) * 100) : 0;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">📚 오늘의 기사 리뷰</Text>
          <Pressable onPress={onBack}>
            <Text className="text-2xl">✕</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 rounded-lg bg-surface p-4 border border-border">
            <Text className="text-xs font-semibold text-muted mb-1">총 오답</Text>
            <Text className="text-2xl font-bold text-foreground">{totalWrong}</Text>
          </View>
          <View className="flex-1 rounded-lg bg-surface p-4 border border-border">
            <Text className="text-xs font-semibold text-muted mb-1">오늘 복습</Text>
            <Text className="text-2xl font-bold text-primary">{reviewedToday}</Text>
          </View>
          <View className="flex-1 rounded-lg bg-surface p-4 border border-border">
            <Text className="text-xs font-semibold text-muted mb-1">복습 정답률</Text>
            <Text className="text-2xl font-bold text-success">{reviewAccuracy}%</Text>
          </View>
        </View>

        {/* Review Queue */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">
            🔄 복습 예정 ({dueForReview.length}개)
          </Text>
          {dueForReview.length === 0 ? (
            <View className="rounded-lg bg-green-50 border border-green-200 p-4">
              <Text className="text-sm text-green-700 font-semibold">✅ 오늘의 복습이 모두 완료되었습니다!</Text>
            </View>
          ) : (
            <View className="gap-3">
              {dueForReview.slice(0, 5).map((wrongAnswer) => (
                <Pressable
                  key={wrongAnswer.id}
                  onPress={() => onReviewQuestion(wrongAnswer)}
                  style={({ pressed }) => [
                    styles.reviewCard,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-2">
                      <Text className="text-xs font-bold text-white bg-primary px-2 py-1 rounded">
                        {wrongAnswer.difficulty === 'easy' ? '초' : wrongAnswer.difficulty === 'medium' ? '중' : '상'}
                      </Text>
                      <Text className="text-xs text-muted">
                        {wrongAnswer.reviewCount}회 복습 • 다음: {calculateDaysUntilReview(wrongAnswer.nextReviewDate)}일 후
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-foreground leading-relaxed" numberOfLines={2}>
                      {wrongAnswer.question}
                    </Text>
                  </View>
                  <Text className="text-lg">→</Text>
                </Pressable>
              ))}
              {dueForReview.length > 5 && (
                <Text className="text-xs text-muted text-center">
                  +{dueForReview.length - 5}개 더 있습니다
                </Text>
              )}
            </View>
          )}
        </View>

        {/* All Wrong Answers */}
        <View>
          <Text className="text-sm font-semibold text-foreground mb-3">
            📋 모든 오답 ({totalWrong}개)
          </Text>
          {wrongAnswers.length === 0 ? (
            <View className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <Text className="text-sm text-blue-700 font-semibold">ℹ️ 아직 오답이 없습니다. 퀴즈를 풀어보세요!</Text>
            </View>
          ) : (
            <View className="gap-2">
              {wrongAnswers.map((wrongAnswer) => (
                <View key={wrongAnswer.id} className="rounded-lg bg-surface p-3 border border-border">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs font-bold text-primary">
                      {wrongAnswer.articleTitle}
                    </Text>
                    <Text className="text-xs text-muted">
                      {wrongAnswer.correctOnReview ? '✅ 정답' : '❌ 오답'}
                    </Text>
                  </View>
                  <Text className="text-xs text-foreground leading-relaxed" numberOfLines={1}>
                    {wrongAnswer.question}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Back Button */}
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text className="text-center font-bold text-white">← 돌아가기</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

function calculateDaysUntilReview(nextReviewDate: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewDate = new Date(nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);
  const diff = Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

const styles = StyleSheet.create({
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backButton: {
    backgroundColor: '#A8D5BA',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
});
