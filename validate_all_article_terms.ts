import { lessons, learningStages } from './lib/finstudy-data';
import { economicTermsDatabase } from './lib/economic-terms';

const allTerms = new Set<string>();

// 기사의 모든 용어 수집
lessons.forEach(lesson => {
  lesson.terms.forEach(term => allTerms.add(term));
});

// 학습 단계의 모든 용어 수집
learningStages.forEach(stage => {
  stage.terms.forEach(term => allTerms.add(term));
});

console.log('=== 기사 및 학습 단계 용어 검증 ===\n');

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

console.log(`✅ 존재: ${found.length}개`);
found.forEach(t => console.log(`  - ${t}`));

console.log(`\n❌ 미존재: ${notFound.length}개`);
notFound.forEach(t => console.log(`  - ${t}`));

// 대체 용어 제안
console.log(`\n=== 대체 용어 제안 ===\n`);

notFound.forEach(term => {
  const similar = economicTermsDatabase.filter(t => 
    t.term.includes(term) || term.split(' ').some(word => t.term.includes(word))
  ).slice(0, 3);
  
  console.log(`"${term}" 대체 제안:`);
  if (similar.length > 0) {
    similar.forEach(t => console.log(`  - ${t.term}`));
  } else {
    console.log(`  (유사 용어 없음)`);
  }
});
