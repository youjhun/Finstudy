import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Problem, Unit } from '@/lib/curriculum-data';

/**
 * 학습 세션 관리자
 * 
 * 책임:
 * 1. 사용자 진행도 추적 (AsyncStorage)
 * 2. SM-2 알고리즘 기반 복습 스케줄 계산
 * 3. Interleaving: 신규 40% + 복습 60% 구성
 * 4. 세션별 문제 순서 결정 (신규 → 복습 → 신규 → 복습 → 복습)
 * 5. XP 및 스트릭 관리
 */

export interface UserProgress {
  userId: string;
  unitId: string;
  completedScreens: string[]; // 완료한 화면 ID
  completedProblems: string[]; // 완료한 문제 ID
  wrongAnswers: Map<string, number>; // 문제 ID → 오답 횟수
  lastSessionDate: number; // 마지막 학습 날짜
  currentStreak: number; // 연속 학습일
  totalXP: number; // 누적 XP
  easeFactors: Map<string, number>; // 문제 ID → SM-2 Ease Factor
  nextReviewDates: Map<string, number>; // 문제 ID → 다음 복습 날짜
  repetitionCounts: Map<string, number>; // 문제 ID → 복습 횟수
}

export interface SessionProblem {
  problem: Problem;
  category: 'new' | 'review'; // 신규 vs 복습
  order: number; // 세션 내 순서
}

export interface LearningSessionState {
  sessionId: string;
  unitId: string;
  problems: SessionProblem[];
  currentProblemIndex: number;
  correctCount: number;
  wrongCount: number;
  startTime: number;
  xpEarned: number;
}

const STORAGE_KEY_PREFIX = 'finstudy-progress-v1';
const SESSION_KEY_PREFIX = 'finstudy-session-v1';

/**
 * SM-2 알고리즘 구현
 * Wozniak, P. A. (1987). "Optimal learning schedules for self-paced learning"
 */
class SM2Algorithm {
  /**
   * 다음 복습 간격 계산
   * @param repetitions 연속 정답 횟수
   * @param easeFactor 난이도 계수 (기본값: 2.5)
   * @returns 다음 복습까지의 일수
   */
  static calculateInterval(repetitions: number, easeFactor: number): number {
    if (repetitions === 1) return 1; // 첫 정답: 1일
    if (repetitions === 2) return 3; // 두 번째 정답: 3일
    return Math.round(
      this.calculateInterval(repetitions - 1, easeFactor) * easeFactor
    );
  }

  /**
   * 난이도 계수(Ease Factor) 업데이트
   * @param currentEaseFactor 현재 Ease Factor
   * @param quality 답변 품질 (0-5)
   * @returns 새로운 Ease Factor
   */
  static updateEaseFactor(
    currentEaseFactor: number,
    quality: number
  ): number {
    const newEaseFactor =
      currentEaseFactor +
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    return Math.max(1.3, newEaseFactor); // 최소값: 1.3
  }

  /**
   * 정답 여부에 따라 SM-2 상태 업데이트
   * @param isCorrect 정답 여부
   * @param currentRepetitions 현재 연속 정답 횟수
   * @param currentEaseFactor 현재 Ease Factor
   * @returns { nextRepetitions, nextEaseFactor, nextInterval }
   */
  static updateState(
    isCorrect: boolean,
    currentRepetitions: number,
    currentEaseFactor: number
  ) {
    if (!isCorrect) {
      // 오답: 반복 횟수 초기화, Ease Factor 감소
      return {
        nextRepetitions: 0,
        nextEaseFactor: this.updateEaseFactor(currentEaseFactor, 1), // 품질 1
        nextInterval: 1, // 다음 날 복습
      };
    }

    // 정답: 반복 횟수 증가, Ease Factor 증가
    const nextRepetitions = currentRepetitions + 1;
    const nextEaseFactor = this.updateEaseFactor(currentEaseFactor, 4); // 품질 4
    const nextInterval = this.calculateInterval(nextRepetitions, nextEaseFactor);

    return {
      nextRepetitions,
      nextEaseFactor,
      nextInterval,
    };
  }
}

/**
 * 학습 세션 관리자
 */
