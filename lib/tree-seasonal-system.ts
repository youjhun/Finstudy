/**
 * 나무 성장 계절/날씨 시스템
 * 
 * 각 성장 단계마다 고유한 계절, 날씨, 배경색을 제공하여
 * 나무 성장 과정을 더 생동감 있게 표현합니다.
 */

import type { TreeStage } from './tree-growth-system';

export type Season = 'spring' | 'early-summer' | 'summer' | 'autumn' | 'winter';
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy';

export interface SeasonalTheme {
  season: Season;
  seasonName: string;
  emoji: string;
  weather: Weather;
  weatherEmoji: string;
  weatherDescription: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  accentColor: string;
  treeColor: string;
  particleEmoji: string; // 강우/강설 이모지
  particleCount: number; // 애니메이션 입자 개수
  animationSpeed: number; // 애니메이션 속도 (ms)
  description: string;
}

/**
 * 성장 단계별 계절 테마
 */
const STAGE_SEASONAL_THEMES: Record<TreeStage, SeasonalTheme> = {
  seed: {
    season: 'spring',
    seasonName: '봄',
    emoji: '🌸',
    weather: 'sunny',
    weatherEmoji: '☀️',
    weatherDescription: '따뜻한 햇빛',
    bgGradientStart: '#FFF9E6', // 밝은 노란색
    bgGradientEnd: '#FFE6F0', // 연한 분홍색
    accentColor: '#FFB6C1',
    treeColor: '#8B7355',
    particleEmoji: '🌼',
    particleCount: 5,
    animationSpeed: 3000,
    description: '씨앗이 흙 속에서 싹을 틔우려고 합니다',
  },
  sprout: {
    season: 'early-summer',
    seasonName: '초여름',
    emoji: '🌱',
    weather: 'cloudy',
    weatherEmoji: '⛅',
    weatherDescription: '구름 낀 하늘',
    bgGradientStart: '#E6F7FF', // 하늘색
    bgGradientEnd: '#F0FFE6', // 연한 초록색
    accentColor: '#90EE90',
    treeColor: '#228B22',
    particleEmoji: '💧',
    particleCount: 8,
    animationSpeed: 2500,
    description: '새싹이 자라나고 있습니다',
  },
  sapling: {
    season: 'summer',
    seasonName: '여름',
    emoji: '🌿',
    weather: 'rainy',
    weatherEmoji: '🌧️',
    weatherDescription: '따뜻한 빗소리',
    bgGradientStart: '#E0F7E0', // 밝은 초록색
    bgGradientEnd: '#F0FFE6', // 연한 노란색
    accentColor: '#7CB342',
    treeColor: '#2D5016',
    particleEmoji: '💧',
    particleCount: 12,
    animationSpeed: 1800,
    description: '어린 나무가 빠르게 성장 중입니다',
  },
  tree: {
    season: 'autumn',
    seasonName: '가을',
    emoji: '🍂',
    weather: 'cloudy',
    weatherEmoji: '🌤️',
    weatherDescription: '선선한 바람',
    bgGradientStart: '#FFE6CC', // 주황색
    bgGradientEnd: '#FFD9B3', // 연한 주황색
    accentColor: '#FF8C00',
    treeColor: '#8B4513',
    particleEmoji: '🍁',
    particleCount: 10,
    animationSpeed: 2200,
    description: '나무가 황금빛으로 물들고 있습니다',
  },
  forest: {
    season: 'winter',
    seasonName: '겨울',
    emoji: '❄️',
    weather: 'snowy',
    weatherEmoji: '❄️',
    weatherDescription: '소복한 눈',
    bgGradientStart: '#F0F8FF', // 얼음색
    bgGradientEnd: '#E6F2FF', // 연한 파란색
    accentColor: '#87CEEB',
    treeColor: '#1C3A1C',
    particleEmoji: '❄️',
    particleCount: 15,
    animationSpeed: 2800,
    description: '울창한 숲이 겨울을 맞이합니다',
  },
};

/**
 * 성장 단계에 따른 계절 테마 조회
 */
export function getSeasonalTheme(stage: TreeStage): SeasonalTheme {
  return STAGE_SEASONAL_THEMES[stage];
}

/**
 * 모든 계절 테마 조회
 */
export function getAllSeasonalThemes(): Record<TreeStage, SeasonalTheme> {
  return STAGE_SEASONAL_THEMES;
}

/**
 * 계절 정보 조회
 */
export function getSeasonInfo(season: Season) {
  const themes = Object.values(STAGE_SEASONAL_THEMES);
  return themes.find(t => t.season === season);
}

/**
 * 날씨 설명 조회
 */
export function getWeatherDescription(weather: Weather): string {
  const descriptions: Record<Weather, string> = {
    sunny: '☀️ 맑은 날씨 - 따뜻한 햇빛이 내려쬡니다',
    cloudy: '⛅ 흐린 날씨 - 구름이 떠다니고 있습니다',
    rainy: '🌧️ 비 오는 날씨 - 촉촉한 빗소리가 들립니다',
    snowy: '❄️ 눈 오는 날씨 - 소복한 눈이 내립니다',
  };
  return descriptions[weather];
}

/**
 * 애니메이션 입자 생성 (강우/강설)
 */
export function generateParticles(count: number, particleEmoji: string) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: particleEmoji,
    left: Math.random() * 100, // 0-100%
    delay: Math.random() * 0.5, // 0-0.5s
    duration: 2 + Math.random() * 1, // 2-3s
  }));
}

/**
 * 계절 진행 상황 (학습 진도에 따른 계절 변화)
 */
export function getSeasonProgress(stage: TreeStage): number {
  const stages: TreeStage[] = ['seed', 'sprout', 'sapling', 'tree', 'forest'];
  const stageIndex = stages.indexOf(stage);
  return ((stageIndex + 1) / stages.length) * 100;
}

/**
 * 계절 변화 메시지
 */
export function getSeasonChangeMessage(previousStage: TreeStage, newStage: TreeStage): string {
  const messages: Record<TreeStage, string> = {
    seed: '🌸 봄이 왔어요! 따뜻한 햇빛 아래 씨앗이 준비되고 있습니다.',
    sprout: '🌱 초여름이 찾아왔어요! 새싹이 자라나기 시작합니다.',
    sapling: '🌿 여름이 성큼 다가왔어요! 어린 나무가 빠르게 성장합니다.',
    tree: '🍂 가을이 물들어 갑니다! 나무가 황금빛으로 변해갑니다.',
    forest: '❄️ 겨울이 찾아왔어요! 울창한 숲이 눈으로 소복해집니다.',
  };
  return messages[newStage];
}

/**
 * 계절별 배경 색상 조합
 */
export function getSeasonalGradient(stage: TreeStage): {
  start: string;
  end: string;
} {
  const theme = getSeasonalTheme(stage);
  return {
    start: theme.bgGradientStart,
    end: theme.bgGradientEnd,
  };
}

/**
 * 계절별 강조 색상
 */
export function getSeasonalAccentColor(stage: TreeStage): string {
  return getSeasonalTheme(stage).accentColor;
}

/**
 * 나무 색상 (계절별)
 */
export function getSeasonalTreeColor(stage: TreeStage): string {
  return getSeasonalTheme(stage).treeColor;
}
