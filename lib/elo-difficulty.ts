/**
 * ELO 기반 적응형 난이도 시스템
 * - 문제 난이도를 사용자 실력에 맞게 조정
 * - 최적 학습 난이도 유지 (4-8% 높은 수준)
 */

export interface QuizDifficulty {
  quizId: string;
  difficulty: number; // 1 ~ 5 (1: 매우 쉬움, 5: 매우 어려움)
  eloRating: number; // ELO 레이팅 (초기값: 1500)
  attempts: number; // 시도 횟수
  correctAttempts: number; // 정답 횟수
  accuracy: number; // 정답율 (%)
}

export interface UserLevel {
  userId: string;
  eloRating: number; // 사용자 ELO 레이팅 (초기값: 1500)
  level: number; // 1 ~ 10 (레벨)
  xp: number; // 경험치
  streak: number; // 연속 정답 스트릭
  maxStreak: number; // 최대 스트릭
  totalCorrect: number; // 총 정답 수
  totalAttempts: number; // 총 시도 수
}

/**
 * ELO 레이팅 시스템
 */
export class ELOSystem {
  private static readonly K_FACTOR = 32; // 레이팅 변화량 제어
  private static readonly BASE_RATING = 1500;

  /**
   * 예상 승률 계산
   */
  static expectedScore(userRating: number, quizRating: number): number {
    return 1 / (1 + Math.pow(10, (quizRating - userRating) / 400));
  }

  /**
   * 새로운 레이팅 계산
   * @param userRating 사용자 현재 레이팅
   * @param quizRating 문제 현재 레이팅
   * @param userWon 사용자가 정답했는지 여부 (1: 정답, 0: 오답)
   */
  static calculateNewRating(
    userRating: number,
    quizRating: number,
    userWon: number
  ): { newUserRating: number; newQuizRating: number } {
    const expectedUserScore = this.expectedScore(userRating, quizRating);
    const expectedQuizScore = 1 - expectedUserScore;

    const newUserRating = userRating + this.K_FACTOR * (userWon - expectedUserScore);
    const newQuizRating = quizRating + this.K_FACTOR * ((1 - userWon) - expectedQuizScore);

    return {
      newUserRating: Math.round(newUserRating),
      newQuizRating: Math.round(newQuizRating),
    };
  }

  /**
   * 레이팅을 난이도로 변환 (1 ~ 5)
   */
  static ratingToDifficulty(rating: number): number {
    // 1000 ~ 2000 범위를 1 ~ 5로 변환
    const difficulty = Math.max(1, Math.min(5, (rating - 1000) / 250 + 1));
    return Math.round(difficulty * 2) / 2; // 0.5 단위로 반올림
  }

  /**
   * 난이도를 레이팅으로 변환
   */
  static difficultyToRating(difficulty: number): number {
    return (difficulty - 1) * 250 + 1000;
  }
}

/**
 * 적응형 난이도 관리자
 */
export class AdaptiveDifficultyManager {
  private userLevel: UserLevel;
  private quizDifficulties: Map<string, QuizDifficulty> = new Map();

  constructor(userId: string) {
    this.userLevel = {
      userId,
      eloRating: ELOSystem['BASE_RATING'],
      level: 1,
      xp: 0,
      streak: 0,
      maxStreak: 0,
      totalCorrect: 0,
      totalAttempts: 0,
    };
  }

  /**
   * 문제 추가
   */
  addQuiz(quizId: string, initialDifficulty: number = 3): void {
    this.quizDifficulties.set(quizId, {
      quizId,
      difficulty: initialDifficulty,
      eloRating: ELOSystem.difficultyToRating(initialDifficulty),
      attempts: 0,
      correctAttempts: 0,
      accuracy: 0,
    });
  }

