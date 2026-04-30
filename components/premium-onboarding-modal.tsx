import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import {
  OnboardingTutorial,
  completeTutorial,
  shouldShowTutorial,
} from '@/lib/premium-onboarding-system';

interface PremiumOnboardingModalProps {
  tutorial: OnboardingTutorial;
  visible: boolean;
  onClose: () => void;
  onNavigate?: (screen: string) => void;
}

export function PremiumOnboardingModal({
  tutorial,
  visible,
  onClose,
  onNavigate,
}: PremiumOnboardingModalProps) {
  const colors = useColors();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const step = tutorial.steps[currentStep];
  const progress = ((currentStep + 1) / tutorial.steps.length) * 100;
  const screenHeight = Dimensions.get('window').height;

  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsCompleting(true);
    try {
      await completeTutorial(tutorial.id);

      if (step.targetScreen && onNavigate) {
        onNavigate(step.targetScreen);
      }

      setTimeout(() => {
        onClose();
        setCurrentStep(0);
        setIsCompleting(false);
      }, 300);
    } catch (error) {
      console.error('튜토리얼 완료 실패:', error);
      setIsCompleting(false);
    }
  };

  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
    setCurrentStep(0);
  };

  if (!step) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={handleSkip}
    >
      {/* 배경 오버레이 */}
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
        onPress={handleSkip}
      >
        {/* 튜토리얼 카드 */}
        <Pressable
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 32,
            maxHeight: screenHeight * 0.7,
          }}
        >
          {/* 진행도 바 */}
          <View className="mb-6">
            <View
              style={{
                height: 4,
                backgroundColor: colors.border,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  backgroundColor: colors.primary,
                  width: `${progress}%`,
                }}
              />
            </View>
            <Text className="text-xs text-muted mt-2">
              {currentStep + 1} / {tutorial.steps.length}
            </Text>
          </View>

          {/* 아이콘 */}
          <Text className="text-6xl mb-6 text-center">{step.icon}</Text>

          {/* 제목 */}
          <Text className="text-2xl font-bold text-foreground mb-3 text-center">
            {step.title}
          </Text>

          {/* 설명 */}
          <Text className="text-base text-muted mb-8 text-center leading-relaxed">
            {step.description}
          </Text>

          {/* 버튼 */}
          <View className="gap-3">
            {/* 다음/완료 버튼 */}
            <Pressable
              onPress={step.action === 'complete' ? handleComplete : handleNext}
              disabled={isCompleting}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  opacity: pressed || isCompleting ? 0.8 : 1,
                },
              ]}
            >
              <Text className="text-base font-semibold text-white text-center">
                {step.action === 'complete' ? '✅ 완료' : '다음 →'}
              </Text>
            </Pressable>

            {/* 건너뛰기 버튼 */}
            <Pressable
              onPress={handleSkip}
              disabled={isCompleting}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed || isCompleting ? 0.7 : 1,
                },
              ]}
            >
              <Text className="text-base font-semibold text-muted text-center">
                건너뛰기
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
