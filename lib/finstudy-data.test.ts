import { describe, expect, it } from 'vitest';

import { defaultProgress, learningStages, lessons } from './finstudy-data';

describe('finstudy data', () => {
  it('모든 기사에는 3개의 퀴즈 문항이 있다', () => {
    expect(lessons.length).toBeGreaterThan(0);
    lessons.forEach((lesson) => {
      expect(lesson.quiz).toHaveLength(3);
    });
  });

  it('각 퀴즈의 정답 인덱스는 선택지 범위 안에 있다', () => {
    lessons.forEach((lesson) => {
      lesson.quiz.forEach((question) => {
        if (question.type === 'multiple-choice') {
          expect(question.answer).toBeGreaterThanOrEqual(0);
          expect(question.answer).toBeLessThan(question.choices?.length ?? 0);
        }
      });
    });
  });

  it('학습 경로에는 현재 단계와 잠금 단계가 함께 존재한다', () => {
    expect(learningStages.some((stage) => !stage.locked)).toBe(true);
    expect(learningStages.some((stage) => stage.locked)).toBe(true);
  });

  it('기본 진행 상태는 빈 완료 목록으로 시작한다', () => {
    expect(defaultProgress.completedLessonIds).toEqual([]);
    expect(defaultProgress.xp).toBeGreaterThan(0);
  });
});
