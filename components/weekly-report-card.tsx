import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Modal, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';

interface WeeklyReportCardProps {
  isPremium: boolean;
}

// ============ 상세 더미 데이터 ============

interface WeeklyData {
  week: string;
  score: number;
  quizzesCompleted: number;
  articlesRead: number;
  studyMinutes: number;
}

interface ConceptAnalysis {
  concept: string;
  category: string;
  correctRate: number;
  totalAttempts: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

interface PeerComparison {
  percentile: number;
  averageScore: number;
  topPercentScore: number;
  myScore: number;
  totalUsers: number;
  ageGroup: string;
}

const WEEKLY_SCORES: WeeklyData[] = [
  { week: '4/28~5/1', score: 82, quizzesCompleted: 34, articlesRead: 7, studyMinutes: 145 },
  { week: '4/21~4/27', score: 78, quizzesCompleted: 28, articlesRead: 5, studyMinutes: 120 },
  { week: '4/14~4/20', score: 74, quizzesCompleted: 22, articlesRead: 4, studyMinutes: 95 },
  { week: '4/7~4/13', score: 71, quizzesCompleted: 18, articlesRead: 3, studyMinutes: 80 },
  { week: '3/31~4/6', score: 68, quizzesCompleted: 15, articlesRead: 3, studyMinutes: 65 },
  { week: '3/24~3/30', score: 65, quizzesCompleted: 12, articlesRead: 2, studyMinutes: 50 },
];

const CONCEPT_ANALYSIS: ConceptAnalysis[] = [
  {
    concept: '채권 듀레이션',
    category: '투자',
    correctRate: 45,
    totalAttempts: 11,
    trend: 'up',
    recommendation: '듀레이션과 컨벡시티의 관계를 복습하세요. 금리 변동 시나리오별 채권 가격 변동을 연습하면 도움이 됩니다.',
  },
  {
    concept: '파생상품 헤지',
    category: '파생',
    correctRate: 52,
    totalAttempts: 8,
    trend: 'stable',
    recommendation: '선물·옵션을 활용한 헤지 전략의 기본 원리를 정리하세요. 특히 델타 헤지와 베이시스 리스크 개념을 집중 학습하세요.',
  },
  {
    concept: '양도소득세 계산',
    category: '세금',
    correctRate: 58,
    totalAttempts: 12,
    trend: 'up',
    recommendation: '부동산·주식 양도소득세 계산 구조(취득가액, 필요경비, 장기보유특별공제)를 단계별로 정리하세요.',
  },
  {
    concept: 'CAPM 베타 해석',
    category: '투자',
    correctRate: 62,
    totalAttempts: 13,
    trend: 'up',
    recommendation: '베타 값에 따른 기대수익률 변화와 SML(증권시장선) 위의 위치를 시각적으로 이해하세요.',
  },
  {
    concept: '보험 언더라이팅',
    category: '보험',
    correctRate: 40,
    totalAttempts: 5,
    trend: 'down',
    recommendation: '위험 선택 과정(언더라이팅)의 5가지 요소와 보험료 산출 원리를 체계적으로 학습하세요.',
  },
  {
    concept: '포트폴리오 분산효과',
    category: '투자',
    correctRate: 72,
    totalAttempts: 18,
    trend: 'up',
    recommendation: '상관계수에 따른 분산효과 차이를 이해하고 있습니다. 3개 이상 자산의 최적 포트폴리오 구성을 연습해보세요.',
  },
];

const PEER_COMPARISON: PeerComparison = {
  percentile: 78,
  averageScore: 62,
  topPercentScore: 91,
  myScore: 82,
  totalUsers: 2847,
  ageGroup: '20대',
};

const STRENGTHS = [
  { area: '거시경제 지표 해석', score: 88, icon: '📊' },
  { area: '금융상품 비교', score: 85, icon: '💰' },
  { area: '기업 재무제표 분석', score: 83, icon: '📈' },
];

const WEAKNESSES = [
  { area: '파생상품 가격결정', score: 45, icon: '📉' },
  { area: '보험 상품 설계', score: 48, icon: '🛡️' },
  { area: '세법 계산 문제', score: 52, icon: '🧮' },
];

export function WeeklyReportCard({ isPremium }: WeeklyReportCardProps) {
  const colors = useColors();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'concepts' | 'peer'>('overview');

  if (!isPremium) {
    return (
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Text style={{ fontSize: 16 }}>🔒</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>주간 금융 문해력 리포트</Text>
        </View>
        <Text style={{ fontSize: 13, color: colors.muted }}>프리미엄 구독 시 주간 학습 분석 리포트를 확인할 수 있습니다.</Text>
      </View>
    );
  }

  const currentWeek = WEEKLY_SCORES[0];
  const prevWeek = WEEKLY_SCORES[1];
  const scoreChange = currentWeek.score - prevWeek.score;

  return (
    <>
      {/* 미니 카드 */}
      <Pressable
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowDetailModal(true);
        }}
        style={({ pressed }) => [{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        }]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 18 }}>📊</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}>주간 금융 문해력 리포트</Text>
          </View>
          <View style={{ backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#1565C0' }}>이번 주</Text>
          </View>
        </View>

        {/* 점수 요약 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary }}>{currentWeek.score}</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>문해력 점수</Text>
          </View>
          <View style={{ height: 40, width: 1, backgroundColor: colors.border }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: scoreChange >= 0 ? '#4CAF50' : '#F44336' }}>
              {scoreChange >= 0 ? '+' : ''}{scoreChange}
            </Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>전주 대비</Text>
          </View>
          <View style={{ height: 40, width: 1, backgroundColor: colors.border }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#FF9800' }}>상위 {100 - PEER_COMPARISON.percentile}%</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>또래 백분위</Text>
          </View>
        </View>

        {/* 미니 차트 (텍스트 기반) */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 32, marginBottom: 8 }}>
          {WEEKLY_SCORES.slice().reverse().map((w, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{
                width: '80%',
                height: `${(w.score / 100) * 100}%`,
                backgroundColor: i === WEEKLY_SCORES.length - 1 ? colors.primary : colors.border,
                borderRadius: 3,
                minHeight: 4,
              }} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 10, color: colors.muted }}>6주 전</Text>
          <Text style={{ fontSize: 10, color: colors.muted }}>이번 주</Text>
        </View>

        <View style={{ marginTop: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>상세 리포트 보기 →</Text>
        </View>
      </Pressable>

      {/* 상세 리포트 모달 */}
      <Modal visible={showDetailModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* 모달 헤더 */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground }}>📊 주간 분석 리포트</Text>
            <Pressable onPress={() => setShowDetailModal(false)} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>닫기</Text>
            </Pressable>
          </View>

          {/* 탭 */}
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border }}>
            {[
              { key: 'overview' as const, label: '종합 분석' },
              { key: 'concepts' as const, label: '취약 개념' },
              { key: 'peer' as const, label: '또래 비교' },
            ].map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === tab.key ? colors.primary : 'transparent' }}
              >
                <Text style={{ fontSize: 14, fontWeight: activeTab === tab.key ? '700' : '500', color: activeTab === tab.key ? colors.primary : colors.muted }}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 탭 콘텐츠 */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {activeTab === 'overview' && <OverviewTab colors={colors} currentWeek={currentWeek} scoreChange={scoreChange} />}
            {activeTab === 'concepts' && <ConceptsTab colors={colors} />}
            {activeTab === 'peer' && <PeerTab colors={colors} />}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

