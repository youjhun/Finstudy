/**
 * 약점 포인트 우선 순위 학습 시스템
 * 
 * 사용자의 오답 기록을 분석하여 취약한 과목/유닛/개념을 식별하고,
 * 약점 기반 우선 순위 학습 세션을 생성합니다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============= 타입 정의 =============
export interface AnswerRecord {
  problemId: string;
  subjectId: string;
  unitId: string;
  concept: string; // 관련 개념 태그
  isCorrect: boolean;
  timestamp: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface WeaknessPoint {
  id: string;
  subjectId: string;
  subjectName: string;
  unitId: string;
  unitName: string;
  concept: string;
  incorrectCount: number;
  totalAttempts: number;
  errorRate: number; // 0~1
  lastAttempted: number;
  priority: number; // 0~100 (높을수록 우선)
  trend: 'improving' | 'stable' | 'declining';
  recommendedAction: string;
}

export interface WeaknessAnalysis {
  overallScore: number; // 0~100
  totalProblems: number;
  totalCorrect: number;
  weaknesses: WeaknessPoint[];
  strengths: StrengthPoint[];
  recommendedSession: RecommendedSession;
  lastUpdated: number;
}

export interface StrengthPoint {
  subjectId: string;
  subjectName: string;
  concept: string;
  correctRate: number;
  streak: number;
}

export interface RecommendedSession {
  title: string;
  description: string;
  problems: RecommendedProblem[];
  estimatedTime: number; // 분
  focusAreas: string[];
}

export interface RecommendedProblem {
  problemId: string;
  subjectId: string;
  unitId: string;
  reason: string; // 왜 이 문제가 추천되었는지
  priority: number;
}

// ============= 상수 =============
const STORAGE_KEY = 'finstudy-answer-records-v1';
const WEAKNESS_CACHE_KEY = 'finstudy-weakness-analysis-v1';

// 개념 태그 매핑 (과목별 핵심 개념)
const CONCEPT_MAP: Record<string, string[]> = {
  'macro-economics': ['GDP', '인플레이션', '통화정책', '재정정책', '환율', '국제수지', '경기변동', '실업'],
  'financial-products': ['예금', '채권', '주식', 'ETF', '펀드', '보험상품', '파생결합증권', '연금'],
  'investment-theory': ['포트폴리오', 'CAPM', '효율적시장', '기술적분석', '기본적분석', '위험관리', '행동재무학', '자산배분'],
  'tax-regulation': ['소득세', '양도소득세', '금융소득종합과세', '증여세', '상속세', '절세전략', '세액공제', '금융규제'],
  'derivatives': ['선물', '옵션', '스왑', '헤징', '차익거래', '변동성', '그릭스', '구조화상품'],
  'insurance-planning': ['생명보험', '손해보험', '연금보험', '건강보험', '보장분석', '보험설계', '리스크관리', '보험세제'],
};

const SUBJECT_NAMES: Record<string, string> = {
  'macro-economics': '거시경제',
  'financial-products': '금융상품',
  'investment-theory': '투자이론',
  'tax-regulation': '세금/법규',
  'derivatives': '파생상품',
  'insurance-planning': '보험설계',
};

// ============= 더미 데이터 생성 =============
function generateDummyRecords(): AnswerRecord[] {
  const records: AnswerRecord[] = [];
  const now = Date.now();
  const subjects = Object.keys(CONCEPT_MAP);
  
  // 지난 30일간의 학습 기록 시뮬레이션
  for (let day = 0; day < 30; day++) {
    const timestamp = now - (day * 24 * 60 * 60 * 1000);
    const sessionsPerDay = Math.floor(Math.random() * 3) + 1;
    
    for (let s = 0; s < sessionsPerDay; s++) {
      const subjectId = subjects[Math.floor(Math.random() * subjects.length)];
      const concepts = CONCEPT_MAP[subjectId];
      const concept = concepts[Math.floor(Math.random() * concepts.length)];
      
      // 과목별 정답률 차등 (약점 시뮬레이션)
      let correctProbability = 0.7; // 기본 70%
      if (subjectId === 'derivatives') correctProbability = 0.35; // 파생상품 약점
      if (subjectId === 'tax-regulation') correctProbability = 0.45; // 세금/법규 약점
      if (subjectId === 'insurance-planning') correctProbability = 0.50; // 보험설계 약점
      if (subjectId === 'macro-economics') correctProbability = 0.82; // 거시경제 강점
      if (subjectId === 'investment-theory') correctProbability = 0.75; // 투자이론 보통
      
      // 특정 개념에 대한 추가 약점
      if (concept === '그릭스' || concept === '구조화상품') correctProbability *= 0.5;
      if (concept === '금융소득종합과세' || concept === '증여세') correctProbability *= 0.6;
      if (concept === '보장분석') correctProbability *= 0.65;
      
      const problemsPerSession = Math.floor(Math.random() * 5) + 3;
      for (let p = 0; p < problemsPerSession; p++) {
        records.push({
          problemId: `prob-${subjectId}-${day}-${s}-${p}`,
          subjectId,
          unitId: `${subjectId}-unit-${Math.floor(Math.random() * 5) + 1}`,
          concept,
          isCorrect: Math.random() < correctProbability,
          timestamp: timestamp + (s * 3600000) + (p * 60000),
          difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
        });
      }
    }
  }
  
  return records;
}

// ============= 핵심 분석 함수 =============

/**
 * 사용자의 답변 기록을 저장합니다.
 */
