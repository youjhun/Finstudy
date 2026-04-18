import { describe, it, expect } from 'vitest';
import { 
  recordEssayAnalysis,
  type EssayAnalysis 
} from './essay-analysis-handler';

const mockAnalysis: EssayAnalysis = {
  score: 'excellent',
  feedback: '매우 좋은 답변입니다.',
  strengths: ['개념 이해도 높음', '명확한 설명'],
  weaknesses: [],
  conceptsCovered: ['수요', '가격', '수량'],
  conceptsMissed: [],
  economicTerms: [
    {
      term: '수요 곡선',
      definition: '가격 수준에서 소비자가 구매하려는 상품의 수량을 나타내는 곡선',
      context: '답변에서 수요 곡선의 정의를 명확히 제시',
      example: '아이스크림 가격이 1,000원에서 500원으로 내려가면 판매량이 100개에서 200개로 증가',
    },
  ],
  followUpQuestions: [],
  detailedFeedback: '수요 곡선의 우하향 이유를 정확히 이해하고 있습니다.',
};

describe('Essay Analysis Handler', () => {
  describe('recordEssayAnalysis', () => {
    it('should return correct XP for excellent score', () => {
      const result = recordEssayAnalysis(mockAnalysis, 'q1', 'test answer');
      expect(result.xpEarned).toBe(50);
    });

    it('should return correct XP for good score', () => {
      const goodAnalysis = { ...mockAnalysis, score: 'good' as const };
      const result = recordEssayAnalysis(goodAnalysis, 'q1', 'test answer');
      expect(result.xpEarned).toBe(35);
    });

    it('should return correct XP for needs_improvement score', () => {
      const needsImprovementAnalysis = { ...mockAnalysis, score: 'needs_improvement' as const };
      const result = recordEssayAnalysis(needsImprovementAnalysis, 'q1', 'test answer');
      expect(result.xpEarned).toBe(20);
    });

    it('should return covered concepts', () => {
      const result = recordEssayAnalysis(mockAnalysis, 'q1', 'test answer');
      expect(result.conceptsLearned).toEqual(['수요', '가격', '수량']);
    });

    it('should handle empty concepts', () => {
      const analysisWithoutConcepts = { ...mockAnalysis, conceptsCovered: [] };
      const result = recordEssayAnalysis(analysisWithoutConcepts, 'q1', 'test answer');
      expect(result.conceptsLearned).toEqual([]);
    });
  });

  describe('Analysis structure validation', () => {
    it('should have all required fields in analysis', () => {
      expect(mockAnalysis).toHaveProperty('score');
      expect(mockAnalysis).toHaveProperty('feedback');
      expect(mockAnalysis).toHaveProperty('strengths');
      expect(mockAnalysis).toHaveProperty('weaknesses');
      expect(mockAnalysis).toHaveProperty('conceptsCovered');
      expect(mockAnalysis).toHaveProperty('conceptsMissed');
      expect(mockAnalysis).toHaveProperty('economicTerms');
      expect(mockAnalysis).toHaveProperty('detailedFeedback');
    });

    it('should have valid score values', () => {
      const validScores = ['excellent', 'good', 'needs_improvement'];
      expect(validScores).toContain(mockAnalysis.score);
    });

    it('should have economic terms with required fields', () => {
      mockAnalysis.economicTerms.forEach(term => {
        expect(term).toHaveProperty('term');
        expect(term).toHaveProperty('definition');
        expect(term).toHaveProperty('context');
        expect(term).toHaveProperty('example');
      });
    });

    it('should have strengths array', () => {
      expect(Array.isArray(mockAnalysis.strengths)).toBe(true);
      expect(mockAnalysis.strengths.length).toBeGreaterThan(0);
    });

    it('should have weaknesses array', () => {
      expect(Array.isArray(mockAnalysis.weaknesses)).toBe(true);
    });

    it('should have concepts covered array', () => {
      expect(Array.isArray(mockAnalysis.conceptsCovered)).toBe(true);
      expect(mockAnalysis.conceptsCovered.length).toBeGreaterThan(0);
    });

    it('should have concepts missed array', () => {
      expect(Array.isArray(mockAnalysis.conceptsMissed)).toBe(true);
    });
  });

  describe('XP calculation', () => {
    it('should calculate total XP correctly for multiple analyses', () => {
      const excellent = recordEssayAnalysis(mockAnalysis, 'q1', 'answer1');
      const good = recordEssayAnalysis({ ...mockAnalysis, score: 'good' }, 'q2', 'answer2');
      const needsImprovement = recordEssayAnalysis({ ...mockAnalysis, score: 'needs_improvement' }, 'q3', 'answer3');

      const totalXP = excellent.xpEarned + good.xpEarned + needsImprovement.xpEarned;
      expect(totalXP).toBe(105); // 50 + 35 + 20
    });
  });
});
