import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getPremiumOnboardingState,
  shouldShowTutorial,
  type OnboardingTutorial,
  type PremiumOnboardingState,
} from './premium-onboarding-system';

interface PremiumOnboardingContextType {
  onboardingState: PremiumOnboardingState | null;
  isLoading: boolean;
  shouldShowCertificationTutorial: boolean;
  shouldShowWeeklyReportTutorial: boolean;
  refreshOnboardingState: () => Promise<void>;
}

const PremiumOnboardingContext = createContext<
  PremiumOnboardingContextType | undefined
>(undefined);

export function PremiumOnboardingProvider({ children }: { children: ReactNode }) {
  const [onboardingState, setOnboardingState] = useState<PremiumOnboardingState | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowCertificationTutorial, setShouldShowCertificationTutorial] =
    useState(false);
  const [shouldShowWeeklyReportTutorial, setShouldShowWeeklyReportTutorial] =
    useState(false);

  const refreshOnboardingState = async () => {
    try {
      const state = await getPremiumOnboardingState();
      setOnboardingState(state);

      const showCert = await shouldShowTutorial('certification');
      setShouldShowCertificationTutorial(showCert);

      const showReport = await shouldShowTutorial('weekly-report');
      setShouldShowWeeklyReportTutorial(showReport);
    } catch (error) {
      console.error('프리미엄 온보딩 상태 갱신 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshOnboardingState();
  }, []);

  return (
    <PremiumOnboardingContext.Provider
      value={{
        onboardingState,
        isLoading,
        shouldShowCertificationTutorial,
        shouldShowWeeklyReportTutorial,
        refreshOnboardingState,
      }}
    >
      {children}
    </PremiumOnboardingContext.Provider>
  );
}

export function usePremiumOnboarding(): PremiumOnboardingContextType {
  const context = useContext(PremiumOnboardingContext);
  if (context === undefined) {
    throw new Error(
      'usePremiumOnboarding은 PremiumOnboardingProvider 내에서만 사용 가능합니다.'
    );
  }
  return context;
}
