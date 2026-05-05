import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import type { CaseStudy } from '@/lib/case-study-data';
import { CaseStudyTimeline } from './case-study-timeline';
import { CaseStudyIndicatorChart } from './case-study-indicator-chart';
import { CaseStudyImpactAnalysis } from './case-study-impact-analysis';

interface CaseStudyScreenProps {
  caseStudy: CaseStudy;
  onBack?: () => void;
  onQuizStart?: (caseStudyId: string) => void;
}

export function CaseStudyScreen({ caseStudy, onBack, onQuizStart }: CaseStudyScreenProps) {
  const colors = useColors();
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState<number | null>(null);

  const indicatorLabels: Record<string, { title: string; unit: string; emoji: string }> = {
    interest_rate: { title: '기준금리', unit: '%', emoji: '📊' },
    exchange_rate: { title: '환율', unit: 'KRW', emoji: '💱' },
    stock_index: { title: '주가지수', unit: '포인트', emoji: '📈' },
    unemployment: { title: '실업률', unit: '%', emoji: '😢' },
    credit_spread: { title: '신용스프레드', unit: 'bps', emoji: '⚠️' },
    housing_price: { title: '주택가격', unit: '지수', emoji: '🏠' },
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 32 }}>{caseStudy.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.foreground, marginBottom: 2 }}>
                {caseStudy.title}
              </Text>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                {caseStudy.period.start} ~ {caseStudy.period.end}
              </Text>
            </View>
          </View>

          {/* 부제목 */}
          <Text style={{ fontSize: 14, color: colors.foreground, lineHeight: 20, marginBottom: 12 }}>
            {caseStudy.subtitle}
          </Text>

          {/* 요약 */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 12,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground, marginBottom: 6 }}>
              📖 사건 요약
            </Text>
            <Text style={{ fontSize: 12, color: colors.foreground, lineHeight: 18 }}>
              {caseStudy.summary}
            </Text>
          </View>
        </View>

        {/* 원인 분석 */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 12,
              borderLeftWidth: 4,
              borderLeftColor: '#F59E0B',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground, marginBottom: 6 }}>
              🔍 원인 분석
            </Text>
            <Text style={{ fontSize: 12, color: colors.foreground, lineHeight: 18 }}>
              {caseStudy.cause}
            </Text>
          </View>
        </View>

        {/* 타임라인 */}
        <CaseStudyTimeline
          events={caseStudy.timeline}
          onEventSelect={(event, index) => {
            setSelectedTimelineIndex(index);
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        />

        {/* 경제 지표 시각화 */}
        <View style={{ paddingHorizontal: 0, marginBottom: 16 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
              📊 경제 지표 흐름
            </Text>
          </View>

          {(Object.keys(caseStudy.indicators) as Array<keyof typeof caseStudy.indicators>).map((key) => {
            const label = indicatorLabels[key];
            if (!label) return null;

            return (
              <CaseStudyIndicatorChart
                key={key}
                indicator={key}
                data={caseStudy.indicators[key]}
                title={label.title}
                unit={label.unit}
                emoji={label.emoji}
              />
            );
          })}
        </View>

        {/* 영향도 분석 */}
        <CaseStudyImpactAnalysis assets={caseStudy.impactedAssets} />

        {/* 핵심 교훈 */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: '#10B981',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
              💡 핵심 교훈 ({caseStudy.lessons.length}가지)
            </Text>

            {caseStudy.lessons.map((lesson, index) => (
              <View key={index} style={{ flexDirection: 'row', marginBottom: index < caseStudy.lessons.length - 1 ? 12 : 0 }}>
                <Text style={{ fontSize: 18, marginRight: 8, marginTop: -2 }}>
                  {index + 1}️⃣
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 12,
                    color: colors.foreground,
                    lineHeight: 18,
                  }}
                >
                  {lesson}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 학습 퀴즈 버튼 */}
        {caseStudy.quizzes.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                onQuizStart?.(caseStudy.id);
              }}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 16,
                paddingHorizontal: 16,
                opacity: pressed ? 0.8 : 1,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              })}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}
              >
                🎯 이해도 확인 퀴즈 ({caseStudy.quizzes.length}개)
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
