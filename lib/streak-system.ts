/**
 * 연속학습 스트릭 시스템
 * - 일일 학습 완료 추적
 * - 연속 학습 일수 계산
 * - 최대 스트릭 기록
 * - 캘린더 기반 시각화
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StreakData {
  completedDates: string[]; // YYYY-MM-DD 형식
  currentStreak: number;
  maxStreak: number;
  lastCompletedDate: string | null;
  totalDaysCompleted: number;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  completed: boolean;
  isToday: boolean;
  isStreakDay: boolean;
}

const STREAK_STORAGE_KEY = 'finstudy_streak_data';

/**
 * 기본 스트릭 데이터 생성
 */
export function createDefaultStreakData(): StreakData {
  return {
    completedDates: [],
    currentStreak: 0,
    maxStreak: 0,
    lastCompletedDate: null,
    totalDaysCompleted: 0,
  };
}

/**
 * 더미 데이터 생성 (45일 연속학습)
 */
export function createDummyStreakData(): StreakData {
  const today = new Date();
  const completedDates: string[] = [];

  // 45일 연속 학습 데이터 생성
  for (let i = 44; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    completedDates.push(formatDate(date));
  }

  // 3일 간격으로 추가 학습일 추가 (더 다양한 패턴)
  for (let i = 50; i <= 90; i += 3) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (!completedDates.includes(formatDate(date))) {
      completedDates.push(formatDate(date));
    }
  }

  return {
    completedDates: completedDates.sort(),
    currentStreak: 45,
    maxStreak: 45,
    lastCompletedDate: formatDate(today),
    totalDaysCompleted: completedDates.length,
  };
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 오늘 학습 완료 표시
 */
export async function markTodayAsCompleted(): Promise<StreakData> {
  const streakData = await getStreakData();
  const today = formatDate(new Date());

  if (!streakData.completedDates.includes(today)) {
    streakData.completedDates.push(today);
    streakData.totalDaysCompleted = streakData.completedDates.length;
    streakData.lastCompletedDate = today;

    // 현재 스트릭 계산
    streakData.currentStreak = calculateCurrentStreak(streakData.completedDates);
    streakData.maxStreak = Math.max(streakData.maxStreak, streakData.currentStreak);

    await saveStreakData(streakData);
  }

  return streakData;
}

/**
 * 현재 스트릭 계산
 */
export function calculateCurrentStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const today = new Date();
  const sortedDates = completedDates.sort().reverse();

  let streak = 0;
  let currentDate = new Date(today);
  currentDate.setHours(0, 0, 0, 0);

  for (const dateStr of sortedDates) {
    const completedDate = new Date(dateStr);
    completedDate.setHours(0, 0, 0, 0);

    const diffTime = currentDate.getTime() - completedDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
}

/**
 * 월별 캘린더 데이터 생성
 */
export function generateCalendarMonth(
  year: number,
  month: number,
  completedDates: string[]
): CalendarDay[] {
  const days: CalendarDay[] = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const today = new Date();
  const todayStr = formatDate(today);

  // 이전 달의 날짜들 (회색으로 표시)
  const startDay = firstDay.getDay();
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(firstDay);
    date.setDate(date.getDate() - (i + 1));
    days.push({
      date: formatDate(date),
      completed: false,
      isToday: false,
      isStreakDay: false,
    });
  }

  // 현재 달의 날짜들
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = formatDate(date);
    const isToday = dateStr === todayStr;
    const completed = completedDates.includes(dateStr);

    days.push({
      date: dateStr,
      completed,
      isToday,
      isStreakDay: completed && isToday,
    });
  }

  // 다음 달의 날짜들 (회색으로 표시)
  const endDay = lastDay.getDay();
  for (let i = 1; i < 7 - endDay; i++) {
    const date = new Date(lastDay);
    date.setDate(date.getDate() + i);
    days.push({
      date: formatDate(date),
      completed: false,
      isToday: false,
      isStreakDay: false,
    });
  }

  return days;
}

/**
 * 스트릭 데이터 조회
 */
export async function getStreakData(): Promise<StreakData> {
  try {
    const data = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return createDefaultStreakData();
  } catch (error) {
    console.error('Failed to get streak data:', error);
    return createDefaultStreakData();
  }
}

/**
 * 스트릭 데이터 저장
 */
export async function saveStreakData(data: StreakData): Promise<void> {
  try {
    await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save streak data:', error);
  }
}

/**
 * 스트릭 데이터 초기화 (더미 데이터로)
 */
export async function initializeStreakData(): Promise<StreakData> {
  const dummyData = createDummyStreakData();
  await saveStreakData(dummyData);
  return dummyData;
}

/**
 * 스트릭 통계 계산
 */
export function calculateStreakStats(streakData: StreakData) {
  const today = new Date();
  const thisMonth = today.getMonth() + 1;
  const thisYear = today.getFullYear();

  const thisMonthDays = streakData.completedDates.filter((date) => {
    const [year, month] = date.split('-').map(Number);
    return year === thisYear && month === thisMonth;
  }).length;

  const thisWeekDays = streakData.completedDates.filter((date) => {
    const completedDate = new Date(date);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedDate >= weekAgo && completedDate <= today;
  }).length;

  return {
    currentStreak: streakData.currentStreak,
    maxStreak: streakData.maxStreak,
    totalDays: streakData.totalDaysCompleted,
    thisMonth: thisMonthDays,
    thisWeek: thisWeekDays,
  };
}
