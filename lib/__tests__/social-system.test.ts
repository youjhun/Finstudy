/**
 * FinStudy 사회 기능 단위 테스트
 * AsyncStorage 의존성 제거 - 순수 함수만 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  getXPToNextLevel,
  getLevelProgress,
} from '@/lib/social-system';

describe('사회 기능 시스템', () => {
  // ============= 레벨 시스템 테스트 =============

  describe('레벨 계산', () => {
    it('0 XP는 레벨 1이어야 함', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('100 XP는 레벨 2이어야 함', () => {
      expect(calculateLevel(100)).toBe(2);
    });

    it('400 XP는 레벨 3이어야 함', () => {
      expect(calculateLevel(400)).toBe(3);
    });

    it('1000 XP는 레벨 4 이상이어야 함', () => {
      expect(calculateLevel(1000)).toBeGreaterThanOrEqual(4);
    });

    it('5000 XP는 높은 레벨이어야 함', () => {
      expect(calculateLevel(5000)).toBeGreaterThanOrEqual(8);
    });
  });

  describe('다음 레벨까지 필요 XP', () => {
    it('레벨 1에서 필요한 XP는 100이어야 함', () => {
      expect(getXPToNextLevel(0)).toBe(100);
    });

    it('레벨 2에서 필요한 XP는 300이어야 함', () => {
      expect(getXPToNextLevel(100)).toBe(300);
    });

    it('레벨 3에서 필요한 XP는 500이어야 함', () => {
      expect(getXPToNextLevel(400)).toBe(500);
    });
  });

  describe('레벨 진행도', () => {
    it('0 XP는 0% 진행도여야 함', () => {
      expect(getLevelProgress(0)).toBe(0);
    });

    it('50 XP는 50% 진행도여야 함', () => {
      expect(getLevelProgress(50)).toBe(50);
    });

    it('100 XP는 0% 진행도여야 함 (레벨 2 시작)', () => {
      expect(getLevelProgress(100)).toBe(0);
    });

    it('200 XP는 33% 진행도여야 함 (레벨 2에서)', () => {
      // 레벨 2: 100-399 XP, 필요 XP 300
      // 200 XP = 100 XP 진행 / 300 XP 필요 = 33%
      expect(getLevelProgress(200)).toBe(33);
    });

    it('진행도는 0-100 범위여야 함', () => {
      for (let xp = 0; xp <= 10000; xp += 100) {
        const progress = getLevelProgress(xp);
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      }
    });
  });

  // ============= 레벨 시스템 통합 테스트 =============

  describe('레벨 시스템 통합', () => {
    it('레벨이 순차적으로 증가해야 함', () => {
      const xpValues = [0, 100, 400, 900, 1600, 2500];
      const levels = xpValues.map(xp => calculateLevel(xp));

      for (let i = 0; i < levels.length - 1; i++) {
        expect(levels[i]).toBeLessThanOrEqual(levels[i + 1]);
      }
    });

    it('XP가 증가하면 다음 레벨까지 필요 XP가 감소해야 함', () => {
      const xp1 = 0;
      const xp2 = 50;

      const needed1 = getXPToNextLevel(xp1);
      const needed2 = getXPToNextLevel(xp2);

      expect(needed2).toBeLessThan(needed1);
    });

    it('레벨 업 시 진행도가 0%로 리셋되어야 함', () => {
      // 레벨 2 진행 중
      const progress1 = getLevelProgress(150);
      expect(progress1).toBeGreaterThan(0);

      // 레벨 2 완료 직전
      const progress2 = getLevelProgress(399);
      expect(progress2).toBeGreaterThan(90);

      // 레벨 3 시작
      const progress3 = getLevelProgress(400);
      expect(progress3).toBe(0);
    });
  });

  // ============= 경계값 테스트 =============

  describe('경계값 테스트', () => {
    it('음수 XP는 레벨 1이어야 함', () => {
      expect(calculateLevel(-100)).toBe(1);
    });

    it('매우 큰 XP는 높은 레벨이어야 함', () => {
      expect(calculateLevel(1000000)).toBeGreaterThan(100);
    });

    it('레벨 경계에서 정확히 계산되어야 함', () => {
      // 레벨 2 경계
      expect(calculateLevel(99)).toBe(1);
      expect(calculateLevel(100)).toBe(2);

      // 레벨 3 경계
      expect(calculateLevel(399)).toBe(2);
      expect(calculateLevel(400)).toBe(3);
    });
  });

  // ============= 게임 메커닉 테스트 =============

  describe('게임 메커닉', () => {
    it('레벨 1에서 100 XP 획득 시 레벨 2가 되어야 함', () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(100)).toBe(2);
    });

    it('레벨 2에서 300 XP 추가 획득 시 레벨 3이 되어야 함', () => {
      expect(calculateLevel(100)).toBe(2);
      expect(calculateLevel(400)).toBe(3);
    });

    it('레벨 업 시 필요 XP가 증가해야 함', () => {
      const xpToLevel2 = getXPToNextLevel(0); // 100
      const xpToLevel3 = getXPToNextLevel(100); // 300
      const xpToLevel4 = getXPToNextLevel(400); // 500

      expect(xpToLevel2).toBe(100);
      expect(xpToLevel3).toBe(300);
      expect(xpToLevel4).toBe(500);
    });

    it('진행도 기반 UI 업데이트 시뮬레이션', () => {
      // 사용자가 레벨 1에서 학습 중
      let currentXP = 0;
      let currentLevel = calculateLevel(currentXP);
      let progress = getLevelProgress(currentXP);

      expect(currentLevel).toBe(1);
      expect(progress).toBe(0);

      // 50 XP 획득
      currentXP += 50;
      progress = getLevelProgress(currentXP);
      expect(progress).toBe(50);

      // 50 XP 더 획득 (레벨 업)
      currentXP += 50;
      currentLevel = calculateLevel(currentXP);
      progress = getLevelProgress(currentXP);

      expect(currentLevel).toBe(2);
      expect(progress).toBe(0); // 새 레벨에서 0%부터 시작
    });
  });

  // ============= 성능 테스트 =============

  describe('성능', () => {
    it('대량의 XP 계산이 빠르게 수행되어야 함', () => {
      const startTime = performance.now();

      for (let xp = 0; xp <= 100000; xp += 100) {
        calculateLevel(xp);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 1000번 계산이 100ms 이내에 완료되어야 함
      expect(duration).toBeLessThan(100);
    });

    it('진행도 계산이 빠르게 수행되어야 함', () => {
      const startTime = performance.now();

      for (let xp = 0; xp <= 100000; xp += 100) {
        getLevelProgress(xp);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
    });
  });
});
