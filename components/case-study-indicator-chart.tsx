import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import type { IndicatorDataPoint, EconomicIndicator } from '@/lib/case-study-data';

interface CaseStudyIndicatorChartProps {
  indicator: EconomicIndicator;
  data: IndicatorDataPoint[];
  title: string;
  unit: string;
  emoji: string;
}

export function CaseStudyIndicatorChart({
  indicator,
  data,
  title,
  unit,
  emoji,
}: CaseStudyIndicatorChartProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;
  const chartHeight = 200;

  if (data.length < 2) {
    return null;
  }

  // 최소값과 최대값 계산
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // 차트 포인트 계산
  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((d.value - minValue) / valueRange) * chartHeight;
    return { x, y, value: d.value, date: d.date, change: d.change };
  });

  // SVG 경로 생성
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // 색상 결정 (상승/하락)
  const isPositive = data[data.length - 1].value >= data[0].value;
  const lineColor = isPositive ? '#10B981' : '#EF4444';

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
      }}
    >
      {/* 헤더 */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
          {emoji} {title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: lineColor }}>
            {data[data.length - 1].value.toFixed(1)}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            {unit}
          </Text>
          {data[data.length - 1].change !== undefined && (
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: data[data.length - 1].change! >= 0 ? '#10B981' : '#EF4444',
              }}
            >
              {data[data.length - 1].change! >= 0 ? '+' : ''}
              {data[data.length - 1].change!.toFixed(1)}%
            </Text>
          )}
        </View>
      </View>

      {/* 차트 */}
      <View style={{ height: chartHeight, backgroundColor: colors.background, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
        <svg
          width={chartWidth}
          height={chartHeight}
          style={{ position: 'absolute' }}
        >
          {/* 그리드 라인 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={`grid-${ratio}`}
              x1="0"
              y1={chartHeight - chartHeight * ratio}
              x2={chartWidth}
              y2={chartHeight - chartHeight * ratio}
              stroke={colors.border}
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}

          {/* 라인 차트 */}
          <path
            d={pathData}
            stroke={lineColor}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 포인트 */}
          {points.map((point, index) => (
            <circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={lineColor}
              opacity={index === points.length - 1 ? 1 : 0.5}
            />
          ))}

          {/* 면적 채우기 */}
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${chartHeight} L 0 ${chartHeight} Z`}
            fill={lineColor}
            opacity="0.1"
          />
        </svg>
      </View>

      {/* 범례 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>
            최소: {minValue.toFixed(1)} {unit}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>
            최대: {maxValue.toFixed(1)} {unit}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>
            시작: {data[0].date}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>
            종료: {data[data.length - 1].date}
          </Text>
        </View>
      </View>
    </View>
  );
}
