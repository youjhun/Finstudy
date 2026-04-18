/**
 * 듀오링고 학습 과학 기반 간격 반복 시스템
 * - SM-2 알고리즘 (Wozniak, 1987)
 * - 망각 곡선 기반 복습 스케줄
 * - 인터리빙 및 인출 연습
 */

export interface LearningSession {
  id: string;
  quizId: string;
  startTime: number;
  endTime?: number;
  isCompleted: boolean;
  correctCount: number;
  totalCount: number;
  newConcepts: number; // 새로운 개념 문제 수
  reviewConcepts: number; // 복습 개념 문제 수
}

export interface CardState {
  cardId: string;
  quizId: string;
  interval: number; // 다음 복습까지의 일수
  easeFactor: number; // 난이도 계수 (1.3 ~ 2.5)
  repetitions: number; // 연속 정답 횟수
  nextReviewDate: number; // 다음 복습 날짜 (timestamp)
  lastReviewDate: number; // 마지막 복습 날짜
  quality: number; // 마지막 답변 품질 (0-5)
  isNew: boolean; // 새로운 카드 여부
  isMastered: boolean; // 마스터됨 여부 (30일 이상 정답)
}

export interface StudyPlan {
  date: number;
  newCards: string[]; // 새로운 개념 카드
  reviewCards: string[]; // 복습할 카드
  totalCards: number;
  estimatedTime: number; // 예상 학습 시간 (분)
}

/**
 * SM-2 알고리즘 구현
 * 각 카드의 다음 복습 간격을 계산합니다.
 */
export class SM2Algorithm {
  /**
   * 사용자의 답변 품질에 따라 카드 상태를 업데이트
   * @param card 카드 상태
   * @param quality 답변 품질 (0-5)
   *   0: 완전히 잊음
   *   1: 매우 어려움
   *   2: 어려움
   *   3: 괜찮음 (정답이지만 느림)
   *   4: 좋음 (정답)
   *   5: 완벽함 (정답, 빠름)
   */
  static updateCard(card: CardState, quality: number): CardState {
    const now = Date.now();
    
    // 새로운 카드 초기화
    if (card.isNew) {
      card.isNew = false;
      card.easeFactor = 2.5;
      card.repetitions = 0;
    }

    // 품질에 따른 처리
    if (quality < 3) {
      // 오답 또는 어려움 → 복습 간격 초기화
      card.repetitions = 0;
      card.interval = 1;
      card.nextReviewDate = now + 24 * 60 * 60 * 1000; // 다음날
    } else {
      // 정답 → 복습 간격 확장
      card.repetitions += 1;

      if (card.repetitions === 1) {
        card.interval = 1;
      } else if (card.repetitions === 2) {
        card.interval = 3;
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }

      // 30일 이상 정답 시 마스터됨 처리
      if (card.interval >= 30) {
        card.isMastered = true;
      }

      card.nextReviewDate = now + card.interval * 24 * 60 * 60 * 1000;
    }

    // Ease Factor 업데이트 (1.3 ~ 2.5 범위)
    const newEaseFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    card.easeFactor = Math.max(1.3, Math.min(2.5, newEaseFactor));

    card.quality = quality;
    card.lastReviewDate = now;

    return card;
  }

  /**
   * 오늘의 학습 계획 생성
   */
  static generateStudyPlan(cards: CardState[], date: number = Date.now()): StudyPlan {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const newCards = cards.filter(c => c.isNew);
    const reviewCards = cards.filter(
      c => !c.isNew && 
           c.nextReviewDate >= dayStart.getTime() && 
           c.nextReviewDate <= dayEnd.getTime() &&
           !c.isMastered
    );

    // 인터리빙: 새로운 개념과 복습을 섞기
    const interleaved = this.interleaveCards(newCards, reviewCards);

    // 예상 학습 시간 계산 (새로운 카드: 1분, 복습 카드: 30초)
    const estimatedTime = newCards.length * 1 + reviewCards.length * 0.5;

    return {
      date,
      newCards: newCards.map(c => c.cardId),
      reviewCards: reviewCards.map(c => c.cardId),
      totalCards: newCards.length + reviewCards.length,
      estimatedTime: Math.ceil(estimatedTime),
    };
  }

