import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import {
  CERTIFICATIONS,
  getQuizzesByCertification,
  type CertificationQuiz,
} from '@/lib/ncs-certification-data';
import { isValidPremium } from '@/lib/premium-system';

interface CertificationStudyTabProps {
  isPremium: boolean;
}

export function CertificationStudyTab({ isPremium }: CertificationStudyTabProps) {
  const colors = useColors();
  const [selectedCert, setSelectedCert] = useState<'AFPK' | 'IAMP' | 'TESAT' | null>(null);
  const [quizzes, setQuizzes] = useState<CertificationQuiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(!isPremium);

  useEffect(() => {
    if (selectedCert) {
      const certs = getQuizzesByCertification(selectedCert);
      setQuizzes(certs);
      setCurrentQuizIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
      setTotalAnswered(0);
    }
  }, [selectedCert]);

  const handleSelectCertification = (cert: 'AFPK' | 'IAMP' | 'TESAT') => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCert(cert);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const isCorrect = index === quizzes[currentQuizIndex].answer;

    if (isCorrect) {
      setScore(score + 1);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    setTotalAnswered(totalAnswered + 1);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // 완료
      setSelectedCert(null);
    }
  };

  if (!isPremium) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, justifyContent: 'center' }}>
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
                NCS/자격증 대비 학습은 프리미엄 구독자만 이용할 수 있습니다.
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

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔐</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground, marginBottom: 8 }}>
            프리미엄 기능
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center' }}>
            NCS/자격증 대비 학습을 이용하려면 프리미엄 구독이 필요합니다.
          </Text>
        </View>
      </View>
    );
  }

  if (!selectedCert) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground, marginBottom: 8 }}>
            📚 NCS/자격증 대비
          </Text>

          {CERTIFICATIONS.map((cert) => (
            <Pressable
              key={cert.id}
              onPress={() => handleSelectCertification(cert.id as 'AFPK' | 'IAMP' | 'TESAT')}
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Text style={{ fontSize: 28 }}>{cert.icon}</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, flex: 1 }}>
                  {cert.name}
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 20 }}>{cert.description}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Pressable
            onPress={() => setSelectedCert(null)}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>← 돌아가기</Text>
          </Pressable>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            {currentQuizIndex + 1} / {quizzes.length}
          </Text>
        </View>

        <View style={{ height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: 'hidden' }}>
          <View
            style={{
              height: '100%',
              backgroundColor: colors.primary,
              width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%`,
            }}
          />
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 16, lineHeight: 24 }}>
          {currentQuiz.question}
        </Text>

        <View style={{ gap: 8, marginBottom: 24 }}>
          {currentQuiz.choices.map((choice, index) => {
            const isSelected = index === selectedAnswer;
            const isCorrect = index === currentQuiz.answer;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;

            return (
              <Pressable
                key={index}
                onPress={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                style={({ pressed }) => [
                  {
                    backgroundColor: showCorrect
                      ? '#4CAF50'
                      : showIncorrect
                        ? '#F44336'
                        : colors.surface,
                    borderWidth: 1,
                    borderColor: showCorrect
                      ? '#4CAF50'
                      : showIncorrect
                        ? '#F44336'
                        : colors.border,
                    borderRadius: 12,
                    padding: 12,
                    opacity: pressed && selectedAnswer === null ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: showCorrect || showIncorrect ? '#fff' : colors.foreground,
                    fontWeight: '500',
                  }}
                >
                  {String.fromCharCode(65 + index)}. {choice}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {showResult && (
          <View style={{ gap: 12, marginBottom: 24 }}>
            <View
              style={{
                backgroundColor: selectedAnswer === currentQuiz.answer ? '#E8F5E9' : '#FFEBEE',
                borderRadius: 12,
                padding: 12,
                borderLeftWidth: 4,
                borderLeftColor: selectedAnswer === currentQuiz.answer ? '#4CAF50' : '#F44336',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: selectedAnswer === currentQuiz.answer ? '#2E7D32' : '#C62828',
                }}
              >
                {selectedAnswer === currentQuiz.answer ? '✅ 정답입니다!' : '❌ 오답입니다!'}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                📝 해설
              </Text>
              <Text style={{ fontSize: 12, color: colors.foreground, lineHeight: 20 }}>
                {currentQuiz.explanation}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {showResult && (
        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={{ color: colors.background, fontWeight: '600' }}>
              {currentQuizIndex === quizzes.length - 1 ? '완료' : '다음'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
