import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveArticle,
  unsaveArticle,
  isArticleSaved,
  getSavedArticles,
  getSavedArticlesByCategory,
  clearSavedArticles,
} from './article-storage';

vi.mock('@react-native-async-storage/async-storage');

describe('기사 저장 시스템', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    (AsyncStorage.setItem as any).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as any).mockResolvedValue(undefined);
  });

  afterEach(async () => {
    vi.clearAllMocks();
  });

  it('기사를 저장할 수 있어야 함', async () => {
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    
    await saveArticle('article-1', '금리 인상의 영향', '거시경제');
    
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'finstudy-saved-articles-v1',
      expect.stringContaining('article-1')
    );
  });

  it('기사를 저장 해제할 수 있어야 함', async () => {
    const existingData = JSON.stringify([
      { id: 'article-1', title: '금리 인상', category: '거시경제', savedAt: Date.now() }
    ]);
    (AsyncStorage.getItem as any).mockResolvedValue(existingData);
    
    await unsaveArticle('article-1');
    
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'finstudy-saved-articles-v1',
      JSON.stringify([])
    );
  });

  it('기사 저장 상태를 확인할 수 있어야 함', async () => {
    const existingData = JSON.stringify([
      { id: 'article-1', title: '금리 인상', category: '거시경제', savedAt: Date.now() }
    ]);
    (AsyncStorage.getItem as any).mockResolvedValue(existingData);
    
    const isSaved = await isArticleSaved('article-1');
    
    expect(isSaved).toBe(true);
  });

  it('저장되지 않은 기사는 false를 반환해야 함', async () => {
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    
    const isSaved = await isArticleSaved('article-1');
    
    expect(isSaved).toBe(false);
  });

  it('모든 저장된 기사를 조회할 수 있어야 함', async () => {
    const existingData = JSON.stringify([
      { id: 'article-1', title: '금리 인상', category: '거시경제', savedAt: 100 },
      { id: 'article-2', title: '환율 변동', category: '금융', savedAt: 200 }
    ]);
    (AsyncStorage.getItem as any).mockResolvedValue(existingData);
    
    const saved = await getSavedArticles();
    
    expect(saved).toHaveLength(2);
    expect(saved[0].id).toBe('article-2'); // 최신순
  });

  it('카테고리별 저장된 기사를 조회할 수 있어야 함', async () => {
    const existingData = JSON.stringify([
      { id: 'article-1', title: '금리 인상', category: '거시경제', savedAt: 100 },
      { id: 'article-2', title: '환율 변동', category: '금융', savedAt: 200 }
    ]);
    (AsyncStorage.getItem as any).mockResolvedValue(existingData);
    
    const saved = await getSavedArticlesByCategory('금융');
    
    expect(saved).toHaveLength(1);
    expect(saved[0].category).toBe('금융');
  });

  it('저장된 기사를 초기화할 수 있어야 함', async () => {
    await clearSavedArticles();
    
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('finstudy-saved-articles-v1');
  });

  it('중복된 기사 저장을 방지해야 함', async () => {
    const existingData = JSON.stringify([
      { id: 'article-1', title: '금리 인상', category: '거시경제', savedAt: 100 }
    ]);
    (AsyncStorage.getItem as any).mockResolvedValue(existingData);
    
    await saveArticle('article-1', '금리 인상 (수정)', '거시경제');
    
    const savedData = (AsyncStorage.setItem as any).mock.calls[0][1];
    const parsed = JSON.parse(savedData);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('금리 인상 (수정)');
  });

  it('저장된 기사가 없을 때 빈 배열을 반환해야 함', async () => {
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    
    const saved = await getSavedArticles();
    
    expect(saved).toEqual([]);
  });
});