  /**
   * 인터리빙: 새로운 개념과 복습을 섞어서 배열 생성
   */
  private static interleaveCards(newCards: CardState[], reviewCards: CardState[]): CardState[] {
    const result: CardState[] = [];
    let newIndex = 0;
    let reviewIndex = 0;

    // 패턴: 새로운 개념 1개 → 복습 2개 반복
    while (newIndex < newCards.length || reviewIndex < reviewCards.length) {
      if (newIndex < newCards.length) {
        result.push(newCards[newIndex++]);
      }
      if (reviewIndex < reviewCards.length) {
        result.push(reviewCards[reviewIndex++]);
      }
      if (reviewIndex < reviewCards.length) {
        result.push(reviewCards[reviewIndex++]);
      }
    }

    return result;
  }
}

/**
 * 학습 상태 관리
 */
export class LearningStateManager {
  private cards: Map<string, CardState> = new Map();

  /**
   * 새로운 카드 추가
   */
  addCard(cardId: string, quizId: string): void {
    this.cards.set(cardId, {
      cardId,
      quizId,
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: Date.now(),
      lastReviewDate: 0,
      quality: 0,
      isNew: true,
      isMastered: false,
    });
  }

  /**
   * 카드 상태 업데이트
   */
  updateCard(cardId: string, quality: number): CardState | null {
    const card = this.cards.get(cardId);
    if (!card) return null;

    const updated = SM2Algorithm.updateCard(card, quality);
    this.cards.set(cardId, updated);
    return updated;
  }

  /**
   * 오늘의 학습 계획 가져오기
   */
  getStudyPlan(date: number = Date.now()): StudyPlan {
    const cardArray = Array.from(this.cards.values());
    return SM2Algorithm.generateStudyPlan(cardArray, date);
  }

  /**
   * 모든 카드 가져오기
   */
  getAllCards(): CardState[] {
    return Array.from(this.cards.values());
  }

  /**
   * 특정 카드 가져오기
   */
  getCard(cardId: string): CardState | null {
    return this.cards.get(cardId) || null;
  }

  /**
   * 학습 통계
   */
  getStats() {
    const cards = Array.from(this.cards.values());
    return {
      totalCards: cards.length,
      newCards: cards.filter(c => c.isNew).length,
      masteredCards: cards.filter(c => c.isMastered).length,
      reviewDueToday: cards.filter(c => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return c.nextReviewDate >= today.getTime() && !c.isMastered;
      }).length,
      averageEaseFactor: cards.length > 0 
        ? cards.reduce((sum, c) => sum + c.easeFactor, 0) / cards.length 
        : 0,
    };
  }
}

/**
 * 세션 기반 학습 추적
 */
export class SessionTracker {
  private sessions: Map<string, LearningSession> = new Map();

  /**
   * 새로운 세션 시작
   */
  startSession(quizId: string): LearningSession {
    const session: LearningSession = {
      id: `session-${Date.now()}`,
      quizId,
      startTime: Date.now(),
      isCompleted: false,
      correctCount: 0,
      totalCount: 0,
      newConcepts: 0,
      reviewConcepts: 0,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * 세션 업데이트
   */
  updateSession(sessionId: string, updates: Partial<LearningSession>): LearningSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const updated = { ...session, ...updates };
    this.sessions.set(sessionId, updated);
    return updated;
  }

  /**
   * 세션 완료
   */
  completeSession(sessionId: string): LearningSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.isCompleted = true;
    session.endTime = Date.now();
    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * 모든 세션 가져오기
   */
  getAllSessions(): LearningSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * 학습 통계
   */
  getSessionStats() {
    const sessions = Array.from(this.sessions.values());
    const completedSessions = sessions.filter(s => s.isCompleted);

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalLearningTime: completedSessions.reduce((sum, s) => {
        return sum + ((s.endTime || 0) - s.startTime);
      }, 0),
      averageAccuracy: completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => {
            return sum + (s.totalCount > 0 ? s.correctCount / s.totalCount : 0);
          }, 0) / completedSessions.length
        : 0,
    };
  }
}
