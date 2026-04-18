import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { isAdmin } from '@/lib/admin-auth';

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'web' ? 12 : Math.max(insets.bottom, 10);
  const tabBarHeight = 62 + bottomPadding;
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    void checkAdminStatus();
  }, []);

  async function checkAdminStatus() {
    const adminStatus = await isAdmin();
    setIsAdminUser(adminStatus);
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          paddingTop: 10,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '오늘',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="newspaper.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: '학습',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "성장",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: '커뮤니티',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
        }}
      />
      {isAdminUser && (
        <Tabs.Screen
          name="admin"
          options={{
            title: "관리",
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="gearshape.fill" color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}
