/**
 * 약점 포인트 우선 순위 학습 카드 컴포넌트
 * 
 * 학습 탭 상단에 표시되어 사용자의 약점을 시각적으로 보여주고
 * 약점 기반 학습 세션을 시작할 수 있게 합니다.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import {
  analyzeWeaknesses,
  getCachedAnalysis,
  type WeaknessAnalysis,
  type WeaknessPoint,
} from '@/lib/weakness-priority-system';

interface WeaknessPriorityCardProps {
  onStartWeaknessSession: (subjectId: string, concept: string) => void;
  compact?: boolean;
}

export function WeaknessPriorityCard({ onStartWeaknessSession, compact = false }: WeaknessPriorityCardProps) {
  const colors = useColors();
  const [analysis, setAnalysis] = useState<WeaknessAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      // 캐시 먼저 확인
      const cached = await getCachedAnalysis();
      if (cached) {
        setAnalysis(cached);
        setLoading(false);
        return;
      }
      // 새로 분석
      const result = await analyzeWeaknesses();
      setAnalysis(result);
    } catch (error) {
      console.error('약점 분석 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="bg-surface rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.surface }}>
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text className="text-sm text-muted">학습 데이터 분석 중...</Text>
        </View>
      </View>
    );
  }

  if (!analysis || analysis.weaknesses.length === 0) {
    return null;
  }

  const topWeakness = analysis.weaknesses[0];
  const displayWeaknesses = expanded ? analysis.weaknesses : analysis.weaknesses.slice(0, 3);

  if (compact) {
    return (
      <Pressable
        onPress={() => onStartWeaknessSession(topWeakness.subjectId, topWeakness.concept)}
        style={({ pressed }) => [{
          backgroundColor: '#FFF3E0',
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor: '#FF9800',
          opacity: pressed ? 0.8 : 1,
        }]}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#E65100' }}>
              🎯 약점 집중 학습 추천
            </Text>
            <Text style={{ fontSize: 12, color: '#BF360C', marginTop: 2 }}>
              {topWeakness.subjectName} &gt; {topWeakness.concept} (오답률 {Math.round(topWeakness.errorRate * 100)}%)
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: '#E65100', fontWeight: '500' }}>시작 →</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View className="mb-4">
      {/* 헤더 */}
      <View
        style={{
          backgroundColor: '#FFF8E1',
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: '#FFE082',
        }}
      >
        {/* 타이틀 */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <Text style={{ fontSize: 18 }}>🎯</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#E65100' }}>
              약점 집중 공략
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#FF9800',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '600' }}>
              {analysis.weaknesses.length}개 발견
            </Text>
          </View>
        </View>

        {/* 전체 점수 */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text style={{ fontSize: 12, color: '#666' }}>전체 정답률</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: getScoreColor(analysis.overallScore) }}>
              {analysis.overallScore}%
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: '#999' }}>총 {analysis.totalProblems}문제 풀이</Text>
            <Text style={{ fontSize: 11, color: '#999' }}>정답 {analysis.totalCorrect}개</Text>
          </View>
        </View>

        {/* 약점 리스트 */}
        {displayWeaknesses.map((weakness, index) => (
          <WeaknessItem
            key={weakness.id}
            weakness={weakness}
            rank={index + 1}
            onPress={() => onStartWeaknessSession(weakness.subjectId, weakness.concept)}
          />
        ))}

        {/* 더보기/접기 */}
        {analysis.weaknesses.length > 3 && (
          <Pressable
            onPress={() => setExpanded(!expanded)}
            style={{ alignItems: 'center', marginTop: 8 }}
          >
            <Text style={{ fontSize: 13, color: '#FF9800', fontWeight: '600' }}>
              {expanded ? '접기 ▲' : `${analysis.weaknesses.length - 3}개 더 보기 ▼`}
            </Text>
          </Pressable>
        )}

        {/* 추천 세션 시작 버튼 */}
        <Pressable
          onPress={() => onStartWeaknessSession(topWeakness.subjectId, topWeakness.concept)}
          style={({ pressed }) => [{
            backgroundColor: '#FF9800',
            borderRadius: 12,
            paddingVertical: 14,
            marginTop: 12,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }]}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15 }}>
            🚀 약점 집중 학습 시작 ({analysis.recommendedSession.estimatedTime}분)
          </Text>
        </Pressable>

        {/* 강점 요약 */}
        {analysis.strengths.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>💪 강점 영역</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {analysis.strengths.slice(0, 4).map((s, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: '#E8F5E9',
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: '#2E7D32', fontWeight: '500' }}>
                      {s.concept} ({Math.round(s.correctRate * 100)}%)
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

// ============= 약점 아이템 =============
function WeaknessItem({ weakness, rank, onPress }: { weakness: WeaknessPoint; rank: number; onPress: () => void }) {
  const trendIcon = weakness.trend === 'improving' ? '📈' : weakness.trend === 'declining' ? '📉' : '➡️';
  const trendColor = weakness.trend === 'improving' ? '#4CAF50' : weakness.trend === 'declining' ? '#F44336' : '#9E9E9E';
  const priorityColor = weakness.priority >= 70 ? '#D32F2F' : weakness.priority >= 50 ? '#FF9800' : '#FFC107';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: pressed ? 0.8 : 1,
        borderLeftWidth: 3,
        borderLeftColor: priorityColor,
      }]}
    >
      {/* 순위 */}
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: priorityColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
      >
        <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>{rank}</Text>
      </View>

      {/* 정보 */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>
            {weakness.concept}
          </Text>
          <Text style={{ fontSize: 11, color: trendColor }}>{trendIcon}</Text>
        </View>
        <Text style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
          {weakness.subjectName} · 오답 {weakness.incorrectCount}/{weakness.totalAttempts}회
        </Text>
      </View>

      {/* 오답률 */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: priorityColor }}>
          {Math.round(weakness.errorRate * 100)}%
        </Text>
        <Text style={{ fontSize: 10, color: '#aaa' }}>오답률</Text>
      </View>
    </Pressable>
  );
}

// ============= 유틸리티 =============
function getScoreColor(score: number): string {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FF9800';
  return '#F44336';
}
