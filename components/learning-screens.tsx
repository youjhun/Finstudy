import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import type { Screen, ScreenContent, Problem } from '@/lib/curriculum-data';
import {
  DemandSupplyCurveGraph,
  ElasticityComparisonGraph,
  GDPTrendGraph,
  InterestRateTrendGraph,
  ExchangeRateTrendGraph,
  InflationComparisonGraph,
} from '@/components/graphs/economic-graphs';

const { width } = Dimensions.get('window');

/**
 * 학습 화면 컴포넌트
 * 
 * Gagné 9가지 사태 구현:
 * 1. 주의 환기 (Intro 화면)
 * 2. 학습 목표 제시 (모든 화면)
 * 3. 선행 지식 활성화 (Concept 화면)
 * 4. 자극 제시 (텍스트 + 그래프)
 * 5. 학습 지도 (힌트 제공)
 * 6. 반응 유도 (퀴즈)
 * 7. 피드백 (오답 설명)
 * 8. 학습 평가 (점수)
 * 9. 보유와 전이 (Outro 화면)
 */

// ============= 화면 1: 오프닝 (Gagné 주의 환기) =============

interface IntroScreenProps {
  screen: Screen;
  onAnswer: (answer: number) => void;
  onNext: () => void;
}

export function IntroScreen({ screen, onAnswer, onNext }: IntroScreenProps) {
  const colors = useColors();
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const content = screen.content;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingTop: 24 }}
    >
      {/* 헤더 */}
      <View className="mb-8">
        <Text className="text-2xl font-bold text-foreground mb-2">
          {content.mainText}
        </Text>
        <Text className="text-sm text-muted">
          {content.subText}
        </Text>
      </View>

      {/* 오프닝 질문 */}
      <View
        className="bg-blue-50 rounded-lg p-4 mb-6"
        style={{ backgroundColor: colors.surface }}
      >
        <Text className="text-lg font-semibold text-foreground mb-3">
          🎯 {content.realWorldQuestion}
        </Text>
        <Text className="text-sm text-muted leading-relaxed">
          {content.coreStatement}
        </Text>
      </View>

      {/* 생각해보기 */}
      <Text className="text-base font-semibold text-foreground mb-4">
        ❓ 생각해보기:
      </Text>

      {/* 선택지 */}
      <View className="gap-3 mb-6">
        {content.choices?.map((choice, index) => (
          <Pressable
            key={index}
            onPress={() => setSelectedChoice(index)}
            style={({ pressed }) => [
              {
                backgroundColor:
                  selectedChoice === index
                    ? colors.primary
                    : colors.surface,
                borderColor:
                  selectedChoice === index ? colors.primary : colors.border,
                borderWidth: 2,
                borderRadius: 8,
                padding: 12,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              className={cn(
                'text-base font-medium',
                selectedChoice === index
                  ? 'text-white'
                  : 'text-foreground'
              )}
            >
              {String.fromCharCode(65 + index)}) {choice}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 힌트 */}
      <Pressable
        onPress={() => setShowHint(!showHint)}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
            paddingVertical: 8,
          },
        ]}
      >
        <Text className="text-sm text-primary font-medium">
          💡 {showHint ? '힌트 숨기기' : '힌트 보기'}
        </Text>
      </Pressable>

      {showHint && content.hint && (
        <View
          className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200"
          style={{ backgroundColor: colors.surface }}
        >
          <Text className="text-sm text-foreground">
            💡 {content.hint}
          </Text>
        </View>
      )}

      {/* 다음 버튼 */}
      <Pressable
        onPress={onNext}
        style={({ pressed }) => [
          {
            backgroundColor: colors.primary,
            borderRadius: 8,
            paddingVertical: 12,
            marginTop: 16,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text className="text-white text-center font-semibold">
          다음으로 →
        </Text>
      </Pressable>

      {/* 진행도 */}
      <View className="mt-6">
        <Text className="text-xs text-muted mb-2">학습 진행도</Text>
        <View
          style={{
            height: 6,
            backgroundColor: colors.border,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: '10%',
              backgroundColor: colors.primary,
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

// ============= 화면 2: 개념 설명 (Mayer CTML) =============

interface ConceptScreenProps {
  screen: Screen;
  onNext: () => void;
}

export function ConceptScreen({ screen, onNext }: ConceptScreenProps) {
  const colors = useColors();
  const content = screen.content;
  const [showHint, setShowHint] = useState(false);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingTop: 24 }}
    >
      {/* 헤더 */}
      <Text className="text-2xl font-bold text-foreground mb-6">
        {content.mainText}
      </Text>

      {/* 정의 */}
      <View
        className="bg-blue-50 rounded-lg p-4 mb-6"
        style={{ backgroundColor: colors.surface }}
      >
        <Text className="text-sm font-semibold text-foreground mb-2">
          정의:
        </Text>
        <Text className="text-sm text-foreground leading-relaxed">
          {content.definition}
        </Text>
      </View>

      {/* 특징 */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-foreground mb-3">
          특징:
        </Text>
        {content.characteristics?.map((char, index) => (
          <View key={index} className="flex-row gap-3 mb-2">
            <Text className="text-foreground font-bold">•</Text>
            <Text className="flex-1 text-sm text-foreground leading-relaxed">
              {char}
            </Text>
          </View>
        ))}
      </View>

      {/* 그래프 설명 */}
      <View
        className="bg-gray-100 rounded-lg p-4 mb-6 h-48"
        style={{ backgroundColor: colors.surface }}
      >
        <Text className="text-sm text-muted text-center">
          📊 {content.graphDescription}
        </Text>
        <Text className="text-xs text-muted text-center mt-2">
          (애니메이션 그래프)
        </Text>
      </View>

      {/* 예시 */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-foreground mb-3">
          💡 예시:
        </Text>
        {content.examples?.map((example, index) => (
          <View
            key={index}
            className="bg-yellow-50 rounded-lg p-3 mb-2"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-sm font-medium text-foreground">
              {example.scenario}
            </Text>
            <Text className="text-xs text-muted mt-1">
              {example.explanation}
            </Text>
            {example.numericalExample && (
              <Text className="text-xs text-primary font-semibold mt-1">
                {example.numericalExample}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* 다음 버튼 */}
      <Pressable
        onPress={onNext}
        style={({ pressed }) => [
          {
            backgroundColor: colors.primary,
            borderRadius: 8,
            paddingVertical: 12,
            marginTop: 16,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text className="text-white text-center font-semibold">
          다음으로 →
        </Text>
      </Pressable>

      {/* 진행도 */}
      <View className="mt-6">
        <Text className="text-xs text-muted mb-2">학습 진행도</Text>
        <View
          style={{
            height: 6,
            backgroundColor: colors.border,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: '20%',
              backgroundColor: colors.primary,
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

// ============= 화면 3: 퀴즈 (Testing Effect) =============

interface QuizScreenProps {
  screen: Screen;
  problem: Problem;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

function renderGraphForProblem(problem: Problem) {
  const graphWidth = Dimensions.get('window').width - 48;
  const graphHeight = 280;
  
  let graphType: string | null = null;
  
  if (problem.question.includes('수요') || problem.question.includes('공급')) {
    graphType = 'demand-supply';
  } else if (problem.question.includes('탄력')) {
    graphType = 'elasticity';
  } else if (problem.question.includes('GDP') || problem.question.includes('성장률')) {
    graphType = 'gdp';
  } else if (problem.question.includes('금리') || problem.question.includes('기준금리')) {
    graphType = 'interest';
  } else if (problem.question.includes('환율') || problem.question.includes('원화')) {
    graphType = 'exchange';
  } else if (problem.question.includes('물가') || problem.question.includes('인플레이션')) {
    graphType = 'inflation';
  }
  
  if (!graphType) return null;
  
  return (
    <View className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
      <Text className="text-sm font-semibold text-foreground mb-3">📊 관련 그래프</Text>
      {graphType === 'demand-supply' && <DemandSupplyCurveGraph width={graphWidth} height={graphHeight} animated={true} />}
      {graphType === 'elasticity' && <ElasticityComparisonGraph width={graphWidth} height={graphHeight} animated={true} />}
      {graphType === 'gdp' && <GDPTrendGraph width={graphWidth} height={graphHeight} animated={true} />}
      {graphType === 'interest' && <InterestRateTrendGraph width={graphWidth} height={graphHeight} animated={true} />}
      {graphType === 'exchange' && <ExchangeRateTrendGraph width={graphWidth} height={graphHeight} animated={true} />}
      {graphType === 'inflation' && <InflationComparisonGraph width={graphWidth} height={graphHeight} animated={true} />}
    </View>
  );
}

export function QuizScreen({
  screen,
  problem,
  onAnswer,
  onNext,
}: QuizScreenProps) {
  const colors = useColors();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  // 문제가 바뀔 때 상태 초기화
  useEffect(() => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setShowHint(false);
  }, [problem.id]);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      const isCorrect =
        problem.options?.[selectedAnswer]?.isCorrect ?? false;
      setSubmitted(true);
      onAnswer(isCorrect);
    }
  };

  const selectedOption = selectedAnswer !== null
    ? problem.options?.[selectedAnswer]
    : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingTop: 24 }}
    >
      {/* 헤더 */}
      <Text className="text-lg font-bold text-foreground mb-6">
        ❓ {screen.content.mainText}
      </Text>

      {/* 문제 */}
      <View
        className="bg-blue-50 rounded-lg p-4 mb-6"
        style={{ backgroundColor: colors.surface }}
      >
        <Text className="text-base font-semibold text-foreground">
          {problem.question}
        </Text>
      </View>

      {/* 그래프 */}
      {renderGraphForProblem(problem)}

      {/* 선택지 */}
      <View className="gap-3 mb-6">
        {problem.options?.map((option, index) => (
          <Pressable
            key={index}
            onPress={() => !submitted && setSelectedAnswer(index)}
            disabled={submitted}
            style={({ pressed }) => [
              {
                backgroundColor:
                  selectedAnswer === index
                    ? colors.primary
                    : colors.surface,
                borderColor:
                  selectedAnswer === index ? colors.primary : colors.border,
                borderWidth: 2,
                borderRadius: 8,
                padding: 12,
                opacity: submitted ? 0.7 : pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              className={cn(
                'text-base font-medium',
                selectedAnswer === index
                  ? 'text-white'
                  : 'text-foreground'
              )}
            >
              {String.fromCharCode(65 + index)}) {option.text}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 피드백 */}
      {submitted && selectedOption && (
        <View
          className={cn(
            'rounded-lg p-4 mb-6',
            selectedOption.isCorrect
              ? 'bg-green-50'
              : 'bg-red-50'
          )}
          style={{
            backgroundColor: selectedOption.isCorrect
              ? '#f0fdf4'
              : '#fef2f2',
          }}
        >
          <Text
            className={cn(
              'text-base font-semibold mb-2',
              selectedOption.isCorrect
                ? 'text-green-700'
                : 'text-red-700'
            )}
          >
            {selectedOption.isCorrect ? '✅ 정답입니다!' : '❌ 틀렸습니다.'}
          </Text>
          <Text className="text-sm text-foreground leading-relaxed">
            {selectedOption.feedback || problem.explanation}
          </Text>
        </View>
      )}

      {/* 힌트 */}
      {!submitted && (
        <Pressable
          onPress={() => setShowHint(!showHint)}
          style={{ marginBottom: 16 }}
        >
          <Text className="text-sm text-primary font-medium">
            💡 힌트 보기
          </Text>
        </Pressable>
      )}

      {showHint && (
        <View
          className="bg-yellow-50 rounded-lg p-3 mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <Text className="text-sm text-foreground">
            {problem.hint}
          </Text>
        </View>
      )}

      {/* 제출/다음 버튼 */}
      <Pressable
        onPress={submitted ? onNext : handleSubmit}
        style={({ pressed }) => [
          {
            backgroundColor: colors.primary,
            borderRadius: 8,
            paddingVertical: 12,
            marginTop: 16,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text className="text-white text-center font-semibold">
          {submitted ? '다음으로 →' : '제출하기'}
        </Text>
      </Pressable>

      {/* 진행도 */}
      <View className="mt-6">
        <Text className="text-xs text-muted mb-2">학습 진행도</Text>
        <View
          style={{
            height: 6,
            backgroundColor: colors.border,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: '30%',
              backgroundColor: colors.primary,
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

// ============= 화면 5: 전이 (Gagné 전이) =============

interface OutroScreenProps {
  screen: Screen;
  onComplete: (xp: number) => void;
}

export function OutroScreen({ screen, onComplete }: OutroScreenProps) {
  const colors = useColors();
  const content = screen.content;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingTop: 24 }}
    >
      {/* 헤더 */}
      <Text className="text-2xl font-bold text-foreground mb-6">
        {content.mainText}
      </Text>

      {/* 전이 질문 */}
      <View
        className="bg-blue-50 rounded-lg p-4 mb-6"
        style={{ backgroundColor: colors.surface }}
      >
        <Text className="text-base font-semibold text-foreground mb-2">
          {content.transferQuestion}
        </Text>
      </View>

      {/* 생각해보기 */}
      <Text className="text-base font-semibold text-foreground mb-3">
        💭 생각해보기:
      </Text>
      {content.reflectionPoints?.map((point, index) => (
        <View key={index} className="flex-row gap-3 mb-3">
          <Text className="text-foreground font-bold">•</Text>
          <Text className="flex-1 text-sm text-foreground leading-relaxed">
            {point}
          </Text>
        </View>
      ))}

      {/* 완료 메시지 */}
      <View
        className="bg-green-50 rounded-lg p-4 mt-8 mb-6"
        style={{ backgroundColor: '#f0fdf4' }}
      >
        <Text className="text-lg font-bold text-green-700 mb-2">
          ✅ 완료!
        </Text>
        <Text className="text-base font-semibold text-green-700 mb-1">
          +35 XP 획득
        </Text>
        <Text className="text-sm text-green-600">
          연속 학습: 3일째 🔥🔥🔥
        </Text>
      </View>

      {/* 다음 유닛 버튼 */}
      <Pressable
        onPress={() => onComplete(35)}
        style={({ pressed }) => [
          {
            backgroundColor: colors.primary,
            borderRadius: 8,
            paddingVertical: 12,
            marginTop: 16,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text className="text-white text-center font-semibold">
          다음 유닛으로 →
        </Text>
      </Pressable>

      {/* 진행도 */}
      <View className="mt-6">
        <Text className="text-xs text-muted mb-2">학습 진행도</Text>
        <View
          style={{
            height: 6,
            backgroundColor: colors.border,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: '100%',
              backgroundColor: colors.primary,
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

// ============= 화면 렌더러 =============

interface LearningScreenRendererProps {
  screen: Screen;
  problem?: Problem;
  onAnswer?: (result: number | boolean) => void;
  onNext: () => void;
  onComplete?: (xp: number) => void;
}

export function LearningScreenRenderer({
  screen,
  problem,
  onAnswer,
  onNext,
  onComplete,
}: LearningScreenRendererProps) {
  switch (screen.type) {
    case 'intro':
      return (
        <IntroScreen
          screen={screen}
          onAnswer={(answer: number) => onAnswer?.(answer === 0)}
          onNext={onNext}
        />
      );
    case 'concept':
    case 'concept2':
      return <ConceptScreen screen={screen} onNext={onNext} />;
    case 'quiz':
      return problem ? (
        <QuizScreen
          screen={screen}
          problem={problem}
          onAnswer={(isCorrect: boolean) => onAnswer?.(isCorrect ? 1 : 0)}
          onNext={onNext}
        />
      ) : null;
    case 'outro':
      return (
        <OutroScreen
          screen={screen}
          onComplete={onComplete || (() => {})}
        />
      );
    default:
      return null;
  }
}