// ============ 종합 분석 탭 ============
function OverviewTab({ colors, currentWeek, scoreChange }: { colors: any; currentWeek: WeeklyData; scoreChange: number }) {
  return (
    <View style={{ gap: 16 }}>
      {/* 이번 주 요약 */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>📈 이번 주 학습 요약</Text>
        <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>{currentWeek.week}</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ width: '47%', backgroundColor: '#E3F2FD', borderRadius: 14, padding: 14 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1565C0' }}>{currentWeek.score}점</Text>
            <Text style={{ fontSize: 12, color: '#1976D2', marginTop: 4 }}>문해력 점수</Text>
          </View>
          <View style={{ width: '47%', backgroundColor: '#E8F5E9', borderRadius: 14, padding: 14 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2E7D32' }}>{currentWeek.quizzesCompleted}문제</Text>
            <Text style={{ fontSize: 12, color: '#388E3C', marginTop: 4 }}>퀴즈 풀이</Text>
          </View>
          <View style={{ width: '47%', backgroundColor: '#FFF3E0', borderRadius: 14, padding: 14 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#E65100' }}>{currentWeek.articlesRead}편</Text>
            <Text style={{ fontSize: 12, color: '#F57C00', marginTop: 4 }}>기사 학습</Text>
          </View>
          <View style={{ width: '47%', backgroundColor: '#F3E5F5', borderRadius: 14, padding: 14 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#6A1B9A' }}>{currentWeek.studyMinutes}분</Text>
            <Text style={{ fontSize: 12, color: '#7B1FA2', marginTop: 4 }}>총 학습 시간</Text>
          </View>
        </View>
      </View>

      {/* 주간 점수 추이 */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>📉 6주간 점수 변화</Text>
        
        {WEEKLY_SCORES.map((week, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <Text style={{ fontSize: 11, color: colors.muted, width: 70 }}>{week.week}</Text>
            <View style={{ flex: 1, height: 20, backgroundColor: colors.border, borderRadius: 10, overflow: 'hidden' }}>
              <View style={{ height: '100%', backgroundColor: idx === 0 ? colors.primary : '#90CAF9', width: `${week.score}%`, borderRadius: 10 }} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: idx === 0 ? colors.primary : colors.muted, width: 36, textAlign: 'right' }}>{week.score}</Text>
          </View>
        ))}

        <View style={{ marginTop: 12, backgroundColor: scoreChange >= 0 ? '#E8F5E9' : '#FFEBEE', borderRadius: 10, padding: 12 }}>
          <Text style={{ fontSize: 13, color: scoreChange >= 0 ? '#2E7D32' : '#C62828', fontWeight: '600' }}>
            {scoreChange >= 0 ? '📈' : '📉'} 전주 대비 {scoreChange >= 0 ? '+' : ''}{scoreChange}점 ({scoreChange >= 0 ? '상승' : '하락'})
          </Text>
          <Text style={{ fontSize: 12, color: scoreChange >= 0 ? '#388E3C' : '#D32F2F', marginTop: 4 }}>
            6주 전 대비 총 +{currentWeek.score - WEEKLY_SCORES[WEEKLY_SCORES.length - 1].score}점 성장했습니다.
          </Text>
        </View>
      </View>

      {/* 강점 */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>💪 강점 영역</Text>
        {STRENGTHS.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 16 }}>{s.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>{s.area}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' }}>
                  <View style={{ height: '100%', backgroundColor: '#4CAF50', width: `${s.score}%` }} />
                </View>
                <Text style={{ fontSize: 11, color: '#4CAF50', fontWeight: '600' }}>{s.score}%</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 약점 */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>⚠️ 약점 영역 (집중 학습 필요)</Text>
        {WEAKNESSES.map((w, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 16 }}>{w.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>{w.area}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' }}>
                  <View style={{ height: '100%', backgroundColor: '#F44336', width: `${w.score}%` }} />
                </View>
                <Text style={{ fontSize: 11, color: '#F44336', fontWeight: '600' }}>{w.score}%</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ============ 취약 개념 탭 ============
function ConceptsTab({ colors }: { colors: any }) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>🎯 취약 개념 분석</Text>
        <Text style={{ fontSize: 13, color: colors.muted }}>정답률이 낮은 개념을 집중적으로 분석했습니다</Text>
      </View>

      {CONCEPT_ANALYSIS.sort((a, b) => a.correctRate - b.correctRate).map((concept, idx) => (
        <View key={idx} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                backgroundColor: concept.correctRate < 50 ? '#FFEBEE' : concept.correctRate < 65 ? '#FFF3E0' : '#E8F5E9',
                paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: concept.correctRate < 50 ? '#C62828' : concept.correctRate < 65 ? '#E65100' : '#2E7D32' }}>
                  {concept.category}
                </Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>{concept.concept}</Text>
            </View>
            <Text style={{ fontSize: 14 }}>
              {concept.trend === 'up' ? '📈' : concept.trend === 'down' ? '📉' : '➡️'}
            </Text>
          </View>

          {/* 정답률 바 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <View style={{ flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
              <View style={{
                height: '100%',
                backgroundColor: concept.correctRate < 50 ? '#F44336' : concept.correctRate < 65 ? '#FF9800' : '#4CAF50',
                width: `${concept.correctRate}%`,
                borderRadius: 4,
              }} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: concept.correctRate < 50 ? '#F44336' : concept.correctRate < 65 ? '#FF9800' : '#4CAF50' }}>
              {concept.correctRate}%
            </Text>
          </View>

          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>
            총 {concept.totalAttempts}회 시도 · 추세: {concept.trend === 'up' ? '개선 중' : concept.trend === 'down' ? '하락 중' : '유지'}
          </Text>

          {/* 추천 학습 */}
          <View style={{ backgroundColor: '#F5F5F5', borderRadius: 10, padding: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#424242', marginBottom: 4 }}>💡 추천 학습</Text>
            <Text style={{ fontSize: 12, color: '#616161', lineHeight: 18 }}>{concept.recommendation}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ============ 또래 비교 탭 ============
function PeerTab({ colors }: { colors: any }) {
  const peer = PEER_COMPARISON;

  return (
    <View style={{ gap: 16 }}>
      {/* 백분위 카드 */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 20 }}>🏆 또래 대비 백분위</Text>
        
        <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary }}>상위</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary }}>{100 - peer.percentile}%</Text>
        </View>

        <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center' }}>
          {peer.ageGroup} {peer.totalUsers.toLocaleString()}명 중{'\n'}
          상위 {100 - peer.percentile}%에 해당합니다
        </Text>
      </View>

      {/* 비교 상세 */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>📊 점수 비교</Text>

        <View style={{ gap: 14 }}>
          {/* 내 점수 */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>나의 점수</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>{peer.myScore}점</Text>
            </View>
            <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden' }}>
              <View style={{ height: '100%', backgroundColor: colors.primary, width: `${peer.myScore}%`, borderRadius: 5 }} />
            </View>
          </View>

          {/* 평균 */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>{peer.ageGroup} 평균</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#FF9800' }}>{peer.averageScore}점</Text>
            </View>
            <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden' }}>
              <View style={{ height: '100%', backgroundColor: '#FF9800', width: `${peer.averageScore}%`, borderRadius: 5 }} />
            </View>
          </View>

          {/* 상위 10% */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>상위 10%</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#4CAF50' }}>{peer.topPercentScore}점</Text>
            </View>
            <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden' }}>
              <View style={{ height: '100%', backgroundColor: '#4CAF50', width: `${peer.topPercentScore}%`, borderRadius: 5 }} />
            </View>
          </View>
        </View>

        <View style={{ marginTop: 16, backgroundColor: '#E3F2FD', borderRadius: 12, padding: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#1565C0', marginBottom: 4 }}>💬 분석 코멘트</Text>
          <Text style={{ fontSize: 12, color: '#1976D2', lineHeight: 20 }}>
            평균보다 {peer.myScore - peer.averageScore}점 높은 우수한 성적입니다. 상위 10% 진입까지 {peer.topPercentScore - peer.myScore}점이 남았습니다. 취약 개념(파생상품, 보험)을 집중 학습하면 충분히 달성 가능합니다.
          </Text>
        </View>
      </View>

      {/* 영역별 비교 */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>📋 영역별 또래 비교</Text>

        {[
          { area: '거시경제', my: 88, avg: 65, icon: '🌍' },
          { area: '금융상품', my: 85, avg: 60, icon: '💳' },
          { area: '투자이론', my: 72, avg: 55, icon: '📈' },
          { area: '세금/법규', my: 58, avg: 52, icon: '⚖️' },
          { area: '파생상품', my: 52, avg: 48, icon: '🔄' },
          { area: '보험설계', my: 48, avg: 50, icon: '🛡️' },
        ].map((item, idx) => (
          <View key={idx} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 14 }}>{item.icon}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>{item.area}</Text>
              </View>
              <Text style={{ fontSize: 12, color: item.my >= item.avg ? '#4CAF50' : '#F44336', fontWeight: '600' }}>
                {item.my >= item.avg ? `+${item.my - item.avg}` : `${item.my - item.avg}`}점
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <View style={{ flex: 1 }}>
                <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ height: '100%', backgroundColor: colors.primary, width: `${item.my}%`, borderRadius: 3 }} />
                </View>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>나 {item.my}점</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ height: '100%', backgroundColor: '#BDBDBD', width: `${item.avg}%`, borderRadius: 3 }} />
                </View>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>평균 {item.avg}점</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
