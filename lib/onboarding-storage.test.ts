import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isOnboardingCompleted,
  saveOnboardingData,
  getOnboardingData,
  resetOnboarding,
} from './onboarding-storage';

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
    clear: vi.fn(() => {
      Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
      return Promise.resolve();
    }),
  },
}));

describe('온보딩 저장소 시스템', () => {
  beforeEach(() => {
    // 각 테스트 전에 Mock 저장소 초기화
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  afterEach(() => {
    // 각 테스트 후에 Mock 저장소 정리
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('초기 상태에서 온보딩 미완료 상태를 반환해야 함', async () => {
    const completed = await isOnboardingCompleted();
    expect(completed).toBe(false);
  });

  it('온보딩 데이터를 저장할 수 있어야 함', async () => {
    const testData = {
      level: 'LEVEL 2' as const,
      score: 4,
      interests: ['주식/투자', '부동산/청약'],
    };

    await saveOnboardingData(testData);
    const completed = await isOnboardingCompleted();
    expect(completed).toBe(true);
  });

  it('저장된 온보딩 데이터를 조회할 수 있어야 함', async () => {
    const testData = {
      level: 'LEVEL 3' as const,
      score: 6,
      interests: ['거시경제(금리, 물가)'],
    };

    await saveOnboardingData(testData);
    const data = await getOnboardingData();

    expect(data).not.toBeNull();
    expect(data?.level).toBe('LEVEL 3');
    expect(data?.score).toBe(6);
    expect(data?.interests).toEqual(['거시경제(금리, 물가)']);
    expect(data?.completed).toBe(true);
    expect(data?.completedAt).toBeDefined();
  });

  it('온보딩 데이터 초기화 후 미완료 상태로 돌아가야 함', async () => {
    const testData = {
      level: 'LEVEL 1' as const,
      score: 1,
      interests: [],
    };

    await saveOnboardingData(testData);
    let completed = await isOnboardingCompleted();
    expect(completed).toBe(true);

    await resetOnboarding();
    completed = await isOnboardingCompleted();
    expect(completed).toBe(false);

    const data = await getOnboardingData();
    expect(data).toBeNull();
  });

  it('LEVEL 1 데이터를 저장할 수 있어야 함', async () => {
    const testData = {
      level: 'LEVEL 1' as const,
      score: 1,
      interests: ['주식/투자'],
    };

    await saveOnboardingData(testData);
    const data = await getOnboardingData();

    expect(data?.level).toBe('LEVEL 1');
    expect(data?.score).toBe(1);
  });

  it('LEVEL 2 데이터를 저장할 수 있어야 함', async () => {
    const testData = {
      level: 'LEVEL 2' as const,
      score: 3,
      interests: ['부동산/청약', '세금/재테크 기초'],
    };

    await saveOnboardingData(testData);
    const data = await getOnboardingData();

    expect(data?.level).toBe('LEVEL 2');
    expect(data?.score).toBe(3);
    expect(data?.interests.length).toBe(2);
  });

  it('LEVEL 3 데이터를 저장할 수 있어야 함', async () => {
    const testData = {
      level: 'LEVEL 3' as const,
      score: 6,
      interests: ['거시경제(금리, 물가)', '트렌드/소비'],
    };

    await saveOnboardingData(testData);
    const data = await getOnboardingData();

    expect(data?.level).toBe('LEVEL 3');
    expect(data?.score).toBe(6);
  });

  it('관심사가 없는 경우도 저장할 수 있어야 함', async () => {
    const testData = {
      level: 'LEVEL 1' as const,
      score: 0,
      interests: [],
    };

    await saveOnboardingData(testData);
    const data = await getOnboardingData();

    expect(data?.interests).toEqual([]);
  });

  it('저장된 데이터에 completedAt 타임스탬프가 포함되어야 함', async () => {
    const beforeSave = Date.now();
    const testData = {
      level: 'LEVEL 2' as const,
      score: 4,
      interests: ['주식/투자'],
    };

    await saveOnboardingData(testData);
    const data = await getOnboardingData();
    const afterSave = Date.now();

    expect(data?.completedAt).toBeDefined();
    expect(data?.completedAt).toBeGreaterThanOrEqual(beforeSave);
    expect(data?.completedAt).toBeLessThanOrEqual(afterSave);
  });

  it('데이터가 없을 때 getOnboardingData는 null을 반환해야 함', async () => {
    const data = await getOnboardingData();
    expect(data).toBeNull();
  });
});
