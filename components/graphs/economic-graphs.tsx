/**
 * FinStudy 경제 그래프 컴포넌트
 * SVG + Reanimated를 사용한 애니메이션 그래프
 * 
 * 포함 그래프:
 * - Unit 2: 수요/공급 곡선
 * - Unit 3: 탄력성 비교
 * - Unit 4: GDP/물가 추이 (막대 그래프)
 * - Unit 5: 금리 변화 (꺾은선 그래프)
 * - Unit 6: 환율 변화 (꺾은선 그래프)
 */

import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, {
  Path,
  Line,
  Circle,
  Text as SvgText,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  G,
  Polygon,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

// ============= 기본 설정 =============

interface GraphProps {
  width?: number;
  height?: number;
  animated?: boolean;
}

const DEFAULT_WIDTH = screenWidth - 32;
const DEFAULT_HEIGHT = 300;
const PADDING = 40;
const ANIMATION_DURATION = 1500;

// ============= Unit 2: 수요/공급 곡선 =============

/**
 * 수요 곡선 (우하향) + 공급 곡선 (우상향)
 * 균형점 강조
 */
export function DemandSupplyCurveGraph({ 
  width = DEFAULT_WIDTH, 
  height = DEFAULT_HEIGHT,
  animated = true 
}: GraphProps) {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animationProgress.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      animationProgress.value = 1;
    }
  }, [animated, animationProgress]);

  const graphWidth = width - PADDING * 2;
  const graphHeight = height - PADDING * 2;

  // 수요 곡선 경로 (우하향)
  const demandPath = `
    M ${PADDING} ${PADDING + 20}
    Q ${PADDING + graphWidth * 0.5} ${PADDING + graphHeight * 0.3}
      ${PADDING + graphWidth} ${PADDING + graphHeight - 20}
  `;

  // 공급 곡선 경로 (우상향)
  const supplyPath = `
    M ${PADDING} ${PADDING + graphHeight - 20}
    Q ${PADDING + graphWidth * 0.5} ${PADDING + graphHeight * 0.7}
      ${PADDING + graphWidth} ${PADDING + 20}
  `;

  // 균형점
  const equilibriumX = PADDING + graphWidth * 0.5;
  const equilibriumY = PADDING + graphHeight * 0.5;

  return (
    <View style={{ width, height, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 8 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 배경 그리드 */}
        <Defs>
          <LinearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <Stop offset="100%" stopColor="#f9f9f9" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* 축 그리기 */}
        <Line
          x1={PADDING}
          y1={height - PADDING}
          x2={width - PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />
        <Line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />

        {/* 축 레이블 */}
        <SvgText
          x={width - PADDING - 30}
          y={height - PADDING + 20}
          fontSize="12"
          fill="#666"
          textAnchor="middle"
        >
          수량 (Q)
        </SvgText>
        <SvgText
          x={PADDING - 25}
          y={PADDING - 10}
          fontSize="12"
          fill="#666"
          textAnchor="middle"
        >
          가격 (P)
        </SvgText>

        {/* 수요 곡선 (파란색) */}
        <Path
          d={demandPath}
          stroke="#2196F3"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* 공급 곡선 (빨간색) */}
        <Path
          d={supplyPath}
          stroke="#F44336"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* 균형점 */}
        <Circle
          cx={equilibriumX}
          cy={equilibriumY}
          r="6"
          fill="#FFD700"
          stroke="#333"
          strokeWidth="1"
        />

        {/* 균형점 레이블 */}
        <SvgText
          x={equilibriumX + 15}
          y={equilibriumY - 10}
          fontSize="12"
          fill="#333"
          fontWeight="bold"
        >
          균형점
        </SvgText>

        {/* 범례 */}
        <SvgText
          x={PADDING + 20}
          y={PADDING + 15}
          fontSize="11"
          fill="#2196F3"
          fontWeight="bold"
        >
          수요 곡선 (D)
        </SvgText>
        <SvgText
          x={PADDING + 20}
          y={PADDING + 35}
          fontSize="11"
          fill="#F44336"
          fontWeight="bold"
        >
          공급 곡선 (S)
        </SvgText>
      </Svg>
    </View>
  );
}

// ============= Unit 3: 탄력성 비교 곡선 =============

/**
 * 탄력적 vs 비탄력적 수요 곡선 비교
 */
