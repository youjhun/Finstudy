import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import type { EssayAnalysis } from '@/lib/essay-analysis-handler';

interface EssayAnalysisModalProps {
  visible: boolean;
  analysis: EssayAnalysis | null;
  followUpQuestion: string;
  userAnswer: string;
  onRetryAnswer: (newAnswer: string) => void;
  onClose: () => void;
  isLoading?: boolean;
  allowRetry?: boolean;
  retryCount?: number;
}

export function EssayAnalysisModal({
  visible,
  analysis,
  followUpQuestion,
  userAnswer,
  onRetryAnswer,
  onClose,
  isLoading = false,
  allowRetry = true,
  retryCount = 0,
}: EssayAnalysisModalProps) {
  const [retryAnswer, setRetryAnswer] = React.useState('');

  if (!analysis) return null;

  // 점수에 따른 색상
  const scoreColors = {
    excellent: { bg: '#E8F5E9', text: '#2E7D32', label: '✅ 우수' },
    good: { bg: '#FFF3E0', text: '#E65100', label: '👍 양호' },
    needs_improvement: { bg: '#FFEBEE', text: '#C62828', label: '💡 개선 필요' },
  };

  const scoreInfo = scoreColors[analysis.score];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <ScrollView className="flex-1 bg-white">
        <View className="p-4 gap-4">
          {/* 헤더 */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-2xl font-bold text-foreground">📝 답안 분석</Text>
            <Pressable onPress={onClose}>
              <Text className="text-2xl">✕</Text>
            </Pressable>
          </View>

          {/* 점수 표시 */}
          <View
            className="rounded-lg p-4"
            style={{ backgroundColor: scoreInfo.bg }}
          >
            <Text style={{ color: scoreInfo.text }} className="text-lg font-bold">
              {scoreInfo.label}
            </Text>
            <Text style={{ color: scoreInfo.text }} className="text-sm mt-1">
              {analysis.feedback}
            </Text>
          </View>

          {/* 상세 피드백 */}
          <View className="gap-2">
            <Text className="text-base font-bold text-foreground">📋 상세 평가</Text>
            <Text className="text-sm text-muted leading-relaxed">
              {analysis.detailedFeedback}
            </Text>
          </View>

          {/* 강점 */}
          {analysis.strengths.length > 0 && (
            <View className="gap-2">
              <Text className="text-base font-bold text-green-700">✅ 강점</Text>
              {analysis.strengths.map((strength, idx) => (
                <View key={idx} className="flex-row gap-2 ml-2">
                  <Text className="text-green-700">•</Text>
                  <Text className="flex-1 text-sm text-foreground">{strength}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 약점 */}
          {analysis.weaknesses.length > 0 && (
            <View className="gap-2">
              <Text className="text-base font-bold text-orange-700">💡 개선점</Text>
              {analysis.weaknesses.map((weakness, idx) => (
                <View key={idx} className="flex-row gap-2 ml-2">
                  <Text className="text-orange-700">•</Text>
                  <Text className="flex-1 text-sm text-foreground">{weakness}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 다룬 개념 */}
          {analysis.conceptsCovered.length > 0 && (
            <View className="gap-2">
              <Text className="text-base font-bold text-blue-700">📚 다룬 개념</Text>
              <View className="flex-row flex-wrap gap-2">
                {analysis.conceptsCovered.map((concept, idx) => (
                  <View
                    key={idx}
                    className="bg-blue-100 rounded-full px-3 py-1"
                  >
                    <Text className="text-sm text-blue-700">{concept}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 놓친 개념 */}
          {analysis.conceptsMissed.length > 0 && (
            <View className="gap-2">
              <Text className="text-base font-bold text-red-700">❌ 놓친 개념</Text>
              <View className="flex-row flex-wrap gap-2">
                {analysis.conceptsMissed.map((concept, idx) => (
                  <View
                    key={idx}
                    className="bg-red-100 rounded-full px-3 py-1"
                  >
                    <Text className="text-sm text-red-700">{concept}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 경제 용어 해설 */}
          {analysis.economicTerms.length > 0 && (
            <View className="gap-2">
              <Text className="text-base font-bold text-foreground">📖 경제 용어 해설</Text>
              {analysis.economicTerms.map((term, idx) => (
                <View key={idx} className="bg-slate-50 rounded-lg p-3 gap-2 border border-slate-200">
                  <Text className="font-bold text-foreground">{term.term}</Text>
                  <Text className="text-sm text-muted">{term.definition}</Text>
                  {term.context && (
                    <Text className="text-xs text-muted italic">
                      당신의 답변에서: "{term.context}"
                    </Text>
                  )}
                  {term.example && (
                    <Text className="text-xs text-muted">
                      예시: {term.example}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* 재답변 섹션 */}
          {allowRetry && retryCount === 0 && (
            <View className="gap-3 border-t border-slate-200 pt-4 mt-2">
              <View className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <Text className="text-sm font-semibold text-blue-700 mb-2">
                  💭 추가 질문
                </Text>
                <Text className="text-sm text-blue-900 leading-relaxed">
                  {followUpQuestion}
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">
                  재답변 (선택사항)
                </Text>
                <TextInput
                  className="bg-white border border-blue-200 rounded-lg p-3 text-base"
                  placeholder="추가 질문에 대해 다시 답변해주세요"
                  multiline
                  numberOfLines={4}
                  value={retryAnswer}
                  onChangeText={setRetryAnswer}
                  editable={!isLoading}
                />
                <Text className="text-xs text-muted">{retryAnswer.length}자</Text>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => onClose()}
                  className="flex-1 bg-slate-200 rounded-lg py-3"
                >
                  <Text className="text-center font-semibold text-foreground">
                    건너뛰기
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (retryAnswer.trim()) {
                      onRetryAnswer(retryAnswer);
                      setRetryAnswer('');
                    }
                  }}
                  disabled={!retryAnswer.trim() || isLoading}
                  className="flex-1 bg-blue-500 rounded-lg py-3"
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text className="text-center font-semibold text-white">
                    {isLoading ? '분석 중...' : '재답변 제출'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* 완료 버튼 */}
          {(!allowRetry || retryCount > 0) && (
            <Pressable
              onPress={onClose}
              className="bg-primary rounded-lg py-3 mt-4"
            >
              <Text className="text-center font-semibold text-white">
                완료
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}
