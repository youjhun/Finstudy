import { Modal, Pressable, ScrollView, Text, TextInput, View, ActivityIndicator, Platform } from 'react-native';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

export interface AskQuestionModalProps {
  visible: boolean;
  articleTitle: string;
  onClose: () => void;
  onSubmit: (question: string) => Promise<string>;
}

export function AskQuestionModal({
  visible,
  articleTitle,
  onClose,
  onSubmit,
}: AskQuestionModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('질문을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const response = await onSubmit(question);
      setAnswer(response);
      setQuestion('');

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '질문 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setQuestion('');
    setAnswer(null);
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="overFullScreen">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 24,
            width: '90%',
            maxWidth: 400,
            maxHeight: '80%',
          }}
        >
          <ScrollView>
            <Text className="text-2xl font-bold text-foreground mb-2">❓ 추가 질문</Text>
            <Text className="text-sm text-muted mb-4">
              "{articleTitle}" 기사에 대해 더 알고 싶은 점이 있으신가요?
            </Text>

            {!answer ? (
              <>
                <Text className="text-sm font-semibold text-foreground mb-2">질문 입력</Text>
                <TextInput
                  placeholder="예: 스태그플레이션이 한국 경제에 미치는 영향은?"
                  placeholderTextColor="#999"
                  value={question}
                  onChangeText={setQuestion}
                  editable={!isLoading}
                  multiline
                  numberOfLines={4}
                  className="border border-border rounded-[12px] px-4 py-3 text-foreground mb-4"
                  style={{ color: '#11181C', textAlignVertical: 'top' }}
                />

                {error && (
                  <View className="rounded-[12px] bg-red-50 border border-red-300 p-3 mb-4">
                    <Text className="text-xs text-red-700">{error}</Text>
                  </View>
                )}

                <View className="flex-row gap-3">
                  <Pressable
                    onPress={handleClose}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        backgroundColor: '#f0f0f0',
                        paddingVertical: 12,
                        borderRadius: 12,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text className="text-center font-bold text-foreground">닫기</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleAsk}
                    disabled={isLoading || !question.trim()}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        backgroundColor: isLoading || !question.trim() ? '#ccc' : '#2F7B56',
                        paddingVertical: 12,
                        borderRadius: 12,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <View className="flex-row items-center justify-center gap-2">
                      {isLoading && <ActivityIndicator color="white" size="small" />}
                      <Text className="text-center font-bold text-white">
                        {isLoading ? '답변 중...' : '질문하기'}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View className="rounded-[16px] bg-green-50 border border-green-200 p-4 mb-4">
                  <Text className="text-xs font-semibold text-green-900 mb-2">📝 질문</Text>
                  <Text className="text-sm text-green-900">{question}</Text>
                </View>

                <View className="rounded-[16px] bg-blue-50 border border-blue-200 p-4 mb-4">
                  <Text className="text-xs font-semibold text-blue-900 mb-2">💡 답변</Text>
                  <Text className="text-sm text-blue-900 leading-relaxed">{answer}</Text>
                </View>

                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => setAnswer(null)}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        backgroundColor: '#f0f0f0',
                        paddingVertical: 12,
                        borderRadius: 12,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text className="text-center font-bold text-foreground">다른 질문</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleClose}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        backgroundColor: '#2F7B56',
                        paddingVertical: 12,
                        borderRadius: 12,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text className="text-center font-bold text-white">완료</Text>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
