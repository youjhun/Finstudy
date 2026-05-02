/**
 * 나무 성장 시각화 컴포넌트 (계절/날씨 강화 버전)
 * 
 * 프로필 탭에서 사용자의 나무 성장 상태를 시각적으로 표현합니다.
 * 계절과 날씨 변화를 포함하여 더 생동감 있게 표현합니다.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import {
  getTreeGrowthData,
  getStageInfo,
  getGrowthProgress,
  getMinutesToNextStage,
  type TreeGrowthData,
  type TreeStage,
} from '@/lib/tree-growth-system';
import {
  getSeasonalTheme,
  getSeasonChangeMessage,
  getSeasonProgress,
} from '@/lib/tree-seasonal-system';
import { TreeWeatherAnimation } from './tree-weather-animation';

interface TreeGrowthDisplayEnhancedProps {
  onRefresh?: () => void;
}

export function TreeGrowthDisplayEnhanced({ onRefresh }: TreeGrowthDisplayEnhancedProps) {
  const colors = useColors();
  const [treeData, setTreeData] = useState<TreeGrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousStage, setPreviousStage] = useState<TreeStage | null>(null);

  useEffect(() => {
    loadTreeData();
  }, []);

  const loadTreeData = async () => {
    setLoading(true);
    try {
      const data = await getTreeGrowthData();
      if (data && previousStage && previousStage !== data.stage) {
        // 단계가 변경되었을 때
        setPreviousStage(data.stage);
      } else if (data) {
        setPreviousStage(data.stage);
      }
      setTreeData(data);
    } catch (error) {
      console.error('나무 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="bg-surface rounded-2xl p-6 mb-4" style={{ backgroundColor: colors.surface }}>
        <View className="items-center gap-2">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm text-muted">나무 성장 데이터 로드 중...</Text>
        </View>
      </View>
    );
  }

  if (!treeData) {
    return null;
  }

  const stageInfo = getStageInfo(treeData.stage);
  const seasonalTheme = getSeasonalTheme(treeData.stage);
  const progress = getGrowthProgress(treeData.totalStudyMinutes);
  const minutesToNext = getMinutesToNextStage(treeData.totalStudyMinutes);
  const seasonProgress = getSeasonProgress(treeData.stage);

  return (
    <View className="mb-6">
      {/* 계절 진행도 바 */}
      <View
        style={{
          backgroundColor: '#F5F5F5',
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#E0E0E0',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#666' }}>
            🌍 계절 진행도
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: seasonalTheme.accentColor }}>
            {Math.round(seasonProgress)}%
          </Text>
        </View>
        <View
          style={{
            width: '100%',
            height: 6,
            backgroundColor: '#E0E0E0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${seasonProgress}%`,
              height: '100%',
              backgroundColor: seasonalTheme.accentColor,
              borderRadius: 3,
            }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: 10, color: '#999' }}>🌸 봄</Text>
          <Text style={{ fontSize: 10, color: '#999' }}>🌱 초여름</Text>
          <Text style={{ fontSize: 10, color: '#999' }}>🌿 여름</Text>
          <Text style={{ fontSize: 10, color: '#999' }}>🍂 가을</Text>
          <Text style={{ fontSize: 10, color: '#999' }}>❄️ 겨울</Text>
        </View>
      </View>

      {/* 메인 나무 카드 */}
      <View
        style={{
          backgroundColor: seasonalTheme.bgGradientStart,
          borderRadius: 20,
          padding: 24,
          alignItems: 'center',
          borderWidth: 2,
          borderColor: seasonalTheme.accentColor,
          marginBottom: 16,
          overflow: 'hidden',
        }}
      >
        {/* 날씨 애니메이션 배경 */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 150,
            zIndex: 1,
          }}
        >
          <TreeWeatherAnimation stage={treeData.stage} intensity="light" />
        </View>

        {/* 계절 정보 */}
        <View
          style={{
            zIndex: 10,
            alignItems: 'center',
            marginTop: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: seasonalTheme.accentColor, marginBottom: 4 }}>
            {seasonalTheme.seasonName}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            {seasonalTheme.description}
          </Text>
        </View>

        {/* 나무 이모지 - 큰 표시 */}
        <Text style={{ fontSize: 120, marginBottom: 12, zIndex: 10 }}>
          {stageInfo.emoji}
        </Text>

        {/* 단계 정보 */}
        <Text style={{ fontSize: 28, fontWeight: '800', color: stageInfo.color, marginBottom: 4, zIndex: 10 }}>
          {stageInfo.name}
        </Text>
        <Text style={{ fontSize: 14, color: '#558B2F', marginBottom: 16, zIndex: 10 }}>
          {stageInfo.description}
        </Text>

        {/* 통계 */}
        <View
          style={{
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: seasonalTheme.accentColor,
            zIndex: 10,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
            <StatBox label="총 학습 시간" value={formatMinutes(treeData.totalStudyMinutes)} />
            <StatBox label="풀이 문제" value={`${treeData.totalProblemsCompleted}개`} />
            <StatBox label="정답률" value={`${Math.round((treeData.totalCorrectAnswers / treeData.totalProblemsCompleted) * 100)}%`} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <StatBox label="현재 스트릭" value={`${treeData.currentStreak}일`} highlight />
            <StatBox label="최장 스트릭" value={`${treeData.longestStreak}일`} />
          </View>
        </View>

        {/* 성장 진도 바 */}
        <View style={{ width: '100%', marginBottom: 12, zIndex: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#558B2F' }}>다음 단계까지</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#558B2F' }}>
              {minutesToNext === 0 ? '완성! 🎉' : `${minutesToNext}분 남음`}
            </Text>
          </View>
          <View
            style={{
              width: '100%',
              height: 12,
              backgroundColor: '#E8F5E9',
              borderRadius: 6,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: seasonalTheme.accentColor,
            }}
          >
            <View
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: seasonalTheme.accentColor,
                borderRadius: 6,
              }}
            />
          </View>
          <Text style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
            진도: {Math.round(progress)}%
          </Text>
        </View>

        {/* 새로고침 버튼 */}
        <Pressable
          onPress={() => {
            loadTreeData();
            onRefresh?.();
          }}
          style={({ pressed }) => [{
            backgroundColor: seasonalTheme.accentColor,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 10,
            opacity: pressed ? 0.8 : 1,
            zIndex: 10,
          }]}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
            🔄 새로고침
          </Text>
        </Pressable>
      </View>

      {/* 성장 마일스톤 */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
          🏆 성장 마일스톤
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {treeData.milestones.map((milestone, index) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                isLatest={index === treeData.milestones.length - 1}
              />
            ))}
          </View>
        </ScrollView>

        {/* 다음 목표 */}
        {treeData.stage !== 'forest' && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: seasonalTheme.bgGradientStart,
              borderRadius: 12,
              padding: 12,
              borderLeftWidth: 4,
              borderLeftColor: seasonalTheme.accentColor,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: seasonalTheme.accentColor, marginBottom: 4 }}>
              🎯 다음 목표: {seasonalTheme.seasonName}
            </Text>
            <Text style={{ fontSize: 13, color: '#666' }}>
              {minutesToNext}분 더 공부하면 {seasonalTheme.seasonName}의 {getNextSeasonName(treeData.stage)}로 변합니다!
            </Text>
          </View>
        )}

        {/* 최고 단계 도달 메시지 */}
        {treeData.stage === 'forest' && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: '#E8F5E9',
              borderRadius: 12,
              padding: 12,
              borderLeftWidth: 4,
              borderLeftColor: '#4CAF50',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#2E7D32', marginBottom: 4 }}>
              ✨ 축하합니다!
            </Text>
            <Text style={{ fontSize: 13, color: '#1B5E20' }}>
              울창한 겨울 숲을 이루었습니다. 계속 공부하면서 숲을 더욱 무성하게 만들어보세요!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ============= 유틸리티 컴포넌트 =============
function StatBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{label}</Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: highlight ? '#FF9800' : '#558B2F',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function MilestoneCard({ milestone, isLatest }: { milestone: any; isLatest: boolean }) {
  const stageInfo = getStageInfo(milestone.stage);
  const daysAgo = Math.floor(
    (Date.now() - new Date(milestone.unlockedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View
      style={{
        backgroundColor: isLatest ? '#FFF9C4' : '#F5F5F5',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        minWidth: 100,
        borderWidth: 2,
        borderColor: isLatest ? '#FFD54F' : '#E0E0E0',
      }}
    >
      <Text style={{ fontSize: 36, marginBottom: 4 }}>{stageInfo.emoji}</Text>
      <Text style={{ fontSize: 11, fontWeight: '600', color: '#333', marginBottom: 2 }}>
        {stageInfo.name}
      </Text>
      <Text style={{ fontSize: 10, color: '#999' }}>
        {daysAgo === 0 ? '오늘' : `${daysAgo}일 전`}
      </Text>
      <Text style={{ fontSize: 9, color: '#BBB', marginTop: 4 }}>
        {milestone.studyMinutesAtUnlock}분
      </Text>
    </View>
  );
}

// ============= 헬퍼 함수 =============
function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${mins}분`;
}

function getNextSeasonName(stage: TreeStage): string {
  const stages: TreeStage[] = ['seed', 'sprout', 'sapling', 'tree', 'forest'];
  const currentIndex = stages.indexOf(stage);
  if (currentIndex === stages.length - 1) return '겨울';

  const nextStage = stages[currentIndex + 1];
  const seasonNames: Record<TreeStage, string> = {
    seed: '봄',
    sprout: '초여름',
    sapling: '여름',
    tree: '가을',
    forest: '겨울',
  };
  return seasonNames[nextStage];
}
