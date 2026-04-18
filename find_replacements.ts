import { economicTermsDatabase } from './lib/economic-terms';

const problematicTerms = [
  '고용',
  '실질임금',
  '소비',
  '차별화',
  '밸류에이션',
  '채권금리',
  '가설',
  '리스크',
  '시나리오',
];

console.log('=== 문제 용어 대체 제안 ===\n');

problematicTerms.forEach(term => {
  // 정확 매칭 확인
  const exact = economicTermsDatabase.find(t => t.term === term);
  
  if (exact) {
    console.log(`✅ "${term}" - 존재함`);
    return;
  }
  
  // 유사 용어 찾기
  const similar = economicTermsDatabase.filter(t => {
    const words = t.term.split(' ');
    return words.some(w => w.includes(term) || term.includes(w));
  }).slice(0, 5);
  
  console.log(`❌ "${term}" - 미존재`);
  if (similar.length > 0) {
    console.log(`   대체 제안:`);
    similar.forEach(t => console.log(`   - ${t.term}`));
  } else {
    console.log(`   (유사 용어 없음)`);
  }
  console.log();
});
