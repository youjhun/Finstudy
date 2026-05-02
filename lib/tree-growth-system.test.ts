import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getStageByMinutes,
  getGrowthProgress,
  getMinutesToNextStage,
  getStageInfo,
  getStageThresholds,
  getAllStageInfo,
} from './tree-growth-system';

// AsyncStorage 모킹 (테스트 환경에서는 사용하지 않음)
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}));

describe('Tree Growth System - Pure Functions', () => {
  describe('getStageByMinutes', () => {
    it('0분일 때 씨앗 단계여야 함', () => {
      expect(getStageByMinutes(0)).toBe('seed');
    });

    it('15분일 때 새싹 단계여야 함', () => {
      expect(getStageByMinutes(15)).toBe('sprout');
    });

    it('60분일 때 어린 나무 단계여야 함', () => {
      expect(getStageByMinutes(60)).toBe('sapling');
    });

    it('300분일 때 나무 단계여야 함', () => {
      expect(getStageByMinutes(300)).toBe('tree');
    });

    it('1000분 이상일 때 울창한 숲 단계여야 함', () => {
      expect(getStageByMinutes(1000)).toBe('forest');
      expect(getStageByMinutes(2000)).toBe('forest');
    });

    it('경계값을 정확히 처리해야 함', () => {
      expect(getStageByMinutes(14)).toBe('seed');
      expect(getStageByMinutes(15)).toBe('sprout');
      expect(getStageByMinutes(59)).toBe('sprout');
      expect(getStageByMinutes(60)).toBe('sapling');
    });
  });

  describe('getGrowthProgress', () => {
    it('씨앗 단계에서 진도를 계산해야 함', () => {
      const progress = getGrowthProgress(7); // 0~15분 사이
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
      expect(progress).toBeCloseTo(46.67, 1); // 7/15 * 100
    });

    it('새싹 단계에서 진도를 계산해야 함', () => {
      const progress = getGrowthProgress(37); // 15~60분 사이
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });

    it('최고 단계에서 100% 진도여야 함', () => {
      const progress = getGrowthProgress(1000);
      expect(progress).toBe(100);
    });

    it('단계 시작점에서 0% 진도여야 함', () => {
      const progress = getGrowthProgress(0);
      expect(progress).toBe(0);

      const progress2 = getGrowthProgress(15);
      expect(progress2).toBe(0);
    });
  });

  describe('getMinutesToNextStage', () => {
    it('씨앗에서 새싹까지 필요한 시간을 계산해야 함', () => {
      const minutesToNext = getMinutesToNextStage(0);
      expect(minutesToNext).toBe(15);
    });

    it('새싹에서 어린 나무까지 필요한 시간을 계산해야 함', () => {
      const minutesToNext = getMinutesToNextStage(15);
      expect(minutesToNext).toBe(45); // 60 - 15
    });

    it('어린 나무에서 나무까지 필요한 시간을 계산해야 함', () => {
      const minutesToNext = getMinutesToNextStage(60);
      expect(minutesToNext).toBe(240); // 300 - 60
    });

    it('최고 단계에서는 0을 반환해야 함', () => {
      const minutesToNext = getMinutesToNextStage(1000);
      expect(minutesToNext).toBe(0);
    });
  });

  describe('getStageInfo', () => {
    it('각 단계의 정보를 반환해야 함', () => {
      const seedInfo = getStageInfo('seed');
      expect(seedInfo.name).toBe('씨앗');
      expect(seedInfo.emoji).toBe('🌱');
      expect(seedInfo.description).toBeDefined();
      expect(seedInfo.color).toBeDefined();

      const forestInfo = getStageInfo('forest');
      expect(forestInfo.name).toBe('울창한 숲');
      expect(forestInfo.emoji).toBe('🌲🌳🌲');
    });

    it('모든 단계의 정보가 일관성 있어야 함', () => {
      const stages = ['seed', 'sprout', 'sapling', 'tree', 'forest'] as const;
      stages.forEach(stage => {
        const info = getStageInfo(stage);
        expect(info.name).toBeDefined();
        expect(info.emoji).toBeDefined();
        expect(info.description).toBeDefined();
        expect(info.color).toBeDefined();
      });
    });
  });

  describe('getStageThresholds', () => {
    it('모든 단계의 임계값을 반환해야 함', () => {
      const thresholds = getStageThresholds();
      
      expect(thresholds.seed).toBe(0);
      expect(thresholds.sprout).toBe(15);
      expect(thresholds.sapling).toBe(60);
      expect(thresholds.tree).toBe(300);
      expect(thresholds.forest).toBe(1000);
    });

    it('임계값이 오름차순이어야 함', () => {
      const thresholds = getStageThresholds();
      const values = [thresholds.seed, thresholds.sprout, thresholds.sapling, thresholds.tree, thresholds.forest];
      
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe('getAllStageInfo', () => {
    it('모든 단계의 정보를 반환해야 함', () => {
      const allInfo = getAllStageInfo();
      
      expect(allInfo.seed).toBeDefined();
      expect(allInfo.sprout).toBeDefined();
      expect(allInfo.sapling).toBeDefined();
      expect(allInfo.tree).toBeDefined();
      expect(allInfo.forest).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('매우 큰 학습 시간을 처리해야 함', () => {
      const stage = getStageByMinutes(10000);
      expect(stage).toBe('forest');

      const progress = getGrowthProgress(10000);
      expect(progress).toBe(100);
    });

    it('소수점 학습 시간을 처리해야 함', () => {
      const stage = getStageByMinutes(7.5);
      expect(stage).toBe('seed');

      const progress = getGrowthProgress(7.5);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });

    it('음수 학습 시간은 씨앗으로 처리해야 함', () => {
      const stage = getStageByMinutes(-10);
      expect(stage).toBe('seed');
    });
  });

  describe('Stage Progression', () => {
    it('모든 단계를 순서대로 진행할 수 있어야 함', () => {
      const stages = ['seed', 'sprout', 'sapling', 'tree', 'forest'] as const;
      const minutes = [0, 15, 60, 300, 1000];

      stages.forEach((stage, index) => {
        expect(getStageByMinutes(minutes[index])).toBe(stage);
      });
    });

    it('각 단계에서 다음 단계까지의 진도를 추적할 수 있어야 함', () => {
      const stages = ['seed', 'sprout', 'sapling', 'tree', 'forest'] as const;
      const minutes = [0, 15, 60, 300, 1000];

      for (let i = 0; i < stages.length - 1; i++) {
        const currentMinutes = minutes[i];
        const nextMinutes = minutes[i + 1];
        
        // 현재 단계에서 진도 확인
        const progress = getGrowthProgress(currentMinutes);
        expect(progress).toBe(0);
        
        // 다음 단계까지 필요한 시간 확인
        const minutesToNext = getMinutesToNextStage(currentMinutes);
        expect(minutesToNext).toBe(nextMinutes - currentMinutes);
      }
    });
  });
});
