import { describe, it, expect } from 'vitest';
import { DUMMY_UGC_CONTENTS } from './ugc-dummy-data';

describe('UGC Dummy Data', () => {
  it('should have at least 10 dummy contents', () => {
    expect(DUMMY_UGC_CONTENTS.length).toBeGreaterThanOrEqual(10);
  });

  it('should have all required fields in each content', () => {
    DUMMY_UGC_CONTENTS.forEach((content) => {
      expect(content).toHaveProperty('id');
      expect(content).toHaveProperty('userId');
      expect(content).toHaveProperty('userName');
      expect(content).toHaveProperty('title');
      expect(content).toHaveProperty('description');
      expect(content).toHaveProperty('likes');
      expect(content).toHaveProperty('liked');
      expect(content).toHaveProperty('timestamp');
      expect(content).toHaveProperty('category');
    });
  });

  it('should have valid category values', () => {
    const validCategories = ['study', 'tip', 'question', 'discussion'];
    DUMMY_UGC_CONTENTS.forEach((content) => {
      expect(validCategories).toContain(content.category);
    });
  });

  it('should have non-empty titles and descriptions', () => {
    DUMMY_UGC_CONTENTS.forEach((content) => {
      expect(content.title.trim().length).toBeGreaterThan(0);
      expect(content.description.trim().length).toBeGreaterThan(0);
    });
  });

  it('should have valid likes count', () => {
    DUMMY_UGC_CONTENTS.forEach((content) => {
      expect(content.likes).toBeGreaterThanOrEqual(0);
      expect(typeof content.likes).toBe('number');
    });
  });

  it('should have valid timestamps', () => {
    DUMMY_UGC_CONTENTS.forEach((content) => {
      const timestamp = new Date(content.timestamp);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });

  it('should have diverse categories', () => {
    const categories = new Set(DUMMY_UGC_CONTENTS.map((c) => c.category));
    expect(categories.size).toBeGreaterThan(1);
  });

  it('should have unique IDs', () => {
    const ids = DUMMY_UGC_CONTENTS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have user avatars for each content', () => {
    DUMMY_UGC_CONTENTS.forEach((content) => {
      expect(content.userAvatar).toBeDefined();
      expect(content.userAvatar?.length).toBeGreaterThan(0);
    });
  });

  it('should have liked property as boolean', () => {
    DUMMY_UGC_CONTENTS.forEach((content) => {
      expect(typeof content.liked).toBe('boolean');
    });
  });
});
