import { lessons, learningStages } from './lib/finstudy-data';

console.log('=== 기사의 모든 용어 ===\n');

lessons.forEach(lesson => {
  console.log(`${lesson.title}:`);
  console.log(`  ${lesson.terms.join(', ')}`);
});

console.log('\n=== 학습 단계의 모든 용어 ===\n');

learningStages.forEach(stage => {
  console.log(`${stage.title}:`);
  console.log(`  ${stage.terms.join(', ')}`);
});
