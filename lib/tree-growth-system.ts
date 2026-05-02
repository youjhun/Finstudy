/**
 * 나무 키우기 게이미피케이션 시스템
 * 
 * 사용자의 학습 시간과 진도에 따라 나무가 성장합니다.
 * 성장 단계: 씨앗 → 새싹 → 어린 나무 → 나무 → 울창한 나무
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type TreeStage = 'seed' | 'sprout' | 'sapling' | 'tree' | 'forest';

export interface TreeGrowthData {
  stage: TreeStage;
  totalStudyMinutes: number;
  totalProblemsCompleted: number;
  totalCorrectAnswers: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  createdAt: string;
  milestones: TreeMilestone[];
}

export interface TreeMilestone {
  id: string;
  stage: TreeStage;
  unlockedAt: string;
  studyMinutesAtUnlock: number;
}

const TREE_STORAGE_KEY = 'finstudy-tree-growth-v1';

// 성장 단계별 필요한 학습 시간 (분)
const STAGE_THRESHOLDS = {
  seed: 0,
  sprout: 15,      // 15분 이상
  sapling: 60,     // 1시간 이상
  tree: 300,       // 5시간 이상
  forest: 1000,    // 16시간 이상
};

// 성장 단계 정보
const STAGE_INFO = {
  seed: {
    name: '씨앗',
    emoji: '🌱',
    description: '새로운 학습의 시작',
    color: '#8B7355',
  },
  sprout: {
    name: '새싹',
    emoji: '🌿',
    description: '첫 싹이 돋았어요',
    color: '#90EE90',
  },
  sapling: {
    name: '어린 나무',
    emoji: '🌳',
    description: '자라나는 나무',
    color: '#228B22',
  },
  tree: {
    name: '나무',
    emoji: '🌲',
    description: '튼튼한 나무',
    color: '#006400',
  },
  forest: {
    name: '울창한 숲',
    emoji: '🌲🌳🌲',
    description: '무성한 숲을 이루었어요',
    color: '#004D00',
  },
};

/**
 * 트리 성장 데이터 초기화
 */
export async function initializeTreeGrowth(): Promise<TreeGrowthData> {
  const existing = await getTreeGrowthData();
  if (existing) return existing;

  const newData: TreeGrowthData = {
    stage: 'seed',
    totalStudyMinutes: 0,
    totalProblemsCompleted: 0,
    totalCorrectAnswers: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    milestones: [
      {
        id: 'seed-0',
        stage: 'seed',
        unlockedAt: new Date().toISOString(),
        studyMinutesAtUnlock: 0,
      },
    ],
  };

  await AsyncStorage.setItem(TREE_STORAGE_KEY, JSON.stringify(newData));
  return newData;
}

/**
 * 트리 성장 데이터 조회
 */
