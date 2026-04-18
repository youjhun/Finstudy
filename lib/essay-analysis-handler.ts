/**
 * 서술형 답안 분석 및 재답변 처리 핸들러
 * 
 * Gemini AI를 활용하여 서술형 답안을 분석하고,
 * 추가 질문 및 보완점을 제공한 후 재답변을 받습니다.
 */

import { generateDynamicSocraticAnalysisPrompt } from './dynamic-socratic-question';
import type { ArticleLesson, QuizQuestion } from './finstudy-data';
import type { SocraticQuestion } from './socratic-quiz-system';

export interface EssayAnalysis {
  score: 'excellent' | 'good' | 'needs_improvement';
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  conceptsCovered: string[];
  conceptsMissed: string[];
  economicTerms: Array<{
    term: string;
    definition: string;
    context: string;
    example: string;
  }>;
  followUpQuestions: string[];
  detailedFeedback: string;
}

export interface EssayAnalysisResult {
  analysis: EssayAnalysis;
  followUpQuestion: string;
  allowRetry: boolean;
}

/**
 * Gemini API를 사용하여 서술형 답안 분석
 */
export async function analyzeEssayAnswer(
  apiKey: string,
  userAnswer: string,
  question: SocraticQuestion,
  articleLesson: ArticleLesson
): Promise<EssayAnalysisResult> {
  try {
    const prompt = generateDynamicSocraticAnalysisPrompt(question, userAnswer);

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    // JSON 추출 (마크다운 코드 블록 제거)
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                      responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const analysis: EssayAnalysis = JSON.parse(jsonStr);

    // 첫 번째 추가 질문 선택
    const followUpQuestion = analysis.followUpQuestions?.[0] || 
      '답변을 더 자세히 설명해주실 수 있을까요?';

    // 재답변 허용 (모든 서술형 문제에서 최대 2회)
    const allowRetry = true;

    return {
      analysis,
      followUpQuestion,
      allowRetry,
    };
  } catch (error) {
    console.error('Essay analysis failed:', error);
    throw error;
  }
}

/**
 * 서술형 답안 재분석 (두 번째 답변)
 */
export async function reanalyzeEssayAnswer(
  apiKey: string,
  firstAnswer: string,
  secondAnswer: string,
  question: SocraticQuestion,
  articleLesson: ArticleLesson
): Promise<EssayAnalysisResult> {
  try {
    const enhancedPrompt = `당신은 경제 교육 전문가이자 소크라테스식 문답법의 마스터입니다.

학생이 첫 번째 답안 이후 추가 질문에 대해 재답변했습니다.
두 답변을 종합적으로 평가하고, 개선된 부분과 여전히 부족한 부분을 지적해주세요.

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

## 학생의 첫 번째 답안
"${firstAnswer}"

## 학생의 두 번째 답안 (재답변)
"${secondAnswer}"

## 평가 요청

다음 JSON 형식으로 두 답변을 종합 분석해주세요:

\`\`\`json
{
  "score": "excellent|good|needs_improvement",
  "feedback": "종합 평가 피드백 (2-3문장)",
  "improvement": "첫 번째 답변 대비 개선 사항 (1-2문장)",
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
  "finalFeedback": "최종 종합 평가 (150-200자) - 학생의 성장 과정과 향후 학습 방향"
}
\`\`\`

## 주의사항
1. 두 답변의 일관성과 발전 과정 평가
2. 재답변에서 추가된 새로운 개념 인식
3. 여전히 부족한 부분 명시
4. 학생의 노력을 인정하면서도 개선점 제시
5. 경제 개념의 정확성 강조
6. 한국어로 작성`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: enhancedPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    // JSON 추출
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                      responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const analysis: any = JSON.parse(jsonStr);

    return {
      analysis: {
        ...analysis,
        followUpQuestions: [],
      },
      followUpQuestion: analysis.finalFeedback || '좋은 답변입니다!',
      allowRetry: false, // 재답변은 최대 1회만 허용
    };
  } catch (error) {
    console.error('Essay reanalysis failed:', error);
    throw error;
  }
}

/**
 * 서술형 답안 분석 결과를 학습 진행도에 반영
 */
export function recordEssayAnalysis(
  analysis: EssayAnalysis,
  questionId: string,
  userAnswer: string
): {
  xpEarned: number;
  conceptsLearned: string[];
} {
  // 점수에 따른 XP 부여
  const xpMap = {
    excellent: 50,
    good: 35,
    needs_improvement: 20,
  };

  const xpEarned = xpMap[analysis.score];

  // 다룬 경제 개념 기록
  const conceptsLearned = analysis.conceptsCovered;

  return {
    xpEarned,
    conceptsLearned,
  };
}
