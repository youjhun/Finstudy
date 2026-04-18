/**
 * 서술형 답안 Gemini AI 피드백 생성 핸들러
 * 
 * 채점 결과(정오답)와 함께 Gemini AI를 활용하여
 * 상세한 피드백을 제공합니다.
 */

import type { ArticleLesson, QuizQuestion } from './finstudy-data';

export interface EssayFeedback {
  isCorrect: boolean;
  feedback: string;
  strengths: string[];
  improvements: string[];
  economicConcepts: string[];
  explanation: string;
}

/**
 * Gemini AI를 사용하여 서술형 답안에 대한 피드백 생성
 */
export async function generateEssayFeedback(
  apiKey: string,
  userAnswer: string,
  question: QuizQuestion,
  article: ArticleLesson,
  isCorrect: boolean
): Promise<EssayFeedback> {
  try {
    const prompt = buildFeedbackPrompt(userAnswer, question, article, isCorrect);

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
    const feedback: EssayFeedback = JSON.parse(jsonStr);

    return feedback;
  } catch (error) {
    console.error('Feedback generation failed:', error);
    // 오류 발생 시 기본 피드백 반환
    return getDefaultFeedback(isCorrect);
  }
}

/**
 * 피드백 프롬프트 생성
 */
function buildFeedbackPrompt(
  userAnswer: string,
  question: QuizQuestion,
  article: ArticleLesson,
  isCorrect: boolean
): string {
  return `당신은 경제학 교육 전문가입니다. 학생의 서술형 답안을 평가하고 건설적인 피드백을 제공해야 합니다.

## 문제 정보
제목: ${article.title}
질문: ${question.question}
기사 요약: ${article.summary}

## 학생 답안
"${userAnswer}"

## 채점 결과
${isCorrect ? '정답' : '오답'}

## 평가 요청

다음 JSON 형식으로 피드백을 작성해주세요:

\`\`\`json
{
  "isCorrect": ${isCorrect},
  "feedback": "전체적인 피드백 (2-3문장). ${isCorrect ? '좋은 점을 칭찬하고 더 나아갈 방향을 제시' : '오답 이유를 설명하고 올바른 개념 제시'}",
  "strengths": [
    "답변의 강점 1",
    "답변의 강점 2"
  ],
  "improvements": [
    "개선할 점 1",
    "개선할 점 2"
  ],
  "economicConcepts": [
    "답변에서 다룬 경제 개념 1",
    "답변에서 다룬 경제 개념 2"
  ],
  "explanation": "상세한 설명 (100-150자). ${isCorrect ? '답변이 왜 정답인지, 어떤 경제 원리가 적용되었는지 설명' : '정답이 무엇인지, 왜 그것이 정답인지 설명'}"
}
\`\`\`

## 주의사항
1. 학생의 노력을 인정하고 존중하는 태도 유지
2. 경제 개념을 명확하고 이해하기 쉽게 설명
3. 실생활 예시를 포함하여 설명
4. 한국어로 작성
5. 피드백은 건설적이고 동기부여가 되도록 작성`;
}

/**
 * 기본 피드백 반환 (API 오류 시)
 */
function getDefaultFeedback(isCorrect: boolean): EssayFeedback {
  if (isCorrect) {
    return {
      isCorrect: true,
      feedback: '좋은 답변입니다! 경제 개념을 잘 이해하고 있습니다.',
      strengths: ['명확한 설명', '관련 개념 이해'],
      improvements: [],
      economicConcepts: [],
      explanation: '이 답변은 기사의 핵심 내용을 정확히 파악하고 있습니다.',
    };
  } else {
    return {
      isCorrect: false,
      feedback: '다시 한 번 생각해보세요. 기사의 핵심 개념을 다시 읽어보고 답변해보세요.',
      strengths: [],
      improvements: ['기사의 핵심 내용 재검토', '경제 개념의 정확한 이해'],
      economicConcepts: [],
      explanation: '정답을 위해서는 기사에서 제시한 경제 원리를 더 깊이 있게 이해할 필요가 있습니다.',
    };
  }
}
