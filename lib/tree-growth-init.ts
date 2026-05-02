/**
 * 나무 성장 시스템 초기화 및 더미 데이터 생성
 * 
 * 앱 시작 시 한 번 실행되어 나무 성장 데이터를 초기화합니다.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeTreeGrowth, createDummyTreeData } from './tree-growth-system';

const TREE_INIT_FLAG = 'finstudy-tree-initialized-v1';

/**
 * 나무 성장 시스템 초기화
 * 첫 실행 시 더미 데이터를 생성하고, 이후 실행 시에는 기존 데이터를 유지합니다.
 */
export async function initializeTreeGrowthSystem(useDummyData: boolean = true): Promise<void> {
  try {
    const isInitialized = await AsyncStorage.getItem(TREE_INIT_FLAG);
    
    if (!isInitialized) {
      // 첫 초기화
      if (useDummyData) {
        // 더미 데이터로 초기화 (개발/테스트용)
        await createDummyTreeData();
        console.log('🌱 나무 성장 시스템 초기화 완료 (더미 데이터)');
      } else {
        // 빈 데이터로 초기화 (프로덕션)
        await initializeTreeGrowth();
        console.log('🌱 나무 성장 시스템 초기화 완료 (빈 데이터)');
      }
      
      // 초기화 플래그 설정
      await AsyncStorage.setItem(TREE_INIT_FLAG, 'true');
    }
  } catch (error) {
    console.error('나무 성장 시스템 초기화 실패:', error);
  }
}

/**
 * 나무 성장 시스템 리셋 (테스트용)
 */
export async function resetTreeGrowthSystem(): Promise<void> {
  try {
    await AsyncStorage.removeItem('finstudy-tree-growth-v1');
    await AsyncStorage.removeItem(TREE_INIT_FLAG);
    console.log('🌱 나무 성장 시스템 리셋 완료');
  } catch (error) {
    console.error('나무 성장 시스템 리셋 실패:', error);
  }
}
