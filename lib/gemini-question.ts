/**
 * Gemini API를 통한 추가 질문 처리
 */

const MODELS = ['gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-pro'];
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function askQuestionAboutArticle(
  question: string,
  articleTitle: string,
  articleSummary: string,
  apiKey: string
): Promise<string> {
  const prompt = `
다음 기사에 대한 사용자의 질문에 답변해주세요.

[기사 정보]
제목: ${articleTitle}
요약: ${articleSummary}

[사용자 질문]
${question}

답변은 명확하고 이해하기 쉬운 한국어로 작성해주세요. 경제 개념을 설명할 때는 실생활 예시를 포함해주세요.
`;

  for (const model of MODELS) {
    try {
      const response = await fetch(
        `${API_BASE}/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.warn(`Model ${model} failed:`, errorData);
        continue;
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.warn(`Model ${model} returned invalid response`);
        continue;
      }

      const text = data.candidates[0].content.parts[0].text;

      // 마크다운 코드 블록 제거
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      return cleanedText;
    } catch (err) {
      console.warn(`Model ${model} error:`, err);
      continue;
    }
  }

  throw new Error('모든 모델 시도 실패. 나중에 다시 시도해주세요.');
}
