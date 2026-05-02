import { describe, it, expect } from 'vitest';
import { searchTerm, getTermsByCategory, getAllCategories, getAllTerms, economicTermsDatabase } from '@/lib/economic-terms';

describe('경제 용어 데이터베이스', () => {
  it('총 3031개의 용어가 로드되어야 함', () => {
    expect(economicTermsDatabase.length).toBe(3031);
  });

  it('각 용어는 필수 필드를 가져야 함', () => {
    economicTermsDatabase.forEach(term => {
      expect(term.id).toBeDefined();
      expect(term.term).toBeDefined();
      expect(term.definition).toBeDefined();
      expect(term.category).toBeDefined();
      expect(term.source).toBe('재정경제부_시사경제용어 정보');
    });
  });

  it('첫 번째 용어가 올바르게 로드되어야 함', () => {
    const firstTerm = economicTermsDatabase[0];
    expect(firstTerm.term).toBe('0.5인 가구');
    expect(firstTerm.category).toBe('사회');
    expect(firstTerm.source).toBe('재정경제부_시사경제용어 정보');
  });

  it('마지막 용어가 올바르게 로드되어야 함', () => {
    const lastTerm = economicTermsDatabase[3030];
    expect(lastTerm.term).toBe('히든챔피언 육성 프로그램');
    expect(lastTerm.category).toBe('공공');
  });

  it('searchTerm 함수로 정확한 용어를 찾을 수 있어야 함', () => {
    const term = searchTerm('0.5인 가구');
    expect(term).toBeDefined();
    expect(term?.term).toBe('0.5인 가구');
    expect(term?.category).toBe('사회');
  });

  it('searchTerm 함수로 부분 매칭이 작동해야 함', () => {
    const term = searchTerm('인 가구');
    expect(term).toBeDefined();
    expect(term?.term).toContain('인 가구');
  });

  it('존재하지 않는 용어는 undefined를 반환해야 함', () => {
    const term = searchTerm('존재하지않는용어');
    expect(term).toBeUndefined();
  });

  it('getAllCategories 함수가 모든 카테고리를 반환해야 함', () => {
    const categories = getAllCategories();
    expect(categories).toContain('금융');
    expect(categories).toContain('경제');
    expect(categories).toContain('경영');
    expect(categories).toContain('공공');
    expect(categories).toContain('과학');
    expect(categories).toContain('사회');
  });

  it('getTermsByCategory 함수로 카테고리별 용어를 필터링할 수 있어야 함', () => {
    const financeTerms = getTermsByCategory('금융');
    expect(financeTerms.length).toBeGreaterThan(0);
    financeTerms.forEach(term => {
      expect(term.category).toBe('금융');
    });
  });

  it('getAllTerms 함수가 모든 용어를 반환해야 함', () => {
    const allTerms = getAllTerms();
    expect(allTerms.length).toBe(3031);
  });

  it('출처가 모든 용어에 일관되게 표시되어야 함', () => {
    const randomTerms = economicTermsDatabase.slice(0, 100);
    randomTerms.forEach(term => {
      expect(term.source).toBe('재정경제부_시사경제용어 정보');
    });
  });

  it('용어 정의가 비어있지 않아야 함', () => {
    economicTermsDatabase.forEach(term => {
      expect(term.definition.length).toBeGreaterThan(0);
    });
  });
});
