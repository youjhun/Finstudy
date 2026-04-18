import { describe, it, expect } from 'vitest';
import { createDynamicSocraticQuestion, generateDynamicSocraticAnalysisPrompt } from './dynamic-socratic-question';
import { lessons } from './finstudy-data';

describe('동적 소크라테스식 질문 생성', () => {
  const testArticle = lessons[0];
  const essayQuestion = testArticle.quiz.find(q => q.type === 'essay');

  it('기사 정보로부터 동적 SocraticQuestion을 생성해야 함', () => {
    if (!essayQuestion) {
      expect(essayQuestion).toBeDefined();
      return;
    }

    const dynamicQuestion = createDynamicSocraticQuestion(testArticle, essayQuestion);

    expect(dynamicQuestion).toBeDefined();
    expect(dynamicQuestion.id).toMatch(/^dynamic_/);
    expect(dynamicQuestion.articleTitle).toBe(testArticle.title);
    expect(dynamicQuestion.mainQuestion).toBe(essayQuestion.question);
    expect(dynamicQuestion.difficulty).toBe('advanced_1');
    expect(dynamicQuestion.expectedConcepts).toBeDefined();
    expect(dynamicQuestion.expectedConcepts.length).toBeGreaterThan(0);
    expect(dynamicQuestion.rubric).toBeDefined();
    expect(dynamicQuestion.rubric.excellent).toBeDefined();
    expect(dynamicQuestion.rubric.good).toBeDefined();
    expect(dynamicQuestion.rubric.needsImprovement).toBeDefined();
  });

  it('생성된 질문의 context가 기사 요약을 포함해야 함', () => {
    if (!essayQuestion) {
      expect(essayQuestion).toBeDefined();
      return;
    }

    const dynamicQuestion = createDynamicSocraticQuestion(testArticle, essayQuestion);

    expect(dynamicQuestion.context).toContain(testArticle.summary.substring(0, 100));
  });

  it('생성된 질문의 expectedConcepts가 기사의 terms를 포함해야 함', () => {
    if (!essayQuestion) {
      expect(essayQuestion).toBeDefined();
      return;
    }

    const dynamicQuestion = createDynamicSocraticQuestion(testArticle, essayQuestion);

    expect(dynamicQuestion.expectedConcepts).toEqual(testArticle.terms);
  });

  it('동적 소크라테스식 분석 프롬프트를 생성해야 함', () => {
    if (!essayQuestion) {
      expect(essayQuestion).toBeDefined();
      return;
    }

    const dynamicQuestion = createDynamicSocraticQuestion(testArticle, essayQuestion);
    const userAnswer = '이것은 테스트 답변입니다.';
    const prompt = generateDynamicSocraticAnalysisPrompt(dynamicQuestion, userAnswer);

    expect(prompt).toBeDefined();
    expect(prompt).toContain(dynamicQuestion.articleTitle);
    expect(prompt).toContain(dynamicQuestion.mainQuestion);
    expect(prompt).toContain(userAnswer);
    expect(prompt).toContain('JSON');
  });

  it('프롬프트가 평가 기준을 포함해야 함', () => {
    if (!essayQuestion) {
      expect(essayQuestion).toBeDefined();
      return;
    }

    const dynamicQuestion = createDynamicSocraticQuestion(testArticle, essayQuestion);
    const userAnswer = '이것은 테스트 답변입니다.';
    const prompt = generateDynamicSocraticAnalysisPrompt(dynamicQuestion, userAnswer);

    expect(prompt).toContain('우수');
    expect(prompt).toContain('양호');
    expect(prompt).toContain('개선 필요');
  });

  it('프롬프트가 경제 용어 해설 요청을 포함해야 함', () => {
    if (!essayQuestion) {
      expect(essayQuestion).toBeDefined();
      return;
    }

    const dynamicQuestion = createDynamicSocraticQuestion(testArticle, essayQuestion);
    const userAnswer = '이것은 테스트 답변입니다.';
    const prompt = generateDynamicSocraticAnalysisPrompt(dynamicQuestion, userAnswer);

    expect(prompt).toContain('economicTerms');
    expect(prompt).toContain('용어의 정확한 정의');
  });
});
