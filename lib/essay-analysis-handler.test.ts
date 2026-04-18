import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeEssayAnswer, generateFinalFeedback, type EssayAnalysisResult } from './essay-analysis-handler';

global.fetch = vi.fn();

const mockApiKey = 'test-api-key';
const mockQuestion = '기사의 경제 흐름을 거시적 관점에서 분석하시오.';
const mockArticleContent = '금리 인상으로 인한 경제 영향...';
const mockAnswer = '금리 인상은 물가를 낮추고 저축을 유도합니다.';

describe('EssayAnalysisHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeEssayAnswer', () => {
    it('should analyze essay answer and return feedback', async () => {
      const mockResponse: EssayAnalysisResult = {
        feedback: '논리적으로 기본 개념을 이해하고 있으나, 구체적인 사례가 부족합니다.',
        strengths: ['금리와 물가의 관계 이해', '저축 유도 효과 언급'],
        improvements: ['국제 경제에 미치는 영향 미언급', '정책적 함의 부족'],
        followUpQuestion: '만약 금리 인상이 계속되면 환율에 어떤 영향을 미칠까요?',
        hint: '외국인 투자자의 관점에서 생각해보세요.',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockResponse),
                  },
                ],
              },
            },
          ],
        }),
      });

      const result = await analyzeEssayAnswer(
        mockQuestion,
        mockAnswer,
        mockArticleContent,
        mockApiKey
      );

      expect(result).toEqual(mockResponse);
      expect(result.feedback).toBeTruthy();
      expect(result.strengths).toHaveLength(2);
      expect(result.improvements).toHaveLength(2);
      expect(result.followUpQuestion).toBeTruthy();
      expect(result.hint).toBeTruthy();
    });

    it('should throw error when API key is missing', async () => {
      await expect(
        analyzeEssayAnswer(mockQuestion, mockAnswer, mockArticleContent, '')
      ).rejects.toThrow('Gemini API 키가 설정되지 않았습니다.');
    });

    it('should throw error when API response fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { message: 'API Error' },
        }),
      });

      await expect(
        analyzeEssayAnswer(mockQuestion, mockAnswer, mockArticleContent, mockApiKey)
      ).rejects.toThrow();
    });
  });

  describe('generateFinalFeedback', () => {
    it('should generate final feedback for two answers', async () => {
      const mockFinalResponse: EssayAnalysisResult = {
        feedback: '첫 번째 답변 대비 두 번째 답변에서 환율 영향을 추가로 언급하여 개선되었습니다.',
        strengths: ['금리-물가 관계 이해', '저축 유도 효과', '환율 영향 분석'],
        improvements: ['정책적 대응 방안 부족'],
        followUpQuestion: '추가 질문',
        hint: '힌트',
        finalFeedback: '거시경제 관점에서 체계적으로 분석하는 능력을 보여주었습니다.',
        score: 78,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockFinalResponse),
                  },
                ],
              },
            },
          ],
        }),
      });

      const result = await generateFinalFeedback(
        mockQuestion,
        mockAnswer,
        '금리 인상은 환율 상승을 유도합니다.',
        mockArticleContent,
        mockApiKey
      );

      expect(result).toEqual(mockFinalResponse);
      expect(result.score).toBe(78);
      expect(result.finalFeedback).toBeTruthy();
    });

    it('should throw error when API key is missing', async () => {
      await expect(
        generateFinalFeedback(
          mockQuestion,
          mockAnswer,
          '재답변',
          mockArticleContent,
          ''
        )
      ).rejects.toThrow('Gemini API 키가 설정되지 않았습니다.');
    });

    it('should include score in final feedback', async () => {
      const mockFinalResponse: EssayAnalysisResult = {
        feedback: '종합 평가',
        strengths: ['강점1'],
        improvements: ['개선점1'],
        followUpQuestion: '추가 질문',
        hint: '힌트',
        finalFeedback: '최종 피드백',
        score: 85,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockFinalResponse),
                  },
                ],
              },
            },
          ],
        }),
      });

      const result = await generateFinalFeedback(
        mockQuestion,
        mockAnswer,
        '재답변',
        mockArticleContent,
        mockApiKey
      );

      expect(result.score).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });
});
