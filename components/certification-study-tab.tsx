import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import {
  CERTIFICATIONS,
  getQuizzesByCertification,
  getQuizzesByCategory,
  getCategoriesByCertification,
  type CertificationQuiz,
} from '@/lib/ncs-certification-data';

const CERT_PROGRESS_KEY = 'finstudy-cert-progress-v2';

interface CertProgress {
  [certId: string]: {
    [category: string]: {
      attempted: number;
      correct: number;
      completedIds: string[];
    };
  };
}

interface CertificationStudyTabProps {
  isPremium: boolean;
}

type CertType = 'AFPK' | 'IAMP';
type ScreenState = 'list' | 'categories' | 'quiz' | 'result';

export function CertificationStudyTab({ isPremium }: CertificationStudyTabProps) {
  const colors = useColors();
  const [screen, setScreen] = useState<ScreenState>('list');
  const [selectedCert, setSelectedCert] = useState<CertType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<CertificationQuiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [progress, setProgress] = useState<CertProgress>({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(!isPremium);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await AsyncStorage.getItem(CERT_PROGRESS_KEY);
      if (data) setProgress(JSON.parse(data));
    } catch (e) {
      console.error('진행도 로드 실패:', e);
    }
  };

  const saveProgress = async (newProgress: CertProgress) => {
    try {
      await AsyncStorage.setItem(CERT_PROGRESS_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (e) {
      console.error('진행도 저장 실패:', e);
    }
  };

  const handleSelectCert = (cert: CertType) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCert(cert);
    setScreen('categories');
  };

  const handleSelectCategory = (category: string) => {
    if (!selectedCert) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCategory(category);
    const categoryQuizzes = getQuizzesByCategory(selectedCert, category);
    setQuizzes(categoryQuizzes);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setSessionScore(0);
    setSessionTotal(0);
    setScreen('quiz');
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);

    const isCorrect = index === quizzes[currentQuizIndex].answer;
    if (isCorrect) {
      setSessionScore((s) => s + 1);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setSessionTotal((t) => t + 1);
    setShowExplanation(true);

    // 진행도 업데이트
    if (selectedCert && selectedCategory) {
      const newProgress = { ...progress };
      if (!newProgress[selectedCert]) newProgress[selectedCert] = {};
      if (!newProgress[selectedCert][selectedCategory]) {
        newProgress[selectedCert][selectedCategory] = { attempted: 0, correct: 0, completedIds: [] };
      }
      newProgress[selectedCert][selectedCategory].attempted += 1;
      if (isCorrect) newProgress[selectedCert][selectedCategory].correct += 1;
      const qId = quizzes[currentQuizIndex].id;
      if (!newProgress[selectedCert][selectedCategory].completedIds.includes(qId)) {
        newProgress[selectedCert][selectedCategory].completedIds.push(qId);
      }
      saveProgress(newProgress);
    }
  };

  const handleNext = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setScreen('result');
    }
  };

  const handleBackToCategories = () => {
    setScreen('categories');
    setSelectedCategory(null);
    setQuizzes([]);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleBackToList = () => {
    setScreen('list');
    setSelectedCert(null);
    setSelectedCategory(null);
  };

  const getCategoryProgress = (cert: CertType, category: string) => {
    const p = progress[cert]?.[category];
    if (!p) return { rate: 0, attempted: 0 };
    return {
      rate: p.attempted > 0 ? Math.round((p.correct / p.attempted) * 100) : 0,
      attempted: p.attempted,
    };
  };

  const getTotalProgress = (cert: CertType) => {
    const certProgress = progress[cert];
    if (!certProgress) return { rate: 0, total: 0 };
    let totalAttempted = 0;
    let totalCorrect = 0;
    Object.values(certProgress).forEach((cat) => {
      totalAttempted += cat.attempted;
      totalCorrect += cat.correct;
    });
    return {
      rate: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0,
      total: totalAttempted,
    };
  };

  // ============ 프리미엄 잠금 화면 ============
  if (!isPremium) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, justifyContent: 'center' }}>
        <Modal visible={showUpgradeModal} animationType="fade" presentationStyle="overFullScreen" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: colors.background, borderRadius: 24, padding: 28, width: '85%', alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground, marginBottom: 12 }}>프리미엄 전용 기능</Text>
              <Text style={{ fontSize: 15, color: colors.muted, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
                투자운용기능사, AFPK 자격증 대비 학습은{'\n'}프리미엄 구독자만 이용할 수 있습니다.
              </Text>
              <Pressable
                onPress={() => setShowUpgradeModal(false)}
                style={({ pressed }) => [{ backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14, width: '100%', alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>프리미엄 구독하기</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔐</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground, marginBottom: 8 }}>프리미엄 전용 기능</Text>
          <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center' }}>NCS/자격증 대비 학습을 이용하려면{'\n'}프리미엄 구독이 필요합니다.</Text>
        </View>
      </View>
    );
  }

  // ============ 자격증 목록 화면 ============
  if (screen === 'list') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.foreground, marginBottom: 4 }}>📚 자격증 대비 학습</Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>금융권 취업에 필요한 핵심 자격증을 준비하세요</Text>
        </View>

        {CERTIFICATIONS.map((cert) => {
          const { rate, total } = getTotalProgress(cert.id as CertType);
          return (
            <Pressable
              key={cert.id}
              onPress={() => handleSelectCert(cert.id as CertType)}
              style={({ pressed }) => [{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: cert.color + '20', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 28 }}>{cert.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: colors.foreground }}>{cert.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                    {cert.subjects.length}과목 · 합격기준 {cert.passingScore}점 · {cert.examTime}분
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>{cert.description}</Text>
              
              {/* 진행도 바 */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ height: '100%', backgroundColor: cert.color, width: `${Math.min(rate, 100)}%`, borderRadius: 3 }} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: rate >= 70 ? '#4CAF50' : colors.muted }}>
                  {total > 0 ? `${rate}%` : '미시작'}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {/* 시험 정보 카드 */}
        <View style={{ backgroundColor: '#F0F9FF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#BAE6FD' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#0369A1', marginBottom: 8 }}>💡 학습 팁</Text>
          <Text style={{ fontSize: 13, color: '#0C4A6E', lineHeight: 20 }}>
            • 과목별로 기출문제를 반복 풀이하세요{'\n'}
            • 오답 문제는 해설을 꼼꼼히 읽고 개념을 정리하세요{'\n'}
            • 합격 기준(70점)을 넘기면 실전 모의고사에 도전하세요
          </Text>
        </View>
      </ScrollView>
    );
  }

  // ============ 과목 선택 화면 ============
  if (screen === 'categories') {
    const cert = CERTIFICATIONS.find((c) => c.id === selectedCert)!;
    const categories = getCategoriesByCertification(selectedCert!);

    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 12 }}>
        {/* 헤더 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Pressable onPress={handleBackToList} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>← 돌아가기</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: cert.color + '20', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>{cert.icon}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground }}>{cert.name}</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>{categories.length}개 과목</Text>
          </View>
        </View>

        {/* 과목 목록 */}
        {categories.map((category, idx) => {
          const { rate, attempted } = getCategoryProgress(selectedCert!, category);
          const categoryQuizzes = getQuizzesByCategory(selectedCert!, category);
          const completedCount = progress[selectedCert!]?.[category]?.completedIds?.length || 0;

          return (
            <Pressable
              key={category}
              onPress={() => handleSelectCategory(category)}
              style={({ pressed }) => [{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              }]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: cert.color + '30', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: cert.color }}>{idx + 1}</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>{category}</Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.muted }}>{categoryQuizzes.length}문제</Text>
              </View>

              {/* 진행도 */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' }}>
                  <View style={{ height: '100%', backgroundColor: rate >= 70 ? '#4CAF50' : cert.color, width: `${Math.min((completedCount / categoryQuizzes.length) * 100, 100)}%` }} />
                </View>
                <Text style={{ fontSize: 11, color: rate >= 70 ? '#4CAF50' : colors.muted, fontWeight: '500' }}>
                  {attempted > 0 ? `정답률 ${rate}%` : '미시작'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  // ============ 퀴즈 풀이 화면 ============
  if (screen === 'quiz' && quizzes.length > 0) {
    const currentQuiz = quizzes[currentQuizIndex];
    const cert = CERTIFICATIONS.find((c) => c.id === selectedCert)!;

    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* 상단 진행도 바 */}
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Pressable onPress={handleBackToCategories} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '600' }}>← {selectedCategory}</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                {currentQuizIndex + 1}/{quizzes.length}
              </Text>
              <View style={{ backgroundColor: currentQuiz.difficulty === 'hard' ? '#FFEBEE' : currentQuiz.difficulty === 'medium' ? '#FFF3E0' : '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: currentQuiz.difficulty === 'hard' ? '#C62828' : currentQuiz.difficulty === 'medium' ? '#E65100' : '#2E7D32' }}>
                  {currentQuiz.difficulty === 'hard' ? '상' : currentQuiz.difficulty === 'medium' ? '중' : '하'}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: cert.color, width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%`, borderRadius: 3 }} />
          </View>
        </View>

        {/* 문제 및 선택지 */}
        <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* 문제 */}
          <View style={{ marginBottom: 20 }}>
            {currentQuiz.year && (
              <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>📅 {currentQuiz.year}년 기출</Text>
            )}
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, lineHeight: 26 }}>
              {currentQuiz.question}
            </Text>
          </View>

          {/* 선택지 */}
          <View style={{ gap: 10, marginBottom: 20 }}>
            {currentQuiz.choices.map((choice, index) => {
              const isSelected = index === selectedAnswer;
              const isCorrect = index === currentQuiz.answer;
              const showCorrectHighlight = showExplanation && isCorrect;
              const showIncorrectHighlight = showExplanation && isSelected && !isCorrect;

              return (
                <Pressable
                  key={index}
                  onPress={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  style={({ pressed }) => [{
                    backgroundColor: showCorrectHighlight ? '#E8F5E9' : showIncorrectHighlight ? '#FFEBEE' : colors.surface,
                    borderWidth: 1.5,
                    borderColor: showCorrectHighlight ? '#4CAF50' : showIncorrectHighlight ? '#F44336' : isSelected ? colors.primary : colors.border,
                    borderRadius: 14,
                    padding: 14,
                    opacity: pressed && selectedAnswer === null ? 0.7 : 1,
                  }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                    <View style={{
                      width: 26, height: 26, borderRadius: 13,
                      backgroundColor: showCorrectHighlight ? '#4CAF50' : showIncorrectHighlight ? '#F44336' : colors.border,
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: (showCorrectHighlight || showIncorrectHighlight) ? '#fff' : colors.muted }}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, color: colors.foreground, flex: 1, lineHeight: 22 }}>
                      {choice}
                    </Text>
                    {showCorrectHighlight && <Text style={{ fontSize: 16 }}>✅</Text>}
                    {showIncorrectHighlight && <Text style={{ fontSize: 16 }}>❌</Text>}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* 해설 */}
          {showExplanation && (
            <View style={{ gap: 12 }}>
              <View style={{
                backgroundColor: selectedAnswer === currentQuiz.answer ? '#E8F5E9' : '#FFEBEE',
                borderRadius: 14, padding: 14,
                borderLeftWidth: 4,
                borderLeftColor: selectedAnswer === currentQuiz.answer ? '#4CAF50' : '#F44336',
              }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: selectedAnswer === currentQuiz.answer ? '#2E7D32' : '#C62828', marginBottom: 4 }}>
                  {selectedAnswer === currentQuiz.answer ? '✅ 정답입니다!' : '❌ 오답입니다!'}
                </Text>
                <Text style={{ fontSize: 12, color: selectedAnswer === currentQuiz.answer ? '#388E3C' : '#D32F2F' }}>
                  정답: {String.fromCharCode(65 + currentQuiz.answer)}. {currentQuiz.choices[currentQuiz.answer]}
                </Text>
              </View>

              <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>📝 상세 해설</Text>
                <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 22 }}>
                  {currentQuiz.explanation}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* 하단 버튼 */}
        {showExplanation && (
          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [{
                backgroundColor: cert.color,
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                {currentQuizIndex === quizzes.length - 1 ? '결과 보기' : '다음 문제 →'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // ============ 결과 화면 ============
  if (screen === 'result') {
    const cert = CERTIFICATIONS.find((c) => c.id === selectedCert)!;
    const accuracy = sessionTotal > 0 ? Math.round((sessionScore / sessionTotal) * 100) : 0;
    const passed = accuracy >= 70;

    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: passed ? '#E8F5E9' : '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 40 }}>{passed ? '🎉' : '💪'}</Text>
        </View>

        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.foreground, marginBottom: 8 }}>
          {passed ? '합격 기준 달성!' : '아쉽지만 다시 도전!'}
        </Text>
        <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 24, textAlign: 'center' }}>
          {selectedCategory} · {sessionTotal}문제 풀이 완료
        </Text>

        {/* 성적 카드 */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 24, width: '100%', borderWidth: 1, borderColor: colors.border, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: passed ? '#4CAF50' : '#F44336' }}>{accuracy}%</Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>정답률</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary }}>{sessionScore}/{sessionTotal}</Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>맞힌 문제</Text>
            </View>
          </View>

          <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: passed ? '#4CAF50' : '#F44336', width: `${accuracy}%`, borderRadius: 4 }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ fontSize: 11, color: colors.muted }}>0%</Text>
            <Text style={{ fontSize: 11, color: colors.muted, fontWeight: '600' }}>합격 기준 70%</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>100%</Text>
          </View>
        </View>

        {/* 버튼 */}
        <View style={{ width: '100%', gap: 10 }}>
          <Pressable
            onPress={handleBackToCategories}
            style={({ pressed }) => [{ backgroundColor: cert.color, paddingVertical: 14, borderRadius: 14, alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>다른 과목 학습하기</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setCurrentQuizIndex(0);
              setSelectedAnswer(null);
              setShowExplanation(false);
              setSessionScore(0);
              setSessionTotal(0);
              setScreen('quiz');
            }}
            style={({ pressed }) => [{ backgroundColor: colors.surface, paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={{ color: colors.foreground, fontWeight: '600', fontSize: 15 }}>다시 풀기</Text>
          </Pressable>
          <Pressable
            onPress={handleBackToList}
            style={({ pressed }) => [{ paddingVertical: 12, alignItems: 'center', opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={{ color: colors.muted, fontSize: 14 }}>자격증 목록으로</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return null;
}
