import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_KEY = 'finstudy-premium-v1';

export interface PremiumUser {
  isPremium: boolean;
  subscriptionDate: string | null;
  expiryDate: string | null;
}

/**
 * 프리미엄 상태 초기화
 */
export async function initializePremium(): Promise<PremiumUser> {
  try {
    const existing = await AsyncStorage.getItem(PREMIUM_KEY);
    if (existing) {
      return JSON.parse(existing) as PremiumUser;
    }
    
    const defaultPremium: PremiumUser = {
      isPremium: false,
      subscriptionDate: null,
      expiryDate: null,
    };
    
    await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(defaultPremium));
    return defaultPremium;
  } catch (error) {
    console.error('프리미엄 초기화 실패:', error);
    return {
      isPremium: false,
      subscriptionDate: null,
      expiryDate: null,
    };
  }
}

/**
 * 프리미엄 상태 조회
 */
export async function getPremiumStatus(): Promise<PremiumUser> {
  try {
    const data = await AsyncStorage.getItem(PREMIUM_KEY);
    if (!data) {
      return initializePremium();
    }
    return JSON.parse(data) as PremiumUser;
  } catch (error) {
    console.error('프리미엄 상태 조회 실패:', error);
    return {
      isPremium: false,
      subscriptionDate: null,
      expiryDate: null,
    };
  }
}

/**
 * 프리미엄 구독 활성화 (테스트용 - 실제로는 결제 시스템과 연동)
 */
export async function activatePremium(daysValid: number = 30): Promise<PremiumUser> {
  try {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + daysValid * 24 * 60 * 60 * 1000);
    
    const premiumUser: PremiumUser = {
      isPremium: true,
      subscriptionDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
    };
    
    await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(premiumUser));
    return premiumUser;
  } catch (error) {
    console.error('프리미엄 활성화 실패:', error);
    throw error;
  }
}

/**
 * 프리미엄 구독 취소
 */
export async function cancelPremium(): Promise<PremiumUser> {
  try {
    const premiumUser: PremiumUser = {
      isPremium: false,
      subscriptionDate: null,
      expiryDate: null,
    };
    
    await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(premiumUser));
    return premiumUser;
  } catch (error) {
    console.error('프리미엄 취소 실패:', error);
    throw error;
  }
}

/**
 * 프리미엄 만료 여부 확인
 */
export async function isPremiumExpired(): Promise<boolean> {
  try {
    const premium = await getPremiumStatus();
    
    if (!premium.isPremium || !premium.expiryDate) {
      return true;
    }
    
    const expiryDate = new Date(premium.expiryDate);
    const now = new Date();
    
    return now > expiryDate;
  } catch (error) {
    console.error('프리미엄 만료 확인 실패:', error);
    return true;
  }
}

/**
 * 프리미엄 유효 여부 확인
 */
export async function isValidPremium(): Promise<boolean> {
  try {
    const premium = await getPremiumStatus();
    
    if (!premium.isPremium) {
      return false;
    }
    
    const isExpired = await isPremiumExpired();
    return !isExpired;
  } catch (error) {
    console.error('프리미엄 유효성 확인 실패:', error);
    return false;
  }
}

/**
 * 남은 프리미엄 기간 (일수)
 */
export async function getRemainingDays(): Promise<number> {
  try {
    const premium = await getPremiumStatus();
    
    if (!premium.isPremium || !premium.expiryDate) {
      return 0;
    }
    
    const expiryDate = new Date(premium.expiryDate);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  } catch (error) {
    console.error('남은 기간 계산 실패:', error);
    return 0;
  }
}
