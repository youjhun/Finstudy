import { Pressable, Text, View, Modal, ScrollView, Platform } from 'react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

interface PremiumPaymentProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PremiumPaymentModal({ visible, onClose, onSuccess }: PremiumPaymentProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'monthly',
      name: '월간 플랜',
      price: '₩4,900',
      period: '월',
      features: ['모든 해설 해제', '광고 제거', '우선 지원'],
      popular: false,
    },
    {
      id: 'yearly',
      name: '연간 플랜',
      price: '₩39,900',
      period: '년',
      features: ['모든 해설 해제', '광고 제거', '우선 지원', '30% 할인'],
      popular: true,
    },
  ];

  const handlePurchase = async (planId: 'monthly' | 'yearly') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsProcessing(true);

    try {
      // 실제 환경에서는 여기서 결제 게이트웨이 (Apple Pay, Google Play, Stripe 등)와 연동
      // 현재는 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 프리미엘 상태 저장
      const premiumData = {
        isPremium: true,
        plan: planId,
        purchasedAt: new Date().toISOString(),
        expiresAt:
          planId === 'monthly'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await AsyncStorage.setItem('premium-status', JSON.stringify(premiumData));

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            marginTop: 100,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-3xl font-bold text-foreground">✨ 프리미엄</Text>
                <Text className="text-sm text-muted mt-1">모든 해설을 해제하세요</Text>
              </View>
              <Pressable onPress={onClose}>
                <Text className="text-2xl">✕</Text>
              </Pressable>
            </View>

            {/* Benefits */}
            <View className="rounded-[20px] bg-gradient-to-r from-purple-50 to-pink-50 p-6 mb-8 border border-purple-200">
              <Text className="text-sm font-semibold text-purple-900 mb-4">🎁 프리미엄 혜택</Text>
              <View className="gap-3">
                <View className="flex-row items-center gap-3">
                  <Text className="text-lg">🔓</Text>
                  <Text className="text-sm text-purple-800">모든 기사의 상세 해설 해제</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Text className="text-lg">📊</Text>
                  <Text className="text-sm text-purple-800">심화 분석 자료 제공</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Text className="text-lg">🚀</Text>
                  <Text className="text-sm text-purple-800">우선 지원 및 신기능 조기 접근</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Text className="text-lg">🎯</Text>
                  <Text className="text-sm text-purple-800">광고 없는 학습 경험</Text>
                </View>
              </View>
            </View>

            {/* Plans */}
            <Text className="text-sm font-semibold text-foreground mb-4">💳 요금제 선택</Text>
            <View className="gap-4 mb-8">
              {plans.map((plan) => (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id as 'monthly' | 'yearly')}
                  disabled={isProcessing}
                  style={({ pressed }) => [
                    {
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: selectedPlan === plan.id ? '#2F7B56' : '#E5E7EB',
                      backgroundColor: selectedPlan === plan.id ? '#EAF8F0' : '#F9FAFB',
                      padding: 16,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View>
                      <Text className="text-lg font-bold text-foreground">{plan.name}</Text>
                      <Text className="text-sm text-muted mt-1">{plan.period}별 구독</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-primary">{plan.price}</Text>
                      {plan.popular && (
                        <View className="bg-primary px-2 py-1 rounded-full mt-1">
                          <Text className="text-xs font-bold text-white">인기</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="gap-2">
                    {plan.features.map((feature) => (
                      <View key={feature} className="flex-row items-center gap-2">
                        <Text className="text-sm text-primary">✓</Text>
                        <Text className="text-sm text-foreground">{feature}</Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Purchase Button */}
            <Pressable
              onPress={() => selectedPlan && handlePurchase(selectedPlan)}
              disabled={!selectedPlan || isProcessing}
              style={({ pressed }) => [
                {
                  backgroundColor: selectedPlan && !isProcessing ? '#2F7B56' : '#ccc',
                  paddingVertical: 16,
                  borderRadius: 12,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text className="text-center text-base font-bold text-white">
                {isProcessing ? '처리 중...' : '결제하기'}
              </Text>
            </Pressable>

            {/* Terms */}
            <Text className="text-xs text-muted text-center mt-6">
              구독 시 이용약관에 동의합니다.{'\n'}
              언제든지 취소할 수 있습니다.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function PremiumBadge() {
  return (
    <View className="flex-row items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 rounded-full">
      <Text className="text-sm">✨</Text>
      <Text className="text-xs font-bold text-white">프리미엄</Text>
    </View>
  );
}
