import { describe, it, expect } from 'vitest';
import {
  socraticQuizzes,
  isSocraticQuizApplicable,
  getSocraticQuestionById,
  getSocraticQuestionsByDifficulty,
  generateSocraticAnalysisPrompt,
} from '../socratic-quiz-system';

describe('Socratic Quiz System', () => {
  it('should have 4 socratic questions', () => {
    expect(socraticQuizzes.questions).toHaveLength(4);
  });

  it('should have 2 advanced_1 questions', () => {
    const advanced1 = socraticQuizzes.questions.filter(q => q.difficulty === 'advanced_1');
    expect(advanced1).toHaveLength(2);
  });

  it('should have 2 advanced_2 questions', () => {
    const advanced2 = socraticQuizzes.questions.filter(q => q.difficulty === 'advanced_2');
    expect(advanced2).toHaveLength(2);
  });

  it('should check socratic quiz applicability', () => {
    expect(isSocraticQuizApplicable('advanced_1')).toBe(true);
    expect(isSocraticQuizApplicable('advanced_2')).toBe(true);
    expect(isSocraticQuizApplicable('intermediate')).toBe(false);
    expect(isSocraticQuizApplicable('beginner')).toBe(false);
  });

  it('should get socratic question by id', () => {
    const question = getSocraticQuestionById('socratic_advanced_1_1');
    expect(question).toBeDefined();
    expect(question?.difficulty).toBe('advanced_1');
  });

  it('should return undefined for non-existent question id', () => {
    const question = getSocraticQuestionById('non_existent_id');
    expect(question).toBeUndefined();
  });

  it('should get socratic questions by difficulty', () => {
    const advanced1Questions = getSocraticQuestionsByDifficulty('advanced_1');
    expect(advanced1Questions).toHaveLength(2);
    advanced1Questions.forEach(q => {
      expect(q.difficulty).toBe('advanced_1');
    });

    const advanced2Questions = getSocraticQuestionsByDifficulty('advanced_2');
    expect(advanced2Questions).toHaveLength(2);
    advanced2Questions.forEach(q => {
      expect(q.difficulty).toBe('advanced_2');
    });
  });

  it('should generate valid socratic analysis prompt', () => {
    const question = socraticQuizzes.questions[0];
    const userAnswer = '금리 인상은 대출 비용을 증가시켜 소비와 투자를 감소시킵니다.';
    
    const prompt = generateSocraticAnalysisPrompt(question, userAnswer);
    
    expect(prompt).toContain('경제 교육 전문가');
    expect(prompt).toContain(question.mainQuestion);
    expect(prompt).toContain(userAnswer);
    expect(prompt).toContain('JSON');
  });

  it('should have valid rubric structure for each question', () => {
    socraticQuizzes.questions.forEach(question => {
      expect(question.rubric).toBeDefined();
      expect(question.rubric.excellent).toBeDefined();
      expect(question.rubric.good).toBeDefined();
      expect(question.rubric.needsImprovement).toBeDefined();
    });
  });

  it('should have expected concepts for each question', () => {
    socraticQuizzes.questions.forEach(question => {
      expect(question.expectedConcepts).toBeDefined();
      expect(Array.isArray(question.expectedConcepts)).toBe(true);
      expect(question.expectedConcepts.length).toBeGreaterThan(0);
    });
  });

  it('should have unique question ids', () => {
    const ids = socraticQuizzes.questions.map(q => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid article context for each question', () => {
    socraticQuizzes.questions.forEach(question => {
      expect(question.articleTitle).toBeDefined();
      expect(question.articleTitle.length).toBeGreaterThan(0);
      expect(question.context).toBeDefined();
      expect(question.context.length).toBeGreaterThan(0);
      expect(question.mainQuestion).toBeDefined();
      expect(question.mainQuestion.length).toBeGreaterThan(0);
    });
  });
});
