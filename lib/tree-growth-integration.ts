/**
 * 나무 성장 시스템 통합 로직
 * 
 * 학습 세션 완료 후 나무 성장 데이터를 업데이트합니다.
 */

import { updateTreeGrowth, getTreeGrowthData } from './tree-growth-system';
import type { LearningSessionState } from './learning-session-manager';

/**
 * 학습 세션 완료 후 나무 성장 업데이트
 */
export async function updateTreeAfterSession(session: LearningSessionState, durationSeconds: number): Promise<void> {
  try {
    // 세션에서 학습 데이터 추출
    const studyMinutes = Math.ceil(durationSeconds / 60); // 초 → 분
    const problemsCompleted = session.problems.length;
    const correctAnswers = session.correctCount;

    // 나무 성장 업데이트
    await updateTreeGrowth(studyMinutes, problemsCompleted, correctAnswers);

    console.log('🌱 나무 성장 업데이트 완료:', {
      studyMinutes,
      problemsCompleted,
      correctAnswers,
    });
  } catch (error) {
    console.error('나무 성장 업데이트 실패:', error);
  }
}

/**
 * 나무 성장 데이터 통계 조회
 */
export async function getTreeGrowthStats() {
  try {
    const data = await getTreeGrowthData();
    if (!data) return null;

    return {
      stage: data.stage,
      totalStudyMinutes: data.totalStudyMinutes,
      totalProblemsCompleted: data.totalProblemsCompleted,
      correctAnswerRate: data.totalProblemsCompleted > 0 
        ? Math.round((data.totalCorrectAnswers / data.totalProblemsCompleted) * 100)
        : 0,
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      milestonesUnlocked: data.milestones.length,
    };
  } catch (error) {
    console.error('나무 성장 통계 조회 실패:', error);
    return null;
  }
}
