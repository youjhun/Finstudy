import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getPremiumStatus,
  isValidPremium,
  getRemainingDays,
  type PremiumUser,
} from './premium-system';

interface PremiumContextType {
  isPremium: boolean;
  premiumUser: PremiumUser | null;
  remainingDays: number;
  isLoading: boolean;
  refreshPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUser, setPremiumUser] = useState<PremiumUser | null>(null);
  const [remainingDays, setRemainingDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPremiumStatus = async () => {
    try {
      const status = await getPremiumStatus();
      setPremiumUser(status);

      const isValid = await isValidPremium();
      setIsPremium(isValid);

      if (isValid) {
        const days = await getRemainingDays();
        setRemainingDays(days);
      } else {
        setRemainingDays(0);
      }
    } catch (error) {
      console.error('프리미엄 상태 갱신 실패:', error);
      setIsPremium(false);
      setRemainingDays(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPremiumStatus();

    // 30초마다 프리미엄 상태 확인 (만료 감지)
    const interval = setInterval(refreshPremiumStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        premiumUser,
        remainingDays,
        isLoading,
        refreshPremiumStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextType {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium은 PremiumProvider 내에서만 사용 가능합니다.');
  }
  return context;
}
