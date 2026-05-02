import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processArticlesBatch } from './gemini-client';

describe('Gemini API Error Handling & Model Fallback', () => {
  const mockArticles = [
    {
      title: '한국 경제 성장률 발표',
      content: '중앙은행이 기준금리를 인하했습니다.',
      url: 'https://example.com/article1',
      source: 'Example News',
    },
  ];

  const mockValidResponse = {
    candidates: [
      {
        content: {
          parts: [
            {
              text: JSON.stringify([
                {
                  title: '한국 경제 성장률 발표',
                  summary: '중앙은행이 기준금리를 인하했습니다.',
                  keyPoints: ['금리 인하', '경제 부양', '인플레이션 관리'],
                  terms: ['기준금리', '금융통화위원회', '인플레이션'],
                  quiz: [
                    {
                      question: '중앙은행이 기준금리를 인하한 이유는?',
                      choices: ['경제 부양', '인플레이션 억제', '환율 관리', '국채 수익률 상승'],
                      answer: 0,
                      explanation: '기준금리 인하는 경제 부양을 위한 확대 금융정책입니다.',
                      difficulty: 'easy',
                      isPremium: true,
                    },
                    {
                      question: '기준금리 인하의 즉각적인 효과는?',
                      choices: ['금리 상승', '대출 금리 하락', '저축 수익 증가', '환율 상승'],
                      answer: 1,
                      explanation: '기준금리 인하로 은행 대출 금리가 하락합니다.',
                      difficulty: 'easy',
                      isPremium: true,
                    },
                    {
                      question: '금리 인하가 부동산 시장에 미치는 영향은?',
                      choices: ['집값 하락', '집값 상승', '거래량 감소', '전세금 상승'],
                      answer: 1,
                      explanation: '낮은 금리는 주택 구매 수요를 증가시켜 집값 상승을 초래합니다.',
                      difficulty: 'medium',
                      isPremium: true,
                    },
                    {
                      question: '장기적으로 금리 인하의 부작용은?',
                      choices: ['자산 거품', '금융 안정성', '환율 강세', '수출 증가'],
                      answer: 0,
                      explanation: '과도한 금리 인하는 자산 거품을 유발할 수 있습니다.',
                      difficulty: 'hard',
                      isPremium: true,
                    },
                    {
                      question: '거시경제적으로 금리 인하 정책의 종합적 평가는?',
                      choices: ['단기 부양, 장기 위험', '완전히 긍정적', '완전히 부정적', '효과 없음'],
                      answer: 0,
                      explanation: '금리 인하는 단기 경제 부양 효과가 있지만 장기적으로는 자산 거품, 인플레이션 등의 위험이 있습니다.',
                      difficulty: 'hard',
                      isPremium: true,
                    },
                  ],
                },
              ]),
            },
          ],
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle JSON parsing errors gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: 'Invalid JSON {broken}',
                    },
                  ],
                },
              },
            ],
          }),
      })
    ) as any;

    await expect(processArticlesBatch(mockArticles, 'test-key')).rejects.toThrow(
      /JSON 파싱 오류|cannot read properties/i
    );
  });

  it('should remove markdown code blocks before parsing', async () => {
    const jsonContent = JSON.stringify(JSON.parse(mockValidResponse.candidates[0].content.parts[0].text));
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: '```json\n' + jsonContent + '\n```',
                    },
                  ],
                },
              },
            ],
          }),
      })
    ) as any;

    const result = await processArticlesBatch(mockArticles, 'test-key');
    expect(result).toHaveLength(1);
    expect(result[0].quiz).toHaveLength(5);
  });

  it('should fallback to secondary models on high demand error', async () => {
    let callCount = 0;
    global.fetch = vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        // First model fails with high demand
        return Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              error: {
                message: 'Resource exhausted due to high demand',
              },
            }),
        });
      }
      // Second model succeeds
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockValidResponse),
      });
    }) as any;

    const result = await processArticlesBatch(mockArticles, 'test-key');
    expect(result).toHaveLength(1);
    expect(callCount).toBeGreaterThan(1); // Should have retried
  });

  it('should validate quiz structure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify([
                        {
                          title: 'Test Article',
                          summary: 'Test summary',
                          keyPoints: ['point1'],
                          terms: ['term1'],
                          quiz: [
                            {
                              question: 'Q1',
                              choices: ['A', 'B', 'C'],
                              answer: 0,
                              explanation: 'Explanation',
                              difficulty: 'easy',
                              isPremium: true,
                            },
                          ],
                        },
                      ]),
                    },
                  ],
                },
              },
            ],
          }),
      })
    ) as any;

    await expect(processArticlesBatch(mockArticles, 'test-key')).rejects.toThrow(
      /정확히 5문제여야 합니다|형식이 올바르지 않습니다/
    );
  });

  it('should handle missing API key', async () => {
    await expect(processArticlesBatch(mockArticles, '')).rejects.toThrow(
      /API 키가 설정되지 않았습니다/
    );
  });

  it('should handle empty articles array', async () => {
    const result = await processArticlesBatch([], 'test-key');
    expect(result).toEqual([]);
  });
});
