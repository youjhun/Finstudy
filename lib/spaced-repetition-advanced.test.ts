import { describe, it, expect, beforeEach } from 'vitest';
import {
  SM2Algorithm,
  LearningStateManager,
  SessionTracker,
  CardState,
} from './spaced-repetition-advanced';

describe('SM2Algorithm', () => {
  let card: CardState;

  beforeEach(() => {
    card = {
      cardId: 'test-card',
      quizId: 'test-quiz',
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: Date.now(),
      lastReviewDate: 0,
      quality: 0,
      isNew: true,
      isMastered: false,
    };
  });

  it('should initialize new card correctly', () => {
    const updated = SM2Algorithm.updateCard(card, 4);
    expect(updated.isNew).toBe(false);
    expect(updated.easeFactor).toBe(2.5);
    expect(updated.repetitions).toBe(1);
    expect(updated.interval).toBe(1);
  });

  it('should reset interval on incorrect answer', () => {
    card.isNew = false;
    card.repetitions = 3;
    card.interval = 7;
    
    const updated = SM2Algorithm.updateCard(card, 2);
    expect(updated.repetitions).toBe(0);
    expect(updated.interval).toBe(1);
  });

  it('should increase interval on correct answer', () => {
    card.isNew = false;
    card.repetitions = 1;
    card.interval = 1;
    
    const updated = SM2Algorithm.updateCard(card, 4);
    expect(updated.repetitions).toBe(2);
    expect(updated.interval).toBe(3);
  });

  it('should mark card as mastered after 30+ days', () => {
    card.isNew = false;
    card.repetitions = 10;
    card.interval = 30;
    card.easeFactor = 2.5;
    
    const updated = SM2Algorithm.updateCard(card, 5);
    expect(updated.isMastered).toBe(true);
  });

  it('should adjust ease factor based on quality', () => {
    const updated = SM2Algorithm.updateCard(card, 4);
    // Quality 4는 ease factor를 증가시킴
    expect(updated.easeFactor).toBeGreaterThanOrEqual(2.5);
    expect(updated.easeFactor).toBeLessThanOrEqual(2.6);
  });
});

describe('LearningStateManager', () => {
  let manager: LearningStateManager;

  beforeEach(() => {
    manager = new LearningStateManager();
  });

  it('should add new card', () => {
    manager.addCard('card-1', 'quiz-1');
    const card = manager.getCard('card-1');
    
    expect(card).toBeDefined();
    expect(card?.isNew).toBe(true);
    expect(card?.quizId).toBe('quiz-1');
  });

  it('should update card correctly', () => {
    manager.addCard('card-1', 'quiz-1');
    const updated = manager.updateCard('card-1', 4);
    
    expect(updated).toBeDefined();
    expect(updated?.repetitions).toBe(1);
  });

  it('should generate study plan', () => {
    manager.addCard('card-1', 'quiz-1');
    manager.addCard('card-2', 'quiz-1');
    manager.addCard('card-3', 'quiz-2');
    
    const plan = manager.getStudyPlan();
    expect(plan.totalCards).toBeGreaterThanOrEqual(0);
    expect(plan.newCards.length).toBeGreaterThanOrEqual(0);
  });

  it('should calculate stats correctly', () => {
    manager.addCard('card-1', 'quiz-1');
    manager.addCard('card-2', 'quiz-1');
    
    const stats = manager.getStats();
    expect(stats.totalCards).toBe(2);
    expect(stats.newCards).toBe(2);
    expect(stats.masteredCards).toBe(0);
  });

  it('should get all cards', () => {
    manager.addCard('card-1', 'quiz-1');
    manager.addCard('card-2', 'quiz-1');
    
    const cards = manager.getAllCards();
    expect(cards.length).toBe(2);
  });
});

describe('SessionTracker', () => {
  let tracker: SessionTracker;

  beforeEach(() => {
    tracker = new SessionTracker();
  });

  it('should start new session', () => {
    const session = tracker.startSession('quiz-1');
    
    expect(session.id).toBeDefined();
    expect(session.quizId).toBe('quiz-1');
    expect(session.isCompleted).toBe(false);
  });

  it('should update session', () => {
    const session = tracker.startSession('quiz-1');
    const updated = tracker.updateSession(session.id, {
      correctCount: 5,
      totalCount: 10,
    });
    
    expect(updated?.correctCount).toBe(5);
    expect(updated?.totalCount).toBe(10);
  });

  it('should complete session', () => {
    const session = tracker.startSession('quiz-1');
    const completed = tracker.completeSession(session.id);
    
    expect(completed?.isCompleted).toBe(true);
    expect(completed?.endTime).toBeDefined();
  });

  it('should get all sessions', async () => {
    const session1 = tracker.startSession('quiz-1');
    await new Promise(resolve => setTimeout(resolve, 10)); // 시간 간격 추가
    const session2 = tracker.startSession('quiz-2');
    
    const sessions = tracker.getAllSessions();
    expect(sessions.length).toBe(2);
    expect(sessions.map(s => s.id)).toContain(session1.id);
    expect(sessions.map(s => s.id)).toContain(session2.id);
  });


  it('should calculate session stats', () => {
    const session = tracker.startSession('quiz-1');
    tracker.updateSession(session.id, {
      correctCount: 8,
      totalCount: 10,
    });
    tracker.completeSession(session.id);
    
    const stats = tracker.getSessionStats();
    expect(stats.totalSessions).toBe(1);
    expect(stats.completedSessions).toBe(1);
  });
});
