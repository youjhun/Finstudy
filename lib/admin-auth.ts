import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_TOKEN_KEY = 'finstudy-admin-token';
const ADMIN_PASSWORD = 'finstudy2024'; // 실제 운영 환경에서는 서버에서 관리

/**
 * 관리자 로그인
 */
export async function loginAsAdmin(password: string): Promise<boolean> {
  if (password === ADMIN_PASSWORD) {
    const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem(ADMIN_TOKEN_KEY, token);
    return true;
  }
  return false;
}

/**
 * 관리자 로그아웃
 */
export async function logoutAdmin(): Promise<void> {
  await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
}

/**
 * 현재 사용자가 관리자인지 확인
 */
export async function isAdmin(): Promise<boolean> {
  const token = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
  return !!token;
}

/**
 * 관리자 토큰 가져오기
 */
export async function getAdminToken(): Promise<string | null> {
  return await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
}
