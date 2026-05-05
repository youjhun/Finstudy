import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import { CaseStudyScreen } from '@/components/case-study-screen';
import { getAllCaseStudies, type CaseStudy } from '@/lib/case-study-data';

type CaseStudyTabState = 'list' | 'detail' | 'quiz';

interface CaseStudyTabProps {
  onQuizStart?: (caseStudyId: string) => void;
}

export function CaseStudyTab({ onQuizStart }: CaseStudyTabProps) {
  const colors = useColors();
  const [state, setState] = useState<CaseStudyTabState>('list');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const caseStudies = getAllCaseStudies();

  // 케이스 스터디 목록 화면
  if (state === 'list') {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {/* 헤더 */}
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
              📚 케이스 스터디
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18 }}>
              실제 경제 사태를 통해 경제 지표 흐름을 학습하세요. 리먼브라더스 사태, IMF 외환 위기 등 실제 사례를 분석합니다.
            </Text>
          </View>

          {/* 소개 카드 */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              marginHorizontal: 16,
              marginBottom: 16,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 6 }}>
              💡 케이스 스터디란?
            </Text>
            <Text style={{ fontSize: 12, color: colors.foreground, lineHeight: 18 }}>
              단순한 경제 이론이 아닌, 실제 일어난 경제 사건을 통해 금리, 환율, 주가, 실업률 등의 지표가 어떻게 움직이는지 배웁니다.
            </Text>
          </View>

          {/* 케이스 스터디 카드 */}
          <View style={{ paddingHorizontal: 16, gap: 12, marginBottom: 24 }}>
            {caseStudies.map((caseStudy) => (
              <Pressable
                key={caseStudy.id}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedCaseStudy(caseStudy);
                  setState('detail');
                }}
                style={({ pressed }) => ({
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  opacity: pressed ? 0.8 : 1,
                  borderWidth: 1,
                  borderColor: colors.border,
                })}
              >
                {/* 헤더 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 28, marginRight: 12 }}>{caseStudy.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 2 }}>
                      {caseStudy.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      {caseStudy.period.start} ~ {caseStudy.period.end}
                    </Text>
                  </View>
                </View>

                {/* 부제목 */}
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 10 }}>
                  {caseStudy.subtitle}
                </Text>

                {/* 요약 */}
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.foreground,
                    lineHeight: 18,
                    marginBottom: 12,
                  }}
                  numberOfLines={2}
                >
                  {caseStudy.summary}
                </Text>

                {/* 통계 */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.background,
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>
                      사건
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>
                      {caseStudy.timeline.length}개
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.background,
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>
                      지표
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>
                      {Object.keys(caseStudy.indicators).length}개
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.background,
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>
                      퀴즈
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>
                      {caseStudy.quizzes.length}개
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // 케이스 스터디 상세 화면
  if (state === 'detail' && selectedCaseStudy) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* 뒤로가기 버튼 */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setState('list');
              setSelectedCaseStudy(null);
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              paddingVertical: 8,
              paddingHorizontal: 8,
              marginLeft: -8,
            })}
          >
            <Text style={{ fontSize: 18, color: colors.primary }}>← 돌아가기</Text>
          </Pressable>
        </View>

        <CaseStudyScreen
          caseStudy={selectedCaseStudy}
          onBack={() => {
            setState('list');
            setSelectedCaseStudy(null);
          }}
          onQuizStart={(caseStudyId) => {
            onQuizStart?.(caseStudyId);
          }}
        />
      </View>
    );
  }

  return null;
}
