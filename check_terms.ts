import { searchTerm, economicTermsDatabase } from './lib/economic-terms';

const testTerms = [
  '기준금리',
  '인플레이션',
  '실적',
  '환율',
  '헤지',
  '원가',
  '수출주',
];

console.log('=== 용어 검증 결과 ===\n');

testTerms.forEach(term => {
  const found = searchTerm(term);
  const status = found ? '✅ 존재' : '❌ 없음';
  console.log(`${status}: "${term}"`);
  if (found) {
    console.log(`   정의: ${found.definition.substring(0, 50)}...`);
  }
});

console.log('\n=== 경제용어사전 통계 ===');
console.log(`총 용어 수: ${economicTermsDatabase.length}`);

// 카테고리별 용어 수
const categories = new Map<string, number>();
economicTermsDatabase.forEach(term => {
  categories.set(term.category, (categories.get(term.category) || 0) + 1);
});
console.log('\n카테고리별 용어 수:');
Array.from(categories.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}개`);
  });
