import { lessons, learningStages } from './lib/finstudy-data';
import { economicTermsDatabase } from './lib/economic-terms';

const allTerms = new Set<string>();

lessons.forEach(lesson => {
  lesson.terms.forEach(term => allTerms.add(term));
});

learningStages.forEach(stage => {
  stage.terms.forEach(term => allTerms.add(term));
});

console.log('=== 최종 용어 검증 ===\n');

const notFound: string[] = [];
const found: string[] = [];

allTerms.forEach(term => {
  const exists = economicTermsDatabase.find(t => t.term === term);
  if (exists) {
    found.push(term);
  } else {
    notFound.push(term);
  }
});

console.log(`✅ 경제용어사전에 존재: ${found.length}개`);
found.forEach(t => console.log(`  ✓ ${t}`));

if (notFound.length > 0) {
  console.log(`\n❌ 미존재: ${notFound.length}개`);
  notFound.forEach(t => console.log(`  ✗ ${t}`));
} else {
  console.log(`\n🎉 모든 용어가 경제용어사전과 매칭됨!`);
}
