import { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { PremiumExplanation } from '@/components/premium-explanation';
import { TermDetailModal } from '@/components/term-detail-modal';
import { AskQuestionModal } from '@/components/ask-question-modal';
import { ReviewScreen } from '@/components/review-screen';
import { SocraticQuiz } from '@/components/socratic-quiz';
import { EssayAnalysisModal } from '@/components/essay-analysis-modal';
import { isSocraticQuizApplicable, getSocraticQuestionById } from '@/lib/socratic-quiz-system';
import type { SocraticResponse } from '@/lib/socratic-quiz-system';
import { createDynamicSocraticQuestion, generateDynamicSocraticAnalysisPrompt } from '@/lib/dynamic-socratic-question';
import { analyzeEssayAnswer, reanalyzeEssayAnswer, recordEssayAnalysis, type EssayAnalysis } from '@/lib/essay-analysis-handler';
import type { WrongAnswer } from '@/lib/spaced-repetition';
import { addWrongAnswer, getReviewDue } from '@/lib/spaced-repetition';
import { defaultProgress, lessons, type ArticleLesson, type ProgressState } from '@/lib/finstudy-data';
import { haptic } from '@/lib/haptics';
import { searchTerm, type EconomicTerm } from '@/lib/economic-terms';
import { askQuestionAboutArticle } from '@/lib/gemini-question';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'finstudy-progress-v1';

type ScreenMode = 'home' | 'detail' | 'quiz' | 'review';

// Google Material Design 3 - Answer colors
const answerColors = ['#D32F2F', '#1976D2', '#F57C00', '#388E3C'];
const answerSurfaces = ['#FFEBEE', '#E3F2FD', '#FFF3E0', '#E8F5E9'];

export default function TodayScreen() {
  const [progress, setProgress] = useState<ProgressState>(defaultProgress);
  const [mode, setMode] = useState<ScreenMode>('home');
  const [selectedLesson, setSelectedLesson] = useState<ArticleLesson>(lessons[0]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);
  const [allLessons, setAllLessons] = useState<ArticleLesson[]>(lessons);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<EconomicTerm | null>(null);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [savedArticleIds, setSavedArticleIds] = useState<Set<string>>(new Set());
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSocraticQuiz, setShowSocraticQuiz] = useState(false);
  const [socraticResponse, setSocraticResponse] = useState<SocraticResponse | null>(null);
  const [essayAnswer, setEssayAnswer] = useState<string>('');
  const [isAnalyzingEssay, setIsAnalyzingEssay] = useState(false);
  const [dynamicSocraticQuestion, setDynamicSocraticQuestion] = useState<any>(null);
  const [showEssayAnalysis, setShowEssayAnalysis] = useState(false);
  const [essayAnalysis, setEssayAnalysis] = useState<EssayAnalysis | null>(null);
  const [essayFollowUpQuestion, setEssayFollowUpQuestion] = useState('');
  const [essayRetryCount, setEssayRetryCount] = useState(0);
  const [firstEssayAnswer, setFirstEssayAnswer] = useState('');

  useEffect(() => {
    void loadProgress();
    void loadLessons();
    void loadApiKey();
    void loadSavedArticles();
  }, []);

  async function loadSavedArticles() {
    try {
      const { getSavedArticles } = await import('@/lib/article-storage');
      const saved = await getSavedArticles();
      setSavedArticleIds(new Set(saved.map(a => a.id)));
    } catch (err) {
      console.error('저장된 기사 로드 실패:', err);
    }
  }

  async function loadApiKey() {
    try {
      const key = await AsyncStorage.getItem('gemini-api-key');
      if (key) setApiKey(key);
    } catch (err) {
      console.error('Failed to load API key:', err);
    }
  }

  async function toggleSaveArticle(articleId: string, title: string, category: string) {
    try {
      const { saveArticle, unsaveArticle } = await import('@/lib/article-storage');
      const isSaved = savedArticleIds.has(articleId);
      
      if (isSaved) {
        await unsaveArticle(articleId);
        setSavedArticleIds(prev => {
          const next = new Set(prev);
          next.delete(articleId);
          return next;
        });
      } else {
        await saveArticle(articleId, title, category);
        setSavedArticleIds(prev => new Set(prev).add(articleId));
      }
    } catch (err) {
      console.error('기사 저장 실패:', err);
    }
  }

  async function loadProgress() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  }

  async function saveProgress(newProgress: ProgressState) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  }

  async function loadLessons() {
    try {
      const { getLessons } = await import('@/lib/finstudy-data');
      const loaded = await getLessons();
      if (loaded.length > 0) {
        setAllLessons(loaded);
        setSelectedLesson(loaded[0]);
      }
    } catch (err) {
      console.error('Failed to load lessons:', err);
    }
  }

  const currentQuestion = selectedLesson.quiz[quizIndex];
  const isQuizComplete = quizIndex === selectedLesson.quiz.length - 1;

  function handleAnswer(index: number) {
    if (selectedAnswer !== null) return;

    const isCorrect = index === currentQuestion.answer;

    setSelectedAnswer(index);

    if (isCorrect) {
      haptic.success();
      const newProgress = { ...progress };
      newProgress.totalXP += 10;
      newProgress.streak += 1;
      saveProgress(newProgress);
    } else {
      haptic.error();
      const wrongAnswer: WrongAnswer = {
        id: currentQuestion.id,
        question: currentQuestion.question,
        userAnswer: index,
        correctAnswer: currentQuestion.answer || 0,
        explanation: currentQuestion.explanation,
        difficulty: currentQuestion.difficulty as 'easy' | 'medium' | 'hard',
      };
      addWrongAnswer(wrongAnswer);
    }
  }

  function moveNext() {
    if (isQuizComplete) {
      setShowDoneModal(true);
      setMode('home');
    } else {
      setQuizIndex(quizIndex + 1);
      setSelectedAnswer(null);
      setEssayAnswer('');
      setShowSocraticQuiz(false);
      setShowEssayAnalysis(false);
      setEssayAnalysis(null);
      setEssayRetryCount(0);
    }
  }

  function handleRetryEssayAnswer(newAnswer: string) {
    if (!essayAnalysis || !dynamicSocraticQuestion) return;

    setIsAnalyzingEssay(true);
    setEssayRetryCount(1);

    reanalyzeEssayAnswer(
      apiKey,
      firstEssayAnswer,
      newAnswer,
      dynamicSocraticQuestion,
      selectedLesson
    )
      .then(result => {
        setEssayAnalysis(result.analysis);
        setEssayFollowUpQuestion(result.followUpQuestion);
      })
      .catch(error => {
        console.error('재답변 분석 실패:', error);
      })
      .finally(() => {
        setIsAnalyzingEssay(false);
      });
  }

  function handleCloseEssayAnalysis() {
    // 서술형 답안 분석 완료 후 다음 문제로 이동
    const { xpEarned } = recordEssayAnalysis(essayAnalysis!, currentQuestion.id, essayAnswer);
    const newProgress = { ...progress };
    newProgress.totalXP += xpEarned;
    saveProgress(newProgress);

    setShowEssayAnalysis(false);
    moveNext();
  }

  if (mode === 'detail') {
    return (
      <ScreenContainer>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={() => setMode('home')}>
              <Text className="text-lg font-bold text-primary">← 뒤로</Text>
            </Pressable>
            <Text className="text-lg font-bold text-foreground">{selectedLesson.title}</Text>
            <Pressable onPress={() => toggleSaveArticle(selectedLesson.id, selectedLesson.title, selectedLesson.category)}>
              <Text className="text-lg">{savedArticleIds.has(selectedLesson.id) ? '❤️' : '🤍'}</Text>
            </Pressable>
          </View>

          <ScrollView>
            <View className="gap-4">
              <Text className="text-base text-muted leading-relaxed">{selectedLesson.content}</Text>
              <Pressable
                onPress={() => setMode('quiz')}
                className="bg-primary rounded-lg py-3"
              >
                <Text className="text-center font-bold text-white">📝 퀴즈 시작</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </ScreenContainer>
    );
  }

  if (mode === 'review') {
    return <ReviewScreen onBack={() => setMode('home')} />;
  }

  if (mode === 'quiz') {
    return (
      <ScreenContainer>
        <ScrollView className="flex-1">
          <View className="gap-4 pb-8">
            <View className="flex-row justify-between items-center">
              <Pressable onPress={() => setShowExitModal(true)}>
                <Text className="text-lg font-bold text-primary">← 나가기</Text>
              </Pressable>
              <Text className="text-sm font-semibold text-primary">
                {quizIndex + 1} / {selectedLesson.quiz.length}
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-[#E8F5E9] mb-6">
              <View
                style={{ width: `${((quizIndex + 1) / selectedLesson.quiz.length) * 100}%` }}
                className="h-full rounded-full bg-primary"
              />
            </View>
            <Text className="text-[16px] font-bold leading-6 text-foreground mb-6 flex-wrap" numberOfLines={3}>
              {currentQuestion.question.length > 80 
                ? currentQuestion.question.substring(0, 80) + '...' 
                : currentQuestion.question}
            </Text>
            <View className="gap-3 mb-6">
              {currentQuestion.type === 'essay' ? (
                <View className="p-4 rounded-lg bg-blue-50 border border-blue-300 gap-3">
                  <Text className="text-sm text-blue-700 font-semibold mb-2">서술형 답안 입력</Text>
                  <TextInput
                    className="bg-white border border-blue-200 rounded-lg p-3 text-base"
                    placeholder="답안을 입력하세요"
                    multiline
                    numberOfLines={4}
                    editable={selectedAnswer === null}
                    value={essayAnswer}
                    onChangeText={setEssayAnswer}
                  />
                  <Text className="text-xs text-blue-600">{essayAnswer.length}자</Text>
                  <Pressable
                    onPress={async () => {
                      if (essayAnswer.trim()) {
                        setSelectedAnswer(0);
                        setIsAnalyzingEssay(true);
                        setFirstEssayAnswer(essayAnswer);
                        try {
                          if (apiKey) {
                            const dynamicQuestion = createDynamicSocraticQuestion(selectedLesson, currentQuestion);
                            const result = await analyzeEssayAnswer(
                              apiKey,
                              essayAnswer,
                              dynamicQuestion,
                              selectedLesson
                            );
                            setEssayAnalysis(result.analysis);
                            setEssayFollowUpQuestion(result.followUpQuestion);
                            setEssayRetryCount(0);
                            setDynamicSocraticQuestion(dynamicQuestion);
                            setShowEssayAnalysis(true);
                          } else {
                            const dynamicQuestion = createDynamicSocraticQuestion(selectedLesson, currentQuestion);
                            setDynamicSocraticQuestion(dynamicQuestion);
                            setShowSocraticQuiz(true);
                          }
                        } catch (error) {
                          console.error('답안 분석 실패:', error);
                          const dynamicQuestion = createDynamicSocraticQuestion(selectedLesson, currentQuestion);
                          setDynamicSocraticQuestion(dynamicQuestion);
                          setShowSocraticQuiz(true);
                        } finally {
                          setIsAnalyzingEssay(false);
                        }
                      }
                    }}
                    disabled={!essayAnswer.trim() || selectedAnswer !== null || isAnalyzingEssay}
                    style={({ pressed }) => [{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: essayAnswer.trim() && selectedAnswer === null && !isAnalyzingEssay ? '#0DFA64' : '#ccc',
                      opacity: pressed ? 0.85 : 1,
                    }]}
                  >
                    <Text className="text-center font-semibold text-white">{isAnalyzingEssay ? '분석 중...' : '✓ 답안 제출'}</Text>
                  </Pressable>
                </View>
              ) : currentQuestion.choices?.map((choice, index) => {
                const isCorrect = index === currentQuestion.answer;
                const isSelected = index === selectedAnswer;
                const showResult = selectedAnswer !== null;

                return (
                  <Pressable
                    key={index}
                    onPress={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    style={({ pressed }) => [
                      styles.answerButton,
                      {
                        backgroundColor: showResult
                          ? isCorrect
                            ? '#4CAF50'
                            : isSelected
                              ? '#F44336'
                              : answerSurfaces[index]
                          : answerSurfaces[index],
                        borderColor: showResult
                          ? isCorrect
                            ? '#4CAF50'
                            : isSelected
                              ? '#F44336'
                              : answerColors[index]
                          : answerColors[index],
                        opacity: pressed && !showResult ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: showResult
                          ? isCorrect || isSelected
                            ? '#fff'
                            : answerColors[index]
                          : answerColors[index],
                      }}
                      className="font-bold text-base"
                    >
                      {String.fromCharCode(65 + index)}. {choice}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedAnswer !== null && currentQuestion.type !== 'essay' && (
              <View className="mb-6 gap-4">
                <View className={`rounded-[16px] p-4 ${
                  selectedAnswer === currentQuestion.answer
                    ? 'bg-green-50 border border-green-300'
                    : 'bg-red-50 border border-red-300'
                }`}>
                  <Text className={`text-lg font-bold ${
                    selectedAnswer === currentQuestion.answer
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}>
                    {selectedAnswer === currentQuestion.answer
                      ? '✅ 정답입니다!'
                      : '❌ 오답입니다!'}
                  </Text>
                </View>

                <View className="rounded-[16px] bg-slate-50 border border-slate-200 p-4 gap-3">
                  <Text className="text-sm font-semibold text-foreground">📋 정답 확인</Text>
                  <View className="gap-2">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm text-muted">당신의 답:</Text>
                      <View className="flex-1 rounded-lg bg-white px-3 py-2 border border-slate-300">
                        <Text className="text-sm font-semibold text-foreground">
                          {`${String.fromCharCode(65 + selectedAnswer)}. ${currentQuestion.choices?.[selectedAnswer]}`}
                        </Text>
                      </View>
                    </View>
                    {selectedAnswer !== currentQuestion.answer && (
                      <View className="flex-row items-center gap-2">
                        <Text className="text-sm text-muted">정답:</Text>
                        <View className="flex-1 rounded-lg bg-green-50 px-3 py-2 border border-green-300">
                          <Text className="text-sm font-semibold text-green-700">
                            {`${String.fromCharCode(65 + (currentQuestion.answer || 0))}. ${currentQuestion.choices?.[currentQuestion.answer || 0]}`}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                <PremiumExplanation
                  text={currentQuestion.explanation}
                  isPremium={true}
                  onReveal={() => {
                    if (Platform.OS !== 'web') {
                      haptic.success();
                    }
                  }}
                />

                {currentQuestion.difficulty && isSocraticQuizApplicable(currentQuestion.difficulty) && (
                  <Pressable
                    onPress={() => setShowSocraticQuiz(true)}
                    style={({ pressed }) => [{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: '#A8D5BA',
                      opacity: pressed ? 0.85 : 1,
                    }]}
                  >
                    <Text className="text-center font-semibold text-white">💭 소크라테스식 문답법으로 심화 학습</Text>
                  </Pressable>
                )}
              </View>
            )}

            {selectedAnswer !== null && (
              <Pressable onPress={moveNext} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressedButton]}>
                <Text className="text-center text-base font-bold text-white">
                  {isQuizComplete ? '✅ 완료' : '→ 다음 문제'}
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (!isLoaded) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted">로딩 중...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        <View className="gap-6 pb-8">
          <View className="flex-row justify-between items-center">
            <Text className="text-3xl font-bold text-foreground">📚 FinStudy</Text>
            <Pressable onPress={() => setMode('review')}>
              <Text className="text-lg">📊</Text>
            </Pressable>
          </View>

          <View className="bg-primary rounded-lg p-4 gap-2">
            <Text className="text-white text-sm">오늘의 학습</Text>
            <Text className="text-white text-2xl font-bold">{progress.totalXP} XP</Text>
            <Text className="text-white text-xs">🔥 {progress.streak}일 연속</Text>
          </View>

          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">📖 학습 모듈</Text>
            {allLessons.map((lesson, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setSelectedLesson(lesson);
                  setQuizIndex(0);
                  setSelectedAnswer(null);
                  setEssayAnswer('');
                  setMode('detail');
                }}
                className="bg-surface rounded-lg p-4 border border-border"
              >
                <Text className="font-bold text-foreground">{lesson.title}</Text>
                <Text className="text-sm text-muted mt-1">{lesson.summary.substring(0, 60)}...</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showDoneModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-lg p-6 w-4/5 gap-4">
            <Text className="text-2xl font-bold text-center text-foreground">🎉 완료!</Text>
            <Text className="text-center text-muted">모든 문제를 풀었습니다.</Text>
            <Pressable
              onPress={() => setShowDoneModal(false)}
              className="bg-primary rounded-lg py-3"
            >
              <Text className="text-center font-bold text-white">확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showExitModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-lg p-6 w-4/5 gap-4">
            <Text className="text-lg font-bold text-foreground">퀴즈를 나가시겠습니까?</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setShowExitModal(false)}
                className="flex-1 bg-slate-200 rounded-lg py-2"
              >
                <Text className="text-center font-bold text-foreground">계속하기</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowExitModal(false);
                  setMode('home');
                  setQuizIndex(0);
                  setSelectedAnswer(null);
                  setEssayAnswer('');
                }}
                className="flex-1 bg-red-500 rounded-lg py-2"
              >
                <Text className="text-center font-bold text-white">나가기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {showEssayAnalysis && (
        <EssayAnalysisModal
          visible={showEssayAnalysis}
          analysis={essayAnalysis}
          followUpQuestion={essayFollowUpQuestion}
          userAnswer={essayAnswer}
          onRetryAnswer={handleRetryEssayAnswer}
          onClose={handleCloseEssayAnalysis}
          isLoading={isAnalyzingEssay}
          allowRetry={essayRetryCount === 0}
          retryCount={essayRetryCount}
        />
      )}

      {showSocraticQuiz && currentQuestion.difficulty && dynamicSocraticQuestion && (
        <SocraticQuiz
          question={dynamicSocraticQuestion}
          userAnswer={essayAnswer}
          onClose={() => {
            setShowSocraticQuiz(false);
            moveNext();
          }}
        />
      )}

      {showSocraticQuiz && currentQuestion.difficulty && !dynamicSocraticQuestion && (
        <Modal visible={showSocraticQuiz} animationType="slide" transparent={false}>
          <ScreenContainer>
            <View className="flex-1 items-center justify-center">
              <Text className="text-lg text-muted">소크라테스식 질문을 불러오는 중...</Text>
            </View>
          </ScreenContainer>
        </Modal>
      )}

      {showTermModal && selectedTerm && (
        <TermDetailModal
          visible={showTermModal}
          term={selectedTerm}
          onClose={() => setShowTermModal(false)}
        />
      )}

      {showAskModal && (
        <AskQuestionModal
          visible={showAskModal}
          articleTitle={selectedLesson.title}
          onClose={() => setShowAskModal(false)}
          onSubmit={async (question) => {
            try {
              const response = await askQuestionAboutArticle(apiKey, selectedLesson, question);
              console.log('답변:', response);
            } catch (err) {
              console.error('질문 전송 실패:', err);
            }
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  answerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0A7EA4',
  },
  pressedButton: {
    opacity: 0.85,
  },
});
