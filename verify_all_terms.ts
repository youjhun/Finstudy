import { searchTerm } from './lib/economic-terms';
import { lessons, learningStages } from './lib/finstudy-data';

console.log('=== 기사 용어 검증 ===\n');

lessons.forEach(lesson => {
  console.log(`📰 ${lesson.title}`);
  console.log(`   용어: ${lesson.terms.join(', ')}`);
  
  const missingTerms: string[] = [];
  lesson.terms.forEach(term => {
    if (!searchTerm(term)) {
      missingTerms.push(term);
    }
  });
  
  if (missingTerms.length > 0) {
    console.log(`   ❌ 없는 용어: ${missingTerms.join(', ')}`);
  } else {
    console.log(`   ✅ 모든 용어 존재`);
  }
  console.log();
});

console.log('\n=== 학습 단계 용어 검증 ===\n');

learningStages.forEach(stage => {
  console.log(`📚 ${stage.title}`);
  console.log(`   용어: ${stage.terms.join(', ')}`);
  
  const missingTerms: string[] = [];
  stage.terms.forEach(term => {
    if (!searchTerm(term)) {
      missingTerms.push(term);
    }
  });
  
  if (missingTerms.length > 0) {
    console.log(`   ❌ 없는 용어: ${missingTerms.join(', ')}`);
  } else {
    console.log(`   ✅ 모든 용어 존재`);
  }
  console.log();
});