export async function saveAnswerRecord(record: AnswerRecord): Promise<void> {
  try {
    const existing = await getAnswerRecords();
    existing.push(record);
    // 최근 90일 기록만 유지
    const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
    const filtered = existing.filter(r => r.timestamp > cutoff);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('답변 기록 저장 실패:', error);
  }
}

/**
 * 저장된 답변 기록을 가져옵니다. 없으면 더미 데이터를 생성합니다.
 */
export async function getAnswerRecords(): Promise<AnswerRecord[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // 첫 실행 시 더미 데이터 생성
    const dummy = generateDummyRecords();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
    return dummy;
  } catch (error) {
    console.error('답변 기록 로드 실패:', error);
    return generateDummyRecords();
  }
}

/**
 * 약점 분석을 수행합니다.
 */
export async function analyzeWeaknesses(): Promise<WeaknessAnalysis> {
  const records = await getAnswerRecords();
  
  if (records.length === 0) {
    return getEmptyAnalysis();
  }
  
  const totalProblems = records.length;
  const totalCorrect = records.filter(r => r.isCorrect).length;
  const overallScore = Math.round((totalCorrect / totalProblems) * 100);
  
  // 개념별 그룹핑
  const conceptGroups: Record<string, AnswerRecord[]> = {};
  records.forEach(record => {
    const key = `${record.subjectId}::${record.concept}`;
    if (!conceptGroups[key]) conceptGroups[key] = [];
    conceptGroups[key].push(record);
  });
  
  // 약점 포인트 계산
  const weaknesses: WeaknessPoint[] = [];
  const strengths: StrengthPoint[] = [];
  
  Object.entries(conceptGroups).forEach(([key, groupRecords]) => {
    const [subjectId, concept] = key.split('::');
    const incorrect = groupRecords.filter(r => !r.isCorrect).length;
    const total = groupRecords.length;
    const errorRate = incorrect / total;
    const lastAttempted = Math.max(...groupRecords.map(r => r.timestamp));
    
    // 최근 7일 vs 이전 기간 비교하여 트렌드 계산
    const recentCutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentRecords = groupRecords.filter(r => r.timestamp > recentCutoff);
    const olderRecords = groupRecords.filter(r => r.timestamp <= recentCutoff);
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentRecords.length >= 3 && olderRecords.length >= 3) {
      const recentRate = recentRecords.filter(r => !r.isCorrect).length / recentRecords.length;
      const olderRate = olderRecords.filter(r => !r.isCorrect).length / olderRecords.length;
      if (recentRate < olderRate - 0.1) trend = 'improving';
      else if (recentRate > olderRate + 0.1) trend = 'declining';
    }
    
    // 우선순위 계산 (높을수록 먼저 학습해야 함)
    const recencyWeight = Math.max(0, 1 - ((Date.now() - lastAttempted) / (30 * 24 * 60 * 60 * 1000)));
    const priority = Math.round(
      (errorRate * 50) + // 오답률 가중치
      (trend === 'declining' ? 20 : trend === 'stable' ? 10 : 0) + // 트렌드 가중치
      (recencyWeight * 15) + // 최근성 가중치
      (total >= 5 ? 15 : total * 3) // 충분한 데이터 가중치
    );
    
    if (errorRate >= 0.4 && total >= 3) {
      // 약점으로 분류
      const unitId = groupRecords[0].unitId;
      weaknesses.push({
        id: key,
        subjectId,
        subjectName: SUBJECT_NAMES[subjectId] || subjectId,
        unitId,
        unitName: getUnitName(unitId),
        concept,
        incorrectCount: incorrect,
        totalAttempts: total,
        errorRate,
        lastAttempted,
        priority,
        trend,
        recommendedAction: getRecommendedAction(errorRate, trend, concept),
      });
    } else if (errorRate < 0.2 && total >= 5) {
      // 강점으로 분류
      const streak = calculateStreak(groupRecords);
      strengths.push({
        subjectId,
        subjectName: SUBJECT_NAMES[subjectId] || subjectId,
        concept,
        correctRate: 1 - errorRate,
        streak,
      });
    }
  });
  
  // 우선순위 내림차순 정렬
  weaknesses.sort((a, b) => b.priority - a.priority);
  strengths.sort((a, b) => b.correctRate - a.correctRate);
  
  // 추천 세션 생성
  const recommendedSession = generateRecommendedSession(weaknesses, records);
  
  const analysis: WeaknessAnalysis = {
    overallScore,
    totalProblems,
    totalCorrect,
    weaknesses: weaknesses.slice(0, 10), // 상위 10개 약점
    strengths: strengths.slice(0, 5), // 상위 5개 강점
    recommendedSession,
    lastUpdated: Date.now(),
  };
  
  // 캐시 저장
  await AsyncStorage.setItem(WEAKNESS_CACHE_KEY, JSON.stringify(analysis));
  
  return analysis;
}

