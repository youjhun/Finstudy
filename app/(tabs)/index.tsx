import { useEffect, useMemo, useState } from 'react';
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
import { EssayFeedbackModal } from '@/components/essay-feedback-modal';
import { isSocraticQuizApplicable, getSocraticQuestionById } from '@/lib/socratic-quiz-system';
import { EssayAnalysisModal } from '@/components/essay-analysis-modal';
import { analyzeEssayAnswer, generateFinalFeedback, type EssayAnalysisResult } from '@/lib/essay-analysis-handler';
import type { SocraticResponse } from '@/lib/socratic-quiz-system';
import { createDynamicSocraticQuestion, generateDynamicSocraticAnalysisPrompt } from '@/lib/dynamic-socratic-question';
import { generateEssayFeedback, type EssayFeedback } from '@/lib/essay-feedback-handler';
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
  const [showEssayFeedback, setShowEssayFeedback] = useState(false);
  const [essayFeedback, setEssayFeedback] = useState<EssayFeedback | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [showEssayAnalysis, setShowEssayAnalysis] = useState(false);
  const [essayAnalysis, setEssayAnalysis] = useState<EssayAnalysisResult | null>(null);
  const [isAnalyzingEssayAnswer, setIsAnalyzingEssayAnswer] = useState(false);
  const [isFinalAnalyzing, setIsFinalAnalyzing] = useState(false);
  const [finalEssayFeedback, setFinalEssayFeedback] = useState<EssayAnalysisResult | null>(null);
  const [showFinalFeedback, setShowFinalFeedback] = useState(false);
  const [essaySecondAnswer, setEssaySecondAnswer] = useState<string>('');
  const [essayContext, setEssayContext] = useState<{
    question: string;
    articleContent: string;
    firstAnswer: string;
  } | null>(null);

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
      console.error('기사 저장 토글 실패:', err);
    }
  }

  function handleTermPress(term: string) {
    const economicTerm = searchTerm(term);
    if (economicTerm) {
      setSelectedTerm(economicTerm);
      setShowTermModal(true);
    }
  }

  async function handleAskQuestion(question: string): Promise<string> {
    if (!apiKey) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }
    return askQuestionAboutArticle(
      question,
      selectedLesson.title,
      selectedLesson.summary,
      apiKey
    );
  }

  const accuracy = useMemo(() => {
    if (!progress.solvedAnswers) return 0;
    return Math.round((progress.correctAnswers / progress.solvedAnswers) * 100);
  }, [progress.correctAnswers, progress.solvedAnswers]);

  const currentQuestion = selectedLesson.quiz[quizIndex];
  const isQuizComplete = quizIndex >= selectedLesson.quiz.length - 1;

  async function loadProgress() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProgressState;
        setProgress(parsed);
      }
    } catch (error) {
      console.error('Progress load error:', error);
    } finally {
      setIsLoaded(true);
    }
  }

  async function loadLessons() {
    try {
      const customArticles = await AsyncStorage.getItem('custom-articles');
      if (customArticles) {
        const parsed = JSON.parse(customArticles) as ArticleLesson[];
        setAllLessons([...lessons, ...parsed]);
      }
    } catch (error) {
      console.error('Lessons load error:', error);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await loadLessons();
    } finally {
      setIsRefreshing(false);
    }
  }

  async function persistProgress(next: ProgressState) {
    setProgress(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function openLesson(lesson: ArticleLesson) {
    haptic.light();
    setSelectedLesson(lesson);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setMode('detail');
  }

  function startQuiz() {
    haptic.medium();
    setQuizIndex(0);
    setSelectedAnswer(null);
    setEssayAnswer('');
    setMode('quiz');
  }

  async function handleAnswer(index: number) {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const isCorrect = index === currentQuestion.answer;

    const nextProgress: ProgressState = {
      ...progress,
      solvedAnswers: progress.solvedAnswers + 1,
      correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
      reviewQueue: isCorrect
        ? progress.reviewQueue
        : Array.from(new Set([selectedLesson.title, ...progress.reviewQueue])).slice(0, 4),
    };

    await persistProgress(nextProgress);
    
    if (!isCorrect) {
      try {
        const wrongAnswerRecord = addWrongAnswer(
          selectedLesson.id,
          selectedLesson.title,
          quizIndex,
          currentQuestion.question,
          index,
          currentQuestion.answer || 0,
          currentQuestion.explanation,
          currentQuestion.difficulty as 'easy' | 'medium' | 'hard'
        );
        
        const WRONG_ANSWERS_KEY = 'finstudy-wrong-answers-v1';
        const existingWrongAnswers = await AsyncStorage.getItem(WRONG_ANSWERS_KEY);
        const wrongAnswers = existingWrongAnswers ? JSON.parse(existingWrongAnswers) : [];
        const updatedWrongAnswers = [
          ...wrongAnswers.filter((wa: WrongAnswer) => wa.id !== wrongAnswerRecord.id),
          wrongAnswerRecord
        ];
        await AsyncStorage.setItem(WRONG_ANSWERS_KEY, JSON.stringify(updatedWrongAnswers));
      } catch (err) {
        console.error('오답 저장 실패:', err);
      }
    }
    
    if (isCorrect) {
      haptic.success();
    } else {
      haptic.error();
    }
  }

  async function moveNext() {
    if (selectedAnswer === null) return;

    if (!isQuizComplete) {
      haptic.light();
      setQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setEssayAnswer('');
      return;
    }

    const alreadyCompleted = progress.completedLessonIds.includes(selectedLesson.id);
    const completedLessonIds = alreadyCompleted
      ? progress.completedLessonIds
      : [...progress.completedLessonIds, selectedLesson.id];

    const nextProgress: ProgressState = {
      ...progress,
      xp: progress.xp + (alreadyCompleted ? 10 : 35),
      streak: alreadyCompleted ? progress.streak : progress.streak + 1,
      completedLessonIds,
    };

    await persistProgress(nextProgress);
    haptic.success();
    setShowDoneModal(true);
    
    // 추가 질문 모달 띄우기 (1.5초 후)
    setTimeout(() => {
      setShowAskModal(true);
    }, 1500);
    setMode('home');
    setQuizIndex(0);
    setSelectedAnswer(null);
    setEssayAnswer('');
  }

  function renderHeader() {
    return (
      <View className="rounded-[28px] bg-surface px-5 py-5 border border-border">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[26px] font-bold text-foreground">📚 FinStudy</Text>
            <Text className="mt-2 text-sm text-muted">경제 기사를 짧게 읽고 바로 이해도를 점검하세요.</Text>
          </View>
              <View className="rounded-full bg-primary px-4 py-2">
                <Text className="text-sm font-semibold text-white">⭐ {progress.xp}</Text>
              </View>
        </View>
      </View>
    );
  }

  function renderStatusCards() {
    return (
      <View className="flex-row gap-3">
        <View className="flex-1 rounded-[22px] bg-surface p-5 border border-border">
          <Text className="text-2xl mb-2">🔥</Text>
          <Text className="text-xs font-semibold text-muted">연속 학습</Text>
          <Text className="mt-3 text-2xl font-bold text-foreground">{progress.streak}일</Text>
          <Text className="mt-2 text-xs text-muted">하루 1개 기사만 완료해도 유지됩니다.</Text>
        </View>
        <View className="flex-1 rounded-[22px] bg-surface p-5 border border-border">
          <Text className="text-2xl mb-2">📊</Text>
          <Text className="text-xs font-semibold text-muted">정답률</Text>
          <Text className="mt-3 text-2xl font-bold text-foreground">{accuracy}%</Text>
          <Text className="mt-2 text-xs text-muted">지금까지 푼 문항 {progress.solvedAnswers}개</Text>
        </View>
      </View>
    );
  }

  function renderLessonList() {
    const categories = ['all', ...new Set(allLessons.map(l => l.category))];
    const filteredLessons = selectedCategory === 'all' 
      ? allLessons 
      : allLessons.filter(l => l.category === selectedCategory);

    return (
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-foreground">📖 오늘의 기사</Text>
          <Pressable
            onPress={handleRefresh}
            disabled={isRefreshing}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Text className="text-xl">{isRefreshing ? '🔄' : '🔄'}</Text>
          </Pressable>
        </View>
        
        {/* 카테고리 필터 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={({ pressed }) => [{
                backgroundColor: selectedCategory === cat ? '#0a7ea4' : '#f5f5f5',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Text className={`text-xs font-semibold ${
                selectedCategory === cat ? 'text-white' : 'text-foreground'
              }`}>
                {cat === 'all' ? '전체' : cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredLessons.map((lesson, index) => {
          const completed = progress.completedLessonIds.includes(lesson.id);
          return (
            <Pressable
              key={lesson.id}
              onPress={() => openLesson(lesson)}
              style={({ pressed }) => [styles.cardPressable, pressed && styles.pressedCard]}
            >
              <View className="rounded-[24px] border border-border bg-surface p-5">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-xs font-semibold text-muted">📰 {lesson.category}</Text>
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      onPress={() => toggleSaveArticle(lesson.id, lesson.title, lesson.category)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Text className="text-lg">{savedArticleIds.has(lesson.id) ? '🔖' : '🔗'}</Text>
                    </Pressable>
                    <View className="rounded-full bg-[#E8F5E9] px-3 py-1">
                      <Text className="text-xs font-semibold text-[#2E7D32]">
                        {completed ? '✅ 완료됨' : `${allLessons.indexOf(lesson) + 1}번째 추천`}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text className="text-[18px] font-bold leading-7 text-foreground">{lesson.title}</Text>
                <Text className="mt-3 text-[15px] leading-7 text-muted">{lesson.summary}</Text>
                <View className="mt-4 flex-row items-center justify-between">
                  <Text className="text-sm text-muted">⏱️ {lesson.source} · {lesson.readTime}</Text>
                  <Text className="text-sm font-semibold text-primary">→ 학습 시작</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
        
        <Pressable
          onPress={() => setMode('review')}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <View className="rounded-[24px] border-2 border-primary bg-[#E8F5E9] p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-primary">📚 오늘의 기사 리뷰</Text>
                <Text className="text-sm text-primary mt-1">망각곡선 기반 오답 복습</Text>
              </View>
              <Text className="text-2xl">→</Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  }

  function renderReviewView() {
    return (
      <ReviewScreen
        onBack={() => setMode('home')}
        onReviewQuestion={(wrongAnswer: WrongAnswer) => {
          // 복습 문제 풀기 모드로 전환
          console.log('Review question:', wrongAnswer);
        }}
      />
    );
  }

  function renderDetailView() {
    return (
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        <Pressable onPress={() => setMode('home')} style={({ pressed }) => [styles.backButton, pressed && styles.pressedButton]}>
          <Text className="text-sm font-semibold text-primary">← 오늘의 기사로 돌아가기</Text>
        </Pressable>
        <View className="rounded-[28px] bg-surface p-6 border border-border">
          <Text className="text-xs font-semibold text-muted">📰 {selectedLesson.category}</Text>
          <Text className="mt-4 text-[22px] font-bold leading-8 text-foreground">{selectedLesson.title}</Text>
          <Text className="mt-5 text-[16px] leading-8 text-muted">{selectedLesson.summary}</Text>
          <View className="mt-6 gap-3">
            <Text className="text-sm font-semibold text-muted">💡 핵심 포인트</Text>
            {selectedLesson.keyPoints.map((point) => (
              <View key={point} className="rounded-[18px] bg-[#E8F5E9] px-4 py-4">
                <Text className="text-[15px] leading-7 text-foreground">• {point}</Text>
              </View>
            ))}
          </View>
          <View className="mt-6">
            <Text className="text-sm font-semibold text-muted mb-3">🏷️ 경제 용어</Text>
            <View className="flex-row flex-wrap gap-2">
              {selectedLesson.terms.map((term) => (
                <Pressable
                  key={term}
                  onPress={() => {
                    const termData = searchTerm(term);
                    if (termData) {
                      setSelectedTerm(termData);
                      setShowTermModal(true);
                    }
                  }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View className="rounded-full bg-[#E8F5E9] px-3 py-2">
                    <Text className="text-xs font-semibold text-primary">{term}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable onPress={startQuiz} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressedButton]}>
            <Text className="text-center text-base font-bold text-white">❓ 이 기사로 퀴즈 시작</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  function renderQuizView() {
    return (
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        <Pressable onPress={() => setShowExitModal(true)} style={({ pressed }) => [styles.backButton, pressed && styles.pressedButton]}>
          <Text className="text-sm font-semibold text-primary">← 학습 종료</Text>
        </Pressable>
        <View className="rounded-[28px] bg-surface p-8 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <Text className="text-sm font-semibold text-muted">📝 {selectedLesson.title}</Text>
              <View className={`px-2.5 py-1 rounded-full ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-100' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-100' :
                'bg-red-100'
              }`}>
                <Text className={`text-xs font-bold ${
                  currentQuestion.difficulty === 'easy' ? 'text-green-700' :
                  currentQuestion.difficulty === 'medium' ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  {currentQuestion.difficulty === 'easy' ? '초' :
                   currentQuestion.difficulty === 'medium' ? '중' :
                   '상'}
                </Text>
              </View>
            </View>
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
                      if (apiKey) {
                        console.log('[Essay] Starting analysis...');
                        setIsAnalyzingEssayAnswer(true);
                        setShowEssayAnalysis(true);
                        setEssayContext({
                          question: currentQuestion.question,
                          articleContent: selectedLesson.summary,
                          firstAnswer: essayAnswer,
                        });
                        try {
                          console.log('[Essay] Calling analyzeEssayAnswer');
                          const analysis = await analyzeEssayAnswer(
                            currentQuestion.question,
                            essayAnswer,
                            selectedLesson.summary,
                            apiKey
                          );
                          console.log('[Essay] Analysis result:', analysis);
                          setEssayAnalysis(analysis);
                        } catch (error) {
                          console.error('[Essay] Error:', error);
                          console.error('[Essay] Error details:', error instanceof Error ? error.stack : 'No stack');
                          setEssayAnalysis(null);
                        } finally {
                          setIsAnalyzingEssayAnswer(false);
                        }
                      } else {
                        console.warn('[Essay] No API key');
                        alert('API 키가 없습니다');
                        setSelectedAnswer(null);
                      }
                    }
                  }}
                  disabled={!essayAnswer.trim() || selectedAnswer !== null || isAnalyzingEssayAnswer}
                  style={({ pressed }) => [{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: essayAnswer.trim() && selectedAnswer === null && !isAnalyzingEssayAnswer ? '#0DFA64' : '#ccc',
                    opacity: pressed ? 0.85 : 1,
                  }]}
                >
                  <Text className="text-center font-semibold text-white">{isAnalyzingEssayAnswer ? '분석 중...' : '✓ 답안 제출'}</Text>
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

              {/* 소크라테스식 문답법 버튼 - 심화 1, 2 문제만 표시 (서술형 제외) */}
              {currentQuestion.difficulty && isSocraticQuizApplicable(currentQuestion.difficulty) && currentQuestion.type === 'multiple-choice' && (
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

          {/* 서술형 피드백 메시지 - 분석 완료 후 표시 */}
          {selectedAnswer !== null && currentQuestion.type === 'essay' && essayAnalysis && (
            <View className="px-4 pb-4 gap-4">
              <View className="rounded-[16px] bg-blue-50 border border-blue-300 p-4 gap-3">
                <Text className="text-sm font-semibold text-blue-700">✅ 답변이 분석되었습니다</Text>
                <Text className="text-sm text-foreground">위의 분석 결과를 참고하여 재답변을 작성해주세요.</Text>
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
            </View>
          )}

          {/* 서술형 피드백 버튼 - 선택사항 */}
          {selectedAnswer !== null && currentQuestion.type === 'essay' && !essayAnalysis && (
            <View className="px-4 pb-4 gap-4">
              <Pressable
                onPress={async () => {
                  if (apiKey && essayAnswer.trim()) {
                    setIsGeneratingFeedback(true);
                    try {
                      const feedback = await generateEssayFeedback(
                        apiKey,
                        essayAnswer,
                        currentQuestion,
                        selectedLesson,
                        true
                      );
                      setEssayFeedback(feedback);
                      setShowEssayFeedback(true);
                    } catch (error) {
                      console.error('피드백 생성 실패:', error);
                      alert('피드백 생성 중 오류가 발생했습니다.');
                    } finally {
                      setIsGeneratingFeedback(false);
                    }
                  }
                }}
                disabled={isGeneratingFeedback || !apiKey}
                style={({ pressed }) => [{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: isGeneratingFeedback || !apiKey ? '#ccc' : '#4A90E2',
                  opacity: pressed ? 0.85 : 1,
                }]}
              >
                <Text className="text-center font-semibold text-white">
                  {isGeneratingFeedback ? '피드백 생성 중...' : '💡 추가 피드백 보기'}
                </Text>
              </Pressable>
            </View>
          )}

          {selectedAnswer !== null && (
            <View className="px-4 pb-4">
              <Pressable onPress={moveNext} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressedButton]}>
                <Text className="text-center text-base font-bold text-white">
                  {isQuizComplete ? '✅ 완료' : '→ 다음 문제'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
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
    <ScreenContainer className="p-0">
      {mode === 'home' && (
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {renderHeader()}
          {renderStatusCards()}
          {renderLessonList()}
        </ScrollView>
      )}
      {mode === 'detail' && renderDetailView()}
      {mode === 'quiz' && renderQuizView()}
      {mode === 'review' && renderReviewView()}

      <Modal visible={showDoneModal} transparent animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text className="text-5xl mb-4">🎉</Text>
            <Text className="text-2xl font-bold text-foreground text-center mb-2">완료했어요!</Text>
            <Text className="text-base text-muted text-center mb-6">
              {progress.xp} XP를 획득했습니다. 계속 학습해보세요!
            </Text>
            <Pressable
              onPress={() => setShowDoneModal(false)}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressedButton]}
            >
              <Text className="text-center text-base font-bold text-white">→ 계속하기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showExitModal} transparent animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text className="text-4xl mb-4">⏳</Text>
            <Text className="text-xl font-bold text-foreground text-center mb-2">정말 학습을 종료하시나요?</Text>
            <Text className="text-sm text-muted text-center mb-6">
              조금만 더 풀면 경험치를 받을 수 있어요!
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowExitModal(false)}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressedButton]}
              >
                <Text className="text-center text-base font-bold text-primary">계속 풀기</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowExitModal(false);
                  setMode('home');
                  setQuizIndex(0);
                  setSelectedAnswer(null);
                  setEssayAnswer('');
                }}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressedButton]}
              >
                <Text className="text-center text-base font-bold text-white">종료하기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <TermDetailModal
        visible={showTermModal}
        term={selectedTerm}
        onClose={() => setShowTermModal(false)}
      />
      <AskQuestionModal
        visible={showAskModal}
        articleTitle={selectedLesson.title}
        onClose={() => setShowAskModal(false)}
        onSubmit={handleAskQuestion}
      />

      {showEssayFeedback && essayFeedback && (
        <EssayFeedbackModal
          visible={showEssayFeedback}
          feedback={essayFeedback}
          onClose={() => setShowEssayFeedback(false)}
          isLoading={isGeneratingFeedback}
        />
      )}

      {showSocraticQuiz && currentQuestion.difficulty && dynamicSocraticQuestion && (
        <Modal visible={showSocraticQuiz} transparent animationType="slide">
          <SocraticQuiz
            question={dynamicSocraticQuestion}
            onComplete={(response) => {
              setSocraticResponse(response);
              setShowSocraticQuiz(false);
            }}
            onClose={() => setShowSocraticQuiz(false)}
          />
        </Modal>
      )}
      {showSocraticQuiz && currentQuestion.difficulty && !dynamicSocraticQuestion && (
        <Modal visible={showSocraticQuiz} transparent animationType="slide">
          <SocraticQuiz
            question={getSocraticQuestionById('socratic_advanced_1_1')!}
            onComplete={(response) => {
              setSocraticResponse(response);
              setShowSocraticQuiz(false);
            }}
            onClose={() => setShowSocraticQuiz(false)}
          />
        </Modal>
      )}

      {/* 서술형 답변 분석 모달 */}
      <EssayAnalysisModal
        visible={showEssayAnalysis}
        question={essayContext?.question || currentQuestion.question}
        articleContent={essayContext?.articleContent || selectedLesson.summary}
        firstAnswer={essayContext?.firstAnswer || essayAnswer}
        analysis={essayAnalysis}
        isLoading={isAnalyzingEssayAnswer}
        secondAnswer={essaySecondAnswer}
        onSecondAnswerChange={setEssaySecondAnswer}
        onSecondAnswerSubmit={async (secondAnswer) => {
          if (!essayContext) {
            console.error('essayContext가 없습니다');
            alert('필수 데이터가 누락되었습니다. 다시 시도해주세요.');
            return;
          }
          setIsFinalAnalyzing(true);
          try {
            const finalFeedback = await generateFinalFeedback(
              essayContext.question,
              essayContext.firstAnswer,
              secondAnswer,
              essayContext.articleContent,
              apiKey
            );
            setFinalEssayFeedback(finalFeedback);
            setShowFinalFeedback(true);
          } catch (error) {
            console.error('최종 피드백 생성 실패:', error);
            alert('최종 피드백 생성 중 오류가 발생했습니다.');
          } finally {
            setIsFinalAnalyzing(false);
          }
        }}
        onClose={() => {
          setShowEssayAnalysis(false);
          setEssayAnalysis(null);
          setEssaySecondAnswer('');
          setEssayContext(null);
        }}
        finalFeedback={finalEssayFeedback}
        isFinalLoading={isFinalAnalyzing}
        showFinal={showFinalFeedback}
        error={essayAnalysis === null && !isAnalyzingEssayAnswer && showEssayAnalysis ? "답변 분석에 실패했습니다. 다시 시도해주세요." : null}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 20,
  },
  cardPressable: {
    overflow: 'hidden',
  },
  pressedCard: {
    opacity: 0.7,
  },
  backButton: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  pressedButton: {
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: '#A8D5BA',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 20,
    borderWidth: 0,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    flex: 1,
  },
  answerButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
