import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: string;
  targetScreen?: string;
}

export interface OnboardingTutorial {
  id: string;
  name: string;
  steps: OnboardingStep[];
  completed: boolean;
  completedAt?: number;
}

export interface PremiumOnboardingState {
  certificationTutorial: OnboardingTutorial;
  weeklyReportTutorial: OnboardingTutorial;
  allCompleted: boolean;
}

const STORAGE_KEY = 'finstudy-premium-onboarding-v1';

const CERTIFICATION_TUTORIAL: OnboardingTutorial = {
  id: 'certification',
  name: 'NCS/자격증 대비 학습',
  completed: false,
  steps: [
    {
      id: 'cert-intro',
      title: '🎯 NCS/자격증 대비 학습',
      description: 'AFPK, 투자자산운용사, TESAT 등 주요 금융 자격증을 준비할 수 있습니다.',
      icon: '📚',
      action: 'next',
    },
    {
      id: 'cert-features',
      title: '✨ 주요 기능',
      description: '자격증별 기출 문제, 난이도 필터링, 진행도 추적으로 효율적인 학습을 지원합니다.',
      icon: '⚡',
      action: 'next',
    },
    {
      id: 'cert-start',
      title: '🚀 지금 시작하세요',
      description: '학습 탭에서 "NCS/자격증 대비" 버튼을 클릭하여 원하는 자격증을 선택하고 학습을 시작하세요.',
      icon: '→',
      action: 'complete',
      targetScreen: 'certification',
    },
  ],
};

const WEEKLY_REPORT_TUTORIAL: OnboardingTutorial = {
  id: 'weekly-report',
  name: '주간 금융 문해력 리포트',
  completed: false,
  steps: [
    {
      id: 'report-intro',
      title: '📊 주간 금융 문해력 리포트',
      description: '당신의 학습 진행도를 상세하게 분석한 주간 리포트를 확인할 수 있습니다.',
      icon: '📈',
      action: 'next',
    },
    {
      id: 'report-features',
      title: '🔍 리포트 구성',
      description: '점수 변화 그래프, 취약 개념 분석, 또래 대비 백분위 등 다양한 지표를 제공합니다.',
      icon: '📋',
      action: 'next',
    },
    {
      id: 'report-insights',
      title: '💡 학습 인사이트',
      description: '약점 분석을 통해 집중해야 할 개념을 파악하고 학습 전략을 수립할 수 있습니다.',
      icon: '🧠',
      action: 'next',
    },
    {
      id: 'report-view',
      title: '✅ 프로필에서 확인',
      description: '프로필 탭에서 "주간 금융 문해력 리포트" 카드를 클릭하여 상세 리포트를 확인하세요.',
      icon: '👤',
      action: 'complete',
      targetScreen: 'profile',
    },
  ],
};

export async function getPremiumOnboardingState(): Promise<PremiumOnboardingState> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('프리미엄 온보딩 상태 로드 실패:', error);
  }

  // 기본값 반환
  return {
    certificationTutorial: CERTIFICATION_TUTORIAL,
    weeklyReportTutorial: WEEKLY_REPORT_TUTORIAL,
    allCompleted: false,
  };
}

export async function completeTutorial(tutorialId: string): Promise<void> {
  try {
    const state = await getPremiumOnboardingState();

    if (tutorialId === 'certification') {
      state.certificationTutorial.completed = true;
      state.certificationTutorial.completedAt = Date.now();
    } else if (tutorialId === 'weekly-report') {
      state.weeklyReportTutorial.completed = true;
      state.weeklyReportTutorial.completedAt = Date.now();
    }

    state.allCompleted =
      state.certificationTutorial.completed && state.weeklyReportTutorial.completed;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('튜토리얼 완료 저장 실패:', error);
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('온보딩 초기화 실패:', error);
  }
}

export async function shouldShowTutorial(tutorialId: string): Promise<boolean> {
  try {
    const state = await getPremiumOnboardingState();

    if (tutorialId === 'certification') {
      return !state.certificationTutorial.completed;
    } else if (tutorialId === 'weekly-report') {
      return !state.weeklyReportTutorial.completed;
    }

    return false;
  } catch (error) {
    console.error('튜토리얼 표시 여부 확인 실패:', error);
    return false;
  }
}
