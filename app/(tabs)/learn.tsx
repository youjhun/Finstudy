import { useState, useEffect, useCallback } from 'react';
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
import { usePremiumOnboarding } from '@/lib/premium-onboarding-context';
import { PremiumOnboardingModal } from '@/components/premium-onboarding-modal';

import { subjects, curriculum, unit2Screens, unit2Problems, getSubjectProblems, type Unit, type Subject } from '@/lib/curriculum-data';
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
 * 학습 탭 - 6개 과목 기반 학습 플로우
 * 
 * 화면 구성:
 * 1. 과목 선택 화면 (6개 과목 카드)
 * 2. 유닛 목록 화면 (선택한 과목의 유닛들)
 * 3. 유닛 상세 화면 (진행도, 시작 버튼)
 * 4. 학습 화면 (5개 화면 타입)
 * 5. 세션 완료 화면 (XP, 스트릭, 다음 버튼)
 * 6. 자격증 대비 화면 (프리미엄)
 */

type ScreenState = 'subject-list' | 'unit-list' | 'unit-detail' | 'learning' | 'session-complete' | 'certification';

interface LearningTabState {
  screen: ScreenState;
  selectedSubject?: Subject;
  selectedUnit?: Unit;
  session?: LearningSessionState;
  progress?: UserProgress;
}

