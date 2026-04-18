import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { loginAsAdmin } from '@/lib/admin-auth';

interface AdminLoginModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export function AdminLoginModal({ visible, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const success = await loginAsAdmin(password);

      if (success) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setPassword('');
        onLoginSuccess?.();
        onClose();
      } else {
        setError('비밀번호가 올바르지 않습니다.');
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 24,
            width: '85%',
            maxWidth: 320,
          }}
        >
          <Text className="text-2xl font-bold text-foreground mb-2">⚙️ 관리자 로그인</Text>
          <Text className="text-sm text-muted mb-6">관리자 비밀번호를 입력하세요</Text>

          <TextInput
            placeholder="비밀번호"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            className="border border-border rounded-[12px] px-4 py-3 text-foreground mb-4"
            style={{ color: '#11181C' }}
          />

          {error && (
            <View className="rounded-[12px] bg-red-50 border border-red-300 p-3 mb-4">
              <Text className="text-sm text-red-700">{error}</Text>
            </View>
          )}

          <View className="flex-row gap-3">
            <Pressable
              onPress={handleClose}
              disabled={isLoading}
              style={({ pressed }) => [
                {
                  flex: 1,
                  backgroundColor: '#f0f0f0',
                  paddingVertical: 12,
                  borderRadius: 12,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text className="text-center font-bold text-foreground">취소</Text>
            </Pressable>

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                {
                  flex: 1,
                  backgroundColor: isLoading ? '#ccc' : '#2F7B56',
                  paddingVertical: 12,
                  borderRadius: 12,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text className="text-center font-bold text-white">
                {isLoading ? '로그인 중...' : '로그인'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