/**
 * 캐시된 약점 분석을 가져옵니다.
 */
export async function getCachedAnalysis(): Promise<WeaknessAnalysis | null> {
  try {
    const data = await AsyncStorage.getItem(WEAKNESS_CACHE_KEY);
    if (data) {
      const analysis = JSON.parse(data);
      // 1시간 이내 캐시만 유효
      if (Date.now() - analysis.lastUpdated < 3600000) {
        return analysis;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ============= 유틸리티 함수 =============

function getUnitName(unitId: string): string {
  const unitNames: Record<string, string> = {
    'macro-economics-unit-1': 'GDP와 경제성장',
    'macro-economics-unit-2': '통화정책과 금리',
    'macro-economics-unit-3': '환율과 국제경제',
    'macro-economics-unit-4': '경기변동과 실업',
    'macro-economics-unit-5': '재정정책',
    'financial-products-unit-1': '예금과 적금',
    'financial-products-unit-2': '채권 투자',
    'financial-products-unit-3': '주식과 ETF',
    'financial-products-unit-4': '펀드와 연금',
    'financial-products-unit-5': '보험상품',
    'investment-theory-unit-1': '포트폴리오 이론',
    'investment-theory-unit-2': 'CAPM과 베타',
    'investment-theory-unit-3': '효율적 시장 가설',
    'investment-theory-unit-4': '기술적/기본적 분석',
    'investment-theory-unit-5': '행동재무학',
    'tax-regulation-unit-1': '소득세 기초',
    'tax-regulation-unit-2': '금융소득 과세',
    'tax-regulation-unit-3': '양도소득세',
    'tax-regulation-unit-4': '증여세/상속세',
    'tax-regulation-unit-5': '절세 전략',
    'derivatives-unit-1': '선물 기초',
    'derivatives-unit-2': '옵션 이론',
    'derivatives-unit-3': '스왑과 헤징',
    'derivatives-unit-4': '그릭스와 변동성',
    'derivatives-unit-5': '구조화상품',
    'insurance-planning-unit-1': '보험 기초',
    'insurance-planning-unit-2': '생명보험 설계',
    'insurance-planning-unit-3': '손해보험',
    'insurance-planning-unit-4': '보장분석',
    'insurance-planning-unit-5': '보험세제',
  };
  return unitNames[unitId] || unitId;
}

function getRecommendedAction(errorRate: number, trend: string, concept: string): string {
  if (errorRate >= 0.7) {
    return `${concept} 개념을 처음부터 다시 학습하세요. 기초 이론 복습이 필요합니다.`;
  } else if (errorRate >= 0.5) {
    if (trend === 'declining') {
      return `${concept} 이해도가 하락 중입니다. 집중 복습 세션을 추천합니다.`;
    }
    return `${concept} 관련 문제를 반복 풀이하여 패턴을 익히세요.`;
  } else {
    return `${concept} 심화 문제에 도전하여 완전한 이해를 목표로 하세요.`;
  }
}

function calculateStreak(records: AnswerRecord[]): number {
  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
  let streak = 0;
  for (const record of sorted) {
    if (record.isCorrect) streak++;
    else break;
  }
  return streak;
}

function generateRecommendedSession(
  weaknesses: WeaknessPoint[],
  _allRecords: AnswerRecord[]
): RecommendedSession {
  const topWeaknesses = weaknesses.slice(0, 5);
  
  if (topWeaknesses.length === 0) {
    return {
      title: '종합 복습 세션',
      description: '전체 과목을 고르게 복습하는 세션입니다.',
      problems: [],
      estimatedTime: 15,
      focusAreas: ['전체 복습'],
    };
  }
  
  const focusAreas = topWeaknesses.map(w => `${w.subjectName} - ${w.concept}`);
  const problems: RecommendedProblem[] = topWeaknesses.flatMap((w, idx) => {
    // 각 약점당 3문제 추천
    return Array.from({ length: 3 }, (_, i) => ({
      problemId: `recommended-${w.subjectId}-${w.concept}-${i}`,
      subjectId: w.subjectId,
      unitId: w.unitId,
      reason: w.recommendedAction,
      priority: w.priority - (idx * 5) - i,
    }));
  });
  
  return {
    title: '🎯 약점 집중 공략 세션',
    description: `${topWeaknesses[0].subjectName}의 ${topWeaknesses[0].concept}을(를) 중심으로 취약 개념을 집중 학습합니다.`,
    problems: problems.sort((a, b) => b.priority - a.priority),
    estimatedTime: Math.min(30, problems.length * 2),
    focusAreas,
  };
}

function getEmptyAnalysis(): WeaknessAnalysis {
  return {
    overallScore: 0,
    totalProblems: 0,
    totalCorrect: 0,
    weaknesses: [],
    strengths: [],
    recommendedSession: {
      title: '첫 학습을 시작하세요',
      description: '아직 학습 기록이 없습니다. 과목을 선택하여 학습을 시작하세요.',
      problems: [],
      estimatedTime: 10,
      focusAreas: [],
    },
    lastUpdated: Date.now(),
  };
}
