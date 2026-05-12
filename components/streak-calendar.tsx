import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { generateCalendarMonth, type CalendarDay } from '@/lib/streak-system';
import { useColors } from '@/hooks/use-colors';

interface StreakCalendarProps {
  completedDates: string[];
  currentMonth?: number;
  currentYear?: number;
}

export function StreakCalendar({
  completedDates,
  currentMonth = new Date().getMonth() + 1,
  currentYear = new Date().getFullYear(),
}: StreakCalendarProps) {
  const colors = useColors();
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const calendarDays = generateCalendarMonth(year, month, completedDates);
  const monthName = new Date(year, month - 1).toLocaleString('ko-KR', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <View className="bg-surface rounded-2xl p-4 gap-4">
      {/* 월 네비게이션 */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={handlePrevMonth}
          className="p-2"
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text className="text-xl font-bold text-primary">‹</Text>
        </Pressable>

        <Text className="text-lg font-bold text-foreground">{monthName}</Text>

        <Pressable
          onPress={handleNextMonth}
          className="p-2"
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text className="text-xl font-bold text-primary">›</Text>
        </Pressable>
      </View>

      {/* 요일 헤더 */}
      <View className="flex-row justify-between mb-2">
        {dayLabels.map((day) => (
          <Text
            key={day}
            className="w-12 text-center text-xs font-semibold text-muted"
          >
            {day}
          </Text>
        ))}
      </View>

      {/* 캘린더 그리드 */}
      <View className="gap-2">
        {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map(
          (_, weekIndex) => {
            const weekDays = calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7);
            return (
              <View key={weekIndex} className="flex-row justify-between gap-1">
                {weekDays.map((day) => (
                  <CalendarDayCell key={day.date} day={day} colors={colors} />
                ))}
              </View>
            );
          }
        )}
      </View>

      {/* 범례 */}
      <View className="flex-row items-center gap-4 mt-4 pt-4 border-t border-border">
        <View className="flex-row items-center gap-2">
          <View
            className="w-8 h-8 rounded-lg items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-lg">🔥</Text>
          </View>
          <Text className="text-xs text-muted">학습 완료</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-border items-center justify-center">
            <Text className="text-lg">📅</Text>
          </View>
          <Text className="text-xs text-muted">미완료</Text>
        </View>
      </View>
    </View>
  );
}

interface CalendarDayCellProps {
  day: CalendarDay;
  colors: any;
}

function CalendarDayCell({ day, colors }: CalendarDayCellProps) {
  const dayNum = parseInt(day.date.split('-')[2]);
  const isCurrentMonth =
    dayNum > 0 && dayNum < 32 && !day.date.includes('NaN');

  // 이전/다음 달 날짜는 투명하게 표시
  if (!isCurrentMonth && dayNum === 1) {
    return <View className="w-12 h-12" />;
  }

  return (
    <View
      className="w-12 h-12 rounded-lg items-center justify-center"
      style={[
        day.completed && { backgroundColor: colors.primary },
        !day.completed && { backgroundColor: colors.border },
      ]}
    >
      {day.completed ? (
        <Text className="text-lg">🔥</Text>
      ) : (
        <Text className="text-sm font-semibold text-muted">{dayNum}</Text>
      )}
    </View>
  );
}
