/**
 * 나무 성장 날씨 애니메이션 컴포넌트
 * 
 * 강우, 강설 등의 입자 애니메이션을 표현합니다.
 */

import React, { useMemo } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { generateParticles } from '@/lib/tree-seasonal-system';
import type { TreeStage } from '@/lib/tree-growth-system';
import { getSeasonalTheme } from '@/lib/tree-seasonal-system';

interface TreeWeatherAnimationProps {
  stage: TreeStage;
  intensity?: 'light' | 'medium' | 'heavy';
}

export function TreeWeatherAnimation({ stage, intensity = 'medium' }: TreeWeatherAnimationProps) {
  const theme = getSeasonalTheme(stage);

  // 강도에 따른 입자 개수 조정
  const particleCount = useMemo(() => {
    switch (intensity) {
      case 'light':
        return Math.max(3, Math.floor(theme.particleCount * 0.5));
      case 'medium':
        return theme.particleCount;
      case 'heavy':
        return Math.floor(theme.particleCount * 1.5);
      default:
        return theme.particleCount;
    }
  }, [intensity, theme.particleCount]);

  const particles = useMemo(
    () => generateParticles(particleCount, theme.particleEmoji),
    [particleCount, theme.particleEmoji]
  );

  // 애니메이션이 없는 경우 (맑은 날씨)
  if (theme.weather === 'sunny') {
    return (
      <View style={styles.container}>
        <View style={styles.sunContainer}>
          <Text style={styles.sunEmoji}>☀️</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 날씨 표시 */}
      <View style={styles.weatherIndicator}>
        <Text style={styles.weatherEmoji}>{theme.weatherEmoji}</Text>
        <Text style={styles.weatherText}>{theme.weatherDescription}</Text>
      </View>

      {/* 입자 애니메이션 */}
      <View style={styles.particleContainer}>
        {particles.map(particle => (
          <AnimatedParticle
            key={particle.id}
            particle={particle}
            duration={theme.animationSpeed}
          />
        ))}
      </View>
    </View>
  );
}

// ============= 애니메이션 입자 =============
interface AnimatedParticleProps {
  particle: {
    id: number;
    emoji: string;
    left: number;
    delay: number;
    duration: number;
  };
  duration: number;
}

function AnimatedParticle({ particle, duration }: AnimatedParticleProps) {
  const animatedTop = React.useRef(new Animated.Value(-50)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay * 1000),
        Animated.timing(animatedTop, {
          toValue: 400,
          duration: particle.duration * 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedTop, particle.delay, particle.duration]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: `${particle.left}%`,
          transform: [{ translateY: animatedTop }],
        },
      ]}
    >
      <Text style={styles.particleEmoji}>{particle.emoji}</Text>
    </Animated.View>
  );
}

// ============= 스타일 =============
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 200,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sunContainer: {
    position: 'absolute',
    top: 20,
    right: 30,
    zIndex: 10,
  },
  sunEmoji: {
    fontSize: 40,
  },
  weatherIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherEmoji: {
    fontSize: 24,
  },
  weatherText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particleEmoji: {
    fontSize: 16,
  },
});
