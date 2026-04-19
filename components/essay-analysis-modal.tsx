import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import type { EssayAnalysisResult } from '@/lib/essay-analysis-handler';

interface EssayAnalysisModalProps {
  visible: boolean;
  question: string;
  articleContent: string;
  firstAnswer: string;
  analysis: EssayAnalysisResult | null;
  isLoading: boolean;
  secondAnswer: string;
  onSecondAnswerChange: (text: string) => void;
  onSecondAnswerSubmit: (answer: string) => void;
  onClose: () => void;
  finalFeedback?: EssayAnalysisResult | null;
  isFinalLoading?: boolean;
  showFinal?: boolean;
  error?: string | null;
}

export function EssayAnalysisModal({
  visible,
  question,
  articleContent,
  firstAnswer,
  analysis,
  isLoading,
  secondAnswer,
  onSecondAnswerChange,
  onSecondAnswerSubmit,
  onClose,
  finalFeedback,
  isFinalLoading,
  showFinal,
  error,
}: EssayAnalysisModalProps) {
  const colors = useColors();

  const handleSubmitSecondAnswer = () => {
    if (!secondAnswer.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    // 방어 코드: 필수 데이터 검증
    if (!question || !articleContent || !firstAnswer) {
      console.error('필수 데이터 누락:', { question, articleContent, firstAnswer });
      alert('필수 데이터가 누락되었습니다. 다시 시도해주세요.');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSecondAnswerSubmit(secondAnswer);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, gap: 16 }}>
          {/* 헤더 */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground }}>
              📝 서술형 답변 분석
            </Text>
          </View>

          {isLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 12, color: colors.muted }}>답변 분석 중...</Text>
            </View>
          ) : error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
              <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: colors.error }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.error, marginBottom: 8 }}>⚠️ 분석 실패</Text>
                <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>{error}</Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [{
                  backgroundColor: colors.primary,
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                }]}
              >
                <Text style={{ color: colors.background, fontWeight: '600' }}>닫기</Text>
              </Pressable>
            </View>
          ) : showFinal && finalFeedback ? (
            // 최종 피드백 화면
            <View style={{ gap: 16 }}>
              <View
                style={{
                  backgroundColor: colors.surface,
                  padding: 12,
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                  ✅ 최종 평가
                </Text>
                <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
                  {finalFeedback.finalFeedback}
                </Text>
                {finalFeedback.score !== undefined && (
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.primary, marginTop: 8 }}>
                    점수: {finalFeedback.score}/100
                  </Text>
                )}
              </View>

              {finalFeedback.strengths && finalFeedback.strengths.length > 0 && (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.success, marginBottom: 8 }}>
                    💪 강점
                  </Text>
                  {finalFeedback.strengths.map((strength, idx) => (
                    <Text key={idx} style={{ fontSize: 13, color: colors.foreground, marginBottom: 4 }}>
                      • {strength}
                    </Text>
                  ))}
                </View>
              )}

              {finalFeedback.improvements && finalFeedback.improvements.length > 0 && (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.warning, marginBottom: 8 }}>
                    🎯 개선 방향
                  </Text>
                  {finalFeedback.improvements.map((improvement, idx) => (
                    <Text key={idx} style={{ fontSize: 13, color: colors.foreground, marginBottom: 4 }}>
                      • {improvement}
                    </Text>
                  ))}
                </View>
              )}

              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ color: colors.background, fontWeight: '600' }}>완료</Text>
              </Pressable>
            </View>
          ) : analysis ? (
            // 분석 결과 및 재질문 화면
            <View style={{ gap: 16 }}>
              {/* 논리 보완점 */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  padding: 12,
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                  💡 논리 보완점
                </Text>
                <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
                  {analysis.feedback}
                </Text>
              </View>

              {/* 강점 */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.success, marginBottom: 8 }}>
                    ✨ 잘한 점
                  </Text>
                  {analysis.strengths.map((strength, idx) => (
                    <Text key={idx} style={{ fontSize: 13, color: colors.foreground, marginBottom: 4 }}>
                      • {strength}
                    </Text>
                  ))}
                </View>
              )}

              {/* 개선점 */}
              {analysis.improvements && analysis.improvements.length > 0 && (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.warning, marginBottom: 8 }}>
                    📌 개선점
                  </Text>
                  {analysis.improvements.map((improvement, idx) => (
                    <Text key={idx} style={{ fontSize: 13, color: colors.foreground, marginBottom: 4 }}>
                      • {improvement}
                    </Text>
                  ))}
                </View>
              )}

              {/* 재질문 */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  padding: 12,
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                  🤔 심화 질문
                </Text>
                <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20, marginBottom: 8 }}>
                  {analysis.followUpQuestion}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted, fontStyle: 'italic' }}>
                  💭 힌트: {analysis.hint}
                </Text>
              </View>

              {/* 재답변 입력 */}
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                  📝 재답변 입력
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    minHeight: 100,
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    textAlignVertical: 'top',
                  }}
                  placeholder="심화 질문에 대한 답변을 입력하세요..."
                  placeholderTextColor={colors.muted}
                  multiline
                  value={secondAnswer}
                  onChangeText={onSecondAnswerChange}
                  editable={!isFinalLoading}
                />
              </View>

              {/* 제출 버튼 */}
              <Pressable
                onPress={handleSubmitSecondAnswer}
                disabled={isFinalLoading}
                style={({ pressed }) => [
                  {
                    backgroundColor: isFinalLoading ? colors.muted : colors.primary,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                {isFinalLoading ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text style={{ color: colors.background, fontWeight: '600' }}>
                    재답변 제출
                  </Text>
                )}
              </Pressable>

              {/* 닫기 버튼 */}
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ color: colors.foreground, fontWeight: '600' }}>닫기</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
