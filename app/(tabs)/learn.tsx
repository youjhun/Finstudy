import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { usePremium } from '@/lib/premium-context';
import { CertificationStudyTab } from '@/components/certification-study-tab';

import { curriculum, unit2Screens, unit2Problems, type Unit } from '@/lib/curriculum-data';
import {
  LearningSessionManager,
  type UserProgress,
  type LearningSessionState,
} from '@/lib/learning-session-manager';
import {
  LearningScreenRenderer,
  IntroScreen,
  ConceptScreen,
  QuizScreen,
  OutroScreen,
} from '@/components/learning-screens';

/**
 * 학습 탭 - 커리큘럼 기반 학습 플로우
 * 
 * 화면 구성:
 * 1. 유닛 선택 화면 (6개 유닛 목록)
 * 2. 유닛 상세 화면 (진행도, 시작 버튼)
 * 3. 학습 화면 (5개 화면 타입)
 * 4. 세션 완료 화면 (XP, 스트릭, 다음 버튼)
 */

type ScreenState = 'unit-list' | 'unit-detail' | 'learning' | 'session-complete' | 'certification';

interface LearningTabState {
  screen: ScreenState;
  selectedUnit?: Unit;
  session?: LearningSessionState;
  progress?: UserProgress;
}

export default function LearnScreen() {
  const colors = useColors();
  const { isPremium } = usePremium();
  const [state, setState] = useState<LearningTabState>({ screen: 'unit-list' });
  const [loading, setLoading] = useState(false);

  // ============= 화면 1: 유닛 선택 =============
  // ============= 조건부 렌더링 =============

  if (state.screen === 'certification') {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <CertificationStudyTab isPremium={isPremium} />
      </ScreenContainer>
    );
  }


  function renderUnitList() {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* 헤더 */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground mb-2">
              📚 경제 학습
            </Text>
            <Text className="text-sm text-muted">
              6개 유닛으로 경제를 완벽히 이해하세요
            </Text>
          </View>

          {/* NCS/자격증 대비 섹션 (프리미엄) */}
          {isPremium && (
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setState({ screen: 'certification' });
              }}
              style={({ pressed }) => [{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white mb-1">🎯 NCS/자격증 대비</Text>
                  <Text className="text-xs text-white opacity-80">AFPK · 투자자산운용사 · TESAT</Text>
                </View>
                <Text className="text-2xl">→</Text>
              </View>
            </Pressable>
          )}

          {/* 유닛 목록 */}
          <View className="gap-3">
            {curriculum.map((unit, index) => {
              const isLocked = index > 0 && !state.progress?.completedProblems.length;
              return (
                <Pressable
                  key={unit.id}
                  onPress={() => {
                    if (!isLocked) {
                      setState({ screen: 'unit-detail', selectedUnit: unit });
                    }
                  }}
                  disabled={isLocked}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 16,
                      opacity: isLocked ? 0.5 : pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-bold text-foreground">
                      {unit.title}
                    </Text>
                    {isLocked && (
                      <Text className="text-xl">🔒</Text>
                    )}
                  </View>
                  <Text className="text-sm text-muted mb-2">
                    {unit.description}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-muted">
                      ⏱️ {unit.estimatedTime}분
                    </Text>
                    <Text className="text-xs text-primary font-semibold">
                      {index + 1}/6
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* 학습 팁 */}
          <View
            className="mt-6 rounded-lg p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-sm font-semibold text-foreground mb-2">
              💡 학습 팁
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              매일 학습하면 스트릭이 쌓여요. 신규 개념 40%와 복습 60%로 구성된 세션을 완료하면 XP를 얻습니다.
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ============= 화면 2: 유닛 상세 =============

  async function loadUnitProgress(unit: Unit) {
    setLoading(true);
    try {
      const progress = await LearningSessionManager.loadProgress(unit.id);
      setState((prev) => ({
        ...prev,
        progress,
      }));
    } catch (error) {
      console.error('Failed to load unit progress:', error);
    } finally {
      setLoading(false);
    }
  }

  function renderUnitDetail() {
    if (!state.selectedUnit || !state.progress) return null;

    const unit = state.selectedUnit;
    const progress = state.progress;
    const stats = {
      completedProblems: progress.completedProblems.length,
      totalXP: progress.totalXP,
      streak: progress.currentStreak,
    };

    return (
      <ScreenContainer className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* 뒤로가기 */}
          <Pressable
            onPress={() => setState({ screen: 'unit-list' })}
            className="mb-4"
          >
            <Text className="text-primary font-semibold">← 돌아가기</Text>
          </Pressable>

          {/* 유닛 헤더 */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground mb-2">
              {state.selectedUnit.title}
            </Text>
            <Text className="text-sm text-muted">
              {state.selectedUnit.description}
            </Text>
          </View>

          {/* 진행도 카드 */}
          <View
            className="rounded-lg p-4 mb-6"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-foreground">
                진행도
              </Text>
              <Text className="text-sm font-bold text-primary">
                {stats.completedProblems}/6
              </Text>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: colors.border,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${(stats.completedProblems / 6) * 100}%`,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
          </View>

          {/* 통계 */}
          <View className="flex-row gap-3 mb-6">
            <View
              className="flex-1 rounded-lg p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-xs text-muted mb-1">총 XP</Text>
              <Text className="text-2xl font-bold text-foreground">
                {stats.totalXP}
              </Text>
            </View>
            <View
              className="flex-1 rounded-lg p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-xs text-muted mb-1">연속 학습</Text>
              <Text className="text-2xl font-bold text-foreground">
                {stats.streak}🔥
              </Text>
            </View>
          </View>

          {/* 시작 버튼 */}
          <Pressable
            onPress={async () => {
              setLoading(true);
              try {
                // Unit 2 데이터 사용 (임시)
                if (!state.progress) return;
                const sessionProblems = LearningSessionManager.buildSessionProblems(
                  unit2Problems,
                  state.progress,
                  5
                );
                const session = LearningSessionManager.createSession(
                  state.selectedUnit?.id || unit.id,
                  sessionProblems
                );
                setState((prev) => ({
                  ...prev,
                  screen: 'learning',
                  session,
                }));
              } catch (error) {
                console.error('Failed to start session:', error);
              } finally {
                setLoading(false);
              }
            }}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 16,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text className="text-white text-center font-bold text-lg">
              {stats.completedProblems > 0 ? '계속 학습' : '시작하기'} →
            </Text>
          </Pressable>

          {/* 배지 */}
          {unit.badges.length > 0 && (
            <View className="mt-6">
              <Text className="text-sm font-semibold text-foreground mb-3">
                🏆 배지
              </Text>
              {unit.badges.map((badge) => (
                <View
                  key={badge.id}
                  className="flex-row items-center gap-3 p-3 rounded-lg mb-2"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-2xl">{badge.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {badge.name}
                    </Text>
                    <Text className="text-xs text-muted">
                      {badge.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ============= 화면 3: 학습 화면 =============

  function renderLearning() {
    if (!state.session || !state.selectedUnit || !state.progress) return null;

    const session = state.session;
    const currentSessionProblem = session.problems[session.currentProblemIndex];

    if (!currentSessionProblem) {
      // 세션 완료
      return renderSessionComplete();
    }

    const screen = unit2Screens[session.currentProblemIndex] || unit2Screens[0];
    const problem = currentSessionProblem.problem;

    return (
      <LearningScreenRenderer
        screen={screen}
        problem={problem}
        onAnswer={async (result) => {
          const isCorrect = typeof result === 'boolean' ? result : result === 1;
          if (!state.progress) return;
          const { session: updatedSession, progress: updatedProgress } =
            await LearningSessionManager.handleAnswer(
              session,
              state.progress,
              isCorrect
            );
          setState((prev) => ({
            ...prev,
            session: updatedSession,
            progress: updatedProgress,
          }));
        }}
        onNext={() => {
          // 다음 화면으로
          setState((prev) => {
            if (!prev.session) return prev;
            return {
              ...prev,
              session: {
                ...prev.session,
                currentProblemIndex: prev.session.currentProblemIndex + 1,
              },
            };
          });
        }}
        onComplete={async (xp) => {
          // 세션 완료
          if (state.session && state.progress && state.selectedUnit) {
            const completedProgress = await LearningSessionManager.completeSession(
              state.session,
              state.progress
            );
            await LearningSessionManager.saveProgress(completedProgress);
            setState((prev) => ({
              ...prev,
              screen: 'session-complete',
              progress: completedProgress,
              session: prev.session,
            }));
          }
        }}
      />
    );
  }

  // ============= 화면 4: 세션 완료 =============

  function renderSessionComplete() {
    if (!state.session || !state.progress || !state.selectedUnit) return null;

    const session = state.session;
    const accuracy =
      session.correctCount + session.wrongCount > 0
        ? Math.round(
            (session.correctCount / (session.correctCount + session.wrongCount)) * 100
          )
        : 0;

    return (
      <ScreenContainer className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* 완료 메시지 */}
          <View className="items-center mb-6 mt-12">
            <Text className="text-5xl mb-4">🎉</Text>
            <Text className="text-3xl font-bold text-foreground mb-2">
              완료!
            </Text>
            <Text className="text-base text-muted">
              좋은 학습 세션이었어요
            </Text>
          </View>

          {/* 통계 */}
          <View className="gap-3 mb-6">
            <View
              className="rounded-lg p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-xs text-muted mb-1">정답률</Text>
              <Text className="text-3xl font-bold text-foreground">
                {accuracy}%
              </Text>
            </View>
            <View className="flex-row gap-3">
              <View
                className="flex-1 rounded-lg p-4"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xs text-muted mb-1">정답</Text>
                <Text className="text-2xl font-bold text-green-600">
                  {session.correctCount}
                </Text>
              </View>
              <View
                className="flex-1 rounded-lg p-4"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xs text-muted mb-1">오답</Text>
                <Text className="text-2xl font-bold text-red-600">
                  {session.wrongCount}
                </Text>
              </View>
            </View>
            <View
              className="rounded-lg p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-xs text-muted mb-1">XP 획득</Text>
              <Text className="text-3xl font-bold text-primary">
                +{session.xpEarned}
              </Text>
            </View>
          </View>

          {/* 스트릭 */}
          <View
            className="rounded-lg p-4 mb-6"
            style={{ backgroundColor: '#fff3cd' }}
          >
            <Text className="text-lg font-bold text-foreground mb-2">
              🔥 연속 학습: {state.progress.currentStreak}일
            </Text>
            <Text className="text-sm text-muted">
              내일도 학습하면 스트릭이 계속됩니다!
            </Text>
          </View>

          {/* 다음 버튼 */}
          <Pressable
            onPress={() => {
              setState({ screen: 'unit-list', selectedUnit: undefined, session: undefined, progress: undefined });
            }}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 16,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text className="text-white text-center font-bold text-lg">
              다음 유닛으로 →
            </Text>
          </Pressable>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ============= 메인 렌더러 =============

  useEffect(() => {
    if (state.screen === 'unit-detail' && state.selectedUnit && !state.progress) {
      loadUnitProgress(state.selectedUnit);
    }
  }, [state.screen, state.selectedUnit]);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  switch (state.screen) {
    case 'unit-list':
      return renderUnitList();
    case 'unit-detail':
      return renderUnitDetail();
    case 'learning':
      return renderLearning();
    case 'session-complete':
      return renderSessionComplete();
    default:
      return renderUnitList();
  }
}
