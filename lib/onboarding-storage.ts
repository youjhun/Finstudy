import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingData {
  completed: boolean;
  level: 'LEVEL 1' | 'LEVEL 2' | 'LEVEL 3';
  score: number;
  interests: string[];
  completedAt: number;
}

const ONBOARDING_KEY = 'onboarding-data-v1';

/**
 * 온보딩 완료 여부 확인
 */
export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (!data) return false;
    const parsed = JSON.parse(data) as OnboardingData;
    return parsed.completed === true;
  } catch (err) {
    console.error('온보딩 상태 확인 실패:', err);
    return false;
  }
}

/**
 * 온보딩 데이터 저장
 */
export async function saveOnboardingData(data: Omit<OnboardingData, 'completed' | 'completedAt'>) {
  try {
    const onboardingData: OnboardingData = {
      ...data,
      completed: true,
      completedAt: Date.now(),
    };
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(onboardingData));
  } catch (err) {
    console.error('온보딩 데이터 저장 실패:', err);
  }
}

/**
 * 온보딩 데이터 조회
 */
export async function getOnboardingData(): Promise<OnboardingData | null> {
  try {
    const data = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (!data) return null;
    return JSON.parse(data) as OnboardingData;
  } catch (err) {
    console.error('온보딩 데이터 조회 실패:', err);
    return null;
  }
}

/**
 * 온보딩 데이터 초기화 (테스트용)
 */
export async function resetOnboarding() {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (err) {
    console.error('온보딩 초기화 실패:', err);
  }
}