export function ElasticityComparisonGraph({ 
  width = DEFAULT_WIDTH, 
  height = DEFAULT_HEIGHT,
  animated = true 
}: GraphProps) {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animationProgress.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      animationProgress.value = 1;
    }
  }, [animated, animationProgress]);

  const graphWidth = width - PADDING * 2;
  const graphHeight = height - PADDING * 2;

  // 탄력적 곡선 (가파름)
  const elasticPath = `
    M ${PADDING} ${PADDING + 30}
    Q ${PADDING + graphWidth * 0.5} ${PADDING + graphHeight * 0.4}
      ${PADDING + graphWidth} ${PADDING + graphHeight - 30}
  `;

  // 비탄력적 곡선 (완만함)
  const inelasticPath = `
    M ${PADDING} ${PADDING + graphHeight * 0.4}
    Q ${PADDING + graphWidth * 0.5} ${PADDING + graphHeight * 0.5}
      ${PADDING + graphWidth} ${PADDING + graphHeight * 0.6}
  `;

  return (
    <View style={{ width, height, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 8 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 축 그리기 */}
        <Line
          x1={PADDING}
          y1={height - PADDING}
          x2={width - PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />
        <Line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />

        {/* 축 레이블 */}
        <SvgText
          x={width - PADDING - 30}
          y={height - PADDING + 20}
          fontSize="12"
          fill="#666"
          textAnchor="middle"
        >
          수량 (Q)
        </SvgText>
        <SvgText
          x={PADDING - 25}
          y={PADDING - 10}
          fontSize="12"
          fill="#666"
          textAnchor="middle"
        >
          가격 (P)
        </SvgText>

        {/* 탄력적 곡선 (초록색) - 가파름 */}
        <Path
          d={elasticPath}
          stroke="#4CAF50"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* 비탄력적 곡선 (주황색) - 완만함 */}
        <Path
          d={inelasticPath}
          stroke="#FF9800"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* 범례 */}
        <SvgText
          x={PADDING + 20}
          y={PADDING + 15}
          fontSize="11"
          fill="#4CAF50"
          fontWeight="bold"
        >
          탄력적 (가파름)
        </SvgText>
        <SvgText
          x={PADDING + 20}
          y={PADDING + 35}
          fontSize="11"
          fill="#FF9800"
          fontWeight="bold"
        >
          비탄력적 (완만함)
        </SvgText>

        {/* 설명 */}
        <SvgText
          x={width / 2}
          y={height - PADDING + 40}
          fontSize="10"
          fill="#666"
          textAnchor="middle"
        >
          가격 변화에 따른 수량 변화 비교
        </SvgText>
      </Svg>
    </View>
  );
}

// ============= Unit 3: 소비자 잉여 시각화 =============

/**
 * 수요 곡선 아래 영역 (소비자 잉여)
 */
export function ConsumerSurplusGraph({ 
  width = DEFAULT_WIDTH, 
  height = DEFAULT_HEIGHT,
  animated = true 
}: GraphProps) {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animationProgress.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      animationProgress.value = 1;
    }
  }, [animated, animationProgress]);

  const graphWidth = width - PADDING * 2;
  const graphHeight = height - PADDING * 2;

  // 수요 곡선
  const demandPath = `
    M ${PADDING} ${PADDING + 20}
    Q ${PADDING + graphWidth * 0.5} ${PADDING + graphHeight * 0.3}
      ${PADDING + graphWidth} ${PADDING + graphHeight - 20}
  `;

  // 균형점
  const equilibriumX = PADDING + graphWidth * 0.5;
  const equilibriumY = PADDING + graphHeight * 0.5;

  // 소비자 잉여 영역 (삼각형)
  const surplusPoints = `${PADDING},${PADDING + 20} ${equilibriumX},${equilibriumY} ${equilibriumX},${PADDING + 20}`;

  return (
    <View style={{ width, height, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 8 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 축 그리기 */}
        <Line
          x1={PADDING}
          y1={height - PADDING}
          x2={width - PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />
        <Line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />

        {/* 소비자 잉여 영역 (반투명 파란색) */}
        <Polygon
          points={surplusPoints}
          fill="#2196F3"
          opacity="0.3"
        />

        {/* 수요 곡선 */}
        <Path
          d={demandPath}
          stroke="#2196F3"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* 균형점 */}
        <Circle
          cx={equilibriumX}
          cy={equilibriumY}
          r="5"
          fill="#FFD700"
          stroke="#333"
          strokeWidth="1"
        />

        {/* 균형 가격선 */}
        <Line
          x1={PADDING}
          y1={equilibriumY}
          x2={equilibriumX}
          y2={equilibriumY}
          stroke="#666"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* 레이블 */}
        <SvgText
          x={equilibriumX + 15}
          y={equilibriumY - 15}
          fontSize="12"
          fill="#2196F3"
          fontWeight="bold"
        >
          소비자 잉여
        </SvgText>
        <SvgText
          x={PADDING - 25}
          y={PADDING - 10}
          fontSize="12"
          fill="#666"
        >
          가격 (P)
        </SvgText>
        <SvgText
          x={width - PADDING - 30}
          y={height - PADDING + 20}
          fontSize="12"
          fill="#666"
        >
          수량 (Q)
        </SvgText>
      </Svg>
    </View>
  );
}

