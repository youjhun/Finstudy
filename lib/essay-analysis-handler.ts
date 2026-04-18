/**
 * 서술형 답변 분석 및 재질문 생성 핸들러
 * Gemini AI를 활용하여 사용자 답변을 분석하고 피드백 및 재질문 제공
 */

export interface EssayAnalysisResult {
  feedback: string;
  strengths: string[];
  improvements: string[];
  followUpQuestion: string;
  hint: string;
  finalFeedback?: string;
  score?: number;
}

export async function analyzeEssayAnswer(
  question: string,
  userAnswer: string,
  articleContent: string,
  apiKey: string
): Promise<EssayAnalysisResult> {
  if (!apiKey) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  const prompt = `당신은 경제학 교수이자 평가 전문가입니다. 다음 기사와 질문, 그리고 학생의 답변을 분석해주세요.

[기사 내용]
${articleContent}

[질문]
${question}

[학생의 답변]
${userAnswer}

다음 형식의 JSON으로 응답해주세요:
{
  "feedback": "논리적 보완점과 개선사항을 3-4문장으로 설명",
  "strengths": ["강점1", "강점2"],
  "improvements": ["개선점1", "개선점2"],
  "followUpQuestion": "학생의 답변을 바탕으로 더 깊이 있는 세부 영역을 탐구하는 재질문",
  "hint": "재질문에 대한 힌트 (1-2문장)"
}

JSON만 응답해주세요.`;

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API 오류: ${errorData?.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('Gemini API 응답이 비어있습니다.');
    }

    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;

    const result = JSON.parse(jsonStr) as EssayAnalysisResult;
    return result;
  } catch (error) {
    console.error('서술형 답변 분석 오류:', error);
    throw error;
  }
}

export async function generateFinalFeedback(
  question: string,
  firstAnswer: string,
  secondAnswer: string,
  articleContent: string,
  apiKey: string
): Promise<EssayAnalysisResult> {
  if (!apiKey) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  const prompt = `당신은 경제학 교수이자 평가 전문가입니다. 학생의 두 번의 답변을 종합적으로 평가해주세요.

[기사 내용]
${articleContent}

[질문]
${question}

[첫 번째 답변]
${firstAnswer}

[두 번째 답변 (재답변)]
${secondAnswer}

다음 형식의 JSON으로 응답해주세요:
{
  "feedback": "전체 답변 과정에 대한 종합적인 평가 (3-4문장)",
  "strengths": ["강점1", "강점2", "강점3"],
  "improvements": ["남은 개선점1", "남은 개선점2"],
  "finalFeedback": "최종 피드백 및 학습 조언 (2-3문장)",
  "score": 85
}

JSON만 응답해주세요.`;

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API 오류: ${errorData?.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('Gemini API 응답이 비어있습니다.');
    }

    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;

    const result = JSON.parse(jsonStr) as EssayAnalysisResult;
    return result;
  } catch (error) {
    console.error('최종 피드백 생성 오류:', error);
    throw error;
  }
}
