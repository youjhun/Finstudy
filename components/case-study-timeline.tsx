import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import type { TimelineEvent } from '@/lib/case-study-data';

interface CaseStudyTimelineProps {
  events: TimelineEvent[];
  onEventSelect?: (event: TimelineEvent, index: number) => void;
}

export function CaseStudyTimeline({ events, onEventSelect }: CaseStudyTimelineProps) {
  const colors = useColors();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const screenWidth = Dimensions.get('window').width;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#3B82F6';
      case 'low':
        return '#10B981';
      default:
        return colors.primary;
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'critical':
        return '극심';
      case 'high':
        return '높음';
      case 'medium':
        return '중간';
      case 'low':
        return '낮음';
      default:
        return '보통';
    }
  };

  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* 타임라인 헤더 */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
          📅 사건 타임라인 ({events.length}개)
        </Text>
      </View>

      {/* 타임라인 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        scrollEventThrottle={16}
      >
        {events.map((event, index) => (
          <Pressable
            key={event.id}
            onPress={() => {
              setSelectedIndex(index);
              onEventSelect?.(event, index);
            }}
            style={({ pressed }) => ({
              marginRight: 12,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View
              style={{
                width: Math.min(200, screenWidth - 80),
                backgroundColor: selectedIndex === index ? getImpactColor(event.impact) : colors.surface,
                borderColor: getImpactColor(event.impact),
                borderWidth: selectedIndex === index ? 0 : 2,
                borderRadius: 12,
                padding: 12,
                shadowColor: getImpactColor(event.impact),
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: selectedIndex === index ? 0.3 : 0,
                shadowRadius: 4,
                elevation: selectedIndex === index ? 4 : 0,
              }}
            >
              {/* 날짜 */}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: selectedIndex === index ? '#FFFFFF' : colors.muted,
                  marginBottom: 4,
                }}
              >
                {event.date}
              </Text>

              {/* 제목 */}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: selectedIndex === index ? '#FFFFFF' : colors.foreground,
                  marginBottom: 6,
                  lineHeight: 18,
                }}
                numberOfLines={2}
              >
                {event.emoji} {event.title}
              </Text>

              {/* 설명 */}
              <Text
                style={{
                  fontSize: 11,
                  color: selectedIndex === index ? 'rgba(255,255,255,0.8)' : colors.muted,
                  marginBottom: 8,
                  lineHeight: 15,
                }}
                numberOfLines={2}
              >
                {event.description}
              </Text>

              {/* 영향도 배지 */}
              <View
                style={{
                  backgroundColor: selectedIndex === index ? 'rgba(255,255,255,0.2)' : getImpactColor(event.impact),
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  alignSelf: 'flex-start',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color: selectedIndex === index ? '#FFFFFF' : '#FFFFFF',
                  }}
                >
                  {getImpactLabel(event.impact)}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* 선택된 이벤트 상세 정보 */}
      {selectedIndex !== null && events[selectedIndex] && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            padding: 16,
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 24, marginRight: 8 }}>
              {events[selectedIndex].emoji}
            </Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.foreground,
                  marginBottom: 2,
                }}
              >
                {events[selectedIndex].title}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {events[selectedIndex].date}
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: 13,
              color: colors.foreground,
              lineHeight: 20,
              marginBottom: 12,
            }}
          >
            {events[selectedIndex].description}
          </Text>

          {/* 영향도 표시 */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: getImpactColor(events[selectedIndex].impact),
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>
              영향도: {getImpactLabel(events[selectedIndex].impact)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
