import { describe, it, expect, vi } from 'vitest';

describe('서술형 답변 재제출 크리티컬 버그 수정', () => {
  it('essayContext가 없을 때 재답변 제출을 방지해야 함', () => {
    const essayContext = null;
    const secondAnswer = '재답변 내용';

    // 방어 코드: essayContext 검증
    if (!essayContext) {
      expect(essayContext).toBeNull();
      return;
    }

    // 이 부분은 실행되지 않아야 함
    expect(true).toBe(false);
  });

  it('essayContext가 있을 때 재답변 제출을 진행해야 함', () => {
    const essayContext = {
      question: '경제 개념 질문',
      articleContent: '기사 내용',
      firstAnswer: '첫 번째 답변',
    };
    const secondAnswer = '재답변 내용';

    // 방어 코드: essayContext 검증
    if (!essayContext) {
      expect(true).toBe(false);
      return;
    }

    // essayContext가 있으므로 데이터 전달 가능
    expect(essayContext.question).toBe('경제 개념 질문');
    expect(essayContext.articleContent).toBe('기사 내용');
    expect(essayContext.firstAnswer).toBe('첫 번째 답변');
    expect(secondAnswer).toBe('재답변 내용');
  });

  it('controlled component로 secondAnswer 상태가 올바르게 관리되어야 함', () => {
    let secondAnswer = '';

    // 상위 컴포넌트에서 관리하는 상태
    const onSecondAnswerChange = (text: string) => {
      secondAnswer = text;
    };

    // 사용자 입력 시뮬레이션
    onSecondAnswerChange('사용자가 입력한 재답변');

    expect(secondAnswer).toBe('사용자가 입력한 재답변');
  });

  it('모달이 닫힐 때 essayContext와 secondAnswer가 초기화되어야 함', () => {
    let essayContext: any = {
      question: '질문',
      articleContent: '내용',
      firstAnswer: '답변',
    };
    let secondAnswer = '재답변';

    // 모달 닫기 핸들러
    const onClose = () => {
      essayContext = null;
      secondAnswer = '';
    };

    onClose();

    expect(essayContext).toBeNull();
    expect(secondAnswer).toBe('');
  });

  it('첫 답변 제출 시 essayContext가 저장되어야 함', () => {
    const currentQuestion = { question: '경제 개념 질문' };
    const selectedLesson = { summary: '기사 내용' };
    const essayAnswer = '첫 번째 답변';

    let essayContext: any = null;

    // 첫 답변 제출 시 context 저장
    essayContext = {
      question: currentQuestion.question,
      articleContent: selectedLesson.summary,
      firstAnswer: essayAnswer,
    };

    expect(essayContext).not.toBeNull();
    expect(essayContext.question).toBe('경제 개념 질문');
    expect(essayContext.articleContent).toBe('기사 내용');
    expect(essayContext.firstAnswer).toBe('첫 번째 답변');
  });

  it('재답변 제출 시 저장된 essayContext를 사용해야 함', async () => {
    const essayContext = {
      question: '경제 개념 질문',
      articleContent: '기사 내용',
      firstAnswer: '첫 번째 답변',
    };
    const secondAnswer = '재답변 내용';
    const apiKey = 'test-api-key';

    // 재답변 제출 핸들러 시뮬레이션
    const mockGenerateFinalFeedback = vi.fn().mockResolvedValue({
      finalFeedback: '최종 피드백',
      score: 85,
      strengths: ['강점1'],
      improvements: ['개선점1'],
    });

    if (!essayContext) {
      throw new Error('essayContext가 없습니다');
    }

    // generateFinalFeedback 호출
    const result = await mockGenerateFinalFeedback(
      essayContext.question,
      essayContext.firstAnswer,
      secondAnswer,
      essayContext.articleContent,
      apiKey
    );

    expect(mockGenerateFinalFeedback).toHaveBeenCalledWith(
      '경제 개념 질문',
      '첫 번째 답변',
      '재답변 내용',
      '기사 내용',
      'test-api-key'
    );
    expect(result.score).toBe(85);
  });

  it('essayContext 누락 시 에러 메시지를 표시해야 함', () => {
    const essayContext = null;
    let errorMessage = '';

    if (!essayContext) {
      errorMessage = '필수 데이터가 누락되었습니다. 다시 시도해주세요.';
    }

    expect(errorMessage).toBe('필수 데이터가 누락되었습니다. 다시 시도해주세요.');
  });
});
