import { searchTerm, economicTermsDatabase } from './lib/economic-terms';

const testTerms = [
  { term: '실적', expected: '실적' },
  { term: '원가', expected: '원가' },
  { term: '수출', expected: '수출' },
];

console.log('=== 경제 용어 매칭 분석 ===\n');

testTerms.forEach(({ term, expected }) => {
  const result = searchTerm(term);
  
  console.log(`검색어: "${term}"`);
  console.log(`기대값: "${expected}"`);
  
  if (result) {
    console.log(`결과: "${result.term}"`);
    console.log(`정의: ${result.definition.substring(0, 60)}...`);
    console.log(`일치: ${result.term === expected ? '✅' : '❌'}`);
  } else {
    console.log(`결과: 없음`);
  }
  console.log();
});

// 부분 매칭 문제 찾기
console.log('\n=== 부분 매칭 문제 찾기 ===\n');

const problematicTerms = ['실적', '원가', '수출'];

problematicTerms.forEach(term => {
  const matches = economicTermsDatabase.filter(t => 
    t.term.includes(term) && t.term !== term
  );
  
  if (matches.length > 0) {
    console.log(`"${term}"을(를) 포함하는 다른 용어들:`);
    matches.slice(0, 5).forEach(m => {
      console.log(`  - ${m.term}`);
    });
    console.log();
  }
});
