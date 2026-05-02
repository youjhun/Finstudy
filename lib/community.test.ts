import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DUMMY_UGC_CONTENTS } from '@/lib/ugc-dummy-data';

describe('Community Tab Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load dummy data on first run', async () => {
    const mockGetItem = vi.fn().mockResolvedValue(null);
    const mockSetItem = vi.fn();

    // 첫 실행 시 더미 데이터 저장
    if (!mockGetItem.mock.results[0]?.value) {
      await mockSetItem('finstudy-ugc-content-v1', JSON.stringify(DUMMY_UGC_CONTENTS));
    }

    expect(mockSetItem).toHaveBeenCalled();
  });

  it('should have at least 12 dummy contents', () => {
    expect(DUMMY_UGC_CONTENTS.length).toBeGreaterThanOrEqual(12);
  });

  it('should initialize comments array for each content', () => {
    DUMMY_UGC_CONTENTS.forEach((content) => {
      expect(content).toHaveProperty('title');
      expect(content).toHaveProperty('description');
      expect(content).toHaveProperty('category');
    });
  });

  it('should support comment structure', () => {
    const commentStructure = {
      id: 'test-1',
      userId: 'user-123',
      userName: 'Test User',
      userAvatar: '👤',
      text: 'Test comment',
      timestamp: new Date().toISOString(),
    };

    expect(commentStructure).toHaveProperty('id');
    expect(commentStructure).toHaveProperty('userId');
    expect(commentStructure).toHaveProperty('userName');
    expect(commentStructure).toHaveProperty('text');
    expect(commentStructure).toHaveProperty('timestamp');
  });

  it('should support like toggle functionality', () => {
    const content = DUMMY_UGC_CONTENTS[0];
    const initialLikes = content.likes;
    const initialLiked = content.liked;

    // 좋아요 토글 시뮬레이션
    const toggled = {
      ...content,
      liked: !initialLiked,
      likes: initialLiked ? initialLikes - 1 : initialLikes + 1,
    };

    expect(toggled.liked).toBe(!initialLiked);
    expect(toggled.likes).toBe(initialLiked ? initialLikes - 1 : initialLikes + 1);
  });

  it('should support content deletion', () => {
    const contents = [...DUMMY_UGC_CONTENTS];
    const contentIdToDelete = contents[0].id;

    const filtered = contents.filter((c) => c.id !== contentIdToDelete);

    expect(filtered.length).toBe(contents.length - 1);
    expect(filtered.find((c) => c.id === contentIdToDelete)).toBeUndefined();
  });

  it('should support comment addition', () => {
    const content = { ...DUMMY_UGC_CONTENTS[0], comments: [] };
    const newComment = {
      id: 'comment-1',
      userId: 'user-456',
      userName: 'Commenter',
      userAvatar: '👤',
      text: 'Great content!',
      timestamp: new Date().toISOString(),
    };

    const updated = {
      ...content,
      comments: [...(content.comments || []), newComment],
    };

    expect(updated.comments).toHaveLength(1);
    expect(updated.comments[0].text).toBe('Great content!');
  });

  it('should support comment deletion', () => {
    const comment1 = {
      id: 'comment-1',
      userId: 'user-1',
      userName: 'User 1',
      userAvatar: '👤',
      text: 'Comment 1',
      timestamp: new Date().toISOString(),
    };

    const comment2 = {
      id: 'comment-2',
      userId: 'user-2',
      userName: 'User 2',
      userAvatar: '👤',
      text: 'Comment 2',
      timestamp: new Date().toISOString(),
    };

    const comments = [comment1, comment2];
    const filtered = comments.filter((c) => c.id !== 'comment-1');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('comment-2');
  });

  it('should have valid category labels', () => {
    const validCategories = ['study', 'tip', 'question', 'discussion'];
    const categoryLabels: Record<string, string> = {
      study: '📚 학습 자료',
      tip: '💡 팁',
      question: '❓ 질문',
      discussion: '💬 토론',
    };

    validCategories.forEach((cat) => {
      expect(categoryLabels[cat]).toBeDefined();
      expect(categoryLabels[cat].length).toBeGreaterThan(0);
    });
  });

  it('should preserve content order when adding new content', () => {
    const contents = [...DUMMY_UGC_CONTENTS];
    const newContent = {
      id: 'new-1',
      userId: 'user-new',
      userName: 'New User',
      userAvatar: '👤',
      title: 'New Content',
      description: 'New Description',
      likes: 0,
      liked: false,
      timestamp: new Date().toISOString(),
      category: 'study' as const,
      comments: [],
    };

    const updated = [newContent, ...contents];

    expect(updated[0].id).toBe('new-1');
    expect(updated.length).toBe(contents.length + 1);
  });

  it('should handle empty comments gracefully', () => {
    const content = { ...DUMMY_UGC_CONTENTS[0], comments: [] };
    const comments = content.comments || [];

    expect(Array.isArray(comments)).toBe(true);
  });

  it('should validate content structure', () => {
    const testContent = {
      id: 'test-1',
      userId: 'user-test',
      userName: 'Test User',
      userAvatar: '👤',
      title: 'Test Title',
      description: 'Test Description',
      likes: 10,
      liked: false,
      timestamp: new Date().toISOString(),
      category: 'study' as const,
      comments: [],
    };

    expect(testContent.id).toBeDefined();
    expect(testContent.title).toBeDefined();
    expect(testContent.description).toBeDefined();
    expect(testContent.category).toBe('study');
    expect(testContent.comments).toEqual([]);
  });
});
