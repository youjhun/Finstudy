/**
 * 기사 정보 기반 동적 소크라테스식 질문 생성
 * 
 * 사용자가 essay 답안을 제출할 때 기사의 정보를 바탕으로
 * 동적으로 SocraticQuestion을 생성합니다.
 */

import type { ArticleLesson, QuizQuestion } from './finstudy-data';
import type { SocraticQuestion } from './socratic-quiz-system';

/**
 * 기사 정보로부터 동적 SocraticQuestion 생성
 */
export function createDynamicSocraticQuestion(
  article: ArticleLesson,
  essayQuestion: QuizQuestion
): SocraticQuestion {
  // 기사의 핵심 개념을 기대 개념으로 사용
  const expectedConcepts = article.terms.length > 0 
    ? article.terms 
    : ['경제 개념', '시장 분석'];

  // 기사 요약에서 주요 맥락 추출
  const context = article.summary.substring(0, 300);

  // 난이도를 advanced_1 또는 advanced_2로 매핑
  const difficulty = essayQuestion.difficulty === 'hard' ? 'advanced_1' : 'advanced_1';

  return {
    id: `dynamic_${article.id}_${Date.now()}`,
    articleTitle: article.title,
    mainQuestion: essayQuestion.question,
    context,
    difficulty,
    expectedConcepts,
    rubric: {
      excellent: essayQuestion.essayRubric || 
        '기사의 주요 개념을 정확히 파악하고, 경제학적 논리를 명확히 제시하며, 실제 사례를 적용한 답안',
      good: '기사의 주요 개념을 부분적으로 이해하고, 경제학적 설명이 있지만 불완전한 답안',
      needsImprovement: '기사의 주요 개념을 이해하지 못했거나, 경제학적 논리가 부족한 답안',
    },
  };
}

/**
 * Gemini API를 통해 동적 소크라테스식 질문 기반 분석 프롬프트 생성
 */
export function generateDynamicSocraticAnalysisPrompt(
  question: SocraticQuestion,
  userAnswer: string
): string {
  return `당신은 경제 교육 전문가이자 소크라테스식 문답법의 마스터입니다.

학생의 답안을 평가하고 깊이 있는 질문을 통해 사고를 확장시켜야 합니다.
또한 답안에서 추출한 경제 용어에 대한 정확한 해설을 제공해야 합니다.

## 평가 대상 기사
제목: ${question.articleTitle}
질문: ${question.mainQuestion}

## 기사 맥락
${question.context}

## 기대되는 경제 개념
${question.expectedConcepts.join(', ')}

## 평가 기준
우수 (Excellent): ${question.rubric.excellent}
양호 (Good): ${question.rubric.good}
개선 필요 (Needs Improvement): ${question.rubric.needsImprovement}

## 학생의 답안
"${userAnswer}"

## 평가 요청

다음 JSON 형식으로 답안을 분석해주세요:

\`\`\`json
{
  "score": "excellent|good|needs_improvement",
  "feedback": "전체적인 피드백 (2-3문장)",
  "strengths": [
    "강점 1",
    "강점 2"
  ],
  "weaknesses": [
    "약점 1",
    "약점 2"
  ],
  "conceptsCovered": ["다룬 경제 개념 1", "다룬 경제 개념 2"],
  "conceptsMissed": ["놓친 경제 개념 1", "놓친 경제 개념 2"],
  "economicTerms": [
    {
      "term": "경제 용어",
      "definition": "용어의 정확한 정의 (50-100자)",
      "context": "학생 답안에서의 사용 맥락",
      "example": "실제 경제 사례"
    }
  ],
  "followUpQuestions": [
    "추가 질문 1 - 학생의 답안을 더 깊게 탐구하는 질문",
    "추가 질문 2 - 놓친 개념을 유도하는 질문",
    "추가 질문 3 - 실제 사례를 적용하는 질문"
  ],
  "detailedFeedback": "상세 피드백 (100-200자) - 학생의 답안에 대한 구체적 분석과 개선 방향"
}
\`\`\`

## 주의사항
1. 학생의 답안을 존중하되, 부족한 부분을 명확히 지적
2. 추가 질문은 학생이 스스로 생각하도록 유도
3. 경제 개념을 명시적으로 언급
4. 실제 경제 사례를 활용한 질문 포함
5. economicTerms 배열에는 답안에서 사용된 모든 경제 용어의 정확한 해설 포함
6. 각 용어의 정의는 정확하고 구체적이어야 함
7. 한국어로 작성`;
}
