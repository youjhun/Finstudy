import { describe, it, expect } from 'vitest';

describe('Gemini API 키 검증', () => {
  it('EXPO_PUBLIC_GEMINI_API_KEY 환경변수가 설정되어 있어야 함', () => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe('');
    expect(apiKey?.length).toBeGreaterThan(0);
  });

  it('API 키 형식이 유효해야 함 (최소 20자)', () => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    expect(apiKey).toBeDefined();
    if (apiKey) {
      expect(apiKey.length).toBeGreaterThanOrEqual(20);
    }
  });

  it('Gemini API 호출 테스트', async () => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      expect(apiKey).toBeDefined();
      return;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: '한 단어로 답변: 경제학이란?',
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API 호출 실패:', response.status, errorData);
      }
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.candidates).toBeDefined();
      expect(data.candidates.length).toBeGreaterThan(0);
      expect(data.candidates[0].content).toBeDefined();
      expect(data.candidates[0].content.parts).toBeDefined();
      expect(data.candidates[0].content.parts[0].text).toBeDefined();
    } catch (error) {
      console.error('Gemini API 호출 오류:', error);
      throw error;
    }
  });
});