// ============= Unit 4: GDP 추이 (막대 그래프) =============

/**
 * 연도별 GDP 추이
 */
export function GDPTrendGraph({ 
  width = DEFAULT_WIDTH, 
  height = DEFAULT_HEIGHT,
  animated = true 
}: GraphProps) {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animationProgress.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      animationProgress.value = 1;
    }
  }, [animated, animationProgress]);

  const graphWidth = width - PADDING * 2;
  const graphHeight = height - PADDING * 2;

  // 샘플 데이터: 연도별 GDP (억 달러)
  const data = [2000, 2100, 1900, 2200, 2350, 2400];
  const maxValue = Math.max(...data);
  const years = ['2019', '2020', '2021', '2022', '2023', '2024'];

  const barWidth = graphWidth / (data.length * 1.5);
  const barSpacing = graphWidth / data.length;

  return (
    <View style={{ width, height, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 8 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 축 그리기 */}
        <Line
          x1={PADDING}
          y1={height - PADDING}
          x2={width - PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />
        <Line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />

        {/* 축 레이블 */}
        <SvgText
          x={width - PADDING - 30}
          y={height - PADDING + 20}
          fontSize="12"
          fill="#666"
          textAnchor="middle"
        >
          연도
        </SvgText>
        <SvgText
          x={PADDING - 35}
          y={PADDING - 10}
          fontSize="12"
          fill="#666"
          textAnchor="middle"
        >
          GDP (억$)
        </SvgText>

        {/* 막대 그래프 */}
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * graphHeight * 0.8;
          const x = PADDING + barSpacing * index + barSpacing * 0.25;
          const y = height - PADDING - barHeight;

          return (
            <G key={index}>
              {/* 막대 */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#2196F3"
                rx="4"
              />
              {/* 연도 레이블 */}
              <SvgText
                x={x + barWidth / 2}
                y={height - PADDING + 15}
                fontSize="10"
                fill="#333"
                textAnchor="middle"
              >
                {years[index]}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// ============= Unit 5: 금리 변화 (꺾은선 그래프) =============

/**
 * 월별 기준금리 변화
 */
export function InterestRateTrendGraph({ 
  width = DEFAULT_WIDTH, 
  height = DEFAULT_HEIGHT,
  animated = true 
}: GraphProps) {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animationProgress.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      animationProgress.value = 1;
    }
  }, [animated, animationProgress]);

  const graphWidth = width - PADDING * 2;
  const graphHeight = height - PADDING * 2;

  // 샘플 데이터: 월별 금리 (%)
  const data = [0.5, 0.75, 1.0, 1.5, 2.0, 2.5, 3.0, 3.25, 3.5];
  const maxValue = 4;
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월'];

  const pointSpacing = graphWidth / (data.length - 1);

  // 꺾은선 경로
  let linePath = `M ${PADDING} ${height - PADDING - (data[0] / maxValue) * graphHeight * 0.8}`;
  for (let i = 1; i < data.length; i++) {
    const x = PADDING + pointSpacing * i;
    const y = height - PADDING - (data[i] / maxValue) * graphHeight * 0.8;
    linePath += ` L ${x} ${y}`;
  }

  return (
    <View style={{ width, height, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 8 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 축 그리기 */}
        <Line
          x1={PADDING}
          y1={height - PADDING}
          x2={width - PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />
        <Line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />

        {/* 축 레이블 */}
        <SvgText
          x={width - PADDING - 30}
          y={height - PADDING + 20}
          fontSize="12"
          fill="#666"
          textAnchor="middle"
        >
          월
        </SvgText>
        <SvgText
          x={PADDING - 25}
          y={PADDING - 10}
          fontSize="12"
          fill="#666"
          textAnchor="middle"
        >
          금리 (%)
        </SvgText>

        {/* 꺾은선 */}
        <Path
          d={linePath}
          stroke="#FF9800"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 데이터 포인트 */}
        {data.map((value, index) => {
          const x = PADDING + pointSpacing * index;
          const y = height - PADDING - (value / maxValue) * graphHeight * 0.8;

          return (
            <G key={index}>
              {/* 점 */}
              <Circle
                cx={x}
                cy={y}
                r="4"
                fill="#FF9800"
                stroke="#fff"
                strokeWidth="2"
              />
              {/* 월 레이블 */}
              <SvgText
                x={x}
                y={height - PADDING + 15}
                fontSize="9"
                fill="#333"
                textAnchor="middle"
              >
                {months[index]}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// ============= Unit 6: 환율 변화 (꺾은선 그래프) =============

/**
 * 월별 환율(원/달러) 변화
 */
export function ExchangeRateTrendGraph({ 
  width = DEFAULT_WIDTH, 
  height = DEFAULT_HEIGHT,
  animated = true 
}: GraphProps) {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animationProgress.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      animationProgress.value = 1;
    }
  }, [animated, animationProgress]);

  const graphWidth = width - PADDING * 2;
  const graphHeight = height - PADDING * 2;

  // 샘플 데이터: 월별 환율 (원/달러)
  const data = [1000, 1050, 1100, 1150, 1200, 1180, 1220, 1250, 1280];
  const maxValue = 1300;
  const minValue = 950;
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월'];

  const pointSpacing = graphWidth / (data.length - 1);

  // 꺾은선 경로
  let linePath = `M ${PADDING} ${height - PADDING - ((data[0] - minValue) / (maxValue - minValue)) * graphHeight * 0.8}`;
  for (let i = 1; i < data.length; i++) {
    const x = PADDING + pointSpacing * i;
    const y = height - PADDING - ((data[i] - minValue) / (maxValue - minValue)) * graphHeight * 0.8;
    linePath += ` L ${x} ${y}`;
  }

  return (
    <View style={{ width, height, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 8 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 축 그리기 */}
        <Line
          x1={PADDING}
          y1={height - PADDING}
          x2={width - PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />
        <Line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />

        {/* 축 레이블 */}
        <SvgText
          x={width - PADDING - 30}
          y={height - PADDING + 20}
          fontSize="12"
          fill="#666"
          textAnchor="middle"
        >
          월
        </SvgText>
        <SvgText
          x={PADDING - 35}
          y={PADDING - 10}
          fontSize="12"
          fill="#666"
          textAnchor="middle"
        >
          환율 (원/$)
        </SvgText>

        {/* 꺾은선 */}
        <Path
          d={linePath}
          stroke="#9C27B0"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 데이터 포인트 */}
        {data.map((value, index) => {
          const x = PADDING + pointSpacing * index;
          const y = height - PADDING - ((value - minValue) / (maxValue - minValue)) * graphHeight * 0.8;

          return (
            <G key={index}>
              {/* 점 */}
              <Circle
                cx={x}
                cy={y}
                r="4"
                fill="#9C27B0"
                stroke="#fff"
                strokeWidth="2"
              />
              {/* 월 레이블 */}
              <SvgText
                x={x}
                y={height - PADDING + 15}
                fontSize="9"
                fill="#333"
                textAnchor="middle"
              >
                {months[index]}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// ============= 인플레이션 비교 (원형 그래프) =============

/**
 * 연도별 인플레이션율 비교
 */
export function InflationComparisonGraph({ 
  width = DEFAULT_WIDTH, 
  height = DEFAULT_HEIGHT,
  animated = true 
}: GraphProps) {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animationProgress.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      animationProgress.value = 1;
    }
  }, [animated, animationProgress]);

  const graphWidth = width - PADDING * 2;
  const graphHeight = height - PADDING * 2;

  // 샘플 데이터: 연도별 인플레이션율 (%)
  const data = [1.5, 1.2, 2.5, 5.8, 3.2];
  const maxValue = 6;
  const years = ['2020', '2021', '2022', '2023', '2024'];
  const colors = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];

  const barWidth = graphWidth / (data.length * 1.5);
  const barSpacing = graphWidth / data.length;

  return (
    <View style={{ width, height, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 8 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 축 그리기 */}
        <Line
          x1={PADDING}
          y1={height - PADDING}
          x2={width - PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />
        <Line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={height - PADDING}
          stroke="#333"
          strokeWidth="2"
        />

        {/* 축 레이블 */}
        <SvgText
          x={width - PADDING - 30}
          y={height - PADDING + 20}
          fontSize="12"
          fill="#666"
          textAnchor="middle"
        >
          연도
        </SvgText>
        <SvgText
          x={PADDING - 35}
          y={PADDING - 10}
          fontSize="12"
          fill="#666"
          textAnchor="middle"
        >
          인플레이션 (%)
        </SvgText>

        {/* 막대 그래프 */}
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * graphHeight * 0.8;
          const x = PADDING + barSpacing * index + barSpacing * 0.25;
          const y = height - PADDING - barHeight;

          return (
            <G key={index}>
              {/* 막대 */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={colors[index]}
                rx="4"
              />
              {/* 연도 레이블 */}
              <SvgText
                x={x + barWidth / 2}
                y={height - PADDING + 15}
                fontSize="10"
                fill="#333"
                textAnchor="middle"
              >
                {years[index]}
              </SvgText>
              {/* 값 레이블 */}
              <SvgText
                x={x + barWidth / 2}
                y={y - 5}
                fontSize="9"
                fill={colors[index]}
                textAnchor="middle"
                fontWeight="bold"
              >
                {value}%
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
