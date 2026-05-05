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

  if (data.length < 2) {
    return null;
  }

  // 최소값과 최대값 계산
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // 정규화된 높이 계산 (0-100)
  const normalizedHeights = data.map((d) => {
    return ((d.value - minValue) / valueRange) * 100;
  });

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

      {/* 바 차트 (텍스트 기반) */}
      <View style={{ height: 150, backgroundColor: colors.background, borderRadius: 8, padding: 8, marginBottom: 12, justifyContent: 'flex-end' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: '100%', gap: 4 }}>
          {normalizedHeights.map((height, index) => (
            <View
              key={index}
              style={{
                flex: 1,
                height: `${Math.max(height, 5)}%`,
                backgroundColor: lineColor,
                borderRadius: 4,
                opacity: index === normalizedHeights.length - 1 ? 1 : 0.6,
              }}
            />
          ))}
        </View>
      </View>

      {/* 데이터 포인트 표 */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', marginBottom: 8, paddingBottom: 8, borderBottomColor: colors.border, borderBottomWidth: 1 }}>
          <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: colors.muted }}>
            날짜
          </Text>
          <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: colors.muted, textAlign: 'right' }}>
            값
          </Text>
          <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: colors.muted, textAlign: 'right' }}>
            변화
          </Text>
        </View>

        {data.map((point, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              paddingVertical: 6,
              paddingHorizontal: 0,
              backgroundColor: index === data.length - 1 ? colors.background : 'transparent',
              borderRadius: 4,
              marginBottom: index < data.length - 1 ? 4 : 0,
            }}
          >
            <Text style={{ flex: 1, fontSize: 11, color: colors.foreground }}>
              {point.date}
            </Text>
            <Text style={{ flex: 1, fontSize: 11, color: colors.foreground, fontWeight: '600', textAlign: 'right' }}>
              {point.value.toFixed(1)}
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: 11,
                fontWeight: '600',
                textAlign: 'right',
                color: point.change !== undefined ? (point.change >= 0 ? '#10B981' : '#EF4444') : colors.muted,
              }}
            >
              {point.change !== undefined ? (point.change >= 0 ? '+' : '') + point.change.toFixed(1) + '%' : '-'}
            </Text>
          </View>
        ))}
      </View>

      {/* 범례 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopColor: colors.border, borderTopWidth: 1 }}>
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
