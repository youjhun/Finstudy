import AsyncStorage from '@react-native-async-storage/async-storage';

const WEEKLY_REPORT_KEY = 'finstudy-weekly-report-v1';
const DAILY_SCORE_KEY = 'finstudy-daily-scores-v1';

export interface DailyScore {
  date: string; // YYYY-MM-DD
  score: number; // 0-100
  correctCount: number;
  totalCount: number;
  topics: string[];
}

export interface WeakConcept {
  topic: string;
  incorrectCount: number;
  correctRate: number; // 0-100
}

export interface WeeklyReport {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  averageScore: number; // 0-100
  highestScore: number; // 0-100
  lowestScore: number; // 0-100
  totalQuestionsAnswered: number;
  totalCorrect: number;
  overallAccuracy: number; // 0-100
  weakConcepts: WeakConcept[];
  percentile: number; // 0-100 (또래 대비 백분위)
  trend: 'up' | 'down' | 'stable'; // 주간 추세
  dailyScores: DailyScore[];
}

/**
 * 일일 점수 기록
 */
export async function recordDailyScore(score: DailyScore): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(DAILY_SCORE_KEY);
    const scores: DailyScore[] = existing ? JSON.parse(existing) : [];

    // 같은 날짜의 기존 점수 제거
    const filtered = scores.filter((s) => s.date !== score.date);
    filtered.push(score);

    // 최근 30일만 유지
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentScores = filtered.filter((s) => new Date(s.date) >= thirtyDaysAgo);

    await AsyncStorage.setItem(DAILY_SCORE_KEY, JSON.stringify(recentScores));
  } catch (error) {
    console.error('일일 점수 기록 실패:', error);
  }
}

/**
 * 주간 리포트 생성
 */
export async function generateWeeklyReport(): Promise<WeeklyReport> {
  try {
    const existing = await AsyncStorage.getItem(DAILY_SCORE_KEY);
    const allScores: DailyScore[] = existing ? JSON.parse(existing) : [];

    // 지난 7일 데이터 추출
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);

    const weekEnd = new Date(today);

    const weeklyScores = allScores.filter((s) => {
      const scoreDate = new Date(s.date);
      return scoreDate >= weekStart && scoreDate <= weekEnd;
    });

    if (weeklyScores.length === 0) {
      return getEmptyWeeklyReport(weekStart, weekEnd);
    }

    // 통계 계산
    const scores = weeklyScores.map((s) => s.score);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    const totalCorrect = weeklyScores.reduce((sum, s) => sum + s.correctCount, 0);
    const totalQuestionsAnswered = weeklyScores.reduce((sum, s) => sum + s.totalCount, 0);
    const overallAccuracy = Math.round((totalCorrect / totalQuestionsAnswered) * 100);

    // 취약 개념 분석
    const topicStats: Record<string, { incorrect: number; total: number }> = {};
    weeklyScores.forEach((s) => {
      s.topics.forEach((topic) => {
        if (!topicStats[topic]) {
          topicStats[topic] = { incorrect: 0, total: 0 };
        }
        topicStats[topic].total += 1;
      });
    });

    const weakConcepts: WeakConcept[] = Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        incorrectCount: Math.round(stats.total * (1 - overallAccuracy / 100)),
        correctRate: Math.round((1 - Math.round(stats.total * (1 - overallAccuracy / 100)) / stats.total) * 100),
      }))
      .sort((a, b) => a.correctRate - b.correctRate)
      .slice(0, 5);

    // 또래 대비 백분위 (시뮬레이션)
    const percentile = calculatePercentile(averageScore);

    // 추세 분석
    const trend = calculateTrend(weeklyScores);

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      averageScore,
      highestScore,
      lowestScore,
      totalQuestionsAnswered,
      totalCorrect,
      overallAccuracy,
      weakConcepts,
      percentile,
      trend,
      dailyScores: weeklyScores,
    };
  } catch (error) {
    console.error('주간 리포트 생성 실패:', error);
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekEnd = new Date(today);
    return getEmptyWeeklyReport(weekStart, weekEnd);
  }
}

/**
 * 빈 주간 리포트 반환
 */
function getEmptyWeeklyReport(weekStart: Date, weekEnd: Date): WeeklyReport {
  return {
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: weekEnd.toISOString().split('T')[0],
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    overallAccuracy: 0,
    weakConcepts: [],
    percentile: 0,
    trend: 'stable',
    dailyScores: [],
  };
}

/**
 * 또래 대비 백분위 계산 (시뮬레이션)
 */
function calculatePercentile(score: number): number {
  // 평균 60점, 표준편차 15점의 정규분포 가정
  const mean = 60;
  const stdDev = 15;

  // Z-score 계산
  const zScore = (score - mean) / stdDev;

  // 누적정규분포 함수 (근사)
  const percentile = Math.round(50 + 34.1 * Math.tanh(zScore / 1.5));

  return Math.min(100, Math.max(0, percentile));
}

/**
 * 주간 추세 분석
 */
function calculateTrend(dailyScores: DailyScore[]): 'up' | 'down' | 'stable' {
  if (dailyScores.length < 2) {
    return 'stable';
  }

  // 처음 3일과 마지막 3일의 평균 비교
  const firstHalf = dailyScores.slice(0, Math.ceil(dailyScores.length / 2));
  const secondHalf = dailyScores.slice(Math.ceil(dailyScores.length / 2));

  const firstAvg = firstHalf.reduce((sum, s) => sum + s.score, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, s) => sum + s.score, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff > 5) {
    return 'up';
  } else if (diff < -5) {
    return 'down';
  } else {
    return 'stable';
  }
}

/**
 * 지난주 리포트와 비교
 */
export async function compareWithLastWeek(): Promise<{
  currentWeek: WeeklyReport;
  lastWeek: WeeklyReport;
  improvement: number; // 점수 변화
}> {
  try {
    const currentWeek = await generateWeeklyReport();

    // 지난주 데이터 생성 (시뮬레이션)
    const lastWeekStart = new Date(new Date(currentWeek.weekStart));
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);

    const lastWeek = getEmptyWeeklyReport(lastWeekStart, lastWeekEnd);
    lastWeek.averageScore = Math.max(0, currentWeek.averageScore - Math.random() * 10);
    lastWeek.overallAccuracy = Math.max(0, currentWeek.overallAccuracy - Math.random() * 10);

    const improvement = currentWeek.averageScore - lastWeek.averageScore;

    return {
      currentWeek,
      lastWeek,
      improvement,
    };
  } catch (error) {
    console.error('주간 비교 실패:', error);
    throw error;
  }
}

/**
 * 학습 통계 초기화 (테스트용)
 */
export async function initializeSampleData(): Promise<void> {
  try {
    const sampleScores: DailyScore[] = [];
    const topics = ['거시경제', '미시경제', '금융시장', '국제경제', '재무설계'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const score = 55 + Math.random() * 30;
      const correctCount = Math.round((score / 100) * 10);

      sampleScores.push({
        date: dateStr,
        score: Math.round(score),
        correctCount,
        totalCount: 10,
        topics: [topics[Math.floor(Math.random() * topics.length)]],
      });
    }

    await AsyncStorage.setItem(DAILY_SCORE_KEY, JSON.stringify(sampleScores));
  } catch (error) {
    console.error('샘플 데이터 초기화 실패:', error);
  }
}
