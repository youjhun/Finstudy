import { economicTermsDatabase } from './lib/economic-terms';

const searchTerms = ['실적', '원가', '수출', '인플레이션'];

searchTerms.forEach(term => {
  const exact = economicTermsDatabase.find(t => t.term === term);
  const withSpace = economicTermsDatabase.filter(t => 
    t.term.split(' ').some(w => w === term)
  );
  
  console.log(`\n"${term}":`);
  console.log(`  정확 매칭: ${exact ? '✅ ' + exact.term : '❌ 없음'}`);
  console.log(`  공백 기준: ${withSpace.length}개`);
  if (withSpace.length > 0) {
    withSpace.slice(0, 3).forEach(t => {
      console.log(`    - ${t.term}`);
    });
  }
});
