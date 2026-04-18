import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_ARTICLES_KEY = 'finstudy-saved-articles-v1';

export interface SavedArticle {
  id: string;
  title: string;
  category: string;
  savedAt: number;
}

/**
 * 기사를 저장된 목록에 추가
 */
export async function saveArticle(articleId: string, title: string, category: string): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(SAVED_ARTICLES_KEY);
    const saved: SavedArticle[] = existing ? JSON.parse(existing) : [];
    
    // 중복 제거
    const filtered = saved.filter(a => a.id !== articleId);
    
    const updated = [
      ...filtered,
      {
        id: articleId,
        title,
        category,
        savedAt: Date.now(),
      }
    ];
    
    await AsyncStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('기사 저장 실패:', error);
    throw error;
  }
}

/**
 * 기사를 저장된 목록에서 제거
 */
export async function unsaveArticle(articleId: string): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(SAVED_ARTICLES_KEY);
    if (!existing) return;
    
    const saved: SavedArticle[] = JSON.parse(existing);
    const updated = saved.filter(a => a.id !== articleId);
    
    await AsyncStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('기사 저장 해제 실패:', error);
    throw error;
  }
}

/**
 * 기사가 저장되었는지 확인
 */
export async function isArticleSaved(articleId: string): Promise<boolean> {
  try {
    const existing = await AsyncStorage.getItem(SAVED_ARTICLES_KEY);
    if (!existing) return false;
    
    const saved: SavedArticle[] = JSON.parse(existing);
    return saved.some(a => a.id === articleId);
  } catch (error) {
    console.error('기사 저장 상태 확인 실패:', error);
    return false;
  }
}

/**
 * 저장된 모든 기사 조회
 */
export async function getSavedArticles(): Promise<SavedArticle[]> {
  try {
    const existing = await AsyncStorage.getItem(SAVED_ARTICLES_KEY);
    if (!existing) return [];
    
    const saved: SavedArticle[] = JSON.parse(existing);
    return saved.sort((a, b) => b.savedAt - a.savedAt);
  } catch (error) {
    console.error('저장된 기사 조회 실패:', error);
    return [];
  }
}

/**
 * 카테고리별 저장된 기사 조회
 */
export async function getSavedArticlesByCategory(category: string): Promise<SavedArticle[]> {
  try {
    const saved = await getSavedArticles();
    return saved.filter(a => a.category === category);
  } catch (error) {
    console.error('카테고리별 저장된 기사 조회 실패:', error);
    return [];
  }
}

/**
 * 저장된 기사 초기화
 */
export async function clearSavedArticles(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVED_ARTICLES_KEY);
  } catch (error) {
    console.error('저장된 기사 초기화 실패:', error);
    throw error;
  }
}
