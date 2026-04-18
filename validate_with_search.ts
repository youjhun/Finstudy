import { lessons, learningStages } from './lib/finstudy-data';
import { searchTerm } from './lib/economic-terms';

const allTerms = new Set<string>();

lessons.forEach(lesson => {
  lesson.terms.forEach(term => allTerms.add(term));
});

learningStages.forEach(stage => {
  stage.terms.forEach(term => allTerms.add(term));
});

console.log('=== searchTerm 함수로 용어 검증 ===\n');

const notFound: string[] = [];
const found: string[] = [];

allTerms.forEach(term => {
  const result = searchTerm(term);
  if (result) {
    found.push(`${term} → ${result.term}`);
  } else {
    notFound.push(term);
  }
});

console.log(`✅ 검색 성공: ${found.length}개`);
found.forEach(t => console.log(`  ✓ ${t}`));

if (notFound.length > 0) {
  console.log(`\n❌ 검색 실패: ${notFound.length}개`);
  notFound.forEach(t => console.log(`  ✗ ${t}`));
} else {
  console.log(`\n🎉 모든 용어가 searchTerm으로 검색됨!`);
}
