/**
 * 망각곡선(Ebbinghaus Forgetting Curve) 기반 Spaced Repetition 시스템
 * 사용자의 오답을 추적하고 최적의 복습 시간을 계산합니다.
 */

export interface WrongAnswer {
  id: string; // 고유 ID (articleId-quizIndex)
  articleId: string;
  articleTitle: string;
  quizIndex: number;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  firstAttemptDate: number; // timestamp
  lastReviewDate: number; // timestamp
  reviewCount: number; // 복습 횟수
  correctOnReview: boolean; // 복습 시 정답 여부
  nextReviewDate: number; // 다음 복습 예정일 (timestamp)
  interval: number; // 복습 간격 (일)
  easeFactor: number; // SM-2 알고리즘의 난이도 계수 (1.3 ~ 2.5)
}

export interface ReviewStats {
  totalWrongAnswers: number;
  dueForReview: WrongAnswer[];
  reviewedToday: number;
  correctOnReview: number;
  accuracy: number; // 복습 시 정답률
}

/**
 * 다음 복습 날짜 계산 (SM-2 알고리즘 기반)
 * https://en.wikipedia.org/wiki/SuperMemo#SM-2_algorithm
 */
function calculateNextReview(
  wrongAnswer: WrongAnswer,
  isCorrectOnReview: boolean
): { nextDate: number; newInterval: number; newEaseFactor: number } {
  let newEaseFactor = wrongAnswer.easeFactor;
  let newInterval = 1;

  if (isCorrectOnReview) {
    // 정답한 경우
    if (wrongAnswer.reviewCount === 0) {
      newInterval = 1; // 첫 복습 후 1일
    } else if (wrongAnswer.reviewCount === 1) {
      newInterval = 3; // 두 번째 복습 후 3일
    } else {
      newInterval = Math.round(wrongAnswer.interval * newEaseFactor);
    }

    // EaseFactor 증가 (최대 2.5)
    newEaseFactor = Math.min(2.5, wrongAnswer.easeFactor + 0.1);
  } else {
    // 오답한 경우
    newInterval = 1; // 1일 후 다시
    // EaseFactor 감소 (최소 1.3)
    newEaseFactor = Math.max(1.3, wrongAnswer.easeFactor - 0.2);
  }

  const nextDate = Date.now() + newInterval * 24 * 60 * 60 * 1000;

  return { nextDate, newInterval, newEaseFactor };
}

/**
 * 오답 기록 추가
 */
export function addWrongAnswer(
  articleId: string,
  articleTitle: string,
  quizIndex: number,
  question: string,
  userAnswer: number,
  correctAnswer: number,
  explanation: string,
  difficulty: 'easy' | 'medium' | 'hard'
): WrongAnswer {
  const now = Date.now();
  const { nextDate } = calculateNextReview(
    {
      id: `${articleId}-${quizIndex}`,
      articleId,
      articleTitle,
      quizIndex,
      question,
      userAnswer,
      correctAnswer,
      explanation,
      difficulty,
      firstAttemptDate: now,
      lastReviewDate: now,
      reviewCount: 0,
      correctOnReview: false,
      nextReviewDate: now + 1 * 24 * 60 * 60 * 1000, // 1일 후
      interval: 1,
      easeFactor: 2.5,
    },
    false
  );

  return {
    id: `${articleId}-${quizIndex}`,
    articleId,
    articleTitle,
    quizIndex,
    question,
    userAnswer,
    correctAnswer,
    explanation,
    difficulty,
    firstAttemptDate: now,
    lastReviewDate: now,
    reviewCount: 0,
    correctOnReview: false,
    nextReviewDate: nextDate,
    interval: 1,
    easeFactor: 2.5,
  };
}

/**
 * 복습 결과 업데이트
 */
export function updateWrongAnswerReview(
  wrongAnswer: WrongAnswer,
  isCorrect: boolean
): WrongAnswer {
  const { nextDate, newInterval, newEaseFactor } = calculateNextReview(wrongAnswer, isCorrect);

  return {
    ...wrongAnswer,
    lastReviewDate: Date.now(),
    reviewCount: wrongAnswer.reviewCount + 1,
    correctOnReview: isCorrect,
    nextReviewDate: nextDate,
    interval: newInterval,
    easeFactor: newEaseFactor,
  };
}

/**
 * 복습 대상 문제 필터링
 */
export function getReviewDue(wrongAnswers: WrongAnswer[]): WrongAnswer[] {
  const now = Date.now();
  return wrongAnswers.filter((wa) => wa.nextReviewDate <= now).sort((a, b) => {
    // 난이도 높은 것부터, 정답률 낮은 것부터
    const difficultyOrder = { hard: 0, medium: 1, easy: 2 };
    if (difficultyOrder[a.difficulty] !== difficultyOrder[b.difficulty]) {
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    }
    // 복습 횟수 적은 것부터
    return a.reviewCount - b.reviewCount;
  });
}

/**
 * 복습 통계 계산
 */
export function calculateReviewStats(wrongAnswers: WrongAnswer[]): ReviewStats {
  const dueForReview = getReviewDue(wrongAnswers);
  const reviewedToday = wrongAnswers.filter((wa) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReview = new Date(wa.lastReviewDate);
    lastReview.setHours(0, 0, 0, 0);
    return lastReview.getTime() === today.getTime() && wa.reviewCount > 0;
  }).length;

  const correctOnReview = wrongAnswers.filter((wa) => wa.correctOnReview && wa.reviewCount > 0).length;
  const reviewedCount = wrongAnswers.filter((wa) => wa.reviewCount > 0).length;
  const accuracy = reviewedCount > 0 ? Math.round((correctOnReview / reviewedCount) * 100) : 0;

  return {
    totalWrongAnswers: wrongAnswers.length,
    dueForReview,
    reviewedToday,
    correctOnReview,
    accuracy,
  };
}

/**
 * 우선순위 높은 복습 문제 선별
 * (정답율 낮고, 핵심 용어가 많은 문제)
 */
export function selectPriorityReviewQuestions(
  wrongAnswers: WrongAnswer[],
  count: number = 5
): WrongAnswer[] {
  const dueForReview = getReviewDue(wrongAnswers);

  // 난이도별 점수
  const difficultyScore = { hard: 3, medium: 2, easy: 1 };

  // 복습 횟수가 적을수록 높은 점수
  const reviewScore = (wa: WrongAnswer) => Math.max(0, 5 - wa.reviewCount);

  // 정답 여부 (오답일수록 높은 점수)
  const correctScore = (wa: WrongAnswer) => (wa.correctOnReview ? 0 : 2);

  // 종합 점수 계산
  const scored = dueForReview.map((wa) => ({
    ...wa,
    score:
      difficultyScore[wa.difficulty] * 3 +
      reviewScore(wa) * 2 +
      correctScore(wa) * 1,
  }));

  // 점수 높은 순으로 정렬
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ score, ...wa }) => wa);
}