  /**
   * 문제 풀이 결과 반영
   */
  updateQuizResult(quizId: string, isCorrect: boolean, timeSpent: number): {
    xpGained: number;
    levelUp: boolean;
    newLevel: number;
  } {
    const quiz = this.quizDifficulties.get(quizId);
    if (!quiz) {
      this.addQuiz(quizId);
      return this.updateQuizResult(quizId, isCorrect, timeSpent);
    }

    // ELO 레이팅 업데이트
    const { newUserRating, newQuizRating } = ELOSystem.calculateNewRating(
      this.userLevel.eloRating,
      quiz.eloRating,
      isCorrect ? 1 : 0
    );

    this.userLevel.eloRating = newUserRating;
    quiz.eloRating = newQuizRating;
    quiz.difficulty = ELOSystem.ratingToDifficulty(quiz.eloRating);

    // 통계 업데이트
    quiz.attempts += 1;
    if (isCorrect) {
      quiz.correctAttempts += 1;
      this.userLevel.streak += 1;
      this.userLevel.maxStreak = Math.max(this.userLevel.maxStreak, this.userLevel.streak);
      this.userLevel.totalCorrect += 1;
    } else {
      this.userLevel.streak = 0;
    }
    this.userLevel.totalAttempts += 1;
    quiz.accuracy = (quiz.correctAttempts / quiz.attempts) * 100;

    // XP 계산
    const basXP = isCorrect ? 10 : 5;
    const difficultyBonus = Math.max(0, (quiz.difficulty - 2) * 5); // 난이도 보너스
    const speedBonus = timeSpent < 30 ? 5 : 0; // 빠른 답변 보너스
    const xpGained = basXP + difficultyBonus + speedBonus;

    this.userLevel.xp += xpGained;

    // 레벨 업 확인
    const newLevel = Math.floor(this.userLevel.xp / 100) + 1;
    const levelUp = newLevel > this.userLevel.level;
    if (levelUp) {
      this.userLevel.level = newLevel;
    }

    this.quizDifficulties.set(quizId, quiz);

    return {
      xpGained,
      levelUp,
      newLevel: this.userLevel.level,
    };
  }

  /**
   * 사용자에게 적절한 난이도의 문제 추천
   */
  getRecommendedQuizzes(quizzes: QuizDifficulty[], count: number = 5): QuizDifficulty[] {
    const userDifficulty = ELOSystem.ratingToDifficulty(this.userLevel.eloRating);
    
    // 사용자 난이도 ± 0.5 범위의 문제 추천
    const recommended = quizzes.filter(q => {
      const diff = Math.abs(q.difficulty - userDifficulty);
      return diff <= 0.5;
    });

    // 부족하면 더 넓은 범위에서 추천
    if (recommended.length < count) {
      const broader = quizzes.filter(q => {
        const diff = Math.abs(q.difficulty - userDifficulty);
        return diff <= 1.0;
      });
      return broader.slice(0, count);
    }

    return recommended.slice(0, count);
  }

  /**
   * 사용자 레벨 정보
   */
  getUserLevel(): UserLevel {
    return { ...this.userLevel };
  }

  /**
   * 사용자 통계
   */
  getStats() {
    const accuracy = this.userLevel.totalAttempts > 0 
      ? (this.userLevel.totalCorrect / this.userLevel.totalAttempts) * 100 
      : 0;

    return {
      level: this.userLevel.level,
      xp: this.userLevel.xp,
      eloRating: this.userLevel.eloRating,
      difficulty: ELOSystem.ratingToDifficulty(this.userLevel.eloRating),
      streak: this.userLevel.streak,
      maxStreak: this.userLevel.maxStreak,
      totalCorrect: this.userLevel.totalCorrect,
      totalAttempts: this.userLevel.totalAttempts,
      accuracy: Math.round(accuracy * 10) / 10,
    };
  }

  /**
   * 모든 문제 난이도 정보
   */
  getAllQuizDifficulties(): QuizDifficulty[] {
    return Array.from(this.quizDifficulties.values());
  }
}

/**
 * 동기부여 시스템 (자기결정이론 기반)
 */
export class MotivationSystem {
  /**
   * 일일 학습 목표 설정
   */
  static getDailyGoal(userLevel: number): {
    targetQuizzes: number;
    targetXP: number;
    targetTime: number; // 분
  } {
    // 레벨이 높을수록 목표가 높아짐
    const baseQuizzes = 10;
    const baseXP = 100;
    const baseTime = 15;

    return {
      targetQuizzes: baseQuizzes + (userLevel - 1) * 2,
      targetXP: baseXP + (userLevel - 1) * 20,
      targetTime: baseTime + (userLevel - 1) * 2,
    };
  }

  /**
   * 스트릭 보너스 계산
   */
  static getStreakBonus(streak: number): number {
    if (streak < 3) return 0;
    if (streak < 7) return 1.1; // 10% 보너스
    if (streak < 14) return 1.2; // 20% 보너스
    if (streak < 30) return 1.3; // 30% 보너스
    return 1.5; // 50% 보너스 (30일 이상)
  }

  /**
   * 성취 배지 확인
   */
  static checkAchievements(stats: any): string[] {
    const achievements: string[] = [];

    if (stats.totalAttempts >= 10) achievements.push('첫 10문제 풀이');
    if (stats.totalAttempts >= 50) achievements.push('50문제 달성');
    if (stats.totalAttempts >= 100) achievements.push('100문제 달성');
    if (stats.streak >= 7) achievements.push('7일 연속 학습');
    if (stats.streak >= 30) achievements.push('30일 연속 학습');
    if (stats.accuracy >= 90) achievements.push('90% 정답율 달성');
    if (stats.level >= 5) achievements.push('레벨 5 달성');
    if (stats.level >= 10) achievements.push('레벨 10 달성');

    return achievements;
  }
}