export async function getTreeGrowthData(): Promise<TreeGrowthData | null> {
  try {
    const data = await AsyncStorage.getItem(TREE_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('트리 데이터 조회 실패:', error);
    return null;
  }
}

/**
 * 학습 세션 완료 후 트리 성장 업데이트
 */
export async function updateTreeGrowth(
  studyMinutes: number,
  problemsCompleted: number,
  correctAnswers: number
): Promise<TreeGrowthData> {
  let data = await getTreeGrowthData();
  if (!data) {
    data = await initializeTreeGrowth();
  }

  const today = new Date().toISOString().split('T')[0];
  const lastStudyDate = data.lastStudyDate;

  // 스트릭 업데이트
  if (lastStudyDate === today) {
    // 오늘 이미 공부함 - 스트릭 유지
  } else if (new Date(today).getTime() - new Date(lastStudyDate).getTime() === 86400000) {
    // 어제 공부함 - 스트릭 연장
    data.currentStreak += 1;
    data.longestStreak = Math.max(data.currentStreak, data.longestStreak);
  } else {
    // 스트릭 끊김
    data.currentStreak = 1;
  }

  // 학습 데이터 누적
  data.totalStudyMinutes += studyMinutes;
  data.totalProblemsCompleted += problemsCompleted;
  data.totalCorrectAnswers += correctAnswers;
  data.lastStudyDate = today;

  // 성장 단계 업데이트
  const newStage = getStageByMinutes(data.totalStudyMinutes);
  if (newStage !== data.stage) {
    data.stage = newStage;
    data.milestones.push({
      id: `${newStage}-${Date.now()}`,
      stage: newStage,
      unlockedAt: new Date().toISOString(),
      studyMinutesAtUnlock: data.totalStudyMinutes,
    });
  }

  await AsyncStorage.setItem(TREE_STORAGE_KEY, JSON.stringify(data));
  return data;
}

/**
 * 학습 시간에 따른 성장 단계 결정
 */
export function getStageByMinutes(minutes: number): TreeStage {
  if (minutes >= STAGE_THRESHOLDS.forest) return 'forest';
  if (minutes >= STAGE_THRESHOLDS.tree) return 'tree';
  if (minutes >= STAGE_THRESHOLDS.sapling) return 'sapling';
  if (minutes >= STAGE_THRESHOLDS.sprout) return 'sprout';
  return 'seed';
}

/**
 * 현재 성장 단계의 정보 조회
 */
export function getStageInfo(stage: TreeStage) {
  return STAGE_INFO[stage];
}

/**
 * 다음 성장 단계까지 필요한 학습 시간
 */
export function getMinutesToNextStage(currentMinutes: number): number {
  const stages: TreeStage[] = ['seed', 'sprout', 'sapling', 'tree', 'forest'];
  const currentStage = getStageByMinutes(currentMinutes);
  const currentIndex = stages.indexOf(currentStage);

  if (currentIndex === stages.length - 1) {
    return 0; // 최고 단계
  }

  const nextStage = stages[currentIndex + 1];
  const nextThreshold = STAGE_THRESHOLDS[nextStage];
  return Math.max(0, nextThreshold - currentMinutes);
}

/**
 * 성장 진도 비율 (0-100)
 */
export function getGrowthProgress(currentMinutes: number): number {
  const stages: TreeStage[] = ['seed', 'sprout', 'sapling', 'tree', 'forest'];
  const currentStage = getStageByMinutes(currentMinutes);
  const currentIndex = stages.indexOf(currentStage);

  if (currentIndex === stages.length - 1) {
    return 100; // 최고 단계
  }

  const currentThreshold = STAGE_THRESHOLDS[currentStage];
  const nextThreshold = STAGE_THRESHOLDS[stages[currentIndex + 1]];

  const progress = ((currentMinutes - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * 더미 데이터 생성 (테스트용)
 */
export async function createDummyTreeData(): Promise<TreeGrowthData> {
  const dummyData: TreeGrowthData = {
    stage: 'tree',
    totalStudyMinutes: 487,
    totalProblemsCompleted: 156,
    totalCorrectAnswers: 124,
    currentStreak: 12,
    longestStreak: 28,
    lastStudyDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45일 전
    milestones: [
      {
        id: 'seed-0',
        stage: 'seed',
        unlockedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        studyMinutesAtUnlock: 0,
      },
      {
        id: 'sprout-1',
        stage: 'sprout',
        unlockedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        studyMinutesAtUnlock: 25,
      },
      {
        id: 'sapling-2',
        stage: 'sapling',
        unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        studyMinutesAtUnlock: 75,
      },
      {
        id: 'tree-3',
        stage: 'tree',
        unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        studyMinutesAtUnlock: 320,
      },
    ],
  };

  await AsyncStorage.setItem(TREE_STORAGE_KEY, JSON.stringify(dummyData));
  return dummyData;
}

/**
 * 트리 데이터 초기화 (테스트용)
 */
export async function resetTreeData(): Promise<void> {
  await AsyncStorage.removeItem(TREE_STORAGE_KEY);
}

/**
 * 모든 성장 단계 정보 조회
 */
export function getAllStageInfo() {
  return STAGE_INFO;
}

/**
 * 성장 단계별 임계값 조회
 */
export function getStageThresholds() {
  return STAGE_THRESHOLDS;
}
