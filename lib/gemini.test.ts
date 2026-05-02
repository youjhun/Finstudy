import { describe, expect, it } from 'vitest';

describe('Gemini API', () => {
  it('VITE_GEMINI_API_KEY 환경변수가 설정되어 있어야 한다', () => {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toBeTruthy();
    expect(typeof apiKey).toBe('string');
    expect(apiKey!.length).toBeGreaterThan(0);
  });

  it('API 키 형식이 유효해야 한다 (최소 20자)', () => {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    expect(apiKey!.length).toBeGreaterThanOrEqual(20);
  });
});
