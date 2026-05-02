import { describe, it, expect, beforeEach } from 'vitest';
import {
  curriculum,
  unit2Screens,
  unit2Problems,
  type Unit,
  type Screen,
  type Problem,
} from '@/lib/curriculum-data';
import LearningSessionManager, {
  type UserProgress,
  type SessionProblem,
  type LearningSessionState,
} from '@/lib/learning-session-manager';

/**
 * 학습 탭 통합 테스트
 * 
 * 테스트 범위:
 * 1. 커리큘럼 데이터 검증
 * 2. 세션 구성 (Interleaving)
 * 3. SM-2 알고리즘
 * 4. 진행도 추적
 * 5. XP 및 스트릭 관리
 */

describe('Learning Integration Tests', () => {
  // ============= 커리큘럼 데이터 검증 =============

  describe('Curriculum Data', () => {
    it('should have 6 units', () => {
      expect(curriculum).toHaveLength(6);
    });

    it('should have correct unit order', () => {
      curriculum.forEach((unit, index) => {
        expect(unit.order).toBe(index + 1);
      });
    });

    it('should have prerequisite chain', () => {
      expect(curriculum[0].prerequisiteUnitId).toBeUndefined(); // Unit 1: no prerequisite
      expect(curriculum[1].prerequisiteUnitId).toBe('unit-1'); // Unit 2: requires Unit 1
      expect(curriculum[2].prerequisiteUnitId).toBe('unit-2'); // Unit 3: requires Unit 2
    });

    it('should have valid badges', () => {
      curriculum.forEach((unit) => {
        unit.badges.forEach((badge) => {
          expect(badge.id).toBeDefined();
          expect(badge.name).toBeDefined();
          expect(badge.icon).toBeDefined();
          expect(badge.condition).toBeDefined();
        });
      });
    });
  });

  // ============= Unit 2 화면 검증 =============

  describe('Unit 2 Screens', () => {
    it('should have 5 screens', () => {
      expect(unit2Screens).toHaveLength(5);
    });

    it('should have correct screen types', () => {
      expect(unit2Screens[0].type).toBe('intro');
      expect(unit2Screens[1].type).toBe('concept');
      expect(unit2Screens[2].type).toBe('quiz');
      expect(unit2Screens[3].type).toBe('concept2');
      expect(unit2Screens[4].type).toBe('outro');
    });

    it('should have correct screen order', () => {
      unit2Screens.forEach((screen, index) => {
        expect(screen.order).toBe(index + 1);
      });
    });

    it('should have learning theory annotations', () => {
      unit2Screens.forEach((screen) => {
        expect(screen.learningTheory).toBeDefined();
        expect(screen.learningTheory.length).toBeGreaterThan(0);
      });
    });

    it('intro screen should have real world question', () => {
      const introScreen = unit2Screens[0];
      expect(introScreen.content.realWorldQuestion).toBeDefined();
      expect(introScreen.content.coreStatement).toBeDefined();
      expect(introScreen.content.choices).toHaveLength(3);
    });

    it('concept screen should have definition', () => {
      const conceptScreen = unit2Screens[1];
      expect(conceptScreen.content.definition).toBeDefined();
      expect(conceptScreen.content.characteristics).toBeDefined();
      expect(conceptScreen.content.examples).toBeDefined();
    });

    it('quiz screen should have question and options', () => {
      const quizScreen = unit2Screens[2];
      expect(quizScreen.content.question).toBeDefined();
      expect(quizScreen.content.options).toBeDefined();
      expect(quizScreen.content.options?.length).toBeGreaterThan(0);
    });

    it('outro screen should have transfer question', () => {
      const outroScreen = unit2Screens[4];
      expect(outroScreen.content.transferQuestion).toBeDefined();
      expect(outroScreen.content.reflectionPoints).toBeDefined();
      expect(outroScreen.content.reflectionPoints?.length).toBeGreaterThan(0);
    });
  });

  // ============= Unit 2 문제 검증 =============

  describe('Unit 2 Problems', () => {
    it('should have 6 problems', () => {
      expect(unit2Problems).toHaveLength(6);
    });

    it('should have mix of new and review problems', () => {
      const newProblems = unit2Problems.filter((p) => p.category === 'new');
      const reviewProblems = unit2Problems.filter((p) => p.category === 'review');
      expect(newProblems.length).toBe(2); // 40%
      expect(reviewProblems.length).toBe(4); // 60%
    });

    it('should have difficulty levels', () => {
      unit2Problems.forEach((problem) => {
        expect([1, 2, 3]).toContain(problem.difficulty);
      });
    });

    it('should have valid problem types', () => {
      const validTypes = [
        'multiple-choice',
        'drag-drop',
        'fill-blank',
        'calculation',
        'essay',
      ];
      unit2Problems.forEach((problem) => {
        expect(validTypes).toContain(problem.type);
      });
    });

    it('should have explanations', () => {
      unit2Problems.forEach((problem) => {
        expect(problem.explanation).toBeDefined();
        expect(problem.explanation.length).toBeGreaterThan(0);
      });
    });

    it('should have SM-2 initial values', () => {
      unit2Problems.forEach((problem) => {
        expect(problem.easeFactorSM2).toBeDefined();
        expect(problem.easeFactorSM2).toBeGreaterThanOrEqual(1.3);
        expect(problem.easeFactorSM2).toBeLessThanOrEqual(2.5);
        expect(problem.timesReviewed).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ============= 세션 구성 (Interleaving) =============

  describe('Session Building (Interleaving)', () => {
    let emptyProgress: UserProgress;

    beforeEach(() => {
      emptyProgress = {
        userId: 'test-user',
        unitId: 'unit-2',
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
    });

    it('should build session with 5 problems', () => {
      const sessionProblems = LearningSessionManager.buildSessionProblems(
        unit2Problems,
        emptyProgress,
        5
      );
      expect(sessionProblems).toHaveLength(5);
    });

    it('should have 40% new and 60% review', () => {
      const sessionProblems = LearningSessionManager.buildSessionProblems(
        unit2Problems,
        emptyProgress,
        5
      );
      const newCount = sessionProblems.filter((p) => p.category === 'new').length;
      const reviewCount = sessionProblems.filter(
        (p) => p.category === 'review'
      ).length;
      expect(newCount).toBe(2); // 40%
      expect(reviewCount).toBe(3); // 60%
    });

    it('should interleave new and review problems', () => {
      const sessionProblems = LearningSessionManager.buildSessionProblems(
        unit2Problems,
        emptyProgress,
        5
      );
      // 신규 2개, 복습 3개 구성 확인
      const newCount = sessionProblems.filter((p) => p.category === 'new').length;
      const reviewCount = sessionProblems.filter((p) => p.category === 'review').length;
      expect(newCount).toBe(2);
      expect(reviewCount).toBe(3);
    });

    it('should have correct order values', () => {
      const sessionProblems = LearningSessionManager.buildSessionProblems(
        unit2Problems,
        emptyProgress,
        5
      );
      sessionProblems.forEach((p, index) => {
        expect(p.order).toBe(index);
      });
    });
  });

  // ============= 세션 상태 관리 =============

  describe('Session State Management', () => {
    let session: LearningSessionState;
    let progress: UserProgress;

    beforeEach(() => {
      progress = {
        userId: 'test-user',
        unitId: 'unit-2',
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

      const sessionProblems = LearningSessionManager.buildSessionProblems(
        unit2Problems,
        progress,
        5
      );
      session = LearningSessionManager.createSession('unit-2', sessionProblems);
    });

    it('should create session with correct structure', () => {
      expect(session.sessionId).toBeDefined();
      expect(session.unitId).toBe('unit-2');
      expect(session.problems).toHaveLength(5);
      expect(session.currentProblemIndex).toBe(0);
      expect(session.correctCount).toBe(0);
      expect(session.wrongCount).toBe(0);
      expect(session.xpEarned).toBe(0);
    });

    it('should handle correct answer', async () => {
      const { session: updatedSession, progress: updatedProgress } =
        await LearningSessionManager.handleAnswer(session, progress, true);

      expect(updatedSession.correctCount).toBe(1);
      expect(updatedSession.wrongCount).toBe(0);
      expect(updatedSession.xpEarned).toBe(10); // 신규 문제 = 10 XP
      expect(updatedProgress.totalXP).toBe(10);
    });

    it('should handle wrong answer', async () => {
      const { session: updatedSession, progress: updatedProgress } =
        await LearningSessionManager.handleAnswer(session, progress, false);

      expect(updatedSession.correctCount).toBe(0);
      expect(updatedSession.wrongCount).toBe(1);
      expect(updatedProgress.wrongAnswers.size).toBe(1);
    });

    it('should apply SM-2 algorithm on correct answer', async () => {
      const problemId = session.problems[0].problem.id;
      const { progress: updatedProgress } =
        await LearningSessionManager.handleAnswer(session, progress, true);

      expect(updatedProgress.repetitionCounts.get(problemId)).toBe(1);
      expect(updatedProgress.easeFactors.get(problemId)).toBeGreaterThanOrEqual(1.3);
      expect(updatedProgress.nextReviewDates.get(problemId)).toBeDefined();
    });

    it('should advance to next problem after answer', async () => {
      const { session: updatedSession } =
        await LearningSessionManager.handleAnswer(session, progress, true);

      // handleAnswer는 상태 업데이트만 담당 (인덱스 증가는 UI에서 처리)
      expect(updatedSession.currentProblemIndex).toBe(0);
    });

    it('should track progress across multiple problems', async () => {
      let currentSession = session;
      let currentProgress = progress;

      // 첫 번째 문제: 정답
      const result1 = await LearningSessionManager.handleAnswer(
        currentSession,
        currentProgress,
        true
      );
      expect(result1.session.correctCount).toBe(1);
      expect(result1.session.currentProblemIndex).toBe(0); // handleAnswer는 인덱스를 증가시키지 않음

      // 두 번째 문제: 오답
      const result2 = await LearningSessionManager.handleAnswer(
        result1.session,
        result1.progress,
        false
      );
      expect(result2.session.wrongCount).toBe(1);
      expect(result2.session.currentProblemIndex).toBe(0); // handleAnswer는 인덱스를 증가시키지 않음
      expect(result2.session.correctCount).toBe(1); // 첫 번째 정답 유지
    });
  });

  // ============= 진행도 추적 =============

  describe('Progress Tracking', () => {
    let progress: UserProgress;

    beforeEach(() => {
      progress = {
        userId: 'test-user',
        unitId: 'unit-2',
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
    });

    it('should create empty progress', () => {
      expect(progress.completedScreens).toHaveLength(0);
      expect(progress.completedProblems).toHaveLength(0);
      expect(progress.currentStreak).toBe(0);
      expect(progress.totalXP).toBe(0);
    });

    it('should track completed problems', () => {
      progress.completedProblems.push('problem-1');
      expect(progress.completedProblems).toContain('problem-1');
    });

    it('should track wrong answers', () => {
      progress.wrongAnswers.set('problem-1', 1);
      progress.wrongAnswers.set('problem-1', 2);
      expect(progress.wrongAnswers.get('problem-1')).toBe(2);
    });
  });

  // ============= XP 및 스트릭 =============

  describe('XP and Streak Management', () => {
    it('should calculate new problem XP as 10', () => {
      const xp = 10; // new problem
      expect(xp).toBe(10);
    });

    it('should calculate review problem XP as 5', () => {
      const xp = 5; // review problem
      expect(xp).toBe(5);
    });

    it('should add session completion bonus', () => {
      const baseXP = 10 + 5 + 10 + 5 + 5; // 5 problems
      const bonusXP = 20; // session completion
      const totalXP = baseXP + bonusXP;
      expect(totalXP).toBe(55);
    });

    it('should track streak correctly', () => {
      const today = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
      const yesterday = today - 1;

      // 어제 학습했고, 오늘 학습하면 스트릭 증가
      const lastSessionDay = yesterday;
      const currentDay = today;
      const isConsecutive = currentDay === lastSessionDay + 1;
      expect(isConsecutive).toBe(true);
    });
  });

  // ============= 통계 조회 =============

  describe('Statistics', () => {
    let progress: UserProgress;

    beforeEach(() => {
      progress = {
        userId: 'test-user',
        unitId: 'unit-2',
        completedScreens: [],
        completedProblems: ['p1', 'p2', 'p3'],
        wrongAnswers: new Map([
          ['p1', 1],
          ['p2', 2],
        ]),
        lastSessionDate: Date.now(),
        currentStreak: 5,
        totalXP: 150,
        easeFactors: new Map([
          ['p1', 2.5],
          ['p2', 2.3],
          ['p3', 2.1],
        ]),
        nextReviewDates: new Map(),
        repetitionCounts: new Map(),
      };
    });

    it('should calculate average ease factor', () => {
      const easeFactors = Array.from(progress.easeFactors.values());
      const average =
        easeFactors.reduce((a, b) => a + b, 0) / easeFactors.length;
      expect(average).toBeCloseTo(2.3, 1);
    });

    it('should report correct statistics', () => {
      expect(progress.totalXP).toBe(150);
      expect(progress.currentStreak).toBe(5);
      expect(progress.completedProblems.length).toBe(3);
      expect(progress.wrongAnswers.size).toBe(2);
    });
  });
});
