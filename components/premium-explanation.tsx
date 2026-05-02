import { ScrollView, Text, View, Pressable, StyleSheet, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { haptic } from '@/lib/haptics';
import { Platform } from 'react-native';

interface PremiumExplanation {
  text: string;
  isRevealed: boolean;
}

/**
 * 프리미엄 해설 모자이크 컴포넌트
 * 클릭하여 해설을 공개할 수 있습니다.
 */
export function PremiumExplanation({
  text,
  isPremium = true,
  onReveal,
}: {
  text: string;
  isPremium?: boolean;
  onReveal?: () => void;
}) {
  const [isRevealed, setIsRevealed] = useState(!isPremium);
  const colors = useColors();

  const handleReveal = () => {
    if (!isPremium) return;
    setIsRevealed(true);
    if (Platform.OS !== 'web') {
      haptic.light();
    }
    onReveal?.();
  };

  if (isRevealed) {
    return (
      <View className="rounded-[16px] bg-blue-50 border border-blue-200 p-4">
        <Text className="text-sm font-semibold text-blue-900 mb-2">💡 해설</Text>
        <Text className="text-sm text-blue-800 leading-relaxed">{text}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={handleReveal}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View className="rounded-[16px] bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-dashed border-purple-300 p-4">
        <View className="items-center gap-2">
          <Text className="text-3xl">🔒</Text>
          <Text className="text-sm font-semibold text-purple-900">프리미엄 해설</Text>
          <Text className="text-xs text-purple-700 text-center">
            프리미엄 구독 시 해설을 볼 수 있습니다.
          </Text>
          <View className="mt-2 bg-purple-500 px-4 py-2 rounded-full">
            <Text className="text-xs font-bold text-white">클릭하여 미리보기</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * 프리미엄 구독 배너
 */
export function PremiumBanner() {
  return (
    <View className="rounded-[16px] bg-gradient-to-r from-amber-400 to-orange-400 p-4 mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-bold text-white">✨ 프리미엄 구독</Text>
          <Text className="text-xs text-white/90 mt-1">모든 해설과 고급 기능을 이용하세요</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: 'white',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text className="text-xs font-bold text-orange-600">구독하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