export class LearningSessionManager {
  /**
   * 사용자 진행도 로드
   */
  static async loadProgress(unitId: string): Promise<UserProgress> {
    try {
      const key = `${STORAGE_KEY_PREFIX}:${unitId}`;
      const data = await AsyncStorage.getItem(key);

      if (!data) {
        return this.createEmptyProgress(unitId);
      }

      const parsed = JSON.parse(data);
      return {
        ...parsed,
        wrongAnswers: new Map(parsed.wrongAnswers || []),
        easeFactors: new Map(parsed.easeFactors || []),
        nextReviewDates: new Map(parsed.nextReviewDates || []),
        repetitionCounts: new Map(parsed.repetitionCounts || []),
      };
    } catch (error) {
      console.error('Failed to load progress:', error);
      return this.createEmptyProgress(unitId);
    }
  }

  /**
   * 사용자 진행도 저장
   */
  static async saveProgress(progress: UserProgress): Promise<void> {
    try {
      const key = `${STORAGE_KEY_PREFIX}:${progress.unitId}`;
      const data = {
        ...progress,
        wrongAnswers: Array.from(progress.wrongAnswers.entries()),
        easeFactors: Array.from(progress.easeFactors.entries()),
        nextReviewDates: Array.from(progress.nextReviewDates.entries()),
        repetitionCounts: Array.from(progress.repetitionCounts.entries()),
      };
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  /**
   * 빈 진행도 객체 생성
   */
  private static createEmptyProgress(unitId: string): UserProgress {
    return {
      userId: 'default', // TODO: 실제 사용자 ID로 변경
      unitId,
      completedScreens: [],
      completedProblems: [],
      wrongAnswers: new Map(),
      lastSessionDate: 0,
      currentStreak: 0,
      totalXP: 0,
      easeFactors: new Map(),
      nextReviewDates: new Map(),
      repetitionCounts: new Map(),
    };
  }

  /**
   * 세션용 문제 구성 (Interleaving: 신규 40% + 복습 60%)
   * 
   * 순서: 신규 → 복습 → 신규 → 복습 → 복습
   * 예: 5문제 세션
   *   1. 신규 (40%)
   *   2. 복습 (60%)
   *   3. 신규 (40%)
   *   4. 복습 (60%)
   *   5. 복습 (60%)
   */
  static buildSessionProblems(
    allProblems: Problem[],
    progress: UserProgress,
    sessionSize: number = 5
  ): SessionProblem[] {
    const now = Date.now();

    // 문제 분류
    const newProblems = allProblems.filter(
      (p) => !progress.completedProblems.includes(p.id)
    );
    const reviewProblems = allProblems.filter((p) => {
      const nextReviewDate = progress.nextReviewDates.get(p.id) || 0;
      return nextReviewDate <= now; // 복습 예정 문제
    });

    // Interleaving 비율 계산
    const newCount = Math.ceil(sessionSize * 0.4); // 신규 40%
    const reviewCount = sessionSize - newCount; // 복습 60%

    // 문제 선택
    const selectedNew = newProblems.slice(0, newCount);
    const selectedReview = reviewProblems.slice(0, reviewCount);

    // 순서 결정 (신규 → 복습 → 신규 → 복습 → 복습)
    const sessionProblems: SessionProblem[] = [];
    let newIndex = 0;
    let reviewIndex = 0;

    for (let i = 0; i < sessionSize; i++) {
      // 패턴: 신규 → 복습 → 신규 → 복습 → 복습
      const isNewTurn = i % 3 !== 2; // 0, 1, 3, 4, ... (2번째, 5번째, ... 제외)

      if (isNewTurn && newIndex < selectedNew.length) {
        sessionProblems.push({
          problem: selectedNew[newIndex++],
          category: 'new',
          order: i,
        });
      } else if (reviewIndex < selectedReview.length) {
        sessionProblems.push({
          problem: selectedReview[reviewIndex++],
          category: 'review',
          order: i,
        });
      } else if (newIndex < selectedNew.length) {
        sessionProblems.push({
          problem: selectedNew[newIndex++],
          category: 'new',
          order: i,
        });
      }
    }

    return sessionProblems;
  }

  /**
   * 세션 상태 생성
   */
  static createSession(
    unitId: string,
    problems: SessionProblem[]
  ): LearningSessionState {
    return {
      sessionId: `session-${Date.now()}`,
      unitId,
      problems,
      currentProblemIndex: 0,
      correctCount: 0,
      wrongCount: 0,
      startTime: Date.now(),
      xpEarned: 0,
    };
  }

  /**
   * 문제 답변 처리
   */
  static async handleAnswer(
    session: LearningSessionState,
    progress: UserProgress,
    isCorrect: boolean
  ): Promise<{ session: LearningSessionState; progress: UserProgress }> {
    const currentSessionProblem = session.problems[session.currentProblemIndex];
    const problem = currentSessionProblem.problem;

    if (isCorrect) {
      session.correctCount++;
    } else {
      session.wrongCount++;
      progress.wrongAnswers.set(
        problem.id,
        (progress.wrongAnswers.get(problem.id) || 0) + 1
      );
    }

    // SM-2 알고리즘 적용
    const currentRepetitions = progress.repetitionCounts.get(problem.id) || 0;
    const currentEaseFactor = progress.easeFactors.get(problem.id) || 2.5;

    const { nextRepetitions, nextEaseFactor, nextInterval } =
      SM2Algorithm.updateState(isCorrect, currentRepetitions, currentEaseFactor);

    progress.repetitionCounts.set(problem.id, nextRepetitions);
    progress.easeFactors.set(problem.id, nextEaseFactor);

    const nextReviewDate = Date.now() + nextInterval * 24 * 60 * 60 * 1000;
    progress.nextReviewDates.set(problem.id, nextReviewDate);

    // XP 계산 (맧쳤른 문제만)
    if (isCorrect) {
      const xpGain = currentSessionProblem.category === 'new' ? 10 : 5;
      session.xpEarned += xpGain;
      progress.totalXP += xpGain;
    }

    // 주의: 다음 문제로의 이동은 UI의 onNext에서만 처리
    // handleAnswer는 상태 업데이트만 담당

    return { session, progress };
  }

  /**
   * 세션 완료 처리
   */
  static async completeSession(
    session: LearningSessionState,
    progress: UserProgress
  ): Promise<UserProgress> {
    // 화면 완료 표시
    progress.completedScreens.push(`unit-${session.unitId}-session-${session.sessionId}`);

    // 스트릭 업데이트
    const lastSessionDate = progress.lastSessionDate;
    const today = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    const lastSessionDay = Math.floor(lastSessionDate / (24 * 60 * 60 * 1000));

    if (today === lastSessionDay) {
      // 오늘 이미 학습함
    } else if (today === lastSessionDay + 1) {
      // 연속 학습
      progress.currentStreak++;
    } else {
      // 스트릭 끊김
      progress.currentStreak = 1;
    }

    progress.lastSessionDate = Date.now();

    // 세션 완료 보너스 XP
    const bonusXP = 20;
    progress.totalXP += bonusXP;

    return progress;
  }

  /**
   * 오늘의 학습 계획 조회
   */
  static async getTodaysPlan(
    unitId: string,
    allProblems: Problem[]
  ): Promise<{ newProblems: Problem[]; reviewProblems: Problem[] }> {
    const progress = await this.loadProgress(unitId);
    const now = Date.now();

    const newProblems = allProblems.filter(
      (p) => !progress.completedProblems.includes(p.id)
    );

    const reviewProblems = allProblems.filter((p) => {
      const nextReviewDate = progress.nextReviewDates.get(p.id) || 0;
      return nextReviewDate <= now;
    });

    return { newProblems, reviewProblems };
  }

  /**
   * 통계 조회
   */
  static async getStatistics(unitId: string) {
    const progress = await this.loadProgress(unitId);

    return {
      totalXP: progress.totalXP,
      currentStreak: progress.currentStreak,
      completedProblems: progress.completedProblems.length,
      wrongAnswers: progress.wrongAnswers.size,
      averageEaseFactor:
        progress.easeFactors.size > 0
          ? Array.from(progress.easeFactors.values()).reduce((a, b) => a + b, 0) /
            progress.easeFactors.size
          : 2.5,
    };
  }
}

export default LearningSessionManager;
