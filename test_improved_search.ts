import { searchTerm } from './lib/economic-terms';

const testCases = [
  { query: '실적', expected: '실적' },
  { query: '원가', expected: '원가' },
  { query: '수출', expected: '수출' },
  { query: '기준금리', expected: '기준금리' },
  { query: '인플레이션', expected: '인플레이션' },
];

console.log('=== 개선된 searchTerm 함수 테스트 ===\n');

let passed = 0;
let failed = 0;

testCases.forEach(({ query, expected }) => {
  const result = searchTerm(query);
  const status = result?.term === expected ? '✅' : '❌';
  
  if (result?.term === expected) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${status} "${query}" → "${result?.term || '없음'}" (기대: "${expected}")`);
});

console.log(`\n결과: ${passed}/${testCases.length} 통과`);