export default function LearnScreen() {
  const colors = useColors();
  const { onboardingState, shouldShowCertificationTutorial } = usePremiumOnboarding();
  const [showCertificationTutorial, setShowCertificationTutorial] = useState(shouldShowCertificationTutorial);
  const { isPremium } = usePremium();
  const [state, setState] = useState<LearningTabState>({ screen: 'subject-list' });
  const [loading, setLoading] = useState(false);

  // useEffect는 항상 최상위에서 호출 (Hooks 규칙)
  useEffect(() => {
    if (state.screen === 'certification' && shouldShowCertificationTutorial && !showCertificationTutorial) {
      setShowCertificationTutorial(true);
    }
  }, [state.screen, shouldShowCertificationTutorial]);

  useEffect(() => {
    if (state.screen === 'unit-detail' && state.selectedUnit && !state.progress) {
      loadUnitProgress(state.selectedUnit);
    }
  }, [state.screen, state.selectedUnit]);

  // ============= 화면 1: 과목 선택 =============

  function renderSubjectList() {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* 헤더 */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground mb-2">
              📚 금융 학습
            </Text>
            <Text className="text-sm text-muted">
              6개 과목으로 금융을 완벽히 마스터하세요
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
                backgroundColor: '#7C3AED',
                borderRadius: 16,
                padding: 18,
                marginBottom: 20,
                opacity: pressed ? 0.8 : 1,
                shadowColor: '#7C3AED',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }]}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white mb-1">🎯 NCS/자격증 대비</Text>
                  <Text className="text-xs text-white opacity-80">투자운용기능사 · AFPK · 실전 모의고사</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text className="text-xs text-white font-bold">PRO</Text>
                </View>
              </View>
            </Pressable>
          )}

          {/* 과목 카드 그리드 */}
          <View className="gap-3">
            {subjects.map((subject, index) => (
              <Pressable
                key={subject.id}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setState({ screen: 'unit-list', selectedSubject: subject });
                }}
                style={({ pressed }) => [{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 18,
                  opacity: pressed ? 0.8 : 1,
                }]}
              >
                <View className="flex-row items-center">
                  {/* 과목 아이콘 */}
                  <View style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: subject.color + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}>
                    <Text style={{ fontSize: 26 }}>{subject.icon}</Text>
                  </View>

                  {/* 과목 정보 */}
                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground mb-1">
                      {subject.title}
                    </Text>
                    <Text className="text-xs text-muted" numberOfLines={2}>
                      {subject.description}
                    </Text>
                    <View className="flex-row items-center mt-2 gap-3">
                      <Text className="text-xs text-muted">
                        📖 {subject.units.length}개 유닛
                      </Text>
                      <Text className="text-xs text-muted">
                        ⏱️ {subject.totalEstimatedHours}시간
                      </Text>
                    </View>
                  </View>

                  {/* 화살표 */}
                  <Text style={{ color: colors.muted, fontSize: 18 }}>›</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* 학습 통계 요약 */}
          <View
            className="mt-6 rounded-2xl p-5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text className="text-sm font-bold text-foreground mb-3">
              📊 전체 학습 현황
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold" style={{ color: colors.primary }}>6</Text>
                <Text className="text-xs text-muted mt-1">과목</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold" style={{ color: '#22C55E' }}>36</Text>
                <Text className="text-xs text-muted mt-1">유닛</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold" style={{ color: '#F59E0B' }}>200+</Text>
                <Text className="text-xs text-muted mt-1">문제</Text>
              </View>
            </View>
          </View>

          {/* 학습 팁 */}
          <View
            className="mt-4 rounded-2xl p-5"
            style={{ backgroundColor: colors.primary + '08', borderColor: colors.primary + '20', borderWidth: 1 }}
          >
            <Text className="text-sm font-semibold text-foreground mb-2">
              💡 학습 가이드
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              거시경제 → 금융상품 → 투자이론 순서로 학습하면 효과적입니다. 각 과목은 독립적으로 학습할 수 있지만, 순서대로 진행하면 개념 간 연결이 자연스럽습니다.
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ============= 화면 2: 유닛 목록 (과목 내) =============

  function renderUnitList() {
    const subject = state.selectedSubject;
    if (!subject) return renderSubjectList();

    return (
      <ScreenContainer className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* 뒤로가기 + 과목 헤더 */}
          <View className="mb-6">
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setState({ screen: 'subject-list' });
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginBottom: 12 }]}
            >
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                ← 과목 목록
              </Text>
            </Pressable>

            <View className="flex-row items-center mb-2">
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: subject.color + '15',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Text style={{ fontSize: 22 }}>{subject.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground">
                  {subject.title}
                </Text>
                <Text className="text-xs text-muted mt-1">
                  {subject.units.length}개 유닛 · 약 {subject.totalEstimatedHours}시간
                </Text>
              </View>
            </View>
            <Text className="text-sm text-muted mt-2">
              {subject.description}
            </Text>
          </View>

          {/* 진행도 바 */}
          <View className="mb-5 rounded-xl p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-semibold text-foreground">학습 진행도</Text>
              <Text className="text-xs text-muted">0/{subject.units.length} 완료</Text>
            </View>
            <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
              <View style={{ height: 6, backgroundColor: subject.color, borderRadius: 3, width: '0%' }} />
            </View>
          </View>

          {/* 유닛 목록 */}
          <View className="gap-3">
            {subject.units.map((unit, index) => {
              const isLocked = index > 0; // 첫 번째 유닛만 잠금 해제 (추후 진행도 기반으로 변경)
              const isFirst = index === 0;

              return (
                <Pressable
                  key={unit.id}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setState({ ...state, screen: 'unit-detail', selectedUnit: unit });
                  }}
                  style={({ pressed }) => [{
                    backgroundColor: colors.surface,
                    borderColor: isFirst ? subject.color + '40' : colors.border,
                    borderWidth: isFirst ? 2 : 1,
                    borderRadius: 14,
                    padding: 16,
                    opacity: pressed ? 0.8 : 1,
                  }]}
                >
                  <View className="flex-row items-center">
                    {/* 유닛 번호 */}
                    <View style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: isFirst ? subject.color : colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ color: isFirst ? '#fff' : colors.muted, fontSize: 14, fontWeight: '700' }}>
                        {index + 1}
                      </Text>
                    </View>

                    {/* 유닛 정보 */}
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-foreground mb-1">
                        {unit.title}
                      </Text>
                      <Text className="text-xs text-muted" numberOfLines={1}>
                        {unit.description}
                      </Text>
                      <View className="flex-row items-center mt-2 gap-2">
                        <Text className="text-xs text-muted">⏱️ {unit.estimatedTime}분</Text>
                        {unit.badges && unit.badges.length > 0 && (
                          <Text className="text-xs text-muted">🏅 {unit.badges[0].name}</Text>
                        )}
                      </View>
                    </View>

                    {/* 상태 아이콘 */}
                    {isFirst ? (
                      <View style={{ backgroundColor: subject.color + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ color: subject.color, fontSize: 11, fontWeight: '700' }}>시작</Text>
                      </View>
                    ) : (
                      <Text style={{ color: colors.muted, fontSize: 16 }}>›</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ============= 화면 3: 유닛 상세 =============

  async function loadUnitProgress(unit: Unit) {
    setLoading(true);
    try {
      const progress = await LearningSessionManager.loadProgress(unit.id);
      setState(prev => ({ ...prev, progress }));
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  }

  function renderUnitDetail() {
    const unit = state.selectedUnit;
    if (!unit) return renderSubjectList();

    const subject = subjects.find(s => s.id === unit.subjectId) || subjects[0];

    return (
      <ScreenContainer className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* 뒤로가기 */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setState({ screen: 'unit-list', selectedSubject: subject });
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginBottom: 16 }]}
          >
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
              ← {subject.title}
            </Text>
          </Pressable>

          {/* 유닛 헤더 */}
          <View className="items-center mb-6">
            <View style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: subject.color + '15',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 32 }}>{subject.icon}</Text>
            </View>
            <Text className="text-xl font-bold text-foreground text-center mb-2">
              {unit.title}
            </Text>
            <Text className="text-sm text-muted text-center">
              {unit.description}
            </Text>
          </View>

          {/* 유닛 정보 카드 */}
          <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-lg font-bold text-foreground">⏱️</Text>
                <Text className="text-xs text-muted mt-1">{unit.estimatedTime}분</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-lg font-bold text-foreground">📝</Text>
                <Text className="text-xs text-muted mt-1">퀴즈 포함</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-lg font-bold text-foreground">🏅</Text>
                <Text className="text-xs text-muted mt-1">배지 획득</Text>
              </View>
            </View>
          </View>

          {/* 학습 시작 버튼 */}
          <Pressable
            onPress={async () => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              setLoading(true);
              try {
                if (!state.progress) {
                  const progress = await LearningSessionManager.loadProgress(unit.id);
                  setState(prev => ({ ...prev, progress }));
                }
                const currentProgress = state.progress || await LearningSessionManager.loadProgress(unit.id);
                const problems = getSubjectProblems(unit.subjectId || subjects[0].id);
                const unitProblems = problems.filter(p => p.unitId === unit.id);
                const sessionProblems = LearningSessionManager.buildSessionProblems(
                  unitProblems,
                  currentProgress,
                  5
                );
                const session = LearningSessionManager.createSession(unit.id, sessionProblems);
                setState(prev => ({ ...prev, screen: 'learning', session, progress: currentProgress }));
              } catch (error) {
                console.error('Failed to start session:', error);
              } finally {
                setLoading(false);
              }
            }}
            style={({ pressed }) => [{
              backgroundColor: subject.color,
              borderRadius: 14,
              paddingVertical: 18,
              marginTop: 8,
              opacity: pressed ? 0.9 : 1,
              shadowColor: subject.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }]}
          >
            <Text className="text-white text-center font-bold text-lg">
              학습 시작하기 →
            </Text>
          </Pressable>

          {/* 이전 진행도 */}
          {state.progress && state.progress.completedProblems.length > 0 && (
            <View className="mt-4 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
              <Text className="text-xs font-semibold text-foreground mb-2">이전 학습 기록</Text>
              <Text className="text-xs text-muted">
                완료한 문제: {state.progress.completedProblems.length}개 | XP: {state.progress.totalXP}
              </Text>
            </View>
          )}
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ============= 화면 4: 학습 진행 =============

  function renderLearning() {
    if (!state.session || !state.selectedUnit || !state.progress) return renderSubjectList();

    const session = state.session;
    const currentSessionProblem = session.problems[session.currentProblemIndex];
    if (!currentSessionProblem) {
      return renderSessionComplete();
    }

    const screen = unit2Screens[session.currentProblemIndex] || {
      id: `screen-${session.currentProblemIndex}`,
      unitId: state.selectedUnit.id,
      type: 'quiz' as const,
      order: session.currentProblemIndex,
      title: currentSessionProblem.problem.question,
      content: {
        mainText: currentSessionProblem.problem.question,
      },
      learningTheory: 'retrieval-practice',
    };
    const problem = currentSessionProblem.problem;

    return (
      <ScreenContainer className="flex-1 bg-background">
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
      </ScreenContainer>
    );
  }

  // ============= 화면 5: 세션 완료 =============

  function renderSessionComplete() {
    const subject = subjects.find(s => s.id === state.selectedUnit?.subjectId) || subjects[0];

    return (
      <ScreenContainer className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="p-6">
          {/* 완료 아이콘 */}
          <View className="items-center mb-6">
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#22C55E15',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 40 }}>🎉</Text>
            </View>
          </View>

          {/* 완료 메시지 */}
          <Text className="text-2xl font-bold text-foreground text-center mb-2">
            학습 완료!
          </Text>
          <Text className="text-sm text-muted text-center mb-8">
            {state.selectedUnit?.title} 유닛을 완료했습니다
          </Text>

          {/* 성과 카드 */}
          <View className="rounded-2xl p-5 mb-6" style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold" style={{ color: '#F59E0B' }}>+50</Text>
                <Text className="text-xs text-muted mt-1">XP 획득</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold" style={{ color: '#EF4444' }}>🔥</Text>
                <Text className="text-xs text-muted mt-1">스트릭 유지</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold" style={{ color: '#22C55E' }}>✓</Text>
                <Text className="text-xs text-muted mt-1">유닛 완료</Text>
              </View>
            </View>
          </View>

          {/* 다음 유닛 버튼 */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              setState({ screen: 'unit-list', selectedSubject: subject });
            }}
            style={({ pressed }) => [{
              backgroundColor: subject.color,
              borderRadius: 14,
              paddingVertical: 18,
              opacity: pressed ? 0.9 : 1,
            }]}
          >
            <Text className="text-white text-center font-bold text-lg">
              다음 유닛으로 →
            </Text>
          </Pressable>

          {/* 과목 목록으로 */}
          <Pressable
            onPress={() => {
              setState({ screen: 'subject-list' });
            }}
            style={({ pressed }) => [{
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 14,
              paddingVertical: 16,
              marginTop: 12,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Text className="text-foreground text-center font-semibold">
              과목 목록으로 돌아가기
            </Text>
          </Pressable>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ============= 메인 렌더러 =============

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  switch (state.screen) {
    case 'subject-list':
      return renderSubjectList();
    case 'unit-list':
      return renderUnitList();
    case 'unit-detail':
      return renderUnitDetail();
    case 'learning':
      return renderLearning();
    case 'session-complete':
      return renderSessionComplete();
    case 'certification':
      return (
        <>
          <ScreenContainer className="flex-1 bg-background">
            <View className="p-4">
              <Pressable
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setState({ screen: 'subject-list' });
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginBottom: 8 }]}
              >
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                  ← 과목 목록
                </Text>
              </Pressable>
            </View>
            <CertificationStudyTab isPremium={isPremium} />
          </ScreenContainer>
          {onboardingState && (
            <PremiumOnboardingModal
              tutorial={onboardingState.certificationTutorial}
              visible={showCertificationTutorial}
              onClose={() => setShowCertificationTutorial(false)}
              onNavigate={(screen) => {
                if (screen === 'certification') {
                  setState({ screen: 'certification' });
                }
              }}
            />
          )}
        </>
      );
    default:
      return renderSubjectList();
  }
}
