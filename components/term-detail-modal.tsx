import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import type { EconomicTerm } from '@/lib/economic-terms';

export interface TermDetailModalProps {
  visible: boolean;
  term: EconomicTerm | null;
  onClose: () => void;
}

export function TermDetailModal({ visible, term, onClose }: TermDetailModalProps) {
  if (!term) return null;

  const categoryLabel: Record<string, string> = {
    금융: '금융',
    경제: '경제',
    경영: '경영',
    공공: '공공',
    과학: '과학',
    사회: '사회',
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            marginTop: 60,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1">
                <Text className="text-xs font-semibold text-primary mb-2">
                  {categoryLabel[term.category]}
                </Text>
                <Text className="text-2xl font-bold text-foreground">{term.term}</Text>
              </View>
              <Pressable onPress={onClose}>
                <Text className="text-2xl">✕</Text>
              </Pressable>
            </View>

            {/* Definition */}
            <View className="rounded-[16px] bg-blue-50 border border-blue-200 p-4 mb-6">
              <Text className="text-xs font-semibold text-blue-900 mb-2">📖 설명</Text>
              <Text className="text-sm text-blue-900 leading-relaxed">{term.definition}</Text>
            </View>

            {/* Source */}
            <View className="rounded-[16px] bg-amber-50 border border-amber-200 p-3 mb-6">
              <Text className="text-xs font-semibold text-amber-900">📚 출처</Text>
              <Text className="text-xs text-amber-900 mt-1">{term.source}</Text>
            </View>

            {/* Close Button */}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                {
                  backgroundColor: '#2F7B56',
                  paddingVertical: 14,
                  borderRadius: 12,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text className="text-center font-bold text-white">닫기</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
