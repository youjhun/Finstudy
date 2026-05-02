import { economicTermsDatabase } from './lib/economic-terms';

// 문제가 되는 용어들 분석
const problematicTerms = ['실적', '원가', '수출'];

console.log('=== 부분 매칭 문제 분석 ===\n');

problematicTerms.forEach(term => {
  console.log(`\n"${term}" 검색 결과:`);
  
  // 정확 매칭
  const exactMatch = economicTermsDatabase.find(t => t.term === term);
  console.log(`  정확 매칭: ${exactMatch ? exactMatch.term : '없음'}`);
  
  // 부분 매칭 (포함)
  const partialMatches = economicTermsDatabase.filter(t => 
    t.term.includes(term) && t.term !== term
  );
  
  if (partialMatches.length > 0) {
    console.log(`  부분 매칭 (${partialMatches.length}개):`);
    partialMatches.slice(0, 5).forEach(m => {
      console.log(`    - ${m.term}`);
    });
  }
});

// searchTerm 함수 로직 재현
console.log('\n\n=== searchTerm 함수 로직 ===\n');

function debugSearchTerm(query: string) {
  console.log(`\n검색: "${query}"`);
  
  // 정확 매칭
  const exactMatch = economicTermsDatabase.find(t => t.term === query);
  if (exactMatch) {
    console.log(`  → 정확 매칭 성공: "${exactMatch.term}"`);
    return exactMatch;
  }
  
  // 부분 매칭
  const partialMatches = economicTermsDatabase.filter(t => 
    t.term.includes(query)
  );
  
  if (partialMatches.length > 0) {
    console.log(`  → 부분 매칭 (${partialMatches.length}개):`);
    partialMatches.slice(0, 3).forEach(m => {
      console.log(`     - ${m.term}`);
    });
    console.log(`  → 첫 번째 반환: "${partialMatches[0].term}"`);
    return partialMatches[0];
  }
  
  console.log(`  → 매칭 없음`);
  return undefined;
}

debugSearchTerm('실적');
debugSearchTerm('원가');
debugSearchTerm('수출');
