import { searchTerm, economicTermsDatabase } from './lib/economic-terms';

const searchKeywords = ['산업', '구조', '업종', '분야'];

console.log('=== "산업구조" 대체 용어 찾기 ===\n');

searchKeywords.forEach(keyword => {
  const matches = economicTermsDatabase.filter(term => 
    term.term.includes(keyword)
  ).slice(0, 5);
  
  console.log(`"${keyword}" 포함 용어:`);
  matches.forEach(term => {
    console.log(`  - ${term.term}`);
  });
  console.log();
});
