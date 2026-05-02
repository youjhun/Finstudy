import React from 'react';
import { Modal, View, Text, ScrollView, Pressable } from 'react-native';
import type { EssayFeedback } from '@/lib/essay-feedback-handler';

interface EssayFeedbackModalProps {
  visible: boolean;
  feedback: EssayFeedback | null;
  onClose: () => void;
  isLoading?: boolean;
}

export function EssayFeedbackModal({
  visible,
  feedback,
  onClose,
  isLoading = false,
}: EssayFeedbackModalProps) {
  if (!feedback) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <ScrollView className="flex-1 bg-white">
        <View className="p-4 gap-4">
          {/* 헤더 */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-2xl font-bold text-foreground">💡 상세 피드백</Text>
            <Pressable onPress={onClose}>
              <Text className="text-2xl">✕</Text>
            </Pressable>
          </View>

          {/* 피드백 메시지 */}
          <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <Text className="text-sm text-blue-900 leading-relaxed">
              {feedback.feedback}
            </Text>
          </View>

          {/* 강점 */}
          {feedback.strengths.length > 0 && (
            <View className="gap-2">
              <Text className="text-base font-bold text-green-700">✅ 잘한 점</Text>
              {feedback.strengths.map((strength, idx) => (
                <View key={idx} className="flex-row gap-2 ml-2">
                  <Text className="text-green-700">•</Text>
                  <Text className="flex-1 text-sm text-foreground">{strength}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 개선점 */}
          {feedback.improvements.length > 0 && (
            <View className="gap-2">
              <Text className="text-base font-bold text-orange-700">📝 개선할 점</Text>
              {feedback.improvements.map((improvement, idx) => (
                <View key={idx} className="flex-row gap-2 ml-2">
                  <Text className="text-orange-700">•</Text>
                  <Text className="flex-1 text-sm text-foreground">{improvement}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 다룬 경제 개념 */}
          {feedback.economicConcepts.length > 0 && (
            <View className="gap-2">
              <Text className="text-base font-bold text-blue-700">📚 다룬 경제 개념</Text>
              <View className="flex-row flex-wrap gap-2">
                {feedback.economicConcepts.map((concept, idx) => (
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

          {/* 상세 설명 */}
          <View className="gap-2 bg-slate-50 rounded-lg p-4 border border-slate-200">
            <Text className="text-base font-bold text-foreground">📖 상세 설명</Text>
            <Text className="text-sm text-muted leading-relaxed">
              {feedback.explanation}
            </Text>
          </View>

          {/* 완료 버튼 */}
          <Pressable
            onPress={onClose}
            disabled={isLoading}
            className="bg-primary rounded-lg py-3 mt-4"
          >
            <Text className="text-center font-semibold text-white">
              {isLoading ? '로딩 중...' : '확인'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
  );
}
