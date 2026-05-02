import { describe, it, expect } from 'vitest';
import type { EssayFeedback } from './essay-feedback-handler';

describe('Essay Feedback Handler', () => {
  describe('Feedback structure validation', () => {
    const mockFeedback: EssayFeedback = {
      isCorrect: true,
      feedback: '좋은 답변입니다!',
      strengths: ['명확한 설명'],
      improvements: [],
      economicConcepts: ['수요', '공급'],
      explanation: '이 답변은 경제 개념을 잘 이해하고 있습니다.',
    };

    it('should have all required fields', () => {
      expect(mockFeedback).toHaveProperty('isCorrect');
      expect(mockFeedback).toHaveProperty('feedback');
      expect(mockFeedback).toHaveProperty('strengths');
      expect(mockFeedback).toHaveProperty('improvements');
      expect(mockFeedback).toHaveProperty('economicConcepts');
      expect(mockFeedback).toHaveProperty('explanation');
    });

    it('should have correct type for isCorrect', () => {
      expect(typeof mockFeedback.isCorrect).toBe('boolean');
    });

    it('should have string feedback', () => {
      expect(typeof mockFeedback.feedback).toBe('string');
      expect(mockFeedback.feedback.length).toBeGreaterThan(0);
    });

    it('should have array of strengths', () => {
      expect(Array.isArray(mockFeedback.strengths)).toBe(true);
    });

    it('should have array of improvements', () => {
      expect(Array.isArray(mockFeedback.improvements)).toBe(true);
    });

    it('should have array of economic concepts', () => {
      expect(Array.isArray(mockFeedback.economicConcepts)).toBe(true);
    });

    it('should have string explanation', () => {
      expect(typeof mockFeedback.explanation).toBe('string');
      expect(mockFeedback.explanation.length).toBeGreaterThan(0);
    });
  });

  describe('Feedback for correct answers', () => {
    const correctFeedback: EssayFeedback = {
      isCorrect: true,
      feedback: '정답입니다! 경제 개념을 정확히 이해하고 있습니다.',
      strengths: ['명확한 설명', '관련 개념 포함'],
      improvements: [],
      economicConcepts: ['수요 곡선', '가격'],
      explanation: '수요 곡선의 우하향 이유를 정확히 설명했습니다.',
    };

    it('should mark as correct', () => {
      expect(correctFeedback.isCorrect).toBe(true);
    });

    it('should have positive feedback', () => {
      expect(correctFeedback.feedback).toContain('정답');
    });

    it('should have strengths', () => {
      expect(correctFeedback.strengths.length).toBeGreaterThan(0);
    });

    it('should have empty improvements for perfect answer', () => {
      expect(correctFeedback.improvements.length).toBe(0);
    });
  });

  describe('Feedback for incorrect answers', () => {
    const incorrectFeedback: EssayFeedback = {
      isCorrect: false,
      feedback: '다시 생각해보세요. 기사의 핵심을 다시 읽어보세요.',
      strengths: [],
      improvements: ['기사 내용 재검토', '경제 개념 이해 강화'],
      economicConcepts: [],
      explanation: '정답은 수요 곡선이 우하향하는 이유는 가격이 내려가면 구매량이 증가하기 때문입니다.',
    };

    it('should mark as incorrect', () => {
      expect(incorrectFeedback.isCorrect).toBe(false);
    });

    it('should have corrective feedback', () => {
      expect(incorrectFeedback.feedback).toContain('다시');
    });

    it('should have improvements', () => {
      expect(incorrectFeedback.improvements.length).toBeGreaterThan(0);
    });

    it('should provide explanation', () => {
      expect(incorrectFeedback.explanation.length).toBeGreaterThan(0);
    });
  });

  describe('Feedback content validation', () => {
    const feedback: EssayFeedback = {
      isCorrect: true,
      feedback: '좋은 답변입니다.',
      strengths: ['강점 1', '강점 2'],
      improvements: ['개선점 1'],
      economicConcepts: ['개념 1', '개념 2'],
      explanation: '상세 설명입니다.',
    };

    it('should have non-empty feedback text', () => {
      expect(feedback.feedback.trim().length).toBeGreaterThan(0);
    });

    it('should have valid strengths', () => {
      feedback.strengths.forEach(strength => {
        expect(typeof strength).toBe('string');
        expect(strength.length).toBeGreaterThan(0);
      });
    });

    it('should have valid improvements', () => {
      feedback.improvements.forEach(improvement => {
        expect(typeof improvement).toBe('string');
        expect(improvement.length).toBeGreaterThan(0);
      });
    });

    it('should have valid economic concepts', () => {
      feedback.economicConcepts.forEach(concept => {
        expect(typeof concept).toBe('string');
        expect(concept.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty explanation', () => {
      expect(feedback.explanation.trim().length).toBeGreaterThan(0);
    });
  });
});
