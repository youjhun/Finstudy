import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Modal, ActivityIndicator, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { generateWeeklyReport, compareWithLastWeek, type WeeklyReport } from '@/lib/weekly-report-system';

interface WeeklyReportCardProps {
  isPremium: boolean;
}

export function WeeklyReportCard({ isPremium }: WeeklyReportCardProps) {
  const colors = useColors();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(!isPremium);

  useEffect(() => {
    if (isPremium) {
      loadReport();
    }
  }, [isPremium]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const weeklyReport = await generateWeeklyReport();
      setReport(weeklyReport);
    } catch (error) {
      console.error('리포트 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowDetailModal(true);
  };

  if (!isPremium) {
    return (
      <>
        <Modal visible={showUpgradeModal} animationType="fade" transparent>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 24,
                padding: 24,
                width: '85%',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>🔒 프리미엄 기능</Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.muted,
                  textAlign: 'center',
                  marginBottom: 24,
                  lineHeight: 24,
                }}
              >
                주간 금융 문해력 리포트는 프리미엄 구독자만 이용할 수 있습니다.
              </Text>

              <Pressable
                onPress={() => setShowUpgradeModal(false)}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    width: '100%',
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ color: colors.background, fontWeight: '600' }}>프리미엄 구독하기</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: 0.6,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>📊 주간 리포트</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>🔒 프리미엄</Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>
            프리미엄 구독 후 상세 분석을 확인하세요.
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Pressable
        onPress={handleViewDetails}
        style={({ pressed }) => [
          {
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>📊 주간 리포트</Text>
          <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>자세히 보기 →</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : report ? (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>평균 점수</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>
                  {report.averageScore}점
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>정답률</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.success }}>
                  {report.overallAccuracy}%
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>백분위</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.warning }}>
                  {report.percentile}%
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 8,
                padding: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: colors.muted }}>추세:</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color:
                    report.trend === 'up'
                      ? colors.success
                      : report.trend === 'down'
                        ? colors.error
                        : colors.muted,
                }}
              >
                {report.trend === 'up' ? '📈 상승' : report.trend === 'down' ? '📉 하락' : '➡️ 유지'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={{ fontSize: 13, color: colors.muted }}>데이터를 불러올 수 없습니다.</Text>
        )}
      </Pressable>

      <Modal visible={showDetailModal} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground }}>📊 주간 금융 문해력</Text>
              <Pressable onPress={() => setShowDetailModal(false)}>
                <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>닫기</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            {report ? (
              <View style={{ gap: 16 }}>
                {/* 주간 통계 */}
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
                    📈 주간 통계
                  </Text>
                  <View style={{ gap: 8 }}>
                    <StatRow label="기간" value={`${report.weekStart} ~ ${report.weekEnd}`} colors={colors} />
                    <StatRow label="평균 점수" value={`${report.averageScore}점`} colors={colors} />
                    <StatRow label="최고 점수" value={`${report.highestScore}점`} colors={colors} />
                    <StatRow label="최저 점수" value={`${report.lowestScore}점`} colors={colors} />
                    <StatRow label="정답률" value={`${report.overallAccuracy}%`} colors={colors} />
                    <StatRow label="풀이 문제" value={`${report.totalQuestionsAnswered}개`} colors={colors} />
                  </View>
                </View>

                {/* 또래 대비 백분위 */}
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
                    🏆 또래 대비 백분위
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary, marginBottom: 8 }}>
                      {report.percentile}%
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>
                      {report.percentile >= 80
                        ? '상위 20% 이내입니다. 훌륭합니다! 🌟'
                        : report.percentile >= 50
                          ? '평균 수준입니다. 꾸준히 학습하세요! 💪'
                          : '더 노력이 필요합니다. 약점을 집중 학습하세요! 📚'}
                    </Text>
                  </View>
                </View>

                {/* 취약 개념 */}
                {report.weakConcepts.length > 0 && (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
                      🎯 취약 개념 (개선 필요)
                    </Text>
                    <View style={{ gap: 8 }}>
                      {report.weakConcepts.map((concept, idx) => (
                        <View
                          key={idx}
                          style={{
                            backgroundColor: colors.background,
                            borderRadius: 8,
                            padding: 12,
                            borderLeftWidth: 4,
                            borderLeftColor: colors.error,
                          }}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
                              {concept.topic}
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.error, fontWeight: '600' }}>
                              정답률 {concept.correctRate}%
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 일일 점수 추이 */}
                {report.dailyScores.length > 0 && (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
                      📅 일일 점수 추이
                    </Text>
                    <View style={{ gap: 8 }}>
                      {report.dailyScores.map((daily, idx) => (
                        <View
                          key={idx}
                          style={{
                            backgroundColor: colors.background,
                            borderRadius: 8,
                            padding: 12,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 12, color: colors.muted }}>{daily.date}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View
                              style={{
                                width: 100,
                                height: 8,
                                backgroundColor: colors.border,
                                borderRadius: 4,
                                overflow: 'hidden',
                              }}
                            >
                              <View
                                style={{
                                  width: `${daily.score}%`,
                                  height: '100%',
                                  backgroundColor: colors.primary,
                                }}
                              />
                            </View>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground, width: 40 }}>
                              {daily.score}점
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 16, color: colors.muted }}>데이터를 불러올 수 없습니다.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

interface StatRowProps {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}

function StatRow({ label, value, colors }: StatRowProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: 12, color: colors.muted }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>{value}</Text>
    </View>
  );
}
