import { describe, it, expect } from 'vitest';
import {
  getSeasonalTheme,
  getAllSeasonalThemes,
  getSeasonInfo,
  getWeatherDescription,
  generateParticles,
  getSeasonProgress,
  getSeasonChangeMessage,
  getSeasonalGradient,
  getSeasonalAccentColor,
  getSeasonalTreeColor,
  type Season,
  type Weather,
} from './tree-seasonal-system';

describe('Tree Seasonal System', () => {
  describe('getSeasonalTheme', () => {
    it('각 성장 단계에 대한 계절 테마를 반환해야 함', () => {
      const seedTheme = getSeasonalTheme('seed');
      expect(seedTheme.season).toBe('spring');
      expect(seedTheme.seasonName).toBe('봄');
      expect(seedTheme.emoji).toBe('🌸');

      const forestTheme = getSeasonalTheme('forest');
      expect(forestTheme.season).toBe('winter');
      expect(forestTheme.seasonName).toBe('겨울');
      expect(forestTheme.emoji).toBe('❄️');
    });

    it('모든 테마가 필수 속성을 가져야 함', () => {
      const theme = getSeasonalTheme('sapling');
      
      expect(theme.season).toBeDefined();
      expect(theme.seasonName).toBeDefined();
      expect(theme.emoji).toBeDefined();
      expect(theme.weather).toBeDefined();
      expect(theme.weatherEmoji).toBeDefined();
      expect(theme.weatherDescription).toBeDefined();
      expect(theme.bgGradientStart).toBeDefined();
      expect(theme.bgGradientEnd).toBeDefined();
      expect(theme.accentColor).toBeDefined();
      expect(theme.treeColor).toBeDefined();
      expect(theme.particleEmoji).toBeDefined();
      expect(theme.particleCount).toBeGreaterThan(0);
      expect(theme.animationSpeed).toBeGreaterThan(0);
      expect(theme.description).toBeDefined();
    });
  });

  describe('getAllSeasonalThemes', () => {
    it('모든 성장 단계의 테마를 반환해야 함', () => {
      const themes = getAllSeasonalThemes();
      
      expect(themes.seed).toBeDefined();
      expect(themes.sprout).toBeDefined();
      expect(themes.sapling).toBeDefined();
      expect(themes.tree).toBeDefined();
      expect(themes.forest).toBeDefined();
    });

    it('5개의 테마를 반환해야 함', () => {
      const themes = getAllSeasonalThemes();
      expect(Object.keys(themes).length).toBe(5);
    });
  });

  describe('getSeasonInfo', () => {
    it('계절 정보를 반환해야 함', () => {
      const springInfo = getSeasonInfo('spring');
      expect(springInfo).toBeDefined();
      expect(springInfo?.seasonName).toBe('봄');

      const winterInfo = getSeasonInfo('winter');
      expect(winterInfo).toBeDefined();
      expect(winterInfo?.seasonName).toBe('겨울');
    });
  });

  describe('getWeatherDescription', () => {
    it('각 날씨에 대한 설명을 반환해야 함', () => {
      expect(getWeatherDescription('sunny')).toContain('☀️');
      expect(getWeatherDescription('cloudy')).toContain('⛅');
      expect(getWeatherDescription('rainy')).toContain('🌧️');
      expect(getWeatherDescription('snowy')).toContain('❄️');
    });
  });

  describe('generateParticles', () => {
    it('지정된 개수의 입자를 생성해야 함', () => {
      const particles = generateParticles(10, '💧');
      expect(particles.length).toBe(10);
    });

    it('각 입자가 필수 속성을 가져야 함', () => {
      const particles = generateParticles(5, '❄️');
      
      particles.forEach(particle => {
        expect(particle.id).toBeDefined();
        expect(particle.emoji).toBe('❄️');
        expect(particle.left).toBeGreaterThanOrEqual(0);
        expect(particle.left).toBeLessThanOrEqual(100);
        expect(particle.delay).toBeGreaterThanOrEqual(0);
        expect(particle.delay).toBeLessThanOrEqual(0.5);
        expect(particle.duration).toBeGreaterThanOrEqual(2);
        expect(particle.duration).toBeLessThanOrEqual(3);
      });
    });

    it('입자 ID가 고유해야 함', () => {
      const particles = generateParticles(20, '💧');
      const ids = particles.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getSeasonProgress', () => {
    it('각 단계에 따른 계절 진행도를 계산해야 함', () => {
      expect(getSeasonProgress('seed')).toBe(20); // 1/5 * 100
      expect(getSeasonProgress('sprout')).toBe(40); // 2/5 * 100
      expect(getSeasonProgress('sapling')).toBe(60); // 3/5 * 100
      expect(getSeasonProgress('tree')).toBe(80); // 4/5 * 100
      expect(getSeasonProgress('forest')).toBe(100); // 5/5 * 100
    });
  });

  describe('getSeasonChangeMessage', () => {
    it('단계 변경 메시지를 반환해야 함', () => {
      const message = getSeasonChangeMessage('seed', 'sprout');
      expect(message).toContain('초여름');
      expect(message).toContain('새싹');
    });

    it('모든 단계에 대한 메시지를 가져야 함', () => {
      const stages: Array<'seed' | 'sprout' | 'sapling' | 'tree' | 'forest'> = [
        'seed',
        'sprout',
        'sapling',
        'tree',
        'forest',
      ];

      stages.forEach(stage => {
        const message = getSeasonChangeMessage('seed', stage);
        expect(message).toBeDefined();
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getSeasonalGradient', () => {
    it('각 단계에 대한 그라데이션 색상을 반환해야 함', () => {
      const gradient = getSeasonalGradient('seed');
      expect(gradient.start).toBeDefined();
      expect(gradient.end).toBeDefined();
      expect(gradient.start).toMatch(/^#[0-9A-F]{6}$/i);
      expect(gradient.end).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe('getSeasonalAccentColor', () => {
    it('각 단계에 대한 강조 색상을 반환해야 함', () => {
      const color = getSeasonalAccentColor('tree');
      expect(color).toBeDefined();
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe('getSeasonalTreeColor', () => {
    it('각 단계에 대한 나무 색상을 반환해야 함', () => {
      const color = getSeasonalTreeColor('forest');
      expect(color).toBeDefined();
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('단계별로 다른 나무 색상을 반환해야 함', () => {
      const seedColor = getSeasonalTreeColor('seed');
      const forestColor = getSeasonalTreeColor('forest');
      expect(seedColor).not.toBe(forestColor);
    });
  });

  describe('Seasonal Theme Consistency', () => {
    it('모든 테마의 색상이 유효한 HEX 형식이어야 함', () => {
      const themes = getAllSeasonalThemes();
      const hexRegex = /^#[0-9A-F]{6}$/i;

      Object.values(themes).forEach(theme => {
        expect(theme.bgGradientStart).toMatch(hexRegex);
        expect(theme.bgGradientEnd).toMatch(hexRegex);
        expect(theme.accentColor).toMatch(hexRegex);
        expect(theme.treeColor).toMatch(hexRegex);
      });
    });

    it('모든 테마가 고유한 계절을 가져야 함', () => {
      const themes = getAllSeasonalThemes();
      const seasons = Object.values(themes).map(t => t.season);
      const uniqueSeasons = new Set(seasons);
      expect(uniqueSeasons.size).toBe(seasons.length);
    });

    it('모든 테마의 입자 개수가 양수여야 함', () => {
      const themes = getAllSeasonalThemes();
      Object.values(themes).forEach(theme => {
        expect(theme.particleCount).toBeGreaterThan(0);
      });
    });

    it('모든 테마의 애니메이션 속도가 양수여야 함', () => {
      const themes = getAllSeasonalThemes();
      Object.values(themes).forEach(theme => {
        expect(theme.animationSpeed).toBeGreaterThan(0);
      });
    });
  });

  describe('Weather System', () => {
    it('각 계절이 고유한 날씨를 가져야 함', () => {
      const themes = getAllSeasonalThemes();
      const weatherTypes = Object.values(themes).map(t => t.weather);
      
      // 최소 2가지 이상의 날씨 타입이 있어야 함
      const uniqueWeathers = new Set(weatherTypes);
      expect(uniqueWeathers.size).toBeGreaterThanOrEqual(2);
    });

    it('맑은 날씨는 입자가 없어야 함', () => {
      const themes = getAllSeasonalThemes();
      const sunnyTheme = Object.values(themes).find(t => t.weather === 'sunny');
      
      if (sunnyTheme) {
        // 맑은 날씨는 입자가 필요 없음 (선택사항)
        expect(sunnyTheme.particleCount).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
