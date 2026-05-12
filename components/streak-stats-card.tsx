import React from 'react';
import { View, Text } from 'react-native';
import { calculateStreakStats, type StreakData } from '@/lib/streak-system';
import { useColors } from '@/hooks/use-colors';

interface StreakStatsCardProps {
  streakData: StreakData;
}

export function StreakStatsCard({ streakData }: StreakStatsCardProps) {
  const colors = useColors();
  const stats = calculateStreakStats(streakData);

  return (
    <View className="bg-surface rounded-2xl p-6 gap-6">
      {/* 메인 스트릭 표시 */}
      <View className="items-center gap-3">
        <Text className="text-5xl">🔥</Text>
        <View className="items-center gap-1">
          <Text className="text-4xl font-bold text-primary">
            {stats.currentStreak}
          </Text>
          <Text className="text-sm text-muted">일 연속 학습 중</Text>
        </View>
      </View>

      {/* 통계 그리드 */}
      <View className="gap-4">
        {/* 첫 번째 행 */}
        <View className="flex-row gap-3">
          <StatBox
            icon="🏆"
            label="최고 기록"
            value={stats.maxStreak}
            unit="일"
            colors={colors}
          />
          <StatBox
            icon="📊"
            label="총 학습일"
            value={stats.totalDays}
            unit="일"
            colors={colors}
          />
        </View>

        {/* 두 번째 행 */}
        <View className="flex-row gap-3">
          <StatBox
            icon="📅"
            label="이번 달"
            value={stats.thisMonth}
            unit="일"
            colors={colors}
          />
          <StatBox
            icon="📆"
            label="이번 주"
            value={stats.thisWeek}
            unit="일"
            colors={colors}
          />
        </View>
      </View>

      {/* 격려 메시지 */}
      <View
        className="rounded-xl p-4 items-center"
        style={{ backgroundColor: colors.primary + '15' }}
      >
        <Text className="text-sm font-semibold text-primary text-center">
          {getEncouragingMessage(stats.currentStreak)}
        </Text>
      </View>
    </View>
  );
}

interface StatBoxProps {
  icon: string;
  label: string;
  value: number;
  unit: string;
  colors: any;
}

function StatBox({ icon, label, value, unit, colors }: StatBoxProps) {
  return (
    <View
      className="flex-1 rounded-xl p-4 items-center gap-2"
      style={{ backgroundColor: colors.border }}
    >
      <Text className="text-2xl">{icon}</Text>
      <Text className="text-xs text-muted">{label}</Text>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-2xl font-bold text-foreground">{value}</Text>
        <Text className="text-xs text-muted">{unit}</Text>
      </View>
    </View>
  );
}

/**
 * 스트릭 수에 따른 격려 메시지
 */
function getEncouragingMessage(streak: number): string {
  if (streak === 0) {
    return '🎯 오늘부터 시작해보세요! 첫 번째 불꽃을 켜보세요.';
  } else if (streak < 7) {
    return `🌱 좋은 시작입니다! ${7 - streak}일만 더 하면 1주일 달성!`;
  } else if (streak < 30) {
    return `💪 멋진 진행 중입니다! ${30 - streak}일만 더 하면 1개월 달성!`;
  } else if (streak < 100) {
    return `🚀 대단합니다! 계속 이 기세를 유지해보세요!`;
  } else {
    return `👑 정말 대단합니다! ${streak}일 연속 학습은 정말 놀라운 성과입니다!`;
  }
}
